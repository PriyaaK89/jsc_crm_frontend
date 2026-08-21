import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box, Text, HStack, Input, Select, Table, Thead, Tbody, Tr, Th, Td,
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, Textarea, Button, Flex,
  Grid, GridItem, Badge, useToast, Spinner, Center, IconButton,
} from "@chakra-ui/react";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import { GoHomeFill } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import {
  fetchGodownList, fetchLedgerDropdown, fetchLedgerDetailsByID,
  fetchStockItemDetailsByID,
  fetchAssignedLedgerDropdown,
} from "../../Apis/commanApi";

const round2 = (n) => Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;

// ── Design tokens (matching SalesCreate.jsx) ──
const sectionStyle = { bg: "white", border: "1px solid #d0d7de", borderRadius: "6px", p: 0, mb: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" };
const sectionHeaderStyle = { bg: "#4f9190", color: "white", px: 4, py: 2, borderTopRadius: "md" };
const labelStyle = { fontSize: "12px", color: "#494949", marginBottom: "3px" };
const inputStyle = { size: "sm", borderRadius: "6px", borderColor: "#c8d0d8", bg: "white", fontSize: "12px", height: "40px", _focus: { borderColor: "#3d7a52", boxShadow: "0 0 0 1px #3d7a52" } };
const readonlyInputStyle = { ...inputStyle, bg: "#f0f4f0", color: "#555" };
const thStyle = { borderColor: "#c8d8cc", p: "6px 4px", fontWeight: "700", letterSpacing: "0.3px", whiteSpace: "nowrap", fontSize: "11px" };
const tdStyle = { p: "2px 3px", borderColor: "#e0e8e2", verticalAlign: "middle" };

const makeEmptyItem = () => ({
  stock_item_id: "", item_name: "", unit_id: "", unit_name: "",
  return_qty: 0, rate: 0, amount: 0,
  igst_percent: 0, cgst_percent: 0, sgst_percent: 0,
  igst_amount: 0, cgst_amount: 0, sgst_amount: 0,
  tax_percent: 0, tax_amount: 0,
  total_amount: 0, godown_id: "", batch_no: "",
  available_qty: 0, available_to_return: 0,
});

const Credit = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const billTImageRef = useRef();
  const dispatchDocImageRef = useRef();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [ledgerList, setLedgerList] = useState([]);
  const [stockItemList, setStockItemList] = useState([]);
  const [creditNoteNo, setCreditNoteNo] = useState("");
  const [voucherTypeId, setVoucherTypeId] = useState(null);
  const [orderNo, setOrderNo] = useState("");

  // ── Mode: "fromSales" | "manual" | null ──
  const [mode, setMode] = useState(null);

  // ── From Sales mode ──
  const [invoiceList, setInvoiceList] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [items, setItems] = useState([makeEmptyItem()]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    partyLedgerId: "",
    isConsignee: "No",
    dealerName: "", proprietorName: "", consigneeContactNo: "",
    consigneeAddress: "", consigneeGstnNo: "",
    currentBalance: "0", securityAmount: "0", balanceType: "Dr",
    creditLimit: "Not Specified",
    transportName: "",
    narration: "",
    billTImageFile: null,
    billTImagePreview: "",
    dispatchDocImageFile: null,
    dispatchDocImagePreview: "",
  });

  // ── Init ──
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadVoucherNo(),
          loadLedgerDropdown(),
          loadStockItems(),
          fetchNextOrderNumber(),
        ]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadVoucherNo = async () => {
    try {
      const res = await API.get(`${API_ENDPOINTS.GET_NEXTVOUCHER_NO}?voucher_type=CREDIT_NOTE`);
      setCreditNoteNo(res.data.voucher_no || "");
      setVoucherTypeId(res.data.voucher_type_id || null);
    } catch (err) {
      console.error("Error fetching next voucher no", err);
    }
  };

  const loadLedgerDropdown = async () => setLedgerList(await fetchAssignedLedgerDropdown());

  const loadStockItems = async () => {
    const res = await API.get(API_ENDPOINTS.GET_STOCK_ITEM_DROPDOWN);
    setStockItemList(res?.data?.data || []);
  };

  const fetchNextOrderNumber = async () => {
    try {
      const res = await API.get(`${API_ENDPOINTS.GET_NEXT_ORDER_NUMBER}?transaction_type=CREDIT_NOTE`);
      if (res.data.success) setOrderNo(res.data.next_order_no);
    } catch (err) {
      console.error("Error fetching next order number", err);
    }
  };

  // ── Auto-fill ledger details on party select ──
  useEffect(() => {
    if (!formData.partyLedgerId) return;
    const load = async () => {
      const details = await fetchLedgerDetailsByID(formData.partyLedgerId);
      if (details) {
        setFormData((prev) => ({
          ...prev,
          currentBalance: details.current_balance,
          balanceType: details.balance_type,
          securityAmount: details.security_amount,
          creditLimit: details.credit_limit,
        }));
      }
    };
    load();

    // Fetch sales history for "Select from Sales" mode
    const loadInvoices = async () => {
      try {
        const res = await API.get(
          `${API_ENDPOINTS.GET_SALES_BY_CUSTOMER || "/get-sales-by-customer"}?customer_ledger_id=${formData.partyLedgerId}`
        );
        setInvoiceList(res?.data?.data || []);
      } catch (e) {
        console.error("Error fetching sales history", e);
        setInvoiceList([]);
      }
    };
    loadInvoices();

    // reset mode-dependent state on party change
    setMode(null);
    setSelectedInvoiceId("");
    setSelectedInvoice(null);
    setItems([makeEmptyItem()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.partyLedgerId]);

  // ── Item recalculation ──
  const recalculateItem = (item) => {
    const qty = Number(item.return_qty) || 0;
    const rate = Number(item.rate) || 0;
    const amount = round2(qty * rate);

    const igstP = Number(item.igst_percent) || 0;
    const cgstP = Number(item.cgst_percent) || 0;
    const sgstP = Number(item.sgst_percent) || 0;

    let igst_amount = 0, cgst_amount = 0, sgst_amount = 0, tax_percent = 0;

    if (igstP > 0) {
      igst_amount = round2((amount * igstP) / 100);
      tax_percent = igstP;
    } else if (cgstP > 0 || sgstP > 0) {
      cgst_amount = round2((amount * cgstP) / 100);
      sgst_amount = round2((amount * sgstP) / 100);
      tax_percent = round2(cgstP + sgstP);
    }

    const tax_amount = round2(igst_amount + cgst_amount + sgst_amount);

    return {
      ...item,
      amount,
      igst_amount,
      cgst_amount,
      sgst_amount,
      tax_amount,
      tax_percent,
      total_amount: round2(amount + tax_amount),
    };
  };

  // ── Mode switch ──
  const selectMode = (m) => {
    setMode(m);
    setSelectedInvoiceId("");
    setSelectedInvoice(null);
    setItems(m === "manual" ? [makeEmptyItem()] : []);
  };

  // ── "From Sales": pick invoice → auto-populate items ──
  const handleInvoiceSelect = async (saleId) => {
    setSelectedInvoiceId(saleId);
    if (!saleId) {
      setSelectedInvoice(null);
      setItems([]);
      return;
    }

    const invoice = invoiceList.find((s) => String(s.id) === String(saleId));
    setSelectedInvoice(invoice || null);

    try {
      const res = await API.get(
        `${API_ENDPOINTS.GET_SALE_ITEMS_BY_ID || "/get-sales-item"}/${saleId}/items`
      );
      const saleItems = res?.data?.data || [];
      const populated = saleItems.map((si) =>
        recalculateItem({
          ...makeEmptyItem(),
          stock_item_id: si.stock_item_id,
          item_name: si.item_name || si.stock_item_name || "",
          godown_id: si.godown_id || "",
          batch_no: si.batch_no || "",
          rate: Number(si.rate || 0),
          unit_id: si.unit_id || "",
          unit_name: si.base_unit_name || "",
          igst_percent: Number(si.igst_percent || 0),
          cgst_percent: Number(si.cgst_percent || 0),
          sgst_percent: Number(si.sgst_percent || 0),
          available_qty: Number(si.available_to_return || 0),
          available_to_return: Number(si.available_to_return || 0),
        })
      );
      setItems(populated.length ? populated : [makeEmptyItem()]);
    } catch (e) {
      console.error("Error fetching sale items", e);
      setItems([makeEmptyItem()]);
    }
  };

  // ── "Without Invoice": manual item select ──
  const handleItemSelect = async (index, stockItemId) => {
    if (!stockItemId) {
      setItems((prev) => {
        const updated = [...prev];
        updated[index] = makeEmptyItem();
        return updated;
      });
      return;
    }

    const selectedItem = stockItemList.find((i) => String(i.id) === String(stockItemId));
    if (!selectedItem) return;

    const details = await fetchStockItemDetailsByID(stockItemId);

    setItems((prev) => {
      const updated = [...prev];
      const gstRate = Number(details?.rate_of_duty || 0);
      const cgst_percent = round2(gstRate / 2);
      const sgst_percent = round2(gstRate / 2);

      updated[index] = recalculateItem({
        ...makeEmptyItem(),
        stock_item_id: stockItemId,
        item_name: selectedItem.name || selectedItem.item_name,
        unit_id: details?.unit_id || selectedItem.unit_id || "",
        unit_name: details?.unit_name || selectedItem.unit_name || "",
        rate: Number(details?.rate || 0),
        cgst_percent,
        sgst_percent,
      });
      return updated;
    });
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = recalculateItem({ ...updated[index], [field]: value });
      return updated;
    });
  };

  const addRow = () => setItems((prev) => [...prev, makeEmptyItem()]);

  const removeRow = (index) => {
    if (items.length === 1) {
      setItems([makeEmptyItem()]);
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const onReturnQtyChange = (index, value) => {
    const item = items[index];
    const qty = Number(value) || 0;
    if (mode === "fromSales" && item.available_to_return > 0 && qty > item.available_to_return) {
      toast({
        title: `Max returnable qty: ${item.available_to_return}`,
        status: "warning", duration: 2500, isClosable: true,
      });
      return;
    }
    handleItemChange(index, "return_qty", value);
  };

  // ── Totals ──
  const totals = useMemo(() => {
    let subtotal = 0, igst = 0, cgst = 0, sgst = 0, taxTotal = 0, totalAmount = 0;
    items.forEach((item) => {
      subtotal += Number(item.amount || 0);
      igst += Number(item.igst_amount || 0);
      cgst += Number(item.cgst_amount || 0);
      sgst += Number(item.sgst_amount || 0);
      taxTotal += Number(item.tax_amount || 0);
      totalAmount += Number(item.total_amount || 0);
    });
    return {
      subtotal: round2(subtotal), igst: round2(igst), cgst: round2(cgst),
      sgst: round2(sgst), taxTotal: round2(taxTotal), totalAmount: round2(totalAmount),
    };
  }, [items]);

  // ── Images ──
  const handleBillTImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, billTImageFile: file, billTImagePreview: URL.createObjectURL(file) }));
  };

  const handleDispatchDocImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, dispatchDocImageFile: file, dispatchDocImagePreview: URL.createObjectURL(file) }));
  };

  // ── Submit ──
  const handleSave = async () => {
    if (!formData.partyLedgerId) {
      toast({ title: "Party A/c is required", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (!mode) {
      toast({ title: "Please choose Select from Sales or Without Invoice", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (mode === "fromSales" && !selectedInvoiceId) {
      toast({ title: "Please select an original invoice", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    const filledItems = items.filter((i) => i.stock_item_id && Number(i.return_qty) > 0);
    if (filledItems.length === 0) {
      toast({ title: "At least one item with return quantity is required", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    if (!formData.billTImageFile) {
      toast({ title: "Bill-T Image is required", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    const hasIGST = filledItems.some((i) => Number(i.igst_percent || 0) > 0);

    const normalizedItems = filledItems.map((item) => {
      if (hasIGST) {
        return { ...item, cgst_percent: 0, cgst_amount: 0, sgst_percent: 0, sgst_amount: 0 };
      }
      return { ...item, igst_percent: 0, igst_amount: 0 };
    });

    const formDataObj = new FormData();
    formDataObj.append("customer_ledger_id", formData.partyLedgerId);
    formDataObj.append("credit_note_date", formData.date);
    formDataObj.append("original_sale_id", mode === "fromSales" ? selectedInvoiceId : "");
    formDataObj.append("is_consignee", formData.isConsignee === "Yes");
    formDataObj.append("dealer_name", formData.dealerName || "");
    formDataObj.append("proprietor_name", formData.proprietorName || "");
    formDataObj.append("consignee_contact_no", formData.consigneeContactNo || "");
    formDataObj.append("consignee_address", formData.consigneeAddress || "");
    formDataObj.append("consignee_gstn_no", formData.consigneeGstnNo || "");
    formDataObj.append("transport_name", formData.transportName || "");
    formDataObj.append("narration", formData.narration || "");
    formDataObj.append("voucher_no", creditNoteNo);
    formDataObj.append("voucher_type_id", voucherTypeId || "");
    formDataObj.append("subtotal", totals.subtotal);
    formDataObj.append("igst_total", hasIGST ? totals.igst : 0);
    formDataObj.append("cgst_total", hasIGST ? 0 : totals.cgst);
    formDataObj.append("sgst_total", hasIGST ? 0 : totals.sgst);
    formDataObj.append("tax_total", totals.taxTotal);
    formDataObj.append("total_amount", totals.totalAmount);
    formDataObj.append("items", JSON.stringify(normalizedItems));
    formDataObj.append("bill_references", JSON.stringify([]));

    if (formData.billTImageFile) {
      formDataObj.append("bill_t_image", formData.billTImageFile);
    }
    if (formData.dispatchDocImageFile) {
      formDataObj.append("dispatch_doc_image", formData.dispatchDocImageFile);
    }

    setSubmitting(true);
    try {
      const res = await API.post(
        API_ENDPOINTS.CREATE_CREDIT_NOTE_APPROVAL_REQUEST || "/transaction-approval/create-credit-note-approval-request",
        formDataObj,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res?.data?.success) {
        toast({ title: "Credit note submitted for approval", status: "success", duration: 3000, isClosable: true });
        navigate(-1);
      } else {
        toast({ title: "Error", description: res?.data?.message || "Failed to submit", status: "error", duration: 3000, isClosable: true });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to submit credit note",
        status: "error", duration: 3000, isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Center h="60vh"><Spinner size="xl" color="#4f9190" /></Center>;

  return (
    <Box
      bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }}
      borderRadius="lg" boxShadow="md"
    >
      {/* Breadcrumb */}
      <HStack justifyContent="space-between">
        <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/dashboard">
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink fontSize="13px">Credit Note</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      <Text fontSize="lg" fontWeight="bold" mb={6}>
        Create Credit Note Request
      </Text>

      {/* Section 1: Voucher Details */}
      <Box {...sectionStyle}>
        <Box {...sectionHeaderStyle}><Text fontWeight="500" fontSize="sm">Credit Note Details</Text></Box>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={4} p={4}>
          {/* <GridItem>
            <Text {...labelStyle} color="#c0392b" fontWeight="600">Credit Note No.</Text>
            <Input {...readonlyInputStyle} value={creditNoteNo} readOnly />
          </GridItem> */}
          <GridItem>
            <Text {...labelStyle} color="#c0392b" fontWeight="600">Order No.</Text>
            <Input {...readonlyInputStyle} value={orderNo} readOnly />
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>Date <Text as="span" color="red.500">*</Text></Text>
            <Input
              {...inputStyle}
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            />
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>Party A/c Name <Text as="span" color="red.500">*</Text></Text>
            <Select
              {...inputStyle}
              value={formData.partyLedgerId}
              onChange={(e) => setFormData((prev) => ({ ...prev, partyLedgerId: e.target.value }))}
            >
              <option value="">-- Please Select --</option>
              {ledgerList.map((l) => (
                <option key={l.id} value={l.id}>{l.ledger_name || l.name}</option>
              ))}
            </Select>
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>Is Consignee</Text>
            <Select
              {...inputStyle}
              value={formData.isConsignee}
              onChange={(e) => setFormData((prev) => ({ ...prev, isConsignee: e.target.value }))}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </Select>
          </GridItem>
        </Grid>
      </Box>
           {/* Section 3: Consignee (conditional) */}
           {formData.isConsignee === "Yes" && (
        <Box {...sectionStyle}>
          <Box {...sectionHeaderStyle}><Text fontWeight="500" fontSize="sm">Consignee Details</Text></Box>
          <Box overflowX="auto">
            <Table size="sm">
              <Thead bg="gray.50">
                <Tr>
                  {["Dealer Name", "Prop. Name", "Contact No.", "Address", "GSTN No."].map((h) => (
                    <Th key={h} {...thStyle}>{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td {...tdStyle}><Input {...inputStyle} value={formData.dealerName} onChange={(e) => setFormData((p) => ({ ...p, dealerName: e.target.value }))} /></Td>
                  <Td {...tdStyle}><Input {...inputStyle} value={formData.proprietorName} onChange={(e) => setFormData((p) => ({ ...p, proprietorName: e.target.value }))} /></Td>
                  <Td {...tdStyle}><Input {...inputStyle} value={formData.consigneeContactNo} onChange={(e) => setFormData((p) => ({ ...p, consigneeContactNo: e.target.value }))} /></Td>
                  <Td {...tdStyle}><Input {...inputStyle} value={formData.consigneeAddress} onChange={(e) => setFormData((p) => ({ ...p, consigneeAddress: e.target.value }))} /></Td>
                  <Td {...tdStyle}><Input {...inputStyle} value={formData.consigneeGstnNo} onChange={(e) => setFormData((p) => ({ ...p, consigneeGstnNo: e.target.value }))} /></Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}

      {/* Section 2: Customer Info (Current Balance) */}
      {formData.partyLedgerId && (
        <Box {...sectionStyle}>
          <Box {...sectionHeaderStyle}><Text fontWeight="500" fontSize="sm">Customer Information</Text></Box>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3,1fr)" }} gap={4} p={4}>
            <Box>
              <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>Current Balance</Text>
              <Flex gap={1} align="center">
                <Input {...readonlyInputStyle} value={formData.currentBalance} readOnly />
                <Badge colorScheme={formData.balanceType === "Cr" ? "green" : "red"} fontSize="10px" px={2} py={1}>
                  {formData.balanceType}
                </Badge>
              </Flex>
            </Box>
            <Box>
              <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>Security Amount</Text>
              <Input {...readonlyInputStyle} value={formData.securityAmount} readOnly />
            </Box>
            <Box>
              <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>Credit Limit</Text>
              <Input {...readonlyInputStyle} value={formData.creditLimit} readOnly />
            </Box>
          </Grid>
        </Box>
      )}

 

      {/* Section 4: Mode Selector */}
      {formData.partyLedgerId && (
        <Box {...sectionStyle}>
          <Box {...sectionHeaderStyle}><Text fontWeight="500" fontSize="sm">How do you want to raise this credit note?</Text></Box>
          <Flex gap={4} p={4}>
            <Button
              flex={1}
              variant={mode === "fromSales" ? "solid" : "outline"}
              bg={mode === "fromSales" ? "#237086" : "white"}
              color={mode === "fromSales" ? "white" : "#237086"}
              borderColor="#237086"
              onClick={() => selectMode("fromSales")}
              fontSize="13px"
            >
              Select from Sales
            </Button>
            <Button
              flex={1}
              variant={mode === "manual" ? "solid" : "outline"}
              bg={mode === "manual" ? "#237086" : "white"}
              color={mode === "manual" ? "white" : "#237086"}
              borderColor="#237086"
              onClick={() => selectMode("manual")}
              fontSize="13px"
            >
              Without Invoice
            </Button>
          </Flex>
        </Box>
      )}

      {/* Section 5: Invoice Select (From Sales mode) */}
      {mode === "fromSales" && (
        <Box {...sectionStyle}>
          <Box {...sectionHeaderStyle}><Text fontWeight="500" fontSize="sm">Original Invoice</Text></Box>
          <Box p={4}>
            {invoiceList.length === 0 ? (
              <Text fontSize="12px" color="gray.500">No sales found for this party</Text>
            ) : (
              <Select
                {...inputStyle}
                value={selectedInvoiceId}
                onChange={(e) => handleInvoiceSelect(e.target.value)}
              >
                <option value="">-- Select Invoice --</option>
                {invoiceList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.voucher_no} · {s.sales_date} · ₹{Number(s.total_amount || 0).toFixed(2)}
                  </option>
                ))}
              </Select>
            )}
          </Box>
        </Box>
      )}

      {/* Section 6: Transport / Dispatch Details */}
      {mode && (
        <Box {...sectionStyle}>
          <Box {...sectionHeaderStyle}><Text fontWeight="500" fontSize="sm">Transport & Dispatch Details</Text></Box>
          <Table size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th {...thStyle}>Transport Name</Th>
                <Th {...thStyle}>Transport Bill-T</Th>
                <Th {...thStyle}>Dispatch Doc</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td {...tdStyle}>
                  <Input
                    {...inputStyle}
                    value={formData.transportName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, transportName: e.target.value }))}
                    placeholder="Enter transport name"
                  />
                </Td>
                <Td {...tdStyle}>
                  <Flex align="center" gap={2}>
                    <Button size="xs" variant="outline" colorScheme="teal" fontSize="11px" onClick={() => billTImageRef.current?.click()}>
                      Choose File
                    </Button>
                    <Text fontSize="11px" color="gray.500">
                      {formData.billTImageFile?.name || "No file chosen"}
                    </Text>
                    <input type="file" ref={billTImageRef} accept="image/*,application/pdf" style={{ display: "none" }} onChange={handleBillTImage} />
                  </Flex>
                </Td>
                <Td {...tdStyle}>
                  <Flex align="center" gap={2}>
                    <Button size="xs" variant="outline" colorScheme="teal" fontSize="11px" onClick={() => dispatchDocImageRef.current?.click()}>
                      Choose File
                    </Button>
                    <Text fontSize="11px" color="gray.500">
                      {formData.dispatchDocImageFile?.name || "No file chosen"}
                    </Text>
                    <input type="file" ref={dispatchDocImageRef} accept="image/*,application/pdf" style={{ display: "none" }} onChange={handleDispatchDocImage} />
                  </Flex>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Section 7: Return Items */}
      {mode && (mode === "manual" || selectedInvoiceId) && (
        <Box {...sectionStyle}>
          <Box {...sectionHeaderStyle}>
            <HStack justifyContent="space-between">
              <Text fontWeight="500" fontSize="sm">Return Items</Text>
              {mode === "manual" && (
                <Button size="xs" leftIcon={<AddIcon />} variant="outline" colorScheme="white" fontSize="11px" onClick={addRow}>
                  Add Row
                </Button>
              )}
            </HStack>
          </Box>
          <Box overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th {...thStyle} w="30px">#</Th>
                  <Th {...thStyle} minW="190px">Name of Item</Th>
                  <Th {...thStyle} minW="90px">Return Qty.</Th>
                  <Th {...thStyle} minW="90px">Rate</Th>
                  <Th {...thStyle} minW="70px">Unit</Th>
                  <Th {...thStyle} minW="100px">Amount</Th>
                  <Th {...thStyle} minW="80px">Tax %</Th>
                  <Th {...thStyle} minW="100px">Tax Amt.</Th>
                  <Th {...thStyle} minW="110px">Total Amt.</Th>
                  <Th {...thStyle} w="36px"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {items.map((item, index) => (
                  <Tr key={index} bg={index % 2 === 0 ? "white" : "#f7faf8"}>
                    <Td {...tdStyle}><Text fontSize="11px" color="#888" textAlign="center">{index + 1}</Text></Td>
                    <Td {...tdStyle}>
                      {mode === "manual" ? (
                        <Select {...inputStyle} value={item.stock_item_id} onChange={(e) => handleItemSelect(index, e.target.value)} minW="190px">
                          <option value="">-- Select Item --</option>
                          {stockItemList.map((s) => (
                            <option key={s.id} value={s.id}>{s.name || s.item_name}</option>
                          ))}
                        </Select>
                      ) : (
                        <Input {...readonlyInputStyle} value={item.item_name} readOnly minW="190px" />
                      )}
                    </Td>
                    <Td {...tdStyle}>
                      <Input
                        {...inputStyle}
                        type="number"
                        min={0}
                        value={item.return_qty}
                        onChange={(e) => onReturnQtyChange(index, e.target.value)}
                        textAlign="right"
                        isDisabled={!item.stock_item_id}
                      />
                    </Td>
                    <Td {...tdStyle}>
                      <Input
                        {...inputStyle}
                        type="number"
                        min={0}
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                        textAlign="right"
                        isDisabled={!item.stock_item_id}
                      />
                    </Td>
                    <Td {...tdStyle}>
                      <Input {...readonlyInputStyle} value={item.unit_name} readOnly textAlign="center" minW="60px" />
                    </Td>
                    <Td {...tdStyle}>
                      <Input {...readonlyInputStyle} value={item.amount.toFixed(2)} readOnly textAlign="right" />
                    </Td>
                    <Td {...tdStyle}>
                      <Input {...readonlyInputStyle} value={item.tax_percent > 0 ? `${item.tax_percent}` : "0"} readOnly textAlign="center" />
                    </Td>
                    <Td {...tdStyle}>
                      <Input {...readonlyInputStyle} value={item.tax_amount.toFixed(2)} readOnly textAlign="right" />
                    </Td>
                    <Td {...tdStyle}>
                      <Input {...readonlyInputStyle} value={item.total_amount.toFixed(2)} readOnly textAlign="right" />
                    </Td>
                    <Td {...tdStyle} textAlign="center">
                      {mode === "manual" && (
                        <IconButton icon={<CloseIcon />} size="xs" variant="ghost" colorScheme="red" aria-label="Remove row" onClick={() => removeRow(index)} />
                      )}
                    </Td>
                  </Tr>
                ))}
                {items.length === 0 && (
                  <Tr>
                    <Td colSpan={10} textAlign="center" py={4} color="gray.400" fontSize="12px" fontStyle="italic">
                      No items in this credit note
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}

      {/* Totals */}
      {mode && (
        <Box bg="#f0f4f0" p={3} border="1px solid #d0d7de" my={4} borderRadius="8px">
          <Grid templateColumns="repeat(5, 1fr)" gap={3}>
            {[
              { label: "Subtotal", value: totals.subtotal },
              { label: "IGST Total", value: totals.igst },
              { label: "CGST Total", value: totals.cgst },
              { label: "SGST Total", value: totals.sgst },
              { label: "Total Amount", value: totals.totalAmount },
            ].map(({ label, value }) => (
              <Box key={label}>
                <Text fontSize="11px" color="#555" fontWeight="600">{label}</Text>
                <Input {...readonlyInputStyle} value={value.toFixed(2)} readOnly textAlign="right" />
              </Box>
            ))}
          </Grid>
        </Box>
      )}

      {/* Narration */}
      {mode && (
        <Box {...sectionStyle} p={4}>
          <Text {...labelStyle}>Narration</Text>
          <Textarea
            value={formData.narration}
            rows={3}
            borderColor="#c8d0d8"
            bg="white"
            onChange={(e) => setFormData((p) => ({ ...p, narration: e.target.value }))}
            placeholder="Enter narration..."
            fontSize="12px"
          />
        </Box>
      )}

      {/* Footer */}
      {mode && (
        <Flex justify="flex-end" mt={2} mb={4}>
          <Button
            bg="#237086" color="white" _hover={{ bg: "#1B5A6B" }} px={10}
            borderRadius="12px" isLoading={submitting} loadingText="Saving..."
            onClick={handleSave} boxShadow="0 2px 8px rgba(45,90,61,0.4)"
            fontSize="14px" fontWeight="500"
          >
            SAVE
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default Credit;