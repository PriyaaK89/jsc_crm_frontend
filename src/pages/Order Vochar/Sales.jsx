import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box, Grid, GridItem, Input, Select, Checkbox, Text, Button, Table, Thead, Tbody,
  Tr, Th, Td, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, FormControl, FormLabel, Textarea, useToast, Spinner,
  Center, Flex, Badge, Divider,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import useUsersapi from "../../Apis/GetUsersapi";
import {
  fetchNextVoucherNo, fetchGodownList, fetchLedgerDropdown,
  fetchAvailableStock, fetchBatches, fetchLedgerDetailsByID,
} from "../../Apis/commanApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const round2 = (num) => Math.round((Number(num || 0) + Number.EPSILON) * 100) / 100;

const safeParseJSON = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { return fallback; }
};

const cleanQuoted = (val) => {
  if (val === undefined || val === null) return "";
  let str = String(val);
  if (str.length >= 2 && str.startsWith('"') && str.endsWith('"')) str = str.slice(1, -1);
  return str;
};

const formatDateForInput = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const sectionStyle = {
  bg: "white", border: "1px solid #d0d7de", borderRadius: "6px",
  p: 0, mb: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};
const sectionHeaderStyle = {
  bg: "#4f9190", color: "white", px: 4, py: 2, borderTopRadius: "md",
};
const labelStyle = { fontSize: "12px", color: "#494949", marginBottom: "3px" };
const inputStyle = {
  size: "sm", borderRadius: "6px", borderColor: "#c8d0d8", bg: "white",
  fontSize: "12px", height: "40px",
  _focus: { borderColor: "#3d7a52", boxShadow: "0 0 0 1px #3d7a52" },
};
const readonlyInputStyle = { ...inputStyle, bg: "#f0f4f0", color: "#555" };
const thStyle = {
  borderColor: "#c8d8cc", p: "6px 4px", fontWeight: "700",
  letterSpacing: "0.3px", whiteSpace: "nowrap", fontSize: "11px",
};
const tdStyle = { p: "2px 3px", borderColor: "#e0e8e2", verticalAlign: "middle" };

// ─── Godown modal initial state ───────────────────────────────────────────────
const emptyGodownModal = {
  isOpen: false,
  itemIndex: null,
  godownId: "",
  godownName: "",
  batchNo: "Not Applicable",
  batches: [],
  mfgDate: "",
  expiryDate: "",
  remindExpiry: "No",
  remindDate: "",
};

// ─── Dispatcher/Senior approval levels ───────────────────────────────────────
const DISPATCHER_LEVELS = ["DISPATCHER", "SENIOR"];

// ─── Component ────────────────────────────────────────────────────────────────
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
  const [docPreviewOpen, setDocPreviewOpen] = useState(false);
  const [dispatchPreview, setDispatchPreview] = useState({ isOpen: false, url: "", title: "" });
  const [extraLedgers, setExtraLedgers] = useState([
    { ledger_id: "", amount: "", comments: "" },
  ]);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
const [returnRemarks, setReturnRemarks] = useState("");
const [returnImageFile, setReturnImageFile] = useState(null);
const returnImageRef = useRef();
const [errors, setErrors] = useState({});

  // Dispatcher/Senior extra fields
  const [dispatchData, setDispatchData] = useState({
    dispatchDocNo: "",
    dispatchDocImage: null,
    dispatchDocImageFile: null,
    billTNo: "",
    billTImage: null,
    billTImageFile: null,
    vehicleNo: "",
    transportFreight: "0",
    localFreight: "0",
    loadFreight: "0",
    unloadFreight: "0",
    destination: "",
  });

  const dispatchDocRef = useRef();
  const billTImageRef = useRef();

  const [formData, setFormData] = useState({
    salesNo: "",
    orderNo: "",
    reference_no: "",
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
    balanceType: "Dr",
    creditLimit: "Not Specified",
    transportName: "",
    ewayNumber: "",
    transporterGst: "",
    deliveryPlace: "",
    employeeUnder: "",
    salesLedgerId: "",
    narration: "",
    isBillModified: "",
    orderDocumentPath: "",
    orderDocumentUrl: "",
  });

  // ─── Derived: is dispatcher or senior level ───────────────────────────────
  const isReturned = approval?.status === "RETURNED";
