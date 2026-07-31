import React, { useEffect, useState, useRef } from "react";
import { Box, Text, Grid, GridItem, FormControl, FormLabel, Input, Select, Textarea, Table, Thead, Tbody, Tr, Th, Td, Button, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Badge, Spinner, useToast, HStack, } from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import useUsersapi from "../../Apis/GetUsersapi";
import { AddIcon } from "@chakra-ui/icons";

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
    const [billReferenceOptions, setBillReferenceOptions] = useState([]); // raw API data for dropdown


    // ─── Styles ───────────────────────────────────────────────────────────────────
    const sectionStyle = {
        bg: "white",
        border: "1px solid #d0d7de",
        borderRadius: "6px",
        p: 0,
        mb: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    };



    const labelStyle = {
        fontSize: "12px",
        color: "#494949",
        marginBottom: "3px",
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

    const readonlyInputStyle = {
        ...inputStyle,
        bg: "#f0f4f0",
        color: "#555",
    };

    const thStyle = {
        // fontSize: "11px",
        // bg: "#e4ede6",
        // color: "#2d5a3d",
        borderColor: "#c8d8cc",
        p: "6px 4px",
        // textAlign: "center",
        fontWeight: "700",
        letterSpacing: "0.3px",
        whiteSpace: "nowrap",
    };

    const tdStyle = {
        p: "2px 3px",
        borderColor: "#e0e8e2",
        verticalAlign: "middle",

    };


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
            console.log(err);
            console.log(err.response);

            toast({
                title: "Error",
                description: err.response?.data?.message || err.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
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
    const handleTransactionTypeClick = (index) => {
        const entry = formData.entries[index];

        if (!entry.amount || Number(entry.amount) <= 0) {
            toast({
                title: "Enter Amount First",
                status: "warning",
                duration: 2000,
                isClosable: true,
            });
            return;
        }

        if (entry.maintain_bill_by_bill === 1 && entry.bill_references.length === 0) {
            openBillModal(index, entry.ledger_id);
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

    // Recomputes reference_amount for every AGST REF row, top to bottom,
    // using the entry's OUTSIDE amount as the source of truth.
    const applyWaterfallAllocation = (rows, outsideAmount, billsList = billReferenceOptions) => {
        let remaining = Number(outsideAmount || 0);

        return rows.map((row) => {
            if (row.reference_type === "AGST REF" && row.purchase_bill_reference_id) {
                const bill = billsList.find((b) => Number(b.id) === Number(row.purchase_bill_reference_id));
                const pendingAmt = bill ? Number(bill.pending_amount) : 0;
                const allocated = Math.max(0, Math.min(remaining, pendingAmt));
                remaining -= allocated;
                return { ...row, reference_amount: allocated };
            }
            // ON ACCOUNT / ADVANCE / NEW REF rows: keep user-typed amount,
            // but still deduct it so later AGST rows see the correct remainder.
            remaining -= Number(row.reference_amount || 0);
            return row;
        });
    };


    const openBillModal = async (index, ledgerId) => {
        setBillLoading(true);
        setSelectedEntryIndex(index);
        setBillModal(true);

        try {
            const res = await API.get(`${API_ENDPOINTS?.GET_BILL_REFERENCE}/${ledgerId}`);

            if (res.status === 200) {
                const serverBills = res.data.data; // store as dropdown options

                // Store the raw server bills separately for dropdown population
                setBillReferenceOptions(serverBills); // ← new state

                // Restore saved allocations or start with one blank AGST REF row
                const savedRefs = formData.entries[index]?.bill_references ?? [];

                // if (savedRefs.length > 0) {
                //     setBillReferenceData(
                //         savedRefs.map((ref) => {
                //             const matchedBill = serverBills.find(
                //                 (b) =>
                //                     Number(b.id) ===
                //                     Number(ref.purchase_bill_reference_id)
                //             );

                //             return {
                //                 ...ref,
                //                 _pending_amount: matchedBill?.pending_amount,
                //                 _purchase_date: matchedBill?.purchase_date,
                //             };
                //         })
                //     );
                // }
                // else {
                //     const entryAmount = Number(formData.entries[index]?.amount || 0);

                //     setBillReferenceData([{
                //         reference_type: "AGST REF",
                //         reference_no: "",
                //         purchase_bill_reference_id: null,
                //         reference_amount: entryAmount,
                //         due_date: "",
                //         dr_cr: "Dr",
                //     }]);
                // }

                if (savedRefs.length > 0) {
                    const rehydrated = savedRefs.map((ref) => {
                        const matchedBill = serverBills.find(
                            (b) => Number(b.id) === Number(ref.purchase_bill_reference_id)
                        );
                        return {
                            ...ref,
                            _pending_amount: matchedBill?.pending_amount,
                            _purchase_date: matchedBill?.purchase_date,
                        };
                    });
                    const entryAmount = Number(formData.entries[index]?.amount || 0);
                    setBillReferenceData(applyWaterfallAllocation(rehydrated, entryAmount, serverBills));
                } else {
                    const entryAmount = Number(formData.entries[index]?.amount || 0);
                    setBillReferenceData([{
                        reference_type: "AGST REF",
                        reference_no: "",
                        purchase_bill_reference_id: null,
                        reference_amount: 0, // was entryAmount before — now computed only after a bill is picked
                        due_date: "",
                        dr_cr: "Dr",
                    }]);
                }
            }
        } catch (err) {
            console.error("Error fetching bill references", err);
            toast({ title: "Error", description: "Failed to load bill references.", status: "error", duration: 3000, isClosable: true });
            setBillReferenceData([{ reference_type: "AGST REF", reference_no: "", reference_amount: 0, purchase_bill_reference_id: null, due_date: "", dr_cr: "Dr" }]);
            setBillReferenceOptions([]);
        } finally {
            setBillLoading(false);
        }
    };

    /** Normalize a server bill object into the shape the modal uses */
    const mapServerBill = (bill) => ({
        purchase_bill_reference_id: bill.id,
        reference_type: "AGST REF",
        reference_no: bill.reference_no ?? "",
        reference_amount: bill.pending_amount ?? bill.reference_amount ?? 0,
        due_date: bill.due_date ?? "",
        dr_cr: "Dr",
        // carry these for display / dropdown population
        _pending_amount: bill.pending_amount ?? bill.reference_amount ?? 0,
        _purchase_date: bill.purchase_date ?? "",
    });

    // const handleBillReferenceChange = (rowIndex, field, value) => {
    //     setBillReferenceData((prev) => {
    //         const updated = [...prev];
    //         updated[rowIndex] = { ...updated[rowIndex], [field]: value };

    //         // When type switches to ON ACCOUNT or ADVANCE, clear reference_no

    //         if ( field === "reference_type" && (value === "ON ACCOUNT" || value === "ADVANCE" || value === "NEW REF") ) {
    //             updated[rowIndex].reference_no = "";
    //             updated[rowIndex].purchase_bill_reference_id = null;
    //         }

    //         return updated;
    //     });
    // };

    const handleBillReferenceChange = (rowIndex, field, value) => {
        const outsideAmount = formData.entries[selectedEntryIndex]?.amount || 0;

        setBillReferenceData((prev) => {
            let updated = [...prev];
            updated[rowIndex] = { ...updated[rowIndex], [field]: value };

            if (field === "reference_type" && (value === "ON ACCOUNT" || value === "ADVANCE" || value === "NEW REF")) {
                updated[rowIndex].reference_no = "";
                updated[rowIndex].purchase_bill_reference_id = null;
            }

            if (field === "reference_type" || field === "reference_amount") {
                updated = applyWaterfallAllocation(updated, outsideAmount);
            }

            return updated;
        });
    };

    /** Add a blank row in the bill modal (for NEW REF / ON ACCOUNT) */

    // const addBillRow = () => {
    //     setBillReferenceData((prev) => [
    //         ...prev,
    //         { reference_type: "NEW REF", reference_no: "", purchase_bill_reference_id: null, reference_amount: 0, due_date: "", dr_cr: "Dr", },
    //     ]);
    // };

    const addBillRow = () => {
        const outsideAmount = formData.entries[selectedEntryIndex]?.amount || 0;
        setBillReferenceData((prev) =>
            applyWaterfallAllocation(
                [...prev, { reference_type: "NEW REF", reference_no: "", purchase_bill_reference_id: null, reference_amount: 0, due_date: "", dr_cr: "Dr" }],
                outsideAmount
            )
        );
    };
    const removeBillRow = (rowIndex) => {
        const outsideAmount = formData.entries[selectedEntryIndex]?.amount || 0;
        setBillReferenceData((prev) =>
            applyWaterfallAllocation(prev.filter((_, i) => i !== rowIndex), outsideAmount)
        );
    };

    // const removeBillRow = (rowIndex) => {
    //     setBillReferenceData((prev) => prev.filter((_, i) => i !== rowIndex));
    // };



    // const saveBillAllocation = () => {
    //     const cleaned = billReferenceData.map(
    //         ({ _pending_amount, _purchase_date, ...rest }) => rest
    //     );

    //     const totalAllocated = cleaned.reduce(
    //         (sum, row) => sum + Number(row.reference_amount || 0),
    //         0
    //     );

    //     setFormData((prev) => {
    //         const entries = [...prev.entries];
    //         entries[selectedEntryIndex] = {
    //             ...entries[selectedEntryIndex],
    //             amount: totalAllocated,
    //             bill_references: cleaned,
    //         };
    //         return { ...prev, entries };
    //     });

    //     setBillModal(false);
    // };
    const saveBillAllocation = () => {
        const cleaned = billReferenceData.map(
            ({ _pending_amount, _purchase_date, ...rest }) => rest
        );

        setFormData((prev) => {
            const entries = [...prev.entries];
            entries[selectedEntryIndex] = {
                ...entries[selectedEntryIndex],
                bill_references: cleaned,
                // amount left untouched — it's the outside figure you typed
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
            const entries = formData.entries.map((entry) => ({
                ledger_id: entry.ledger_id,
                amount: Number(entry.amount),
                transaction_type: entry.transaction_type,
                transaction_no: entry.transaction_no || null,
                bank_name: entry.bank_name || null,

                bill_references: entry.bill_references.map((bill) => ({
                    purchase_bill_reference_id: bill.purchase_bill_reference_id || null,
                    reference_type: bill.reference_type,
                    reference_no: bill.reference_no || null,
                    reference_amount: Number(bill.reference_amount || 0),
                    due_date: bill.due_date || null,
                    dr_cr: bill.dr_cr || "Dr",
                })),
            }));

            fd.append("entries", JSON.stringify(entries));
            // fd.append("entries", JSON.stringify(formData.entries.map((e) => ({
            //     ledger_id: e.ledger_id,
            //     amount: Number(e.amount),
            //     transaction_type: e.transaction_type,
            //     transaction_no: e.transaction_no || null,
            //     bank_name: e.bank_name || null,
            //     bill_references: e.bill_references,
            // }))));
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
                loadVoucherNo();
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

    const entryAmount = selectedEntryIndex !== null ? Number(formData.entries[selectedEntryIndex]?.amount || 0) : 0;

    const billDiff = entryAmount - billModalTotal;

    // ── validation for the bill modal ───────────────────────────────────────
    const hasBlankAgstRef = billReferenceData.some(
        (row) => row.reference_type === "AGST REF" && !row.purchase_bill_reference_id
    );

    const isAmountMismatched = Math.abs(billDiff) > 0.01; // small epsilon for float rounding

    const billModalError = hasBlankAgstRef
        ? "Please select a bill for all Agst Ref rows."
        : isAmountMismatched
            ? "Allocated amount doesn't match entry amount."
            : null;

    const isSaveDisabled = billModalError !== null || billReferenceData.length === 0;

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <Box p={5}>

            {/* ── TOP FORM ── */}
            <Grid templateColumns="repeat(2, 1fr)" gap={5} mb={6}>
                <GridItem>
                    <FormControl>
                        <FormLabel>Payment No.</FormLabel>
                        <Input value={formData.voucher_no || ""} readOnly bg="gray.50" fontWeight="semibold" />
                    </FormControl>
                </GridItem>
                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>Date</FormLabel>
                        <Input type="date" name="payment_date" value={formData.payment_date} onChange={handleChange} />
                    </FormControl>
                </GridItem>

                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>Account</FormLabel>
                        <Select
                            name="account_ledger_id"
                            value={formData.account_ledger_id}
                            onChange={handleAccountSelect}
                            placeholder="Select Account">
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
                            placeholder="--Please Select--" >
                            {users?.map((item) => (
                                <option key={item.id} value={item.id}> {item.name} </option>
                            ))}
                        </Select>
                    </FormControl>
                </GridItem>

                <GridItem>
                    <FormControl>
                        <FormLabel>Current Balance</FormLabel>
                        <Input
                            value={Number(formData.current_balance || 0).toFixed(2)}
                            readOnly bg="gray.50" fontWeight="semibold" />
                    </FormControl>
                </GridItem>
            </Grid>

            {/* ── ENTRIES TABLE ── */}
            <Box {...sectionStyle} overflowX="auto">
                <Flex justify="space-between" align="center" bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">
                    <Text fontWeight="500" fontSize="sm" >
                        Transaction
                    </Text>
                </Flex>
                <Table variant="simple" size="sm" style={{ borderCollapse: "separate", borderSpacing: 0 }} className="material_mfg">
                    <Thead bg="gray.100">
                        <Tr>
                            <Th>Particulars (Ledger)</Th>
                            <Th isNumeric padding={0}>Current Balance</Th>
                            <Th isNumeric>Amount</Th>
                            <Th>Transaction Type</Th>
                            <Th>Txn/Cheque No.</Th>
                            <Th>Bank Name</Th>
                            {/* <Th>Bill Refs</Th> */}
                            <Th>Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {formData.entries.map((entry, index) => (
                            <Tr key={index}>
                                {/* LEDGER */}
                                <Td minW="170px">
                                    <Select
                                        value={entry.ledger_id}
                                        onChange={(e) => handleLedgerSelect(index, e.target.value)}
                                        placeholder="End Of List" >
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
                                        value={Number(entry.current_balance).toFixed(2)}
                                        readOnly bg="gray.50" w="100px" textAlign="right" />
                                </Td>

                                {/* AMOUNT */}
                                <Td>
                                    <Input type="number" min={0} value={entry.amount}
                                        onChange={(e) => handleEntryChange(index, "amount", e.target.value)} w="100px" />
                                </Td>

                                {/* TRANSACTION TYPE — opening bill modal on change */}
                                <Td minW="160px">
                                    <Select
                                        value={entry.transaction_type}
                                        onClick={() => handleTransactionTypeClick(index)}
                                        onChange={(e) => handleEntryChange(index, "transaction_type", e.target.value)}
                                        isDisabled={!entry.ledger_id}
                                        placeholder="Please select"
                                        minW="120px" >
                                        <option value="Cash">Cash</option>
                                        <option value="Cheque/DD">Cheque/DD</option>
                                        <option value="E-Fund Transfer">E-Fund Transfer</option>
                                        <option value="Others">Others</option>
                                    </Select>
                                </Td>

                                {/* TRANSACTION NO */}
                                <Td>
                                    <Input
                                        value={entry.transaction_no}
                                        onChange={(e) => handleEntryChange(index, "transaction_no", e.target.value)}
                                        w="120px" />
                                </Td>

                                {/* BANK NAME */}
                                <Td>
                                    <Select
                                        value={entry.bank_name}
                                        onChange={(e) => handleEntryChange(index, "bank_name", e.target.value)}
                                        placeholder="Select Bank"
                                        w="180px" >
                                        {account.map((item) => (<option key={item.id} value={item.ledger_name} > {item.ledger_name} </option>))}
                                    </Select>
                                </Td>

                                {/* BILL REFS INDICATOR */}
                                {/* <Td textAlign="center">
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
                                </Td> */}

                                {/* ADD / REMOVE */}
                                <Td>
                                    <Flex gap={2}>
                                        <Button size="sm" colorScheme="green" onClick={addEntryRow} > + </Button>
                                        {formData.entries.length > 1 && (
                                            <Button size="sm" colorScheme="red" onClick={() => removeEntryRow(index)} > − </Button>
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
                    <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} p={1} />
                </FormControl>
            </Box>

            {/* ── NARRATION ── */}
            <FormControl>
                <FormLabel>Total Amount</FormLabel>
                <Input value={formData.total_amount.toFixed(2)} readOnly bg="gray.50" fontWeight="semibold" />
            </FormControl>
            <Box mb={5}>
                <FormControl>
                    <FormLabel>Narration</FormLabel>
                    <Textarea name="narration" value={formData.narration} onChange={handleChange} />
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
                    loadingText="Saving…">
                    Save Payment
                </Button>
            </Flex>

            {/* ── BILL WISE MODAL ── */}
            <Modal
                isOpen={billModal}
                onClose={() => setBillModal(false)}
                size="5xl"
                scrollBehavior="inside" >
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
                                        <Text fontWeight="semibold"
                                            color={billDiff === 0 ? "green.600" : billDiff < 0 ? "red.600" : "orange.600"} >
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
                                                        <Select size="sm" value={bill.reference_type}
                                                            onChange={(e) => handleBillReferenceChange(rowIndex, "reference_type", e.target.value,)} >
                                                            <option value="AGST REF">Agst Ref</option>
                                                            <option value="ADVANCE">Advance</option>
                                                            <option value="NEW REF">New Ref</option>
                                                            <option value="ON ACCOUNT">On Account</option>
                                                        </Select>
                                                    </Td>

                                                    {/* REFERENCE NO / NAME */}
                                                    <Td minW="220px">
                                                        {bill.reference_type === "ON ACCOUNT" || bill.reference_type === "ADVANCE" ? (
                                                            /* free-text for On Account / Advance */
                                                            <Input size="sm"
                                                                placeholder={bill.reference_type === "ON ACCOUNT" ? "On Account ref…" : "Advance ref…"}
                                                                value={bill.reference_no}
                                                                onChange={(e) => handleBillReferenceChange(rowIndex, "reference_no", e.target.value,)} />
                                                        ) : bill.reference_type === "NEW REF" ? (
                                                            /* free-text for New Ref */
                                                            <Input size="sm" placeholder="New reference no…"
                                                                value={bill.reference_no}
                                                                onChange={(e) => handleBillReferenceChange(rowIndex, "reference_no", e.target.value,)} />
                                                        ) : (
                                                            /* AGST REF — dropdown of pending bills */

                                                            // <Select size="sm"
                                                            //     value={bill.purchase_bill_reference_id || ""}
                                                            //     onChange={(e) => {
                                                            //         const selectedId = e.target.value;
                                                            //         const matchedBill = billReferenceOptions.find( (b) => String(b.id) === String(selectedId) );

                                                            //         setBillReferenceData((prev) => {
                                                            //             const updated = [...prev];
                                                            //             updated[rowIndex] = {
                                                            //                 ...updated[rowIndex],
                                                            //                 purchase_bill_reference_id: matchedBill ? matchedBill.id : null,
                                                            //                 reference_no: matchedBill ? matchedBill.reference_no : "",
                                                            //                 reference_amount:
                                                            //                     Number(matchedBill?.pending_amount || 0),
                                                            //                 due_date: matchedBill?.due_date ?? updated[rowIndex].due_date,
                                                            //             };
                                                            //             return updated;
                                                            //         });
                                                            //     }} >
                                                            //     <option value="">-- Select --</option>
                                                            //     {billReferenceOptions.map((b) => (
                                                            //         <option key={b.id} value={b.id}>
                                                            //             {b.reference_no}
                                                            //             {b.purchase_date ? ` | ${b.purchase_date.slice(0, 10)}` : ""}
                                                            //             {b.pending_amount ? ` | ${Number(b.pending_amount).toFixed(2)} Dr` : ""}
                                                            //         </option>
                                                            //     ))}
                                                            // </Select>
                                                            <Select
                                                                size="sm"
                                                                value={bill.purchase_bill_reference_id || ""}
                                                                onChange={(e) => {
                                                                    const selectedId = e.target.value;
                                                                    const matchedBill = billReferenceOptions.find(
                                                                        (b) => String(b.id) === String(selectedId)
                                                                    );
                                                                    const outsideAmount = formData.entries[selectedEntryIndex]?.amount || 0;

                                                                    setBillReferenceData((prev) => {
                                                                        const updated = [...prev];
                                                                        updated[rowIndex] = {
                                                                            ...updated[rowIndex],
                                                                            purchase_bill_reference_id: matchedBill ? matchedBill.id : null,
                                                                            reference_no: matchedBill ? matchedBill.reference_no : "",
                                                                            due_date: matchedBill?.due_date ?? updated[rowIndex].due_date,
                                                                        };
                                                                        // amount is now computed by the waterfall, not copied from pending_amount directly
                                                                        return applyWaterfallAllocation(updated, outsideAmount);
                                                                    });
                                                                }} >
                                                                <option value="">-- Select --</option>
                                                                {billReferenceOptions.map((b) => (
                                                                    <option key={b.id} value={b.id}>
                                                                        {b.reference_no}
                                                                        {b.purchase_date ? ` | ${b.purchase_date.slice(0, 10)}` : ""}
                                                                        {b.pending_amount ? ` | ${Number(b.pending_amount).toFixed(2)} Dr` : ""}
                                                                    </option>
                                                                ))}
                                                            </Select>
                                                        )}
                                                    </Td>

                                                    {/* DUE DATE */}
                                                    <Td minW="140px">
                                                        <Input size="sm" type="date" value={bill.due_date || ""} onChange={(e) => handleBillReferenceChange(rowIndex, "due_date", e.target.value,)} />
                                                    </Td>

                                                    <Td>
                                                        {/* <Input size="sm" type="number" min={0} value={bill.reference_amount} onChange={(e) => handleBillReferenceChange(rowIndex, "reference_amount", e.target.value,)} w="100px" textAlign="right" /> */}
                                                        <Input size="sm" type="number" min={0}
                                                            value={bill.reference_amount}
                                                            isReadOnly={bill.reference_type === "AGST REF"}
                                                            bg={bill.reference_type === "AGST REF" ? "gray.50" : "white"}
                                                            onChange={(e) => handleBillReferenceChange(rowIndex, "reference_amount", e.target.value)}
                                                            w="100px" textAlign="right" />
                                                    </Td>

                                                    {/* DR/CR */}
                                                    <Td> <Input size="sm" value={bill.dr_cr || "Dr"} readOnly w="50px" bg="gray.50" /> </Td>

                                                    {/* DELETE */}
                                                    <Td textAlign="center">
                                                        <Button size="xs" colorScheme="red" variant="outline" onClick={() => removeBillRow(rowIndex)} > ✕ </Button>
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

                    <ModalFooter gap={3} flexDirection="column" alignItems="stretch">
                        {billModalError && ( <Text color="red.500" fontSize="sm" mb={2} textAlign="right"> {billModalError} </Text> )}
                        <Flex justify="flex-end" gap={3}>
                            <Button variant="outline" onClick={() => setBillModal(false)}> Cancel </Button>
                            <Button colorScheme="blue" onClick={saveBillAllocation} isDisabled={isSaveDisabled} > Save </Button>
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default PaymentTransaction;