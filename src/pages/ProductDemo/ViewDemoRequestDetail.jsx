import React, { useEffect, useState, useMemo } from "react";
import { Box, Grid, GridItem, Input, Select, Checkbox, Text, Button, Table,
  Thead, Tbody, Tr, Th, Td, Textarea, useToast, Spinner, Center, Flex,
  Badge, HStack, Image, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

// ── Design tokens (same as SalesCreate.jsx) ──
const sectionStyle = { bg: "white", border: "1px solid #d0d7de", borderRadius: "6px", p: 0, mb: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" };
const sectionHeaderStyle = { bg: "#4f9190", color: "white", px: 4, py: 2, borderTopRadius: "md" };
const labelStyle = { fontSize: "12px", color: "#494949", marginBottom: "3px" };
const inputStyle = { size: "sm", borderRadius: "6px", borderColor: "#c8d0d8", bg: "white", fontSize: "12px", height: "40px", _focus: { borderColor: "#3d7a52", boxShadow: "0 0 0 1px #3d7a52" } };
const readonlyInputStyle = { ...inputStyle, bg: "#f0f4f0", color: "#555" };
const thStyle = { borderColor: "#c8d8cc", p: "6px 4px", fontWeight: "700", fontSize: "11px", whiteSpace: "nowrap" };
const tdStyle = { p: "2px 3px", borderColor: "#e0e8e2", verticalAlign: "middle" };

const DEMO_TYPES = ["FARMER_FIELD", "RETAILER_COUNTER", "DISTRIBUTOR_TRIAL", "COMPETITOR_COMPARISON"];
const SOIL_TYPES = ["LOAMY", "SANDY", "CLAY", "BLACK_COTTON"];
const IRRIGATION = ["IRRIGATED", "RAINFED"];
const STATUS_COLOR = {
  PENDING_APPROVAL: "orange", APPROVED: "blue", IN_PROGRESS: "purple",
  COMPLETED: "green", REJECTED: "red",
};
const OUTCOME_LABEL = { POSITIVE: "Good", NEUTRAL: "Average", NEGATIVE: "Negative" };
const OUTCOME_COLOR = { POSITIVE: "green", NEUTRAL: "gray", NEGATIVE: "red" };
const STAGE_TITLE = { 1: "Sowing & Germination", 2: "Crop Growth", 3: "Final Evaluation" };
const PARTY_COLOR = { DISTRIBUTOR: "purple", RETAILER: "blue", FARMER: "green" };
const CUSTOMER_STATUS_COLOR = { IN_PROGRESS: "purple", COMPLETED: "green" };

const makeEmptyDemoItem = () => ({
  stock_item_id: "", item_name: "", crop_name: "", qty: 0, unit: "", rate: 0,
  is_free_sample: 1, amount: 0,
});

// NOTE: adjust this to however your app actually stores/reads the logged-in user
const getCurrentUserId = () => {
  try { return JSON.parse(localStorage.getItem("user"))?.id; } catch { return null; }
};

// ── display helpers ──
const isEmpty = (v) => v === null || v === undefined || v === "";
const pretty = (v) => (isEmpty(v) ? null : String(v).replaceAll("_", " ").toLowerCase());
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : null);
const withUnit = (val, unit) => (isEmpty(val) ? null : `${Number(val)} ${unit || ""}`.trim());

const growthDisplay = (g) => {
  if (g.input_type === "BOOLEAN") return g.field_value === "1" ? "Yes" : "No";
  if (g.input_type === "DATE") return fmtDate(g.field_value);
  return `${g.field_value}${g.unit ? " " + g.unit : ""}`;
};

const resultDetails = (r) => {
  let rows = [];
  if (r.result_no === 1) {
    rows = [
      ["Sowing Date", fmtDate(r.sowing_date)],
      ["Quantity Used", withUnit(r.qty_used, r.qty_used_unit)],
      ["Sowing Method", pretty(r.sowing_method)],
      ["Seed Treatment", r.seed_treatment],
      ["Field Area", withUnit(r.field_area, r.field_area_unit)],
      ["Irrigation", pretty(r.irrigation_type)],
      ["Soil Type", pretty(r.soil_type)],
      ["Germination %", withUnit(r.germination_pct, "%")],
      ["Plant Population", withUnit(r.plant_population, r.plant_population_unit)],
      ["Early Vigor", pretty(r.early_vigor)],
      ["Disease / Pest Level", pretty(r.disease_pest_level)],
      ["Disease / Pest Notes", r.disease_pest_notes],
    ];
  } else if (r.result_no === 2) {
    rows = [
      ["Days After Sowing", r.days_after_sowing],
      ["Crop Stage", r.crop_stage],
      ["Crop Condition", pretty(r.crop_condition)],
    ];
  } else if (r.result_no === 3) {
    rows = [
      ["Harvest Date", fmtDate(r.harvest_date)],
      ["Yield", withUnit(r.yield_value, r.yield_unit)],
      ["Final Crop Condition", pretty(r.final_crop_condition)],
      ["Harvested Area", withUnit(r.harvested_area, r.harvested_area_unit)],
      ["Total Production", withUnit(r.total_production, r.production_unit)],
      ["Satisfaction", isEmpty(r.satisfaction_rating) ? null : `${r.satisfaction_rating} / 5`],
      ["Would Use Again", pretty(r.would_use_again)],
      ["Would Recommend", pretty(r.would_recommend)],
      ["Purchase Intention", pretty(r.purchase_intention)],
      ["Next Season Need", withUnit(r.expected_next_qty, r.expected_next_unit)],
    ];
  }
  return rows.filter(([, v]) => !isEmpty(v));
};

const Detail = ({ label, value }) => (
  <Box>
    <Text fontSize="11px" color="#555" fontWeight="600">{label}</Text>
    <Text fontSize="12px" textTransform="capitalize">{value}</Text>
  </Box>
);

const ResultCard = ({ r }) => {
  const details = resultDetails(r);
  const photos = (r.photo_urls || []).filter(Boolean);
  return (
    <Box border="1px solid #e0e8e2" borderRadius="6px" p={3} mb={2} bg="white">
      <HStack justify="space-between" mb={2} flexWrap="wrap">
        <Text fontSize="12px" fontWeight="700">
          Result {r.result_no} of 3 · {STAGE_TITLE[r.result_no]} — {fmtDate(r.result_date)}
        </Text>
        <Badge colorScheme={OUTCOME_COLOR[r.outcome] || "gray"}>{OUTCOME_LABEL[r.outcome] || r.outcome}</Badge>
      </HStack>

      {details.length > 0 && (
        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4,1fr)" }} gap={3} mb={2}>
          {details.map(([label, value]) => <Detail key={label} label={label} value={value} />)}
        </Grid>
      )}

      {r.growth_values?.length > 0 && (
        <Box mb={2}>
          <Text fontSize="11px" fontWeight="700" color="#237086" mb={1}>
            {r.result_no === 3 ? "Final crop observations" : "Crop growth observations"}
          </Text>
          <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4,1fr)" }} gap={3}>
            {r.growth_values.map((g, i) => <Detail key={i} label={g.field_name} value={growthDisplay(g)} />)}
          </Grid>
        </Box>
      )}

      {r.remarks && <Text fontSize="12px" color="#555" mb={1}><b>Remarks:</b> {r.remarks}</Text>}
      {r.customer_feedback && <Text fontSize="12px" color="#555" mb={1}><b>Customer feedback:</b> {r.customer_feedback}</Text>}

      {photos.length > 0 && (
        <HStack spacing={2} mt={2} flexWrap="wrap">
          {photos.map((u, i) => (
            <Image key={i} src={u} boxSize="80px" objectFit="cover" borderRadius="6px"
              border="1px solid #d0d7de" cursor="pointer" onClick={() => window.open(u, "_blank")} />
          ))}
        </HStack>
      )}
      <Text fontSize="11px" color="#888" mt={2}>Submitted by {r.submitted_by_name || "—"}</Text>
    </Box>
  );
};

const ViewDemoRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const currentUserId = getCurrentUserId();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [demo, setDemo] = useState(null);
  const [canApprove, setCanApprove] = useState(false);

  const [stockItemList, setStockItemList] = useState([]);
  const [fieldOfficers, setFieldOfficers] = useState([]);

  const [form, setForm] = useState({});
  const [items, setItems] = useState([]);
  const [allocations, setAllocations] = useState({}); // demo_request_customers.id -> qty string
  const [farmImageFile, setFarmImageFile] = useState(null);
  const [consentDocFile, setConsentDocFile] = useState(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState("");

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([loadDemo(), loadStockItems(), loadFieldOfficers()]);
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = async () => {
    const res = await API.get(API_ENDPOINTS.get_demo_request_details(id));
    const data = res?.data?.data;
    setDemo(data);
    setCanApprove(!!res?.data?.can_approve);
    setForm({
      demo_type: data.demo_type || "",
      is_distributor_sponsored: !!data.is_distributor_sponsored,
      village: data.village || "",
      district: data.district || "",
      land_area: data.land_area || "",
      land_unit: data.land_unit || "",
      soil_type: data.soil_type || "",
      irrigation_type: data.irrigation_type || "",
      sowing_date: data.sowing_date ? data.sowing_date.slice(0, 10) : "",
      expected_result_date: data.expected_result_date ? data.expected_result_date.slice(0, 10) : "",
      followup_reminder_date: data.followup_reminder_date ? data.followup_reminder_date.slice(0, 10) : "",
      field_officer_id: data.field_officer_id || "",
      narration: data.narration || "",
    });
    setItems(
      (data.items || []).map((i) => ({
        stock_item_id: i.stock_item_id,
        item_name: i.item_name,
        crop_name: i.crop_name || "",
        qty: i.qty,
        unit: i.unit,
        rate: i.rate,
        is_free_sample: i.is_free_sample,
        amount: i.amount,
      }))
    );
    setAllocations(
      Object.fromEntries((data.customers || []).map((c) => [c.id, c.allocated_qty ?? ""]))
    );
  };

  const loadStockItems = async () => {
    const res = await API.get(API_ENDPOINTS.GET_STOCK_ITEM_DROPDOWN);
    setStockItemList(res?.data?.data || []);
  };

  const loadFieldOfficers = async () => {
    const res = await API.get(API_ENDPOINTS.get_demo_field_officers);
    setFieldOfficers(res?.data?.data || []);
  };

  const customers = demo?.customers || [];
  const isOwner = demo?.created_by === currentUserId;
  const canEdit = useMemo(() => {
    if (!demo) return false;
    if (canApprove) return !["REJECTED", "COMPLETED"].includes(demo.status);
    return isOwner && demo.status === "PENDING_APPROVAL";
  }, [demo, canApprove, isOwner]);

  // ── item helpers ──
  const recalcItem = (item) => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const free = item.is_free_sample === true || Number(item.is_free_sample) === 1;
    return { ...item, amount: free ? 0 : +(qty * rate).toFixed(2) };
  };

  const handleItemSelect = (index, stockItemId) => {
    const stock = stockItemList.find((s) => String(s.id) === String(stockItemId));
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = recalcItem({
        ...(stockItemId ? updated[index] : makeEmptyDemoItem()),
        stock_item_id: stockItemId,
        item_name: stock ? (stock.name || stock.item_name) : "",
        crop_name: stock ? (stock.crop_name || "") : "",
        unit: stock?.unit_name || stock?.base_unit_name || stock?.unit || updated[index].unit,
      });
      return updated;
    });
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = recalcItem({ ...updated[index], [field]: value });
      return updated;
    });
  };

  const itemsTotal = useMemo(
    () => +(items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)).toFixed(2),
    [items]
  );

  // ── allocation helpers ──
  const productQty = useMemo(
    () => +(items.reduce((s, i) => s + (Number(i.qty) || 0), 0)).toFixed(2),
    [items]
  );
  const productUnit = items[0]?.unit || "";
  const allocatedTotal = useMemo(
    () => +(customers.reduce((s, c) => s + (Number(allocations[c.id]) || 0), 0)).toFixed(2),
    [customers, allocations]
  );
  const overAllocated = allocatedTotal > productQty + 0.0001;


  // ── results grouped per customer ──
  const resultsByCustomer = useMemo(() => {
    const map = new Map();
    (demo?.results || []).forEach((r) => {
      const k = r.demo_request_customer_id;
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(r);
    });
    return map;
  }, [demo]);

  const removedGroups = useMemo(() => {
    const activeIds = new Set(customers.map((c) => c.id));
    return [...resultsByCustomer.entries()].filter(([cid]) => !activeIds.has(cid));
  }, [resultsByCustomer, customers]);

  const doneCount = customers.filter((c) => c.result_status === "COMPLETED").length;

  // ── build multipart payload for the existing updateDemo endpoint ──
  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "is_distributor_sponsored") { fd.append(key, value ? "1" : "0"); return; }
      fd.append(key, value ?? "");
    });
    const validItems = items.filter((i) => i.stock_item_id && Number(i.qty) > 0);
    fd.append("items", JSON.stringify(validItems));
    if (farmImageFile) fd.append("farm_image", farmImageFile);
    if (consentDocFile) fd.append("consent_doc", consentDocFile);
    return fd;
  };

  const saveChanges = async () => {
    if (overAllocated) {
      toast({
        title: "Allocated quantity is more than the demo quantity",
        description: `Allocated ${allocatedTotal} / ${productQty} ${productUnit}`,
        status: "warning", duration: 3500, isClosable: true,
      });
      return false;
    }
    setSaving(true);
    try {
      // 1) demo details + item (so the new qty is in place)
      await API.put(API_ENDPOINTS.update_demo_request(id), buildFormData(), {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({ title: "Demo request updated", status: "success", duration: 2500, isClosable: true });
      await loadDemo();
      return true;
    } catch (err) {
      toast({
        title: "Update failed",
        description: err?.response?.data?.message || "Something went wrong",
        status: "error", duration: 3000, isClosable: true,
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const refreshBellCount = () => window.dispatchEvent(new Event("demo-count-refresh"));

  // Save edits first, then approve — per the required flow
  const handleApprove = async () => {
    setApproving(true);
    try {
      const saved = await saveChanges();
      if (!saved) return;
      await API.post(API_ENDPOINTS.approve_demo_request(id), {});
      toast({ title: "Demo request approved", status: "success", duration: 3000, isClosable: true });
      refreshBellCount();
      navigate(-1);
    } catch (err) {
      toast({
        title: "Approval failed",
        description: err?.response?.data?.message || "Something went wrong",
        status: "error", duration: 3000, isClosable: true,
      });
    } finally {
      setApproving(false);
    }
  };

  const openRejectModal = () => { setRejectRemarks(""); setRejectModalOpen(true); };

  const confirmReject = async () => {
    if (!rejectRemarks.trim()) {
      toast({ title: "Rejection reason is required", status: "warning", duration: 2500, isClosable: true });
      return;
    }
    setRejecting(true);
    try {
      const saved = await saveChanges();
      if (!saved) return;
      await API.post(API_ENDPOINTS.reject_demo_request(id), { remarks: rejectRemarks });
      toast({ title: "Demo request rejected", status: "info", duration: 3000, isClosable: true });
      setRejectModalOpen(false);
      refreshBellCount();
      navigate(-1);
    } catch (err) {
      toast({
        title: "Rejection failed",
        description: err?.response?.data?.message || "Something went wrong",
        status: "error", duration: 3000, isClosable: true,
      });
    } finally {
      setRejecting(false);
    }
  };

  if (loading || !demo) return <Center h="60vh"><Spinner size="xl" color="#4f9190" /></Center>;

  return (
    <Box>
      {/* Header */}
      <Box {...sectionStyle}>
        <Box {...sectionHeaderStyle}>
          <HStack justifyContent="space-between">
            <Text fontWeight="500" fontSize="sm">{demo.demo_no}</Text>
            <Badge colorScheme={STATUS_COLOR[demo.status] || "gray"} fontSize="11px" px={3} py={1} borderRadius="full">
              {demo.status}
            </Badge>
          </HStack>
        </Box>
        <Grid templateColumns={{ base: "1fr", md: "repeat(4,1fr)" }} gap={4} p={4}>
          <Box><Text fontSize="11px" color="#555" fontWeight="600">Created By</Text><Text fontSize="12px">{demo.created_by_name}</Text></Box>
          <Box><Text fontSize="11px" color="#555" fontWeight="600">Created At</Text><Text fontSize="12px">{new Date(demo.created_at).toLocaleString()}</Text></Box>
          <Box><Text fontSize="11px" color="#555" fontWeight="600">Approved By</Text><Text fontSize="12px">{demo.approved_by_name || "—"}</Text></Box>
          <Box><Text fontSize="11px" color="#555" fontWeight="600">Customers Completed</Text><Text fontSize="12px">{doneCount} / {customers.length}</Text></Box>
        </Grid>
        {demo.status === "REJECTED" && demo.rejection_reason && (
          <Box px={4} pb={3}>
            <Text fontSize="12px" color="red.600"><b>Rejection reason:</b> {demo.rejection_reason}</Text>
          </Box>
        )}
      </Box>

      {/* Demo Details */}
      <Box {...sectionStyle}>
        <Box {...sectionHeaderStyle}><Text fontWeight="500" fontSize="sm">Demo Details</Text></Box>
        <Grid templateColumns={{ base: "1fr", md: "repeat(3,1fr)" }} gap={4} p={4}>
          <GridItem>
            <Text {...labelStyle}>Demo Type</Text>
            <Select {...(canEdit ? inputStyle : readonlyInputStyle)} isDisabled={!canEdit}
              value={form.demo_type} onChange={(e) => setForm((p) => ({ ...p, demo_type: e.target.value }))}>
              {DEMO_TYPES.map((t) => <option key={t} value={t}>{t.replaceAll("_", " ")}</option>)}
            </Select>
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>Crop</Text>
            <Input {...readonlyInputStyle} readOnly value={demo.crop_name || "—"} />
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>Field Officer</Text>
            <Select {...(canEdit ? inputStyle : readonlyInputStyle)} isDisabled={!canEdit}
              value={form.field_officer_id} onChange={(e) => setForm((p) => ({ ...p, field_officer_id: e.target.value }))}>
              <option value="">-- Select --</option>
              {fieldOfficers.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </Select>
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>Village</Text>
            <Input {...(canEdit ? inputStyle : readonlyInputStyle)} isReadOnly={!canEdit}
              value={form.village} onChange={(e) => setForm((p) => ({ ...p, village: e.target.value }))} />
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>District</Text>
            <Input {...(canEdit ? inputStyle : readonlyInputStyle)} isReadOnly={!canEdit}
              value={form.district} onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))} />
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>Land Area</Text>
            <HStack>
              <Input {...(canEdit ? inputStyle : readonlyInputStyle)} isReadOnly={!canEdit} type="number"
                value={form.land_area} onChange={(e) => setForm((p) => ({ ...p, land_area: e.target.value }))} />
              <Input {...(canEdit ? inputStyle : readonlyInputStyle)} isReadOnly={!canEdit} maxW="90px" placeholder="unit"
                value={form.land_unit} onChange={(e) => setForm((p) => ({ ...p, land_unit: e.target.value }))} />
            </HStack>
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>Soil Type</Text>
            <Select {...(canEdit ? inputStyle : readonlyInputStyle)} isDisabled={!canEdit}
              value={form.soil_type} onChange={(e) => setForm((p) => ({ ...p, soil_type: e.target.value }))}>
              <option value="">-- Select --</option>
              {SOIL_TYPES.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
            </Select>
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>Irrigation</Text>
            <Select {...(canEdit ? inputStyle : readonlyInputStyle)} isDisabled={!canEdit}
              value={form.irrigation_type} onChange={(e) => setForm((p) => ({ ...p, irrigation_type: e.target.value }))}>
              <option value="">-- Select --</option>
              {IRRIGATION.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </GridItem>
          <GridItem>
            <Flex align="center" gap={2} mt={6}>
              <Checkbox isChecked={form.is_distributor_sponsored} isDisabled={!canEdit} colorScheme="teal"
                onChange={(e) => setForm((p) => ({ ...p, is_distributor_sponsored: e.target.checked }))} />
              <Text fontSize="12px" color="#494949">Distributor Sponsored</Text>
            </Flex>
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>Sowing Date</Text>
            <Input {...(canEdit ? inputStyle : readonlyInputStyle)} isReadOnly={!canEdit} type="date"
              value={form.sowing_date} onChange={(e) => setForm((p) => ({ ...p, sowing_date: e.target.value }))} />
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>Expected Result Date</Text>
            <Input {...(canEdit ? inputStyle : readonlyInputStyle)} isReadOnly={!canEdit} type="date"
              value={form.expected_result_date} onChange={(e) => setForm((p) => ({ ...p, expected_result_date: e.target.value }))} />
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>Follow-up Reminder</Text>
            <Input {...(canEdit ? inputStyle : readonlyInputStyle)} isReadOnly={!canEdit} type="date"
              value={form.followup_reminder_date} onChange={(e) => setForm((p) => ({ ...p, followup_reminder_date: e.target.value }))} />
          </GridItem>
          <GridItem colSpan={{ base: 1, md: 3 }}>
            <Text {...labelStyle}>Narration</Text>
            <Textarea rows={2} fontSize="12px" isReadOnly={!canEdit} borderColor="#c8d0d8" bg={canEdit ? "white" : "#f0f4f0"}
              value={form.narration} onChange={(e) => setForm((p) => ({ ...p, narration: e.target.value }))} />
          </GridItem>
        </Grid>
      </Box>

      {/* Demo Product */}
      <Box {...sectionStyle}>
        <Box {...sectionHeaderStyle}><Text fontWeight="500" fontSize="sm">Demo Product</Text></Box>
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th {...thStyle} w="30px">#</Th>
                <Th {...thStyle} minW="190px">Stock Item</Th>
                <Th {...thStyle} minW="120px">Crop</Th>
                <Th {...thStyle} minW="80px">Qty</Th>
                <Th {...thStyle} minW="70px">Unit</Th>
                <Th {...thStyle} minW="90px">Rate</Th>
                <Th {...thStyle} minW="90px">Free Sample</Th>
                <Th {...thStyle} minW="100px">Amount</Th>
              </Tr>
            </Thead>
            <Tbody>
              {items.map((item, index) => (
                <Tr key={index} bg={index % 2 === 0 ? "white" : "#f7faf8"}>
                  <Td {...tdStyle}><Text fontSize="11px" color="#888" textAlign="center">{index + 1}</Text></Td>
                  <Td {...tdStyle}>
                    {canEdit ? (
                      <Select {...inputStyle} value={item.stock_item_id} onChange={(e) => handleItemSelect(index, e.target.value)}>
                        <option value="">-- Select Item --</option>
                        {stockItemList.map((s) => <option key={s.id} value={s.id}>{s.name || s.item_name}</option>)}
                      </Select>
                    ) : <Text fontSize="12px">{item.item_name}</Text>}
                  </Td>
                  <Td {...tdStyle}><Input {...readonlyInputStyle} readOnly value={item.crop_name || "—"} /></Td>
                  <Td {...tdStyle}>
                    <Input {...(canEdit ? inputStyle : readonlyInputStyle)} isReadOnly={!canEdit} type="number" min={0}
                      value={item.qty} onChange={(e) => handleItemChange(index, "qty", e.target.value)} textAlign="right" />
                  </Td>
                  <Td {...tdStyle}><Input {...readonlyInputStyle} value={item.unit} readOnly textAlign="center" /></Td>
                  <Td {...tdStyle}>
                    <Input {...(canEdit ? inputStyle : readonlyInputStyle)} isReadOnly={!canEdit} type="number" min={0}
                      value={item.rate} onChange={(e) => handleItemChange(index, "rate", e.target.value)} textAlign="right" />
                  </Td>
                  <Td {...tdStyle} textAlign="center">
                    <Checkbox isChecked={!!item.is_free_sample} isDisabled={!canEdit} colorScheme="teal"
                      onChange={(e) => handleItemChange(index, "is_free_sample", e.target.checked ? 1 : 0)} />
                  </Td>
                  <Td {...tdStyle}><Input {...readonlyInputStyle} value={Number(item.amount).toFixed(2)} readOnly textAlign="right" /></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <Flex justify="flex-end" px={4} py={2} borderTop="1px solid #e0e8e2">
          <Text fontSize="12px" fontWeight="700" color="#494949">Total: ₹{itemsTotal.toFixed(2)}</Text>
        </Flex>
      </Box>

      {/* Customers & Allocation */}
      <Box {...sectionStyle}>
        <Box {...sectionHeaderStyle}>
          <HStack justifyContent="space-between">
            <Text fontWeight="500" fontSize="sm">Customers &amp; Allocation</Text>
            <Text fontSize="11px">{customers.length} customer(s)</Text>
          </HStack>
        </Box>
        {customers.length === 0 ? (
          <Text p={4} fontSize="12px" color="#888">No customers are mapped to this demo.</Text>
        ) : (
          <>
            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th {...thStyle} w="30px">#</Th>
                    <Th {...thStyle} minW="180px">Customer</Th>
                    <Th {...thStyle} minW="100px">Type</Th>
                    <Th {...thStyle} minW="150px">Under</Th>
                    <Th {...thStyle} minW="130px" textAlign="right">Allocated Qty ({productUnit})</Th>
                    <Th {...thStyle} minW="80px">Results</Th>
                    <Th {...thStyle} minW="110px">Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {customers.map((c, index) => (
                    <Tr key={c.id} bg={index % 2 === 0 ? "white" : "#f7faf8"}>
                      <Td {...tdStyle}><Text fontSize="11px" color="#888" textAlign="center">{index + 1}</Text></Td>
                      <Td {...tdStyle}>
                        <Text fontSize="12px" fontWeight="600">{c.party_name}</Text>
                        {c.party_firm_name && <Text fontSize="11px" color="#888">{c.party_firm_name}</Text>}
                      </Td>
                      <Td {...tdStyle}><Badge colorScheme={PARTY_COLOR[c.party_type] || "gray"}>{c.party_type}</Badge></Td>
                      <Td {...tdStyle}><Text fontSize="12px">{c.parent_name || "—"}</Text></Td>
                      <Td {...tdStyle}>
                        {canEdit ? (
                          <Input {...inputStyle} type="number" min={0} step="any" textAlign="right"
                            value={allocations[c.id] ?? ""}
                            onChange={(e) => setAllocations((p) => ({ ...p, [c.id]: e.target.value }))} />
                        ) : (
                          <Text fontSize="12px" textAlign="right">{c.allocated_qty ?? "—"}</Text>
                        )}
                      </Td>
                      <Td {...tdStyle}><Text fontSize="12px">{c.results_count || 0} / {demo.max_results}</Text></Td>
                      <Td {...tdStyle}>
                        <Badge colorScheme={CUSTOMER_STATUS_COLOR[c.result_status] || "gray"}>
                          {(c.result_status || "PENDING").replaceAll("_", " ")}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            <Flex justify="flex-end" gap={4} px={4} py={2} borderTop="1px solid #e0e8e2">
              <Text fontSize="12px" fontWeight="700" color={overAllocated ? "red.600" : "#494949"}>
                Allocated: {allocatedTotal} / {productQty} {productUnit}
              </Text>
              <Text fontSize="12px" fontWeight="700" color="#494949">
                Remaining: {+(productQty - allocatedTotal).toFixed(2)}
              </Text>
            </Flex>
          </>
        )}
      </Box>

      {/* Proofs */}
      <Box {...sectionStyle} p={4}>
        <Box {...sectionHeaderStyle} mx={-4} mt={-4} mb={4}><Text fontWeight="500" fontSize="sm">Proof Documents</Text></Box>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={4}>
          {["FARM_IMAGE", "CONSENT_DOC"].map((type) => {
            const existing = (demo.proofs || []).find((p) => p.proof_type === type);
            const setFile = type === "FARM_IMAGE" ? setFarmImageFile : setConsentDocFile;
            const fieldName = type === "FARM_IMAGE" ? "farm_image" : "consent_doc";
            const chosenFile = type === "FARM_IMAGE" ? farmImageFile : consentDocFile;
            return (
              <Box key={type}>
                <Text {...labelStyle}>{type === "FARM_IMAGE" ? "Farm Image" : "Consent Document"}</Text>
                {existing?.file_url && !chosenFile && (
                  <Image src={existing.file_url} alt={type} maxH="140px" borderRadius="6px" border="1px solid #d0d7de" mb={2} />
                )}
                {canEdit && (
                  <Input {...inputStyle} type="file" accept="image/*,application/pdf" name={fieldName}
                    onChange={(e) => setFile(e.target.files[0])} />
                )}
              </Box>
            );
          })}
        </Grid>
      </Box>

      {/* Employee results, grouped by customer */}
      {(customers.length > 0 || (demo.results || []).length > 0) && (
        <Box {...sectionStyle}>
          <Box {...sectionHeaderStyle}>
            <HStack justifyContent="space-between">
              <Text fontWeight="500" fontSize="sm">Employee Results</Text>
              <Text fontSize="11px">{(demo.results || []).length} result(s) uploaded</Text>
            </HStack>
          </Box>
          <Box p={4}>
            {customers.map((c) => {
              const list = resultsByCustomer.get(c.id) || [];
              return (
                <Box key={c.id} mb={4}>
                  <HStack mb={2} flexWrap="wrap">
                    <Text fontSize="13px" fontWeight="700" color="#237086">{c.party_name}</Text>
                    <Badge colorScheme={PARTY_COLOR[c.party_type] || "gray"}>{c.party_type}</Badge>
                    <Text fontSize="11px" color="#888">{c.results_count || 0} / {demo.max_results} results</Text>
                  </HStack>
                  {list.length === 0
                    ? <Text fontSize="12px" color="#888">No results uploaded yet.</Text>
                    : list.map((r) => <ResultCard key={r.id} r={r} />)}
                </Box>
              );
            })}
            {removedGroups.map(([cid, list]) => (
              <Box key={cid} mb={4}>
                <HStack mb={2}>
                  <Text fontSize="13px" fontWeight="700" color="#a05a00">{list[0]?.customer_name || `Customer #${cid}`}</Text>
                  <Badge colorScheme="orange">Removed from demo</Badge>
                </HStack>
                {list.map((r) => <ResultCard key={r.id} r={r} />)}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Activity Log */}
      <Box {...sectionStyle}>
        <Box {...sectionHeaderStyle}><Text fontWeight="500" fontSize="sm">Activity Log</Text></Box>
        <Box p={4}>
          {(demo.activity || []).map((a) => (
            <Text key={a.id} fontSize="12px" color="#555" mb={1}>
              <b>{a.action}</b> by {a.acted_by_name} — {new Date(a.created_at).toLocaleString()}
              {a.remarks ? ` (${a.remarks})` : ""}
            </Text>
          ))}
        </Box>
      </Box>

      {/* Footer actions */}
      {canEdit && (
        <Flex justify="flex-end" gap={3} mt={2} mb={4}>
          <Button variant="outline" colorScheme="teal" px={8} borderRadius="12px" isLoading={saving} onClick={saveChanges} fontSize="14px">
            Save Changes
          </Button>
          {canApprove && demo.status === "PENDING_APPROVAL" && (
            <>
              <Button colorScheme="red" variant="outline" px={8} borderRadius="12px" onClick={openRejectModal} fontSize="14px">
                Reject
              </Button>
              <Button bg="#237086" color="white" _hover={{ bg: "#1B5A6B" }} px={10} borderRadius="12px"
                isLoading={approving} loadingText="Approving..." onClick={handleApprove} fontSize="14px" fontWeight="500">
                Approve
              </Button>
            </>
          )}
        </Flex>
      )}

      {/* Reject modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="12px">
          <ModalHeader bgGradient="linear(to-r, red.500, red.400)" color="white" borderTopRadius="12px" fontSize="md">
            Reject Demo Request
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={4}>
            <Text {...labelStyle}>Rejection Reason <Text as="span" color="red.500">*</Text></Text>
            <Textarea rows={3} fontSize="12px" value={rejectRemarks} onChange={(e) => setRejectRemarks(e.target.value)}
              placeholder="Explain why this demo request is being rejected..." />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button colorScheme="red" isLoading={rejecting} onClick={confirmReject}>Confirm Reject</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ViewDemoRequestDetail;