const isReturnedToMe = approval?.returned_to_user_id === approval?.current_approver_id;
const canResubmit = isReturned && isReturnedToMe;
  const isDispatcherOrSenior = approval
    ? DISPATCHER_LEVELS.includes(approval.approval_level)
    : false;

  // ─── Init ──────────────────────────────────────────────────────────────────
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
    } catch (err) { console.log("Error fetching next voucher no", err); }
  };

  const loadGodownList = async () => { setGodownList(await fetchGodownList()); };
  const loadLedgerDropdown = async () => { setLedgerList(await fetchLedgerDropdown()); };

  const loadSalesLedgerDropdown = async () => {
    try {
      const response = await API.get(`${API_ENDPOINTS.GET_SALES_LEDGER_DROPDOWN}`);
      setSalesLedgerOptions(response?.data?.data || []);
    } catch (err) { console.log("Error fetching sales ledger dropdown", err); }
  };

  const loadApprovalDetails = async () => {
    try {
      const response = await API.get(`${API_ENDPOINTS.GET_PENDING_APPROVALS_BY_ID}/${approvalId}`);
      const data = response?.data?.data;
      if (!data) return;
      setApproval(data);
      const payload = data.payload_json || {};
      const parsedItems = safeParseJSON(payload.items, []);

      setFormData((prev) => ({
        ...prev,
        orderNo: data.id ?? "",
        date: formatDateForInput(data.created_at),
        //  FIX: read reference_no from payload_json
        reference_no: cleanQuoted(payload.reference_no),
        partyLedgerId: payload.customer_ledger_id || "",
        isConsignee: payload.is_consignee === "1" ? "Yes" : "No",
        dealerName: cleanQuoted(payload.dealer_name),
        proprietorName: cleanQuoted(payload.proprietor_name),
        consigneeContactNo: cleanQuoted(payload.consignee_contact_no),
        consigneeAddress: cleanQuoted(payload.consignee_address),
        consigneeGstnNo: cleanQuoted(payload.consignee_gstn_no),
        narration: cleanQuoted(payload.narration),
        transportName: cleanQuoted(payload.transport_name),
        ewayNumber: cleanQuoted(payload.eway_number),
        transporterGst: cleanQuoted(payload.transporter_gst),
        deliveryPlace: cleanQuoted(payload.delivery_place),
        salesLedgerId: payload.sales_ledger_id || "",
        employeeUnder: data.created_by ?? "",
        isBillModified: data.is_bill_modified ? "Yes" : "No",
        orderDocumentPath: payload.orderBillImage || "",
        orderDocumentUrl: payload.orderBillImageUrl || "",
        dispatchDocImage: payload.dispatchDocImageUrl || "",
        billTImage: payload.billTImageUrl || "",
      }));

      // Pre-fill dispatcher fields if payload already has them (re-submission case)
      if (payload.dispatch_doc_no || payload.vehicle_no) {
        setDispatchData((prev) => ({
          ...prev,
          dispatchDocNo: cleanQuoted(payload.dispatch_doc_no),
          billTNo: cleanQuoted(payload.bill_t_no),
          vehicleNo: cleanQuoted(payload.vehicle_no),
          transportFreight: payload.transport_freight ?? "0",
          localFreight: payload.local_freight ?? "0",
          loadFreight: payload.load_freight ?? "0",
          unloadFreight: payload.unload_freight ?? "0",
          destination: cleanQuoted(payload.destination),
        }));
      }

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
      const parsedExtraLedgers = safeParseJSON(payload.extra_ledgers, []);
      if (parsedExtraLedgers.length > 0) {
        setExtraLedgers(parsedExtraLedgers.map(l => ({
          ledger_id: l.ledger_id || "",
          amount: l.amount || "",
          comments: l.comments || "",
        })));
      }
    } catch (error) {
      console.log("Error fetching approval details", error);
      toast({ title: "Error", description: "Failed to load sales order details", status: "error", duration: 3000, isClosable: true });
    }
  };

  useEffect(() => {
    if (!formData.partyLedgerId) return;
    const ledger = ledgerList.find((l) => String(l.id) === String(formData.partyLedgerId));
    if (ledger) {
      setFormData((prev) => ({ ...prev, partyLedgerName: ledger.ledger_name || ledger.name || "" }));
    }
    const loadLedgerDetails = async () => {
      const details = await fetchLedgerDetailsByID(formData?.partyLedgerId);
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
    loadLedgerDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.partyLedgerId, ledgerList]);

  // ─── Totals ────────────────────────────────────────────────────────────────
  const totals = useMemo(() => {
    let igst = 0, cgst = 0, sgst = 0, totalAmount = 0;
    const igstPercents = new Set(), cgstPercents = new Set(), sgstPercents = new Set();
    items.forEach((item) => {
      igst += Number(item.igst_amount || 0);
      cgst += Number(item.cgst_amount || 0);
      sgst += Number(item.sgst_amount || 0);
      totalAmount += Number(item.total_amount || 0);
      igstPercents.add(Number(item.igst_percent) || 0);
      cgstPercents.add(Number(item.cgst_percent) || 0);
      sgstPercents.add(Number(item.sgst_percent) || 0);
    });
    const singlePercent = (set) => (set.size === 1 ? [...set][0] : null);
    return {
      igst: round2(igst), cgst: round2(cgst), sgst: round2(sgst),
      totalAmount: round2(totalAmount),
      igstPercent: singlePercent(igstPercents),
      cgstPercent: singlePercent(cgstPercents),
      sgstPercent: singlePercent(sgstPercents),
    };
  }, [items]);

  const extraLedgerTotal = useMemo(() => {
    return extraLedgers.reduce((sum, row) => {
      const amt = Number(row.amount || 0);
      return sum + amt; // negative amounts auto-subtract
    }, 0);
  }, [extraLedgers]);

  const grandTotal = useMemo(() => {
    return round2(totals.totalAmount + extraLedgerTotal);
  }, [totals.totalAmount, extraLedgerTotal]);

  const validate = () => {
  const newErrors = {};

  if (approval?.approval_level === "SENIOR" && !formData.salesLedgerId) {
    newErrors.salesLedgerId = "Sales Ledger is required";
  }

  if (isDispatcherOrSenior) {
    if (!dispatchData.billTNo?.trim())       newErrors.billTNo = "Bill-T No. is required";
    if (!formData.transportName?.trim())     newErrors.transportName = "Transport Name is required";
    if (!dispatchData.destination?.trim())   newErrors.destination = "Destination is required";
    if (!dispatchData.dispatchDocNo?.trim()) newErrors.dispatchDocNo = "Dispatch Doc No. is required";
    if (!formData.deliveryPlace?.trim())     newErrors.deliveryPlace = "Delivery Place is required";

    if (!dispatchData.dispatchDocImageFile && !dispatchData.dispatchDocImage)
      newErrors.dispatchDocImage = "Dispatch Doc Image is required";

    if (!dispatchData.billTImageFile && !dispatchData.billTImage)
      newErrors.billTImage = "Bill-T Image is required";
  }

  return newErrors;
};

  const handleExtraLedgerChange = (index, field, value) => {
    setExtraLedgers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addExtraLedgerRow = () => {
    setExtraLedgers(prev => [...prev, { ledger_id: "", amount: "", comments: "" }]);
  };

  const removeExtraLedgerRow = (index) => {
    setExtraLedgers(prev => prev.filter((_, i) => i !== index));
  };

  // ─── Item helpers ──────────────────────────────────────────────────────────
  const recalculateItem = (item) => {
    const qty = Number(item.billed_qty) || 0;
    const rate = Number(item.rate) || 0;
    const amount = round2(qty * rate);
    const igst_amount = round2((amount * (Number(item.igst_percent) || 0)) / 100);
    const cgst_amount = round2((amount * (Number(item.cgst_percent) || 0)) / 100);
    const sgst_amount = round2((amount * (Number(item.sgst_percent) || 0)) / 100);
    return { ...item, amount, igst_amount, cgst_amount, sgst_amount, total_amount: round2(amount + igst_amount + cgst_amount + sgst_amount) };
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = recalculateItem({ ...updated[index], [field]: value });
      return updated;
    });
  };

  const handleRowGodownSelect = async (index, godownId) => {
    if (!godownId) return;

    const selectedGodown = godownList.find((g) => String(g.id) === String(godownId));
    const godownName = selectedGodown
      ? selectedGodown.godown_name || selectedGodown.name
      : godownId;

    // Open modal immediately
    setGodownModal({
      ...emptyGodownModal,
      isOpen: true,          // ← was never being set to true
      itemIndex: index,
      godownId,
      godownName,
      batchNo: "Not Applicable",
      batches: [],
    });

    // Fetch batches async and update modal
    const item = items[index];   // ← was missing, caused ReferenceError
    const batches = await fetchBatches(item.stock_item_id, godownId);
    setGodownModal((prev) =>
      prev.godownId === godownId    // guard: user may have changed godown before fetch returned
        ? { ...prev, batches }
        : prev
    );
  };

  const handleGodownModalBatchChange = (batchNo) => {
    const batchObj = godownModal.batches.find((b) => b.batch_no === batchNo);
    setGodownModal((prev) => ({
      ...prev,
      batchNo,
      mfgDate: formatDateForInput(batchObj?.mfg_date || ""),
      expiryDate: formatDateForInput(batchObj?.expiry_date || ""),
      selectedBatchQty: batchObj?.qty || null,   // ← store batch qty
    }));
  };

  const handleConfirmGodown = async () => {
    const { itemIndex, godownId, godownName, batchNo, selectedBatchQty } = godownModal;
    if (!godownId) {
      toast({ title: "Godown not selected", status: "warning", duration: 2500, isClosable: true });
      return;
    }

    let availableQty = 0;

    if (
      batchNo &&
      batchNo !== "Not Applicable" &&
      batchNo !== "NOT_APPLICABLE" &&
      selectedBatchQty != null
    ) {
      availableQty = selectedBatchQty;
    } else {
      const fetched = await fetchAvailableStock({
        itemId: items[itemIndex].stock_item_id,
        godownId,
      });
      availableQty = fetched ?? 0;  // ← fallback to 0 if null/undefined
    }

    setItems((prev) => {
      const updated = [...prev];
      updated[itemIndex] = recalculateItem({
        ...updated[itemIndex],
        godown_id: godownId,
        godown_name: godownName,
        batch_no: batchNo || "Not Applicable",
        available_qty: availableQty,   // ← explicitly set
        total_qty: availableQty,       // ← explicitly set same value
        _prevGodownId: undefined,
      });
      return updated;
    });

    setGodownModal(emptyGodownModal);
  };

  // ─── Dispatch image helpers ────────────────────────────────────────────────
  const handleDispatchDocImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDispatchData((prev) => ({
      ...prev,
      dispatchDocImageFile: file,
      dispatchDocImage: URL.createObjectURL(file),
    }));
    setErrors((prev) => ({ ...prev, dispatchDocImage: undefined }));
  };

  const handleBillTImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDispatchData((prev) => ({
      ...prev,
      billTImageFile: file,
      billTImage: URL.createObjectURL(file),
    }));
    setErrors((prev) => ({ ...prev, billTImage: undefined }));
  };

  // ─── Approve / Reject ──────────────────────────────────────────────────────
  const buildUpdatedPayload = () => {
    const hasCGST = items.some(item => Number(item.cgst_percent || 0) > 0);
    const hasIGST = items.some(item => Number(item.igst_percent || 0) > 0);
    const filledExtraLedgers = extraLedgers
      .filter(row => row.ledger_id && row.amount !== "" && Number(row.amount) !== 0)
      .map(row => ({
        ledger_id: row.ledger_id,
        amount: Math.abs(Number(row.amount)),       // always store positive
        operation: Number(row.amount) >= 0 ? "PLUS" : "MINUS",
        comments: row.comments || "",
      }));
    const base = {
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
      // total_amount: totals.totalAmount,
      total_amount: grandTotal,
      narration: formData.narration,
      reference_no: formData.reference_no,
      transport_name: formData.transportName,
      eway_number: formData.ewayNumber,
      transporter_gst: formData.transporterGst,
      delivery_place: formData.deliveryPlace,
      employee_under: formData.employeeUnder,
      sales_ledger_id: formData.salesLedgerId,
      voucher_no: formData.salesNo,
      voucher_type_id: voucherInfo.voucher_type_id,
      sales_date: formData.date,
      tax_mode: hasIGST ? "IGST" : "CGST_SGST",
      extra_ledgers: JSON.stringify(filledExtraLedgers),
      items: JSON.stringify(
        items.map((item) => ({
          ...item,
          godown_id: item.godown_id || item._prevGodownId || "",
        }))
      ),
      orderBillImage: formData.orderDocumentPath,
    };

    // Add dispatcher-level fields only when applicable
    if (isDispatcherOrSenior) {
      base.dispatch_doc_no = dispatchData.dispatchDocNo;
      base.bill_t_no = dispatchData.billTNo;
      base.vehicle_no = dispatchData.vehicleNo;
      base.transport_freight = dispatchData.transportFreight;
      base.local_freight = dispatchData.localFreight;
      base.load_freight = dispatchData.loadFreight;
      base.unload_freight = dispatchData.unloadFreight;
      base.destination = dispatchData.destination;
      // Note: actual file upload should be handled before calling this,

    }

    return base;
  };

  const handleReturn = async () => {
  if (!returnRemarks.trim()) {
    toast({
      title: "Return reason is required",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  if (!returnImageFile) {
    toast({
      title: "Return image is required",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  setSubmitting(true);
  try {
    const formDataObj = new FormData();
    formDataObj.append("reason", returnRemarks.trim());
    formDataObj.append("returnImage", returnImageFile, returnImageFile.name);

    await API.post(
      `${API_ENDPOINTS.RETURN_SALES_ORDER}/${approvalId}`,
      formDataObj,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    toast({
      title: "Returned",
      description: "Sales order returned successfully",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
    setReturnModalOpen(false);
    navigate(-1);
  } catch (error) {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Failed to return sales order",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setSubmitting(false);
  }
};

const handleResubmit = async () => {
  if (items.length === 0) {
    toast({
      title: "At least one item is required",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  setSubmitting(true);
  try {
    const payload = buildUpdatedPayload();

    await API.post(
      `${API_ENDPOINTS.RESUBMIT_SALES_ORDER}/${approvalId}`,
      payload                     // ← backend does JSON.stringify(req.body) directly
    );

    toast({
      title: "Resubmitted",
      description: "Sales order resubmitted successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    navigate(-1);
  } catch (error) {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Failed to resubmit sales order",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setSubmitting(false);
  }
};
  // Replace handleApprove
const handleApprove = async () => {
  if (items.length === 0) {
    toast({
      title: "At least one item is required",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setErrors({});
  setSubmitting(true);

  try {
    const payload = buildUpdatedPayload();
    const formDataObj = new FormData();

    formDataObj.append("remarks", "Approved");
    formDataObj.append("payload_json", JSON.stringify(payload));

    if (dispatchData.dispatchDocImageFile) {
      formDataObj.append(
        "dispatch_doc_image",
        dispatchData.dispatchDocImageFile,
        dispatchData.dispatchDocImageFile.name
      );
    }

    if (dispatchData.billTImageFile) {
      formDataObj.append(
        "bill_t_image",
        dispatchData.billTImageFile,
        dispatchData.billTImageFile.name
      );
    }

    await API.post(
      `${API_ENDPOINTS.CREATE_REQUEST_APPROVE}/${approvalId}`,
      formDataObj,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    toast({
      title: "Approved",
      description: "Sales order approved successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    navigate(-1);
  } catch (error) {
    console.error("APPROVE ERROR =>", error);
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
  if (!rejectRemarks.trim()) {
    toast({
      title: "Rejection reason is required",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  setSubmitting(true);
  try {
    await API.post(`${API_ENDPOINTS.REJECT_SALES_ORDER}/${approvalId}`, {
      reason: rejectRemarks.trim(),   // ← was "remarks", backend expects "reason"
    });
    toast({
      title: "Rejected",
      description: "Sales order rejected successfully",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
    setRejectModalOpen(false);
    navigate(-1);
  } catch (error) {
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

  const isImageDoc = () => /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i.test(formData.orderDocumentUrl || "");
  const isPdfDoc = () => /\.pdf(\?|$)/i.test(formData.orderDocumentUrl || "");

  const handleViewDocument = () => {
    if (!formData.orderDocumentUrl) {
      toast({ title: "No bill document attached", status: "warning", duration: 2500, isClosable: true });
      return;
    }
    setDocPreviewOpen(true);
  };

  if (loading) {
    return <Center h="60vh"><Spinner size="xl" color="#4f9190" /></Center>;
  }



  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Status bar */}
   {approval && (
  <Flex align="center" gap={2} mb={3}>
    <Box
      w="8px" h="8px"
      bg={isReturned ? "#d69e2e" : "#4f9190"}
      borderRadius="50%"
    />
    <Text fontSize="12px" color="gray.500">
      Created by{" "}
      <Text as="span" fontWeight="600" color="#333">{approval.created_by_name}</Text>
      &nbsp;&middot;&nbsp;{approval.current_status_message}
    </Text>
    <Badge
      ml={2}
      colorScheme={
        approval.status === "RETURNED" ? "yellow"
          : approval.approval_level === "DISPATCHER" ? "orange"
            : approval.approval_level === "SENIOR" ? "purple"
              : "teal"
      }
      fontSize="10px"
      px={2}
    >
      {approval.status === "RETURNED"
        ? `RETURNED → fix & resubmit`
        : approval.approval_level?.replace("_", " ")}
    </Badge>
  </Flex>
)}
      {/* ── Section 1: Voucher Details ── */}
      <Box {...sectionStyle}>
        <Box {...sectionHeaderStyle}>
          <Text fontWeight="500" fontSize="sm">Voucher Details</Text>
        </Box>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={4} p={4}>
          <GridItem>
            <Text {...labelStyle} color="#c0392b">Sales No.</Text>
            <Input {...readonlyInputStyle} value={formData.salesNo} readOnly />
          </GridItem>
          <GridItem>
            <Text {...labelStyle} color="#c0392b">Order No.</Text>
            <Input {...readonlyInputStyle} value={formData.orderNo} readOnly />
          </GridItem>
          {/*  Reference No now pre-filled from payload_json.reference_no */}
          <GridItem>
            <Text {...labelStyle}>Reference No.</Text>
            <Input
              {...inputStyle}
              value={formData.reference_no}
              onChange={(e) => setFormData((prev) => ({ ...prev, reference_no: e.target.value }))}
              placeholder="Enter reference no."
            />
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
            <Text {...labelStyle}>Party A/c Name</Text>
            <Select
              {...inputStyle}
              pointerEvents="none"
              bg="gray.100"
              value={formData.partyLedgerId}
              onChange={(e) => setFormData((prev) => ({ ...prev, partyLedgerId: e.target.value }))}
            >
              <option value="">-- Select Party --</option>
              {ledgerList.map((ledger) => (
                <option key={ledger.id} value={ledger.id}>{ledger.ledger_name || ledger.name}</option>
              ))}
            </Select>
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>Is Consignee</Text>
            <Select
              {...inputStyle}
              value={formData.isConsignee}
              onChange={(e) => setFormData((prev) => ({ ...prev, isConsignee: e.target.value }))}
              maxW="200px"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </Select>
          </GridItem>
          <GridItem colSpan={{ base: 1, md: 2 }}>
            <Flex align="center" gap={3}>
              <Checkbox
                isChecked={formData.setOverdueReminder}
                onChange={(e) => setFormData((prev) => ({ ...prev, setOverdueReminder: e.target.checked }))}
                colorScheme="teal"
                size="sm"
              />
              <Text fontSize="12px" color="green.600" fontWeight="500">Set Default OverDue Reminder</Text>
            </Flex>
          </GridItem>
        </Grid>
      </Box>

      {/* ── Section 2: Consignee Details (conditional) ── */}
      {formData.isConsignee === "Yes" && (
        <Box {...sectionStyle}>
          <Box {...sectionHeaderStyle}>
            <Text fontWeight="500" fontSize="sm">Consignee Details</Text>
          </Box>
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
                <Tr bg="white">
                  <Td {...tdStyle}><Input {...inputStyle} value={formData.dealerName} onChange={(e) => setFormData((prev) => ({ ...prev, dealerName: e.target.value }))} minW="140px" /></Td>
                  <Td {...tdStyle}><Input {...inputStyle} value={formData.proprietorName} onChange={(e) => setFormData((prev) => ({ ...prev, proprietorName: e.target.value }))} minW="140px" /></Td>
                  <Td {...tdStyle}><Input {...inputStyle} value={formData.consigneeContactNo} onChange={(e) => setFormData((prev) => ({ ...prev, consigneeContactNo: e.target.value }))} minW="120px" /></Td>
                  <Td {...tdStyle}><Input {...inputStyle} value={formData.consigneeAddress} onChange={(e) => setFormData((prev) => ({ ...prev, consigneeAddress: e.target.value }))} minW="180px" /></Td>
                  <Td {...tdStyle}><Input {...inputStyle} value={formData.consigneeGstnNo} onChange={(e) => setFormData((prev) => ({ ...prev, consigneeGstnNo: e.target.value }))} minW="140px" /></Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}

      {/* ── Section 3: Customer Information ── */}
      {formData.partyLedgerId && (
        <Box {...sectionStyle}>
          <Box {...sectionHeaderStyle}>
            <Text fontWeight="500" fontSize="sm">Customer Information</Text>
          </Box>
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

      {/* ── Section 4: Transport Details ── */}
      <Box {...sectionStyle}>
        <Box {...sectionHeaderStyle}>
          <Text fontWeight="500" fontSize="sm">Transport Details</Text>
        </Box>
        <Grid templateColumns={{ base: "1fr", md: "repeat(3,1fr)" }} gap={4} p={4}>
         <FormControl isInvalid={!!errors.transportName}>
            <Text {...labelStyle}>Transport Name</Text>
            <Input {...inputStyle} value={formData.transportName} 
            onChange={(e) => {
  setFormData((prev) => ({ ...prev, transportName: e.target.value }));
  if (e.target.value) setErrors((prev) => ({ ...prev, transportName: undefined }));
}} />
  {errors.transportName && (
    <Text fontSize="11px" color="red.500" mt="2px">{errors.transportName}</Text>
  )}

          </FormControl>
          <Box>
            <Text {...labelStyle}>E-Way Number</Text>
            <Input {...inputStyle} value={formData.ewayNumber} onChange={(e) => setFormData((prev) => ({ ...prev, ewayNumber: e.target.value }))} />
          </Box>
          <Box>
            <Text {...labelStyle}>Transporter GST</Text>
            <Input {...inputStyle} value={formData.transporterGst} onChange={(e) => setFormData((prev) => ({ ...prev, transporterGst: e.target.value }))} />
          </Box>
          <Box>
            <FormControl isInvalid={!!errors.deliveryPlace}>
            <Text {...labelStyle}>Delivery Place</Text>
            <Input {...inputStyle} value={formData.deliveryPlace} 
            onChange={(e) => {
  setFormData((prev) => ({ ...prev, deliveryPlace: e.target.value }));
  if (e.target.value) setErrors((prev) => ({ ...prev, deliveryPlace: undefined }));
}} />
 {errors.deliveryPlace && (
    <Text fontSize="11px" color="red.500" mt="2px">{errors.deliveryPlace}</Text>
  )}
</FormControl>
          </Box>
        </Grid>
      </Box>

      {/* ── Section 5: Dispatch & Transport Details (Dispatcher / Senior only) ── */}
      {isDispatcherOrSenior && (
        <Box {...sectionStyle}>
          <Box {...sectionHeaderStyle} bg="#7b5ea7">
            <Flex align="center" gap={2}>
              <Box w="8px" h="8px" bg="white" borderRadius="50%" opacity={0.8} />
              <Text fontWeight="500" fontSize="sm">
                Dispatch & Transport Details
                <Text as="span" fontSize="10px" fontWeight="400" ml={2} opacity={0.85}>
                  ({approval?.approval_level?.replace("_", " ")} level)
                </Text>
              </Text>
            </Flex>
          </Box>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3,1fr)" }} gap={4} p={4}>
            {/* Row 1 */}
            <Box>
              <FormControl isInvalid={!!errors.dispatchDocNo}>
              <Text {...labelStyle}>Dispatch Doc No.</Text>
              <Input
                {...inputStyle}
                value={dispatchData.dispatchDocNo}
               onChange={(e) => {
  setDispatchData((prev) => ({ ...prev, dispatchDocNo: e.target.value }));
  if (e.target.value) setErrors((prev) => ({ ...prev, dispatchDocNo: undefined }));}}
                placeholder="Enter dispatch doc no."
              />
              {errors.dispatchDocNo && (
    <Text fontSize="11px" color="red.500" mt="2px">{errors.dispatchDocNo}</Text>
  )}
              </FormControl>
            </Box>
            <Box>
              <FormControl isInvalid={!!errors.billTNo}>
              <Text {...labelStyle}>Bill-T No.</Text>
              <Input
                {...inputStyle}
                value={dispatchData.billTNo}
                onChange={(e) => {
  setDispatchData((prev) => ({ ...prev, billTNo: e.target.value }));
  if (e.target.value) setErrors((prev) => ({ ...prev, billTNo: undefined }));
}}
                placeholder="Enter Bill-T no."
              />
                {errors.billTNo && (
    <Text fontSize="11px" color="red.500" mt="2px">{errors.billTNo}</Text>
  )}
              </FormControl>
            </Box>
            <Box>
              <Text {...labelStyle}>Vehicle No.</Text>
              <Input
                {...inputStyle}
                value={dispatchData.vehicleNo}
                onChange={(e) => setDispatchData((prev) => ({ ...prev, vehicleNo: e.target.value }))}
                placeholder="Enter vehicle no."
              />
            </Box>

            {/* Row 2 */}
            <Box>
              <FormControl isInvalid={!!errors.destination}>
              <Text {...labelStyle}>Destination</Text>
              <Input
                {...inputStyle}
                value={dispatchData.destination}
                onChange={(e) => { setDispatchData((prev) => ({ ...prev, destination: e.target.value })); if (e.target.value) setErrors((prev) => ({ ...prev, destination: undefined }));}}
                placeholder="Enter destination"
              />
               {errors.destination && (
    <Text fontSize="11px" color="red.500" mt="2px">{errors.destination}</Text>
  )}
              </FormControl>
            </Box>
            <Box>
              <Text {...labelStyle}>Transport Freight (₹)</Text>
              <Input
                {...inputStyle}
                type="number"
                value={dispatchData.transportFreight}
                onChange={(e) => setDispatchData((prev) => ({ ...prev, transportFreight: e.target.value }))}
              />
            </Box>
            <Box>
              <Text {...labelStyle}>Local Freight (₹)</Text>
              <Input
                {...inputStyle}
                type="number"
                value={dispatchData.localFreight}
                onChange={(e) => setDispatchData((prev) => ({ ...prev, localFreight: e.target.value }))}
              />
            </Box>

            {/* Row 3 */}
            <Box>
              <Text {...labelStyle}>Load Freight (₹)</Text>
              <Input
                {...inputStyle}
                type="number"
                value={dispatchData.loadFreight}
                onChange={(e) => setDispatchData((prev) => ({ ...prev, loadFreight: e.target.value }))}
              />
            </Box>
            <Box>
              <Text {...labelStyle}>Unload Freight (₹)</Text>
              <Input
                {...inputStyle}
                type="number"
                value={dispatchData.unloadFreight}
                onChange={(e) => setDispatchData((prev) => ({ ...prev, unloadFreight: e.target.value }))}
              />
            </Box>

            {/* Dispatch Doc Image */}
            <Box gridColumn={{ md: "1 / -1" }}>
              <Divider my={2} borderColor="#d8d0e8" />
              <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={4}>
                <Box>
                  <FormControl isInvalid={!!errors.dispatchDocImage}>
                  <Text {...labelStyle} fontWeight="600">Dispatch Doc Image</Text>
                  <Flex align="center" gap={2} mt={1}>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="purple"
                      fontSize="12px"
                      onClick={() => dispatchDocRef.current?.click()}
                    >
                      Choose File
                    </Button>
                    <Text fontSize="11px" color="gray.500">
                      {dispatchData.dispatchDocImageFile?.name || "No file chosen"}
                    </Text>
                    <input
                      type="file"
                      ref={dispatchDocRef}
                      accept="image/*,application/pdf"
                      style={{ display: "none" }}
                      onChange={handleDispatchDocImage}
                    />
                  </Flex>
                   {errors.dispatchDocImage && ( <Text fontSize="11px" color="red.500" mt="2px">{errors.dispatchDocImage}</Text> )}
                  </FormControl>
                  {dispatchData.dispatchDocImage && (
                    <Box mt={2} border="1px solid #d0d7de" borderRadius="6px" overflow="hidden" maxW="200px">
                      <img src={dispatchData.dispatchDocImage} alt="Dispatch Doc" style={{ width: "100%", objectFit: "cover" }} />
                    </Box>
                  )}
                </Box>
                <Box>
                  <FormControl isInvalid={!!errors.billTImage}>
                  <Text {...labelStyle} fontWeight="600">Bill-T Image</Text>
                  <Flex align="center" gap={2} mt={1}>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="purple"
                      fontSize="12px"
                      onClick={() => billTImageRef.current?.click()}
                    >
                      Choose File
                    </Button>
                    <Text fontSize="11px" color="gray.500">
                      {dispatchData.billTImageFile?.name || "No file chosen"}
                    </Text>
                    <input
                      type="file"
                      ref={billTImageRef}
                      accept="image/*,application/pdf"
                      style={{ display: "none" }}
                      onChange={handleBillTImage}
                    />
                  </Flex>
                   {errors.billTImage && (
    <Text fontSize="11px" color="red.500" mt="2px">{errors.billTImage}</Text>
  )}
                  </FormControl>
                  {dispatchData.billTImage && (
                    <Box mt={2} border="1px solid #d0d7de" borderRadius="6px" overflow="hidden" maxW="200px">
                      <img src={dispatchData.billTImage} alt="Bill-T" style={{ width: "100%", objectFit: "cover" }} />
                    </Box>
                  )}
                </Box>
              </Grid>
            </Box>
          </Grid>
        </Box>
      )}

      {/* ── Section 6: Assignment ── */}
      <Box {...sectionStyle}>
        <Box {...sectionHeaderStyle}>
          <Text fontWeight="500" fontSize="sm">Assignment</Text>
        </Box>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={4} p={4}>
          <Box>
            <Text {...labelStyle}>Employee Under</Text>
            <Select {...inputStyle} value={formData.employeeUnder} onChange={(e) => setFormData((prev) => ({ ...prev, employeeUnder: e.target.value }))}>
              <option value="">-- Select --</option>
              {(users || []).map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </Select>
          </Box>
          <Box>
            <FormControl isInvalid={!!errors.salesLedgerId}>
            <Text {...labelStyle}>Sales Ledger</Text>
            <Select {...inputStyle} value={formData.salesLedgerId} 
            onChange={(e) => {
  setFormData((prev) => ({ ...prev, salesLedgerId: e.target.value }));
  if (e.target.value) setErrors((prev) => ({ ...prev, salesLedgerId: undefined }));
}}
>
              <option value="">-- Please Select --</option>
              {salesLedgerOptions.map((ledger) => (
                <option key={ledger.id} value={ledger.id}>{ledger.ledger_name || ledger.name}</option>
              ))}
            </Select>
             {errors.salesLedgerId && (
    <Text fontSize="11px" color="red.500" mt="2px">{errors.salesLedgerId}</Text>
  )}
            </FormControl>
          </Box>
        </Grid>
      </Box>

      {/* ── Section 7: Stock Items ── */}
      <Box {...sectionStyle} overflowX="auto">
        <Box {...sectionHeaderStyle}>
          <Text fontWeight="500" fontSize="sm">Stock Items</Text>
        </Box>
        <Table size="sm" variant="simple" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
          <Thead bg="gray.50">
            <Tr>
              <Th {...thStyle} minW="160px">Item Name</Th>
              <Th {...thStyle} minW="90px">Total Qty.</Th>
              <Th {...thStyle} minW="140px">Godown</Th>
              <Th {...thStyle} minW="70px">Available</Th>
              <Th {...thStyle} minW="80px">Billed Qty.</Th>
              <Th {...thStyle} minW="80px">Rate</Th>
              <Th {...thStyle} minW="70px">Unit</Th>
              <Th {...thStyle} minW="90px">Amount</Th>
              <Th {...thStyle} minW="60px">IGST %</Th>
              <Th {...thStyle} minW="80px">Tax Amt.</Th>
              <Th {...thStyle} minW="90px">Total Amt.</Th>
            </Tr>
          </Thead>
          <Tbody>
            {items.map((item, index) => (
              <Tr
                key={`${item.stock_item_id}-${index}`}
                bg={index % 2 === 0 ? "white" : "#f7faf8"}
                _hover={{ bg: "#edf5ef" }}
              >
                <Td {...tdStyle}><Input {...readonlyInputStyle} value={item.item_name} readOnly minW="160px" /></Td>
                <Td {...tdStyle}>
                  <Input
                    {...readonlyInputStyle}
                    value={item.total_qty ?? item.available_qty ?? 0}
                    readOnly
                    textAlign="right"
                  />
                </Td>

                {/*  NEW: Godown column — selecting opens modal directly */}

                <Td {...tdStyle} minW="160px">
                  <Select
                    {...inputStyle}
                    value={item.godown_id || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;

                      // Update the row's godown_id in state first
                      setItems((prev) => {
                        const updated = [...prev];

                        updated[index] = {
                          ...updated[index],
                          godown_id: String(val),
                          _prevGodownId: updated[index].godown_id || ""
                        };

                        return updated;
                      });

                      // Then open modal
                      handleRowGodownSelect(index, val);
                    }}
                  >
                    <option value="">-- Select Godown --</option>
                    {godownList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.godown_name || g.name}
                      </option>
                    ))}
                  </Select>
                  {item.batch_no && item.batch_no !== "Not Applicable" && (
                    <Text fontSize="10px" color="purple.600" mt="1px" fontStyle="italic">
                      Batch: {item.batch_no}
                    </Text>
                  )}
                </Td>

                <Td {...tdStyle}>
                  <Input
                    {...readonlyInputStyle}
                    value={item.available_qty ?? 0}
                    readOnly
                    textAlign="right"
                  />
                </Td>
                <Td {...tdStyle}>
                  <Input {...inputStyle} type="number" value={item.billed_qty ?? 0} onChange={(e) => handleItemChange(index, "billed_qty", e.target.value)} textAlign="right" />
                </Td>
                <Td {...tdStyle}>
                  <Input {...inputStyle} type="number" value={item.rate ?? 0} onChange={(e) => handleItemChange(index, "rate", e.target.value)} textAlign="right" />
                </Td>
                <Td {...tdStyle}><Input {...readonlyInputStyle} value={item.unit_name} readOnly textAlign="center" /></Td>
                <Td {...tdStyle}><Input {...readonlyInputStyle} value={item.amount ?? 0} readOnly textAlign="right" /></Td>
                <Td {...tdStyle}>
                  <Input {...inputStyle} type="number" value={item.igst_percent ?? 0} onChange={(e) => handleItemChange(index, "igst_percent", e.target.value)} textAlign="right" />
                </Td>
                <Td {...tdStyle}><Input {...readonlyInputStyle} value={item.igst_amount ?? 0} readOnly textAlign="right" /></Td>
                <Td {...tdStyle}>
                  <Input
                    value={Number(item.total_amount || 0).toFixed(2)}
                    readOnly size="sm" borderRadius="6px" bg="#e8f5ec"
                    textAlign="right" fontWeight="600" color="#1e4a2e" minW="100px"
                  />
                </Td>
              </Tr>
            ))}
            {items.length === 0 && (
              <Tr>
                <Td colSpan={11} textAlign="center" py={6} color="gray.400" fontSize="13px" fontStyle="italic">
                  No items in this order
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
        <Flex mt={2} justify="flex-end" gap={4} bg="#e4ede6" p={2} borderRadius="4px" fontSize="12px" fontWeight="600" color="#2d5a3d">
          <Text>Subtotal: ₹{round2(items.reduce((s, i) => s + Number(i.amount || 0), 0)).toFixed(2)}</Text>
          <Text>|</Text>
          <Text>Tax: ₹{round2(totals.igst + totals.cgst + totals.sgst).toFixed(2)}</Text>
        </Flex>
      </Box>

      {approval?.approval_level === "SENIOR" && (
        <Box {...sectionStyle}>
          <Box {...sectionHeaderStyle} bg="#5d6e6e">
            <Flex justify="space-between" align="center">
              <Text fontWeight="500" fontSize="sm">Additional Ledgers</Text>
              <Button
                size="xs" variant="outline" color="white" borderColor="white"
                fontSize="11px" onClick={addExtraLedgerRow}
                _hover={{ bg: "whiteAlpha.200" }}
              >
                + Add Row
              </Button>
            </Flex>
          </Box>
          <Box overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th {...thStyle} minW="220px">Ledger</Th>
                  <Th {...thStyle} minW="140px">
                    Amount
                    <Text as="span" fontSize="9px" fontWeight="400" color="gray.500" ml={1}>
                      (− to deduct, + to add)
                    </Text>
                  </Th>
                  <Th {...thStyle} minW="200px">Comments</Th>
                  <Th {...thStyle} w="40px"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {extraLedgers.map((row, index) => {
                  const amt = Number(row.amount || 0);
                  const isNegative = amt < 0;
                  const isPositive = amt > 0;
                  return (
                    <Tr key={index} bg={index % 2 === 0 ? "white" : "#f7faf8"}>
                      <Td {...tdStyle}>
                        <Select
                          {...inputStyle}
                          value={row.ledger_id}
                          onChange={(e) => handleExtraLedgerChange(index, "ledger_id", e.target.value)}
                          minW="220px"
                        >
                          <option value="">-- Select Ledger --</option>
                          {ledgerList.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.ledger_name || l.name}
                            </option>
                          ))}
                        </Select>
                      </Td>
                      <Td {...tdStyle}>
                        <Input
                          {...inputStyle}
                          type="number"
                          value={row.amount}
                          onChange={(e) => handleExtraLedgerChange(index, "amount", e.target.value)}
                          textAlign="right"
                          color={isNegative ? "red.600" : isPositive ? "green.600" : "inherit"}
                          fontWeight={amt !== 0 ? "600" : "400"}
                          placeholder="e.g. 100 or -50"
                        />
                        {/* live operation badge */}
                        {amt !== 0 && (
                          <Badge
                            mt="2px"
                            colorScheme={isNegative ? "red" : "green"}
                            fontSize="9px"
                          >
                            {isNegative ? "MINUS" : "PLUS"} ₹{Math.abs(amt).toFixed(2)}
                          </Badge>
                        )}
                      </Td>
                      <Td {...tdStyle}>
                        <Input
                          {...inputStyle}
                          value={row.comments}
                          onChange={(e) => handleExtraLedgerChange(index, "comments", e.target.value)}
                          placeholder="Enter comments"
                        />
                      </Td>
                      <Td {...tdStyle}>
                        <Button
                          size="xs" variant="ghost" colorScheme="red"
                          onClick={() => removeExtraLedgerRow(index)}
                          isDisabled={extraLedgers.length === 1}
                        >
                          ✕
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>

          {/* Running impact summary */}
          {extraLedgerTotal !== 0 && (
            <Flex justify="flex-end" gap={4} px={3} py={2} bg="#f0f4f0"
              fontSize="12px" fontWeight="600" borderTop="1px solid #e0e8e2">
              <Text color="gray.600">
                Ledger Adjustment:
                <Text as="span" color={extraLedgerTotal < 0 ? "red.600" : "green.600"} ml={1}>
                  {extraLedgerTotal < 0 ? "-" : "+"}₹{Math.abs(extraLedgerTotal).toFixed(2)}
                </Text>
              </Text>
              <Text>|</Text>
              <Text color="#1e4a2e">
                Grand Total: ₹{grandTotal.toFixed(2)}
              </Text>
            </Flex>
          )}
        </Box>
      )}

      {/* ── Section 8: Totals + Narration ── */}
      <Box {...sectionStyle} mt={4} padding={3}>
        <Grid templateColumns="1fr 320px" gap={5}>
          <Box>
            <Box {...sectionHeaderStyle} borderTopRadius="md">
              <Text fontWeight="500" fontSize="sm">Narration</Text>
            </Box>
            <Textarea
              size="sm" placeholder="Enter narration / remarks..."
              value={formData.narration}
              onChange={(e) => setFormData((prev) => ({ ...prev, narration: e.target.value }))}
              rows={4} borderColor="#c8d0d8" bg="white"
              _focus={{ borderColor: "#3d7a52" }} resize="vertical" mt={0}
            />
            <Flex align="center" gap={3} mt={3}>
              <Text fontSize="11px" color="gray.500" fontStyle="italic">
                Note: If you modify the bill it will be auto-identified
              </Text>
            </Flex>
            <Flex align="center" gap={3} mt={2}>
              <Text fontSize="12px" fontWeight="600" color="#555">Order Document:</Text>
              <Button size="xs" variant="outline" colorScheme="blue" onClick={handleViewDocument} fontSize="11px" px={4}>
                VIEW DOCUMENT
              </Button>
            </Flex>

            {/* Dispatcher docs — visible to SENIOR only */}
            {approval?.approval_level === "SENIOR" && (
              <>
                {approval?.payload_json?.dispatchDocImageUrl && (
                  <Flex align="center" gap={3} mt={2}>
                    <Text fontSize="12px" fontWeight="600" color="#555">Dispatch Doc:</Text>
                    <Button
                      size="xs" variant="outline" colorScheme="orange" fontSize="11px" px={4}
                      onClick={() => setDispatchPreview({
                        isOpen: true,
                        url: approval.payload_json.dispatchDocImageUrl, // ← was dispatch_doc_image
                        title: "Dispatch Document",
                      })}
                    >
                      VIEW DISPATCH DOC
                    </Button>
                  </Flex>
                )}
                {approval?.payload_json?.billTImageUrl && (
                  <Flex align="center" gap={3} mt={2}>
                    <Text fontSize="12px" fontWeight="600" color="#555">Bill-T Document:</Text>
                    <Button
                      size="xs" variant="outline" colorScheme="purple" fontSize="11px" px={4}
                      onClick={() => setDispatchPreview({
                        isOpen: true,
                        url: approval.payload_json.billTImageUrl,
                        title: "Bill-T Document",
                      })}
                    >
                      VIEW BILL-T DOC
                    </Button>
                  </Flex>
                )}
              </>
            )}
          </Box>

          <Box>
            <Box {...sectionHeaderStyle} borderTopRadius="md">
              <Text fontWeight="500" fontSize="sm">Tax Summary</Text>
            </Box>
            <Box bg="white" border="1px solid #d0d7de" borderRadius="6px" overflow="hidden">
              {[
                { label: `IGST${totals.igstPercent !== null ? ` (${totals.igstPercent}%)` : ""}`, value: totals.igst },
                { label: `CGST${totals.cgstPercent !== null ? ` (${totals.cgstPercent}%)` : ""}`, value: totals.cgst },
                { label: `SGST${totals.sgstPercent !== null ? ` (${totals.sgstPercent}%)` : ""}`, value: totals.sgst },
                { label: "Subtotal", value: round2(items.reduce((s, i) => s + Number(i.amount || 0), 0)), divider: true },
              ].map(({ label, value, divider }) => (
                <React.Fragment key={label}>
                  {divider && <Divider borderColor="#e0e8e2" />}
                  <Flex justify="space-between" align="center" px={3} py="6px" borderBottom="1px solid #f0f4f0">
                    <Text fontSize="12px" color="#555" fontWeight="500">{label}</Text>
                    <Text fontSize="12px" color="#555" fontWeight="600">₹{Number(value || 0).toFixed(2)}</Text>
                  </Flex>
                </React.Fragment>
              ))}
              <Flex justify="space-between" align="center" px={3} py={2} bg="#5d6e6e">
                <Text fontSize="13px" color="white" fontWeight="700">Grand Total</Text>
                <Text fontSize="14px" color="white" fontWeight="800">
                  ₹{grandTotal.toFixed(2)}  {/* ← was totals.totalAmount */}
                </Text>
              </Flex>
            </Box>
          </Box>
        </Grid>
      </Box>

      {/* ── Footer Actions ── */}
     {/* ── Footer Actions ── */}
<Flex justify="flex-end" mt={2} gap={3}>
  {canResubmit ? (
    // ── RETURNED state: only Resubmit is available ──
    <Button
      bg="#237086"
      fontWeight="500"
      fontSize="14px"
      color="white"
      _hover={{ bg: "#1B5A6B" }}
      px={10}
      borderRadius="12px"
      isLoading={submitting}
      loadingText="Resubmitting..."
      onClick={handleResubmit}
      boxShadow="0 2px 8px rgba(45,90,61,0.4)"
    >
      Resubmit
    </Button>
  ) : (
    // ── PENDING state: normal approve / reject / return ──
    <>
      <Button
        variant="outline"
        colorScheme="yellow"
        size="sm"
        isDisabled={submitting}
        onClick={() => setReturnModalOpen(true)}
      >
        Return
      </Button>
      <Button
        variant="outline"
        colorScheme="red"
        size="sm"
        px={6}
        onClick={() => setRejectModalOpen(true)}
        isDisabled={submitting}
      >
        Reject
      </Button>
      <Button
        bg="#237086"
        fontWeight="500"
        fontSize="14px"
        color="white"
        _hover={{ bg: "#1B5A6B" }}
        px={10}
        borderRadius="12px"
        isLoading={submitting}
        loadingText="Saving..."
        onClick={handleApprove}
        boxShadow="0 2px 8px rgba(45,90,61,0.4)"
      >
        Accept
      </Button>
    </>
  )}
</Flex>

      {/* ══ Godown / Batch Modal ══ */}
      {/*  NEW: No godown select inside modal — shows selected godown as readonly, only batch is chosen here */}
      <Modal isOpen={godownModal.isOpen} onClose={() => setGodownModal(emptyGodownModal)} size="2xl" isCentered>
        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(2px)" />
        <ModalContent borderRadius="8px" border="1px solid #c0cfc4" overflow="hidden">
          <ModalHeader bg="#e4eced" borderBottom="2px solid #c0d4c8" fontSize="13px" fontWeight="700" color="#1e4a2e">
            <Flex align="center" gap={2}>
              <Box w="10px" h="10px" bg="#31848f" borderRadius="50%" />
              Select Batch — {godownModal.godownName}
            </Flex>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody p={4} bg="white">
            {/* Godown shown as readonly info */}
            <Box mb={4} p={3} bg="#f0f7f7" borderRadius="6px" border="1px solid #c0d4c8">
              <Text fontSize="12px" fontWeight="600" color="#555" mb={1}>Selected Godown</Text>
              <Text fontSize="13px" color="#1e4a2e" fontWeight="700">{godownModal.godownName}</Text>
            </Box>

            <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
              <FormControl>
                <FormLabel fontSize="12px" fontWeight="600" color="#555">Batch No.</FormLabel>
                <Select
                  {...inputStyle}
                  value={godownModal.batchNo}
                  onChange={(e) => handleGodownModalBatchChange(e.target.value)}
                >
                  <option value="Not Applicable">Not Applicable</option>
                  {godownModal.batches.map((batch) => (
                    <option key={batch.batch_no} value={batch.batch_no}>{batch.batch_no}</option>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl>
                <FormLabel fontSize="12px" fontWeight="600" color="#555">Mfg Dt.</FormLabel>
                <Input {...inputStyle} type="date" value={godownModal.mfgDate} onChange={(e) => setGodownModal((prev) => ({ ...prev, mfgDate: e.target.value }))} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="12px" fontWeight="600" color="#555">Expiry Dt.</FormLabel>
                <Input {...inputStyle} type="date" value={godownModal.expiryDate} onChange={(e) => setGodownModal((prev) => ({ ...prev, expiryDate: e.target.value }))} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="12px" fontWeight="600" color="#555">Remind Expiry</FormLabel>
                <Select {...inputStyle} value={godownModal.remindExpiry} onChange={(e) => setGodownModal((prev) => ({ ...prev, remindExpiry: e.target.value }))}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="12px" fontWeight="600" color="#555">Remind Date</FormLabel>
                <Input {...inputStyle} type="date" value={godownModal.remindDate} onChange={(e) => setGodownModal((prev) => ({ ...prev, remindDate: e.target.value }))} isDisabled={godownModal.remindExpiry !== "Yes"} />
              </FormControl>
            </Grid>
          </ModalBody>
          <ModalFooter bg="#f7f9f8" borderTop="1px solid #e0e8e2">
            <Flex gap={3}>
              {/* <Button variant="outline" colorScheme="gray" size="sm" onClick={() => setGodownModal(emptyGodownModal)}>Cancel</Button> */}

              <Button variant="outline" colorScheme="gray" size="sm" onClick={() => {
                if (godownModal.itemIndex !== null) {
                  setItems((prev) => {
                    const updated = [...prev];
                    updated[godownModal.itemIndex] = {
                      ...updated[godownModal.itemIndex],
                      // godown_id: updated[godownModal.itemIndex]._prevGodownId || "",
                    }; return updated;
                  });
                }
                setGodownModal(emptyGodownModal);
              }} >
                Cancel
              </Button>
              <Button bg="#237086" color="white" _hover={{ bg: "#1B5A6B" }} px={8} size="sm" borderRadius="12px" onClick={handleConfirmGodown}>
                Confirm
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ══ Document Preview Modal ══ */}
      <Modal isOpen={docPreviewOpen} onClose={() => setDocPreviewOpen(false)} size="4xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(2px)" />
        <ModalContent borderRadius="8px" border="1px solid #c0cfc4" overflow="hidden" maxH="90vh">
          <ModalHeader bg="#e4eced" borderBottom="2px solid #c0d4c8" fontSize="13px" fontWeight="700" color="#1e4a2e">
            <Flex align="center" gap={2}>
              <Box w="10px" h="10px" bg="#31848f" borderRadius="50%" />
              Order Document Preview
            </Flex>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody p={4} bg="white" overflowY="auto">
            {formData.orderDocumentUrl ? (
              isImageDoc() ? (
                <Box textAlign="center">
                  <img src={formData.orderDocumentUrl} alt="Order Document"
                    style={{ maxWidth: "100%", objectFit: "contain", borderRadius: "6px", border: "1px solid #d0d7de" }} />
                </Box>
              ) : isPdfDoc() ? (
                <Box h="70vh">
                  <iframe src={formData.orderDocumentUrl} title="Order Document PDF" width="100%" height="100%" style={{ border: "none", borderRadius: "6px" }} />
                </Box>
              ) : (
                <Center h="200px" flexDirection="column" gap={3}>
                  <Text fontSize="13px" color="gray.500">Preview not available for this file type.</Text>
                  <Button as="a" href={formData.orderDocumentUrl} target="_blank" rel="noopener noreferrer"
                    size="sm" bg="#237086" color="white" _hover={{ bg: "#1B5A6B" }} borderRadius="12px" px={6}>
                    Open in New Tab
                  </Button>
                </Center>
              )
            ) : (
              <Center h="200px">
                <Text fontSize="13px" color="gray.400" fontStyle="italic">No document attached to this order.</Text>
              </Center>
            )}
          </ModalBody>
          <ModalFooter bg="#f7f9f8" borderTop="1px solid #e0e8e2">
            <Flex gap={3} justify="flex-end" w="100%">
              {formData.orderDocumentUrl && (
                <Button as="a" href={formData.orderDocumentUrl} target="_blank" rel="noopener noreferrer"
                  size="sm" variant="outline" colorScheme="blue" px={5}>
                  Open in New Tab
                </Button>
              )}
              <Button size="sm" variant="outline" colorScheme="gray" onClick={() => setDocPreviewOpen(false)}>Close</Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ══ Reject Modal ══ */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} isCentered>
        <ModalOverlay bg="blackAlpha.500" />
        <ModalContent borderRadius="8px" border="1px solid #c0cfc4" overflow="hidden">
          <ModalHeader bg="#e4eced" borderBottom="2px solid #c0d4c8" fontSize="13px" fontWeight="700" color="#c0392b">
            Reject Sales Order
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody p={4} bg="white">
            <FormControl>
              <FormLabel fontSize="12px" fontWeight="600" color="#555">Reason for rejection</FormLabel>
              <Textarea
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                placeholder="Let the employee know what needs to change"
                borderColor="#c8d0d8" bg="white" _focus={{ borderColor: "#e53e3e" }} rows={4}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter bg="#f7f9f8" borderTop="1px solid #e0e8e2">
            <Flex gap={3}>
              <Button variant="ghost" colorScheme="gray" size="sm" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
              <Button colorScheme="red" size="sm" px={6} borderRadius="12px" onClick={handleReject} isLoading={submitting}>
                Reject
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ══ Return Modal ══ */}
<Modal isOpen={returnModalOpen} onClose={() => { setReturnModalOpen(false); setReturnRemarks(""); setReturnImageFile(null); }} isCentered>
  <ModalOverlay bg="blackAlpha.500" />
  <ModalContent borderRadius="8px" border="1px solid #c0cfc4" overflow="hidden">
    <ModalHeader bg="#e4eced" borderBottom="2px solid #c0d4c8" fontSize="13px" fontWeight="700" color="#b7791f">
      Return Sales Order
      <ModalCloseButton />
    </ModalHeader>
    <ModalBody p={4} bg="white">
      <FormControl mb={4}>
        <FormLabel fontSize="12px" fontWeight="600" color="#555">
          Reason for return <Text as="span" color="red.500">*</Text>
        </FormLabel>
        <Textarea
          value={returnRemarks}
          onChange={(e) => setReturnRemarks(e.target.value)}
          placeholder="Describe what needs to be corrected"
          borderColor="#c8d0d8"
          bg="white"
          _focus={{ borderColor: "#d69e2e" }}
          rows={4}
        />
      </FormControl>

      <FormControl>
        <FormLabel fontSize="12px" fontWeight="600" color="#555">
          Attach Image <Text as="span" color="red.500">*</Text>
        </FormLabel>
        <Flex align="center" gap={2}>
          <Button
            size="sm"
            variant="outline"
            colorScheme="yellow"
            fontSize="12px"
            onClick={() => returnImageRef.current?.click()}
          >
            Choose File
          </Button>
          <Text fontSize="11px" color={returnImageFile ? "green.600" : "gray.400"}>
            {returnImageFile ? returnImageFile.name : "No file chosen"}
          </Text>
          <input
            type="file"
            ref={returnImageRef}
            accept="image/*,application/pdf"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) setReturnImageFile(file);
            }}
          />
        </Flex>

        {/* Preview if image */}
        {returnImageFile && returnImageFile.type.startsWith("image/") && (
          <Box mt={2} border="1px solid #d0d7de" borderRadius="6px" overflow="hidden" maxW="200px">
            <img
              src={URL.createObjectURL(returnImageFile)}
              alt="Return attachment"
              style={{ width: "100%", objectFit: "cover" }}
            />
          </Box>
        )}
      </FormControl>
    </ModalBody>
    <ModalFooter bg="#f7f9f8" borderTop="1px solid #e0e8e2">
      <Flex gap={3}>
        <Button
          variant="ghost"
          colorScheme="gray"
          size="sm"
          onClick={() => { setReturnModalOpen(false); setReturnRemarks(""); setReturnImageFile(null); }}
        >
          Cancel
        </Button>
        <Button
          colorScheme="yellow"
          size="sm"
          px={6}
          borderRadius="12px"
          onClick={handleReturn}
          isLoading={submitting}
          loadingText="Returning..."
        >
          Return
        </Button>
      </Flex>
    </ModalFooter>
  </ModalContent>
</Modal>

      {/* ══ Dispatch / Bill-T Document Preview Modal ══ */}
      <Modal isOpen={dispatchPreview.isOpen} onClose={() => setDispatchPreview({ isOpen: false, url: "", title: "" })} size="4xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(2px)" />
        <ModalContent borderRadius="8px" border="1px solid #c0cfc4" overflow="hidden" maxH="90vh">
          <ModalHeader bg="#e4eced" borderBottom="2px solid #c0d4c8" fontSize="13px" fontWeight="700" color="#1e4a2e">
            <Flex align="center" gap={2}>
              <Box w="10px" h="10px" bg="#31848f" borderRadius="50%" />
              {dispatchPreview.title}
            </Flex>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody p={4} bg="white" overflowY="auto">
            {dispatchPreview.url ? (
              /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i.test(dispatchPreview.url) ? (
                <Box textAlign="center">
                  <img
                    src={dispatchPreview.url}
                    alt={dispatchPreview.title}
                    style={{ maxWidth: "100%", objectFit: "contain", borderRadius: "6px", border: "1px solid #d0d7de" }}
                  />
                </Box>
              ) : /\.pdf(\?|$)/i.test(dispatchPreview.url) ? (
                <Box h="70vh">
                  <iframe src={dispatchPreview.url} title={dispatchPreview.title} width="100%" height="100%" style={{ border: "none", borderRadius: "6px" }} />
                </Box>
              ) : (
                <Center h="200px" flexDirection="column" gap={3}>
                  <Text fontSize="13px" color="gray.500">Preview not available for this file type.</Text>
                  <Button as="a" href={dispatchPreview.url} target="_blank" rel="noopener noreferrer"
                    size="sm" bg="#237086" color="white" _hover={{ bg: "#1B5A6B" }} borderRadius="12px" px={6}>
                    Open in New Tab
                  </Button>
                </Center>
              )
            ) : (
              <Center h="200px">
                <Text fontSize="13px" color="gray.400" fontStyle="italic">No document available.</Text>
              </Center>
            )}
          </ModalBody>
          <ModalFooter bg="#f7f9f8" borderTop="1px solid #e0e8e2">
            <Flex gap={3} justify="flex-end" w="100%">
              {dispatchPreview.url && (
                <Button as="a" href={dispatchPreview.url} target="_blank" rel="noopener noreferrer"
                  size="sm" variant="outline" colorScheme="blue" px={5}>
                  Open in New Tab
                </Button>
              )}
              <Button size="sm" variant="outline" colorScheme="gray"
                onClick={() => setDispatchPreview({ isOpen: false, url: "", title: "" })}>
                Close
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Sales;