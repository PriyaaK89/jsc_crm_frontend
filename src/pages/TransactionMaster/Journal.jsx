import React, { useEffect, useState } from "react";
import {
    Box, Text, Grid, GridItem, FormControl, FormLabel, Input,
    Select, Textarea, Table, Thead, Tbody, Tr, Th, Td, Button,
    Flex, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, Spinner,
    useToast, HStack,
} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import useUsersapi from "../../Apis/GetUsersapi";

// ─── helpers ────────────────────────────────────────────────────────────────

const emptyEntry = (type = "Dr") => ({
    entry_type: type,       // "Dr" | "Cr"
    ledger_id: "",
    current_balance: "",
    balance_type: "Dr",
    debit: "",
    credit: "",
    remarks: "",
    bill_references: [],
    maintain_bill_by_bill: 0,
});

const emptyForm = () => ({
    voucher_no: "",
    journal_date: new Date().toISOString().slice(0, 10),
    employee_under_id: "",
    narration: "",
    // Always exactly 2 rows: row 0 = Dr (visible), row 1 = Cr (hidden until row 0 debit filled)
    entries: [emptyEntry("Dr"), emptyEntry("Cr")],
});

// ─── component ───────────────────────────────────────────────────────────────

const Journal = () => {
    const { users } = useUsersapi();
    const toast = useToast();

    const [formData, setFormData] = useState(emptyForm());
    const [ledgerList, setLedgerList] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // row 1 (Cr) is only visible once row 0 debit has a value
    const [showSecondRow, setShowSecondRow] = useState(false);

    // ── Bill modal state ─────────────────────────────────────────────────────
    const [billModal, setBillModal] = useState(false);
    const [billLoading, setBillLoading] = useState(false);
    const [selectedEntryIndex, setSelectedEntryIndex] = useState(null);
    const [billReferenceData, setBillReferenceData] = useState([]);
    const [billReferenceOptions, setBillReferenceOptions] = useState([]);

    // ─── styles ───────────────────────────────────────────────────────────────

    const sectionStyle = {
        bg: "white",
        border: "1px solid #d0d7de",
        borderRadius: "6px",
        p: 0,
        mb: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    };

    const inputStyle = {
        size: "sm",
        borderRadius: "6px",
        borderColor: "#c8d0d8",
        bg: "white",
        fontSize: "12px",
        height: "40px",
        _focus: { borderColor: "#3d7a52", boxShadow: "0 0 0 1px #3d7a52" },
      };

    // ─── data loading ─────────────────────────────────────────────────────────

    const fetchLedgerDropdown = async () => {
        try {
            const res = await API.get(API_ENDPOINTS.GET_LEDGER_DROPDOWN);
            if (res.status === 200) setLedgerList(res.data.data);
        } catch (err) {
            console.error("Error fetching journal ledgers", err);
        }
    };

    const loadVoucherNo = async () => {
        try {
            const res = await API.get(
                `${API_ENDPOINTS.GET_NEXTVOUCHER_NO}?voucher_type=JOURNAL`
            );
            setFormData((prev) => ({ ...prev, voucher_no: res.data.voucher_no }));
        } catch (err) {
            toast({
                title: "Error fetching voucher number",
                description: err.response?.data?.message || err.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        fetchLedgerDropdown();
        loadVoucherNo();
    }, []);

    // ─── form handlers ────────────────────────────────────────────────────────

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Row 0 Debit onBlur — reveal row 1 if a value was entered.
     */
    const handleDebitBlur = () => {
        const debitVal = Number(formData.entries[0]?.debit || 0);
        if (debitVal > 0) {
            setShowSecondRow(true);
            // Pre-fill row 1 credit with the same amount
            setFormData((prev) => {
                const entries = [...prev.entries];
                entries[1] = { ...entries[1], credit: String(debitVal) };
                return { ...prev, entries };
            });
        }
    };

    /**
     * Ledger select handler.
     * For row 1 (Cr), if maintain_bill_by_bill === 1, open bill modal immediately.
     */
    const handleLedgerSelect = async (index, ledgerId) => {
        setFormData((prev) => {
            const entries = [...prev.entries];
            entries[index] = {
                ...entries[index],
                ledger_id: ledgerId,
                current_balance: "",
                balance_type: "Dr",
                bill_references: [],
                maintain_bill_by_bill: 0,
            };
            return { ...prev, entries };
        });

        if (!ledgerId) return;

        try {
            const res = await API.get(`${API_ENDPOINTS.get_ledger_by_id}/${ledgerId}`);
            if (res.status === 200) {
                const { current_balance, balance_type, maintain_bill_by_bill } = res.data.data;

                setFormData((prev) => {
                    const entries = [...prev.entries];
                    entries[index] = {
                        ...entries[index],
                        current_balance: Number(current_balance || 0).toFixed(2),
                        balance_type: balance_type || "Dr",
                        maintain_bill_by_bill: maintain_bill_by_bill ?? 0,
                    };
                    return { ...prev, entries };
                });

                // ── Open bill modal right after ledger select for row 1 (Cr) ──
                if (index === 1 && (maintain_bill_by_bill ?? 0) === 1) {
                    openBillModal(index, ledgerId);
                }
            }
        } catch (err) {
            console.error("Error fetching ledger details", err);
        }
    };

    const handleAmountChange = (index, field, value) => {
        setFormData((prev) => {
            const entries = [...prev.entries];
            entries[index] = {
                ...entries[index],
                [field]: value,
                // clear opposite side
                ...(field === "debit" ? { credit: "" } : { debit: "" }),
            };
            return { ...prev, entries };
        });
    };

    const handleEntryTypeChange = (index, value) => {
        setFormData((prev) => {
            const entries = [...prev.entries];
            entries[index] = {
                ...entries[index],
                entry_type: value,
                debit: "",
                credit: "",
            };
            return { ...prev, entries };
        });
    };

    // ─── derived totals ───────────────────────────────────────────────────────

    const totalDebit = formData.entries.reduce(
        (sum, e) => sum + Number(e.debit || 0), 0
    );
    const totalCredit = formData.entries.reduce(
        (sum, e) => sum + Number(e.credit || 0), 0
    );

    // ─── bill modal ───────────────────────────────────────────────────────────

    const openBillModal = async (index, ledgerId) => {
        setBillLoading(true);
        setSelectedEntryIndex(index);
        setBillModal(true);

        try {
            const res = await API.get(
                `${API_ENDPOINTS.GET_JOURNAL_BILL_REFERENCE}/${ledgerId}`
            );
            if (res.status === 200) {
                const serverBills = res.data.data;
                setBillReferenceOptions(serverBills);

                const savedRefs = formData.entries[index]?.bill_references ?? [];
                if (savedRefs.length > 0) {
                    setBillReferenceData(
                        savedRefs.map((ref) => ({
                            ...ref,
                            _pending_amount: serverBills.find(
                                (b) => b.reference_no === ref.reference_no
                            )?.pending_amount,
                        }))
                    );
                } else {
                    // Use the credit amount of row 1 (or debit for row 0)
                    const entryAmount = Number(
                        formData.entries[index]?.credit ||
                        formData.entries[index]?.debit || 0
                    );
                    setBillReferenceData([
                        {
                            reference_type: "AGAINST REF",
                            reference_no: "",
                            amount: entryAmount,
                            due_date: "",
                            entry_type: formData.entries[index]?.entry_type || "Cr",
                        },
                    ]);
                }
            }
        } catch (err) {
            console.error("Error fetching bill references", err);
            toast({
                title: "Error",
                description: "Failed to load bill references.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            setBillReferenceData([
                {
                    reference_type: "AGAINST REF",
                    reference_no: "",
                    amount: 0,
                    due_date: "",
                    entry_type: "Cr",
                },
            ]);
            setBillReferenceOptions([]);
        } finally {
            setBillLoading(false);
        }
    };

    const handleBillReferenceChange = (rowIndex, field, value) => {
        setBillReferenceData((prev) => {
            const updated = [...prev];
            updated[rowIndex] = { ...updated[rowIndex], [field]: value };
            if (
                field === "reference_type" &&
                (value === "ON ACCOUNT" || value === "ADVANCE")
            ) {
                updated[rowIndex].reference_no = "";
            }
            return updated;
        });
    };

    const addBillRow = () => {
        setBillReferenceData((prev) => [
            ...prev,
            {
                reference_type: "NEW REF",
                reference_no: "",
                amount: 0,
                due_date: "",
                entry_type: formData.entries[selectedEntryIndex]?.entry_type || "Cr",
            },
        ]);
    };

    const removeBillRow = (rowIndex) => {
        setBillReferenceData((prev) => prev.filter((_, i) => i !== rowIndex));
    };

    const saveBillAllocation = () => {
        const cleaned = billReferenceData.map(
            // eslint-disable-next-line no-unused-vars
            ({ _pending_amount, ...rest }) => rest
        );
        setFormData((prev) => {
            const entries = [...prev.entries];
            entries[selectedEntryIndex] = {
                ...entries[selectedEntryIndex],
                bill_references: cleaned,
            };
            return { ...prev, entries };
        });
        setBillModal(false);
    };

    // ─── bill modal derived ───────────────────────────────────────────────────

    const billModalTotal = billReferenceData.reduce(
        (sum, b) => sum + Number(b.amount || 0), 0
    );
    const entryAmount =
        selectedEntryIndex !== null
            ? Number(
                formData.entries[selectedEntryIndex]?.credit ||
                formData.entries[selectedEntryIndex]?.debit || 0
            )
            : 0;
    const billDiff = entryAmount - billModalTotal;

    // ─── submission ───────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!formData.journal_date) {
            toast({ title: "Date is required", status: "warning", duration: 2500 });
            return;
        }

        const activeEntries = showSecondRow ? formData.entries : [formData.entries[0]];

        const hasIncomplete = activeEntries.some(
            (e) => !e.ledger_id || (!e.debit && !e.credit)
        );
        if (hasIncomplete) {
            toast({
                title: "Each entry must have a ledger and an amount",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        if (Number(totalDebit.toFixed(2)) !== Number(totalCredit.toFixed(2))) {
            toast({
                title: "Debit and Credit totals must be equal",
                status: "error",
                duration: 3000,
            });
            return;
        }

        const entries = activeEntries.map((e) => ({
            ledger_id: e.ledger_id,
            entry_type: e.entry_type,
            amount: Number(e.debit || e.credit || 0),
            remarks: e.remarks || "",
            bill_references: e.bill_references,
        }));

        try {
            setSubmitting(true);

            const payload = {
                journal_date: formData.journal_date,
                employee_under_id: formData.employee_under_id || "",
                narration: formData.narration || "",
                entries,
              };
              
              const res = await API.post(
                API_ENDPOINTS.CREATE_JOURNAL_ENTRY,
                payload
              );

            if (res.status === 201) {
                toast({
                    title: "Journal Created Successfully",
                    description: `Voucher No: ${res.data.voucher_no}`,
                    status: "success",
                    duration: 4000,
                    isClosable: true,
                });
                setFormData(emptyForm());
                setShowSecondRow(false);
                loadVoucherNo();
            }
        } catch (err) {
            console.error("JOURNAL SUBMIT ERROR:", err);
            toast({
                title: "Error",
                description: err.response?.data?.message || "Something went wrong",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setSubmitting(false);
        }
    };

    // ─── render ───────────────────────────────────────────────────────────────

    // Rows to render: always row 0, row 1 only when showSecondRow is true
    const visibleEntries = showSecondRow
        ? formData.entries
        : [formData.entries[0]];

    return (
        <Box  maxW="1100px">

                <Box p={4}>
                    <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={4}>
                        <GridItem>
                            <FormControl>
                                <FormLabel fontSize="13px" color="#494949" mb="3px">
                                    Journal No.
                                </FormLabel>
                                <Input
                                    {...inputStyle}
                                    value={formData.voucher_no || ""}
                                    readOnly
                                    bg="#f0f4f0"
                                    fontWeight="semibold"
                                />
                            </FormControl>
                        </GridItem>

                        {/* Date */}
                        <GridItem>
                            <FormControl isRequired>
                                <FormLabel fontSize="13px" color="#494949" mb="3px">
                                    Date <Text as="span" color="red.500">*</Text>
                                </FormLabel>
                                <Input
                                    {...inputStyle}
                                    type="date"
                                    name="journal_date"
                                    value={formData.journal_date}
                                    onChange={handleChange}
                                />
                            </FormControl>
                        </GridItem>

                        {/* Employee Under */}
                        <GridItem>
                            <FormControl>
                                <FormLabel fontSize="13px" color="#494949" mb="3px">
                                    Employee Under
                                </FormLabel>
                                <Select
                                    {...inputStyle}
                                    name="employee_under_id"
                                    value={formData.employee_under_id}
                                    onChange={handleChange}
                                    placeholder="--Please Select--"
                                >
                                    {users?.map((u) => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </Select>
                            </FormControl>
                        </GridItem>
                    </Grid>

                    {/* ── ENTRIES TABLE ── */}
                    <Box {...sectionStyle}>
            <Box bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">
              <Text fontWeight="500" fontSize="sm">Transaction</Text>
            </Box>
                        <Table
                            variant="simple"
                            size="sm"
                            style={{ borderCollapse: "separate", borderSpacing: 0 }}
                        >
                            <Thead bg="gray.100">
                                <Tr>
                                    {/* Dr/Cr column — no header text, just the toggle */}
                                    <Th fontSize="12px" px={2} py={2} w="64px" />
                                    <Th fontSize="12px" px={2} py={2}>Particulars</Th>
                                    <Th fontSize="12px" px={2} py={2}>Current Balance</Th>
                                    <Th fontSize="12px" px={2} py={2} isNumeric>Debit</Th>
                                    <Th fontSize="12px" px={2} py={2} isNumeric>Credit</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {visibleEntries.map((entry, index) => (
                                    <Tr key={index}>

                                        {/* DR / CR toggle */}
                                        <Td px={2} py={3}>
                                            <Select  sx={{
                                                paddingInlineEnd: "2px !important",
                                              }}
                                                value={entry.entry_type}
                                                onChange={(e) => handleEntryTypeChange(index, e.target.value) }
                                                w="62px" borderColor="#c8d0d8" fontSize="12px">
                                                <option value="Dr">Dr</option>
                                                <option value="Cr">Cr</option>
                                            </Select>
                                        </Td>

                                        {/* PARTICULARS / LEDGER */}
                                        <Td px={0} py={3} minW="220px">
                                            <Select
                                            
                                                value={entry.ledger_id}
                                                onChange={(e) => handleLedgerSelect(index, e.target.value)}
                                                placeholder="End Of List"
                                                borderColor="#c8d0d8"
                                                fontSize="12px" >
                                                {ledgerList.map((l) => (
                                                    <option key={l.id} value={l.id}>
                                                        {l.ledger_name}
                                                    </option>
                                                ))}
                                            </Select>
                                        </Td>

                                        {/* CURRENT BALANCE */}
                                        <Td px={2} py={3} minW="160px">
                                            <Flex align="center" gap={1}>
                                                <Input
                                                  
                                                    value={entry.current_balance || ""}
                                                    readOnly
                                                    bg="#f0f4f0" w="140px" textAlign="right" fontSize="12px" borderColor="#c8d0d8" />
                                                <Text fontSize="11px" color="gray.500" minW="20px" >
                                                    {entry.balance_type}
                                                </Text>
                                            </Flex>
                                        </Td>

                                        {/* DEBIT
                                            Row 0: editable, onBlur reveals row 1
                                            Row 1: disabled (Cr row) */}
                                        <Td px={0} py={3} isNumeric >
                                            <Input
                                                
                                                type="number"
                                                min={0}
                                                value={entry.debit}
                                                onChange={(e) =>
                                                    handleAmountChange(index, "debit", e.target.value)
                                                }
                                                onBlur={index === 0 ? handleDebitBlur : undefined}
                                                isDisabled={entry.entry_type === "Cr"}
                                                bg={entry.entry_type === "Cr" ? "#f0f4f0" : "white"}
                                                w="140px"
                                                textAlign="right"
                                                fontSize="12px"
                                                borderColor="#c8d0d8"
                                            />
                                        </Td>

                                        {/* CREDIT
                                            Row 1: editable
                                            Row 0: disabled (Dr row) */}
                                        <Td px={2} py={3} isNumeric>
                                            <Input
                                           
                                                type="number"
                                                min={0}
                                                value={entry.credit}
                                                onChange={(e) =>
                                                    handleAmountChange(index, "credit", e.target.value)
                                                }
                                                isDisabled={entry.entry_type === "Dr"}
                                                bg={entry.entry_type === "Dr" ? "#f0f4f0" : "white"}
                                                w="140px"
                                                textAlign="right"
                                                fontSize="12px"
                                                borderColor="#c8d0d8"
                                            />
                                        </Td>
                                    </Tr>
                                ))}

                                {/* TOTALS ROW */}
                                <Tr bg="gray.50" fontWeight="semibold">
                                    <Td px={2} py={3} colSpan={3}>
                                        <Text fontSize="12px" color="gray.600">Total</Text>
                                    </Td>
                                    <Td px={2} py={3} isNumeric>
                                        <Text
                                            fontSize="13px"
                                            color={
                                                showSecondRow && totalDebit !== totalCredit
                                                    ? "red.600"
                                                    : "green.700"
                                            }
                                            textAlign="right"
                                            pr={2}
                                        >
                                            {totalDebit.toFixed(2)}
                                        </Text>
                                    </Td>
                                    <Td px={2} py={3} isNumeric>
                                        <Text
                                            fontSize="13px"
                                            color={
                                                showSecondRow && totalDebit !== totalCredit
                                                    ? "red.600"
                                                    : "green.700"
                                            }
                                            textAlign="right"
                                            pr={2}
                                        >
                                            {totalCredit.toFixed(2)}
                                        </Text>
                                    </Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </Box>

                    {/* ── NARRATION ── */}
                    <FormControl mb={4}>
                        <FormLabel fontSize="13px" color="#494949" mb="3px">
                            Narration
                        </FormLabel>
                        <Textarea
                            name="narration"
                            value={formData.narration}
                            onChange={handleChange}
                            size="sm"
                            borderColor="#c8d0d8"
                            borderRadius="4px"
                            fontSize="13px"
                            rows={2}
                        />
                    </FormControl>

                    {/* ── SAVE ── */}
                    <Flex justify="flex-end">
                        <Button
                            bg="#237086"
                            color="white"
                            fontWeight="500"
                            fontSize="14px"
                            px={8}
                            borderRadius="12px"
                            _hover={{ bg: "#1B5A6B" }}
                            onClick={handleSubmit}
                            isLoading={submitting}
                            loadingText="Saving…"
                        >
                            Save
                        </Button>
                    </Flex>
                </Box>
       

            {/* ── BILL WISE MODAL ── */}
            <Modal
                isOpen={billModal}
                onClose={() => setBillModal(false)}
                size="4xl"
                scrollBehavior="inside"
            >
                <ModalOverlay />
                <ModalContent borderRadius="12px">
                    <ModalHeader
                        bg="#b0d1cf"
                        borderRadius="12px 12px 0 0"
                        padding="16px 21px"
                    >
                        <HStack gap={1}>
                            <Text fontSize="15px" fontWeight="600">
                                Bill Wise Details for :
                            </Text>
                            {selectedEntryIndex !== null &&
                                formData.entries[selectedEntryIndex]?.ledger_id && (
                                    <Text fontSize="14px" fontWeight="normal" color="gray.700">
                                        {ledgerList.find(
                                            (l) =>
                                                String(l.id) ===
                                                String(
                                                    formData.entries[selectedEntryIndex].ledger_id
                                                )
                                        )?.ledger_name || ""}
                                    </Text>
                                )}
                        </HStack>
                        <ModalCloseButton />
                    </ModalHeader>

                    <ModalBody pt={4}>
                        {billLoading ? (
                            <Flex justify="center" py={8}>
                                <Spinner size="lg" />
                            </Flex>
                        ) : (
                            <>
                                {/* Summary bar */}
                                <Flex
                                    gap={6}
                                    mb={4}
                                    p={3}
                                    bg="gray.50"
                                    borderRadius="md"
                                    fontSize="sm"
                                >
                                    <Box>
                                        <Text color="gray.500" fontSize="12px">Entry Amount</Text>
                                        <Text fontWeight="semibold">{entryAmount.toFixed(2)}</Text>
                                    </Box>
                                    <Box>
                                        <Text color="gray.500" fontSize="12px">Allocated</Text>
                                        <Text fontWeight="semibold">{billModalTotal.toFixed(2)}</Text>
                                    </Box>
                                    <Box>
                                        <Text color="gray.500" fontSize="12px">Difference</Text>
                                        <Text
                                            fontWeight="semibold"
                                            color={
                                                billDiff === 0
                                                    ? "green.600"
                                                    : billDiff < 0
                                                        ? "red.600"
                                                        : "orange.600"
                                            }
                                        >
                                            {billDiff.toFixed(2)}
                                        </Text>
                                    </Box>
                                </Flex>

                                <Box overflowX="auto">
                                    <Table size="sm" variant="simple">
                                        <Thead bg="gray.100">
                                            <Tr>
                                                <Th fontSize="12px">Type of Ref</Th>
                                                <Th fontSize="12px">Name</Th>
                                                <Th fontSize="12px">Due Date limit</Th>
                                                <Th fontSize="12px" isNumeric>Amount</Th>
                                                <Th fontSize="12px">Dr/Cr</Th>
                                                <Th fontSize="12px">Delete</Th>
                                                <Th fontSize="12px">Add</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {billReferenceData.map((bill, rowIndex) => (
                                                <Tr key={rowIndex}>

                                                    {/* TYPE OF REF */}
                                                    <Td minW="120px">
                                                        <Select
                                                            size="sm"
                                                            value={bill.reference_type}
                                                            onChange={(e) =>
                                                                handleBillReferenceChange(
                                                                    rowIndex,
                                                                    "reference_type",
                                                                    e.target.value
                                                                )
                                                            }
                                                        >
                                                            <option value="AGAINST REF">Agst Ref</option>
                                                            <option value="ADVANCE">Advance</option>
                                                            <option value="NEW REF">New Ref</option>
                                                            <option value="ON ACCOUNT">On Account</option>
                                                        </Select>
                                                    </Td>

                                                    {/* NAME / REFERENCE NO */}
                                                    <Td minW="260px">
                                                        {bill.reference_type === "ON ACCOUNT" ||
                                                            bill.reference_type === "ADVANCE" ? (
                                                            <Input
                                                                size="sm"
                                                                placeholder={
                                                                    bill.reference_type === "ADVANCE"
                                                                        ? "Advance ref…"
                                                                        : "On Account ref…"
                                                                }
                                                                value={bill.reference_no}
                                                                onChange={(e) =>
                                                                    handleBillReferenceChange(
                                                                        rowIndex,
                                                                        "reference_no",
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        ) : bill.reference_type === "NEW REF" ? (
                                                            <Input
                                                                size="sm"
                                                                placeholder="New reference no…"
                                                                value={bill.reference_no}
                                                                onChange={(e) =>
                                                                    handleBillReferenceChange(
                                                                        rowIndex,
                                                                        "reference_no",
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            /* AGST REF — dropdown of pending bills */
                                                            <Select
                                                                size="sm"
                                                                value={bill.reference_no}
                                                                onChange={(e) =>
                                                                    handleBillReferenceChange(
                                                                        rowIndex,
                                                                        "reference_no",
                                                                        e.target.value
                                                                    )
                                                                }
                                                            >
                                                                <option value="">-- Select --</option>
                                                                {billReferenceOptions.map((b, bi) => (
                                                                    <option key={bi} value={b.reference_no}>
                                                                        {b.reference_no}
                                                                        {b.due_date
                                                                            ? ` ${b.due_date.slice(0, 10)}`
                                                                            : ""}
                                                                        {b.pending_amount
                                                                            ? ` ${Number(b.pending_amount).toFixed(2)} Dr`
                                                                            : ""}
                                                                    </option>
                                                                ))}
                                                            </Select>
                                                        )}
                                                    </Td>

                                                    {/* DUE DATE */}
                                                    <Td minW="140px">
                                                        <Input
                                                            size="sm"
                                                            type="date"
                                                            value={bill.due_date || ""}
                                                            onChange={(e) =>
                                                                handleBillReferenceChange(
                                                                    rowIndex,
                                                                    "due_date",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </Td>

                                                    {/* AMOUNT */}
                                                    <Td isNumeric>
                                                        <Input
                                                            size="sm"
                                                            type="number"
                                                            min={0}
                                                            value={bill.amount}
                                                            onChange={(e) =>
                                                                handleBillReferenceChange(
                                                                    rowIndex,
                                                                    "amount",
                                                                    e.target.value
                                                                )
                                                            }
                                                            w="100px"
                                                            textAlign="right"
                                                        />
                                                    </Td>

                                                    {/* DR/CR */}
                                                    <Td>
                                                        <Input
                                                            size="sm"
                                                            value={bill.entry_type || "Cr"}
                                                            readOnly
                                                            w="50px"
                                                            bg="gray.50"
                                                        />
                                                    </Td>

                                                    {/* DELETE */}
                                                    <Td textAlign="center">
                                                        <Button
                                                            size="xs"
                                                            colorScheme="red"
                                                            variant="outline"
                                                            onClick={() => removeBillRow(rowIndex)}
                                                        >
                                                            ✕
                                                        </Button>
                                                    </Td>

                                                    {/* ADD — last row only */}
                                                    <Td textAlign="center">
                                                        {rowIndex === billReferenceData.length - 1 && (
                                                            <Button
                                                                size="xs"
                                                                colorScheme="green"
                                                                onClick={addBillRow}
                                                            >
                                                                +
                                                            </Button>
                                                        )}
                                                    </Td>
                                                </Tr>
                                            ))}

                                            {billReferenceData.length === 0 && (
                                                <Tr>
                                                    <Td
                                                        colSpan={7}
                                                        textAlign="center"
                                                        color="gray.400"
                                                        py={6}
                                                    >
                                                        No pending bills found.{" "}
                                                        <Button size="xs" onClick={addBillRow} ml={2}>
                                                            Add row
                                                        </Button>
                                                    </Td>
                                                </Tr>
                                            )}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </>
                        )}
                    </ModalBody>

                    <ModalFooter gap={3}>
                        <Button variant="outline" onClick={() => setBillModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            bg="#237086"
                            color="white"
                            _hover={{ bg: "#1B5A6B" }}
                            onClick={saveBillAllocation}
                        >
                            Save
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Journal;