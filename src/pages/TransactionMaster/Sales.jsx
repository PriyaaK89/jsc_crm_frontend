import React, { useState, useEffect, useCallback } from "react";
import {
    Box, Grid, GridItem, Input, Select, Text, Button, Table, Thead, Tbody, Tr,
    Th, Td, Textarea, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Badge, Divider, useToast,
    HStack,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import useUsersapi from "../../Apis/GetUsersapi";
import { fetchStockItemDropdown, fetchGodownList, fetchNextVoucherNo, fetchBatches, fetchStockItemDetailsByID, fetchLedgerDetailsByID, } from "../../Apis/commanApi";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { Link } from "react-router-dom";

// ─── Styles (matching Purchase) ───────────────────────────────────────────────
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

// ─── Empty item ───────────────────────────────────────────────────────────────
const emptyItem = () => ({
    stock_item_id: "",
    godown_id: "",
    batch_no: "",
    available_qty: 0,
    total_qty: 0,
    billed_qty: "",
    rate: "",
    supercash_price: 0,
    unit_id: "",
    unit_name: "",
    base_unit_value: 1,
    alt_unit_value: 0,
    bulk_base_value: 0,
    alt_unit_id: "",
    alt_unit_qty: null,
    alt_unit_name: "",

    bulk_unit_id: "",
    bulk_unit_value: null,
    bulk_unit_name: "",
    calculated_alt_unit: "",
    calculated_bulk_unit: "",

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
});

const emptyExtraLedger = () => ({
    ledger_id: "",
    amount: "",
    comments: "",
    operation: "PLUS",
});

// ─── Compute item amounts ─────────────────────────────────────────────────────
const computeItemAmounts = (item) => {
    const qty = Number(item.billed_qty || 0);
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

// ─── Main Component ───────────────────────────────────────────────────────────
const SalesTransaction = () => {
    const { users } = useUsersapi();
    const toast = useToast();

    // ── Dropdowns
    const [stockItemList, setStockItemList] = useState([]);
    const [godownList, setGodownList] = useState([]);
    const [salesLedgerList, setSalesLedgerList] = useState([]);
    const [customerList, setCustomerList] = useState([]);

    // ── Header fields

    const [voucherNo, setVoucherNo] = useState("");
    const [voucherTypeId, setVoucherTypeId] = useState(null);
    const [salesDate, setSalesDate] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [referenceNo, setReferenceNo] = useState("");
    const [customerLedgerId, setCustomerLedgerId] = useState("");
    const [salesLedgerId, setSalesLedgerId] = useState("");
    const [isConsignee, setIsConsignee] = useState("0");
    const [assignEmployee, setAssignEmployee] = useState("");
    const [employeeUnderId, setEmployeeUnderId] = useState("");
    const [narration, setNarration] = useState("");

    // ── Consignee
    const [dealerName, setDealerName] = useState("");
    const [proprietorName, setProprietorName] = useState("");
    const [consigneeContact, setConsigneeContact] = useState("");
    const [consigneeAddress, setConsigneeAddress] = useState("");
    const [consigneeGstn, setConsigneeGstn] = useState("");

    // ── Transport
    const [dispatchDocNo, setDispatchDocNo] = useState("");
    const [transportName, setTransportName] = useState("");
    const [destination, setDestination] = useState("");
    const [billTNo, setBillTNo] = useState("");
    const [vehicleNo, setVehicleNo] = useState("");
    const [transportFreight, setTransportFreight] = useState(0);
    const [localFreight, setLocalFreight] = useState(0);
    const [loadFreight, setLoadFreight] = useState(0);
    const [unloadFreight, setUnloadFreight] = useState(0);
    const [ewayNumber, setEwayNumber] = useState("");
    const [transporterGst, setTransporterGst] = useState("");
    const [deliveryPlace, setDeliveryPlace] = useState("");
    const [taxMode, setTaxMode] = useState("CGST_SGST");

    const [extraLedgers, setExtraLedgers] = useState([emptyExtraLedger()]);
    const [dispatchDocImage, setDispatchDocImage] = useState(null);
    const [billTImage, setBillTImage] = useState(null);
    const [fileResetKey, setFileResetKey] = useState(0);

    // ── Customer info
    const [customerInfo, setCustomerInfo] = useState({
        current_balance: "",
        balance_type: "Dr",
        security_amount: "0",
        credit_limit: "Not Specified",
    });

    // ── SuperCash
    const [isSuperCashSale, setIsSuperCashSale] = useState(false);
    const {
        isOpen: isSuperCashOpen,
        onOpen: openSuperCash,
        onClose: closeSuperCash,
    } = useDisclosure();
    const {
        isOpen: isFinalModalOpen,
        onOpen: onFinalModalOpen,
        onClose: onFinalModalClose,
    } = useDisclosure();

    // ── Items
    const [items, setItems] = useState([emptyItem()]);

    // ── Totals
    const [totals, setTotals] = useState({
        subtotal: 0,
        igst_total: 0,
        cgst_total: 0,
        sgst_total: 0,
        tax_total: 0,
        total_amount: 0,
    });

    // ── Godown/Batch modal
    const {
        isOpen: isGodownOpen,
        onOpen: openGodown,
        onClose: closeGodown,
    } = useDisclosure();
    const [activeItemIndex, setActiveItemIndex] = useState(null);
    const [batchList, setBatchList] = useState([]);
    const [selectedBatchNo, setSelectedBatchNo] = useState("");

    const [saving, setSaving] = useState(false);

    const [dispatchDocPreview, setDispatchDocPreview] = useState(null);
    const [billTPreview, setBillTPreview] = useState(null);

    const {
        isOpen: isImagePreviewOpen,
        onOpen: openImagePreview,
        onClose: closeImagePreview,
    } = useDisclosure();
    const [previewImageSrc, setPreviewImageSrc] = useState(null);
    const [previewImageTitle, setPreviewImageTitle] = useState("");

    const handleViewLarger = (src, title) => {
        setPreviewImageSrc(src);
        setPreviewImageTitle(title);
        openImagePreview();
    };

    // ─── Load on mount ────────────────────────────────────────────────────────
    useEffect(() => {
        loadDropdowns();
        loadVoucherNo();
    }, []);

    const trimNum = (n) => {
        const r = Number(n.toFixed(2));
        return r; // "2.00" -> 2, "2.50" stays 2.5
    };

    // Recomputes alt-unit and bulk-unit display strings from billed_qty
    const computeUnitConversions = (item) => {
        const qty = Number(item.billed_qty || 0);
        if (!qty) {
            return { calculated_alt_unit: "", calculated_bulk_unit: "" };
        }

        let calculated_alt_unit = "";
        if (item.alt_unit_value > 0 && item.base_unit_value > 0 && item.alt_unit_name) {
            const altQty = (qty * item.alt_unit_value) / item.base_unit_value;
            calculated_alt_unit = `${trimNum(altQty)} ${item.alt_unit_name}`;
        }

        let calculated_bulk_unit = "";
        if (item.bulk_unit_value > 0 && item.bulk_base_value > 0 && item.bulk_unit_name) {
            const bulkQtyRaw = (qty * item.bulk_unit_value) / item.bulk_base_value;
            const wholeBulk = Math.floor(bulkQtyRaw);
            const remainderBase = qty - (wholeBulk * item.bulk_base_value) / item.bulk_unit_value;

            calculated_bulk_unit =
                wholeBulk > 0
                    ? `${wholeBulk} ${item.bulk_unit_name}` +
                    (remainderBase > 0 ? ` ${trimNum(remainderBase)} ${item.unit_name}` : "")
                    : `${trimNum(bulkQtyRaw)} ${item.bulk_unit_name}`;
        }

        return { calculated_alt_unit, calculated_bulk_unit };
    };

    const loadDropdowns = async () => {
        try {
            const [stockData, godownData] = await Promise.all([
                fetchStockItemDropdown(),
                fetchGodownList(),
            ]);
            setStockItemList(stockData || []);
            setGodownList(godownData || []);

            // Sales ledger (Sales Account group)
            try {
                const r = await API.get(API_ENDPOINTS.GET_SALES_LEDGER_DROPDOWN);
                setSalesLedgerList(r?.data?.data || []);
            } catch (e) {
                console.error(e);
            }

            // Customer ledger (Sundry Debtors)
            try {
                const r = await API.get(API_ENDPOINTS.GET_LEDGER_DROPDOWN);
                setCustomerList(r?.data?.data || []);
            } catch (e) {
                console.error(e);
            }
        } catch (err) {
            console.error("loadDropdowns error:", err);
        }
    };

    const loadVoucherNo = async () => {
        try {
            const voucherData = await fetchNextVoucherNo("SALES");
            if (voucherData) {
                setVoucherNo(voucherData.voucher_no);
                setVoucherTypeId(voucherData.voucher_type_id);
            }
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
    // Change signature to accept extraLedgersArr
    const recalcTotals = useCallback((itemsArr, extraLedgersArr) => {
        let subtotal = 0, igst_total = 0, cgst_total = 0, sgst_total = 0;
        itemsArr.forEach((item) => {
            subtotal += Number(item.amount || 0);
            igst_total += Number(item.igst_amount || 0);
            cgst_total += Number(item.cgst_amount || 0);
            sgst_total += Number(item.sgst_amount || 0);
        });
        const tax_total = igst_total + cgst_total + sgst_total;

        let extraLedgerAmount = 0;
        (extraLedgersArr || []).forEach((ledger) => {
            const amount = Number(ledger.amount || 0);
            if (ledger.operation === "PLUS") {
                extraLedgerAmount += amount;
            } else {
                extraLedgerAmount -= amount;
            }
        });

        const total_amount = subtotal + tax_total + extraLedgerAmount;
        setTotals({
            subtotal: Number(subtotal.toFixed(2)),
            igst_total: Number(igst_total.toFixed(2)),
            cgst_total: Number(cgst_total.toFixed(2)),
            sgst_total: Number(sgst_total.toFixed(2)),
            tax_total: Number(tax_total.toFixed(2)),
            total_amount: Number(total_amount.toFixed(2)),
        });
    }, []); // no dependency on extraLedgers state now

    // ─── Customer select → fetch info + open supercash modal ─────────────────
    const handleCustomerSelect = async (ledgerId) => {
        setCustomerLedgerId(ledgerId);
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
        openSuperCash();
    };

    // ─── SuperCash confirm ────────────────────────────────────────────────────
    const handleSuperCashConfirm = (confirmed) => {
        setIsSuperCashSale(confirmed);
        closeSuperCash();
        // If confirmed, refetch rates for already-selected items
        if (confirmed) {
            onFinalModalOpen();
            setItems((prev) =>
                prev.map((item) => {
                    if (!item.stock_item_id) return item;
                    const useRate =
                        item.supercash_price > 0 ? item.supercash_price : item.rate;
                    const updated = { ...item, rate: useRate };
                    return { ...updated, ...computeItemAmounts(updated) };
                })
            );
        }
    };

    // ─── Stock item select → auto-fill ───────────────────────────────────────
    const handleStockItemSelect = async (index, stockItemId) => {
        if (!stockItemId) {
            const updated = [...items];
            updated[index] = emptyItem();
            setItems(updated);
            // recalcTotals(updated);
            recalcTotals(updated, extraLedgers);
            return;
        }

        try {
            const details = await fetchStockItemDetailsByID(stockItemId);
            if (!details) return;

            const supercashRate = details.supercash_price || 0;
            const regularRate = details.rate || 0;

            // Determine which rate to use
            let usedRate = regularRate;
            let toastMsg = "";
            let toastStatus = "info";

            if (isSuperCashSale && supercashRate > 0) {
                usedRate = supercashRate;
                toastMsg = `SuperCash price ₹${supercashRate} auto-filled`;
                toastStatus = "success";
            } else if (isSuperCashSale && supercashRate <= 0) {
                usedRate = regularRate;
                toastMsg = `SuperCash price not available. Regular price ₹${regularRate} filled`;
                toastStatus = "warning";
            } else {
                toastMsg = `Regular price ₹${regularRate} auto-filled`;
                toastStatus = "info";
            }

            toast({
                description: toastMsg,
                status: toastStatus,
                duration: 2000,
                isClosable: true,
                position: "top-right",
            });

            const gstDuty = details.rate_of_duty || 0;

            let igstPercent = 0;
            let cgstPercent = 0;
            let sgstPercent = 0;

            if (taxMode === "IGST") {
                igstPercent = gstDuty;
            } else {
                cgstPercent = gstDuty / 2;
                sgstPercent = gstDuty / 2;
            }

            // const newItem = {
            //     ...emptyItem(),
            //     stock_item_id: stockItemId,
            //     total_qty: details.available_qty || 0,
            //     rate: usedRate,
            //     supercash_price: supercashRate,
            //     unit_id: details.unit_id || "",
            //     unit_name: details.unit_name || "",
            //     alt_unit_id: details.alt_unit_id || null,
            //     alt_unit_name: details.alt_unit_name || "",
            //     alt_unit_qty: details.alt_unit_qty || "",
            //     gst_applicable: details.gst_applicable || 0,
            //     rate_of_duty: gstDuty,
            //     bulk_unit_id: details.bulk_unit_id || null,
            //     bulk_unit_value: details.bulk_unit_value || null,
            //     bulk_unit_name: details.bulk_unit_name || "",
            //     calculated_alt_unit: details.calculated_alt_unit,

            //     igst_percent: igstPercent,
            //     cgst_percent: cgstPercent,
            //     sgst_percent: sgstPercent,
            // };

            // const computed = computeItemAmounts(newItem);
            // const updated = [...items];
            // updated[index] = { ...newItem, ...computed };
            // setItems(updated);
            // recalcTotals(updated, extraLedgers);

            const newItem = {
                ...emptyItem(),
                stock_item_id: stockItemId,
                total_qty: details.available_qty || 0,
                rate: usedRate,
                supercash_price: supercashRate,
                unit_id: details.unit_id || "",
                unit_name: details.unit_name || "",

                base_unit_value: details.base_unit_value || 1,
                alt_unit_id: details.alt_unit_id || null,
                alt_unit_name: details.alt_unit_name || "",
                alt_unit_value: details.alt_unit_value || 0,

                bulk_unit_id: details.bulk_unit_id || null,
                bulk_unit_value: details.bulk_unit_value || null,
                bulk_base_value: details.bulk_base_value || 0,
                bulk_unit_name: details.bulk_unit_name || "",

                gst_applicable: details.gst_applicable || 0,
                rate_of_duty: gstDuty,

                igst_percent: igstPercent,
                cgst_percent: cgstPercent,
                sgst_percent: sgstPercent,
            };

            const computed = computeItemAmounts(newItem);
            const unitConversions = computeUnitConversions(newItem);
            const updated = [...items];
            updated[index] = { ...newItem, ...computed, ...unitConversions };
            setItems(updated);
            recalcTotals(updated, extraLedgers);
        } catch (err) {
            console.error("handleStockItemSelect error:", err);
        }
    };

    // ─── Item field change ────────────────────────────────────────────────────
    // const handleItemChange = (index, field, value) => {
    //     const updated = [...items];
    //     updated[index] = { ...updated[index], [field]: value };
    //     const computed = computeItemAmounts(updated[index]);
    //     updated[index] = { ...updated[index], ...computed };
    //     setItems(updated);
    //     // recalcTotals(updated);
    //     recalcTotals(updated, extraLedgers);
    // };
    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };

        const computed = computeItemAmounts(updated[index]);
        const unitConversions = computeUnitConversions(updated[index]);

        updated[index] = { ...updated[index], ...computed, ...unitConversions };
        setItems(updated);
        recalcTotals(updated, extraLedgers);
    };


    // ─── Godown select → fetch batches + open modal ───────────────────────────
    const handleGodownSelect = async (index, godownId) => {
        const updated = [...items];
        updated[index] = {
            ...updated[index],
            godown_id: godownId,
            batch_no: "",
            available_qty: 0,
        };
        setItems(updated);

        if (!godownId || !updated[index].stock_item_id) return;

        setActiveItemIndex(index);
        setSelectedBatchNo("");
        setBatchList([]);

        try {
            const batches = await fetchBatches(
                updated[index].stock_item_id,
                godownId
            );
            setBatchList(batches || []);
        } catch (err) {
            console.error("fetchBatches error:", err);
        }
        openGodown();
    };

    // ─── Batch select in modal ────────────────────────────────────────────────
    const handleBatchSelect = (batchNo) => {
        setSelectedBatchNo(batchNo);
    };

    // ─── Godown modal save ────────────────────────────────────────────────────
    const handleGodownSave = () => {
        if (activeItemIndex === null) return;

        let availQty = 0;
        let finalBatch = "";

        if (selectedBatchNo && selectedBatchNo !== "NOT_APPLICABLE") {
            const found = batchList.find((b) => b.batch_no === selectedBatchNo);

            availQty = found ? Number(found.qty || 0) : 0;

            finalBatch = selectedBatchNo;
        }

        const updated = [...items];

        updated[activeItemIndex] = {
            ...updated[activeItemIndex],
            batch_no: finalBatch,
            available_qty: availQty,
        };

        const computed = computeItemAmounts(updated[activeItemIndex]);

        updated[activeItemIndex] = {
            ...updated[activeItemIndex],
            ...computed,
        };

        setItems(updated);
        recalcTotals(updated, extraLedgers);

        closeGodown();
    };

    // ─── Add / Remove item rows ───────────────────────────────────────────────
    const addItemRow = () => setItems((prev) => [...prev, emptyItem()]);

    const removeItemRow = (index) => {
        const updated = items.filter((_, i) => i !== index);
        const final = updated.length ? updated : [emptyItem()];
        setItems(final);
        recalcTotals(final, extraLedgers);
    };

    // ─── Save ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!referenceNo) {
            toast({
                description: "Reference No. cannot be blank!",
                status: "error",
                duration: 2000,
            });
            return;
        }
        if (!salesDate) {
            toast({
                description: "Date is required!",
                status: "error",
                duration: 2000,
            });
            return;
        }
        if (!customerLedgerId) {
            toast({
                description: "Please select Party A/c Name!",
                status: "error",
                duration: 2000,
            });
            return;
        }

        const validItems = items.filter(
            (i) => i.stock_item_id && Number(i.billed_qty) > 0
        );
        if (validItems.length === 0) {
            toast({
                description: "Please add at least one item with billed quantity!",
                status: "error",
                duration: 2000,
            });
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();

            Object.entries({
                voucher_type_id: voucherTypeId,
                voucher_no: voucherNo,

                sales_date: salesDate,
                reference_no: referenceNo,

                customer_ledger_id: customerLedgerId,
                sales_ledger_id: salesLedgerId,
                assign_employee_id: assignEmployee === "Applicable" ? employeeUnderId : null,
                employee_under_id: assignEmployee === "Applicable" ? employeeUnderId : null,
                is_consignee: isConsignee === "1" ? 1 : 0,

                dealer_name: dealerName,
                proprietor_name: proprietorName,
                consignee_contact_no: consigneeContact,
                consignee_address: consigneeAddress,
                consignee_gstn_no: consigneeGstn,
                dispatch_doc_no: dispatchDocNo,
                transport_name: transportName,

                destination,
                bill_t_no: billTNo,
                vehicle_no: vehicleNo,
                transport_freight: transportFreight,
                local_freight: localFreight,

                load_freight: loadFreight,
                unload_freight: unloadFreight,
                eway_number: ewayNumber,
                transporter_gst: transporterGst,
                delivery_place: deliveryPlace,
                is_supercash_sale: isSuperCashSale ? 1 : 0,
                tax_mode: taxMode,

                subtotal: totals.subtotal,
                igst_total: totals.igst_total,
                cgst_total: totals.cgst_total,
                sgst_total: totals.sgst_total,
                tax_total: totals.tax_total,
                total_amount: totals.total_amount,

                narration,
            }).
                forEach(([key, value]) => { formData.append(key, value ?? ""); });
            formData.append(
                "items",
                JSON.stringify(
                    validItems.map((it) => ({
                        stock_item_id: it.stock_item_id,
                        godown_id: it.godown_id,
                        batch_no: it.batch_no,
                        available_qty: it.available_qty,
                        billed_qty: it.billed_qty,
                        rate: it.rate,
                        supercash_price: it.supercash_price || 0,
                        unit_id: it.unit_id,
                        alt_unit_id: it.alt_unit_id,

                        alt_unit_qty: it.alt_unit_qty,
                        bulk_unit_id: it.bulk_unit_id,
                        bulk_unit_value: it.bulk_unit_value,
                        calculated_alt_unit: it.calculated_alt_unit,
                        calculated_bulk_unit: it.calculated_bulk_unit,

                        amount: it.amount,
                        igst_percent: it.igst_percent,
                        igst_amount: it.igst_amount,
                        cgst_percent: it.cgst_percent,
                        cgst_amount: it.cgst_amount,
                        sgst_percent: it.sgst_percent,
                        sgst_amount: it.sgst_amount,
                        total_amount: it.total_amount
                    }))
                )
            );
            const validExtraLedgers = extraLedgers.filter(ledger => ledger.ledger_id && Number(ledger.amount) > 0);

            formData.append("extra_ledgers", JSON.stringify(validExtraLedgers));
            // formData.append( "extra_ledgers", JSON.stringify( extraLedgers ) );
            if (dispatchDocImage) { formData.append("dispatch_doc_image", dispatchDocImage); }
            if (billTImage) { formData.append("bill_t_image", billTImage); }


            const res = await API.post(
                API_ENDPOINTS.CREATE_SALES_ORDER || "/create-sales-order",
                formData,
                { headers: { "Content-Type": "multipart/form-data", }, });

            if (res?.data?.success) {
                toast({
                    description: `Sale Created Successfully! Voucher: ${res.data.voucher_no}`,
                    status: "success",
                    duration: 2000,
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
                duration: 2000,
            });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setReferenceNo("");
        setCustomerLedgerId("");
        setSalesLedgerId("");
        setIsConsignee("0");
        setAssignEmployee("");
        setEmployeeUnderId("");
        setNarration("");
        setDealerName("");
        setProprietorName("");
        setConsigneeContact("");
        setConsigneeAddress("");
        setConsigneeGstn("");
        setDispatchDocNo("");
        setTransportName("");
        setDestination("");
        setBillTNo("");

        setVehicleNo("");
        setTransportFreight(0);
        setLocalFreight(0);
        setLoadFreight(0);
        setUnloadFreight(0);
        setEwayNumber("");
        setTransporterGst("");
        setDeliveryPlace("");
        setCustomerInfo({
            current_balance: "",
            balance_type: "Dr",
            security_amount: "0",
            credit_limit: "Not Specified",
        });
        setIsSuperCashSale(false);

        setItems([emptyItem()]);
        setExtraLedgers([emptyExtraLedger()]);

        setDispatchDocImage(null);
        setBillTImage(null);
        setFileResetKey(prev => prev + 1);

        setTotals({
            subtotal: 0,
            igst_total: 0,
            cgst_total: 0,
            sgst_total: 0,
            tax_total: 0,
            total_amount: 0,
        });
        setSalesDate(new Date().toISOString().slice(0, 10));
    };

    useEffect(() => {
        if (!dispatchDocImage) {
            setDispatchDocPreview(null);
            return;
        }
        const url = URL.createObjectURL(dispatchDocImage);
        setDispatchDocPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [dispatchDocImage]);

    useEffect(() => {
        if (!billTImage) {
            setBillTPreview(null);
            return;
        }
        const url = URL.createObjectURL(billTImage);
        setBillTPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [billTImage]);

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            <Box>
                {/* ── Section 1: Voucher Details ── */}
                <Box {...sectionStyle}>
                    <Box bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">
                        <Text fontWeight="500" fontSize="sm">
                            Voucher Details
                        </Text>
                    </Box>
                    <Grid
                        templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }}
                        gap={4}
                        p={4}>
                        <GridItem>
                            <Text {...labelStyle} color="#c0392b">
                                Sales No.
                            </Text>
                            <Input {...readonlyInputStyle} value={voucherNo} readOnly />
                        </GridItem>
                        <GridItem>
                            <Text {...labelStyle} color="#c0392b">
                                Reference No.
                            </Text>
                            <Input
                                {...inputStyle}
                                value={referenceNo}
                                onChange={(e) => setReferenceNo(e.target.value)}
                                placeholder="Required *"
                            />
                        </GridItem>
                        <GridItem>
                            <Text {...labelStyle}>
                                Date{" "}
                                <Text as="span" color="red.500">
                                    *
                                </Text>
                            </Text>
                            <Input
                                {...inputStyle}
                                type="date"
                                value={salesDate}
                                onChange={(e) => setSalesDate(e.target.value)}
                            />
                        </GridItem>
                        <GridItem>
                            <Text {...labelStyle}>Party A/c Name</Text>
                            <Flex gap={2} align="center">
                                <Select
                                    {...inputStyle}
                                    value={customerLedgerId}
                                    onChange={(e) => handleCustomerSelect(e.target.value)}
                                    flex={1}>
                                    <option value="">-- Select Party --</option>
                                    {customerList.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.ledger_name}
                                        </option>
                                    ))}
                                </Select>
                            </Flex>
                        </GridItem>
                        <GridItem>
                            <Text {...labelStyle}>Is Consignee</Text>
                            <Select
                                {...inputStyle}
                                value={isConsignee}
                                onChange={(e) => setIsConsignee(e.target.value)}
                                maxW="200px">
                                <option value="0">No</option>
                                <option value="1">Yes</option>
                            </Select>
                        </GridItem>
                    </Grid>
                </Box>

                {/* ── Section 2: Consignee Details (conditional) ── */}
                {isConsignee === "1" && (
                    <Box {...sectionStyle}>
                        <Box bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">
                            <Text fontWeight="500" fontSize="sm">
                                Consignee Details
                            </Text>
                        </Box>
                        <Table size="sm" className="material_mfg">
                            <Thead bg="gray.50">
                                <Tr>
                                    {[
                                        "Dealer Name",
                                        "Prop Name",
                                        "Contact",
                                        "Address",
                                        "GSTN No",
                                    ].map((h) => (
                                        <Th key={h}>{h}</Th>
                                    ))}
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr bg="white">
                                    <Td>
                                        <Input
                                            value={dealerName}
                                            onChange={(e) => setDealerName(e.target.value)}
                                            size="sm"
                                        />
                                    </Td>
                                    <Td>
                                        <Input
                                            value={proprietorName}
                                            onChange={(e) => setProprietorName(e.target.value)}
                                            size="sm" />
                                    </Td>
                                    <Td>
                                        <Input value={consigneeContact} onChange={(e) => setConsigneeContact(e.target.value)} size="sm" />
                                    </Td>
                                    <Td>
                                        <Input value={consigneeAddress} onChange={(e) => setConsigneeAddress(e.target.value)} size="sm" />
                                    </Td>
                                    <Td>
                                        <Input value={consigneeGstn} onChange={(e) => setConsigneeGstn(e.target.value)} size="sm" />
                                    </Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </Box>
                )}

                {/* ── Section 3: Assignment ── */}
                <Box {...sectionStyle}>
                    <Box bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">
                        <Text fontWeight="500" fontSize="sm">
                            Assignment
                        </Text>
                    </Box>
                    <Grid
                        templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }}
                        gap={4}
                        p={4}>
                        <GridItem>
                            <Text {...labelStyle}>Assign Employee</Text>
                            <Select
                                {...inputStyle}
                                value={assignEmployee}
                                onChange={(e) => {
                                    setAssignEmployee(e.target.value);
                                    setEmployeeUnderId("");
                                }}>
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
                                    onChange={(e) => setEmployeeUnderId(e.target.value)}>
                                    <option value="">-- Select Employee --</option>
                                    {(users || []).map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name}
                                        </option>
                                    ))}
                                </Select>
                            </GridItem>
                        )}
                        <GridItem>
                            <Text {...labelStyle}>Sales Ledger</Text>
                            <Select
                                {...inputStyle}
                                value={salesLedgerId}
                                onChange={(e) => setSalesLedgerId(e.target.value)}>
                                <option value="">-- Select --</option>
                                {salesLedgerList.map((l) => (
                                    <option key={l.id} value={l.id}>
                                        {l.ledger_name}
                                    </option>
                                ))}
                            </Select>
                        </GridItem>
                        <GridItem>
                            <Text {...labelStyle}>Select Tax Mode</Text>
                            <Select
                                value={taxMode}
                                onChange={(e) => setTaxMode(e.target.value)}>
                                <option value="CGST_SGST"> CGST + SGST </option>
                                <option value="IGST"> IGST </option>
                            </Select>
                        </GridItem>
                    </Grid>
                </Box>

                {/* ── Section 4: Customer Info ── */}
                {customerLedgerId && (
                    <Box {...sectionStyle}>
                        <Box bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">
                            <Text fontWeight="500" fontSize="sm">
                                Customer Information
                            </Text>
                        </Box>
                        <Grid
                            templateColumns={{ base: "1fr", md: "repeat(3,1fr)" }}
                            gap={4}
                            p={4}>
                            <Box>
                                <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>
                                    Current Balance
                                </Text>
                                <Flex gap={1} align="center">
                                    <Input
                                        {...readonlyInputStyle}
                                        value={customerInfo.current_balance}
                                        readOnly
                                    />
                                    <Badge
                                        colorScheme={
                                            customerInfo.balance_type === "Cr" ? "green" : "red"
                                        }
                                        fontSize="10px"
                                        px={2}
                                        py={1}>
                                        {customerInfo.balance_type}
                                    </Badge>
                                </Flex>
                            </Box>
                            <Box>
                                <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>
                                    Security Amount
                                </Text>
                                <Input
                                    {...readonlyInputStyle}
                                    value={customerInfo.security_amount}
                                    readOnly
                                />
                            </Box>
                            <Box>
                                <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>
                                    Credit Limit
                                </Text>
                                <Input
                                    {...readonlyInputStyle}
                                    value={customerInfo.credit_limit}
                                    readOnly
                                />
                            </Box>
                        </Grid>
                    </Box>
                )}

                {/* ── Section 5: Transport Details ── */}
                <Box {...sectionStyle}>
                    <Box bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">
                        <Text fontWeight="500" fontSize="sm">
                            Transport Details
                        </Text>
                    </Box>
                    <Grid templateColumns="1fr 1fr 1fr 1fr" gap={3} mt={4} px={4}>
                        <Box>
                            <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>
                                Dispatch Doc No
                            </Text>

                            <Input
                                value={dispatchDocNo}
                                onChange={(e) =>
                                    setDispatchDocNo(e.target.value)
                                }
                            />
                        </Box>

                        <Box>
                            <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>Dispatch Doc Image</Text>
                            <Input key={`dispatch-${fileResetKey}`}
                                type="file"
                                accept="image/*,.pdf"
                                p={1}
                                onChange={(e) => setDispatchDocImage(e.target.files?.[0] || null)} />

                            {dispatchDocImage && (
                                <Flex mt={2} align="center" gap={2}>
                                    {dispatchDocImage.type === "application/pdf" ? (
                                        <Flex
                                            align="center" justify="center"
                                            w="50px" h="50px" bg="gray.100" borderRadius="4px"
                                            border="1px solid #d0d7de" cursor="pointer"
                                            onClick={() => window.open(dispatchDocPreview, "_blank")}>
                                            <Text fontSize="10px" fontWeight="700" color="red.600">PDF</Text>
                                        </Flex>
                                    ) : (
                                        <Box
                                            as="img"
                                            src={dispatchDocPreview}
                                            alt="Dispatch doc preview"
                                            w="50px" h="50px"
                                            objectFit="cover"
                                            borderRadius="4px"
                                            border="1px solid #d0d7de"
                                            cursor="pointer"
                                            onClick={() => handleViewLarger(dispatchDocPreview, "Dispatch Doc Image")} />
                                    )}
                                    <Text fontSize="10px" color="gray.600" noOfLines={1} maxW="90px">
                                        {dispatchDocImage.name}
                                    </Text>
                                </Flex>
                            )}
                        </Box>

                        <Box>
                            <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>
                                Transport Name
                            </Text>

                            <Input
                                value={transportName}
                                onChange={(e) =>
                                    setTransportName(e.target.value)
                                }
                            />
                        </Box>

                        <Box>
                            <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>
                                Destination
                            </Text>

                            <Input
                                value={destination}
                                onChange={(e) =>
                                    setDestination(e.target.value)
                                }
                            />
                        </Box>
                    </Grid>
                    <Grid templateColumns="repeat(4,1fr)" gap={3} p={4}>
                        <Box>
                            <Text
                                fontSize="11px"
                                fontWeight="600"
                                color="#555"
                                mb={1}
                            >
                                Bill-T No.
                            </Text>

                            <Input
                                value={billTNo}
                                onChange={(e) =>
                                    setBillTNo(e.target.value)
                                }
                            />
                        </Box>

                        <Box>
                            <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>Bill-T Image</Text>
                            <Input key={`billt-${fileResetKey}`} type="file" accept="image/*,.pdf" p={1}
                                onChange={(e) => setBillTImage(e.target.files?.[0] || null)} />

                            {billTImage && (
                                <Flex mt={2} align="center" gap={2}>
                                    {billTImage.type === "application/pdf" ? (
                                        <Flex
                                            align="center" justify="center"
                                            w="50px" h="50px" bg="gray.100" borderRadius="4px"
                                            border="1px solid #d0d7de" cursor="pointer"
                                            onClick={() => window.open(billTPreview, "_blank")}>
                                            <Text fontSize="10px" fontWeight="700" color="red.600">PDF</Text>
                                        </Flex>
                                    ) : (
                                        <Box
                                            as="img"
                                            src={billTPreview}
                                            alt="Bill-T preview"
                                            w="50px" h="50px"
                                            objectFit="cover"
                                            borderRadius="4px"
                                            border="1px solid #d0d7de"
                                            cursor="pointer"
                                            onClick={() => handleViewLarger(billTPreview, "Bill-T Image")} />
                                    )}
                                    <Text fontSize="10px" color="gray.600" noOfLines={1} maxW="90px">
                                        {billTImage.name}
                                    </Text>
                                </Flex>
                            )}
                        </Box>
                        {[

                            { label: "Vehicle No.", val: vehicleNo, set: setVehicleNo },
                            {
                                label: "Transport Freight",
                                val: transportFreight,
                                set: setTransportFreight,
                                type: "number",
                            },
                            {
                                label: "Local Freight",
                                val: localFreight,
                                set: setLocalFreight,
                                type: "number",
                            },
                            {
                                label: "Load Freight",
                                val: loadFreight,
                                set: setLoadFreight,
                                type: "number",
                            },
                            {
                                label: "Unload Freight",
                                val: unloadFreight,
                                set: setUnloadFreight,
                                type: "number",
                            },
                            { label: "E-Way Number", val: ewayNumber, set: setEwayNumber },
                            {
                                label: "Transporter GST",
                                val: transporterGst,
                                set: setTransporterGst,
                            },
                            {
                                label: "Delivery Place",
                                val: deliveryPlace,
                                set: setDeliveryPlace,
                            },
                        ].map(({ label, val, set, type }) => (
                            <Box key={label}>
                                <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>
                                    {label}
                                </Text>
                                <Input
                                    type={type || "text"}
                                    value={val}
                                    onChange={(e) => set(e.target.value)}
                                />
                            </Box>
                        ))}
                    </Grid>
                </Box>

                {/* ── Section 6: Items Table ── */}
                <Box {...sectionStyle} overflowX="auto">
                    <Flex
                        justify="space-between"
                        align="center"
                        bg="#4f9190"
                        color="white"
                        px={4}
                        py={2}
                        borderTopRadius="md">
                        <Text fontWeight="500" fontSize="sm">
                            Stock Items
                            {isSuperCashSale && (
                                <Badge ml={2} colorScheme="yellow" color="yellow.800">
                                    ⚡ SuperCash Active
                                </Badge>
                            )}
                        </Text>
                        <HStack>
                            <Button size="xs"
                                padding={3}
                                fontWeight="500"
                                marginRight="4px"
                                leftIcon={<AddIcon fontSize="11px" />}
                                colorScheme="whiteAlpha"
                                variant="solid" _hover={{ bg: "#2d595a" }}><Link to={"/inventory/create-stock-item"}>Create Item</Link></Button>
                            <Button
                                size="xs"
                                padding={3}
                                fontWeight="500"
                                marginRight="4px"
                                leftIcon={<AddIcon fontSize="11px" />}
                                colorScheme="whiteAlpha"
                                variant="solid"
                                onClick={addItemRow}
                                _hover={{ bg: "#2d595a" }}>
                                Add Item
                            </Button>
                        </HStack>
                    </Flex>

                    {isSuperCashSale && (
                        <Box overflow="hidden" py={2}>
                            <Text
                                fontSize="12px"
                                fontWeight="700"
                                color="green.600"
                                display="inline-block"
                                sx={{
                                    animation: "marquee 20s linear infinite",
                                    whiteSpace: "nowrap",
                                    "@keyframes marquee": {
                                        "0%": { transform: "translateX(-100%)" },
                                        "100%": { transform: "translateX(100vw)" },
                                    },
                                }}>
                                ⚡ Superb! You have selected for SUPERCASH Sale. ⚡
                            </Text>
                        </Box>
                    )}

                    <Table
                        size="sm"
                        variant="simple"
                        style={{ borderCollapse: "separate", borderSpacing: 0 }}
                        className="material_mfg">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th {...thStyle} minW="130px">
                                    Name of item
                                </Th>
                                <Th {...thStyle} minW="50px">
                                    Total Qty.
                                </Th>
                                <Th {...thStyle} minW="100px">
                                    GoDown
                                </Th>
                                <Th {...thStyle} minW="60px">
                                    Available
                                </Th>
                                <Th {...thStyle} minW="60px">
                                    Billed Qty.
                                </Th>
                                <Th {...thStyle} minW="60px">
                                    Rate
                                </Th>
                                <Th {...thStyle} minW="55px">
                                    Unit
                                </Th>
                                <Th {...thStyle} minW="55px">
                                    Alt. Unit
                                </Th>
                                <Th {...thStyle} minW="55px">
                                    Bulk Unit
                                </Th>
                                <Th {...thStyle} minW="60px">
                                    Amount
                                </Th>
                                <Th {...thStyle} minW="50px">
                                    IGST %
                                </Th>
                                <Th {...thStyle} minW="60px">
                                    Tax Amt.
                                </Th>
                                <Th {...thStyle} minW="85px">
                                    Total Amt.
                                </Th>
                                <Th {...thStyle} minW="30px"></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {items.map((item, index) => (
                                <Tr
                                    key={index}
                                    bg={index % 2 === 0 ? "white" : "#f7faf8"}
                                    _hover={{ bg: "#edf5ef" }}>
                                    {/* Stock Item */}
                                    <Td {...tdStyle}>
                                        <Select
                                            {...inputStyle}
                                            fontSize="11px"
                                            value={item.stock_item_id}
                                            onChange={(e) =>
                                                handleStockItemSelect(index, e.target.value)
                                            }
                                            minW="130px">
                                            <option value="">-- End Of List --</option>
                                            {stockItemList.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.item_name}
                                                </option>
                                            ))}
                                        </Select>
                                    </Td>

                                    {/* Total Qty */}
                                    <Td {...tdStyle}>
                                        <Input
                                            {...readonlyInputStyle}
                                            value={item.total_qty ?? 0}
                                            readOnly
                                            textAlign="right"
                                            minW="50px"
                                        />
                                    </Td>

                                    {/* GoDown */}
                                    <Td {...tdStyle}>
                                        <Select
                                            {...inputStyle}
                                            value={item.godown_id}
                                            onChange={(e) =>
                                                handleGodownSelect(index, e.target.value)
                                            }
                                            isDisabled={!item.stock_item_id}
                                            minW="85px">
                                            <option value="">Please Select</option>
                                            {godownList.map((g) => (
                                                <option key={g.id} value={g.id}>
                                                    {g.godown_name}
                                                </option>
                                            ))}
                                        </Select>
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

                                    {/* Billed Qty */}
                                    <Td {...tdStyle}>
                                        <Input
                                            {...inputStyle}
                                            type="number"
                                            value={item.billed_qty}
                                            isDisabled={!item.godown_id}
                                            onChange={(e) =>
                                                handleItemChange(index, "billed_qty", e.target.value)
                                            }
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
                                            onChange={(e) =>
                                                handleItemChange(index, "rate", e.target.value)
                                            }
                                            textAlign="right"
                                            minW="60px"
                                            bg={
                                                isSuperCashSale && item.supercash_price > 0
                                                    ? "#fffde7"
                                                    : "white"
                                            }
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
                                            // value={
                                            //     item.alt_unit_qty && item.alt_unit_name
                                            //         ? `${item.alt_unit_qty} ${item.alt_unit_name}`
                                            //         : ""
                                            // }
                                            value={item?.calculated_alt_unit}
                                            readOnly
                                            textAlign="center"
                                            minW="55px"
                                        />
                                    </Td>

                                    <Td {...tdStyle}>
                                        <Input
                                            {...readonlyInputStyle}
                                            value={item?.calculated_bulk_unit}
                                            readOnly
                                            textAlign="center"
                                            minW="55px"
                                        />
                                    </Td>

                                    {/* <Td {...tdStyle}>
                                        <Input
                                            {...readonlyInputStyle}

                                            value={
                                                item.bulk_unit_value && item.bulk_unit_name
                                                    ? `${item.bulk_unit_value} ${item.bulk_unit_name}`
                                                    : ""
                                            }
                                            readOnly
                                        />
                                    </Td> */}

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
                                        />
                                    </Td>

                                    {/* Remove */}
                                    <Td {...tdStyle} textAlign="center">
                                        {items.length > 1 && (
                                            <Button size="xs" colorScheme="red" variant="ghost"
                                                onClick={() => removeItemRow(index)}
                                                fontSize="14px" minW="24px" h="24px" p={0}>
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
                        color="#2d5a3d">
                        <Text>Subtotal: ₹{totals.subtotal.toFixed(2)}</Text>
                        <Text>|</Text>
                        <Text>Tax: ₹{totals.tax_total.toFixed(2)}</Text>
                    </Flex>
                </Box>

                <Box {...sectionStyle}>
                    <Box bg="#4f9190" color="white" px={4} py={2}>
                        <Text>Extra Ledgers</Text>
                    </Box>

                    <Table size="sm">
                        <Thead>
                            <Tr>
                                <Th>Ledger</Th>
                                <Th>Amount</Th>
                                <Th>+ / -</Th>
                                <Th>Comments</Th>
                                <Th></Th>
                            </Tr>
                        </Thead>

                        <Tbody>
                            {extraLedgers.map((row, index) => (
                                <Tr key={index}>
                                    <Td>
                                        <Select
                                            value={row.ledger_id}
                                            onChange={(e) => {
                                                const updated = [...extraLedgers];
                                                updated[index].ledger_id = e.target.value;
                                                setExtraLedgers(updated);
                                            }}>
                                            <option value="">Select</option>
                                            {customerList.map((ledger) => (
                                                <option key={ledger.id} value={ledger.id}>
                                                    {ledger.ledger_name}
                                                </option>
                                            ))}
                                        </Select>
                                    </Td>

                                    <Td>
                                        <Input
                                            value={row.amount}
                                            type="number"
                                            onChange={(e) => {
                                                const updated = [...extraLedgers];
                                                updated[index].amount = e.target.value;
                                                setExtraLedgers(updated);
                                                recalcTotals(items, updated);
                                                // recalcTotals(items, updatedExtraLedgers);
                                            }}
                                        />
                                    </Td>

                                    <Td>
                                        <Button
                                            size="sm"
                                            colorScheme={row.operation === "PLUS" ? "red" : "green"}  // red = subtract toggle, green = add toggle
                                            onClick={() => {
                                                const updated = [...extraLedgers];
                                                updated[index].operation =
                                                    updated[index].operation === "PLUS" ? "MINUS" : "PLUS";
                                                setExtraLedgers(updated);
                                                recalcTotals(items, updated);
                                            }}>
                                            {row.operation === "PLUS" ? "−" : "+"}
                                        </Button>
                                    </Td>

                                    <Td>
                                        <Input
                                            value={row.comments}
                                            onChange={(e) => {
                                                const updated = [...extraLedgers];
                                                updated[index].comments = e.target.value;
                                                setExtraLedgers(updated);
                                            }}
                                        />
                                    </Td>

                                    <Td>
                                        <Flex gap={2}>
                                            {/* Add row */}
                                            <Button
                                                size="sm"
                                                colorScheme="teal"
                                                onClick={() => {
                                                    setExtraLedgers([...extraLedgers, emptyExtraLedger()]);
                                                }}>
                                                +
                                            </Button>
                                            {/* Remove row — only show if more than 1 row */}
                                            {extraLedgers.length > 1 && (
                                                <Button
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        const updated = extraLedgers.filter((_, i) => i !== index);
                                                        setExtraLedgers(updated);
                                                        recalcTotals(items, updated);
                                                    }}>
                                                    ×
                                                </Button>
                                            )}
                                        </Flex>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>

                {/* ── Section 7: Totals + Narration ── */}
                <Box {...sectionStyle} mt={4} padding={3}>
                    <Grid templateColumns="1fr 320px" gap={5}>
                        {/* Narration */}
                        <Box>
                            <Box
                                bg="#4f9190"
                                color="white"
                                px={4}
                                py={2}
                                borderTopRadius="md">
                                <Text fontWeight="500" fontSize="sm">
                                    Narration
                                </Text>
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
                                <Text fontWeight="500" fontSize="sm"> Tax Summary </Text>
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
                                        <Flex justify="space-between" align="center" px={3} py="6px"
                                            borderBottom="1px solid #f0f4f0">
                                            <Text fontSize="12px" color="#555" fontWeight="500"> {label} </Text>
                                            <Text fontSize="12px" color="#555" fontWeight="600"> ₹{Number(value || 0).toFixed(2)} </Text>
                                        </Flex>
                                    </React.Fragment>
                                ))}
                                {/* Extra ledger lines between subtotal and total */}
                                {extraLedgers
                                    .filter((row) => row.ledger_id && Number(row.amount) !== 0)
                                    .map((row, i) => {
                                        const ledgerName =
                                            customerList.find((l) => String(l.id) === String(row.ledger_id))?.ledger_name || "Extra";
                                        const isPlus = row.operation === "PLUS";
                                        return (
                                            <Flex key={i} justify="space-between" align="center" px={3} py="6px"
                                                borderBottom="1px solid #f0f4f0"
                                                bg={isPlus ? "#f0fdf4" : "#fff5f5"}>
                                                <Text fontSize="12px" color={isPlus ? "green.600" : "red.500"} fontWeight="500">
                                                    {isPlus ? "＋" : "－"} {ledgerName}
                                                </Text>
                                                <Text fontSize="12px" color={isPlus ? "green.600" : "red.500"} fontWeight="600">
                                                    {isPlus ? "+" : "-"}₹{Number(row.amount || 0).toFixed(2)}
                                                </Text>
                                            </Flex>
                                        );
                                    })
                                }
                                <Flex justify="space-between" align="center" px={3} py={2} bg="#5d6e6e">
                                    <Text fontSize="13px" color="white" fontWeight="700"> Total Amount </Text>
                                    <Text fontSize="14px" color="white" fontWeight="800"> ₹{totals.total_amount.toFixed(2)} </Text>
                                </Flex>
                            </Box>
                        </Box>
                    </Grid>
                </Box>

                {/* ── Save / Reset Buttons ── */}
                <Flex justify="flex-end" mt={2} gap={3}>
                    <Button variant="outline" colorScheme="gray" size="sm" px={6} onClick={handleReset}>
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
                        boxShadow="0 2px 8px rgba(45,90,61,0.4)">
                        SAVE
                    </Button>
                </Flex>
            </Box>

            {/* ══ SuperCash Modal ══ */}
            <Modal
                isOpen={isSuperCashOpen}
                onClose={() => {
                    setIsSuperCashSale(false);
                    closeSuperCash();
                }}
                isCentered
                size="sm">
                <ModalOverlay bg="blackAlpha.500" />
                <ModalContent borderRadius="12px" overflow="hidden">
                    <ModalBody py={8} textAlign="center">
                        <Flex
                            w="56px"
                            h="56px"
                            borderRadius="50%"
                            border="3px solid"
                            borderColor="green.400"
                            align="center"
                            justify="center"
                            mx="auto"
                            mb={3}>
                            <Text fontSize="24px" color="green.400">
                                ✓
                            </Text>
                        </Flex>
                        <Text fontWeight="700" fontSize="18px" mb={2}>
                            Is SuperCash Sale?
                        </Text>
                        <Text fontSize="13px" color="gray.500" mb={6}>
                            Once submit, your item rate will be supercash eligible!
                        </Text>
                        <Flex justify="center" gap={3}>
                            <Button
                                variant="outline"
                                colorScheme="gray"
                                onClick={() => handleSuperCashConfirm(false)}>
                                CANCEL
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={() => handleSuperCashConfirm(true)}>
                                OK
                            </Button>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal
                isOpen={isFinalModalOpen}
                onClose={onFinalModalClose}
                isCentered
                size="md">
                <ModalOverlay />
                <ModalContent borderRadius="12px" overflow="hidden">
                    <ModalBody py={8} textAlign="center">
                        <Text fontSize="14px" fontWeight="500" mb={4}>
                            🎉 Wonderful! Your bill is SuperCash eligible now!
                        </Text>
                        <Button
                            colorScheme="teal"
                            onClick={onFinalModalClose}
                            height="32px"
                            fontSize="12px"
                            mt={4}>
                            OK
                        </Button>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* ══ Godown / Batch Modal ══ */}
            <Modal isOpen={isGodownOpen} onClose={closeGodown} size="3xl" isCentered>
                <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(2px)" />
                <ModalContent
                    borderRadius="8px"
                    border="1px solid #c0cfc4"
                    overflow="hidden">
                    <ModalHeader
                        bg="#e4eced"
                        borderBottom="2px solid #c0d4c8"
                        fontSize="13px"
                        fontWeight="700"
                        color="#1e4a2e">
                        <Flex align="center" gap={2}>
                            <Box w="10px" h="10px" bg="#31848f" borderRadius="50%" />
                            Godown — Select Batch
                        </Flex>
                        <ModalCloseButton />
                    </ModalHeader>
                    <ModalBody p={4} bg="white">
                        <Box
                            border="1px solid #E2E8F0"
                            borderRadius="8px"
                            overflow="hidden"
                            mb={4}>
                            <Table size="sm" className="material_mfg">
                                <Thead bg="gray.100">
                                    <Tr>
                                        <Th {...thStyle}>Select</Th>
                                        <Th {...thStyle}>Batch No.</Th>
                                        <Th {...thStyle} isNumeric>
                                            Qty
                                        </Th>
                                        <Th {...thStyle}>Mfg Date</Th>
                                        <Th {...thStyle}>Expiry Date</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {/* Not Applicable row */}
                                    <Tr
                                        bg={selectedBatchNo === "NOT_APPLICABLE" ? "blue.50" : "white"}
                                        cursor="pointer"
                                        _hover={{ bg: "blue.50" }}
                                        onClick={() => handleBatchSelect("NOT_APPLICABLE")}>
                                        <Td {...tdStyle}>
                                            <input
                                                type="radio"
                                                name="batch_select"
                                                checked={selectedBatchNo === "NOT_APPLICABLE"}
                                                onChange={() => handleBatchSelect("NOT_APPLICABLE")}
                                            />
                                        </Td>
                                        <Td
                                            {...tdStyle}
                                            fontSize="12px"
                                            fontStyle="italic"
                                            color="gray.500">
                                            Not Applicable
                                        </Td>
                                        <Td {...tdStyle} isNumeric fontSize="12px">
                                            {batchList
                                                .reduce((sum, b) => sum + Number(b.qty || 0), 0)
                                                .toFixed(2)}
                                        </Td>
                                        <Td {...tdStyle} fontSize="12px"> — </Td>
                                        <Td {...tdStyle} fontSize="12px"> — </Td>
                                    </Tr>

                                    {/* Batch rows */}
                                    {batchList.length === 0 ? (
                                        <Tr>
                                            <Td
                                                colSpan={5}
                                                textAlign="center"
                                                color="gray.400"
                                                fontSize="12px"
                                                py={3}>
                                                No batches found for this item & godown
                                            </Td>
                                        </Tr>
                                    ) : (
                                        batchList.map((b, i) => (
                                            <Tr
                                                key={i}
                                                bg={
                                                    selectedBatchNo === b.batch_no
                                                        ? "#d4e8d8"
                                                        : i % 2 === 0
                                                            ? "white"
                                                            : "#f7faf8"
                                                }
                                                cursor="pointer"
                                                _hover={{ bg: "#edf5ef" }}
                                                onClick={() => handleBatchSelect(b.batch_no)}>
                                                <Td {...tdStyle}>
                                                    <input
                                                        type="radio"
                                                        name="batch_select"
                                                        checked={selectedBatchNo === b.batch_no}
                                                        onChange={() => handleBatchSelect(b.batch_no)}
                                                    />
                                                </Td>
                                                <Td
                                                    {...tdStyle}
                                                    fontSize="12px"
                                                    fontWeight="600"
                                                    color="#2d5a3d">
                                                    {b.batch_no || (
                                                        <Text as="span" color="gray.400" fontStyle="italic">
                                                            No Batch
                                                        </Text>
                                                    )}
                                                </Td>
                                                <Td
                                                    {...tdStyle}
                                                    fontSize="12px"
                                                    isNumeric
                                                    fontWeight="600">
                                                    {Number(b.qty || 0).toFixed(2)}
                                                </Td>
                                                <Td {...tdStyle} fontSize="12px">
                                                    {b.mfg_date
                                                        ? new Date(b.mfg_date).toLocaleDateString("en-IN")
                                                        : "—"}
                                                </Td>
                                                <Td {...tdStyle} fontSize="12px">
                                                    {b.expiry_date
                                                        ? new Date(b.expiry_date).toLocaleDateString(
                                                            "en-IN"
                                                        )
                                                        : "—"}
                                                </Td>
                                            </Tr>
                                        ))
                                    )}
                                </Tbody>
                            </Table>
                        </Box>

                        {/* Selected batch preview */}
                        {selectedBatchNo && selectedBatchNo !== "NOT_APPLICABLE" && (
                            <Box
                                bg="#e8f5ec"
                                border="1px solid #a8d5b8"
                                borderRadius="6px"
                                p={3}
                                mb={4}>
                                <Text fontSize="12px" fontWeight="700" color="#2d5a3d">
                                    Selected: {selectedBatchNo}
                                    {" — "}
                                    Qty:{" "}
                                    {Number(
                                        batchList.find((b) => b.batch_no === selectedBatchNo)
                                            ?.qty || 0
                                    ).toFixed(2)}
                                </Text>
                            </Box>
                        )}

                        <Flex justify="flex-end" gap={3}>
                            <Button size="sm" variant="outline" colorScheme="gray" onClick={closeGodown}>
                                Cancel
                            </Button>
                            <Button bg="#237086" color="white"
                                _hover={{ bg: "#1B5A6B" }} px={8} size="sm"
                                borderRadius="12px"
                                onClick={handleGodownSave}
                                isDisabled={!selectedBatchNo}>
                                SAVE
                            </Button>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Modal isOpen={isImagePreviewOpen} onClose={closeImagePreview} size="xl" isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader fontSize="sm">{previewImageTitle}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6} display="flex" justifyContent="center">
                        <Box
                            as="img"
                            src={previewImageSrc}
                            alt={previewImageTitle}
                            maxW="100%"
                            maxH="70vh"
                            objectFit="contain" />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default SalesTransaction;
