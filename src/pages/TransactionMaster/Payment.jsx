import React, { useEffect, useState, useRef } from "react";
import { Box, Text, Grid, GridItem, FormControl, FormLabel, Input, Select, Textarea, Table, Thead, Tbody, Tr, Th, Td, Button, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Badge, Spinner, useToast, HStack, } from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import useUsersapi from "../../Apis/GetUsersapi";

const emptyEntry = () => ({
    ledger_id: "",
    current_balance: 0,
    amount: "",
    transaction_type: "",
    transaction_no: "",
    bank_name: "",
    bill_references: [],
    maintain_bill_by_bill: 0
});

const emptyForm = () => ({
    payment_date: "",
    account_ledger_id: "",
    employee_under_id: "",
    total_amount: 0,
    narration: "",
    entries: [emptyEntry()],
    attachment: null,
});

// ─── component ───────────────────────────────────────────────────────────────

const PaymentTransaction = () => {
    const { users } = useUsersapi();
    const toast = useToast();

    const [ledger, setLedger] = useState([]);
    const [account, setAccount] = useState([]);
    const [formData, setFormData] = useState(emptyForm());
    const [ledgerDetails, setLedgerDetails] = useState({});
    const [selecteId, setSelectedId] = useState();

    const [billModal, setBillModal] = useState(false);
    const [billLoading, setBillLoading] = useState(false);
    const [selectedEntryIndex, setSelectedEntryIndex] = useState(null);
    const [billReferenceData, setBillReferenceData] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const fetchBankGroupLedger = async () => {
        try {
            const res = await API.get(API_ENDPOINTS?.GET_BANK_ACCOUNT_LEDGER_DROPDOWN);
            if (res.status === 200) setAccount(res.data.data);
        } catch (err) {
            console.error("Error fetching account ledgers", err);
        }
    };

    const fetchLedgerDropdown = async () => {
        try {
            const res = await API.get(API_ENDPOINTS.GET_LEDGER_DROPDOWN);
            if (res.status === 200) setLedger(res.data.data);
        } catch (err) {
            console.error("Error fetching ledgers", err);
        }
    };

    const loadVoucherNo = async () => {
        try {
            const res = await API.get(`${API_ENDPOINTS?.GET_NEXTVOUCHER_NO}?voucher_type=PAYMENT`);
            setFormData((prev) => ({
                ...prev,
                voucher_no: res.data.voucher_no,  // ← was setting `voucherNo` (the whole axios response)
            }));
        } catch (err) {
            console.error("loadVoucherNo error:", err);
        }
    };

    useEffect(() => {
        fetchLedgerDropdown();
        fetchBankGroupLedger();
        loadVoucherNo();
    }, []);

    // ── keep total in sync ───────────────────────────────────────────────────

    useEffect(() => {
        const total = formData.entries.reduce(
            (sum, e) => sum + Number(e.amount || 0),
            0,
        );
        setFormData((prev) => ({ ...prev, total_amount: total }));
    }, [formData.entries]);

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, attachment: e.target.files[0] }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEntryChange = (index, field, value) => {
        setFormData((prev) => {
            const entries = [...prev.entries];
            entries[index] = { ...entries[index], [field]: value };
            return { ...prev, entries };
        });
    };
    // ─── Ledger selected → fetch details only, no modal ───────────────────────────
    const handleLedgerSelect = async (index, ledgerId) => {
        setFormData((prev) => {
            const entries = [...prev.entries];
            entries[index] = {
                ...entries[index],
                ledger_id: ledgerId,
                current_balance: 0,
                bill_references: [],
                maintain_bill_by_bill: 0,   // reset flag
                transaction_type: "",       // reset transaction type
            };
            return { ...prev, entries };
        });

        if (!ledgerId) return;

        try {
            const res = await API.get(`${API_ENDPOINTS.get_ledger_by_id}/${ledgerId}`);
            if (res.status === 200) {
                const { current_balance, balance_type, maintain_bill_by_bill } = res.data.data;

                const balance = balance_type === "Cr"
                    ? -Math.abs(Number(current_balance))
                    : Math.abs(Number(current_balance));

                setFormData((prev) => {
                    const entries = [...prev.entries];
                    entries[index] = {
                        ...entries[index],
                        current_balance: balance,
                        maintain_bill_by_bill: maintain_bill_by_bill ?? 0,  // store flag
                    };
                    return { ...prev, entries };
                });
            }
        } catch (err) {
            console.error("Error fetching ledger details", err);
        }
    };

    // ─── Transaction type clicked/changed → open bill modal if needed ─────────────
    const handleTransactionTypeChange = (index, value) => {
        setFormData((prev) => {
            const entries = [...prev.entries];
            entries[index] = { ...entries[index], transaction_type: value };
            return { ...prev, entries };
        });

        // Open bill modal only if this ledger requires bill-by-bill tracking
        if (formData.entries[index].maintain_bill_by_bill === 1) {
            openBillModal(index, formData.entries[index].ledger_id);
        }
    };
    const handleAccountSelect = async (e) => {
        const ledgerId = e.target.value;
        setFormData((prev) => ({ ...prev, account_ledger_id: ledgerId, current_balance: 0 }));

        if (!ledgerId) return;

        try {
            const res = await API.get(`${API_ENDPOINTS.get_ledger_by_id}/${ledgerId}`);
            if (res.status === 200) {
                const { current_balance, balance_type } = res.data.data;
                const balance = balance_type === "Cr"
                    ? -Math.abs(Number(current_balance))
                    : Math.abs(Number(current_balance));

                setFormData((prev) => ({ ...prev, current_balance: balance }));
            }
        } catch (err) {
            console.error("Error fetching account balance", err);
        }
    };

    const addEntryRow = () => {
        setFormData((prev) => ({
            ...prev,
            entries: [...prev.entries, emptyEntry()],
        }));
    };

    const removeEntryRow = (index) => {
        setFormData((prev) => {
            const entries = [...prev.entries];
            entries.splice(index, 1);
            return { ...prev, entries };
        });
    };


    const openBillModal = async (index, ledgerId) => {
        setBillLoading(true);
        setSelectedEntryIndex(index);
        setBillModal(true);

        try {
            const res = await API.get(
                `${API_ENDPOINTS?.GET_BILL_REFERENCE}/${ledgerId}`,
            );

            if (res.status === 200) {
                const serverBills = res.data.data;
                // If this entry already has saved allocations, restore them
                const savedRefs = formData.entries[index]?.bill_references ?? [];

                if (savedRefs.length > 0) {
                    const merged = serverBills.map((bill) => {
                        const saved = savedRefs.find(
                            (s) => s.reference_no === bill.reference_no,
                        );
                        return saved ? { ...bill, ...saved } : mapServerBill(bill);
                    });
                    setBillReferenceData(merged);
                } else {
                    setBillReferenceData(serverBills.map(mapServerBill));
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
            // Still keep modal open so user can add NEW REF / ON ACCOUNT manually
            setBillReferenceData([]);
        } finally {
            setBillLoading(false);
        }
    };

    /** Normalize a server bill object into the shape the modal uses */
    const mapServerBill = (bill) => ({
        reference_type: "AGST REF",
        reference_no: bill.reference_no ?? "",
        reference_amount: bill.pending_amount ?? bill.reference_amount ?? 0,
        due_date: bill.due_date ?? "",
        dr_cr: "Dr",
        // carry these for display / dropdown population
        _pending_amount: bill.pending_amount ?? bill.reference_amount ?? 0,
        _purchase_date: bill.purchase_date ?? "",
    });

    const handleBillReferenceChange = (rowIndex, field, value) => {
        setBillReferenceData((prev) => {
            const updated = [...prev];
            updated[rowIndex] = { ...updated[rowIndex], [field]: value };

            // When type switches to ON ACCOUNT or ADVANCE, clear reference_no
            if (
                field === "reference_type" &&
                (value === "ON ACCOUNT" || value === "ADVANCE")
            ) {
                updated[rowIndex].reference_no = "";
            }

            return updated;
        });
    };

    /** Add a blank row in the bill modal (for NEW REF / ON ACCOUNT) */
    const addBillRow = () => {
        setBillReferenceData((prev) => [
            ...prev,
            {
                reference_type: "NEW REF",
                reference_no: "",
                reference_amount: 0,
                due_date: "",
                dr_cr: "Dr",
            },
        ]);
    };

    const removeBillRow = (rowIndex) => {
        setBillReferenceData((prev) => prev.filter((_, i) => i !== rowIndex));
    };

    /** Save allocations back into the entry and close the modal */
    const saveBillAllocation = () => {
        const cleaned = billReferenceData.map(
            ({ _pending_amount, _purchase_date, ...rest }) => rest,
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

    // ── submission ────────────────────────────────────────────────────────────

    const handlePayment = async () => {
        // Basic validation
        if (!formData.payment_date) {
            toast({ title: "Date is required", status: "warning", duration: 2500 });
            return;
        }
        if (!formData.account_ledger_id) {
            toast({ title: "Account is required", status: "warning", duration: 2500 });
            return;
        }
        if (
            formData.entries.some((e) => !e.ledger_id || !e.amount || !e.transaction_type)
        ) {
            toast({
                title: "Each entry must have a ledger, amount and transaction type",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        try {
            setSubmitting(true);

            const fd = new FormData();
            fd.append("payment_date", formData.payment_date);
            fd.append("account_ledger_id", formData.account_ledger_id);
            fd.append("employee_under_id", formData.employee_under_id || "");
            fd.append("total_amount", formData.total_amount);
            fd.append("narration", formData.narration);
            fd.append("entries", JSON.stringify(formData.entries.map((e) => ({
                ledger_id: e.ledger_id,
                amount: Number(e.amount),
                transaction_type: e.transaction_type,
                transaction_no: e.transaction_no || null,
                bank_name: e.bank_name || null,
                bill_references: e.bill_references,
            }))));
            if (formData.attachment) {
                fd.append("attachment", formData.attachment);
            }
            const res = await API.post(API_ENDPOINTS.CREATE_PAYMENT, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.status === 201) {
                toast({
                    title: "Payment Created Successfully",
                    description: `Voucher No: ${res.data.voucher_no}`,
                    status: "success",
                    duration: 4000,
                    isClosable: true,
                });
                // Reset form
                setFormData(emptyForm());
            }
        } catch (err) {
            console.error(err);
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

    // ── derived state ─────────────────────────────────────────────────────────

    const billModalTotal = billReferenceData.reduce(
        (sum, b) => sum + Number(b.reference_amount || 0),
        0,
    );

    const entryAmount =
        selectedEntryIndex !== null
            ? Number(formData.entries[selectedEntryIndex]?.amount || 0)
            : 0;

    const billDiff = entryAmount - billModalTotal;

    // ── render ────────────────────────────────────────────────────────────────



    return (
        <Box p={5}>
            {/* ── HEADER ── */}
            <Text fontSize="2xl" fontWeight="bold" mb={5}>
                Payment Voucher
            </Text>

            {/* ── TOP FORM ── */}
            <Grid templateColumns="repeat(2, 1fr)" gap={5} mb={6}>
                <GridItem>
                    <FormControl>
                        <FormLabel>Payment No.</FormLabel>
                        <Input
                            value={formData.voucher_no || ""}
                            readOnly
                            bg="gray.50"
                            fontWeight="semibold"
                        />
                    </FormControl>
                </GridItem>
                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>Date</FormLabel>
                        <Input
                            type="date"
                            name="payment_date"
                            value={formData.payment_date}
                            onChange={handleChange}
                        />
                    </FormControl>
                </GridItem>

                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>Account</FormLabel>
                        <Select
                            name="account_ledger_id"
                            value={formData.account_ledger_id}
                            onChange={handleAccountSelect}
                            placeholder="Select Account"
                        >
                            {account.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.ledger_name}
                                </option>
                            ))}
                        </Select>
                    </FormControl>
                </GridItem>

                <GridItem>
                    <FormControl>
                        <FormLabel>Employee Under</FormLabel>
                        <Select
                            name="employee_under_id"
                            value={formData.employee_under_id}
                            onChange={handleChange}
                            placeholder="--Please Select--"
                        >
                            {users?.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </Select>
                    </FormControl>
                </GridItem>

                <GridItem>
                    <FormControl>
                        <FormLabel>Current Balance</FormLabel>
                        <Input
                            value={Number(formData.current_balance || 0).toFixed(2)}
                            readOnly
                            bg="gray.50"
                            fontWeight="semibold"
                        />
                    </FormControl>
                </GridItem>
            </Grid>

            {/* ── ENTRIES TABLE ── */}
            <Box borderWidth="1px" borderRadius="md" overflowX="auto" mb={5}>
                <Table variant="simple" size="sm" style={{ borderCollapse: "separate", borderSpacing: 0 }} className="material_mfg">
                    <Thead bg="gray.100">
                        <Tr>
                            <Th>Particulars (Ledger)</Th>
                            <Th isNumeric>Current Balance</Th>
                            <Th isNumeric>Amount</Th>
                            <Th>Transaction Type</Th>
                            <Th>Txn/Cheque No.</Th>
                            <Th>Bank Name</Th>
                            <Th>Bill Refs</Th>
                            <Th>Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {formData.entries.map((entry, index) => (
                            <Tr key={index}>
                                {/* LEDGER */}
                                <Td minW="180px">
                                    <Select
                                        size="sm"
                                        value={entry.ledger_id}
                                        onChange={(e) => handleLedgerSelect(index, e.target.value)}
                                        placeholder="End Of List"
                                    >
                                        {ledger.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.ledger_name}
                                            </option>
                                        ))}
                                    </Select>
                                </Td>

                                {/* CURRENT BALANCE */}
                                <Td isNumeric>
                                    <Input
                                        size="sm"
                                        value={Number(entry.current_balance).toFixed(2)}
                                        readOnly
                                        bg="gray.50"
                                        w="100px"
                                        textAlign="right"
                                    />
                                </Td>

                                {/* AMOUNT */}
                                <Td>
                                    <Input
                                        size="sm"
                                        type="number"
                                        min={0}
                                        value={entry.amount}
                                        onChange={(e) =>
                                            handleEntryChange(index, "amount", e.target.value)
                                        }
                                        w="100px"
                                    />
                                </Td>

                                {/* TRANSACTION TYPE — opening bill modal on change */}
                                <Td minW="160px">
                                    <Select
                                        size="sm"
                                        value={entry.transaction_type}
                                        // onChange={(e) => handleTransactionTypeChange(index, e.target.value)}
                                        onChange={(e) => handleTransactionTypeChange(index, e.target.value)}
                                        minW="120px"
                                        isDisabled={!entry.ledger_id}
                                        placeholder="Please select"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Cheque/DD">Cheque/DD</option>
                                        <option value="E-Fund Transfer">E-Fund Transfer</option>
                                        <option value="Others">Others</option>
                                    </Select>
                                </Td>

                                {/* TRANSACTION NO */}
                                <Td>
                                    <Input
                                        size="sm"
                                        value={entry.transaction_no}
                                        onChange={(e) =>
                                            handleEntryChange(index, "transaction_no", e.target.value)
                                        }
                                        w="120px"
                                    />
                                </Td>

                                {/* BANK NAME */}
                               <Td>
  <Select
    size="sm"
    value={entry.bank_name}
    onChange={(e) =>
      handleEntryChange(index, "bank_name", e.target.value)
    }
    placeholder="Select Bank"
    w="180px"
  >
    {account.map((item) => (
      <option
        key={item.id}
        value={item.ledger_name}
      >
        {item.ledger_name}
      </option>
    ))}
  </Select>
</Td>

                                {/* BILL REFS INDICATOR */}
                                <Td textAlign="center">
                                    {entry.bill_references.length > 0 ? (
                                        <Badge
                                            colorScheme="green"
                                            cursor="pointer"
                                            onClick={() =>
                                                entry.ledger_id &&
                                                openBillModal(index, entry.ledger_id)
                                            }
                                        >
                                            {entry.bill_references.length} ref
                                            {entry.bill_references.length > 1 ? "s" : ""}
                                        </Badge>
                                    ) : (
                                        <Button
                                            size="xs"
                                            variant="outline"
                                            isDisabled={!entry.ledger_id}
                                            onClick={() =>
                                                entry.ledger_id &&
                                                openBillModal(index, entry.ledger_id)
                                            }
                                        >
                                            Bill
                                        </Button>
                                    )}
                                </Td>

                                {/* ADD / REMOVE */}
                                <Td>
                                    <Flex gap={2}>
                                        <Button size="sm" colorScheme="green" onClick={addEntryRow} >
                                            +
                                        </Button>
                                        {formData.entries.length > 1 && (
                                            <Button size="sm" colorScheme="red" onClick={() => removeEntryRow(index)} >
                                                −
                                            </Button>
                                        )}
                                    </Flex>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
            <Box mb={5}>
                <FormControl isRequired>
                    <FormLabel>Upload Document</FormLabel>
                    <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        p={1}
                    />
                </FormControl>
            </Box>

            {/* ── NARRATION ── */}
            <FormControl>
                <FormLabel>Total Amount</FormLabel>
                <Input
                    value={formData.total_amount.toFixed(2)}
                    readOnly
                    bg="gray.50"
                    fontWeight="semibold"
                />
            </FormControl>
            <Box mb={5}>
                <FormControl>
                    <FormLabel>Narration</FormLabel>
                    <Textarea
                        name="narration"
                        value={formData.narration}
                        onChange={handleChange}
                    />
                </FormControl>
            </Box>

            {/* ── SAVE ── */}
            <Flex justify="flex-end" mt={6}>
                <Button
                    bg="#237086" fontWeight="500" 
                fontSize="14px" color="white"
                _hover={{ bg: "#1B5A6B" }}
                 px={8} borderRadius="12px"
                    onClick={handlePayment}
                    isLoading={submitting}
                    loadingText="Saving…"
                >
                    Save Payment
                </Button>
            </Flex>

            {/* ── BILL WISE MODAL ── */}
            <Modal
                isOpen={billModal}
                onClose={() => setBillModal(false)}
                size="5xl"
                scrollBehavior="inside" 
            >
                <ModalOverlay />
                <ModalContent borderRadius='12px'>
                    <ModalHeader bg='#b0d1cf' borderRadius='12px 12px 0px 0px' padding='21px'>
                        <HStack gap={0}>
                        <Text fontSize="16px">
                        Bill Wise Details</Text>
                        {selectedEntryIndex !== null && formData.entries[selectedEntryIndex]?.ledger_id && (
                            <Text as="span" fontWeight="normal" fontSize="13px" ml={2} color="gray.500">
                                —{" "}
                                {
                                    ledger.find(
                                        (l) =>
                                            String(l.id) ===
                                            String(formData.entries[selectedEntryIndex].ledger_id),
                                    )?.ledger_name
                                }
                            </Text>
                        )}</HStack>
                          <ModalCloseButton />
                    </ModalHeader>
                  

                    <ModalBody>
                        {billLoading ? (
                            <Flex justify="center" py={8}>
                                <Spinner size="lg" />
                            </Flex>
                        ) : (
                            <>
                                {/* Summary bar */}
                                <Flex gap={6} mb={4} p={3} bg="gray.50" borderRadius="md" fontSize="sm">
                                    <Box>
                                        <Text color="gray.500">Entry Amount</Text>
                                        <Text fontWeight="semibold">{entryAmount.toFixed(2)}</Text>
                                    </Box>
                                    <Box>
                                        <Text color="gray.500">Allocated</Text>
                                        <Text fontWeight="semibold">{billModalTotal.toFixed(2)}</Text>
                                    </Box>
                                    <Box>
                                        <Text color="gray.500">Difference</Text>
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
                                                <Th>Type of Ref</Th>
                                                <Th>Name / Reference No</Th>
                                                <Th>Due Date (limit)</Th>
                                                <Th isNumeric>Amount</Th>
                                                <Th>Dr/Cr</Th>
                                                <Th>Delete</Th>
                                                <Th>Add</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {billReferenceData.map((bill, rowIndex) => (
                                                <Tr key={rowIndex}>
                                                    {/* TYPE OF REF */}
                                                    <Td minW="130px">
                                                        <Select
                                                            size="sm"
                                                            value={bill.reference_type}
                                                            onChange={(e) =>
                                                                handleBillReferenceChange(
                                                                    rowIndex,
                                                                    "reference_type",
                                                                    e.target.value,
                                                                )
                                                            }
                                                        >
                                                            <option value="AGST REF">Agst Ref</option>
                                                            <option value="ADVANCE">Advance</option>
                                                            <option value="NEW REF">New Ref</option>
                                                            <option value="ON ACCOUNT">On Account</option>
                                                        </Select>
                                                    </Td>

                                                    {/* REFERENCE NO / NAME */}
                                                    <Td minW="220px">
                                                        {bill.reference_type === "ON ACCOUNT" ||
                                                            bill.reference_type === "ADVANCE" ? (
                                                            /* free-text for On Account / Advance */
                                                            <Input
                                                                size="sm"
                                                                placeholder={
                                                                    bill.reference_type === "ON ACCOUNT"
                                                                        ? "On Account ref…"
                                                                        : "Advance ref…"
                                                                }
                                                                value={bill.reference_no}
                                                                onChange={(e) =>
                                                                    handleBillReferenceChange(
                                                                        rowIndex,
                                                                        "reference_no",
                                                                        e.target.value,
                                                                    )
                                                                }
                                                            />
                                                        ) : bill.reference_type === "NEW REF" ? (
                                                            /* free-text for New Ref */
                                                            <Input
                                                                size="sm"
                                                                placeholder="New reference no…"
                                                                value={bill.reference_no}
                                                                onChange={(e) =>
                                                                    handleBillReferenceChange(
                                                                        rowIndex,
                                                                        "reference_no",
                                                                        e.target.value,
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
                                                                        e.target.value,
                                                                    )
                                                                }
                                                            >
                                                                <option value="">-- Select --</option>
                                                                {billReferenceData
                                                                    .filter(
                                                                        (b) =>
                                                                            b._pending_amount !== undefined ||
                                                                            b.reference_no,
                                                                    )
                                                                    .map((b, bi) => (
                                                                        <option
                                                                            key={bi}
                                                                            value={b.reference_no}
                                                                        >
                                                                            {b.reference_no}
                                                                            {b._purchase_date
                                                                                ? ` ${b._purchase_date}`
                                                                                : ""}
                                                                            {b._pending_amount !== undefined
                                                                                ? ` ${Number(b._pending_amount).toFixed(
                                                                                    2,
                                                                                )} Cr`
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
                                                                    e.target.value,
                                                                )
                                                            }
                                                        />
                                                    </Td>

                                                    <Td>
                                                        <Input
                                                            size="sm"
                                                            type="number"
                                                            min={0}
                                                            value={bill.reference_amount}
                                                            onChange={(e) => handleBillReferenceChange(rowIndex, "reference_amount", e.target.value,)}
                                                            w="100px"
                                                            textAlign="right" />
                                                    </Td>

                                                    {/* DR/CR */}
                                                    <Td>
                                                        <Input size="sm" value={bill.dr_cr || "Dr"} readOnly w="50px" bg="gray.50" />
                                                    </Td>

                                                    {/* DELETE */}
                                                    <Td textAlign="center">
                                                        <Button size="xs" colorScheme="red" variant="outline" onClick={() => removeBillRow(rowIndex)} >
                                                            ✕
                                                        </Button>
                                                    </Td>

                                                    {/* ADD */}
                                                    <Td textAlign="center">
                                                        {rowIndex === billReferenceData.length - 1 && (
                                                            <Button size="xs" colorScheme="green" onClick={addBillRow}> + </Button>
                                                        )}
                                                    </Td>
                                                </Tr>
                                            ))}

                                            {billReferenceData.length === 0 && (
                                                <Tr>
                                                    <Td colSpan={7} textAlign="center" color="gray.400" py={6}>
                                                        No pending bills found.{" "}
                                                        <Button size="xs" onClick={addBillRow} ml={2}> Add row </Button>
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
                        <Button variant="outline" onClick={() => setBillModal(false)}> Cancel </Button>
                        <Button colorScheme="blue" onClick={saveBillAllocation}> Save </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default PaymentTransaction;