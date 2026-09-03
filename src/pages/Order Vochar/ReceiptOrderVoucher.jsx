import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Grid,
  GridItem,
  Text,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Flex,
  Textarea,
  useToast,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { AuthContext } from "../../context/AuthContext";

// ── Design tokens (matched to SalesCreate) ──
const sectionStyle = { bg: "white", border: "1px solid #d0d7de", borderRadius: "6px", p: 0, mb: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" };
const sectionHeaderStyle = { bg: "#4f9190", color: "white", px: 4, py: 2, borderTopRadius: "md" };
const labelStyle = { fontSize: "12px", color: "#494949", marginBottom: "3px" };
const inputStyle = { size: "sm", borderRadius: "6px", borderColor: "#c8d0d8", bg: "white", fontSize: "12px", height: "40px", _focus: { borderColor: "#3d7a52", boxShadow: "0 0 0 1px #3d7a52" } };
const readonlyInputStyle = { ...inputStyle, bg: "#f0f4f0", color: "#555" };
const thStyle = { borderColor: "#c8d8cc", p: "6px 4px", fontWeight: "700", letterSpacing: "0.3px", whiteSpace: "nowrap", fontSize: "11px" };
const tdStyle = { p: "2px 3px", borderColor: "#e0e8e2", verticalAlign: "middle" };

const emptyEntry = () => ({
  ledger_id: "",
  employee_under: "",
  current_balance: 0,
  amount: "",
  transaction_type: "",
  bank_name: "",
});

const ReceiptOrderRequest = () => {
  const toast = useToast();
  const { auth } = useContext(AuthContext);
  const userID = auth?.user?.id;

  const [receiptNo, setReceiptNo] = useState("");
  const [ledger, setLedger] = useState([]);
  const [account, setAccount] = useState([]);

  const [accountLedgerId, setAccountLedgerId] = useState("");
  const [entries, setEntries] = useState([emptyEntry()]);
  const [narration, setNarration] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const totalAmount = entries.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // ── boot ────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchLedgerDropdownList();
    fetchBankGroupLedger();
    loadReceiptNo();
    // eslint-disable-next-line
  }, []);

  const loadReceiptNo = async () => {
    try {
      const res = await API.get(
        `${API_ENDPOINTS.GET_NEXT_ORDER_NUMBER}?transaction_type=RECEIPT`
      );
      if (res.data.success) {
        setReceiptNo(res.data.next_order_no);
      }
    } catch (err) {
      console.error("Error fetching next receipt number", err);
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
      const res = await API.get(API_ENDPOINTS.GET_ASSIGNED_LEDGERS_LIST);
      if (res.status === 200) setLedger(res.data.data);
    } catch (err) {
      console.error("Error fetching ledgers", err);
    }
  };

  // ── entry helpers ───────────────────────────────────────────────────────

  const handleAddRow = () => {
    setEntries((prev) => [...prev, emptyEntry()]);
  };

  const handleRemoveRow = (index) => {
    if (index === 0) return;
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEntryChange = (index, field, value) => {
    setEntries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Selecting the particulars ledger → fetch its balance + employee_under
  const handleLedgerSelect = async (index, ledgerId) => {
    const match = ledger.find((l) => String(l.id) === String(ledgerId));

    setEntries((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        ledger_id: ledgerId,
        employee_under: match?.employee_under ?? "",
        current_balance: 0,
      };
      return updated;
    });

    if (!ledgerId) return;

    try {
      const res = await API.get(`${API_ENDPOINTS.get_ledger_by_id}/${ledgerId}`);
      if (res.status === 200) {
        const { current_balance, balance_type } = res.data.data;
        const balance =
          balance_type === "Cr"
            ? -Math.abs(Number(current_balance))
            : Math.abs(Number(current_balance));

        setEntries((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], current_balance: balance };
          return updated;
        });
      }
    } catch (err) {
      console.error("Error fetching ledger details", err);
    }
  };

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0] || null);
  };

  // ── submit ──────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!accountLedgerId) {
      toast({ title: "Account is required", status: "warning", duration: 2500 });
      return;
    }
    if (entries.some((e) => !e.ledger_id || !e.amount || !e.transaction_type)) {
      toast({
        title: "Each entry must have a ledger, amount and transaction type",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    if (!attachment) {
      toast({ title: "Please upload a document before submitting", status: "warning", duration: 2500 });
      return;
    }

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("account_ledger_id", accountLedgerId);
      // Date is captured silently — today's date, not shown as a field
      fd.append("receipt_date", new Date().toISOString().split("T")[0]);
      fd.append("narration", narration || "");
      fd.append("total_amount", totalAmount);

      // employee_under sent top-level, taken from the first entry's ledger
      fd.append("employee_under_id", entries[0]?.employee_under || "");

      fd.append(
        "entries",
        JSON.stringify(
          entries.map((e) => ({
            ledger_id: e.ledger_id,
            amount: Number(e.amount),
            transaction_type: e.transaction_type,
            transaction_no: null,
            bank_name: e.bank_name || null,
            bill_references: [],
          }))
        )
      );

      fd.append("attachment", attachment);

      const res = await API.post(
        API_ENDPOINTS.CREATE_RECEIPT_APPROVAL_REQUEST,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        toast({
          title: "Receipt request submitted for approval",
          description: `Receipt No: ${res.data.order_no || receiptNo}`,
          status: "success",
          duration: 4000,
          isClosable: true,
        });

        // reset form
        setAccountLedgerId("");
        setEntries([emptyEntry()]);
        setNarration("");
        setAttachment(null);
        await loadReceiptNo();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Something went wrong",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      {/* Section 1: Receipt Details */}
      <Box {...sectionStyle}>
        <Box {...sectionHeaderStyle}>
          <Text fontWeight="500" fontSize="sm">Receipt Details</Text>
        </Box>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={4} p={4}>
          <GridItem>
            <Text {...labelStyle} color="#c0392b" fontWeight="600">Receipt No.</Text>
            <Input {...readonlyInputStyle} value={receiptNo} readOnly />
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>
              Account <Text as="span" color="red.500">*</Text>
            </Text>
            <Select
              {...inputStyle}
              placeholder="Select Account"
              value={accountLedgerId}
              onChange={(e) => setAccountLedgerId(e.target.value)}
            >
              {account.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.ledger_name}
                </option>
              ))}
            </Select>
          </GridItem>
        </Grid>
      </Box>

      {/* Section 2: Entries */}
      <Box {...sectionStyle}>
        <Box {...sectionHeaderStyle}>
          <HStack justifyContent="space-between">
            <Text fontWeight="500" fontSize="sm">Transaction Entries</Text>
            <Button
              size="xs"
              leftIcon={<AddIcon />}
              variant="outline"
              colorScheme="white"
              fontSize="11px"
              onClick={handleAddRow}
            >
              Add Row
            </Button>
          </HStack>
        </Box>

        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th {...thStyle} w="30px">#</Th>
                <Th {...thStyle} minW="190px">Particulars</Th>
                <Th {...thStyle} minW="130px">Current Balance</Th>
                <Th {...thStyle} minW="110px">Amount</Th>
                <Th {...thStyle} minW="150px">Transaction Type</Th>
                <Th {...thStyle} minW="150px">Bank Name</Th>
                <Th {...thStyle} w="36px"></Th>
              </Tr>
            </Thead>

            <Tbody>
              {entries.map((entry, index) => (
                <Tr key={index} bg={index % 2 === 0 ? "white" : "#f7faf8"}>
                  <Td {...tdStyle}>
                    <Text fontSize="11px" color="#888" textAlign="center">{index + 1}</Text>
                  </Td>

                  <Td {...tdStyle}>
                    <Select
                      {...inputStyle}
                      placeholder="End Of List"
                      value={entry.ledger_id}
                      onChange={(e) => handleLedgerSelect(index, e.target.value)}
                      minW="190px"
                    >
                      {ledger.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.ledger_name}
                        </option>
                      ))}
                    </Select>
                  </Td>

                  <Td {...tdStyle}>
                    <Input
                      {...readonlyInputStyle}
                      type="number"
                      value={Number(entry.current_balance || 0).toFixed(2)}
                      readOnly
                      textAlign="right"
                    />
                  </Td>

                  <Td {...tdStyle}>
                    <Input
                      {...inputStyle}
                      type="number"
                      value={entry.amount}
                      onChange={(e) => handleEntryChange(index, "amount", e.target.value)}
                      textAlign="right"
                    />
                  </Td>

                  <Td {...tdStyle}>
                    <Select
                      {...inputStyle}
                      placeholder="Please select"
                      value={entry.transaction_type}
                      onChange={(e) =>
                        handleEntryChange(index, "transaction_type", e.target.value)
                      }
                    >
                      <option value="Cash">Cash</option>
                      <option value="Cheque/DD">Cheque/DD</option>
                      <option value="E-Fund Transfer">e-Fund Transfer</option>
                      <option value="Others">Other</option>
                    </Select>
                  </Td>

                  <Td {...tdStyle}>
                    <Select
                      {...inputStyle}
                      placeholder="Select Bank"
                      value={entry.bank_name}
                      onChange={(e) => handleEntryChange(index, "bank_name", e.target.value)}
                    >
                      {account.map((item) => (
                        <option key={item.id} value={item.ledger_name}>
                          {item.ledger_name}
                        </option>
                      ))}
                    </Select>
                  </Td>

                  <Td {...tdStyle} textAlign="center">
                    {index !== 0 && (
                      <IconButton
                        icon={<CloseIcon />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        aria-label="Remove row"
                        onClick={() => handleRemoveRow(index)}
                      />
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Totals row */}
      <Box bg="#f0f4f0" p={3} border="1px solid #d0d7de" my={4} borderRadius="8px">
        <Grid templateColumns={{ base: "1fr", md: "repeat(4,1fr)" }} gap={3}>
          <Box>
            <Text fontSize="11px" color="#555" fontWeight="600">Total Amount</Text>
            <Input {...readonlyInputStyle} value={totalAmount.toFixed(2)} readOnly textAlign="right" />
          </Box>
        </Grid>
      </Box>

      {/* Section 3: Narration + Upload */}
      <Box {...sectionStyle} p={4}>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={4}>
          <Box>
            <Text {...labelStyle}>Narration</Text>
            <Textarea
              value={narration}
              rows={3}
              borderColor="#c8d0d8"
              bg="white"
              onChange={(e) => setNarration(e.target.value)}
              placeholder="Enter narration..."
              fontSize="12px"
            />
          </Box>
          <Box>
            <Text {...labelStyle}>
              Upload Document <Text as="span" color="red.500">*</Text>
            </Text>
            <Input
              type="file"
              p={1}
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              size="sm"
              borderRadius="6px"
              borderColor="#c8d0d8"
              bg="white"
              fontSize="12px"
              height="40px"
            />
          </Box>
        </Grid>
      </Box>

      {/* Footer */}
      <Flex justify="flex-end" mt={2} mb={4}>
        <Button
           bg="#237086" color="white" _hover={{ bg: "#1B5A6B" }} px={10}
          borderRadius="12px"  boxShadow="0 2px 8px rgba(45,90,61,0.4)"
          fontSize="14px" fontWeight="500"
          onClick={handleSave}
          isLoading={submitting}
          loadingText="Saving…"
        >
          SAVE
        </Button>
      </Flex>
    </Box>
  );
};

export default ReceiptOrderRequest;