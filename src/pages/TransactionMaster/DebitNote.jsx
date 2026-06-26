import React, { useEffect, useState, useCallback } from "react";
import { Box, Grid, Input, Select, Text, Button, Table, Thead, Tbody, Tr, Th, Td, Textarea, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, useDisclosure, Badge, Divider, GridItem, ModalCloseButton, useToast, VStack,} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import useUsersapi from "../../Apis/GetUsersapi";
import {
    fetchGodownList,
    fetchStockItemDropdown,
    fetchPurchaseLedgerDropdown,
    fetchNextVoucherNo,
    fetchAvailableStock,
    fetchBatches,
    fetchStockItemDetailsByID,
    fetchLedgerDetailsByID,
    fetchSupplierDropdown, fetchLedgerDropdown
} from "../../Apis/commanApi";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { useRef } from "react";

// ─── empty item row ───────────────────────────────────────────────────────────
const emptyItem = () => ({
    stock_item_id: "", godown_id: "", batch_no: "",
    available_qty: 0, return_qty: "", rate: "",
    unit_id: "", unit_name: "", alt_unit_id: null, alt_unit_qty: null, alt_unit_name: "",
    amount: 0,
    igst_percent: 0, igst_amount: 0,
    cgst_percent: 0, cgst_amount: 0,
    sgst_percent: 0, sgst_amount: 0,
    total_amount: 0,
    gst_applicable: 0, rate_of_duty: 0,
    mfg_date: "", expiry_date: "", remind_expiry: "No", remind_date: "",
});

const initialForm = {
    voucher_type_id: "", voucher_no: "",
    debit_note_date: new Date().toISOString().slice(0, 10),
    original_purchase_id: "",
    supplier_ledger_id: "",
    purchase_return_ledger_id: "",
    assign_employee: "", employee_under_id: "",
    dispatch_doc_no: "", dispatch_doc_image: null, transport_name: "", destination: "",
    bill_t_no: "", bill_t_image: null, vehicle_no: "", transport_freight: 0,
    eway_number: "", transporter_gst: "", delivery_place: "",
    subtotal: 0, igst_total: 0, cgst_total: 0, sgst_total: 0, tax_total: 0, total_amount: 0,
    narration: "",
    items: [emptyItem()],
};

// ─── style tokens ─────────────────────────────────────────────────────────────
const sectionStyle = {
    bg: "white", border: "1px solid #d0d7de",
    borderRadius: "6px", p: 0, mb: 3,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};
const labelStyle = { fontSize: "12px", color: "#494949", marginBottom: "3px" };
const inputStyle = {
    size: "sm", borderRadius: "6px", borderColor: "#c8d0d8",
    bg: "white", fontSize: "12px", height: "40px",
    _focus: { borderColor: "#3d7a52", boxShadow: "0 0 0 1px #3d7a52" },
};
const readonlyInputStyle = { ...inputStyle, bg: "#f0f4f0", color: "#555" };
const thStyle = {
    borderColor: "#c8d8cc", p: "6px 4px",
    fontWeight: "700", letterSpacing: "0.3px", whiteSpace: "nowrap",
};
const tdStyle = { p: "2px 3px", borderColor: "#e0e8e2", verticalAlign: "middle" };
const sectionHeader = {
    justify: "space-between", align: "center",
    bg: "#4f9190", color: "white",
    px: 4, py: 2, borderTopRadius: "md",
};

// ─── GST helpers ──────────────────────────────────────────────────────────────
/**
 * Debit note has NO tax_mode field in the backend.
 * We always use IGST logic for computing item amounts,
 * but we keep the tax percents exactly as they are stored on the item
 * (set from stock-item details). The caller must NOT pass tax_mode here.
 */
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
    const total_amount = Number((amount + igst_amount + cgst_amount + sgst_amount).toFixed(2));

    return {
        amount: Number(amount.toFixed(2)),
        igst_percent, cgst_percent, sgst_percent,
        igst_amount, cgst_amount, sgst_amount,
        total_amount,
    };
};

