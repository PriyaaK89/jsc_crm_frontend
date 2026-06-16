import React, { useEffect, useState, useCallback } from "react";
import {
    Box, Grid, Input, Select, Text, Button,
    Table, Thead, Tbody, Tr, Th, Td, Textarea,
    Flex, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalBody, useDisclosure, Badge, Divider,
    GridItem, ModalCloseButton, useToast,
} from "@chakra-ui/react";
import useUsersapi from "../../Apis/GetUsersapi";
import {
    fetchGodownList,
    fetchStockItemDropdown,
    fetchPurchaseLedgerDropdown,
    fetchNextVoucherNo,
    createPurchase,
    fetchLedgerDropdown,
    fetchAvailableStock,
    fetchBatches,
    fetchStockItemDetailsByID, fetchLedgerDetailsByID
} from "../../Apis/commanApi";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { AddIcon } from "@chakra-ui/icons";
import { useRef } from "react";

// ─── Empty item template ──────────────────────────────────────────────────────
const emptyItem = () => ({
    stock_item_id: "",
    godown_id: "",
    batch_no: "",
    available_qty: 0,
    billed_qty: "",
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
    mfg_date: "",
    expiry_date: "",
    remind_expiry: "No",
    remind_date: "",
});

// ─── Empty extra ledger row ───────────────────────────────────────────────────
const emptyLedger = () => ({ ledger_id: "", amount: "", comments: "" });

// ─── Initial form state ───────────────────────────────────────────────────────
const initialForm = {
    voucher_type_id: "",
    voucher_no: "",
    purchase_date: new Date().toISOString().slice(0, 10),
    supplier_invoice_no: "",
    supplier_ledger_id: "",
    purchase_ledger_id: "",
    tax_mode: "IGST",
    assign_employee: "",   // "Applicable" | "Not Applicable"
    employee_under_id: "",
    is_consignee: "0",
    dealer_name: "",
    proprietor_name: "",
    consignee_contact_no: "",
    consignee_address: "",
    consignee_gstn_no: "",
    dispatch_doc_no: "",
    transport_name: "",
    destination: "",
    bill_t_no: "",
    vehicle_no: "",
    transport_freight: 0,
    subtotal: 0,
    igst_total: 0,
    cgst_total: 0,
    sgst_total: 0,
    tax_total: 0,
    total_amount: 0,
  bill_t_image: null,
   dispatch_doc_image: null,
    narration: "",
    reference_type: "NEW REF",
    reference_no: "",
    due_date: "",
    items: [emptyItem()],

};

// ─── Styles ───────────────────────────────────────────────────────────────────
const sectionStyle = {
    bg: "white",
    border: "1px solid #d0d7de",
    borderRadius: "6px",
    p: 0,
    mb: 3,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};



const labelStyle = {
    fontSize: "12px",
    color: "#494949",
    marginBottom: "3px",
};

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

const thStyle = {
    // fontSize: "11px",
    // bg: "#e4ede6",
    // color: "#2d5a3d",
    borderColor: "#c8d8cc",
    p: "6px 4px",
    // textAlign: "center",
    fontWeight: "700",
    letterSpacing: "0.3px",
    whiteSpace: "nowrap",
};

const tdStyle = {
    p: "2px 3px",
    borderColor: "#e0e8e2",
    verticalAlign: "middle",

};

