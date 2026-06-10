import React, { useContext, useEffect, useState } from "react";
import {
    Box, Text, Grid, GridItem, FormControl, FormLabel, Input, Select,
    Textarea, Table, Thead, Tbody, Tr, Th, Td, Button, Flex,
    useToast,
} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import useUsersapi from "../../Apis/GetUsersapi";
import { AuthContext } from "../../context/AuthContext";
import { fetchNextVoucherNo } from "../../Apis/commanApi";

// ─── helpers ──────────────────────────────────────────────────────────────────

const emptyEntry = () => ({
    ledger_id: "",
    current_balance: 0,
    balance_type: "Dr",
    amount: "",
    transaction_type: "",
    bank_name: "",
});

const emptyForm = () => ({
    voucher_no: "",
    contra_date: new Date().toISOString().split("T")[0],
    account_ledger_id: "",
    employee_under_id: "",
    current_balance: 0,
    balance_type: "Dr",
    narration: "",
    entries: [emptyEntry()],
});

// ─── styles ───────────────────────────────────────────────────────────────────

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

// ─── component ────────────────────────────────────────────────────────────────

const Contra = () => {
    const { users } = useUsersapi();
    const toast = useToast();
    const { auth } = useContext(AuthContext);

    const [formData, setFormData] = useState(emptyForm());
    const [voucherTypeId, setVoucherTypeId] = useState(null);
    const [bankLedger, setBankLedger] = useState([]);   // for Account dropdown (Bank/Cash)
    const [submitting, setSubmitting] = useState(false);

    const sectionStyle = {
  bg: "white",
  border: "1px solid #d0d7de",
  borderRadius: "6px",
  p: 0,
  mb: 3,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

    // ── boot ──────────────────────────────────────────────────────────────────



    // keep total in sync whenever entries change
    const totalAmount = formData.entries.reduce(
        (sum, e) => sum + Number(e.amount || 0),
        0
    );

const loadVoucherNo = async () => {
    try {
        const voucherData = await fetchNextVoucherNo("CONTRA");

        if (voucherData) {
            setVoucherTypeId(voucherData.voucher_type_id);

            setFormData((prev) => ({
                ...prev,
                voucher_no: voucherData.voucher_no,
            }));
        }
    } catch (err) {
        toast({
            title: "Voucher Error",
            description:
                err?.response?.data?.message || err.message,
            status: "error",
            duration: 3000,
            isClosable: true,
        });
    }
};

    // ── data loaders ─────────────────────────────────────────────────────────

   const fetchInitialData = async () => {
    try {
        const res = await API.get(
            API_ENDPOINTS.GET_BANK_ACCOUNT_LEDGER_DROPDOWN
        );

        if (res.status === 200) {
            setBankLedger(res.data.data || []);
        }
    } catch (error) {
        toast({
            title: "Error loading ledgers",
            description:
                error?.response?.data?.message || error.message,
            status: "error",
            duration: 3000,
            isClosable: true,
        });
    }
};

useEffect(() => {
    loadVoucherNo();
    fetchInitialData();
}, []);

    // ── field helpers ─────────────────────────────────────────────────────────

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Account ledger select → fetch balance
    const handleAccountSelect = async (e) => {
        const ledgerId = e.target.value;
        setFormData((prev) => ({
            ...prev,
            account_ledger_id: ledgerId,
            current_balance: 0,
            balance_type: "Dr",
        }));
        if (!ledgerId) return;
        try {
            const res = await API.get(`${API_ENDPOINTS.get_ledger_by_id}/${ledgerId}`);
            if (res.status === 200) {
                const { current_balance, balance_type } = res.data.data;
                setFormData((prev) => ({
                    ...prev,
                    current_balance: Number(current_balance || 0),
                    balance_type: balance_type || "Dr",
                }));
            }
        } catch (err) {
            console.error("Error fetching account balance:", err);
        }
    };

    // Particulars ledger select → fetch balance for entry row
    const handleLedgerSelect = async (index, ledgerId) => {
        setFormData((prev) => {
            const entries = [...prev.entries];
            entries[index] = {
                ...entries[index],
                ledger_id: ledgerId,
                current_balance: 0,
                balance_type: "Dr",
            };
            return { ...prev, entries };
        });

        if (!ledgerId) return;

        try {
            const res = await API.get(`${API_ENDPOINTS.get_ledger_by_id}/${ledgerId}`);
            if (res.status === 200) {
                const { current_balance, balance_type } = res.data.data;
                setFormData((prev) => {
                    const entries = [...prev.entries];
                    entries[index] = {
                        ...entries[index],
                        current_balance: Number(current_balance || 0),
                        balance_type: balance_type || "Dr",
                    };
                    return { ...prev, entries };
                });
            }
        } catch (err) {
            console.error("Error fetching ledger balance:", err);
        }
    };

    const handleEntryChange = (index, field, value) => {
        setFormData((prev) => {
            const entries = [...prev.entries];
            entries[index] = { ...entries[index], [field]: value };
            return { ...prev, entries };
        });
    };

    // ── row add / remove ──────────────────────────────────────────────────────

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

    // ── validation ────────────────────────────────────────────────────────────

    const validate = () => {
        if (!formData.contra_date) {
            toast({ title: "Date is required", status: "warning", duration: 2500 });
            return false;
        }
        if (!formData.account_ledger_id) {
            toast({ title: "Account is required", status: "warning", duration: 2500 });
            return false;
        }
        const hasInvalidEntry = formData.entries.some(
            (e) => !e.ledger_id || !e.amount || Number(e.amount) <= 0
        );
        if (hasInvalidEntry) {
            toast({
                title: "Each entry must have a Particulars ledger and a valid Amount",
                status: "warning",
                duration: 3000,
            });
            return false;
        }

        const sameLedgerSelected = formData.entries.some(
    (e) =>
        String(e.ledger_id) === String(formData.account_ledger_id)
);

if (sameLedgerSelected) {
    toast({
        title: "Invalid Contra Entry",
        description:
            "Particulars ledger cannot be the same as Account ledger",
        status: "warning",
        duration: 3000,
        isClosable: true,
    });

    return false;
}
        return true;
    };

    // ── submission ────────────────────────────────────────────────────────────

    const handleSave = async () => {
        if (!validate()) return;

        try {
            setSubmitting(true);

            const payload = {
                voucher_type_id: voucherTypeId,
                voucher_no: formData.voucher_no,
                contra_date: formData.contra_date,
                account_ledger_id: formData.account_ledger_id,
                employee_under_id: formData.employee_under_id || null,
                narration: formData.narration || null,
                created_by: auth?.user?.id || null,
                entries: formData.entries
                    .filter((e) => e.ledger_id && Number(e.amount) > 0)
                    .map((e) => ({
                        ledger_id: e.ledger_id,
                        amount: Number(e.amount),
                        transaction_type: e.transaction_type || "BANK_TRANSFER",
                        bank_name: e.bank_name || null,
                    })),
            };

            const res = await API.post(API_ENDPOINTS.CREATE_CONTRA, payload);

            if (res.status === 201) {
                toast({
                    title: "Contra Saved Successfully",
                    description: `Voucher No: ${res.data.voucher_no || formData.voucher_no}`,
                    status: "success",
                    duration: 4000,
                    isClosable: true,
                });

                // Reset form and reload voucher no
                setFormData(emptyForm());
                await fetchInitialData();
            }
        } catch (error) {
            console.error("Contra save error:", error);
            toast({
                title: "Error saving Contra",
                description:
                    error?.response?.data?.message || error.message || "Something went wrong",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setSubmitting(false);
        }
    };

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <Box p={5}>
            {/* PAGE TITLE */}


            {/* CARD WRAPPER */}
            <Box
             
            >
                {/* SECTION HEADER */}
               

                {/* TOP FIELDS */}
                <Grid templateColumns="repeat(2, 1fr)" gap={5} mb={6}>
                    {/* Contra No */}
                    <GridItem>
                        <FormControl>
                            <FormLabel fontSize="13px" color="#c0392b" fontWeight="semibold">
                                Contra No.
                            </FormLabel>
                            <Input
                                {...readonlyInputStyle}
                                value={formData.voucher_no || ""}
                                readOnly
                                fontWeight="semibold"
                            />
                        </FormControl>
                    </GridItem>

                    {/* Date */}
                    <GridItem>
                        <FormControl isRequired>
                            <FormLabel fontSize="13px">
                                Date{" "}
                              
                            </FormLabel>
                            <Input
                                {...inputStyle}
                                type="date"
                                name="contra_date"
                                value={formData.contra_date}
                                onChange={handleChange}
                            />
                        </FormControl>
                    </GridItem>

                    {/* Account */}
                    <GridItem>
                        <FormControl>
                            <FormLabel fontSize="13px">Account</FormLabel>
                            <Select
                                {...inputStyle}
                                name="account_ledger_id"
                                value={formData.account_ledger_id}
                                onChange={handleAccountSelect}
                                placeholder="--Please Select--"
                            >
                                {bankLedger.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.ledger_name}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </GridItem>

                    {/* Employee Under */}
                    <GridItem>
                        <FormControl>
                            <FormLabel fontSize="13px">Employee Under</FormLabel>
                            <Select
                                {...inputStyle}
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

                    {/* Current Balance */}
                    <GridItem>
                        <FormControl>
                            <FormLabel fontSize="13px">Current Balance</FormLabel>
                            <Flex gap={2} align="center">
                                <Input
                                    {...readonlyInputStyle}
                                    value={Number(formData.current_balance || 0).toFixed(0)}
                                    readOnly
                                    fontWeight="semibold"
                                    w="160px"
                                />
                                <Text fontSize="13px" color="#555" fontWeight="semibold">
                                    {formData.balance_type || "Dr"}
                                </Text>
                            </Flex>
                        </FormControl>
                    </GridItem>
                </Grid>

                {/* ENTRIES TABLE */}
       <Box {...sectionStyle} overflowX="auto">
                      <Flex justify="space-between" align="center" bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">
                          <Text fontWeight="500" fontSize="sm" >
                              Transaction
                          </Text>
                      </Flex>
                    <Table
                        variant="simple"
                        size="sm"
                        style={{ borderCollapse: "separate", borderSpacing: 0 }}
                    >
                        <Thead bg="gray.100">
                            <Tr>
                                <Th fontSize="12px" borderColor="#dde3e9">
                                    Particulars
                                </Th>
                                <Th fontSize="12px" borderColor="#dde3e9">
                                    Current Balance
                                </Th>
                                <Th fontSize="12px" borderColor="#dde3e9" isNumeric>
                                    Amount
                                </Th>
                                <Th fontSize="12px" borderColor="#dde3e9">
                                    Transaction Type
                                </Th>
                                <Th fontSize="12px" borderColor="#dde3e9">
                                    Bank Name
                                </Th>
                                <Th fontSize="12px" borderColor="#dde3e9">
                                    Action
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {formData.entries.map((entry, index) => (
                                <Tr key={index}>
                                    {/* PARTICULARS */}
                                    <Td minW="180px" borderColor="#dde3e9">
                                        <Select
                                            {...inputStyle}
                                            size="sm"
                                            value={entry.ledger_id}
                                            onChange={(e) =>
                                                handleLedgerSelect(index, e.target.value)
                                            }
                                            placeholder="End Of List"
                                        >
                                            {bankLedger.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.ledger_name}
                                                </option>
                                            ))}
                                        </Select>
                                    </Td>

                                    {/* CURRENT BALANCE */}
                                    <Td borderColor="#dde3e9" minW="130px">
                                        <Flex gap={2} align="center">
                                            <Input
                                                {...readonlyInputStyle}
                                                size="sm"
                                                value={Number(entry.current_balance || 0).toFixed(0)}
                                                readOnly
                                                w="100px"
                                                textAlign="right"
                                            />
                                            <Text fontSize="12px" color="#555">
                                                {entry.balance_type || "Dr"}
                                            </Text>
                                        </Flex>
                                    </Td>

                                    {/* AMOUNT */}
                                    <Td borderColor="#dde3e9">
                                        <Input
                                            {...inputStyle}
                                            size="sm"
                                            type="number"
                                            min={0}
                                            value={entry.amount}
                                            onChange={(e) =>
                                                handleEntryChange(index, "amount", e.target.value)
                                            }
                                            w="100px"
                                            textAlign="right"
                                        />
                                    </Td>

                                    {/* TRANSACTION TYPE */}
                                    <Td minW="160px" borderColor="#dde3e9">
                                        <Select
                                            {...inputStyle}
                                            size="sm"
                                            value={entry.transaction_type}
                                            onChange={(e) =>
                                                handleEntryChange(
                                                    index,
                                                    "transaction_type",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Please select"
                                            isDisabled={!entry.ledger_id}
                                        >
                                            <option value="E_FUND_TRANSFER">e-Fund Transfer</option>
                                            <option value="CASH">Cash</option>
                                            <option value="CHEQUE_DD">Cheque/DD</option>
                                            <option value="OTHERS">Others</option>
                                        </Select>
                                    </Td>

                                    {/* BANK NAME */}
                                    <Td minW="160px" borderColor="#dde3e9">
                                        <Select
                                            {...inputStyle}
                                            size="sm"
                                            value={entry.bank_name}
                                            onChange={(e) =>
                                                handleEntryChange(index, "bank_name", e.target.value)
                                            }
                                            placeholder="Please Select"
                                        >
                                            {bankLedger.map((item) => (
                                                <option key={item.id} value={item.ledger_name}>
                                                    {item.ledger_name}
                                                </option>
                                            ))}
                                        </Select>
                                    </Td>

                                    {/* ADD / REMOVE */}
                                    <Td borderColor="#dde3e9">
                                        <Flex gap={2}>
                                            <Button
                                                size="sm"
                                                p={0}
                                                colorScheme="green"
                                                onClick={addEntryRow}
                                            >
                                                +
                                            </Button>
                                            {formData.entries.length > 1 && (
                                                <Button
                                                    size="sm"
                                                    p={0}
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

                {/* TOTAL AMOUNT */}
                <FormControl mb={4} maxW="500px">
                    <FormLabel fontSize="13px">Total Amount</FormLabel>
                    <Input
                        {...readonlyInputStyle}
                        value={totalAmount.toFixed(2)}
                        readOnly
                        fontWeight="semibold"
                    />
                </FormControl>

                {/* NARRATION */}
                <FormControl mb={6}>
                    <FormLabel fontSize="13px">Narration</FormLabel>
                    <Textarea
                        name="narration"
                        value={formData.narration}
                        onChange={handleChange}
                        borderColor="#c8d0d8"
                        fontSize="13px"
                        borderRadius="6px"
                        _focus={{ borderColor: "#3d7a52", boxShadow: "0 0 0 1px #3d7a52" }}
                        rows={3}
                    />
                </FormControl>

                {/* SAVE BUTTON */}
                <Flex justify="flex-end">
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
                        SAVE
                    </Button>
                </Flex>
            </Box>
        </Box>
    );
};

export default Contra;