// ─── component ────────────────────────────────────────────────────────────────
const GenerateDebitNote = () => {
    const { users } = useUsersapi();
    const toast = useToast();
    const billTImageRef = useRef(null);
    const dispatchImageRef = useRef(null);

    // dropdown data
    const [godownList, setGodownList] = useState([]);
    const [stockItemList, setStockItemList] = useState([]);
    const [purchaseReturnLedgerList, setPurchaseReturnLedgerList] = useState([]);
    const [supplierList, setSupplierList] = useState([]);
    const [purchasesBySupplier, setPurchasesBySupplier] = useState([]);

    // form state
    const [formData, setFormData] = useState(initialForm);
    const [saving, setSaving] = useState(false);
    const [supplierInfo, setSupplierInfo] = useState({
        current_balance: "", balance_type: "Dr",
        security_amount: "0.0", credit_limit: "Not Specified",
    });

    // godown / batch modal
    const { isOpen: isGodownOpen, onOpen: openGodown, onClose: closeGodown } = useDisclosure();
    const [activeItemIndex, setActiveItemIndex] = useState(null);
    const [batchList, setBatchList] = useState([]);
    const [godownModal, setGodownModal] = useState({
        batch_no: "", qty: "",
        mfg_date: "", expiry_date: "",
        remind_expiry: "No", remind_date: "",
        isNewBatch: false, newBatchNo: "",
    });

    // ── on mount ──────────────────────────────────────────────────────────────
    useEffect(() => { loadData(); loadVoucherNo(); }, []);

    const loadData = async () => {
        try {
            const [godownData, stockData, purLedgerData, supplierData] = await Promise.all([
                fetchGodownList(),
                fetchStockItemDropdown(),
                fetchPurchaseLedgerDropdown(),
                fetchLedgerDropdown(),
            ]);
            setGodownList(godownData || []);
            setStockItemList(stockData || []);
            setPurchaseReturnLedgerList(purLedgerData || []);
            setSupplierList(supplierData || []);
            console.log("supplierData", setSupplierList(supplierData))
        } catch (err) { console.error("loadData error:", err); }
    };

    const loadVoucherNo = async () => {
        try {
            const voucherData = await fetchNextVoucherNo("DEBIT_NOTE");
            setFormData((prev) => ({
                ...prev,
                voucher_no: voucherData?.voucher_no || "",
                voucher_type_id: voucherData?.voucher_type_id || "",
            }));
        } catch (err) {
            toast({
                title: "Error", status: "error", duration: 3000, isClosable: true,
                description: err?.response?.data?.message || err.message,
            });
        }
    };

    // ── totals recalculation ──────────────────────────────────────────────────
    const recalcTotals = useCallback((items, freight) => {
        let subtotal = 0, igst_total = 0, cgst_total = 0, sgst_total = 0;
        items.forEach((item) => {
            subtotal += Number(item.amount || 0);
            igst_total += Number(item.igst_amount || 0);
            cgst_total += Number(item.cgst_amount || 0);
            sgst_total += Number(item.sgst_amount || 0);
        });
        const tax_total = igst_total + cgst_total + sgst_total;
        const total_amount = subtotal + tax_total;
        return {
            subtotal: Number(subtotal.toFixed(2)),
            igst_total: Number(igst_total.toFixed(2)),
            cgst_total: Number(cgst_total.toFixed(2)),
            sgst_total: Number(sgst_total.toFixed(2)),
            tax_total: Number(tax_total.toFixed(2)),
            total_amount: Number(total_amount.toFixed(2)),
        };
    }, []);

    // ── generic field change ──────────────────────────────────────────────────
    const handleChange = async (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "supplier_ledger_id") {
            // reset dependent fields
            setFormData((prev) => ({ ...prev, [name]: value, original_purchase_id: "" }));
            setPurchasesBySupplier([]);

            if (value) {
                // load ledger balance info
                const details = await fetchLedgerDetailsByID(value);
                if (details) {
                    setSupplierInfo({
                        current_balance: details.current_balance,
                        balance_type: details.balance_type,
                        security_amount: details.security_amount,
                        credit_limit: details.credit_limit,
                    });
                }
                // load purchases for this supplier
                try {
                    const res = await API.get(
                        `${API_ENDPOINTS.GET_PURCHASE_BY_SUPPLIER}?supplier_ledger_id=${value}`
                    );
                    setPurchasesBySupplier(res?.data?.data || []);
                } catch (err) { console.error(err); }
            } else {
                setSupplierInfo({
                    current_balance: "", balance_type: "Dr",
                    security_amount: "0.0", credit_limit: "Not Specified",
                });
            }
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: files?.[0] || null,
        }));
    };

    // ── item field change ─────────────────────────────────────────────────────
    const handleItemChange = (index, field, value) => {
        setFormData((prev) => {
            const items = [...prev.items];
            items[index] = { ...items[index], [field]: value };
            const computed = computeItemAmounts(items[index]);
            items[index] = { ...items[index], ...computed };
            const totals = recalcTotals(items, prev.transport_freight);
            return { ...prev, items, ...totals };
        });
    };

    // ── stock item select ─────────────────────────────────────────────────────
    const handleStockItemSelect = async (index, stockItemId) => {
        setFormData((prev) => {
            const items = [...prev.items];
            items[index] = { ...items[index], stock_item_id: stockItemId };
            return { ...prev, items };
        });
        if (!stockItemId) return;

        try {
            const details = await fetchStockItemDetailsByID(stockItemId);
            if (!details) return;
            setFormData((prev) => {
                const items = [...prev.items];
                const duty = Number(details.rate_of_duty || 0);
                const gst_ok = details.gst_applicable === 1 && duty > 0;

                items[index] = {
                    ...items[index],
                    stock_item_id: stockItemId,
                    available_qty: details.available_qty ?? 0,
                    rate: details.rate ?? "",
                    unit_id: details.unit_id ?? "",
                    unit_name: details.unit_name ?? "",
                    alt_unit_id: details.alt_unit_id ?? null,
                    alt_unit_name: details.alt_unit_name ?? "",
                    alt_unit_qty: details.alt_unit_qty ?? "",
                    gst_applicable: details.gst_applicable ?? 0,
                    rate_of_duty: duty,
                    // default to IGST when GST applicable
                    igst_percent: gst_ok ? duty : 0,
                    cgst_percent: 0,
                    sgst_percent: 0,
                };
                const computed = computeItemAmounts(items[index]);
                items[index] = { ...items[index], ...computed };
                const totals = recalcTotals(items, prev.transport_freight);
                return { ...prev, items, ...totals };
            });
        } catch (err) { console.error(err); }
    };

    // ── godown select → open batch modal ─────────────────────────────────────
    const handleGodownSelect = async (index, godownId) => {
        setFormData((prev) => {
            const items = [...prev.items];
            items[index] = { ...items[index], godown_id: godownId };
            return { ...prev, items };
        });
        if (!godownId) return;

        setActiveItemIndex(index);
        setGodownModal({
            batch_no: "", qty: "",
            mfg_date: "", expiry_date: "",
            remind_expiry: "No", remind_date: "",
            isNewBatch: false, newBatchNo: "",
        });
        setBatchList([]);

        const stockItemId = formData.items[index].stock_item_id;
        if (stockItemId) {
            try {
                const availableQty = await fetchAvailableStock({ itemId: stockItemId, godownId });
                setFormData((prev) => {
                    const items = [...prev.items];
                    items[index] = { ...items[index], available_qty: availableQty };
                    const totals = recalcTotals(items, prev.transport_freight);
                    return { ...prev, items, ...totals };
                });
                const batches = await fetchBatches(stockItemId, godownId);
                setBatchList(batches || []);
            } catch (err) { console.error(err); setBatchList([]); }
        }
        openGodown();
    };

    // ── batch selection inside modal ──────────────────────────────────────────
    const handleBatchSelect = (value) => {
        if (value === "NEW_NUMBER") {
            setGodownModal((p) => ({
                ...p, batch_no: "NEW_NUMBER", isNewBatch: true,
                qty: "", mfg_date: "", expiry_date: "",
                remind_expiry: "No", remind_date: "", newBatchNo: "",
            }));
            return;
        }
        if (value === "NOT_APPLICABLE") {
            setGodownModal((p) => ({
                ...p, batch_no: "NOT_APPLICABLE", isNewBatch: false,
                qty: "", mfg_date: "", expiry_date: "", remind_expiry: "No", remind_date: "",
            }));
            return;
        }
        const found = batchList.find((b) => b.batch_no === value);
        if (found) {
            setGodownModal({
                batch_no: found.batch_no,
                qty: found.qty ?? "",
                mfg_date: found.mfg_date ? found.mfg_date.slice(0, 10) : "",
                expiry_date: found.expiry_date ? found.expiry_date.slice(0, 10) : "",
                remind_expiry: found.remind_expiry ?? "No",
                remind_date: found.remind_date ? found.remind_date.slice(0, 10) : "",
                isNewBatch: false, newBatchNo: "",
            });
        }
        if (found && activeItemIndex !== null) {
            setFormData((prev) => {
                const items = [...prev.items];

                items[activeItemIndex] = {
                    ...items[activeItemIndex],
                    available_qty: Number(found.qty || 0), // batch qty
                    rate: found.rate || items[activeItemIndex].rate,
                };

                return {
                    ...prev,
                    items,
                };
            });
        }
    };

    // ── save batch modal ──────────────────────────────────────────────────────
    const handleGodownSave = () => {
        if (activeItemIndex === null) return;
        const finalBatchNo =
            godownModal.isNewBatch ? godownModal.newBatchNo
                : godownModal.batch_no === "NOT_APPLICABLE" ? ""
                    : godownModal.batch_no;

        setFormData((prev) => {
            const items = [...prev.items];
            items[activeItemIndex] = {
                ...items[activeItemIndex],
                batch_no: finalBatchNo,
                mfg_date: godownModal.mfg_date,
                expiry_date: godownModal.expiry_date,
                remind_expiry: godownModal.remind_expiry,
                remind_date: godownModal.remind_date,
            };
            return { ...prev, items };
        });
        closeGodown();
    };

    // ── item row helpers ──────────────────────────────────────────────────────
    const addItemRow = () => setFormData((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
    const removeItemRow = (index) => {
        setFormData((prev) => {
            const items = prev.items.filter((_, i) => i !== index);
            const final = items.length ? items : [emptyItem()];
            const totals = recalcTotals(final, prev.transport_freight);
            return { ...prev, items: final, ...totals };
        });
    };

    const handleFreightChange = (e) => {
        const freight = e.target.value;
        setFormData((prev) => {
            const totals = recalcTotals(prev.items, freight);
            return { ...prev, transport_freight: freight, ...totals };
        });
    };

    // ── save / submit ─────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!formData.debit_note_date) {toast({ description: "Date is required!", status: "error", duration: 1500 }); return; }
        if (!formData.supplier_ledger_id) {toast({ description: "Please select Party A/c Name!", status: "error", duration: 1500 }); return; }
        if (!formData.original_purchase_id) {toast({ description: "Please select Original Purchase Invoice!", status: "error", duration: 1500 }); return; }
        if (!formData.purchase_return_ledger_id) {toast({ description: "Please select Purchase Return Ledger!", status: "error", duration: 1500 }); return; }

        const validItems = formData.items.filter(
            (i) => i.stock_item_id && Number(i.return_qty) > 0
        );
        if (!validItems.length) {
            toast({ description: "Add at least one valid item with return qty!", status: "error", duration: 1500 }); return;
        }

        setSaving(true);
        try {
          
            const formPayload = new FormData();

            formPayload.append("voucher_no", formData.voucher_no);
            formPayload.append("voucher_type_id", formData.voucher_type_id);
            formPayload.append("debit_note_date", formData.debit_note_date);

            formPayload.append( "original_purchase_id", formData.original_purchase_id );
            formPayload.append( "supplier_ledger_id", formData.supplier_ledger_id );
            formPayload.append( "purchase_return_ledger_id", formData.purchase_return_ledger_id );

            if (formData.employee_under_id) {
            formPayload.append(  "assign_employee_id",  formData.employee_under_id ); }
            formPayload.append( "employee_under_id", formData.employee_under_id || "" );
            formPayload.append( "dispatch_doc_no", formData.dispatch_doc_no );
            formPayload.append( "transport_name", formData.transport_name );
            formPayload.append( "destination", formData.destination );
            formPayload.append( "bill_t_no", formData.bill_t_no );
            formPayload.append( "vehicle_no", formData.vehicle_no );
            formPayload.append( "transport_freight", formData.transport_freight );
            formPayload.append( "eway_number", formData.eway_number );
            formPayload.append( "transporter_gst", formData.transporter_gst );
            formPayload.append( "delivery_place", formData.delivery_place );
            formPayload.append( "subtotal", formData.subtotal );
            formPayload.append( "igst_total", formData.igst_total );
            formPayload.append( "cgst_total", formData.cgst_total );
            formPayload.append( "sgst_total", formData.sgst_total );
            formPayload.append( "tax_total", formData.tax_total );
            formPayload.append( "total_amount", formData.total_amount );
            formPayload.append( "narration", formData.narration );
            if (formData.bill_t_image) { formPayload.append( "bill_t_image", formData.bill_t_image ); }
            if (formData.dispatch_doc_image) { formPayload.append( "dispatch_doc_image", formData.dispatch_doc_image ); }
            formPayload.append(
                "items",
                JSON.stringify(
                    validItems.map((item) => ({
                        stock_item_id: item.stock_item_id,
                        godown_id: item.godown_id || null,
                        batch_no: item.batch_no || null,
                        available_qty: item.available_qty,
                        return_qty: Number(item.return_qty),
                        rate: Number(item.rate),

                        unit_id: item.unit_id || null,
                        alt_unit_id: item.alt_unit_id || null,
                        alt_unit_qty: item.alt_unit_qty || null,

                        amount: item.amount,
                        igst_percent: item.igst_percent,
                        igst_amount: item.igst_amount,
                        cgst_percent: item.cgst_percent,
                        cgst_amount: item.cgst_amount,
                        sgst_percent: item.sgst_percent,
                        sgst_amount: item.sgst_amount,
                        total_amount: item.total_amount,
                    }))
                )
            );
            const res = await API.post(
                API_ENDPOINTS.CREATE_DEBIT_NOTE,
                formPayload,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            if (res?.data?.success) {
                toast({
                    description: `Debit Note Created!\nVoucher No: ${res.data.voucher_no}`,
                    status: "success", duration: 2000,
                });
                setFormData({ ...initialForm });
                setSupplierInfo({
                    current_balance: "", balance_type: "Dr",
                    security_amount: "0.0", credit_limit: "Not Specified",
                });
                setPurchasesBySupplier([]);
                if (billTImageRef.current) {
                    billTImageRef.current.value = "";
                }

                if (dispatchImageRef.current) {
                    dispatchImageRef.current.value = "";
                }
                loadVoucherNo();
            }
        } catch (error) {
            toast({
                description: `Error: ${error?.response?.data?.message || error.message}`,
                status: "error", duration: 3000,
            });
        } finally { setSaving(false); }
    };

    const handleReset = () => {
        setFormData({ ...initialForm });
        setSupplierInfo({
            current_balance: "", balance_type: "Dr",
            security_amount: "0.0", credit_limit: "Not Specified",
        });
        setPurchasesBySupplier([]);
        loadVoucherNo();
    };

    const handlePurchaseSelect = async (purchaseId) => {
        setFormData((prev) => ({ ...prev, original_purchase_id: purchaseId, }));
        if (!purchaseId) { return; }

        try {
            const res = await API.get(`${API_ENDPOINTS.GET_PURCHASE_ITEMS_BY_ID}/${purchaseId}/items`);
            const purchaseItems = res?.data?.data || [];

            const populated = purchaseItems.map((pi) => ({
                ...emptyItem(),
                stock_item_id: pi.stock_item_id,
                stock_item_name: pi.stock_item_name,
                godown_id: pi.godown_id || "",
                batch_no: pi.batch_no || "",
                available_qty: pi.available_to_return || 0,
                purchased_qty: pi.qty || pi.billed_qty || 0,
                return_qty: "",
                rate: pi.rate || 0,
                unit_id: pi.unit_id || "",
                unit_name: pi.base_unit_name || "",
                alt_unit_id: pi.alt_unit_id || null,
                alt_unit_name: pi.alternative_unit_name || "",
                alt_unit_qty: pi.alternative_unit_value || "",
                igst_percent: pi.igst_percent || 0,
                cgst_percent: pi.cgst_percent || 0,
                sgst_percent: pi.sgst_percent || 0,
                gst_applicable: pi.gst_applicable || 0,
                rate_of_duty: pi.rate_of_duty || 0,

            }));

            const totals = recalcTotals(
                populated,
                formData.transport_freight
            );

            setFormData((prev) => ({
                ...prev,
                items: populated.length
                    ? populated
                    : [emptyItem()],
                ...totals,
            }));

        } catch (error) {
            console.error(error);
            toast({
                description:
                    error?.response?.data?.message ||
                    error.message,
                status: "error",
            });

        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
            <Box>

                {/* ── Section 1: Voucher Details ── */}
                <Box {...sectionStyle}>
                    <Flex {...sectionHeader}>
                        <Text fontWeight="500" fontSize="sm">Voucher Details</Text>
                    </Flex>
                    <Grid
                        templateColumns={{ base: "1fr", md: "repeat(2,1fr)", lg: "repeat(3,1fr)" }}
                        gap={4} p={4}
                    >
                        {/* Debit Note No. — read-only */}
                        <GridItem>
                            <Text {...labelStyle} color="#c0392b">Debit Note No.</Text>
                            <Input {...readonlyInputStyle} value={formData.voucher_no} readOnly />
                        </GridItem>

                        {/* Date */}
                        <GridItem>
                            <Text {...labelStyle}>
                                Date <Text as="span" color="red.500">*</Text>
                            </Text>
                            <Input
                                {...inputStyle} type="date"
                                name="debit_note_date"
                                value={formData.debit_note_date}
                                onChange={handleChange}
                            />
                        </GridItem>

                        {/* Party A/c Name — supplier ledger dropdown */}
                        <GridItem>
                            <Text {...labelStyle}>
                                Party A/c Name (Supplier) <Text as="span" color="red.500">*</Text>
                            </Text>
                            <Select
                                {...inputStyle}
                                name="supplier_ledger_id"
                                value={formData.supplier_ledger_id}
                                onChange={handleChange}
                            >
                                <option value="">-- Select Supplier --</option>
                                {supplierList.map((s) => (
                                    <option key={s.id} value={s.id}>{s.ledger_name}</option>
                                ))}
                            </Select>
                        </GridItem>

                        {/* Original Invoice No. — dropdown filtered by supplier */}
                        <GridItem>
                            <Text {...labelStyle} color="#c0392b">
                                Original Invoice No. <Text as="span" color="red.500">*</Text>
                            </Text>
                            <Select
                                {...inputStyle}
                                name="original_purchase_id"
                                value={formData.original_purchase_id}
                                // onChange={handleChange}
                                isDisabled={!formData.supplier_ledger_id}
                                onChange={(e) =>
                                    handlePurchaseSelect(e.target.value)
                                }
                            >
                                <option value="">
                                    {formData.supplier_ledger_id
                                        ? "-- Select Purchase Invoice --"
                                        : "-- Select Supplier First --"}
                                </option>
                                {purchasesBySupplier.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.voucher_no} — Rs.{Number(p.total_amount).toFixed(2)} ({p.purchase_date?.slice(0, 10)})
                                    </option>
                                ))}
                            </Select>
                        </GridItem>
                    </Grid>
                </Box>

                {/* ── Section 2: Assignment ── */}
                <Box {...sectionStyle}>
                    <Flex {...sectionHeader}>
                        <Text fontWeight="500" fontSize="sm">Assignment</Text>
                    </Flex>
                    <Grid
                        templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }}
                        gap={4} p={4}
                    >
                        <GridItem>
                            <Text {...labelStyle}>Assign Employee</Text>
                            <Select
                                {...inputStyle}
                                name="assign_employee"
                                value={formData.assign_employee}
                                onChange={handleChange}
                            >
                                <option value="">Please Select</option>
                                <option value="Applicable">Applicable</option>
                                <option value="Not Applicable">Not Applicable</option>
                            </Select>
                        </GridItem>

                        {formData.assign_employee === "Applicable" && (
                            <GridItem>
                                <Text {...labelStyle}>Employee Under</Text>
                                <Select
                                    {...inputStyle}
                                    name="employee_under_id"
                                    value={formData.employee_under_id}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Select Employee --</option>
                                    {(users || []).map((u) => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </Select>
                            </GridItem>
                        )}

                        {/* Purchase Return Ledger */}
                        <GridItem>
                            <Text {...labelStyle}>
                                Purchase Return Ledger <Text as="span" color="red.500">*</Text>
                            </Text>
                            <Select
                                {...inputStyle}
                                name="purchase_return_ledger_id"
                                value={formData.purchase_return_ledger_id}
                                onChange={handleChange}
                            >
                                <option value="">-- Select --</option>
                                {purchaseReturnLedgerList.map((l) => (
                                    <option key={l.id} value={l.id}>{l.ledger_name}</option>
                                ))}
                            </Select>
                        </GridItem>
                    </Grid>
                </Box>

                {/* ── Section 3: Supplier Information ── */}
                <Box {...sectionStyle}>
                    <Flex {...sectionHeader}>
                        <Text fontWeight="500" fontSize="sm">Supplier Information</Text>
                    </Flex>
                    <Grid
                        templateColumns={{ base: "1fr", md: "repeat(3,1fr)" }}
                        gap={4} p={4}
                    >
                        {[
                            { label: "Current Balance", key: "current_balance", extra: supplierInfo.balance_type },
                            { label: "Security Amount", key: "security_amount" },
                            { label: "Credit Limit", key: "credit_limit" },
                        ].map(({ label, key, extra }) => (
                            <Box key={key}>
                                <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>{label}</Text>
                                <Flex gap={1} align="center">
                                    <Input {...readonlyInputStyle} value={supplierInfo[key] || ""} readOnly />
                                    {extra && (
                                        <Badge
                                            colorScheme={extra === "Cr" ? "green" : "red"}
                                            fontSize="10px" px={2} py={1}
                                        >
                                            {extra}
                                        </Badge>
                                    )}
                                </Flex>
                            </Box>
                        ))}
                    </Grid>
                </Box>

                {/* ── Section 4: Transport Details ── */}
                <Box {...sectionStyle}>
                    <Flex {...sectionHeader}>
                        <Text fontWeight="500" fontSize="sm">Transport Details</Text>
                    </Flex>
                    <Grid templateColumns="1fr 1fr 1fr" gap={3} mt={4} px={4}>
                        {[
                            { label: "Dispatch Doc No", name: "dispatch_doc_no" },
                            { label: "Transport Name", name: "transport_name" },
                            { label: "Destination", name: "destination" },
                        ].map(({ label, name }) => (
                            <Box key={name}>
                                <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>{label}</Text>
                                <Input {...inputStyle} name={name} value={formData[name]} onChange={handleChange} />
                            </Box>
                        ))}
                    </Grid>
                    <Grid templateColumns="1fr 1fr 1fr" gap={3} p={4}>
                        <VStack alignItems="baseline">
                           
                            <Text fontSize="11px" fontWeight="600" color="#555" mb={0}> Bill-T No. </Text>

                            <Input
                                {...inputStyle}
                                name="bill_t_no"
                                value={formData.bill_t_no}
                                onChange={handleChange}
                            />
                           
                            <Box>

                            <Text fontSize="11px" fontWeight="600" color="#555" mb={1}> Bill-T Image </Text>

                            <Input
                                ref={billTImageRef}
                                type="file"
                                accept="image/*"
                                name="bill_t_image"
                                onChange={handleFileChange}
                            />
                            </Box>
                        </VStack>

                     

                        <VStack alignItems="baseline">
                            
                            <Text fontSize="11px" fontWeight="600" color="#555" mb={0}>
                                Transport Freight
                            </Text>

                            <Input
                                {...inputStyle}
                                type="number"
                                name="transport_freight"
                                value={formData.transport_freight}
                                onChange={handleFreightChange}
                            />
                            
                            <Box>

                            <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>
                                Transport Freight Image
                            </Text>

                            <Input
                                ref={dispatchImageRef}
                                type="file"
                                accept="image/*"
                                name="dispatch_doc_image"
                                onChange={handleFileChange}
                            />
                            </Box>
                        </VStack>

                           <Box>
                            <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>
                                Vehicle No.
                            </Text>

                            <Input
                                {...inputStyle}
                                name="vehicle_no"
                                value={formData.vehicle_no}
                                onChange={handleChange}
                            />
                        </Box>
                    </Grid>
                </Box>

                {/* ── Section 5: Stock Items ── */}
                <Box {...sectionStyle} overflowX="auto">
                    <Flex {...sectionHeader}>
                        <Text fontWeight="500" fontSize="sm">Stock Items (Return)</Text>
                        <Button
                            size="xs" padding={3} fontWeight="500" marginRight="4px"
                            leftIcon={<AddIcon fontSize="11px" />}
                            colorScheme="whiteAlpha" variant="solid"
                            onClick={addItemRow}
                            _hover={{ bg: "#2d595a" }}
                        >
                            Add Item
                        </Button>
                    </Flex>

                    <Table
                        size="sm" variant="simple"
                        style={{ borderCollapse: "separate", borderSpacing: 0 }}
                        className="material_mfg"
                    >
                        <Thead bg="gray.50">
                            <Tr>
                                <Th {...thStyle} minW="150px">Name of Item</Th>
                                <Th {...thStyle} minW="90px">GoDown</Th>
                                <Th {...thStyle} minW="90px">Batch No.</Th>
                                <Th {...thStyle} minW="70px">Available</Th>
                                <Th {...thStyle} minW="80px">Return Qty.</Th>
                                <Th {...thStyle} minW="70px">Rate</Th>
                                <Th {...thStyle} minW="60px">Unit</Th>
                                <Th {...thStyle} minW="80px">Amount</Th>
                                <Th {...thStyle} minW="60px">IGST %</Th>
                                <Th {...thStyle} minW="60px">CGST %</Th>
                                <Th {...thStyle} minW="60px">SGST %</Th>
                                <Th {...thStyle} minW="80px">Tax Amt.</Th>
                                <Th {...thStyle} minW="90px">Total Amt.</Th>
                                <Th {...thStyle} minW="30px"></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {formData.items.map((item, index) => (
                                <Tr
                                    key={index}
                                    bg={index % 2 === 0 ? "white" : "#f7faf8"}
                                    _hover={{ bg: "#edf5ef" }}
                                >
                                    {/* Name of Item */}
                                    <Td {...tdStyle}>
                                        <Select
                                            {...inputStyle} minW="140px"
                                            value={item.stock_item_id}
                                            onChange={(e) => handleStockItemSelect(index, e.target.value)}
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
                                            {...inputStyle} minW="90px"
                                            value={item.godown_id}
                                            onChange={(e) => handleGodownSelect(index, e.target.value)}
                                        >
                                            <option value="">Select</option>
                                            {godownList.map((g) => (
                                                <option key={g.id} value={g.id}>{g.godown_name}</option>
                                            ))}
                                        </Select>
                                    </Td>

                                    {/* Batch No. */}
                                    <Td {...tdStyle}>
                                        <Input
                                            {...inputStyle} minW="80px"
                                            value={item.batch_no || ""}
                                            readOnly cursor="pointer"
                                            bg={item.batch_no ? "#e8f5ec" : "#f0f4f0"}
                                            placeholder="Click GoDown"
                                            onClick={() => {
                                                if (item.stock_item_id && item.godown_id) {
                                                    setActiveItemIndex(index);
                                                    openGodown();
                                                }
                                            }}
                                        />
                                    </Td>

                                    {/* Available */}
                                    <Td {...tdStyle}>
                                        <Input
                                            {...readonlyInputStyle} minW="60px"
                                            value={item.available_qty ?? 0}
                                            readOnly textAlign="right"
                                        />
                                    </Td>

                                    {/* Return Qty */}
                                    <Td {...tdStyle}>
                                        <Input
                                            {...inputStyle} type="number" minW="70px"
                                            value={item.return_qty}
                                            onChange={(e) => handleItemChange(index, "return_qty", e.target.value)}
                                            textAlign="right"
                                        />
                                    </Td>

                                    {/* Rate */}
                                    <Td {...tdStyle}>
                                        <Input
                                            {...inputStyle} type="number" minW="60px"
                                            value={item.rate}
                                            onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                                            textAlign="right"
                                        />
                                    </Td>

                                    {/* Unit */}
                                    <Td {...tdStyle}>
                                        <Input
                                            {...readonlyInputStyle} minW="50px"
                                            value={item.unit_name} readOnly textAlign="center"
                                        />
                                    </Td>

                                    {/* Amount */}
                                    <Td {...tdStyle}>
                                        <Input
                                            {...readonlyInputStyle} minW="70px"
                                            value={item.amount > 0 ? item.amount.toFixed(2) : "0.00"}
                                            readOnly textAlign="right"
                                        />
                                    </Td>

                                    {/* IGST % */}
                                    <Td {...tdStyle}>
                                        <Input
                                            {...inputStyle} type="number" minW="50px"
                                            value={item.igst_percent}
                                            onChange={(e) => handleItemChange(index, "igst_percent", e.target.value)}
                                            textAlign="right"
                                        />
                                    </Td>

                                    {/* CGST % */}
                                    <Td {...tdStyle}>
                                        <Input
                                            {...inputStyle} type="number" minW="50px"
                                            value={item.cgst_percent}
                                            onChange={(e) => handleItemChange(index, "cgst_percent", e.target.value)}
                                            textAlign="right"
                                        />
                                    </Td>

                                    {/* SGST % */}
                                    <Td {...tdStyle}>
                                        <Input
                                            {...inputStyle} type="number" minW="50px"
                                            value={item.sgst_percent}
                                            onChange={(e) => handleItemChange(index, "sgst_percent", e.target.value)}
                                            textAlign="right"
                                        />
                                    </Td>

                                    {/* Tax Amt (IGST + CGST + SGST) */}
                                    <Td {...tdStyle}>
                                        <Input
                                            {...readonlyInputStyle} minW="70px"
                                            value={(
                                                Number(item.igst_amount || 0) +
                                                Number(item.cgst_amount || 0) +
                                                Number(item.sgst_amount || 0)
                                            ).toFixed(2)}
                                            readOnly textAlign="right"
                                        />
                                    </Td>

                                    {/* Total Amt */}
                                    <Td {...tdStyle}>
                                        <Input
                                            value={item.total_amount > 0 ? item.total_amount.toFixed(2) : "0.00"}
                                            readOnly
                                            bg="#e8f5ec" textAlign="right"
                                            fontWeight="600" color="#1e4a2e"
                                            minW="80px" size="sm" borderRadius="6px"
                                        />
                                    </Td>

                                    {/* Remove row */}
                                    <Td {...tdStyle} textAlign="center">
                                        {formData.items.length > 1 && (
                                            <Button
                                                size="xs" colorScheme="red" variant="ghost"
                                                onClick={() => removeItemRow(index)}
                                                fontSize="14px" minW="24px" h="24px" p={0}
                                            >
                                                ×
                                            </Button>
                                        )}
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>

                    {/* Subtotal / Tax bar */}
                    <Flex
                        mt={2} justify="flex-end" gap={4}
                        bg="#e4ede6" p={2} borderRadius="4px"
                        fontSize="12px" fontWeight="600" color="#2d5a3d"
                    >
                        <Text>Subtotal: Rs.{formData.subtotal.toFixed(2)}</Text>
                        <Text>|</Text>
                        <Text>Tax: Rs.{formData.tax_total.toFixed(2)}</Text>
                    </Flex>
                </Box>

                {/* ── Section 6: Narration + Tax Summary ── */}
                <Box {...sectionStyle} mt={4} padding={3}>
                    <Grid templateColumns="1fr 320px" gap={5}>
                        {/* Narration */}
                        <Box>
                            <Box {...sectionHeader}><Text fontWeight="500" fontSize="sm">Narration</Text></Box>
                            <Textarea
                                size="sm"
                                placeholder="Enter narration / remarks..."
                                name="narration"
                                value={formData.narration}
                                onChange={handleChange}
                                rows={6}
                                borderColor="#c8d0d8" bg="white"
                                _focus={{ borderColor: "#3d7a52" }}
                                resize="vertical"
                            />
                        </Box>

                        {/* Tax Summary */}
                        <Box>
                            <Box {...sectionHeader}><Text fontWeight="500" fontSize="sm">Tax Summary</Text></Box>
                            <Box bg="white" border="1px solid #d0d7de" borderRadius="6px" overflow="hidden">
                                {[
                                    {
                                        label: `IGST (${formData.items.find((i) => i.igst_percent > 0)?.igst_percent ?? 0}%)`,
                                        value: formData.igst_total, color: "#555",
                                    },
                                    {
                                        label: `CGST (${formData.items.find((i) => i.cgst_percent > 0)?.cgst_percent ?? 0}%)`,
                                        value: formData.cgst_total, color: "#555",
                                    },
                                    {
                                        label: `SGST (${formData.items.find((i) => i.sgst_percent > 0)?.sgst_percent ?? 0}%)`,
                                        value: formData.sgst_total, color: "#555",
                                    },
                                    { label: "Subtotal", value: formData.subtotal, color: "#333", dividerBefore: true },
                                    // { label: "Transport Freight", value: Number(formData.transport_freight || 0), color: "#333" },
                                ].map(({ label, value, color, dividerBefore }) => (
                                    <React.Fragment key={label}>
                                        {dividerBefore && <Divider borderColor="#e0e8e2" />}
                                        <Flex
                                            justify="space-between" align="center"
                                            px={3} py="6px" borderBottom="1px solid #f0f4f0"
                                        >
                                            <Text fontSize="12px" color={color} fontWeight="500">{label}</Text>
                                            <Text fontSize="12px" color={color} fontWeight="600">
                                                Rs.{Number(value) > 0 ? Number(value).toFixed(2) : "0.00"}
                                            </Text>
                                        </Flex>
                                    </React.Fragment>
                                ))}
                                <Flex justify="space-between" align="center" px={3} py={2} bg="#5d6e6e">
                                    <Text fontSize="13px" color="white" fontWeight="700">Total Amount</Text>
                                    <Text fontSize="14px" color="white" fontWeight="800">
                                        Rs.{formData.total_amount.toFixed(2)}
                                    </Text>
                                </Flex>
                            </Box>
                        </Box>
                    </Grid>
                </Box>

                {/* ── Save / Reset ── */}
                <Flex justify="flex-end" mt={2} gap={3}>
                    <Button
                        variant="outline" colorScheme="gray" size="sm" px={6}
                        onClick={handleReset}
                    >
                        RESET
                    </Button>
                    <Button
                        bg="#237086" fontWeight="500" fontSize="14px" color="white"
                        _hover={{ bg: "#1B5A6B" }} px={12} borderRadius="12px"
                        isLoading={saving} loadingText="SAVING..."
                        onClick={handleSave}
                        boxShadow="0 2px 8px rgba(45,90,61,0.4)"
                    >
                        SAVE
                    </Button>
                </Flex>
            </Box>

            {/* ── Godown / Batch Modal ── */}
            <Modal isOpen={isGodownOpen} onClose={closeGodown} size="4xl" isCentered>
                <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(2px)" />
                <ModalContent borderRadius="8px" border="1px solid #c0cfc4" overflow="hidden">
                    <ModalHeader
                        bg="#e4eced" borderBottom="2px solid #c0d4c8"
                        fontSize="13px" fontWeight="700" color="#1e4a2e"
                    >
                        <Flex align="center" gap={2}>
                            <Box w="10px" h="10px" bg="#31848f" borderRadius="50%" />
                            Godown and Batch Details
                        </Flex>
                        <ModalCloseButton />
                    </ModalHeader>

                    <ModalBody p={4} bg="#ffffff">
                        <Box border="1px solid #E2E8F0" overflowX="auto" borderRadius="0px 0px 12px 12px">
                            <Table size="sm" mb={4} className="material_mfg">
                                <Thead bg="gray.100">
                                    <Tr>
                                        <Th {...thStyle} minW="160px">Batch No.</Th>
                                        <Th {...thStyle} minW="80px">Qty</Th>
                                        <Th {...thStyle} minW="110px">Mfg Date</Th>
                                        <Th {...thStyle} minW="110px">Expiry Date</Th>
                                        <Th {...thStyle} minW="110px">Remind Expiry</Th>
                                        <Th {...thStyle} minW="110px">Remind Date</Th>
                                    </Tr>
                                </Thead>
                                <Tbody bg="white">
                                    <Tr>
                                        {/* Batch dropdown */}
                                        <Td>
                                            <Select
                                                {...inputStyle}
                                                value={godownModal.batch_no}
                                                onChange={(e) => handleBatchSelect(e.target.value)}
                                            >
                                                <option value="">-- Select --</option>
                                                <option value="NOT_APPLICABLE">Not Applicable</option>
                                                {/* <option value="NEW_NUMBER">New Number</option> */}
                                                {batchList.map((b) => (
                                                    <option key={b.batch_no} value={b.batch_no}>{b.batch_no}</option>
                                                ))}
                                            </Select>
                                            {godownModal.isNewBatch && (
                                                <Input
                                                    {...inputStyle} mt={1}
                                                    placeholder="Enter new batch no."
                                                    value={godownModal.newBatchNo}
                                                    onChange={(e) =>
                                                        setGodownModal((p) => ({ ...p, newBatchNo: e.target.value }))
                                                    }
                                                    autoFocus borderColor="#3d7a52"
                                                />
                                            )}
                                        </Td>

                                        {/* Qty */}
                                        {!godownModal.isNewBatch ? (
                                            <Td {...tdStyle}>
                                                <Input
                                                    {...inputStyle} type="number"
                                                    value={godownModal.qty}
                                                    onChange={(e) =>
                                                        setGodownModal((p) => ({ ...p, qty: e.target.value }))
                                                    }
                                                />
                                            </Td>
                                        ) : <Td {...tdStyle} />}

                                        {/* Mfg Date */}
                                        <Td {...tdStyle}>
                                            <Input
                                                {...inputStyle} type="date"
                                                value={godownModal.mfg_date}
                                                onChange={(e) =>
                                                    setGodownModal((p) => ({ ...p, mfg_date: e.target.value }))
                                                }
                                            />
                                        </Td>

                                        {/* Expiry Date */}
                                        <Td {...tdStyle}>
                                            <Input
                                                {...inputStyle} type="date"
                                                value={godownModal.expiry_date}
                                                onChange={(e) =>
                                                    setGodownModal((p) => ({ ...p, expiry_date: e.target.value }))
                                                }
                                            />
                                        </Td>

                                        {/* Remind Expiry */}
                                        <Td {...tdStyle}>
                                            <Select
                                                {...inputStyle}
                                                value={godownModal.remind_expiry}
                                                onChange={(e) =>
                                                    setGodownModal((p) => ({ ...p, remind_expiry: e.target.value }))
                                                }
                                            >
                                                <option value="No">No</option>
                                                <option value="Yes">Yes</option>
                                            </Select>
                                        </Td>

                                        {/* Remind Date */}
                                        <Td {...tdStyle}>
                                            <Input
                                                {...inputStyle} type="date"
                                                value={godownModal.remind_date}
                                                onChange={(e) =>
                                                    setGodownModal((p) => ({ ...p, remind_date: e.target.value }))
                                                }
                                                isDisabled={godownModal.remind_expiry === "No"}
                                            />
                                        </Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                        </Box>

                        {/* Existing batches table */}
                        {batchList.length > 0 && (
                            <Box mt={3}>
                                <Text fontSize="11px" fontWeight="700" color="#3d7a52" mb={2}
                                    textTransform="uppercase" letterSpacing="0.5px">
                                    Existing Batches (click to select)
                                </Text>
                                <Box overflowX="auto" border="1px solid #d0d7de" borderRadius="4px">
                                    <Table size="sm" variant="simple">
                                        <Thead>
                                            <Tr>
                                                {["Batch No.", "Total Qty.", "GoDown", "Available", "Rate", "Unit"].map(
                                                    (h) => <Th key={h} {...thStyle}>{h}</Th>
                                                )}
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {batchList.map((b, bi) => (
                                                <Tr key={bi}
                                                    _hover={{ bg: "#e4ede6", cursor: "pointer" }}
                                                    bg={ godownModal.batch_no === b.batch_no
                                                    ? "#d4e8d8" : bi % 2 === 0 ? "white" : "#f7faf8" }
                                                    onClick={() => handleBatchSelect(b.batch_no)}>
                                                    <Td {...tdStyle} fontSize="11px" fontWeight="600" color="#2d5a3d">{b.batch_no}</Td>
                                                    <Td {...tdStyle} fontSize="11px" textAlign="right">{b.total_qty ?? b.qty}</Td>
                                                    <Td {...tdStyle} fontSize="11px">{b.godown_name}</Td>
                                                    <Td {...tdStyle} fontSize="11px" textAlign="right">{b.available_qty ?? b.qty}</Td>
                                                    <Td {...tdStyle} fontSize="11px" textAlign="right">{b.rate}</Td>
                                                    <Td {...tdStyle} fontSize="11px">{b.unit_name}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </Box>
                        )}

                        <Flex justify="flex-end" alignItems="center" mt={4} gap={3}>
                            <Button size="sm" variant="outline" colorScheme="gray" onClick={closeGodown}>
                                Cancel
                            </Button>
                            <Button
                                bg="#237086" fontWeight="500" fontSize="14px" color="white"
                                _hover={{ bg: "#1B5A6B" }} px={8} size="sm" borderRadius="12px"
                                onClick={handleGodownSave}>
                                SAVE
                            </Button>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default GenerateDebitNote;