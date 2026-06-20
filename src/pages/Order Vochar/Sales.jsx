import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  GridItem,
  Input,
  Select,
  Checkbox,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
  Spinner,
  Center,
  IconButton,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { IoMdClose } from "react-icons/io";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import useUsersapi from "../../Apis/GetUsersapi";
import {
  fetchNextVoucherNo,
  fetchGodownList,
  fetchLedgerDropdown,
  fetchAvailableStock,
  fetchBatches,
} from "../../Apis/commanApi"; // adjust this path to wherever commonApi actually lives

/**
 * ============================================================================
 * ASSUMPTIONS / THINGS TO CONFIRM ON THE BACKEND (also called out in chat)
 * ============================================================================
 * 1. POST /approve-sale-order must accept :approvalId as a route param.
 * 2. updateApproval() must also persist `payload_json` (it currently doesn't),
 *    otherwise edits made on this screen are lost by the time the Senior
 *    Accountant approves and executeApprovedSales() runs.
 * 3. API_ENDPOINTS additions needed (not present in what was shared):
 *      - GET_ORDER_APPROVAL        -> GET  /get-order-approval
 *      - CREATE_REQUEST_APPROVE    -> POST /approve-sale-order
 *      - REJECT_SALES_ORDER        -> POST /reject-sale-order  (no backend
 *        route for rejection was shared - add one mirroring approve, but
 *        setting status: "REJECTED" and rejected_at instead of moving levels)
 * 4. "Total Qty." column in the screenshot has no backing API in what you
 *    shared, so it mirrors Available Qty for now - swap in the real call if
 *    you have a "total stock across all godowns" endpoint.
 * 5. FILE_BASE_URL below needs to point at wherever orderBillImage / bill
 *    files are actually served from (S3 bucket root, CDN domain, etc).
 * ============================================================================
 */

const FILE_BASE_URL = "https://your-file-storage-domain.com/"; // TODO: replace with real base URL

const round2 = (num) => Math.round((Number(num || 0) + Number.EPSILON) * 100) / 100;

const safeParseJSON = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch (err) {
    console.log("JSON parse error", err);
    return fallback;
  }
};

// payload fields like dealer_name sometimes arrive double-encoded, e.g. `"\"\""`
// which is the literal two-character string `""`. This strips that wrapper.
const cleanQuoted = (val) => {
  if (val === undefined || val === null) return "";
  let str = String(val);
  if (str.length >= 2 && str.startsWith('"') && str.endsWith('"')) {
    str = str.slice(1, -1);
  }
  return str;
};

const formatDateForInput = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const emptyGodownModal = {
  isOpen: false,
  itemIndex: null,
  godownId: "",
  batchNo: "Not Applicable",
  batches: [],
  mfgDate: "",
  expiryDate: "",
  remindExpiry: "No",
  remindDate: "",
};

