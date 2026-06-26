import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box, Grid, GridItem, Input, Select, Checkbox, Text, Button, Table,
  Thead, Tbody, Tr, Th, Td, Textarea,
  useToast, Spinner, Center, Flex, Badge, IconButton,
  HStack,
} from "@chakra-ui/react";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import useUsersapi from "../../Apis/GetUsersapi";
import {
  fetchNextVoucherNo, fetchGodownList, fetchLedgerDropdown,
  fetchLedgerDetailsByID, fetchStockItemDetailsByID,
} from "../../Apis/commanApi";

const round2 = (n) => Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;

// ── Design tokens ──
const sectionStyle = { bg: "white", border: "1px solid #d0d7de", borderRadius: "6px", p: 0, mb: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" };
const sectionHeaderStyle = { bg: "#4f9190", color: "white", px: 4, py: 2, borderTopRadius: "md" };
const labelStyle = { fontSize: "12px", color: "#494949", marginBottom: "3px" };
const inputStyle = { size: "sm", borderRadius: "6px", borderColor: "#c8d0d8", bg: "white", fontSize: "12px", height: "40px", _focus: { borderColor: "#3d7a52", boxShadow: "0 0 0 1px #3d7a52" } };
const readonlyInputStyle = { ...inputStyle, bg: "#f0f4f0", color: "#555" };
const thStyle = { borderColor: "#c8d8cc", p: "6px 4px", fontWeight: "700", letterSpacing: "0.3px", whiteSpace: "nowrap", fontSize: "11px" };
const tdStyle = { p: "2px 3px", borderColor: "#e0e8e2", verticalAlign: "middle" };

const makeEmptyItem = () => ({
  stock_item_id: "", item_name: "", unit_id: "", unit_name: "",
  billed_qty: 0, rate: 0, amount: 0,
  igst_percent: 0, cgst_percent: 0, sgst_percent: 0,
  igst_amount: 0, cgst_amount: 0, sgst_amount: 0,
  tax_percent: 0, tax_amount: 0,
  total_amount: 0, godown_id: "", godown_name: "", batch_no: "Not Applicable",
  available_qty: 0,
  gst_applicable: 0, rate_of_duty: 0,
   sale_rate: 0,        
  supercash_price: 0,  // ← add
});

const SalesCreate = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { users } = useUsersapi();
  const orderBillRef = useRef();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [godownList, setGodownList] = useState([]);
  const [ledgerList, setLedgerList] = useState([]);
  const [salesLedgerOptions, setSalesLedgerOptions] = useState([]);
  const [stockItemList, setStockItemList] = useState([]);
  const [voucherInfo, setVoucherInfo] = useState({ voucher_no: "", voucher_type_id: null });
  const [orderNo, setOrderNo] = useState("");

  // Single empty row on load
  const [items, setItems] = useState([makeEmptyItem()]);

  const [formData, setFormData] = useState({
    salesNo: "",
    reference_no: "",
    date: new Date().toISOString().split("T")[0],
    partyLedgerId: "",
    isConsignee: "No",
    dealerName: "", proprietorName: "", consigneeContactNo: "",
    consigneeAddress: "", consigneeGstnNo: "",
    currentBalance: "0", securityAmount: "0", balanceType: "Dr",
    creditLimit: "Not Specified",
    transportName: "", ewayNumber: "", transporterGst: "", deliveryPlace: "",
    employeeUnder: "",
    salesLedgerId: "",
    narration: "",
    setOverdueReminder: true,
    orderBillImageFile: null,
    orderBillImagePreview: "",
  });

  const [isSupercash, setIsSupercash] = useState(false);

  // ── Init ──
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadVoucherNo(),
          loadGodownList(),
          loadLedgerDropdown(),
          loadSalesLedgerDropdown(),
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
    const result = await fetchNextVoucherNo("SALES");
    if (result) {
      setVoucherInfo(result);
      setFormData(prev => ({ ...prev, salesNo: result.voucher_no || "" }));
    }
  };

  const loadGodownList = async () => setGodownList(await fetchGodownList());
  const loadLedgerDropdown = async () => setLedgerList(await fetchLedgerDropdown());

  const loadSalesLedgerDropdown = async () => {
    const res = await API.get(API_ENDPOINTS.GET_SALES_LEDGER_DROPDOWN);
    setSalesLedgerOptions(res?.data?.data || []);
  };

  const loadStockItems = async () => {
    const res = await API.get(API_ENDPOINTS.GET_STOCK_ITEM_DROPDOWN);
    setStockItemList(res?.data?.data || []);
  };

  const fetchNextOrderNumber = async () => {
    try {
      const response = await API.get(`${API_ENDPOINTS.GENERATE_NEXT_ORDER_NO}?transaction_type=SALES`);
      if (response.status === 200) { setOrderNo(response.data.next_order_no); }
    } catch (error) {
      console.error("Error fetching order number:", error);
    }
  };

  // ── Auto-fill ledger details on party select ──
  useEffect(() => {
    if (!formData.partyLedgerId) return;
    const ledger = ledgerList.find(l => String(l.id) === String(formData.partyLedgerId));
    if (ledger) setFormData(prev => ({ ...prev, partyLedgerName: ledger.ledger_name || ledger.name }));

    const load = async () => {
      const details = await fetchLedgerDetailsByID(formData.partyLedgerId);
      if (details) {
        setFormData(prev => ({
          ...prev,
          currentBalance: details.current_balance,
          balanceType: details.balance_type,
          securityAmount: details.security_amount,
          creditLimit: details.credit_limit,
        }));
      }
    };
    load();
  }, [formData.partyLedgerId, ledgerList]);

  // ── Item recalculation ──
  // tax_mode per item: if igst_percent > 0 → IGST only; if cgst_percent > 0 → CGST+SGST only.
  // IGST and CGST/SGST are mutually exclusive — never added together.
  const recalculateItem = (item) => {
    const qty    = Number(item.billed_qty) || 0;
    const rate   = Number(item.rate)       || 0;
    const amount = round2(qty * rate);

    const igstP = Number(item.igst_percent) || 0;
    const cgstP = Number(item.cgst_percent) || 0;
    const sgstP = Number(item.sgst_percent) || 0;

    let igst_amount = 0, cgst_amount = 0, sgst_amount = 0, tax_percent = 0;

    if (igstP > 0) {
      // IGST mode — CGST/SGST zeroed out
      igst_amount  = round2((amount * igstP) / 100);
      cgst_amount  = 0;
      sgst_amount  = 0;
      tax_percent  = igstP;
    } else if (cgstP > 0 || sgstP > 0) {
      // CGST + SGST mode — IGST zeroed out
      igst_amount  = 0;
      cgst_amount  = round2((amount * cgstP) / 100);
      sgst_amount  = round2((amount * sgstP) / 100);
      tax_percent  = round2(cgstP + sgstP);   // e.g. 9+9 = 18%
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

  // ── When stock item selected — fetch full details via fetchStockItemDetailsByID ──
  const handleItemSelect = async (index, stockItemId) => {
    if (!stockItemId) {
      setItems(prev => {
        const updated = [...prev];
        updated[index] = makeEmptyItem();
        return updated;
      });
      return;
    }

    const selectedItem = stockItemList.find(i => String(i.id) === String(stockItemId));
    if (!selectedItem) return;

    const details = await fetchStockItemDetailsByID(stockItemId);

    setItems(prev => {
      const updated = [...prev];
      const base = makeEmptyItem();

      // gst_applicable is a boolean (0/1) — NOT the rate.
      // rate_of_duty is the actual GST % (e.g. "18.00" → 18).
      const gstRate = Number(details?.rate_of_duty || 0);

      // CGST/SGST (intra-state) by default — split gstRate equally.
      // Change useIGST = true for inter-state / IGST transactions.
      const useIGST = false;

      const igst_percent = useIGST ? gstRate : 0;
      const cgst_percent = useIGST ? 0 : round2(gstRate / 2);
      const sgst_percent = useIGST ? 0 : round2(gstRate / 2);

      const sale_rate       = Number(details?.rate || 0);
      const supercash_price = Number(details?.supercash_price || 0);

    // ← pick rate based on current supercash toggle
      const rate = isSupercash ? supercash_price : sale_rate;

      updated[index] = recalculateItem({
        ...base,
        stock_item_id: stockItemId,
        item_name:     selectedItem.name || selectedItem.item_name,
        unit_id:       details?.unit_id   || selectedItem.unit_id   || "",
        unit_name:     details?.unit_name || selectedItem.unit_name || "",
        // rate:          details?.rate      || selectedItem.sale_rate || selectedItem.rate || 0,
        rate,
         sale_rate,        // ← store both
      supercash_price,
        available_qty: details?.available_qty || 0,
        gst_applicable: Number(details?.gst_applicable || 0),
        rate_of_duty:  gstRate,
        igst_percent,
        cgst_percent,
        sgst_percent,
      });
      return updated;
    });
  };

  const handleItemChange = (index, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = recalculateItem({ ...updated[index], [field]: value });
      return updated;
    });
  };

  // ── Row management ──
  const addRow = () => setItems(prev => [...prev, makeEmptyItem()]);

  const removeRow = (index) => {
    if (items.length === 1) {
      // Reset the last row instead of removing
      setItems([makeEmptyItem()]);
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // ── Totals ──
  const totals = useMemo(() => {
    let igst = 0, cgst = 0, sgst = 0, taxTotal = 0, totalAmount = 0, subtotal = 0;
    items.forEach(item => {
      subtotal += Number(item.amount || 0);
      igst += Number(item.igst_amount || 0);
      cgst += Number(item.cgst_amount || 0);
      sgst += Number(item.sgst_amount || 0);
      taxTotal += Number(item.tax_amount || 0);
      totalAmount += Number(item.total_amount || 0);
    });
    return {
      subtotal: round2(subtotal),
      igst: round2(igst),
      cgst: round2(cgst),
      sgst: round2(sgst),
      taxTotal: round2(taxTotal),
      totalAmount: round2(totalAmount),
    };
  }, [items]);

  // ── Bill image ──
  const handleOrderBillImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData(prev => ({
      ...prev,
      orderBillImageFile: file,
      orderBillImagePreview: URL.createObjectURL(file),
    }));
  };

  // ── Submit ──
  const handleSave = async () => {
    if (!formData.partyLedgerId) {
      toast({ title: "Party A/c is required", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (!formData.orderBillImageFile) {
      toast({ title: "Upload Document is required", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    const filledItems = items.filter(i => i.stock_item_id && Number(i.billed_qty) > 0);
    if (filledItems.length === 0) {
      toast({ title: "At least one item with quantity is required", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    const hasIGST = filledItems.some(i => Number(i.igst_percent || 0) > 0);
    const tax_mode = hasIGST ? "IGST" : "CGST_SGST";

    // Zero out the irrelevant tax columns per tax_mode
    const normalizedItems = filledItems.map(item => {
      if (tax_mode === "IGST") {
        return { ...item, cgst_percent: 0, cgst_amount: 0, sgst_percent: 0, sgst_amount: 0 };
      } else {
        return { ...item, igst_percent: 0, igst_amount: 0 };
      }
    });

    const payload = {
      customer_ledger_id: formData.partyLedgerId,
      is_consignee: formData.isConsignee === "Yes" ? "1" : "0",
      dealer_name: formData.dealerName,
      proprietor_name: formData.proprietorName,
      consignee_contact_no: formData.consigneeContactNo,
      consignee_address: formData.consigneeAddress,
      consignee_gstn_no: formData.consigneeGstnNo,
      reference_no: formData.reference_no,
      narration: formData.narration,
      transport_name: formData.transportName,
      eway_number: formData.ewayNumber,
      transporter_gst: formData.transporterGst,
      delivery_place: formData.deliveryPlace,
      employee_under: formData.employeeUnder,
      sales_ledger_id: formData.salesLedgerId,
      voucher_no: formData.salesNo,
      voucher_type_id: voucherInfo.voucher_type_id,
      order_no: orderNo,
      sales_date: formData.date,
      is_supercash_sale: isSupercash ? "1" : "0", 
      tax_mode,
      subtotal: totals.subtotal,
      tax_total: totals.taxTotal,
      igst_total: tax_mode === "IGST" ? totals.igst : 0,
      cgst_total: tax_mode === "CGST_SGST" ? totals.cgst : 0,
      sgst_total: tax_mode === "CGST_SGST" ? totals.sgst : 0,
      total_amount: totals.totalAmount,
      items: JSON.stringify(normalizedItems),
    };

    const formDataObj = new FormData();
    formDataObj.append("payload_json", JSON.stringify(payload));
    formDataObj.append("orderBillImage", formData.orderBillImageFile);

    setSubmitting(true);
    try {
      await API.post(
        API_ENDPOINTS.CREATE_SALE_REQUEST_AS_JUNIOR_ACCOUNTANT,
        formDataObj,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast({ title: "Sales order submitted for approval", status: "success", duration: 3000, isClosable: true });
      navigate(-1);
    } catch (err) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to submit sales order",
        status: "error", duration: 3000, isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
  setItems(prev =>
    prev.map(item => {
      if (!item.stock_item_id) return item; // skip empty rows
      const rate = isSupercash
        ? (item.supercash_price || item.sale_rate || 0)
        : (item.sale_rate || 0);
      return recalculateItem({ ...item, rate });
    })
  );
}, [isSupercash]);

  if (loading) return <Center h="60vh"><Spinner size="xl" color="#4f9190" /></Center>;

  return (
    <Box>
      {/* Section 1: Voucher Details */}
      <Box {...sectionStyle}>
        <Box {...sectionHeaderStyle}><Text fontWeight="500" fontSize="sm">Voucher Details</Text></Box>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={4} p={4}>
          <GridItem>
            <Text {...labelStyle} color="#c0392b" fontWeight="600">Order No.</Text>
            <Input {...readonlyInputStyle} value={orderNo} readOnly />
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>Date</Text>
            <Input {...inputStyle} type="date" value={formData.date}
              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))} />
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>Reference No.</Text>
            <Input {...inputStyle} value={formData.reference_no}
              onChange={e => setFormData(prev => ({ ...prev, reference_no: e.target.value }))}
              placeholder="Enter reference no." />
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>
              Party A/c Name <Text as="span" color="red.500">*</Text>
            </Text>
            <Select {...inputStyle} value={formData.partyLedgerId}
              onChange={e => setFormData(prev => ({ ...prev, partyLedgerId: e.target.value }))}>
              <option value="">-- Select Party --</option>
              {ledgerList.map(l => (
                <option key={l.id} value={l.id}>{l.ledger_name || l.name}</option>
              ))}
            </Select>
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>Is Consignee</Text>
            <Select {...inputStyle} value={formData.isConsignee} 
            // maxW="200px"
              onChange={e => setFormData(prev => ({ ...prev, isConsignee: e.target.value }))}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </Select>
          </GridItem>
            <GridItem>
  <Text {...labelStyle}>Is Supercash Sale?</Text>
  <Flex align="center" gap={3} mt={1}>
    <Select
      {...inputStyle}
    //   maxW="200px"
      value={isSupercash ? "Yes" : "No"}
      onChange={e => setIsSupercash(e.target.value === "Yes")}
    >
      <option value="No">No</option>
      <option value="Yes">Yes</option>
    </Select>
    {isSupercash && (
      <Badge colorScheme="orange" fontSize="11px" px={2} py={1}>
        Supercash Prices Active
      </Badge>
    )}
  </Flex>
</GridItem>
          <GridItem colSpan={{ base: 1, md: 2 }}>
            <Flex align="center" gap={3}>
              <Checkbox isChecked={formData.setOverdueReminder} colorScheme="teal" size="sm"
                onChange={e => setFormData(prev => ({ ...prev, setOverdueReminder: e.target.checked }))} />
              <Text fontSize="12px" color="green.600" fontWeight="500">Set Default OverDue Reminder</Text>
            </Flex>
          </GridItem>
        
        </Grid>
      </Box>

      {/* Section 2: Consignee (conditional) */}
      {formData.isConsignee === "Yes" && (
        <Box {...sectionStyle}>
          <Box {...sectionHeaderStyle}><Text fontWeight="500" fontSize="sm">Consignee Details</Text></Box>
          <Box overflowX="auto">
            <Table size="sm">
              <Thead bg="gray.50">
                <Tr>
                  {["Dealer Name", "Prop. Name", "Contact No.", "Address", "GSTN No."].map(h => (
                    <Th key={h} {...thStyle}>{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td {...tdStyle}><Input {...inputStyle} value={formData.dealerName} onChange={e => setFormData(p => ({ ...p, dealerName: e.target.value }))} /></Td>
                  <Td {...tdStyle}><Input {...inputStyle} value={formData.proprietorName} onChange={e => setFormData(p => ({ ...p, proprietorName: e.target.value }))} /></Td>
                  <Td {...tdStyle}><Input {...inputStyle} value={formData.consigneeContactNo} onChange={e => setFormData(p => ({ ...p, consigneeContactNo: e.target.value }))} /></Td>
                  <Td {...tdStyle}><Input {...inputStyle} value={formData.consigneeAddress} onChange={e => setFormData(p => ({ ...p, consigneeAddress: e.target.value }))} /></Td>
                  <Td {...tdStyle}><Input {...inputStyle} value={formData.consigneeGstnNo} onChange={e => setFormData(p => ({ ...p, consigneeGstnNo: e.target.value }))} /></Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}

      {/* Section 3: Customer Info */}
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

      {/* Section 4: Stock Items */}
      <Box {...sectionStyle}>
        <Box {...sectionHeaderStyle}>
            <HStack justifyContent="space-between">
          <Text fontWeight="500" fontSize="sm">Stock Items</Text>
            
          <Button
            size="xs"
            leftIcon={<AddIcon />}
            variant="outline"
            colorScheme="white"
            fontSize="11px"
            onClick={addRow}
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
                <Th {...thStyle} minW="190px">Name of Item</Th>
                <Th {...thStyle} minW="90px">Billed Qty.</Th>
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
                  {/* Row number */}
                  <Td {...tdStyle}>
                    <Text fontSize="11px" color="#888" textAlign="center">{index + 1}</Text>
                  </Td>

                  {/* Item select */}
                  <Td {...tdStyle}>
                    <Select {...inputStyle} value={item.stock_item_id}
                      onChange={e => handleItemSelect(index, e.target.value)} minW="190px">
                      <option value="">-- Select Item --</option>
                      {stockItemList.map(s => (
                        <option key={s.id} value={s.id}>{s.name || s.item_name}</option>
                      ))}
                    </Select>
                  </Td>

                  {/* Billed Qty */}
                  <Td {...tdStyle}>
                    <Input {...inputStyle} type="number" min={0} value={item.billed_qty}
                      onChange={e => handleItemChange(index, "billed_qty", e.target.value)}
                      textAlign="right" isDisabled={!item.stock_item_id} />
                  </Td>

                  {/* Rate */}
                  <Td {...tdStyle}>
                    <Input {...inputStyle} type="number" min={0} value={item.rate}
                      onChange={e => handleItemChange(index, "rate", e.target.value)}
                      textAlign="right" isDisabled={!item.stock_item_id} />
                  </Td>

                  {/* Unit */}
                  <Td {...tdStyle}>
                    <Input {...readonlyInputStyle} value={item.unit_name} readOnly textAlign="center" minW="60px" />
                  </Td>

                  {/* Amount (qty × rate) */}
                  <Td {...tdStyle}>
                    <Input {...readonlyInputStyle} value={item.amount.toFixed(2)} readOnly textAlign="right" />
                  </Td>

                  {/* Tax % (combined) */}
                  <Td {...tdStyle}>
                    <Input
                      {...readonlyInputStyle}
                      value={item.tax_percent > 0 ? `${item.tax_percent}` : "0"}
                      readOnly textAlign="center"
                    />
                  </Td>

                  {/* Tax Amount */}
                  <Td {...tdStyle}>
                    <Input {...readonlyInputStyle} value={item.tax_amount.toFixed(2)} readOnly textAlign="right" />
                  </Td>

                  {/* Total Amount */}
                  <Td {...tdStyle}>
                    <Input {...readonlyInputStyle} value={item.total_amount.toFixed(2)} readOnly textAlign="right" />
                  </Td>

                  {/* Remove row */}
                  <Td {...tdStyle} textAlign="center">
                    <IconButton
                      icon={<CloseIcon />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      aria-label="Remove row"
                      onClick={() => removeRow(index)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
     
      </Box>

           {/* Totals row */}
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

      {/* Section 5: Narration + Upload */}
      <Box {...sectionStyle} p={4}>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={4}>
          <Box>
            <Text {...labelStyle}>Narration</Text>
            <Textarea value={formData.narration} rows={3} borderColor="#c8d0d8" bg="white"
              onChange={e => setFormData(p => ({ ...p, narration: e.target.value }))}
              placeholder="Enter narration..." fontSize="12px" />
          </Box>
          <Box>
            <Text {...labelStyle}>
              Upload Document <Text as="span" color="red.500">*</Text>
            </Text>
            <Flex align="center" gap={2} mt={1}>
              <Button size="sm" variant="outline" colorScheme="teal" fontSize="12px"
                onClick={() => orderBillRef.current?.click()}>
                Choose File
              </Button>
              <Text fontSize="11px" color="gray.500">
                {formData.orderBillImageFile?.name || "No file chosen"}
              </Text>
              <input type="file" ref={orderBillRef} accept="image/*,application/pdf"
                style={{ display: "none" }} onChange={handleOrderBillImage} />
            </Flex>
            {formData.orderBillImagePreview && (
              <Box mt={2} border="1px solid #d0d7de" borderRadius="6px" overflow="hidden" maxW="200px">
                <img src={formData.orderBillImagePreview} alt="Bill" style={{ width: "100%", objectFit: "cover" }} />
              </Box>
            )}
          </Box>
        </Grid>
      </Box>

      {/* Footer */}
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
    </Box>
  );
};

export default SalesCreate;