// ─── Helper: compute item amounts ────────────────────────────────────────────
const computeItemAmounts = (item, tax_mode) => {
    const qty = Number(item.billed_qty || 0);
    const rate = Number(item.rate || 0);
    const amount = qty * rate;

    let igst_percent = Number(item.igst_percent || 0);
    let cgst_percent = Number(item.cgst_percent || 0);
    let sgst_percent = Number(item.sgst_percent || 0);

    if (item.gst_applicable === 1 && item.rate_of_duty > 0) {

        const duty = Number(item.rate_of_duty);

        if (tax_mode === "IGST") {

            igst_percent = duty;
            cgst_percent = 0;
            sgst_percent = 0;

        } else {

            igst_percent = 0;
            cgst_percent = duty / 2;
            sgst_percent = duty / 2;
        }
    }

    const igst_amount = Number(((amount * igst_percent) / 100).toFixed(2));
    const cgst_amount = Number(((amount * cgst_percent) / 100).toFixed(2));
    const sgst_amount = Number(((amount * sgst_percent) / 100).toFixed(2));

    //  Only IGST added to total, CGST/SGST are display-only
    // const total_amount = Number((amount + igst_amount).toFixed(2));
    const total_amount = Number((
        amount +
        igst_amount +
        cgst_amount +
        sgst_amount
    ).toFixed(2));

    return {
        amount: Number(amount.toFixed(2)),
        igst_percent,
        cgst_percent,
        sgst_percent,
        igst_amount,
        cgst_amount,
        sgst_amount,
        total_amount,
    };
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Purchase = () => {
    const { users } = useUsersapi();

    const [godownList, setGodownList] = useState([]);
    const [stockItemList, setStockItemList] = useState([]);
    const [purchaseLedgerList, setPurchaseLedgerList] = useState([]);
    const [supplierList, setSupplierList] = useState([]);
    const [allLedgers, setAllLedgers] = useState([]);
    const [ledgerDetails, setLedgerDetails] = useState({});
    const toast = useToast();

    const billTImageRef = useRef(null);
    const dispatchDocImageRef = useRef(null);

    const [formData, setFormData] = useState(initialForm);
    const { isOpen: isGodownOpen, onOpen: openGodown, onClose: closeGodown } = useDisclosure();
    const [activeItemIndex, setActiveItemIndex] = useState(null);
    const [batchList, setBatchList] = useState([]);
    const [godownModal, setGodownModal] = useState({
        batch_no: "",
        qty: "",
        mfg_date: "",
        expiry_date: "",
        remind_expiry: "No",
        remind_date: "",
        isNewBatch: false,
        newBatchNo: "",
    });

    const [supplierInfo, setSupplierInfo] = useState({
        current_balance: "",
        balance_type: "Dr",
        security_amount: "0.0",
        credit_limit: "Not Specified",
    });

    // Extra ledger rows – dynamic, starts with 5, user can add more
    const [extraLedgers, setExtraLedgers] = useState(
        Array.from({ length: 1 }, emptyLedger)
    );

    const [saving, setSaving] = useState(false);

    // ─── Load on mount ─────────────────────────────────────────────────────────
    useEffect(() => {
        loadData();
        loadVoucherNo();
    }, []);

    const loadData = async () => {
        try {
            const [godownData, stockData, purchaseLedgerData, ledgerData] =
                await Promise.all([
                    fetchGodownList(),
                    fetchStockItemDropdown(),
                    fetchPurchaseLedgerDropdown(),
                    fetchLedgerDropdown(),
                ]);
            setGodownList(godownData || []);
            setStockItemList(stockData || []);
            setPurchaseLedgerList(purchaseLedgerData || []);
            setAllLedgers(ledgerData || []);
            setSupplierList(ledgerData || []);
        } catch (err) {
            console.error("loadData error:", err);
        }
    };

    const loadVoucherNo = async () => {
        try {
            const voucherData = await fetchNextVoucherNo("PURCHASE");

            setFormData((prev) => ({
                ...prev,
                voucher_no: voucherData?.voucher_no || "",
                voucher_type_id: voucherData?.voucher_type_id || "",
            }));
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

    // ─── Recalculate grand totals ──────────────────────────────────────────────
    const recalcTotals = useCallback((items, freight, ledgers) => {
        let subtotal = 0, igst_total = 0, cgst_total = 0, sgst_total = 0;
        items.forEach((item) => {
            subtotal += Number(item.amount || 0);
            igst_total += Number(item.igst_amount || 0);
            cgst_total += Number(item.cgst_amount || 0);
            sgst_total += Number(item.sgst_amount || 0);
        });

        const ledgerTotal = (ledgers || []).reduce(
            (sum, row) => sum + Number(row.amount || 0), 0
        );

        // const tax_total = igst_total; //  Only IGST in totals
        const tax_total =
            igst_total +
            cgst_total +
            sgst_total;
        const total_amount = subtotal + tax_total + ledgerTotal;

        return {
            subtotal: Number(subtotal.toFixed(2)),
            igst_total: Number(igst_total.toFixed(2)),
            cgst_total: Number(cgst_total.toFixed(2)),
            sgst_total: Number(sgst_total.toFixed(2)),
            tax_total: Number(tax_total.toFixed(2)),
            total_amount: Number(total_amount.toFixed(2)),
        };
    }, []);

    // ─── Generic form change ──────────────────────────────────────────────────
    const handleChange = async (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "supplier_ledger_id" && value) {
            const details = await fetchLedgerDetailsByID(value);
            if (details) {
                setSupplierInfo({
                    current_balance: details.current_balance,
                    balance_type: details.balance_type,
                    security_amount: details.security_amount,
                    credit_limit: details.credit_limit,
                });
            }
        } else if (name === "supplier_ledger_id" && !value) {
            setSupplierInfo({
                current_balance: "",
                balance_type: "Dr",
                security_amount: "0.0",
                credit_limit: "Not Specified",
            });
        }
    };

    const handleImageChange = (e) => {
        const { name, files } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: files[0] || null,
        }));
    };

    // ─── Item field change + auto-recalc ──────────────────────────────────────
    const handleItemChange = (index, field, value) => {
        setFormData((prev) => {
            const items = [...prev.items];
            items[index] = { ...items[index], [field]: value };
            const computed = computeItemAmounts(items[index], prev.tax_mode);
            items[index] = { ...items[index], ...computed };
            const totals = recalcTotals(items, prev.transport_freight, extraLedgers);
            return { ...prev, items, ...totals };
        });
    };

    // ─── Stock item selected → auto-fill details ───────────────────────────────
    const handleStockItemSelect = async (index, stockItemId) => {
        // Immediately set the id
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
                    rate_of_duty: details.rate_of_duty ?? 0,
                    // Set GST percents from API; if gst_applicable=0, keep 0
                    igst_percent: details.gst_applicable === 1 ? (details.igst_percent || details.rate_of_duty || 0) : 0,
                    cgst_percent: details.gst_applicable === 1 ? (details.cgst_percent || (details.rate_of_duty / 2) || 0) : 0,
                    sgst_percent: details.gst_applicable === 1 ? (details.sgst_percent || (details.rate_of_duty / 2) || 0) : 0,
                };
                const computed = computeItemAmounts(items[index], prev.tax_mode);
                items[index] = { ...items[index], ...computed };
                const totals = recalcTotals(items, prev.transport_freight, extraLedgers);
                return { ...prev, items, ...totals };
            });
        } catch (err) {
            console.error("handleStockItemSelect error:", err);
        }
    };

    // ─── Godown selected → fetch available qty + open batch modal ─────────────
    const handleGodownSelect = async (index, godownId) => {
        setFormData((prev) => {
            const items = [...prev.items];
            items[index] = { ...items[index], godown_id: godownId };
            return { ...prev, items };
        });

        if (!godownId) return;

        setActiveItemIndex(index);
        const stockItemId = formData.items[index].stock_item_id;

        setGodownModal({
            batch_no: "",
            qty: "",
            mfg_date: "",
            expiry_date: "",
            remind_expiry: "No",
            remind_date: "",
            isNewBatch: false,
            newBatchNo: "",
        });
        setBatchList([]);

        if (stockItemId) {
            try {
                // Fetch available stock for this item+godown combination
                const availableQty = await fetchAvailableStock(stockItemId, godownId);
                setFormData((prev) => {
                    const items = [...prev.items];
                    items[index] = { ...items[index], available_qty: availableQty };
                    const totals = recalcTotals(items, prev.transport_freight, extraLedgers);
                    return { ...prev, items, ...totals };
                });

                const batches = await fetchBatches(stockItemId, godownId);
                setBatchList(batches || []);
            } catch (err) {
                console.error("fetchBatches/fetchAvailableStock error:", err);
                setBatchList([]);
            }
        }
        openGodown();
    };

    // ─── Batch selection in modal ──────────────────────────────────────────────
    const handleBatchSelect = (value) => {
        if (value === "NEW_NUMBER") {
            setGodownModal((prev) => ({
                ...prev,
                batch_no: "NEW_NUMBER",
                isNewBatch: true,
                qty: "",
                mfg_date: "",
                expiry_date: "",
                remind_expiry: "No",
                remind_date: "",
                newBatchNo: "",
            }));
            return;
        }
        if (value === "NOT_APPLICABLE") {
            setGodownModal((prev) => ({
                ...prev,
                batch_no: "NOT_APPLICABLE",
                isNewBatch: false,
                qty: "",
                mfg_date: "",
                expiry_date: "",
                remind_expiry: "No",
                remind_date: "",
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
                isNewBatch: false,
                newBatchNo: "",
            });
        }
    };

    // ─── Save godown modal → write back to item ────────────────────────────────
    const handleGodownSave = () => {
        if (activeItemIndex === null) return;
        const finalBatchNo = godownModal.isNewBatch
            ? godownModal.newBatchNo
            : godownModal.batch_no === "NOT_APPLICABLE"
                ? "NOT_APPLICABLE"
                : godownModal.batch_no;

        // If a specific existing batch was selected, use that batch's available_qty
        const selectedBatch = batchList.find((b) => b.batch_no === finalBatchNo);

        setFormData((prev) => {
            const items = [...prev.items];
            // Use batch-level available_qty if a known batch was picked,
            // otherwise keep the godown-level qty already on the item
            const resolvedAvailableQty = selectedBatch
                ? (selectedBatch.available_qty ?? selectedBatch.qty ?? 0)
                : items[activeItemIndex].available_qty;

            items[activeItemIndex] = {
                ...items[activeItemIndex],
                batch_no: finalBatchNo,
                mfg_date: godownModal.mfg_date,
                expiry_date: godownModal.expiry_date,
                remind_expiry: godownModal.remind_expiry,
                remind_date: godownModal.remind_date,
                available_qty: resolvedAvailableQty,  // ← key fix
            };
            return { ...prev, items };
        });
        closeGodown();
    };

    // ─── Add / Remove item rows ────────────────────────────────────────────────
    const addItemRow = () => {
        setFormData((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
    };

    const removeItemRow = (index) => {
        setFormData((prev) => {
            const items = prev.items.filter((_, i) => i !== index);
            const final = items.length ? items : [emptyItem()];
            const totals = recalcTotals(final, prev.transport_freight, extraLedgers);
            return { ...prev, items: final, ...totals };
        });
    };

    // ─── Freight change ────────────────────────────────────────────────────────
    const handleFreightChange = (e) => {
        const freight = e.target.value;
        setFormData((prev) => {
            const totals = recalcTotals(prev.items, freight, extraLedgers);
            return { ...prev, transport_freight: freight, ...totals };
        });
    };

    // ─── Extra ledger handlers ─────────────────────────────────────────────────
    const handleExtraLedger = (i, field, value) => {
        setExtraLedgers((prev) => {
            const updated = [...prev];
            updated[i] = { ...updated[i], [field]: value };
            // Recalculate totals when ledger amounts change
            setFormData((fd) => {
                const totals = recalcTotals(fd.items, fd.transport_freight, updated);
                return { ...fd, ...totals };
            });
            return updated;
        });
    };

    const addLedgerRow = () => {
        setExtraLedgers((prev) => [...prev, emptyLedger()]);
    };

    const removeLedgerRow = (i) => {
        setExtraLedgers((prev) => {
            const updated = prev.filter((_, idx) => idx !== i);
            setFormData((fd) => {
                const totals = recalcTotals(fd.items, fd.transport_freight, updated);
                return { ...fd, ...totals };
            });
            return updated;
        });
    };

    // ─── Submit ────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!formData.supplier_invoice_no) {
            toast({
                description: 'Supplier Invoice No cannot be blank!',
                status: 'error',
                duration: 1500
            })
            return;
        }
        if (!formData.purchase_date) {
            toast({
                description: "Date is Required!",
                status: "error",
                duration: 1500
            })
            return;
        }
        if (!formData.supplier_ledger_id) {
            toast({
                description: "Please select Party A/c Name!",
                status: 'error',
                duration: 1500,
            })
            return;
        }
        setSaving(true);
        try {
            const payload = new FormData();

            const payloadData = {
                ...formData,
                employee_under_id: formData.employee_under_id || null,
                purchase_ledger_id: formData.purchase_ledger_id || null,
                supplier_ledger_id: formData.supplier_ledger_id || null,
            };

            // Append all normal form fields
            Object.entries(payloadData).forEach(([key, value]) => {
                if (
                    key !== "items" &&
                    key !== "bill_t_image" &&
                    key !== "dispatch_doc_image"
                ) {
                    payload.append(key, value ?? "");
                }
            });


            // Append items
            payload.append(
                "items",
                JSON.stringify(
                    formData.items
                        .filter((i) => i.stock_item_id)
                        .map((item) => ({
                            ...item,
                            mfg_date: item.mfg_date || null,
                            expiry_date: item.expiry_date || null,
                            remind_date: item.remind_date || null,
                            alt_unit_id: item.alt_unit_id === "" ? null : item.alt_unit_id,
                            alt_unit_qty: item.alt_unit_qty === "" ? null : item.alt_unit_qty,
                            unit_id: item.unit_id === "" ? null : item.unit_id,
                            godown_id: item.godown_id === "" ? null : item.godown_id,
                        }))
                )
            );

            // Append extra ledgers
            payload.append(
                "extra_ledgers",
                JSON.stringify(
                    extraLedgers.filter((l) => l.ledger_id)
                )
            );

            // Append files
            if (formData.bill_t_image) {
                payload.append("bill_t_image", formData.bill_t_image);
            }

            if (formData.dispatch_doc_image) {
                payload.append("dispatch_doc_image", formData.dispatch_doc_image);
            }
            // const payload = {
            //     ...formData,
            //     // items: formData.items.filter((i) => i.stock_item_id),
            //     extra_ledgers: extraLedgers.filter((l) => l.ledger_id),

            //     employee_under_id: formData.employee_under_id || null,
            //     purchase_ledger_id: formData.purchase_ledger_id || null,
            //     supplier_ledger_id: formData.supplier_ledger_id || null,
            //     items: formData.items
            //         .filter((i) => i.stock_item_id)
            //         .map((item) => ({
            //             ...item,
            //             mfg_date: item.mfg_date || null,
            //             expiry_date: item.expiry_date || null,
            //             remind_date: item.remind_date || null,
            //             alt_unit_id: item.alt_unit_id === "" ? null : item.alt_unit_id,
            //             alt_unit_qty: item.alt_unit_qty === "" ? null : item.alt_unit_qty,
            //             unit_id: item.unit_id === "" ? null : item.unit_id,
            //             godown_id: item.godown_id === "" ? null : item.godown_id,
            //         })),

            // };
            const response = await createPurchase(payload);
            if (response.success) {
                toast({
                    description: `Purchase Created Successfully \nVoucher No: ${response.voucher_no}`,
                    status: "success",
                    duration: 1500
                })
                setFormData({ ...initialForm });
                setExtraLedgers(Array.from({ length: 1 }, emptyLedger));
                loadVoucherNo();
                if (billTImageRef.current) {
                    billTImageRef.current.value = "";
                }

                if (dispatchDocImageRef.current) {
                    dispatchDocImageRef.current.value = "";
                }
            }
        } catch (error) {
            console.error(error);
            toast({
                description: `Error creating purchase: ${error.message} || "Unknown error`,
                status: "error",
                duration: 1500
            })
        } finally {
            setSaving(false);
        }
    };

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            {/* Main card */}
            <Box>
                <Box {...sectionStyle}>
                    <Box justify="space-between" align="center" bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">
                        <Text fontWeight="500" fontSize="sm" textAlign="left"> Voucher Details </Text>
                    </Box>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)", lg: "repeat(2,1fr)" }}
                        gap={4} p={4}>
                        <GridItem>
                            <Text {...labelStyle} color="#c0392b">Purchase No.</Text>
                            <Input {...readonlyInputStyle} name="voucher_no" value={formData.voucher_no} readOnly />
                        </GridItem>
                        <GridItem>

                            <Text {...labelStyle} color="#c0392b">Supplier Invoice No.</Text>
                            <Input
                                {...inputStyle}
                                name="supplier_invoice_no"
                                value={formData.supplier_invoice_no}
                                onChange={handleChange}
                                placeholder="Required *"
                            />
                        </GridItem>
                        <GridItem>

                            <Text {...labelStyle}>
                                Date <Text as="span" color="red.500">*</Text>
                            </Text>
                            <Input
                                {...inputStyle}
                                type="date"
                                name="purchase_date"
                                value={formData.purchase_date}
                                onChange={handleChange}
                            />
                        </GridItem>
                        <GridItem>

                            <Text {...labelStyle}>Party A/c Name</Text>
                            <Flex gap={2} align="center">
                                <Select
                                    {...inputStyle}
                                    name="supplier_ledger_id"
                                    value={formData.supplier_ledger_id}
                                    onChange={handleChange}
                                    flex={1}
                                >
                                    <option value="">-- Select Supplier --</option>
                                    {supplierList.map((s) => (
                                        <option key={s.id} value={s.id}>{s.ledger_name}</option>
                                    ))}
                                </Select>

                            </Flex>
                        </GridItem>

                        <GridItem>

                            <Text {...labelStyle}>Is Consignee</Text>
                            <Select
                                {...inputStyle}
                                name="is_consignee"
                                value={formData.is_consignee}
                                onChange={handleChange}
                                maxW="200px"
                            >
                                <option value="0">No</option>
                                <option value="1">Yes</option>
                            </Select>
                        </GridItem>
                    </Grid>
                </Box>

                {/* ── Section 2: Consignee (conditional) ── */}
                {formData.is_consignee === "1" && (
                    <Box {...sectionStyle}>
                        <Box justify="space-between" align="center" bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">

                            <Text fontWeight="500" fontSize="sm" textAlign="left">
                                Consignee Details
                            </Text></Box>
                        <Table size="sm" className="material_mfg">
                            <Thead bg="gray.50">
                                <Tr>
                                    {["Dealer Name", "Prop Name", "Contact", "Address", "GSTN No"].map((h) => (
                                        <Th key={h} >{h}</Th>
                                    ))}
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr bg="white">
                                    {["dealer_name", "proprietor_name", "consignee_contact_no", "consignee_address", "consignee_gstn_no"].map((name) => (
                                        <Td key={name} >
                                            <Input name={name} value={formData[name]} onChange={handleChange} />
                                        </Td>
                                    ))}
                                </Tr>
                            </Tbody>
                        </Table>
                    </Box>
                )}

                {/* ── Section 3: Employee + Purchase Ledger ── */}
                <Box {...sectionStyle}>
                    <Box justify="space-between" align="center" bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">
                        <Text fontWeight="500" fontSize="sm" textAlign="left">
                            Assignment
                        </Text>
                    </Box>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)", lg: "repeat(2,1fr)" }} gap={4} p={4}>
                        <GridItem>
                            <Text {...labelStyle}>Assign Employee</Text>
                            <Select

                                name="assign_employee"
                                value={formData.assign_employee}
                                onChange={handleChange}

                            >

                                <option value="">Please Select</option>
                                <option value="Applicable">Applicable</option>
                                <option value="Not Applicable">Not Applicable</option>
                            </Select>
                        </GridItem>

                        {/* Employee Under — only show when Applicable */}
                        <GridItem>
                            {formData.assign_employee === "Applicable" && (
                                <>
                                    <Text {...labelStyle} display={formData?.assign_employee === "Applicable" ? "block" : "none"}>Employee Under</Text>
                                    <Select

                                        name="employee_under_id"
                                        value={formData.employee_under_id}
                                        onChange={handleChange}
                                        display={formData?.assign_employee === "Applicable" ? "block" : "none"}
                                    >
                                        <option value="">-- Select Employee --</option>
                                        {(users || []).map((u) => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </Select>
                                </>
                            )}
                        </GridItem>
                        <GridItem>

                            <Text {...labelStyle}>Purchase Ledger</Text>
                            <Select

                                name="purchase_ledger_id"
                                value={formData.purchase_ledger_id}
                                onChange={handleChange}
                            >
                                <option value="">-- Select --</option>
                                {purchaseLedgerList.map((l) => (
                                    <option key={l.id} value={l.id}>{l.ledger_name}</option>
                                ))}
                            </Select>
                        </GridItem>

                        <GridItem>
                            <Text {...labelStyle}>Tax Mode</Text>
                            <Select

                                name="tax_mode"
                                value={formData.tax_mode}
                                onChange={handleChange}>
                                <option value="CGST_SGST">
                                    CGST + SGST
                                </option>

                                <option value="IGST">
                                    IGST
                                </option>
                            </Select>
                        </GridItem>
                    </Grid>
                </Box>



                {/* ── Section 4: Supplier Balance ── */}
                <Box {...sectionStyle}>
                    <Box justify="space-between" align="center" bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">

                        <Text fontWeight="500" fontSize="sm" textAlign="left">
                            Supplier Information
                        </Text></Box>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)", lg: "repeat(3,1fr)" }} gap={4} p={4}>
                        {[
                            { label: "Current Balance", key: "current_balance", extra: supplierInfo.balance_type },
                            { label: "Security Amount", key: "security_amount" },
                            { label: "Credit Limit", key: "credit_limit" },
                        ].map(({ label, key, extra }) => (
                            <Box key={key}>
                                <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>{label}</Text>
                                <Flex gap={1} align="center">
                                    <Input {...readonlyInputStyle} value={supplierInfo[key]} readOnly />
                                    {extra && (
                                        <Badge
                                            colorScheme={extra === "Cr" ? "green" : "red"}
                                            fontSize="10px"
                                            px={2}
                                            py={1}
                                        >{extra}</Badge>
                                    )}
                                </Flex>
                            </Box>
                        ))}
                    </Grid>
                </Box>

                {/* ── Section 5: Dispatch / Transport ── */}
                <Box {...sectionStyle}>
                    <Box justify="space-between" align="center" bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">

                        <Text fontWeight="500" fontSize="sm" textAlign="left">
                            Transport Details
                        </Text> </Box>
                    <Grid templateColumns="1fr 1fr 1fr" gap={3} mt={4} px={4}>
                        {[
                            { label: "Dispatch Doc No", name: "dispatch_doc_no" },
                            { label: "Transport Name", name: "transport_name" },
                            { label: "Destination", name: "destination" },
                        ].map(({ label, name }) => (
                            <Box key={name}>
                                <Text fontSize="11px" fontWeight="600" color="#555" mb={1}>{label}</Text>
                                <Input name={name} value={formData[name]} onChange={handleChange} />
                            </Box>
                        ))}
                    </Grid>
                    <Grid templateColumns="1fr 1fr 1fr" gap={3} p={4}>
                        {[
                            { label: "Bill-T No.", name: "bill_t_no" },
                            { label: "Vehicle No.", name: "vehicle_no" },
                        ].map(({ label, name }) => (
                            <Box key={name}>
                                <Text
                                    fontSize="11px"
                                    fontWeight="600"
                                    color="#555"
                                    mb={1}
                                >
                                    {label}
                                </Text>

                                <Input
                                    name={name}
                                    value={formData[name]}
                                    onChange={handleChange}
                                />
                            </Box>
                        ))}

                        <Box>
                            <Text
                                fontSize="11px"
                                fontWeight="600"
                                color="#555"
                                mb={1}
                            >
                                Transport Freight
                            </Text>

                            <Input
                                type="number"
                                name="transport_freight"
                                value={formData.transport_freight}
                                onChange={handleFreightChange}
                            />
                        </Box>
                    </Grid>

                    <Grid templateColumns="1fr 1fr" gap={3} px={4} pb={4}>
                        <Box>
                            <Text
                                fontSize="11px"
                                fontWeight="600"
                                color="#555"
                                mb={1}
                            >
                                Bill-T Image
                            </Text>

                            <Input
                                ref={billTImageRef}
                                type="file"
                                name="bill_t_image"
                                accept="image/*"
                                onChange={handleImageChange}
                            />

                        </Box>

                        <Box>
                            <Text
                                fontSize="11px"
                                fontWeight="600"
                                color="#555"
                                mb={1}
                            >
                                Dispatch Document Image
                            </Text>

                            <Input
                                ref={dispatchDocImageRef}
                                type="file"
                                name="dispatch_doc_image"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </Box>
                    </Grid>
                </Box>

                {/* ── Section 6: Items table ── */}
                <Box {...sectionStyle} overflowX="auto">
                    <Flex justify="space-between" align="center" bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">
                        <Text fontWeight="500" fontSize="sm" >
                            Stock Items
                        </Text>
                        <Button
                            size="xs" padding={3} fontWeight="500" marginRight="4px" leftIcon={<AddIcon fontSize="11px" />}
                            colorScheme="whiteAlpha" variant="solid"
                            onClick={addItemRow}
                            _hover={{ bg: "#2d595a" }}
                        >
                            Add Item
                        </Button>
                    </Flex>

                    <Table size="sm" variant="simple" style={{ borderCollapse: "separate", borderSpacing: 0 }} className="material_mfg">
                        <Thead bg='gray.50'>
                            <Tr>
                                <Th {...thStyle} minW="150px">Name of Item</Th>
                                <Th {...thStyle} minW="80px">GoDown</Th>
                                <Th {...thStyle} minW="70px">Available</Th>
                                <Th {...thStyle} minW="80px">Billed Qty.</Th>
                                <Th {...thStyle} minW="70px">Rate</Th>
                                <Th {...thStyle} minW="60px">Unit</Th>
                                <Th {...thStyle} minW="70px">Alt. Unit</Th>
                                <Th {...thStyle} minW="80px">Amount</Th>
                                <Th {...thStyle} minW="60px">IGST %</Th>
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
                                    {/* Stock Item */}
                                    <Td {...tdStyle}>
                                        <Select {...inputStyle}

                                            value={item.stock_item_id}
                                            onChange={(e) => handleStockItemSelect(index, e.target.value)}
                                            minW="140px"
                                            borderColor="#c8d0d8"
                                        >
                                            <option value="">-- End Of List --</option>
                                            {stockItemList.map((s) => (
                                                <option key={s.id} value={s.id}>{s.item_name}</option>
                                            ))}
                                        </Select>
                                    </Td>

                                    {/* GoDown */}
                                    <Td {...tdStyle}>
                                        <Select {...inputStyle}

                                            value={item.godown_id}
                                            onChange={(e) => handleGodownSelect(index, e.target.value)}
                                            minW="90px"
                                            borderColor="#c8d0d8"
                                        >
                                            <option value="">Select</option>
                                            {godownList.map((g) => (
                                                <option key={g.id} value={g.id}>{g.godown_name}</option>
                                            ))}
                                        </Select>
                                    </Td>

                                    {/* Available Qty */}
                                    <Td {...tdStyle}>
                                        <Input
                                            value={item.available_qty ?? 0}
                                            readOnly
                                            bg="#f0f4f0"
                                            textAlign="right"
                                            minW="60px"
                                        />
                                    </Td>

                                    {/* Billed Qty */}
                                    <Td {...tdStyle}>
                                        <Input

                                            type="number"
                                            value={item.billed_qty}
                                            onChange={(e) => handleItemChange(index, "billed_qty", e.target.value)}
                                            textAlign="right"
                                            minW="70px"
                                            borderColor="#c8d0d8"
                                        />
                                    </Td>

                                    {/* Rate */}
                                    <Td {...tdStyle}>
                                        <Input
                                            type="number"
                                            value={item.rate}
                                            onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                                            textAlign="right"
                                            minW="60px"
                                            borderColor="#c8d0d8"
                                        />
                                    </Td>

                                    {/* Unit */}
                                    <Td {...tdStyle}>
                                        <Input
                                            value={item.unit_name}
                                            readOnly
                                            bg="#f0f4f0"
                                            textAlign="center"
                                            minW="50px"
                                        />
                                    </Td>

                                    {/* Alt. Unit */}
                                    <Td {...tdStyle}>
                                        <Input
                                            value={item.alt_unit_qty && item.alt_unit_name
                                                ? `${item.alt_unit_qty} ${item.alt_unit_name}` : ""}
                                            readOnly
                                            bg="#f0f4f0"
                                            textAlign="center"
                                            minW="80px"
                                        />
                                    </Td>

                                    {/* Amount (qty * rate) */}
                                    <Td {...tdStyle}>
                                        <Input
                                            value={item.amount > 0 ? item.amount.toFixed(2) : "0.00"}
                                            readOnly
                                            bg="#f0f4f0"
                                            textAlign="right"
                                            minW="70px"
                                        />
                                    </Td>

                                    {/* IGST % */}
                                    <Td {...tdStyle}>
                                        <Input
                                            type="number"
                                            value={item.igst_percent}
                                            onChange={(e) => handleItemChange(index, "igst_percent", e.target.value)}
                                            textAlign="right"
                                            minW="50px"
                                            borderColor="#c8d0d8"
                                        />
                                    </Td>

                                    {/* Tax Amount (igst+cgst+sgst) */}
                                    <Td {...tdStyle}>
                                        <Input
                                            value={(
                                                Number(item.igst_amount || 0)

                                            ).toFixed(2)}
                                            readOnly
                                            bg="#f0f4f0"
                                            textAlign="right"
                                            minW="70px"
                                        />
                                    </Td>

                                    {/* Total Amount (amount + all tax) */}
                                    <Td {...tdStyle}>
                                        <Input
                                            value={item.total_amount > 0 ? item.total_amount.toFixed(2) : "0.00"}
                                            readOnly
                                            bg="#e8f5ec"
                                            textAlign="right"
                                            fontWeight="600"
                                            color="#1e4a2e"
                                            minW="80px"
                                        />
                                    </Td>

                                    {/* Remove */}
                                    <Td {...tdStyle} textAlign="center">
                                        {formData.items.length > 1 && (
                                            <Button
                                                size="xs"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => removeItemRow(index)}
                                                fontSize="14px"
                                                minW="24px"
                                                h="24px"
                                                p={0}
                                            >×</Button>
                                        )}
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>

                    {/* Sub-totals row */}
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
                        <Text>Subtotal: ₹{formData.subtotal.toFixed(2)}</Text>
                        <Text>|</Text>
                        <Text>Tax: ₹{formData.tax_total.toFixed(2)}</Text>
                    </Flex>
                </Box>

                {/* ── Section 7: Additional Ledgers (Expenses) ── */}
                <Box {...sectionStyle}>
                    <Flex justify="space-between" align="center" bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">

                        <Text fontWeight="500" fontSize="sm" >
                            Additional Expenses / Ledgers
                        </Text>
                        <Button
                            size="xs" padding={3} fontWeight="500" marginRight="4px" leftIcon={<AddIcon fontSize="11px" />}
                            colorScheme="whiteAlpha" variant="solid"
                            onClick={addLedgerRow}
                            _hover={{ bg: "#2d595a" }}>
                            Add Row
                        </Button>

                    </Flex>

                    <Table size="sm" variant="simple" className="material_mfg">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th {...thStyle} w="40%">Ledger</Th>
                                <Th {...thStyle} w="20%">Amount (₹)</Th>
                                <Th {...thStyle} w="35%">Comments</Th>
                                <Th {...thStyle} w="5%"></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {extraLedgers.map((row, i) => (
                                <Tr key={i} bg={i % 2 === 0 ? "white" : "#f7faf8"}>
                                    <Td {...tdStyle}>
                                        <Select
                                            {...inputStyle}
                                            value={row.ledger_id}
                                            onChange={(e) => handleExtraLedger(i, "ledger_id", e.target.value)}
                                            borderColor="#c8d0d8"
                                        >
                                            <option value="">-- End Of List --</option>
                                            {allLedgers.map((l) => (
                                                <option key={l.id} value={l.id}>{l.ledger_name}</option>
                                            ))}
                                        </Select>
                                    </Td>
                                    <Td {...tdStyle}>
                                        <Input

                                            type="number"
                                            value={row.amount}
                                            onChange={(e) => handleExtraLedger(i, "amount", e.target.value)}
                                            textAlign="right"
                                            borderColor="#c8d0d8"
                                            placeholder="0.00"
                                        />
                                    </Td>
                                    <Td {...tdStyle}>
                                        <Input

                                            value={row.comments}
                                            onChange={(e) => handleExtraLedger(i, "comments", e.target.value)}
                                            borderColor="#c8d0d8"
                                            placeholder="Optional note"
                                        />
                                    </Td>
                                    <Td {...tdStyle} textAlign="center">
                                        {extraLedgers.length > 1 && (
                                            <Button
                                                size="xs"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => removeLedgerRow(i)}
                                                fontSize="14px"
                                                minW="24px"
                                                h="24px"
                                                p={0}
                                            >×</Button>
                                        )}
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>

                {/* ── Section 8: Totals + Narration ── */}
                <Box {...sectionStyle} mt={4} padding={3}>
                    <Grid templateColumns="1fr 320px" gap={5}>
                        {/* Narration */}
                        <Box >
                            <Box justify="space-between" align="center" bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">
                                <Text fontWeight="500" fontSize="sm">Narration</Text>
                            </Box>
                            <Textarea
                                size="sm"
                                placeholder="Enter narration / remarks..."
                                name="narration"
                                value={formData.narration}
                                onChange={handleChange}
                                rows={6}
                                borderColor="#c8d0d8"
                                bg="white"
                                _focus={{ borderColor: "#3d7a52" }}
                                resize="vertical"
                            />
                        </Box>

                        {/* Tax summary + Total */}
                        <Box>
                            <Box justify="space-between" align="center" bg="#4f9190" color="white" px={4} py={2} borderTopRadius="md">

                                <Text fontWeight="500" fontSize="sm" textAlign="left">
                                    Tax Summary
                                </Text> </Box>
                            <Box
                                bg="white"
                                border="1px solid #d0d7de"
                                borderRadius="6px"
                                overflow="hidden"
                            >
                                {[
                                    {
                                        label: `IGST (${formData.items.some(i => i.igst_percent > 0)
                                            ? formData.items.find(i => i.igst_percent > 0)?.igst_percent ?? 0
                                            : 0}%)`,
                                        value: formData.igst_total, color: "#555"
                                    },
                                    {
                                        label: `CGST (${formData.items.some(i => i.cgst_percent > 0)
                                            ? formData.items.find(i => i.cgst_percent > 0)?.cgst_percent ?? 0
                                            : 0}%)`,
                                        value: formData.cgst_total, color: "#555"
                                    },
                                    {
                                        label: `SGST (${formData.items.some(i => i.sgst_percent > 0)
                                            ? formData.items.find(i => i.sgst_percent > 0)?.sgst_percent ?? 0
                                            : 0}%)`,
                                        value: formData.sgst_total, color: "#555"
                                    },
                                    { label: "Subtotal", value: formData.subtotal, color: "#333", dividerBefore: true },
                                    //   { label: "Transport Freight", value: Number(formData.transport_freight || 0), color: "#333" },
                                    { label: "Extra Charges", value: extraLedgers.reduce((s, r) => s + Number(r.amount || 0), 0), color: "#333" },
                                ].map(({ label, value, color, dividerBefore }, i) => (
                                    <React.Fragment key={label}>
                                        {dividerBefore && <Divider borderColor="#e0e8e2" />}
                                        <Flex
                                            justify="space-between"
                                            align="center"
                                            px={3}
                                            py="6px"
                                            borderBottom="1px solid #f0f4f0"
                                        >
                                            <Text fontSize="12px" color={color} fontWeight="500">{label}</Text>
                                            <Text fontSize="12px" color={color} fontWeight="600">
                                                ₹{value > 0 ? value.toFixed(2) : "0.00"}
                                            </Text>
                                        </Flex>
                                    </React.Fragment>
                                ))}

                                {/* Grand Total */}
                                <Flex justify="space-between" align="center" px={3} py={2} bg="#5d6e6e">
                                    <Text fontSize="13px" color="white" fontWeight="700">Total Amount</Text>
                                    <Text fontSize="14px" color="white" fontWeight="800"> ₹{formData.total_amount.toFixed(2)} </Text>
                                </Flex>
                            </Box>
                        </Box>
                    </Grid>
                </Box>

                {/* ── Save button ── */}
                <Flex justify="flex-end" mt={2} gap={3}>
                    <Button
                        variant="outline"
                        colorScheme="gray"
                        size="sm"
                        px={6}
                        onClick={() => {
                            setFormData({ ...initialForm });
                            setExtraLedgers(Array.from({ length: 5 }, emptyLedger));
                            loadVoucherNo();
                        }}
                    >
                        RESET
                    </Button>
                    <Button
                        bg="#237086"
                        fontWeight="500"
                        fontSize="14px"
                        color="white"
                        _hover={{
                            bg: "#1B5A6B",
                        }}
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

            {/* ══ Godown / Batch Modal ══ */}
            <Modal isOpen={isGodownOpen} onClose={closeGodown} size="4xl" isCentered>
                <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(2px)" />
                <ModalContent borderRadius="8px" border="1px solid #c0cfc4" overflow="hidden">

                    <ModalHeader
                        bg="#e4eced"
                        borderBottom="2px solid #c0d4c8"

                        fontSize="13px"
                        fontWeight="700"
                        color="#1e4a2e" >
                        <Flex align="center" gap={2}>
                            <Box w="10px" h="10px" bg="#31848f" borderRadius="50%" />
                            Godown & Batch Details
                        </Flex>
                        <ModalCloseButton />
                    </ModalHeader>

                    <ModalBody p={4} bg="#ffffff">
                        {/* Input row */}
                        <Box border="1px solid #E2E8F0" overflowX="auto" borderRadius="0px 0px 12px 12px">
                            <Table size="sm" mb={4} className="material_mfg">
                                <Thead bg='gray.100'>
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
                                    <Tr >
                                        {/* Batch No SELECT — always visible */}
                                        <Td >
                                            <Select
                                                {...inputStyle}
                                                value={godownModal.batch_no}
                                                onChange={(e) => handleBatchSelect(e.target.value)}

                                            >
                                                <option value="">-- Select --</option>
                                                <option value="NOT_APPLICABLE">Not Applicable</option>
                                                <option value="NEW_NUMBER">New Number</option>
                                                {batchList.map((b) => (
                                                    <option key={b.batch_no} value={b.batch_no}>{b.batch_no}</option>
                                                ))}
                                            </Select>
                                            {/* New batch number input — only shown below select when NEW_NUMBER */}
                                            {godownModal.isNewBatch && (
                                                <Input
                                                    {...inputStyle}
                                                    mt={1}
                                                    placeholder="Enter batch no."
                                                    value={godownModal.newBatchNo}
                                                    onChange={(e) =>
                                                        setGodownModal((p) => ({ ...p, newBatchNo: e.target.value }))
                                                    }
                                                    autoFocus
                                                    borderColor="#3d7a52"
                                                />
                                            )}
                                        </Td>

                                        {/* Qty — hidden when new batch */}
                                        {!godownModal.isNewBatch && (
                                            <Td {...tdStyle}>
                                                <Input
                                                    {...inputStyle}
                                                    type="number"
                                                    value={godownModal.qty}
                                                    onChange={(e) => setGodownModal((p) => ({ ...p, qty: e.target.value }))}

                                                />
                                            </Td>
                                        )}
                                        {godownModal.isNewBatch && <Td {...tdStyle} />}

                                        <Td {...tdStyle}>
                                            <Input
                                                {...inputStyle}
                                                type="date"
                                                value={godownModal.mfg_date}
                                                onChange={(e) => setGodownModal((p) => ({ ...p, mfg_date: e.target.value }))}

                                            />
                                        </Td>
                                        <Td {...tdStyle}>
                                            <Input
                                                {...inputStyle}
                                                type="date"
                                                value={godownModal.expiry_date}
                                                onChange={(e) => setGodownModal((p) => ({ ...p, expiry_date: e.target.value }))}

                                            />
                                        </Td>
                                        <Td {...tdStyle}>
                                            <Select
                                                {...inputStyle}
                                                value={godownModal.remind_expiry}
                                                onChange={(e) => setGodownModal((p) => ({ ...p, remind_expiry: e.target.value }))}

                                            >
                                                <option value="No">No</option>
                                                <option value="Yes">Yes</option>
                                            </Select>
                                        </Td>
                                        <Td {...tdStyle}>
                                            <Input
                                                {...inputStyle}
                                                type="date"
                                                value={godownModal.remind_date}
                                                onChange={(e) => setGodownModal((p) => ({ ...p, remind_date: e.target.value }))}
                                                isDisabled={godownModal.remind_expiry === "No"}

                                            />
                                        </Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                        </Box>
                        {/* Existing batches */}
                        {batchList.length > 0 && (
                            <Box>
                                <Text fontSize="11px" fontWeight="700" color="#3d7a52" mb={2} textTransform="uppercase" letterSpacing="0.5px">
                                    Existing Batches (click to select)
                                </Text>
                                <Box overflowX="auto" border="1px solid #d0d7de" borderRadius="4px">
                                    <Table size="sm" variant="simple">
                                        <Thead>
                                            <Tr>
                                                {["Batch No.", "Total Qty.", "GoDown", "Available", "Rate", "Unit"].map((h) => (
                                                    <Th key={h} {...thStyle}>{h}</Th>
                                                ))}
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {batchList.map((b, bi) => (
                                                <Tr
                                                    key={bi}
                                                    _hover={{ bg: "#e4ede6", cursor: "pointer" }}
                                                    bg={godownModal.batch_no === b.batch_no ? "#d4e8d8" : bi % 2 === 0 ? "white" : "#f7faf8"}
                                                    onClick={() => handleBatchSelect(b.batch_no)}
                                                >
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

                        {/* Modal action buttons */}
                        <Flex justify="flex-end" alignItems="center" mt={4} gap={3}>
                            <Button size="sm" variant="outline" colorScheme="gray" onClick={closeGodown}>
                                Cancel
                            </Button>
                            <Button bg="#237086"
                                fontWeight="500"
                                fontSize="14px"
                                color="white"
                                _hover={{ bg: "#1B5A6B", }}
                                px={8} size="sm"
                                borderRadius="12px"
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

export default Purchase;