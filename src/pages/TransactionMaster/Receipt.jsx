import React, { useContext, useEffect, useState } from "react";
import {
    Box, Text, Grid, GridItem, FormControl, FormLabel, Input, Select,
    Textarea, Table, Thead, Tbody, Tr, Th, Td, Button, Flex,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
    ModalBody, ModalFooter, Badge, Spinner, useToast, HStack,
} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import useUsersapi from "../../Apis/GetUsersapi";
import { AuthContext } from "../../context/AuthContext";

// ─── helpers ──────────────────────────────────────────────────────────────────

const emptyEntry = () => ({
    ledger_id: "",
    current_balance: 0,
    amount: "",
    transaction_type: "",
    transaction_no: "",
    bank_name: "",
    bill_references: [],
    maintain_bill_by_bill: 0,
});

const emptyForm = () => ({
    voucher_no: "",
    receipt_date: "",
    account_ledger_id: "",
    employee_under_id: "",
    current_balance: 0,
    total_amount: 0,
    narration: "",
    attachment: null,
    entries: [emptyEntry()],
});

// ─── component ────────────────────────────────────────────────────────────────

const Receipt = () => {
    const { users } = useUsersapi();
    const toast = useToast();

    const [ledger, setLedger] = useState([]);
    const [account, setAccount] = useState([]);
    const [formData, setFormData] = useState(emptyForm());
    const [voucherTypeId, setVoucherTypeId] = useState(null);

    // bill modal state
    const [billModal, setBillModal] = useState(false);
    const [billLoading, setBillLoading] = useState(false);
    const [selectedEntryIndex, setSelectedEntryIndex] = useState(null);
    const [billReferenceData, setBillReferenceData] = useState([]);

    const [submitting, setSubmitting] = useState(false);
    const [pendingBills, setPendingBills] = useState([]);
    const {auth} = useContext(AuthContext)
    console.log("userID: " ,auth?.user?.id)
    const userID = auth?.user?.id

    // ── boot ────────────────────────────────────────────────────────────────────

    useEffect(() => {
        fetchLedgerDropdownList();
        fetchBankGroupLedger();
        loadVoucherNo();
    }, []);

    // keep total in sync whenever entries change
    useEffect(() => {
        const total = formData.entries.reduce(
            (sum, e) => sum + Number(e.amount || 0),
            0
        );
        setFormData((prev) => ({ ...prev, total_amount: total }));
    }, [formData.entries]);

    // ── data loaders ────────────────────────────────────────────────────────────

    const loadVoucherNo = async () => {
        try {
            const res = await API.get(
                `${API_ENDPOINTS.GET_NEXTVOUCHER_NO}?voucher_type=RECEIPT`
            );
            setVoucherTypeId(res.data.voucher_type_id);
            setFormData((prev) => ({ ...prev, voucher_no: res.data.voucher_no }));
        } catch (err) {
            console.error("loadVoucherNo error:", err);
        }
    };

    const fetchBankGroupLedger = async () => {
        try {
            const res = await API.get(API_ENDPOINTS.GET_BANK_ACCOUNT_LEDGER_DROPDOWN);
            if (res.status === 200) setAccount(res.data.data);
        } catch (err) {
            console.error("Error fetching account ledgers", err);
        }
    };

    const fetchLedgerDropdownList = async () => {
        try {
            const res = await API.get(API_ENDPOINTS.GET_LEDGER_DROPDOWN);
            if (res.status === 200) setLedger(res.data.data);
        } catch (err) {
            console.error("Error fetching ledgers", err);
        }
    };

    // ── form field helpers ───────────────────────────────────────────────────────

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, attachment: e.target.files[0] || null }));
    };

    // const handleEntryChange = (index, field, value) => {
    //     setFormData((prev) => {
    //         const entries = [...prev.entries];
    //         entries[index] = { ...entries[index], [field]: value };
    //         return { ...prev, entries };
    //     });
    // };
    const handleEntryChange = (index, field, value) => {
    setFormData((prev) => {
        const entries = [...prev.entries];
        entries[index] = {
            ...entries[index],
            [field]: value,
        };

        return { ...prev, entries };
    });

    // Sync amount to bill modal
    // if (
    //     field === "amount" &&
    //     selectedEntryIndex === index &&
    //     billReferenceData.length > 0
    // ) {
    //     setBillReferenceData((prev) => {
    //         const updated = [...prev];

    //         updated[0] = {
    //             ...updated[0],
    //             reference_amount: value,
    //         };

    //         return updated;
    //     });
    // }
};

    // ── account ledger select → fetch balance ────────────────────────────────────

    const handleAccountSelect = async (e) => {
        const ledgerId = e.target.value;
        setFormData((prev) => ({ ...prev, account_ledger_id: ledgerId, current_balance: 0 }));
        if (!ledgerId) return;
        try {
            const res = await API.get(`${API_ENDPOINTS.get_ledger_by_id}/${ledgerId}`);
            if (res.status === 200) {
                const { current_balance, balance_type } = res.data.data;
                const balance =
                    balance_type === "Cr"
                        ? -Math.abs(Number(current_balance))
                        : Math.abs(Number(current_balance));
                setFormData((prev) => ({ ...prev, current_balance: balance }));
            }
        } catch (err) {
            console.error("Error fetching account balance", err);
        }
    };

    // ── particulars ledger select → fetch details + maintain_bill_by_bill ────────

    const handleLedgerSelect = async (index, ledgerId) => {
        // reset this entry first
        setFormData((prev) => {
            const entries = [...prev.entries];
            entries[index] = {
                ...entries[index],
                ledger_id: ledgerId,
                current_balance: 0,
                bill_references: [],
                maintain_bill_by_bill: 0,
                transaction_type: "",
            };
            return { ...prev, entries };
        });

        if (!ledgerId) return;

        try {
            const res = await API.get(`${API_ENDPOINTS.get_ledger_by_id}/${ledgerId}`);
            if (res.status === 200) {
                const { current_balance, balance_type, maintain_bill_by_bill } = res.data.data;
                const balance =
                    balance_type === "Cr"
                        ? -Math.abs(Number(current_balance))
                        : Math.abs(Number(current_balance));

                setFormData((prev) => {
                    const entries = [...prev.entries];
                    entries[index] = {
                        ...entries[index],
                        current_balance: balance,
                        maintain_bill_by_bill: Number(maintain_bill_by_bill ?? 0),
                    };
                    return { ...prev, entries };
                });
            }
        } catch (err) {
            console.error("Error fetching ledger details", err);
        }
    };

    // ── transaction type change → open bill modal only if maintain_bill_by_bill=1 ─

    const handleTransactionTypeChange = (index, value) => {
        setFormData((prev) => {
            const entries = [...prev.entries];
            entries[index] = { ...entries[index], transaction_type: value };
            return { ...prev, entries };
        });

        if (value && formData.entries[index].maintain_bill_by_bill === 1) {
            openBillModal(index, formData.entries[index].ledger_id);
        }
    };

    // ── entry row add / remove ───────────────────────────────────────────────────

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

    // ── bill modal ───────────────────────────────────────────────────────────────

    const openBillModal = async (index, ledgerId) => {
        setBillLoading(true);
        setSelectedEntryIndex(index);
        setBillModal(true);

        try {
            const res = await API.get(`${API_ENDPOINTS.GET_PENDING_BILLS}/${ledgerId}`);
            if (res.status === 200) {
                const serverBills = res.data.data;
                // Store full pending bill objects so we can look up sales_bill_reference_id
                setPendingBills(serverBills);

                const savedRefs = formData.entries[index]?.bill_references ?? [];

                if (savedRefs.length > 0) {
                    // Re-open with previously saved references
                    setBillReferenceData(
                        savedRefs.map((ref) => {
                            // Try to re-attach the pending bill id if it's an AGST REF
                            if (ref.reference_type === "AGST REF" && !ref.sales_bill_reference_id) {
                                const matched = serverBills.find(
                                    (b) => b.reference_no === ref.reference_no
                                );
                                return matched
                                    ? { ...ref, sales_bill_reference_id: matched.id }
                                    : ref;
                            }
                            return ref;
                        })
                    );
                } else {
                    const entryAmount = formData.entries[index]?.amount || "";
                    setBillReferenceData([
                        {
                            reference_type: "AGST REF",
                            reference_no: "",
                            sales_bill_reference_id: null,
                            reference_amount: entryAmount,
                            due_date: "",
                            dr_cr: "Cr",
                        },
                    ]);
                    
                }
            }
        } catch (err) {
            console.error("Error fetching pending bills", err);
            toast({
                title: "Error",
                description: "Failed to load pending bills.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            setBillReferenceData([]);
        } finally {
            setBillLoading(false);
        }
    };

    // ── When AGST REF dropdown changes, auto-fill amount + store sales_bill_reference_id ──

    const handleAgstRefSelect = (rowIndex, selectedReferenceNo) => {
        const matchedBill = pendingBills.find((b) => b.reference_no === selectedReferenceNo);

        setBillReferenceData((prev) => {
            const updated = [...prev];
            updated[rowIndex] = {
    ...updated[rowIndex],
    reference_no: selectedReferenceNo,
    sales_bill_reference_id: matchedBill ? matchedBill.id : null,
    due_date: matchedBill?.due_date ?? updated[rowIndex].due_date,
};
            // updated[rowIndex] = {
            //     ...updated[rowIndex],
            //     reference_no: selectedReferenceNo,
            //     // Store the DB id so controller can call updateSalesBillPendingAmount
            //     sales_bill_reference_id: matchedBill ? matchedBill.id : null,
            //     // Auto-fill pending amount; user can still override
            //     reference_amount: matchedBill ? matchedBill.pending_amount : updated[rowIndex].reference_amount,
            //     due_date: matchedBill?.due_date ?? updated[rowIndex].due_date,
            // };

            // Sync total back to entry amount
            const total = updated.reduce((sum, row) => sum + Number(row.reference_amount || 0), 0);
            setFormData((prevForm) => {
                const entries = [...prevForm.entries];
                entries[selectedEntryIndex] = {
                    ...entries[selectedEntryIndex],
                    amount: total,
                };
                return { ...prevForm, entries };
            });

            return updated;
        });
    };

    const handleBillReferenceChange = (rowIndex, field, value) => {
        setBillReferenceData((prev) => {
            const updated = [...prev];
            updated[rowIndex] = { ...updated[rowIndex], [field]: value };

            // If amount changed, keep entry amount in sync
            if (field === "reference_amount") {
                const total = updated.reduce(
                    (sum, row) => sum + Number(row.reference_amount || 0),
                    0
                );
                setFormData((prevForm) => {
                    const entries = [...prevForm.entries];
                    entries[selectedEntryIndex] = {
                        ...entries[selectedEntryIndex],
                        amount: total,
                    };
                    return { ...prevForm, entries };
                });
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
                sales_bill_reference_id: null,
                reference_amount: 0,
                due_date: "",
                dr_cr: "Cr",
            },
        ]);
    };

    const removeBillRow = (rowIndex) => {
        setBillReferenceData((prev) => {
            const updated = prev.filter((_, i) => i !== rowIndex);

            // Re-sync amount after removal
            const total = updated.reduce((sum, row) => sum + Number(row.reference_amount || 0), 0);
            setFormData((prevForm) => {
                const entries = [...prevForm.entries];
                entries[selectedEntryIndex] = {
                    ...entries[selectedEntryIndex],
                    amount: total,
                };
                return { ...prevForm, entries };
            });

            return updated;
        });
    };

    const saveBillAllocation = () => {
        // Strip internal-only helper keys before saving
        const cleaned = billReferenceData.map(
            ({ _pending_amount, _bill_date, ...rest }) => rest
        );

        const totalAllocated = cleaned.reduce(
            (sum, row) => sum + Number(row.reference_amount || 0),
            0
        );

        setFormData((prev) => {
            const entries = [...prev.entries];
            entries[selectedEntryIndex] = {
                ...entries[selectedEntryIndex],
                amount: totalAllocated,
                bill_references: cleaned,
            };
            return { ...prev, entries };
        });

        setBillModal(false);
    };

    // ── submission ───────────────────────────────────────────────────────────────

    const handleSave = async () => {
        if (!formData.receipt_date) {
            toast({ title: "Date is required", status: "warning", duration: 2500 });
            return;
        }
        if (!formData.account_ledger_id) {
            toast({ title: "Account is required", status: "warning", duration: 2500 });
            return;
        }
        if (formData.entries.some((e) => !e.ledger_id || !e.amount || !e.transaction_type)) {
            toast({
                title: "Each entry must have a ledger, amount and transaction type",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        try {
            setSubmitting(true);

            // ── Build FormData so the attachment file is sent correctly ──
            const fd = new FormData();

            fd.append("voucher_type_id", voucherTypeId);
            fd.append("voucher_no", formData.voucher_no);
            fd.append("receipt_date", formData.receipt_date);
            fd.append("account_ledger_id", formData.account_ledger_id);
            fd.append("employee_under_id", formData.employee_under_id || "");
            fd.append("total_amount", formData.total_amount);
            fd.append("narration", formData.narration || "");

            // created_by — pulled from localStorage / your auth store; adjust as needed
            // const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
            fd.append("created_by", userID || "");

            // Entries — serialise to JSON string (backend does JSON.parse)
            // Ensure sales_bill_reference_id is included for AGST REF rows so the
            // controller can call updateSalesBillPendingAmount correctly.
            fd.append(
                "entries",
                JSON.stringify(
                    formData.entries.map((e) => ({
                        ledger_id: e.ledger_id,
                        amount: Number(e.amount),
                        transaction_type: e.transaction_type,
                        transaction_no: e.transaction_no || null,
                        bank_name: e.bank_name || null,
                        bill_references: (e.bill_references || []).map((br) => ({
                            reference_type: br.reference_type,
                            reference_no: br.reference_no || null,
                            reference_amount: Number(br.reference_amount || 0),
                            due_date: br.due_date || null,
                            dr_cr: br.dr_cr || "Cr",
                            // Critical: backend needs this to deduct pending_amount
                            sales_bill_reference_id: br.sales_bill_reference_id || null,
                        })),
                    }))
                )
            );

            // Attachment — only append when a file was actually chosen
            if (formData.attachment) {
                fd.append("attachment", formData.attachment);
            }

            const res = await API.post(API_ENDPOINTS.CREATE_RECEIPT, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.status === 201) {
                toast({
                    title: "Receipt Created Successfully",
                    description: `Voucher No: ${res.data.voucher_no || formData.voucher_no}`,
                    status: "success",
                    duration: 4000,
                    isClosable: true,
                });
                setFormData(emptyForm());
                await loadVoucherNo();
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

    // ── derived ──────────────────────────────────────────────────────────────────

    const billModalTotal = billReferenceData.reduce(
        (sum, b) => sum + Number(b.reference_amount || 0),
        0
    );
    const entryAmount =
        selectedEntryIndex !== null
            ? Number(formData.entries[selectedEntryIndex]?.amount || 0)
            : 0;
    const billDiff = entryAmount - billModalTotal;

    // ── render ───────────────────────────────────────────────────────────────────

    const inputStyle = {
    size: "sm",
    borderRadius: "6px",
    borderColor: "#c8d0d8",
    bg: "white",
    fontSize: "12px",
    height: "40px",
    _focus: { borderColor: "#3d7a52", boxShadow: "0 0 0 1px #3d7a52" },
};

const readonlyInputStyle = { ...inputStyle, bg: "#f0f4f0", color: "#555" };

const thStyle = {
    borderColor: "#c8d8cc",
    p: "6px 4px",
    fontWeight: "700",
    letterSpacing: "0.3px",
    whiteSpace: "nowrap",
};

    return (
        <Box p={5}>
            {/* ── PAGE TITLE ── */}
            <Text fontSize="xl" fontWeight="bold" mb={5} color="#2d2d2d">
                Receipt Voucher
            </Text>

            {/* ── TOP FORM ── */}
            <Grid templateColumns="repeat(2, 1fr)" gap={5} mb={6}>
                <GridItem>
                    <FormControl>
                        <FormLabel>Receipt No.</FormLabel>
                        <Input {...readonlyInputStyle}
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
                        <Input {...inputStyle}
                            type="date"
                            name="receipt_date"
                            value={formData.receipt_date}
                            onChange={handleChange}
                        />
                    </FormControl>
                </GridItem>

                <GridItem>
                    <FormControl isRequired>
                        <FormLabel>Account</FormLabel>
                        <Select {...inputStyle}
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
                        <Select {...inputStyle}
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
                        <Input {...readonlyInputStyle}
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
                <Table
                    variant="simple"
                    size="sm"
                    style={{ borderCollapse: "separate", borderSpacing: 0 }}
                    className="material_mfg"
                >
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
                                {/* PARTICULARS LEDGER */}
                                <Td minW="170px">
                                    <Select {...inputStyle}
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
                                        size="sm" {...readonlyInputStyle}
                                        value={Number(entry.current_balance).toFixed(2)}
                                        readOnly
                                        bg="gray.50"
                                        w="90px"
                                        textAlign="right"
                                    />
                                </Td>

                                {/* AMOUNT */}
                                <Td>
                                    <Input {...inputStyle}
                                        size="sm"
                                        type="number"
                                        min={0}
                                        value={entry.amount}
                                        onChange={(e) =>
                                            handleEntryChange(index, "amount", e.target.value)
                                        }
                                        w="90px"
                                    />
                                </Td>

                                {/* TRANSACTION TYPE */}
                                <Td minW="150px">
                                    <Select {...inputStyle}
                                        size="sm"
                                        value={entry.transaction_type}
                                        onChange={(e) =>
                                            handleTransactionTypeChange(index, e.target.value)
                                        }
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

                                {/* TXN / CHEQUE NO */}
                                <Td>
                                    <Input {...inputStyle}
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
                                    <Select {...inputStyle}
                                        size="sm"
                                        value={entry.bank_name}
                                        onChange={(e) =>
                                            handleEntryChange(index, "bank_name", e.target.value)
                                        }
                                        placeholder="Select Bank"
                                        w="180px"
                                    >
                                        {account.map((item) => (
                                            <option key={item.id} value={item.ledger_name}>
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
                                                entry.ledger_id && openBillModal(index, entry.ledger_id)
                                            }
                                        >
                                            {entry.bill_references.length} ref
                                            {entry.bill_references.length > 1 ? "s" : ""}
                                        </Badge>
                                    ) : (
                                        <Button
                                            size="xs"
                                            variant="outline"
                                            isDisabled={
                                                !entry.ledger_id || entry.maintain_bill_by_bill !== 1
                                            }
                                            onClick={() =>
                                                entry.ledger_id && openBillModal(index, entry.ledger_id)
                                            }
                                        >
                                            Bill
                                        </Button>
                                    )}
                                </Td>

                                {/* ADD / REMOVE */}
                                <Td>
                                    <Flex gap={2}>
                                        <Button size="sm" padding="0px" colorScheme="green" onClick={addEntryRow}>
                                            +
                                        </Button>
                                        {formData.entries.length > 1 && (
                                            <Button padding={0}
                                                size="sm"
                                                colorScheme="red"
                                                onClick={() => removeEntryRow(index)}
                                            >
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

            {/* ── UPLOAD ── */}
            <Box mb={5}>
                <FormControl>
                    <FormLabel>Upload Document</FormLabel>
                    <Input {...inputStyle}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        p={1}
                    />
                </FormControl>
            </Box>

            {/* ── TOTAL AMOUNT ── */}
            <FormControl mb={3}>
                <FormLabel>Total Amount</FormLabel>
                <Input {...readonlyInputStyle}
                    value={formData.total_amount.toFixed(2)}
                    readOnly
                    bg="gray.50"
                    fontWeight="semibold"
                />
            </FormControl>

            {/* ── NARRATION ── */}
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
                    bg="#237086"
                    fontWeight="500"
                    fontSize="14px"
                    color="white"
                    _hover={{ bg: "#1B5A6B" }}
                    px={8}
                    borderRadius="12px"
                    onClick={handleSave}
                    isLoading={submitting}
                    loadingText="Saving…"
                >
                    Save Receipt
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
                <ModalContent borderRadius="12px">
                    <ModalHeader
                        bg="#b0d1cf"
                        borderRadius="12px 12px 0px 0px"
                        padding="21px"
                    >
                        <HStack gap={0}>
                            <Text fontSize="16px">Bill Wise Details</Text>
                            {selectedEntryIndex !== null &&
                                formData.entries[selectedEntryIndex]?.ledger_id && (
                                    <Text
                                        as="span"
                                        fontWeight="normal"
                                        fontSize="13px"
                                        ml={2}
                                        color="gray.600"
                                    >
                                        —{" "}
                                        {
                                            ledger.find(
                                                (l) =>
                                                    String(l.id) ===
                                                    String(
                                                        formData.entries[selectedEntryIndex].ledger_id
                                                    )
                                            )?.ledger_name
                                        }
                                    </Text>
                                )}
                        </HStack>
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
                                <Flex
                                    gap={6}
                                    mb={4}
                                    p={3}
                                    bg="gray.50"
                                    borderRadius="md"
                                    fontSize="sm"
                                >
                                    <Box>
                                        <Text color="gray.500">Entry Amount</Text>
                                        <Text fontWeight="semibold">{entryAmount.toFixed(2)}</Text>
                                    </Box>
                                    <Box>
                                        <Text color="gray.500">Allocated</Text>
                                        <Text fontWeight="semibold">
                                            {billModalTotal.toFixed(2)}
                                        </Text>
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
                                                                    e.target.value
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
                                                            /* AGST REF — dropdown of pending bills
                                                               On select: auto-fills amount + stores sales_bill_reference_id */
                                                            <Select
                                                                size="sm"
                                                                value={bill.reference_no}
                                                                onChange={(e) =>
                                                                    handleAgstRefSelect(rowIndex, e.target.value)
                                                                }
                                                            >
                                                                <option value="">-- Select --</option>
                                                                {pendingBills.map((pb) => (
                                                                    <option
                                                                        key={pb.id}
                                                                        value={pb.reference_no}
                                                                    >
                                                                        {pb.reference_no} — {pb.pending_amount} Cr
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
                                                    <Td>
                                                        <Input
                                                            size="sm"
                                                            type="number"
                                                            min={0}
                                                            value={bill.reference_amount}
                                                            onChange={(e) =>
                                                                handleBillReferenceChange(
                                                                    rowIndex,
                                                                    "reference_amount",
                                                                    e.target.value
                                                                )
                                                            }
                                                            w="100px"
                                                            textAlign="right"
                                                        />
                                                    </Td>

                                                    {/* DR/CR — always Cr for receipts */}
                                                    <Td>
                                                        <Input
                                                            size="sm" {...readonlyInputStyle}
                                                            value={bill.dr_cr || "Cr"}
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

                                                    {/* ADD — only on last row */}
                                                    <Td textAlign="center">
                                                        {rowIndex === billReferenceData.length - 1 && (
                                                            <Button size="xs" colorScheme="green" onClick={addBillRow}>
                                                                +
                                                            </Button>
                                                        )}
                                                    </Td>
                                                </Tr>
                                            ))}

                                            {billReferenceData.length === 0 && (
                                                <Tr>
                                                    <Td colSpan={7} textAlign="center" color="gray.400" py={6}>
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
                        <Button colorScheme="blue" onClick={saveBillAllocation}>
                            Save
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Receipt;