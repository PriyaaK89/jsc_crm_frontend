import React, { useContext, useEffect, useState } from "react";
import {
  Box, Text, Grid, GridItem, FormControl, FormLabel, Input, Select,
  Textarea, Table, Thead, Tbody, Tr, Th, Td, Button, Flex,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Badge, Spinner, useToast, HStack, Image,
  Tag,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import useUsersapi from "../../Apis/GetUsersapi";
import { AuthContext } from "../../context/AuthContext";

const ReceiptApproval = () => {
  const { approvalId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { auth } = useContext(AuthContext);
  const { users } = useUsersapi();

  const [loading, setLoading] = useState(true);
  const [approval, setApproval] = useState(null);
  const [formData, setFormData] = useState(null);
  const [voucherTypeId, setVoucherTypeId] = useState(null);
  const [voucherNo, setVoucherNo] = useState("");

  const [ledger, setLedger] = useState([]);
  const [account, setAccount] = useState([]);
  const [pendingBills, setPendingBills] = useState([]);

  // bill modal
  const [billModal, setBillModal] = useState(false);
  const [billLoading, setBillLoading] = useState(false);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(null);
  const [billReferenceData, setBillReferenceData] = useState([]);

  // action states
  const [actionLoading, setActionLoading] = useState(false);
  const [reasonModal, setReasonModal] = useState(null); // "REJECT" | "RETURN" | null
  const [reason, setReason] = useState("");
  const [returnImage, setReturnImage] = useState(null);
  const [remarks, setRemarks] = useState("");

  // ── boot ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchLedgerDropdownList();
    fetchBankGroupLedger();
    loadVoucherNo();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchApproval();
    // eslint-disable-next-line
  }, [approvalId]);

  // keep total in sync whenever entries change
  useEffect(() => {
    if (!formData) return;
    const total = formData.entries.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );
    setFormData((prev) => (prev ? { ...prev, total_amount: total } : prev));
    // eslint-disable-next-line
  }, [formData?.entries]);

  // ── helpers ──────────────────────────────────────────────────────────────

  // Extract just the numeric/trailing part of a voucher no like "RECE-2" -> "2".
  // Falls back to the raw value if there's no separator to split on.
  const getDisplayVoucherNo = (rawOrderNo) => {
    if (!rawOrderNo) return "";
    const parts = String(rawOrderNo).split("-");
    return parts.length > 1 ? parts[parts.length - 1] : rawOrderNo;
  };

  // ── data loaders ─────────────────────────────────────────────────────────

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

  const fetchApproval = async () => {
    setLoading(true);
    try {
      const res = await API.get(
        `${API_ENDPOINTS.GET_RECEIPT_ORDER_BY_ID}/${approvalId}`
      );
      if (res.status === 200) {
        const data = res.data.data;
        setApproval(data);

        const payload = data.payload_json || {};
        setFormData({
          receipt_no: getDisplayVoucherNo(data.order_no),
          account_ledger_id: payload.account_ledger_id || "",
          current_balance: 0,
          employee_under_id: payload.employee_under_id || "",
          receipt_date: payload.receipt_date || "",
          narration: payload.narration || "",
          total_amount: Number(payload.total_amount || 0),
          attachment: payload.attachment || null,
          attachmentUrl: payload.attachmentUrl || null,
          entries: (payload.entries || []).map((e) => ({
            ledger_id: e.ledger_id || "",
            current_balance: 0,
            maintain_bill_by_bill: 0,
            amount: e.amount ?? "",
            transaction_type: e.transaction_type || "",
            transaction_no: e.transaction_no || "",
            bank_name: e.bank_name || "",
            bill_references: e.bill_references || [],
          })),
        });

        // Fetch account ledger's current balance
        if (payload.account_ledger_id) {
          fetchAccountBalance(payload.account_ledger_id);
        }

        // Fetch each entry's current balance + maintain_bill_by_bill flag
        (payload.entries || []).forEach((e, idx) => {
          if (e.ledger_id) fetchEntryLedgerDetails(idx, e.ledger_id);
        });
      }
    } catch (err) {
      toast({
        title: "Error loading receipt request",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ── account ledger balance ───────────────────────────────────────────────

  const fetchAccountBalance = async (ledgerId) => {
    if (!ledgerId) return;
    try {
      const res = await API.get(`${API_ENDPOINTS.get_ledger_by_id}/${ledgerId}`);
      if (res.status === 200) {
        const { current_balance, balance_type } = res.data.data;
        const balance =
          balance_type === "Cr"
            ? -Math.abs(Number(current_balance))
            : Math.abs(Number(current_balance));
        setFormData((prev) => (prev ? { ...prev, current_balance: balance } : prev));
      }
    } catch (err) {
      console.error("Error fetching account balance", err);
    }
  };

  const handleAccountSelect = (ledgerId) => {
    setFormData((prev) => ({ ...prev, account_ledger_id: ledgerId, current_balance: 0 }));
    fetchAccountBalance(ledgerId);
  };

  // ── per-entry ledger balance + maintain_bill_by_bill ─────────────────────

  const fetchEntryLedgerDetails = async (index, ledgerId) => {
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
          if (!prev) return prev;
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

 const loadVoucherNo = async () => {
  try {
    const res = await API.get(`${API_ENDPOINTS.GET_NEXTVOUCHER_NO}?voucher_type=RECEIPT`);
    setVoucherTypeId(res.data.voucher_type_id);
    setVoucherNo(res.data.voucher_no);
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

  // ── field edit helpers ────────────────────────────────────────────────────

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEntryChange = (index, field, value) => {
    setFormData((prev) => {
      const entries = [...prev.entries];
      entries[index] = { ...entries[index], [field]: value };
      return { ...prev, entries };
    });
  };

  const handleEntryLedgerChange = (index, ledgerId) => {
    setFormData((prev) => {
      const entries = [...prev.entries];
      entries[index] = {
        ...entries[index],
        ledger_id: ledgerId,
        current_balance: 0,
        maintain_bill_by_bill: 0,
      };
      return { ...prev, entries };
    });
    fetchEntryLedgerDetails(index, ledgerId);
  };

  const handleTransactionTypeChange = (index, value) => {
    handleEntryChange(index, "transaction_type", value);

    if (value && formData.entries[index].maintain_bill_by_bill === 1) {
      openBillModal(index, formData.entries[index].ledger_id);
    }
  };

  // ── bill modal (view / adjust bill references per entry) ─────────────────

  const openBillModal = async (index, ledgerId) => {
    if (!ledgerId) return;
    setBillLoading(true);
    setSelectedEntryIndex(index);
    setBillModal(true);

    try {
      const res = await API.get(`${API_ENDPOINTS.GET_PENDING_BILLS}/${ledgerId}`);
      if (res.status === 200) {
        const serverBills = res.data.data;
        setPendingBills(serverBills);

        const savedRefs = formData.entries[index]?.bill_references ?? [];
        setBillReferenceData(
          savedRefs.length > 0
            ? savedRefs
            : [
              {
                reference_type: "AGST REF",
                reference_no: "",
                sales_bill_reference_id: null,
                reference_amount: formData.entries[index]?.amount || "",
                due_date: "",
                dr_cr: "Cr",
              },
            ]
        );
      }
    } catch (err) {
      toast({
        title: "Error loading pending bills",
        status: "error",
        duration: 3000,
      });
      setBillReferenceData([]);
    } finally {
      setBillLoading(false);
    }
  };

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
      const total = updated.reduce((sum, r) => sum + Number(r.reference_amount || 0), 0);
      setFormData((prevForm) => {
        const entries = [...prevForm.entries];
        entries[selectedEntryIndex] = { ...entries[selectedEntryIndex], amount: total };
        return { ...prevForm, entries };
      });
      return updated;
    });
  };

  const handleBillReferenceChange = (rowIndex, field, value) => {
    setBillReferenceData((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [field]: value };
      if (field === "reference_amount") {
        const total = updated.reduce((sum, r) => sum + Number(r.reference_amount || 0), 0);
        setFormData((prevForm) => {
          const entries = [...prevForm.entries];
          entries[selectedEntryIndex] = { ...entries[selectedEntryIndex], amount: total };
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
        reference_type: "ON ACCOUNT",
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
      const total = updated.reduce((sum, r) => sum + Number(r.reference_amount || 0), 0);
      setFormData((prevForm) => {
        const entries = [...prevForm.entries];
        entries[selectedEntryIndex] = { ...entries[selectedEntryIndex], amount: total };
        return { ...prevForm, entries };
      });
      return updated;
    });
  };

  const saveBillAllocation = () => {
    const totalAllocated = billReferenceData.reduce(
      (sum, r) => sum + Number(r.reference_amount || 0),
      0
    );
    setFormData((prev) => {
      const entries = [...prev.entries];
      entries[selectedEntryIndex] = {
        ...entries[selectedEntryIndex],
        amount: totalAllocated,
        bill_references: billReferenceData,
      };
      return { ...prev, entries };
    });
    setBillModal(false);
  };

  // ── build payload_json to send back on approve/return ────────────────────

  const buildPayload = () => ({
    ...approval.payload_json,
    voucher_type_id: voucherTypeId,
    account_ledger_id: formData.account_ledger_id,
    employee_under_id: formData.employee_under_id,
    receipt_date: formData.receipt_date,
    narration: formData.narration,
    total_amount: formData.total_amount,
    entries: formData.entries.map((e) => ({
      ledger_id: e.ledger_id,
      employee_under_id: e.employee_under_id,
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
        sales_bill_reference_id: br.sales_bill_reference_id || null,
      })),
    })),
  });

  // ── actions ────────────────────────────────────────────────────────────

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const res = await API.post(
        `${API_ENDPOINTS.APPROVE_RECEIPT_REQUEST}/${approvalId}`,
        {
          payload_json: buildPayload(),
          remarks,
        }
      );
      if (res.data.success) {
        toast({ title: "Approved successfully", status: "success", duration: 3000 });
        navigate(-1);
      }
    } catch (err) {
      toast({
        title: "Error approving",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast({ title: "Rejection reason required", status: "warning", duration: 2500 });
      return;
    }
    setActionLoading(true);
    try {
      const res = await API.post(`${API_ENDPOINTS.REJECT_RECEIPT_REQUEST}/${approvalId}`, {
        reason,
      });
      if (res.data.success) {
        toast({ title: "Rejected", status: "success", duration: 3000 });
        navigate(-1);
      }
    } catch (err) {
      toast({
        title: "Error rejecting",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setActionLoading(false);
      setReasonModal(null);
    }
  };

  const handleReturn = async () => {
    if (!reason.trim()) {
      toast({ title: "Return reason required", status: "warning", duration: 2500 });
      return;
    }
    if (!returnImage) {
      toast({ title: "Return image required", status: "warning", duration: 2500 });
      return;
    }
    setActionLoading(true);
    try {
      const fd = new FormData();
      fd.append("reason", reason);
      fd.append("returnImage", returnImage);

      const res = await API.post(
        `${API_ENDPOINTS.RETURN_RECEIPT_REQUEST}/${approvalId}`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.data.success) {
        toast({ title: "Returned to employee", status: "success", duration: 3000 });
        navigate(-1);
      }
    } catch (err) {
      toast({
        title: "Error returning",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setActionLoading(false);
      setReasonModal(null);
    }
  };

  // ── styles (matched to Receipt.jsx / transactions master) ────────────────

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

  if (loading || !formData || !approval) {
    return (
      <Flex justify="center" py={20}>
        <Spinner size="lg" />
      </Flex>
    );
  }

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={5} width="100%">
        <Text className="action_heading" mb={4}>
          Receipt Approval Request
        </Text>
        <Tag colorScheme={approval.approval_level === "SENIOR" ? "purple" : "blue"} fontSize='10px' px={3} py={1} width="125px !important">
          Pending at {approval.approval_level}
        </Tag>
      </Flex>

      {/* ── TOP FORM ── */}
      <Grid templateColumns="repeat(2, 1fr)" gap={5} mb={6}>
      <GridItem>
  <FormControl>
    <FormLabel>Receipt Voucher No.</FormLabel>
    <Input
      {...readonlyInputStyle}
      value={voucherNo || ""}
      readOnly
      bg="gray.50"
      fontWeight="semibold"
    />
  </FormControl>
</GridItem>
        <GridItem>
          <FormControl>
            <FormLabel>Receipt No.</FormLabel>
            <Input
              {...readonlyInputStyle}
              value={formData.receipt_no || ""}
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
              {...inputStyle}
              type="date"
              value={formData.receipt_date}
              onChange={(e) => handleFieldChange("receipt_date", e.target.value)}
            />
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl isRequired>
            <FormLabel>Account</FormLabel>
            <Select
              {...inputStyle}
              value={formData.account_ledger_id}
              onChange={(e) => handleAccountSelect(e.target.value)}
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
              {...inputStyle}
              value={formData.employee_under_id}
              onChange={(e) => handleFieldChange("employee_under_id", e.target.value)}
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
              {...readonlyInputStyle}
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
        >
          <Thead bg="gray.100">
            <Tr>
              <Th {...thStyle}>Particulars (Ledger)</Th>
              <Th {...thStyle} isNumeric>Current Balance</Th>
              <Th {...thStyle} isNumeric>Amount</Th>
              <Th {...thStyle}>Transaction Type</Th>
              <Th {...thStyle}>Txn/Cheque No.</Th>
              <Th {...thStyle}>Bank Name</Th>
              <Th {...thStyle}>Bill Refs</Th>
            </Tr>
          </Thead>
          <Tbody>
            {formData.entries.map((entry, index) => (
              <Tr key={index}>
                <Td minW="170px">
                  <Select
                    {...inputStyle}
                    value={entry.ledger_id}
                    onChange={(e) => handleEntryLedgerChange(index, e.target.value)}
                  >
                    {ledger.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.ledger_name}
                      </option>
                    ))}
                  </Select>
                </Td>

                <Td isNumeric>
                  <Input
                    {...readonlyInputStyle}
                    value={Number(entry.current_balance || 0).toFixed(2)}
                    readOnly
                    w="90px"
                    textAlign="right"
                  />
                </Td>

                <Td>
                  <Input
                    {...inputStyle}
                    type="number"
                    value={entry.amount}
                    onChange={(e) => handleEntryChange(index, "amount", e.target.value)}
                    w="100px"
                  />
                </Td>

                <Td minW="150px">
                  <Select
                    {...inputStyle}
                    value={entry.transaction_type}
                    onChange={(e) => handleTransactionTypeChange(index, e.target.value)}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Cheque/DD">Cheque/DD</option>
                    <option value="E-Fund Transfer">E-Fund Transfer</option>
                    <option value="Others">Others</option>
                  </Select>
                </Td>

                <Td>
                  <Input
                    {...inputStyle}
                    value={entry.transaction_no}
                    onChange={(e) =>
                      handleEntryChange(index, "transaction_no", e.target.value)
                    }
                    w="120px"
                  />
                </Td>

                <Td>
                  <Select
                    {...inputStyle}
                    value={entry.bank_name}
                    onChange={(e) => handleEntryChange(index, "bank_name", e.target.value)}
                    w="160px"
                  >
                    {account.map((item) => (
                      <option key={item.id} value={item.ledger_name}>
                        {item.ledger_name}
                      </option>
                    ))}
                  </Select>
                </Td>

                <Td textAlign="center">
                  {entry.bill_references?.length > 0 ? (
                    <Badge
                      colorScheme="green"
                      cursor="pointer"
                      onClick={() => openBillModal(index, entry.ledger_id)}
                    >
                      {entry.bill_references.length} ref
                      {entry.bill_references.length > 1 ? "s" : ""}
                    </Badge>
                  ) : (
                    <Button
                      size="xs"
                      variant="outline"
                      isDisabled={!entry.ledger_id || entry.maintain_bill_by_bill !== 1}
                      onClick={() => openBillModal(index, entry.ledger_id)}
                    >
                      Bill
                    </Button>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* ── ATTACHMENT PREVIEW ── */}
      {formData.attachmentUrl && (
        <Box mb={5}>
          <FormLabel>Uploaded Document</FormLabel>
          <Image
            src={formData.attachmentUrl}
            alt="Receipt attachment"
            maxH="200px"
            borderRadius="8px"
            border="1px solid #ddd"
          />
        </Box>
      )}

      <FormControl mb={3}>
        <FormLabel>Total Amount</FormLabel>
        <Input
          {...readonlyInputStyle}
          value={Number(formData.total_amount).toFixed(2)}
          readOnly
        />
      </FormControl>

      <Box mb={5}>
        <FormControl>
          <FormLabel>Narration</FormLabel>
          <Textarea
            value={formData.narration}
            onChange={(e) => handleFieldChange("narration", e.target.value)}
          />
        </FormControl>
      </Box>

{approval.remarks && (
  <Box mb={5}>
    <FormLabel>Previous Remarks</FormLabel>
    <Box
      p={3}
      borderRadius="6px"
      bg="#f0f4f0"
      border="1px solid #c8d0d8"
      fontSize="14px"
      color="#333"
    >
      {approval.remarks}
    </Box>
  </Box>
)}

<Box mb={5}>
  <FormControl>
    <FormLabel>Approval Remarks (optional)</FormLabel>
    <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
  </FormControl>
</Box>

      {/* ── ACTIONS ── */}
      <Flex justify="flex-end" gap={3} mt={6}>
        <Button
          colorScheme="red"
          variant="outline"
          onClick={() => setReasonModal("REJECT")}
          isDisabled={actionLoading}
        >
          Reject
        </Button>
        <Button
          colorScheme="orange"
          variant="outline"
          onClick={() => setReasonModal("RETURN")}
          isDisabled={actionLoading}
        >
          Return
        </Button>
        <Button
          bg="#237086"
          color="white"
          _hover={{ bg: "#1B5A6B" }}
          borderRadius="12px"
          px={8}
          onClick={handleApprove}
          isLoading={actionLoading}
          loadingText="Approving…"
        >
          Approve
        </Button>
      </Flex>

      {/* ── BILL MODAL ── */}
      <Modal isOpen={billModal} onClose={() => setBillModal(false)} size="5xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius="12px">
          <ModalHeader bg="#b0d1cf" borderRadius="12px 12px 0px 0px" padding="21px">
            <HStack gap={0}>
              <Text fontSize="16px">Bill Wise Details</Text>
              {selectedEntryIndex !== null &&
                formData.entries[selectedEntryIndex]?.ledger_id && (
                  <Text as="span" fontWeight="normal" fontSize="13px" ml={2} color="gray.600">
                    —{" "}
                    {
                      ledger.find(
                        (l) =>
                          String(l.id) ===
                          String(formData.entries[selectedEntryIndex].ledger_id)
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
              <Table size="sm" variant="simple">
                <Thead bg="gray.100">
                  <Tr>
                    <Th {...thStyle}>Type of Ref</Th>
                    <Th {...thStyle}>Reference No</Th>
                    <Th {...thStyle}>Due Date</Th>
                    <Th {...thStyle} isNumeric>Amount</Th>
                    <Th {...thStyle}>Dr/Cr</Th>
                    <Th {...thStyle}>Delete</Th>
                    <Th {...thStyle}>Add</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {billReferenceData.map((bill, rowIndex) => (
                    <Tr key={rowIndex}>
                      <Td minW="130px">
                        <Select
                          size="sm"
                          value={bill.reference_type}
                          onChange={(e) =>
                            handleBillReferenceChange(rowIndex, "reference_type", e.target.value)
                          }
                        >
                          <option value="AGST REF">Agst Ref</option>
                          <option value="ADVANCE">Advance</option>
                          <option value="ON ACCOUNT">On Account</option>
                        </Select>
                      </Td>
                      <Td minW="200px">
                        {bill.reference_type === "AGST REF" ? (
                          <Select
                            size="sm"
                            value={bill.reference_no}
                            onChange={(e) => handleAgstRefSelect(rowIndex, e.target.value)}
                          >
                            <option value="">-- Select --</option>
                            {pendingBills.map((pb) => (
                              <option key={pb.id} value={pb.reference_no}>
                                {pb.reference_no} — {pb.pending_amount} Cr
                              </option>
                            ))}
                          </Select>
                        ) : (
                          <Input
                            size="sm"
                            value={bill.reference_no}
                            onChange={(e) =>
                              handleBillReferenceChange(rowIndex, "reference_no", e.target.value)
                            }
                          />
                        )}
                      </Td>
                      <Td>
                        <Input
                          size="sm"
                          type="date"
                          value={bill.due_date || ""}
                          onChange={(e) =>
                            handleBillReferenceChange(rowIndex, "due_date", e.target.value)
                          }
                        />
                      </Td>
                      <Td>
                        <Input
                          size="sm"
                          type="number"
                          value={bill.reference_amount}
                          onChange={(e) =>
                            handleBillReferenceChange(rowIndex, "reference_amount", e.target.value)
                          }
                          w="100px"
                        />
                      </Td>
                      <Td>
                        <Input size="sm" {...readonlyInputStyle} value={bill.dr_cr || "Cr"} readOnly w="50px" />
                      </Td>
                      <Td textAlign="center">
                        <Button size="xs" colorScheme="red" onClick={() => removeBillRow(rowIndex)}>
                          ✕
                        </Button>
                      </Td>
                      <Td textAlign="center">
                        {rowIndex === billReferenceData.length - 1 && (
                          <Button size="xs" colorScheme="green" onClick={addBillRow}>
                            +
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
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

      {/* ── REJECT / RETURN REASON MODAL ── */}
      <Modal isOpen={!!reasonModal} onClose={() => setReasonModal(null)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="#e4eced" borderBottom="2px solid #c0d4c8" fontSize="13px" fontWeight="700" color="#c57e14" pl={3}>
            {reasonModal === "REJECT" ? "Reject Receipt Request" : "Return Receipt Request"}
          </ModalHeader>
          <ModalCloseButton top={0} right={0} />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Reason</FormLabel>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
            </FormControl>

            {reasonModal === "RETURN" && (
              <FormControl isRequired>
                <FormLabel>Return Image</FormLabel>
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setReturnImage(e.target.files[0] || null)}
                />
              </FormControl>
            )}
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost"
              colorScheme="gray"
              size="sm" border="1px solid grey" onClick={() => setReasonModal(null)}>
              Cancel
            </Button>
            <Button variant="outline"
           height="38px" borderRadius="13px"
              size="sm"
              px={6}
              colorScheme={reasonModal === "REJECT" ? "red" : "orange"}
              onClick={reasonModal === "REJECT" ? handleReject : handleReturn}
              isLoading={actionLoading}
            >
              Confirm {reasonModal === "REJECT" ? "Reject" : "Return"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ReceiptApproval;