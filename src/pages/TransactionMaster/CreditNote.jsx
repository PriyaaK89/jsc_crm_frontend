import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Grid, GridItem, Input, Select, Text, Button,
  Table, Thead, Tbody, Tr, Th, Td, Textarea, Flex,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, useDisclosure, Badge,
  Divider, useToast,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import useUsersapi from "../../Apis/GetUsersapi";
import {
  fetchStockItemDropdown,
  fetchGodownList,
  fetchAvailableStock,
  fetchBatches,
  fetchStockItemDetailsByID,
  fetchLedgerDetailsByID,
} from "../../Apis/commanApi";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

// ─── Styles (matching Sales component) ───────────────────────────────────────
const sectionStyle = {
  bg: "white",
  border: "1px solid #d0d7de",
  borderRadius: "6px",
  p: 0,
  mb: 3,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const labelStyle = { fontSize: "12px", color: "#494949", marginBottom: "3px" };

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

const tdStyle = {
  p: "2px 3px",
  borderColor: "#e0e8e2",
  verticalAlign: "middle",
};

// ─── Empty item row ───────────────────────────────────────────────────────────
const emptyItem = () => ({
  stock_item_id: "",
  godown_id: "",
  batch_no: "",
  available_qty: 0,
  return_qty: "",
  rate: "",
  unit_id: "",
  unit_name: "",
  alt_unit_id: null,
  alt_unit_qty: null,
  alt_unit_name: "",
  amount: 0,
  igst_percent: 0,
  igst_amount: 0,
  cgst_percent: 0,
  cgst_amount: 0,
  sgst_percent: 0,
  sgst_amount: 0,
  total_amount: 0,
  gst_applicable: 0,
  rate_of_duty: 0,
  // For tracking max returnable qty
  sold_qty: 0,
  already_returned_qty: 0,
  available_to_return: 0,
});

// ─── Compute item amounts ─────────────────────────────────────────────────────
const computeItemAmounts = (item) => {
  const qty = Number(item.return_qty || 0);
  const rate = Number(item.rate || 0);
  const amount = qty * rate;

  const igst_percent = Number(item.igst_percent || 0);
  const cgst_percent = Number(item.cgst_percent || 0);
  const sgst_percent = Number(item.sgst_percent || 0);

  const igst_amount = Number(((amount * igst_percent) / 100).toFixed(2));
  const cgst_amount = Number(((amount * cgst_percent) / 100).toFixed(2));
  const sgst_amount = Number(((amount * sgst_percent) / 100).toFixed(2));
  const total_amount = Number(
    (amount + igst_amount + cgst_amount + sgst_amount).toFixed(2)
  );

  return {
    amount: Number(amount.toFixed(2)),
    igst_amount,
    cgst_amount,
    sgst_amount,
    total_amount,
  };
};

// ─── Bill Reference row ───────────────────────────────────────────────────────
const emptyBillRef = () => ({
  sales_bill_reference_id: "",
  bill_no: "",
  bill_date: "",
  original_amount: 0,
  pending_amount: 0,
  amount: "",
});

// ─── Main Component ───────────────────────────────────────────────────────────
const GenerateCreditNote = ({salesLedger}) => {
  const { users } = useUsersapi();
  const toast = useToast();

  // ── Dropdown data
  const [stockItemList, setStockItemList] = useState([]);
  const [godownList, setGodownList] = useState([]);
  const [customerList, setCustomerList] = useState([]);


  // ── Header
  const [voucherNo, setVoucherNo] = useState("");
  const [voucherTypeId, setVoucherTypeId] = useState(null);
  const [creditNoteDate, setCreditNoteDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [customerLedgerId, setCustomerLedgerId] = useState("");
  const [salesReturnLedgerId, setSalesReturnLedgerId] = useState("");
  const [originalSaleId, setOriginalSaleId] = useState("");
  const [originalInvoiceNo, setOriginalInvoiceNo] = useState("");
  const [assignEmployee, setAssignEmployee] = useState("");
  const [employeeUnderId, setEmployeeUnderId] = useState("");
  const [narration, setNarration] = useState("");

  // ── Transport
  const [dispatchDocNo, setDispatchDocNo] = useState("");
  const [transportName, setTransportName] = useState("");
  const [destination, setDestination] = useState("");
  const [billTNo, setBillTNo] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [transportFreight, setTransportFreight] = useState(0);
  const [ewayNumber, setEwayNumber] = useState("");
  const [transporterGst, setTransporterGst] = useState("");
  const [deliveryPlace, setDeliveryPlace] = useState("");

  // ── Customer info
  const [customerInfo, setCustomerInfo] = useState({
    current_balance: "",
    balance_type: "Dr",
    security_amount: "0",
    credit_limit: "Not Specified",
  });

  // ── Invoice search
  const [invoiceSearchList, setInvoiceSearchList] = useState([]);
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");

  // ── Items
  const [items, setItems] = useState([]);
  const [showItemsTable, setShowItemsTable] = useState(false);

  // ── Totals
  const [totals, setTotals] = useState({
    subtotal: 0,
    igst_total: 0,
    cgst_total: 0,
    sgst_total: 0,
    tax_total: 0,
    total_amount: 0,
  });

  // ── Bill References
  const [billReferences, setBillReferences] = useState([]);
  const [billRefRows, setBillRefRows] = useState([emptyBillRef()]);

  // ── Godown / Batch modal
  const { isOpen: isGodownOpen, onOpen: openGodown, onClose: closeGodown } =
    useDisclosure();
  const [activeItemIndex, setActiveItemIndex] = useState(null);
  const [batchList, setBatchList] = useState([]);
  const [selectedBatchNo, setSelectedBatchNo] = useState("");
  const [tempGodownId, setTempGodownId] = useState("");

  const [saving, setSaving] = useState(false);

  // ─── Load on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    loadDropdowns();
    loadVoucherNo();
  }, []);

  const loadDropdowns = async () => {
    try {
      const [stockData, godownData] = await Promise.all([
        fetchStockItemDropdown(),
        fetchGodownList(),
      ]);
      setStockItemList(stockData || []);
      setGodownList(godownData || []);

      // Customer ledger (Sundry Debtors)
      try {
        const r = await API.get(API_ENDPOINTS.GET_LEDGER_DROPDOWN);
        setCustomerList(r?.data?.data || []);
      } catch (e) {
        console.error(e);
      }

      // Sales Return ledger (Sales Account group)
    
    } catch (err) {
      console.error("loadDropdowns error:", err);
    }
  };

  const loadVoucherNo = async () => {
    try {
      const res = await API.get(
        `${API_ENDPOINTS.GET_NEXTVOUCHER_NO}?voucher_type=CREDIT_NOTE`
      );
      setVoucherNo(res.data.voucher_no);
      setVoucherTypeId(res.data.voucher_type_id);
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

  // ─── Recalculate totals ───────────────────────────────────────────────────
  const recalcTotals = useCallback((itemsArr) => {
    let subtotal = 0,
      igst_total = 0,
      cgst_total = 0,
      sgst_total = 0;
    itemsArr.forEach((item) => {
      subtotal += Number(item.amount || 0);
      igst_total += Number(item.igst_amount || 0);
      cgst_total += Number(item.cgst_amount || 0);
      sgst_total += Number(item.sgst_amount || 0);
    });
    const tax_total = igst_total + cgst_total + sgst_total;
    const total_amount = subtotal + tax_total;
    setTotals({
      subtotal: Number(subtotal.toFixed(2)),
      igst_total: Number(igst_total.toFixed(2)),
      cgst_total: Number(cgst_total.toFixed(2)),
      sgst_total: Number(sgst_total.toFixed(2)),
      tax_total: Number(tax_total.toFixed(2)),
      total_amount: Number(total_amount.toFixed(2)),
    });
  }, []);

  // ─── Customer select ──────────────────────────────────────────────────────
  const handleCustomerSelect = async (ledgerId) => {
    setCustomerLedgerId(ledgerId);
    setOriginalSaleId("");
    setOriginalInvoiceNo("");
    setInvoiceSearchQuery("");
    setShowItemsTable(false);
    setItems([]);
    recalcTotals([]);

    if (!ledgerId) {
      setCustomerInfo({
        current_balance: "",
        balance_type: "Dr",
        security_amount: "0",
        credit_limit: "Not Specified",
      });
      return;
    }
    try {
      const details = await fetchLedgerDetailsByID(ledgerId);
      if (details) {
        setCustomerInfo({
          current_balance: details.current_balance || "0",
          balance_type: details.balance_type || "Dr",
          security_amount: details.security_amount || "0",
          credit_limit: details.credit_limit || "Not Specified",
        });
      }
    } catch (err) {
      console.error(err);
    }

    // Fetch sales invoices for this customer to pick original sale
    try {
      const res = await API.get(
        `${API_ENDPOINTS.GET_SALES_BY_CUSTOMER || "/sales/by-customer"}?customer_ledger_id=${ledgerId}`
      );
      setInvoiceSearchList(res?.data?.data || []);
    } catch (e) {
      console.error("fetch invoices error:", e);
      setInvoiceSearchList([]);
    }
  };

  // ─── Invoice (original sale) select ──────────────────────────────────────
  const handleInvoiceSelect = async (sale) => {
    setOriginalSaleId(sale.id);
    setOriginalInvoiceNo(sale.voucher_no || sale.reference_no || sale.id);
    setInvoiceSearchQuery(sale.voucher_no || sale.reference_no || String(sale.id));
    setShowInvoiceDropdown(false);

    // Show items table, pre-populate with sale's items
    try {
      const res = await API.get(
        `${API_ENDPOINTS.GET_SALE_ITEMS_BY_ID || "/sales"}/${sale.id}/items`
      );
      const saleItems = res?.data?.data || [];
      const populated = saleItems.map((si) => ({
        ...emptyItem(),
        stock_item_id: si.stock_item_id,
        godown_id: si.godown_id || "",
        batch_no: si.batch_no || "",
        available_qty: si.available_qty || 0,
        rate: si.rate || 0,
        unit_id: si.unit_id || "",
        unit_name: si.base_unit_name || "",
        alt_unit_id: si.alt_unit_id || null,
        alt_unit_qty: si.alternative_unit_value || null,
        alt_unit_name: si.alternative_unit_name || "",
        igst_percent: si.igst_percent || 0,
        cgst_percent: si.cgst_percent || 0,
        sgst_percent: si.sgst_percent || 0,
        gst_applicable: si.gst_applicable || 0,
        rate_of_duty: si.rate_of_duty || 0,
        sold_qty: si.billed_qty || 0,
        available_to_return: si.billed_qty || 0,
      }));
      setItems(populated.length ? populated : [emptyItem()]);
      recalcTotals(populated.length ? populated : [emptyItem()]);
    } catch (e) {
      console.error("fetch sale items error:", e);
      setItems([emptyItem()]);
    }

    // Fetch bill references for this sale
    try {
      const res = await API.get(
        `${API_ENDPOINTS.GET_SALES_BILL_REFERENCES || "/sales-bill-references"}?sale_id=${sale.id}`
      );
      setBillReferences(res?.data?.data || []);
    } catch (e) {
      console.error("fetch bill references error:", e);
      setBillReferences([]);
    }

    setShowItemsTable(true);
  };

  // ─── Stock item select → auto-fill ───────────────────────────────────────
  const handleStockItemSelect = async (index, stockItemId) => {
    if (!stockItemId) {
      const updated = [...items];
      updated[index] = emptyItem();
      setItems(updated);
      recalcTotals(updated);
      return;
    }

    try {
      const details = await fetchStockItemDetailsByID(stockItemId);
      if (!details) return;

      const gstDuty = details.rate_of_duty || 0;
      const newItem = {
        ...emptyItem(),
        stock_item_id: stockItemId,
        rate: details.rate || 0,
        unit_id: details.unit_id || "",
        unit_name: details.unit_name || "",
        alt_unit_id: details.alt_unit_id || null,
        alt_unit_name: details.alt_unit_name || "",
        alt_unit_qty: details.alt_unit_qty || "",
        gst_applicable: details.gst_applicable || 0,
        rate_of_duty: gstDuty,
        igst_percent: gstDuty,
        cgst_percent: gstDuty / 2,
        sgst_percent: gstDuty / 2,
      };

      const computed = computeItemAmounts(newItem);
      const updated = [...items];
      updated[index] = { ...newItem, ...computed };
      setItems(updated);
      recalcTotals(updated);
    } catch (err) {
      console.error("handleStockItemSelect error:", err);
    }
  };

  // ─── Item field change ────────────────────────────────────────────────────
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    const computed = computeItemAmounts(updated[index]);
    updated[index] = { ...updated[index], ...computed };
    setItems(updated);
    recalcTotals(updated);
  };

  // ─── Godown select → fetch batches + open modal ───────────────────────────
  const handleGodownSelect = async (index, godownId) => {
    if (!godownId) return;

    setActiveItemIndex(index);
    setTempGodownId(godownId);
    setSelectedBatchNo("");
    setBatchList([]);

    const item = items[index];
    if (item.stock_item_id) {
      try {
        const batches = await fetchBatches(item.stock_item_id, godownId);
        setBatchList(batches || []);
      } catch (err) {
        console.error("fetchBatches error:", err);
        setBatchList([]);
      }
    }

    openGodown();
  };

  // ─── Godown modal save ────────────────────────────────────────────────────
  const handleGodownSave = async () => {
    if (activeItemIndex === null) return;

    const updated = [...items];
    const item = updated[activeItemIndex];

    let availQty = 0;
    let finalBatch = "";

    if (selectedBatchNo === "NOT_APPLICABLE") {
      // No batch — fetch available stock from godown only
      try {
        availQty = await fetchAvailableStock(
          item.stock_item_id,
          tempGodownId,
          null
        );
      } catch (e) {
        availQty = 0;
      }
      finalBatch = "";
    } else if (selectedBatchNo) {
      const found = batchList.find((b) => b.batch_no === selectedBatchNo);
      availQty = found ? Number(found.qty || 0) : 0;
      finalBatch = selectedBatchNo;
    }

    updated[activeItemIndex] = {
      ...item,
      godown_id: tempGodownId,
      batch_no: finalBatch,
      available_qty: availQty,
    };

    const computed = computeItemAmounts(updated[activeItemIndex]);
    updated[activeItemIndex] = { ...updated[activeItemIndex], ...computed };

    setItems(updated);
    recalcTotals(updated);
    closeGodown();
  };

  // ─── Add / Remove item rows ───────────────────────────────────────────────
  const addItemRow = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItemRow = (index) => {
    const updated = items.filter((_, i) => i !== index);
    const final = updated.length ? updated : [emptyItem()];
    setItems(final);
    recalcTotals(final);
  };

  // ─── Bill Reference rows ──────────────────────────────────────────────────
  const handleBillRefChange = (index, field, value) => {
    const updated = [...billRefRows];
    if (field === "sales_bill_reference_id") {
      const found = billReferences.find((b) => String(b.id) === String(value));
      updated[index] = {
        ...updated[index],
        sales_bill_reference_id: value,
        bill_no: found?.bill_no || "",
        bill_date: found?.bill_date || "",
        original_amount: found?.original_amount || 0,
        pending_amount: found?.pending_amount || 0,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setBillRefRows(updated);
  };

  const addBillRefRow = () => setBillRefRows((prev) => [...prev, emptyBillRef()]);
  const removeBillRefRow = (index) => {
    const updated = billRefRows.filter((_, i) => i !== index);
    setBillRefRows(updated.length ? updated : [emptyBillRef()]);
  };

  // ─── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!customerLedgerId) {
      toast({ description: "Please select Party A/c Name!", status: "error", duration: 2000 });
      return;
    }
    if (!originalSaleId) {
      toast({ description: "Please select Original Invoice!", status: "error", duration: 2000 });
      return;
    }
    if (!creditNoteDate) {
      toast({ description: "Date is required!", status: "error", duration: 2000 });
      return;
    }
    if (!salesReturnLedgerId) {
      toast({ description: "Please select Sales Return Ledger!", status: "error", duration: 2000 });
      return;
    }

    const validItems = items.filter(
      (i) => i.stock_item_id && Number(i.return_qty) > 0
    );
    if (validItems.length === 0) {
      toast({
        description: "Please add at least one item with return quantity!",
        status: "error",
        duration: 2000,
      });
      return;
    }

    const validBillRefs = billRefRows.filter(
      (r) => r.sales_bill_reference_id && Number(r.amount) > 0
    );

    setSaving(true);
    try {
      const payload = {
        credit_note_date: creditNoteDate,
        original_sale_id: originalSaleId,
        customer_ledger_id: customerLedgerId,
        sales_return_ledger_id: salesReturnLedgerId,
        assign_employee_id:
          assignEmployee === "Applicable" ? employeeUnderId || null : null,
        employee_under_id:
          assignEmployee === "Applicable" ? employeeUnderId || null : null,
        dispatch_doc_no: dispatchDocNo,
        transport_name: transportName,
        destination,
        bill_t_no: billTNo,
        vehicle_no: vehicleNo,
        transport_freight: transportFreight,
        eway_number: ewayNumber,
        transporter_gst: transporterGst,
        delivery_place: deliveryPlace,
        ...totals,
        narration,
        items: validItems.map((it) => ({
          stock_item_id: it.stock_item_id,
          godown_id: it.godown_id || null,
          batch_no: it.batch_no || null,
          available_qty: it.available_qty,
          return_qty: it.return_qty,
          rate: it.rate,
          unit_id: it.unit_id || null,
          alt_unit_id: it.alt_unit_id || null,
          alt_unit_qty: it.alt_unit_qty || null,
          amount: it.amount,
          igst_percent: it.igst_percent,
          igst_amount: it.igst_amount,
          cgst_percent: it.cgst_percent,
          cgst_amount: it.cgst_amount,
          sgst_percent: it.sgst_percent,
          sgst_amount: it.sgst_amount,
          total_amount: it.total_amount,
        })),
        bill_references: validBillRefs.map((r) => ({
          sales_bill_reference_id: r.sales_bill_reference_id,
          amount: Number(r.amount),
        })),
      };

      const res = await API.post(
        API_ENDPOINTS.CREATE_CREDIT_NOTE || "/credit-note/create",
        payload
      );

      if (res?.data?.success) {
        toast({
          description: `Credit Note Created! Voucher: ${res.data.voucher_no}`,
          status: "success",
          duration: 3000,
        });
        handleReset();
        loadVoucherNo();
      } else {
        toast({
          description: res?.data?.message || "Failed to save.",
          status: "error",
          duration: 3000,
        });
      }
    } catch (err) {
      toast({
        description: err?.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCustomerLedgerId("");
    setSalesReturnLedgerId("");
    setOriginalSaleId("");
    setOriginalInvoiceNo("");
    setInvoiceSearchQuery("");
    setAssignEmployee("");
    setEmployeeUnderId("");
    setNarration("");
    setDispatchDocNo("");
    setTransportName("");
    setDestination("");
    setBillTNo("");
    setVehicleNo("");
    setTransportFreight(0);
    setEwayNumber("");
    setTransporterGst("");
    setDeliveryPlace("");
    setCustomerInfo({
      current_balance: "",
      balance_type: "Dr",
      security_amount: "0",
      credit_limit: "Not Specified",
    });
    setItems([]);
    setShowItemsTable(false);
    setBillRefRows([emptyBillRef()]);
    setTotals({
      subtotal: 0,
      igst_total: 0,
      cgst_total: 0,
      sgst_total: 0,
      tax_total: 0,
      total_amount: 0,
    });
    setCreditNoteDate(new Date().toISOString().slice(0, 10));
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Box>

        {/* ── Section 1: Voucher Details ── */}
        <Box {...sectionStyle}>
          <Box bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">
            <Text fontWeight="500" fontSize="sm">Credit Note Details</Text>
          </Box>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={4} p={4}>

            {/* Credit Note No. */}
            <GridItem>
              <Text {...labelStyle} color="#c0392b">Credit Note No.</Text>
              <Input {...readonlyInputStyle} value={voucherNo} readOnly />
            </GridItem>

            {/* Date */}
            <GridItem>
              <Text {...labelStyle}>Date <Text as="span" color="red.500">*</Text></Text>
              <Input
                {...inputStyle}
                type="date"
                value={creditNoteDate}
                onChange={(e) => setCreditNoteDate(e.target.value)}
              />
            </GridItem>

            {/* Party A/c Name */}
            <GridItem>
              <Text {...labelStyle}>Party A/c Name <Text as="span" color="red.500">*</Text></Text>
              <Select
                {...inputStyle}
                value={customerLedgerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
              >
                <option value="">-- Select Party --</option>
                {customerList.map((l) => (
                  <option key={l.id} value={l.id}>{l.ledger_name}</option>
                ))}
              </Select>
            </GridItem>

            {/* Original Invoice No. */}
            <GridItem>
              <Text {...labelStyle} color="#c0392b">
                Original Invoice No. <Text as="span" color="red.500">*</Text>
              </Text>
              <Box position="relative">
                <Input
                  {...inputStyle}
                  value={invoiceSearchQuery}
                  onChange={(e) => {
                    setInvoiceSearchQuery(e.target.value);
                    setShowInvoiceDropdown(true);
                  }}
                  onFocus={() => setShowInvoiceDropdown(true)}
                  placeholder={customerLedgerId ? "Search invoice..." : "Select party first"}
                  isDisabled={!customerLedgerId}
                />
                {showInvoiceDropdown && invoiceSearchList.length > 0 && (
                  <Box
                    position="absolute"
                    zIndex={999}
                    bg="white"
                    border="1px solid #d0d7de"
                    borderRadius="6px"
                    boxShadow="0 4px 12px rgba(0,0,0,0.15)"
                    maxH="200px"
                    overflowY="auto"
                    w="100%"
                    top="42px"
                  >
                    {invoiceSearchList
                      .filter((s) =>
                        !invoiceSearchQuery ||
                        (s.voucher_no || s.reference_no || String(s.id))
                          .toLowerCase()
                          .includes(invoiceSearchQuery.toLowerCase())
                      )
                      .map((sale) => (
                        <Box
                          key={sale.id}
                          px={3}
                          py={2}
                          fontSize="12px"
                          cursor="pointer"
                          _hover={{ bg: "#f0f4f0" }}
                          onClick={() => handleInvoiceSelect(sale)}
                        >
                          <Text fontWeight="600">{sale.voucher_no || sale.reference_no}</Text>
                          <Text color="#777" fontSize="11px">
                            {sale.sales_date || sale.created_at?.slice(0, 10)} | ₹{Number(sale.total_amount || 0).toFixed(2)}
                          </Text>
                        </Box>
                      ))}
                  </Box>
                )}
              </Box>
              {/* Click outside to close */}
              {showInvoiceDropdown && (
                <Box
                  position="fixed"
                  inset={0}
                  zIndex={998}
                  onClick={() => setShowInvoiceDropdown(false)}
                />
              )}
            </GridItem>

            {/* Sales Return Ledger */}
            <GridItem>
              <Text {...labelStyle}>Sales Return Ledger <Text as="span" color="red.500">*</Text></Text>
              <Select
                {...inputStyle}
                value={salesReturnLedgerId}
                onChange={(e) => setSalesReturnLedgerId(e.target.value)}
              >
                <option value="">-- Select Ledger --</option>
                {salesLedger.map((l) => (
                  <option key={l.id} value={l.id}>{l.ledger_name}</option>
                ))}
              </Select>
            </GridItem>

          </Grid>
        </Box>

        {/* ── Section 2: Assignment ── */}
        <Box {...sectionStyle}>
          <Box bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">
            <Text fontWeight="500" fontSize="sm">Assignment</Text>
          </Box>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={4} p={4}>
            <GridItem>
              <Text {...labelStyle}>Assign Employee</Text>
              <Select
                {...inputStyle}
                value={assignEmployee}
                onChange={(e) => {
                  setAssignEmployee(e.target.value);
                  setEmployeeUnderId("");
                }}
              >
                <option value="">-- Select --</option>
                <option value="Applicable">Applicable</option>
                <option value="Not Applicable">Not Applicable</option>
              </Select>
            </GridItem>
            {assignEmployee === "Applicable" && (
              <GridItem>
                <Text {...labelStyle}>Employee Under</Text>
                <Select
                  {...inputStyle}
                  value={employeeUnderId}
                  onChange={(e) => setEmployeeUnderId(e.target.value)}
                >
                  <option value="">-- Select Employee --</option>
                  {(users || []).map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </Select>
              </GridItem>
            )}
          </Grid>
        </Box>

        {/* ── Section 3: Customer Info ── */}
        {customerLedgerId && (
          <Box {...sectionStyle}>
            <Box bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">
              <Text fontWeight="500" fontSize="sm">Customer Information</Text>
            </Box>
            <Grid templateColumns={{ base: "1fr", md: "repeat(3,1fr)" }} gap={4} p={4}>
              <Box>
                <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>Current Balance</Text>
                <Flex gap={1} align="center">
                  <Input {...readonlyInputStyle} value={customerInfo.current_balance} readOnly />
                  <Badge
                    colorScheme={customerInfo.balance_type === "Cr" ? "green" : "red"}
                    fontSize="10px" px={2} py={1}
                  >{customerInfo.balance_type}</Badge>
                </Flex>
              </Box>
              <Box>
                <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>Security Amount</Text>
                <Input {...readonlyInputStyle} value={customerInfo.security_amount} readOnly />
              </Box>
              <Box>
                <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>Credit Limit</Text>
                <Input {...readonlyInputStyle} value={customerInfo.credit_limit} readOnly />
              </Box>
            </Grid>
          </Box>
        )}

        {/* ── Section 4: Transport Details ── */}
        <Box {...sectionStyle}>
          <Box bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">
            <Text fontWeight="500" fontSize="sm">Transport Details</Text>
          </Box>
          <Grid templateColumns="1fr 1fr 1fr" gap={3} mt={4} px={4}>
            {[
              { label: "Dispatch Doc No", val: dispatchDocNo, set: setDispatchDocNo },
              { label: "Transport Name", val: transportName, set: setTransportName },
              { label: "Destination", val: destination, set: setDestination },
            ].map(({ label, val, set }) => (
              <Box key={label}>
                <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>{label}</Text>
                <Input value={val} onChange={(e) => set(e.target.value)} />
              </Box>
            ))}
          </Grid>
          <Grid templateColumns="1fr 1fr 1fr" gap={3} p={4}>
            {[
              { label: "Bill-T No.", val: billTNo, set: setBillTNo },
              { label: "Vehicle No.", val: vehicleNo, set: setVehicleNo },
              { label: "Transport Freight", val: transportFreight, set: setTransportFreight, type: "number" },
              { label: "E-Way Number", val: ewayNumber, set: setEwayNumber },
              { label: "Transporter GST", val: transporterGst, set: setTransporterGst },
              { label: "Delivery Place", val: deliveryPlace, set: setDeliveryPlace },
            ].map(({ label, val, set, type }) => (
              <Box key={label}>
                <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>{label}</Text>
                <Input type={type || "text"} value={val} onChange={(e) => set(e.target.value)} />
              </Box>
            ))}
          </Grid>
        </Box>

        {/* ── Section 5: Items Table (shown after invoice selected) ── */}
        {showItemsTable && (
          <Box {...sectionStyle} overflowX="auto">
            <Flex
              justify="space-between"
              align="center"
              bg="#4f9190"
              color="white"
              px={4}
              py={2}
              borderTopRadius="md"
            >
              <Text fontWeight="500" fontSize="sm">Return Items</Text>
              <Button
                size="xs"
                padding={3}
                fontWeight="500"
                marginRight="4px"
                leftIcon={<AddIcon fontSize="11px" />}
                colorScheme="whiteAlpha"
                variant="solid"
                onClick={addItemRow}
                _hover={{ bg: "#2d595a" }}
              >
                Add Item
              </Button>
            </Flex>

            <Table
              size="sm"
              variant="simple"
              style={{ borderCollapse: "separate", borderSpacing: 0 }}
              className="material_mfg"
            >
              <Thead bg="gray.50">
                <Tr>
                  <Th {...thStyle} minW="140px">Name of Item</Th>
                  <Th {...thStyle} minW="100px">GoDown</Th>
                  <Th {...thStyle} minW="60px">Batch No.</Th>
                  <Th {...thStyle} minW="70px">Available</Th>
                  <Th {...thStyle} minW="70px">Return Qty.</Th>
                  <Th {...thStyle} minW="70px">Rate</Th>
                  <Th {...thStyle} minW="55px">Unit</Th>
                  <Th {...thStyle} minW="55px">Alt. Unit</Th>
                  <Th {...thStyle} minW="70px">Amount</Th>
                  <Th {...thStyle} minW="50px">IGST %</Th>
                  <Th {...thStyle} minW="70px">Tax Amt.</Th>
                  <Th {...thStyle} minW="85px">Total Amt.</Th>
                  <Th {...thStyle} minW="30px"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {items.map((item, index) => (
                  <Tr
                    key={index}
                    bg={index % 2 === 0 ? "white" : "#f7faf8"}
                    _hover={{ bg: "#edf5ef" }}
                  >
                    {/* Stock Item */}
                    <Td {...tdStyle}>
                      <Select
                        {...inputStyle}
                        fontSize="11px"
                        value={item.stock_item_id}
                        onChange={(e) => handleStockItemSelect(index, e.target.value)}
                        minW="140px"
                      >
                        <option value="">-- End Of List --</option>
                        {stockItemList.map((s) => (
                          <option key={s.id} value={s.id}>{s.item_name}</option>
                        ))}
                      </Select>
                    </Td>

                    {/* GoDown */}
                    <Td {...tdStyle}>
                      <Select
                        {...inputStyle}
                        value={item.godown_id}
                        onChange={(e) => handleGodownSelect(index, e.target.value)}
                        isDisabled={!item.stock_item_id}
                        minW="90px"
                      >
                        <option value="">Please Select</option>
                        {godownList.map((g) => (
                          <option key={g.id} value={g.id}>{g.godown_name}</option>
                        ))}
                      </Select>
                    </Td>

                    <Td {...tdStyle}>
                      <Input
                        {...readonlyInputStyle}
                        value={item.batch_no || (item.godown_id ? "N/A" : "")}
                        readOnly
                        minW="60px"
                        fontSize="11px"
                      />
                    </Td>

                    {/* Available */}
                    <Td {...tdStyle}>
                      <Input
                        {...readonlyInputStyle}
                        value={item.available_qty ?? 0}
                        readOnly
                        textAlign="right"
                        minW="60px"
                      />
                    </Td>

                    {/* Return Qty */}
                    <Td {...tdStyle}>
                      <Input
                        {...inputStyle}
                        type="number"
                        value={item.return_qty}
                        isDisabled={!item.godown_id}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (
                            item.available_to_return > 0 &&
                            Number(val) > item.available_to_return
                          ) {
                            toast({
                              description: `Max returnable qty: ${item.available_to_return}`,
                              status: "warning",
                              duration: 2000,
                              isClosable: true,
                            });
                            return;
                          }
                          handleItemChange(index, "return_qty", val);
                        }}
                        textAlign="right"
                        minW="60px"
                      />
                    </Td>

                    {/* Rate */}
                    <Td {...tdStyle}>
                      <Input
                        {...inputStyle}
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                        textAlign="right"
                        minW="60px"
                      />
                    </Td>

                    {/* Unit */}
                    <Td {...tdStyle}>
                      <Input
                        {...readonlyInputStyle}
                        value={item.unit_name}
                        readOnly
                        textAlign="center"
                        minW="50px"
                      />
                    </Td>

                    {/* Alt Unit */}
                    <Td {...tdStyle}>
                      <Input
                        {...readonlyInputStyle}
                        value={
                          item.alt_unit_qty && item.alt_unit_name
                            ? `${item.alt_unit_qty} ${item.alt_unit_name}`
                            : ""
                        }
                        readOnly
                        textAlign="center"
                        minW="55px"
                      />
                    </Td>

                    {/* Amount */}
                    <Td {...tdStyle}>
                      <Input
                        {...readonlyInputStyle}
                        value={Number(item.amount || 0).toFixed(2)}
                        readOnly
                        textAlign="right"
                        minW="60px"
                      />
                    </Td>

                    {/* IGST % */}
                    <Td {...tdStyle}>
                      <Input
                        {...inputStyle}
                        type="number"
                        value={item.igst_percent}
                        onChange={(e) =>
                          handleItemChange(index, "igst_percent", e.target.value)
                        }
                        textAlign="right"
                        minW="50px"
                      />
                    </Td>

                    {/* Tax Amount */}
                    <Td {...tdStyle}>
                      <Input
                        {...readonlyInputStyle}
                        value={Number(item.igst_amount || 0).toFixed(2)}
                        readOnly
                        textAlign="right"
                        minW="60px"
                      />
                    </Td>

                    {/* Total Amount */}
                    <Td {...tdStyle}>
                      <Input
                        value={Number(item.total_amount || 0).toFixed(2)}
                        readOnly
                        borderRadius="6px"
                        bg="#e8f5ec"
                        textAlign="right"
                        fontWeight="600"
                        color="#1e4a2e"
                        minW="60px"
                        size="sm"
                      />
                    </Td>

                    {/* Remove */}
                    <Td {...tdStyle} textAlign="center">
                      {items.length > 1 && (
                        <Button
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeItemRow(index)}
                          fontSize="14px"
                          minW="24px"
                          h="24px"
                          p={0}
                        >
                          ×
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            <Flex
              mt={2}
              justify="flex-end"
              gap={4}
              bg="#e4ede6"
              p={2}
              borderRadius="4px"
              fontSize="12px"
              fontWeight="600"
              color="#2d5a3d"
            >
              <Text>Subtotal: ₹{totals.subtotal.toFixed(2)}</Text>
              <Text>|</Text>
              <Text>Tax: ₹{totals.tax_total.toFixed(2)}</Text>
            </Flex>
          </Box>
        )}

        {/* ── Section 6: Bill References ── */}
        {showItemsTable && billReferences.length > 0 && (
          <Box {...sectionStyle}>
            <Flex
              justify="space-between"
              align="center"
              bg="#4f9190"
              color="white"
              px={4}
              py={2}
              borderTopRadius="md"
            >
              <Text fontWeight="500" fontSize="sm">Bill References (Against Invoice)</Text>
              <Button
                size="xs"
                padding={3}
                fontWeight="500"
                leftIcon={<AddIcon fontSize="11px" />}
                colorScheme="whiteAlpha"
                variant="solid"
                onClick={addBillRefRow}
                _hover={{ bg: "#2d595a" }}
              >
                Add Row
              </Button>
            </Flex>
            <Table size="sm" variant="simple" className="material_mfg">
              <Thead bg="gray.50">
                <Tr>
                  <Th {...thStyle}>Bill Reference</Th>
                  <Th {...thStyle}>Pending Amount</Th>
                  <Th {...thStyle}>Adjust Amount</Th>
                  <Th {...thStyle} minW="30px"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {billRefRows.map((row, index) => (
                  <Tr key={index} bg={index % 2 === 0 ? "white" : "#f7faf8"}>
                    <Td {...tdStyle}>
                      <Select
                        {...inputStyle}
                        value={row.sales_bill_reference_id}
                        onChange={(e) =>
                          handleBillRefChange(index, "sales_bill_reference_id", e.target.value)
                        }
                        minW="180px"
                      >
                        <option value="">-- Select Bill Reference --</option>
                        {billReferences.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.bill_no || `Ref #${b.id}`} — ₹{Number(b.pending_amount || 0).toFixed(2)} pending
                          </option>
                        ))}
                      </Select>
                    </Td>
                    <Td {...tdStyle}>
                      <Input
                        {...readonlyInputStyle}
                        value={
                          row.sales_bill_reference_id
                            ? Number(row.pending_amount || 0).toFixed(2)
                            : ""
                        }
                        readOnly
                        textAlign="right"
                        minW="80px"
                      />
                    </Td>
                    <Td {...tdStyle}>
                      <Input
                        {...inputStyle}
                        type="number"
                        value={row.amount}
                        onChange={(e) => handleBillRefChange(index, "amount", e.target.value)}
                        textAlign="right"
                        minW="80px"
                        placeholder="0.00"
                      />
                    </Td>
                    <Td {...tdStyle} textAlign="center">
                      {billRefRows.length > 1 && (
                        <Button
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeBillRefRow(index)}
                          fontSize="14px"
                          minW="24px"
                          h="24px"
                          p={0}
                        >
                          ×
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        {/* ── Section 7: Totals + Narration ── */}
        <Box {...sectionStyle} mt={4} padding={3}>
          <Grid templateColumns="1fr 320px" gap={5}>
            {/* Narration */}
            <Box>
              <Box bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">
                <Text fontWeight="500" fontSize="sm">Narration</Text>
              </Box>
              <Textarea
                size="sm"
                placeholder="Enter narration / remarks..."
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                rows={6}
                borderColor="#c8d0d8"
                bg="white"
                _focus={{ borderColor: "#3d7a52" }}
                resize="vertical"
              />
            </Box>

            {/* Tax Summary */}
            <Box>
              <Box bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">
                <Text fontWeight="500" fontSize="sm">Tax Summary</Text>
              </Box>
              <Box bg="white" border="1px solid #d0d7de" borderRadius="6px" overflow="hidden">
                {[
                  {
                    label: `IGST (${items.find((i) => i.igst_percent > 0)?.igst_percent ?? 0}%)`,
                    value: totals.igst_total,
                  },
                  {
                    label: `CGST (${items.find((i) => i.cgst_percent > 0)?.cgst_percent ?? 0}%)`,
                    value: totals.cgst_total,
                  },
                  {
                    label: `SGST (${items.find((i) => i.sgst_percent > 0)?.sgst_percent ?? 0}%)`,
                    value: totals.sgst_total,
                  },
                  { label: "Subtotal", value: totals.subtotal, divider: true },
                ].map(({ label, value, divider }) => (
                  <React.Fragment key={label}>
                    {divider && <Divider borderColor="#e0e8e2" />}
                    <Flex
                      justify="space-between"
                      align="center"
                      px={3}
                      py="6px"
                      borderBottom="1px solid #f0f4f0"
                    >
                      <Text fontSize="12px" color="#555" fontWeight="500">{label}</Text>
                      <Text fontSize="12px" color="#555" fontWeight="600">
                        ₹{Number(value || 0).toFixed(2)}
                      </Text>
                    </Flex>
                  </React.Fragment>
                ))}
                <Flex
                  justify="space-between"
                  align="center"
                  px={3}
                  py={2}
                  bg="#5d6e6e"
                >
                  <Text fontSize="13px" color="white" fontWeight="700">Total Amount</Text>
                  <Text fontSize="14px" color="white" fontWeight="800">
                    ₹{totals.total_amount.toFixed(2)}
                  </Text>
                </Flex>
              </Box>
            </Box>
          </Grid>
        </Box>

        {/* ── Save / Reset Buttons ── */}
        <Flex justify="flex-end" mt={2} gap={3}>
          <Button
            variant="outline"
            colorScheme="gray"
            size="sm"
            px={6}
            onClick={handleReset}
          >
            RESET
          </Button>
          <Button
            bg="#237086"
            fontWeight="500"
            fontSize="14px"
            color="white"
            _hover={{ bg: "#1B5A6B" }}
            px={12}
            borderRadius="12px"
            isLoading={saving}
            loadingText="SAVING..."
            onClick={handleSave}
            boxShadow="0 2px 8px rgba(45,90,61,0.4)"
          >
            SAVE
          </Button>
        </Flex>
      </Box>

      {/* ── Godown / Batch Modal ── */}
      <Modal isOpen={isGodownOpen} onClose={closeGodown} isCentered size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="8px" overflow="hidden">
          <ModalHeader
            bg="#4f9190"
            color="white"
            fontSize="14px"
            fontWeight="600" borderRadius="6px 6px 0px 0px"
            py={5}
          >
            Godown — Select Batch
          </ModalHeader>
          <ModalCloseButton color="white" top={1} />
          <ModalBody p={4}>
            <Table size="sm" variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th fontSize="11px">Batch No.</Th>
                  <Th fontSize="11px" isNumeric>Qty</Th>
                  <Th fontSize="11px">Mfg Dt.</Th>
                  <Th fontSize="11px">Expiry Dt.</Th>
                </Tr>
              </Thead>
              <Tbody>
                {/* Not Applicable row */}
                <Tr
                  cursor="pointer"
                  bg={selectedBatchNo === "NOT_APPLICABLE" ? "#d4edda" : "white"}
                  _hover={{ bg: "#f0f9f4" }}
                  onClick={() => setSelectedBatchNo("NOT_APPLICABLE")}
                >
                  <Td colSpan={4}>
                    <Flex align="center" gap={2}>
                      <Box
                        w="14px"
                        h="14px"
                        borderRadius="50%"
                        border="2px solid #4f9190"
                        bg={selectedBatchNo === "NOT_APPLICABLE" ? "#4f9190" : "transparent"}
                        flexShrink={0}
                      />
                      <Text fontSize="12px" fontWeight="600" color="#237086">
                        Not Applicable
                      </Text>
                    </Flex>
                  </Td>
                </Tr>

                {/* Batch rows */}
                {batchList.map((batch) => (
                  <Tr
                    key={batch.batch_no}
                    cursor="pointer"
                    bg={selectedBatchNo === batch.batch_no ? "#d4edda" : "white"}
                    _hover={{ bg: "#f0f9f4" }}
                    onClick={() => setSelectedBatchNo(batch.batch_no)}
                  >
                    <Td>
                      <Flex align="center" gap={2}>
                        <Box
                          w="14px"
                          h="14px"
                          borderRadius="50%"
                          border="2px solid #4f9190"
                          bg={selectedBatchNo === batch.batch_no ? "#4f9190" : "transparent"}
                          flexShrink={0}
                        />
                        <Text fontSize="12px">{batch.batch_no}</Text>
                      </Flex>
                    </Td>
                    <Td isNumeric fontSize="12px">
                      {/* Hide qty when Not Applicable is selected */}
                      {selectedBatchNo !== "NOT_APPLICABLE"
                        ? Number(batch.qty || 0).toFixed(2)
                        : "—"}
                    </Td>
                    <Td fontSize="12px">
                      {batch.mfg_date
                        ? new Date(batch.mfg_date).toLocaleDateString("en-IN")
                        : "—"}
                    </Td>
                    <Td fontSize="12px">
                      {batch.expiry_date
                        ? new Date(batch.expiry_date).toLocaleDateString("en-IN")
                        : "—"}
                    </Td>
                  </Tr>
                ))}

                {batchList.length === 0 && (
                  <Tr>
                    <Td colSpan={4} textAlign="center" color="#999" fontSize="12px" py={3}>
                      No batches found for this godown.
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>

            {/* Show qty field only when a real batch is selected */}
            {selectedBatchNo && selectedBatchNo !== "NOT_APPLICABLE" && (
              <Box mt={3} p={3} bg="#f7faf8" borderRadius="6px" border="1px solid #d0d7de">
                <Text fontSize="12px" fontWeight="600" color="#555" mb={1}>
                  Available Qty for selected batch
                </Text>
                <Input
                  {...readonlyInputStyle}
                  value={
                    batchList.find((b) => b.batch_no === selectedBatchNo)?.qty ?? 0
                  }
                  readOnly
                />
              </Box>
            )}

            <Flex justify="flex-end" mt={4} gap={3}>
              <Button
                size="sm"
                variant="outline"
                colorScheme="gray"
                onClick={closeGodown}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                bg="#4f9190"
                color="white"
                _hover={{ bg: "#3d7a7a" }}
                isDisabled={!selectedBatchNo}
                onClick={handleGodownSave}
              >
                SAVE
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GenerateCreditNote;