const Sales = () => {
  const { approvalId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { users } = useUsersapi();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [approval, setApproval] = useState(null);
  const [godownList, setGodownList] = useState([]);
  const [ledgerList, setLedgerList] = useState([]);
  const [salesLedgerOptions, setSalesLedgerOptions] = useState([]);
  const [voucherInfo, setVoucherInfo] = useState({ voucher_no: "", voucher_type_id: null });

  const [items, setItems] = useState([]);
  const [godownModal, setGodownModal] = useState(emptyGodownModal);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState("");

  const [formData, setFormData] = useState({
    salesNo: "",
    orderNo: "",
    referenceNo: "",
    setOverdueReminder: true,
    date: "",
    partyLedgerId: "",
    partyLedgerName: "",
    isConsignee: "No",
    dealerName: "",
    proprietorName: "",
    consigneeContactNo: "",
    consigneeAddress: "",
    consigneeGstnNo: "",
    currentBalance: "0",
    securityAmount: "0",
    creditLimit: "Not Specified",
    transportName: "",
    ewayNumber: "",
    transporterGst: "",
    deliveryPlace: "",
    employeeUnder: "",
    salesLedgerId: "",
    narration: "",
    isBillModified: "",
    orderDocument: "",
  });

  // ---------------------------------------------------------------------
  // Initial load
  // ---------------------------------------------------------------------

  useEffect(() => {
    if (approvalId) initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalId]);

  const initData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadApprovalDetails(),
        loadGodownList(),
        loadLedgerDropdown(),
        loadSalesLedgerDropdown(),
        loadVoucherNo(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadVoucherNo = async () => {
    try {
      const result = await fetchNextVoucherNo("SALES");
      if (result) {
        setVoucherInfo(result);
        setFormData((prev) => ({ ...prev, salesNo: result.voucher_no || "" }));
      }
    } catch (err) {
      console.log("Error fetching next voucher no", err);
    }
  };

  const loadGodownList = async () => {
    const list = await fetchGodownList();
    setGodownList(list);
  };

  const loadLedgerDropdown = async () => {
    const list = await fetchLedgerDropdown();
    setLedgerList(list);
  };

  const loadSalesLedgerDropdown = async () => {
    try {
      const response = await API.get(`${API_ENDPOINTS.GET_SALES_LEDGER_DROPDOWN}`);
      setSalesLedgerOptions(response?.data?.data || []);
    } catch (err) {
      console.log("Error fetching sales ledger dropdown", err);
    }
  };

  const loadApprovalDetails = async () => {
    try {
      const response = await API.get(`${API_ENDPOINTS.GET_ORDER_APPROVAL}/${approvalId}`);
      const data = response?.data?.data;
      if (!data) return;

      setApproval(data);

      const payload = data.payload_json || {};
      const parsedItems = safeParseJSON(payload.items, []);

      setFormData((prev) => ({
        ...prev,
        // NOTE: confirm with backend whether there's a dedicated sales order id -
        // falling back to the approval id since none was present in the payload.
        orderNo: data.id ?? "",
        date: formatDateForInput(data.created_at),
        partyLedgerId: payload.customer_ledger_id || "",
        isConsignee: payload.is_consignee === "1" ? "Yes" : "No",
        dealerName: cleanQuoted(payload.dealer_name),
        proprietorName: cleanQuoted(payload.proprietor_name),
        consigneeContactNo: cleanQuoted(payload.consignee_contact_no),
        consigneeAddress: cleanQuoted(payload.consignee_address),
        consigneeGstnNo: cleanQuoted(payload.consignee_gstn_no),
        narration: cleanQuoted(payload.narration),
        employeeUnder: data.created_by ?? "",
        orderDocument: payload.orderBillImage || "",
      }));

      setItems(
        parsedItems.map((item) => {
          const amount = round2(item.amount ?? Number(item.billed_qty || 0) * Number(item.rate || 0));
          return {
            ...item,
            amount,
            igst_amount: round2((amount * (item.igst_percent || 0)) / 100),
            cgst_amount: round2((amount * (item.cgst_percent || 0)) / 100),
            sgst_amount: round2((amount * (item.sgst_percent || 0)) / 100),
            total_amount: item.total_amount ?? amount,
          };
        }),
      );
    } catch (error) {
      console.log("Error fetching approval details", error);
      toast({
        title: "Error",
        description: "Failed to load sales order details",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Once both the party ledger id and the ledger list are available, fill in
  // the read-only Current Balance / Security Amount / Credit Limit fields.
  useEffect(() => {
    if (!formData.partyLedgerId || ledgerList.length === 0) return;

    const ledger = ledgerList.find((l) => String(l.id) === String(formData.partyLedgerId));
    if (ledger) {
      setFormData((prev) => ({
        ...prev,
        partyLedgerName: ledger.ledger_name || ledger.name || "",
        currentBalance: ledger.current_balance ?? ledger.closing_balance ?? "0",
        securityAmount: ledger.security_amount ?? "0",
        creditLimit: ledger.credit_limit ?? "Not Specified",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.partyLedgerId, ledgerList]);

  // ---------------------------------------------------------------------
  // Items
  // ---------------------------------------------------------------------

  const totals = useMemo(() => {
    let igst = 0;
    let cgst = 0;
    let sgst = 0;
    let totalAmount = 0;

    items.forEach((item) => {
      igst += Number(item.igst_amount || 0);
      cgst += Number(item.cgst_amount || 0);
      sgst += Number(item.sgst_amount || 0);
      totalAmount += Number(item.total_amount || 0);
    });

    return { igst: round2(igst), cgst: round2(cgst), sgst: round2(sgst), totalAmount: round2(totalAmount) };
  }, [items]);

  const recalculateItem = (item) => {
    const qty = Number(item.billed_qty) || 0;
    const rate = Number(item.rate) || 0;
    const amount = round2(qty * rate);

    const igst_amount = round2((amount * (Number(item.igst_percent) || 0)) / 100);
    const cgst_amount = round2((amount * (Number(item.cgst_percent) || 0)) / 100);
    const sgst_amount = round2((amount * (Number(item.sgst_percent) || 0)) / 100);

    return {
      ...item,
      amount,
      igst_amount,
      cgst_amount,
      sgst_amount,
      total_amount: round2(amount + igst_amount + cgst_amount + sgst_amount),
    };
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = recalculateItem({ ...updated[index], [field]: value });
      return updated;
    });
    setFormData((prev) => ({ ...prev, isBillModified: "Yes" }));
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({ ...prev, isBillModified: "Yes" }));
  };

  const getGodownName = (godownId) => {
    const g = godownList.find((g) => String(g.id) === String(godownId));
    return g ? g.godown_name || g.name : "Please Select";
  };

  // ---------------------------------------------------------------------
  // Godown / Batch modal
  // ---------------------------------------------------------------------

  const openGodownModal = async (index) => {
    const item = items[index];

    setGodownModal({
      ...emptyGodownModal,
      isOpen: true,
      itemIndex: index,
      godownId: item.godown_id || "",
      batchNo: item.batch_no || "Not Applicable",
    });

    if (item.godown_id) {
      const batches = await fetchBatches(item.stock_item_id, item.godown_id);
      setGodownModal((prev) => ({ ...prev, batches }));
    }
  };

  const handleGodownModalGodownChange = async (godownId) => {
    setGodownModal((prev) => ({ ...prev, godownId, batchNo: "Not Applicable", batches: [] }));

    const item = items[godownModal.itemIndex];
    if (item && godownId) {
      const batches = await fetchBatches(item.stock_item_id, godownId);
      setGodownModal((prev) => ({ ...prev, batches }));
    }
  };

  const handleGodownModalBatchChange = (batchNo) => {
    const batchObj = godownModal.batches.find((b) => b.batch_no === batchNo);
    setGodownModal((prev) => ({
      ...prev,
      batchNo,
      mfgDate: batchObj?.mfg_date || "",
      expiryDate: batchObj?.expiry_date || "",
    }));
  };

  const handleConfirmGodown = async () => {
    const { itemIndex, godownId, batchNo } = godownModal;

    if (!godownId) {
      toast({ title: "Please select a godown", status: "warning", duration: 2500, isClosable: true });
      return;
    }

    const item = items[itemIndex];
    const availableQty = await fetchAvailableStock({ itemId: item.stock_item_id, godownId });

    setItems((prev) => {
      const updated = [...prev];
      updated[itemIndex] = recalculateItem({
        ...updated[itemIndex],
        godown_id: godownId,
        batch_no: batchNo || "Not Applicable",
        available_qty: availableQty,
      });
      return updated;
    });

    setFormData((prev) => ({ ...prev, isBillModified: "Yes" }));
    setGodownModal(emptyGodownModal);
  };

  // ---------------------------------------------------------------------
  // Approve / Reject
  // ---------------------------------------------------------------------

  const buildUpdatedPayload = () => ({
    customer_ledger_id: formData.partyLedgerId,
    is_consignee: formData.isConsignee === "Yes" ? "1" : "0",
    dealer_name: formData.dealerName,
    proprietor_name: formData.proprietorName,
    consignee_contact_no: formData.consigneeContactNo,
    consignee_address: formData.consigneeAddress,
    consignee_gstn_no: formData.consigneeGstnNo,
    is_supercash_sale: approval?.payload_json?.is_supercash_sale ?? "0",
    subtotal: round2(items.reduce((sum, it) => sum + Number(it.amount || 0), 0)),
    tax_total: round2(totals.igst + totals.cgst + totals.sgst),
    total_amount: totals.totalAmount,
    narration: formData.narration,
    reference_no: formData.referenceNo,
    transport_name: formData.transportName,
    eway_number: formData.ewayNumber,
    transporter_gst: formData.transporterGst,
    delivery_place: formData.deliveryPlace,
    employee_under: formData.employeeUnder,
    sales_ledger_id: formData.salesLedgerId,
    is_bill_modified: formData.isBillModified,
    voucher_no: formData.salesNo,
    voucher_type_id: voucherInfo.voucher_type_id,
    items: JSON.stringify(items),
    orderBillImage: formData.orderDocument,
  });

  const handleApprove = async () => {
    if (!formData.salesLedgerId) {
      toast({ title: "Sales Ledger is required", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (items.length === 0) {
      toast({ title: "At least one item is required", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    setSubmitting(true);
    try {
      await API.post(`${API_ENDPOINTS.CREATE_REQUEST_APPROVE}/${approvalId}`, {
        remarks: "Approved",
        payload_json: buildUpdatedPayload(),
      });

      toast({
        title: "Approved",
        description: "Sales order approved and sent to the next approver",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate(-1);
    } catch (error) {
      console.log("Error approving sales order", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to approve sales order",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await API.post(`${API_ENDPOINTS.REJECT_SALES_ORDER}/${approvalId}`, {
        remarks: rejectRemarks || "Rejected",
      });

      toast({ title: "Rejected", description: "Sales order rejected", status: "info", duration: 3000, isClosable: true });
      setRejectModalOpen(false);
      navigate(-1);
    } catch (error) {
      console.log("Error rejecting sales order", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to reject sales order",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadBill = () => {
    if (!formData.orderDocument) {
      toast({ title: "No bill document attached", status: "warning", duration: 2500, isClosable: true });
      return;
    }
    window.open(`${FILE_BASE_URL}${formData.orderDocument}`, "_blank", "noopener,noreferrer");
  };

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------

  if (loading) {
    return (
      <Center h="60vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box bg="#eef1ee" minH="100vh" p={6}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Sales
      </Text>

      <Box bg="gray.100" border="1px solid" borderColor="gray.300" borderRadius="md" p={6}>
        <Text fontWeight="bold" mb={6}>
          Sales
        </Text>

        <Grid templateColumns="220px 1fr" gap={4} alignItems="center" mb={4}>
          <FormLabel color="red.500" m={0}>
            Sales No.
          </FormLabel>
          <Input value={formData.salesNo} isReadOnly bg="white" maxW="400px" />

          <FormLabel color="red.500" m={0}>
            Order No.
          </FormLabel>
          <Input value={formData.orderNo} isReadOnly bg="white" maxW="400px" />

          <FormLabel color="red.500" m={0}>
            Reference No.:
          </FormLabel>
          <Input
            value={formData.referenceNo}
            onChange={(e) => setFormData((prev) => ({ ...prev, referenceNo: e.target.value }))}
            bg="white"
            maxW="400px"
          />

          <FormLabel color="green.600" m={0}>
            Set Default OverDue Reminder
          </FormLabel>
          <Checkbox
            isChecked={formData.setOverdueReminder}
            onChange={(e) => setFormData((prev) => ({ ...prev, setOverdueReminder: e.target.checked }))}
          />

          <FormLabel m={0}>
            Date <Text as="span" color="red.500">*</Text>
          </FormLabel>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            bg="white"
            maxW="400px"
          />

          <FormLabel m={0}>Party A/c Name</FormLabel>
          <Select
            value={formData.partyLedgerId}
            onChange={(e) => setFormData((prev) => ({ ...prev, partyLedgerId: e.target.value }))}
            bg="white"
          >
            <option value="">-- Select --</option>
            {ledgerList.map((ledger) => (
              <option key={ledger.id} value={ledger.id}>
                {ledger.ledger_name || ledger.name}
              </option>
            ))}
          </Select>

          <FormLabel m={0}>Is Consignee</FormLabel>
          <Select
            value={formData.isConsignee}
            onChange={(e) => setFormData((prev) => ({ ...prev, isConsignee: e.target.value }))}
            bg="white"
            maxW="400px"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </Select>
        </Grid>

        {/* Balance / Security / Credit row */}
        <Grid templateColumns="repeat(3, 1fr)" gap={0} mb={4} border="1px solid" borderColor="gray.300">
          {[
            { label: "Current Balance", value: formData.currentBalance, suffix: "Dr" },
            { label: "Security Amount", value: formData.securityAmount },
            { label: "Credit Limit", value: formData.creditLimit },
          ].map((field, i) => (
            <Box key={field.label} borderRight={i < 2 ? "1px solid" : "none"} borderColor="gray.300" p={2}>
              <Text textAlign="center" fontWeight="medium" mb={2}>
                {field.label}
              </Text>
              <Box display="flex" gap={2}>
                <Input value={field.value} isReadOnly bg="white" textAlign="center" />
                {field.suffix && (
                  <Text alignSelf="center" minW="20px">
                    {field.suffix}
                  </Text>
                )}
              </Box>
            </Box>
          ))}
        </Grid>

        {/* Transport name */}
        <Box border="1px solid" borderColor="gray.300" mb={4} p={2}>
          <Text fontWeight="medium" textAlign="center" mb={2}>
            Transport Name
          </Text>
          <Input
            value={formData.transportName}
            onChange={(e) => setFormData((prev) => ({ ...prev, transportName: e.target.value }))}
            bg="white"
          />
        </Box>

        {/* Eway / Transporter GST / Delivery place */}
        <Grid templateColumns="repeat(3, 1fr)" gap={0} mb={4} border="1px solid" borderColor="gray.300">
          <Box borderRight="1px solid" borderColor="gray.300" p={2}>
            <Text textAlign="center" fontWeight="medium" mb={2}>
              E-Way Number
            </Text>
            <Input
              value={formData.ewayNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, ewayNumber: e.target.value }))}
              bg="white"
            />
          </Box>
          <Box borderRight="1px solid" borderColor="gray.300" p={2}>
            <Text textAlign="center" fontWeight="medium" mb={2}>
              Transporter GST
            </Text>
            <Input
              value={formData.transporterGst}
              onChange={(e) => setFormData((prev) => ({ ...prev, transporterGst: e.target.value }))}
              bg="white"
            />
          </Box>
          <Box p={2}>
            <Text textAlign="center" fontWeight="medium" mb={2}>
              Delivery Place
            </Text>
            <Input
              value={formData.deliveryPlace}
              onChange={(e) => setFormData((prev) => ({ ...prev, deliveryPlace: e.target.value }))}
              bg="white"
            />
          </Box>
        </Grid>

        <Grid templateColumns="220px 1fr" gap={4} alignItems="center" mb={4}>
          <FormLabel m={0}>Employee Under</FormLabel>
          <Select
            value={formData.employeeUnder}
            onChange={(e) => setFormData((prev) => ({ ...prev, employeeUnder: e.target.value }))}
            bg="white"
          >
            <option value="">-- Select --</option>
            {(users || []).map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>

          <FormLabel m={0}>Sales Ledger</FormLabel>
          <Select
            value={formData.salesLedgerId}
            onChange={(e) => setFormData((prev) => ({ ...prev, salesLedgerId: e.target.value }))}
            bg="white"
          >
            <option value="">--Please Select--</option>
            {salesLedgerOptions.map((ledger) => (
              <option key={ledger.id} value={ledger.id}>
                {ledger.ledger_name || ledger.name}
              </option>
            ))}
          </Select>
        </Grid>

        {/* Items table */}
        <Box overflowX="auto" border="1px solid" borderColor="gray.300" mb={4}>
          <Table size="sm">
            <Thead bg="gray.200">
              <Tr>
                <Th>Item Name</Th>
                <Th>Total Qty.</Th>
                <Th>Godown</Th>
                <Th>Available</Th>
                <Th>Billed Qty.</Th>
                <Th>Rate</Th>
                <Th>unit</Th>
                <Th>Amount</Th>
                <Th>IGST</Th>
                <Th>Tax Amount</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {items.map((item, index) => (
                <Tr key={`${item.stock_item_id}-${index}`} bg="white">
                  <Td minW="160px">
                    <Input value={item.item_name} isReadOnly />
                  </Td>
                  {/* Total Qty has no dedicated source in the payload - mirrors Available for now, see TODO #4 at top of file */}
                  <Td minW="90px">
                    <Input value={item.available_qty ?? 0} isReadOnly />
                  </Td>
                  <Td minW="140px">
                    <Button size="sm" variant="outline" w="full" onClick={() => openGodownModal(index)}>
                      {getGodownName(item.godown_id)}
                    </Button>
                  </Td>
                  <Td minW="80px">
                    <Input value={item.available_qty ?? 0} isReadOnly />
                  </Td>
                  <Td minW="90px">
                    <Input
                      type="number"
                      value={item.billed_qty ?? 0}
                      onChange={(e) => handleItemChange(index, "billed_qty", e.target.value)}
                    />
                  </Td>
                  <Td minW="90px">
                    <Input
                      type="number"
                      value={item.rate ?? 0}
                      onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                    />
                  </Td>
                  <Td minW="70px">
                    <Input value={item.unit_name} isReadOnly />
                  </Td>
                  <Td minW="100px">
                    <Input value={item.amount ?? 0} isReadOnly />
                  </Td>
                  <Td minW="80px">
                    <Input
                      type="number"
                      value={item.igst_percent ?? 0}
                      onChange={(e) => handleItemChange(index, "igst_percent", e.target.value)}
                    />
                  </Td>
                  <Td minW="100px">
                    <Input value={item.igst_amount ?? 0} isReadOnly />
                  </Td>
                  <Td>
                    <IconButton
                      aria-label="Remove item"
                      icon={<IoMdClose />}
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                    />
                  </Td>
                </Tr>
              ))}
              {items.length === 0 && (
                <Tr>
                  <Td colSpan={11} textAlign="center" py={4}>
                    No items in this order
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>

        <Grid templateColumns="220px 1fr" gap={4} alignItems="center" mb={2}>
          <FormLabel m={0}>IGST ()</FormLabel>
          <Input value={totals.igst} isReadOnly bg="white" maxW="400px" />

          <FormLabel m={0}>CGST ()</FormLabel>
          <Input value={totals.cgst} isReadOnly bg="white" maxW="400px" />

          <FormLabel m={0}>SGST ()</FormLabel>
          <Input value={totals.sgst} isReadOnly bg="white" maxW="400px" />

          <FormLabel m={0}>Total Amount</FormLabel>
          <Input value={totals.totalAmount} isReadOnly bg="white" maxW="400px" fontWeight="bold" />

          <FormLabel m={0}>Narration</FormLabel>
          <Input
            value={formData.narration}
            onChange={(e) => setFormData((prev) => ({ ...prev, narration: e.target.value }))}
            bg="white"
          />

          <FormLabel m={0}>Is Bill Modified</FormLabel>
          <Select
            value={formData.isBillModified}
            onChange={(e) => setFormData((prev) => ({ ...prev, isBillModified: e.target.value }))}
            bg="white"
            maxW="400px"
          >
            <option value="">--Please Select--</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </Select>

          <FormLabel m={0}>Order Document</FormLabel>
          <ChakraLink
            color="blue.500"
            fontWeight="medium"
            onClick={handleDownloadBill}
            cursor="pointer"
          >
            VIEW DOCUMENT
          </ChakraLink>
        </Grid>

        {/* Footer actions */}
        <Box display="flex" justifyContent="flex-end" gap={3} mt={6} pt={4} borderTop="1px solid" borderColor="gray.300">
          <Button colorScheme="red" variant="outline" onClick={() => setRejectModalOpen(true)} isDisabled={submitting}>
            Reject
          </Button>
          <Button colorScheme="green" onClick={handleApprove} isLoading={submitting}>
            Accept
          </Button>
          <Button colorScheme="blue" variant="outline" onClick={handleDownloadBill}>
            Download Bill
          </Button>
        </Box>
      </Box>

      {/* Godown / Batch modal */}
      <Modal isOpen={godownModal.isOpen} onClose={() => setGodownModal(emptyGodownModal)} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Godown</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
              <FormControl>
                <FormLabel>Godown</FormLabel>
                <Select
                  value={godownModal.godownId}
                  onChange={(e) => handleGodownModalGodownChange(e.target.value)}
                >
                  <option value="">-- Select Godown --</option>
                  {godownList.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.godown_name || g.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Batch No.</FormLabel>
                <Select
                  value={godownModal.batchNo}
                  onChange={(e) => handleGodownModalBatchChange(e.target.value)}
                  isDisabled={!godownModal.godownId}
                >
                  <option value="Not Applicable">Not Applicable</option>
                  {godownModal.batches.map((batch) => (
                    <option key={batch.batch_no} value={batch.batch_no}>
                      {batch.batch_no}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl>
                <FormLabel>Mfg Dt.</FormLabel>
                <Input
                  type="date"
                  value={godownModal.mfgDate}
                  onChange={(e) => setGodownModal((prev) => ({ ...prev, mfgDate: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Expiry Dt.</FormLabel>
                <Input
                  type="date"
                  value={godownModal.expiryDate}
                  onChange={(e) => setGodownModal((prev) => ({ ...prev, expiryDate: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Remind Expiry</FormLabel>
                <Select
                  value={godownModal.remindExpiry}
                  onChange={(e) => setGodownModal((prev) => ({ ...prev, remindExpiry: e.target.value }))}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Remind Date</FormLabel>
                <Input
                  type="date"
                  value={godownModal.remindDate}
                  onChange={(e) => setGodownModal((prev) => ({ ...prev, remindDate: e.target.value }))}
                  isDisabled={godownModal.remindExpiry !== "Yes"}
                />
              </FormControl>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setGodownModal(emptyGodownModal)}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleConfirmGodown}>
              Select
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reject modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject Sales Order</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Reason for rejection</FormLabel>
              <Textarea
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                placeholder="Let the employee know what needs to change"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleReject} isLoading={submitting}>
              Reject
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Sales;