// Advance Booking → Settings (MANAGE_ABS_SETTINGS; Admin / Super Admin always)
//
// How products reach a booking season (no separate master):
//   Crop Management → Create Crop: the crop's season(s)         (Kharif / Rabi / Zaid …)
//   Inventory → Create Stock Item: the product's crop
//   here → price list: choose a crop of the season's crop season → only that crop's stock items
//
// Season set-up, in the order a seed company works:
//   1. New season (Draft): name, crop season, booking + delivery window, minimum advance % and amount
//   2. Price list & production plan: crop → product, booking rate, MRP, limits, production plan
//   3. Schemes (early booking, quantity slab, advance payment) on all products or one product
//   4. Checklist → Open (published; "Scheduled" until the booking start) → Close → Completed
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert, AlertDescription, AlertIcon, Badge, Box, Button, Checkbox, Flex, FormControl, FormHelperText, FormLabel, HStack, Input, List, ListItem,
  Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Progress, Select, SimpleGrid, Switch, Tab, TabList,
  TabPanel, TabPanels, Tabs, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr,
} from "@chakra-ui/react";
import { absApi, apiError } from "../../services/absApi";
import { AbsBadge, DataTable, ErrorBox, Loading, PageTitle, fmtDate, fmtDateTime, money, qty, useAbsMasters, useAbsToast, useConfirm } from "./absShared";

const F = ({ label, help, children, isRequired }) => (
  <FormControl isRequired={isRequired}>
    <FormLabel fontSize="xs" mb={1}>{label}</FormLabel>
    {children}
    {help ? <FormHelperText fontSize="11px">{help}</FormHelperText> : null}
  </FormControl>
);
const blank = (v) => (v === null || v === undefined ? "" : String(v));
const n = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

// ----------------------------------------------------------------- policy
const PolicyForm = ({ masters, onSaved }) => {
  const notify = useAbsToast();
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    absApi
      .settings()
      .then((s) => setF(Object.fromEntries(Object.entries(s).map(([k, v]) => [k, ["require_booking_approval", "advance_at_booking"].includes(k) ? !!v && v !== "0" : blank(v)]))))
      .catch((e) => setError(apiError(e)));
  }, []);
  if (error) return <ErrorBox message={error} />;
  if (!f) return <Loading />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const save = async () => {
    setBusy(true);
    try {
      const keys = ["min_advance_pct", "advance_due_days", "require_booking_approval", "advance_at_booking", "dispatch_payment_rule", "dispatch_min_paid_pct", "allocation_priority", "sales_ledger_id", "booking_prefix", "cancellation_refund_rule", "company_state_code"];
      const body = Object.fromEntries(keys.map((k) => [k, k === "advance_due_days" ? Number(f[k]) : k === "sales_ledger_id" ? (f[k] ? Number(f[k]) : null) : f[k]]));
      notify.ok((await absApi.saveSettings(body)).message);
      onSaved();
    } catch (err) {
      notify.fail(err);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Box maxW="900px">
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <F label="Minimum advance % (default for seasons)" help="Used when a season leaves its % blank. A season can also set a minimum advance amount (₹ per booking).">
          <Input size="sm" type="number" value={f.min_advance_pct} onChange={set("min_advance_pct")} />
        </F>
        <F label="Collect the advance with the booking" help="On: the officer records the advance on the draft; the booking can be submitted only when the recorded advance covers the minimum, and the office confirms only after accounts verify it (Receipt posted). Off: the advance is due after confirmation.">
          <Switch isChecked={f.advance_at_booking} onChange={set("advance_at_booking")} colorScheme="teal" />
        </F>
        <F label="Advance due in (days after confirmation)" help="Used only when the advance is collected after confirmation.">
          <Input size="sm" type="number" value={f.advance_due_days} onChange={set("advance_due_days")} isDisabled={f.advance_at_booking} />
        </F>
        <F label="Booking approval" help="On: bookings go up the reporting line (to the RSM) before the office confirms them.">
          <Switch isChecked={f.require_booking_approval} onChange={set("require_booking_approval")} colorScheme="teal" />
        </F>
        <F label="Booking number prefix" help="e.g. ABS → ABS-2026-00001"><Input size="sm" value={f.booking_prefix} onChange={set("booking_prefix")} /></F>
        <F label="Payment rule before dispatch">
          <Select size="sm" value={f.dispatch_payment_rule} onChange={set("dispatch_payment_rule")}>
            <option value="CREDIT_LIMIT">Party credit limit &amp; overdue bills (same as Sales)</option>
            <option value="MIN_PERCENT">Minimum % of the booking paid</option>
            <option value="FULL_PAYMENT">Full payment of the invoice before dispatch</option>
          </Select>
        </F>
        <F label="Paid % needed before dispatch" help="Used when the rule is Minimum %."><Input size="sm" type="number" value={f.dispatch_min_paid_pct} onChange={set("dispatch_min_paid_pct")} isDisabled={f.dispatch_payment_rule !== "MIN_PERCENT"} /></F>
        <F label="Allocation priority when stock is short">
          <Select size="sm" value={f.allocation_priority} onChange={set("allocation_priority")}>
            <option value="ADVANCE_FIRST">Advance paid % first, then booking date</option>
            <option value="BOOKING_DATE">First come, first served (booking date)</option>
          </Select>
        </F>
        <F label="Sales ledger for dispatch invoices">
          <Select size="sm" value={f.sales_ledger_id} onChange={set("sales_ledger_id")} placeholder="Select (required to dispatch)">
            {(masters ? masters.sales_ledgers : []).map((l) => <option key={l.id} value={l.id}>{l.ledger_name || l.name}</option>)}
          </Select>
        </F>
        <F label="Advance of quantity not supplied / cancelled / rejected">
          <Select size="sm" value={f.cancellation_refund_rule} onChange={set("cancellation_refund_rule")}>
            <option value="REFUND">Refund to the party</option>
            <option value="CARRY_FORWARD">Carry forward as party credit</option>
          </Select>
        </F>
        <F label="Company GST state code" help="Blank = taken from the company GSTIN. Same state → CGST + SGST, else IGST."><Input size="sm" maxW="120px" value={f.company_state_code} onChange={set("company_state_code")} /></F>
      </SimpleGrid>
      <Button mt={5} size="sm" colorScheme="teal" isLoading={busy} onClick={save}>Save settings</Button>
    </Box>
  );
};

// ----------------------------------------------------------------- season modal
const SeasonModal = ({ season, masters, onClose, onSaved }) => {
  const notify = useAbsToast();
  const [f, setF] = useState(() => ({
    name: blank(season?.name), season: blank(season?.season), financial_year: blank(season?.financial_year),
    booking_start: blank(season?.booking_start), booking_end: blank(season?.booking_end),
    delivery_start: blank(season?.delivery_start), delivery_end: blank(season?.delivery_end),
    min_advance_pct: blank(season?.min_advance_pct), min_advance_amount: blank(season?.min_advance_amount), remarks: blank(season?.remarks),
  }));
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const isNew = !season;
  const seasonLocked = !!season && (season.product_count > 0 || season.booking_count > 0);
  const defaultPct = masters && masters.settings ? masters.settings.min_advance_pct : null;

  // example shown under the fields: what a ₹50,000 booking needs
  const example = useMemo(() => {
    const pct = f.min_advance_pct === "" ? Number(defaultPct || 0) : Number(f.min_advance_pct);
    const amt = f.min_advance_amount === "" ? 0 : Number(f.min_advance_amount);
    const value = 50000;
    return Math.min(value, Math.max((value * pct) / 100, amt));
  }, [f.min_advance_pct, f.min_advance_amount, defaultPct]);

  const save = async () => {
    if (!f.name.trim()) return notify.fail("Enter the season name");
    if (!f.season) return notify.fail("Select the crop season");
    if (!f.booking_start || !f.booking_end) return notify.fail("Enter the booking window");
    if (f.booking_start > f.booking_end) return notify.fail("Booking opens after it closes — check the dates");
    if (f.delivery_start && f.delivery_end && f.delivery_start > f.delivery_end) return notify.fail("Delivery starts after it ends — check the dates");
    if (f.min_advance_pct !== "" && (Number(f.min_advance_pct) < 0 || Number(f.min_advance_pct) > 100)) return notify.fail("Minimum advance % must be 0 – 100");
    if (f.min_advance_amount !== "" && !(Number(f.min_advance_amount) >= 0)) return notify.fail("Minimum advance amount cannot be negative");
    setBusy(true);
    try {
      const b = {
        ...f,
        min_advance_pct: f.min_advance_pct === "" ? null : f.min_advance_pct,
        min_advance_amount: f.min_advance_amount === "" ? null : f.min_advance_amount,
        delivery_start: f.delivery_start || null,
        delivery_end: f.delivery_end || null,
      };
      const res = await absApi.saveSeason(season?.id, b);
      notify.ok(res.message);
      onSaved(res.data);
      onClose();
    } catch (err) {
      notify.fail(err);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal isOpen onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">{season ? `Edit ${season.name}` : "New booking season"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            <F label="Name" isRequired><Input size="sm" placeholder="Kharif 2027 Advance Booking" value={f.name} onChange={set("name")} /></F>
            <F label="Crop season" isRequired help={seasonLocked ? "Fixed once products are in the price list" : "Only products of crops grown in this season can be booked"}>
              <Select size="sm" value={f.season} onChange={set("season")} placeholder="Select" isDisabled={seasonLocked}>
                {(masters ? masters.crop_seasons : []).map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </F>
            <F label="Booking opens" isRequired><Input size="sm" type="date" value={f.booking_start} onChange={set("booking_start")} /></F>
            <F label="Booking closes" isRequired><Input size="sm" type="date" value={f.booking_end} onChange={set("booking_end")} /></F>
            <F label="Delivery from"><Input size="sm" type="date" value={f.delivery_start} onChange={set("delivery_start")} /></F>
            <F label="Delivery till"><Input size="sm" type="date" value={f.delivery_end} onChange={set("delivery_end")} /></F>
            <F label="Minimum advance %" help={`% of the booking value before GST. Blank = the default in Booking policy${defaultPct !== null && defaultPct !== undefined ? ` (${defaultPct}%)` : ""}.`}>
              <Input size="sm" type="number" min={0} max={100} value={f.min_advance_pct} onChange={set("min_advance_pct")} />
            </F>
            <F label="Minimum advance amount (₹ per booking)" help="A booking must carry at least this advance, even when the % gives less. Blank = no fixed minimum.">
              <Input size="sm" type="number" min={0} value={f.min_advance_amount} onChange={set("min_advance_amount")} placeholder="e.g. 5000" />
            </F>
            <F label="Financial year"><Input size="sm" placeholder="2026-27" value={f.financial_year} onChange={set("financial_year")} /></F>
            <F label="Remarks"><Input size="sm" value={f.remarks} onChange={set("remarks")} /></F>
          </SimpleGrid>
          <Alert status="info" mt={3} borderRadius="md" fontSize="xs" alignItems="flex-start">
            <AlertIcon />
            <Box>
              <Text>Minimum advance of a booking = the higher of (value × %) and the minimum amount, never more than the booking value.</Text>
              <Text>Example: a ₹50,000 booking needs {money(example)}.</Text>
            </Box>
          </Alert>
          {isNew && <Text fontSize="11px" color="gray.500" mt={3}>The season is saved as Draft. Add products with rates and the production plan, then Open it from the checklist.</Text>}
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" colorScheme="teal" isLoading={busy} onClick={save}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ----------------------------------------------------------------- checklist + lifecycle
const LIFECYCLE_HELP = {
  DRAFT: "Draft: being set up. Field staff cannot see it.",
  SCHEDULED: "Published: field staff can book from the booking start date.",
  OPEN: "Open: field staff are booking now.",
  BOOKING_OVER: "The booking window is over: no new bookings. Close the season when you are ready.",
  CLOSED: "Closed: no new bookings; existing bookings carry on to payment, dispatch and delivery.",
  COMPLETED: "Completed: every booking is settled.",
};

const SeasonOverview = ({ season, onAction }) => {
  const c = season.checklist || { errors: [], warnings: [], ready: false };
  const st = season.status;
  return (
    <Box>
      <Flex gap={3} align="center" wrap="wrap" mb={3}>
        <AbsBadge status={season.display_status} />
        <Text fontSize="sm" color="gray.600">{LIFECYCLE_HELP[season.display_status]}</Text>
      </Flex>
      <HStack mb={4} wrap="wrap" spacing={2}>
        {(st === "DRAFT" || st === "CLOSED") && (
          <Tooltip label={c.ready ? "" : c.errors.join(" • ")} isDisabled={c.ready} hasArrow>
            <Button size="sm" colorScheme="green" isDisabled={!c.ready} onClick={() => onAction("OPEN")}>{st === "DRAFT" ? "Open / publish season" : "Re-open season"}</Button>
          </Tooltip>
        )}
        {st === "OPEN" && <Button size="sm" colorScheme="red" variant="outline" onClick={() => onAction("CLOSED")}>Close season</Button>}
        {st === "CLOSED" && <Button size="sm" variant="outline" isDisabled={season.open_booking_count > 0} onClick={() => onAction("COMPLETED")}>Mark completed{season.open_booking_count > 0 ? ` (${season.open_booking_count} open)` : ""}</Button>}
        {(st === "OPEN" || st === "CLOSED") && !season.booking_count && <Button size="sm" variant="ghost" onClick={() => onAction("DRAFT")}>Back to draft</Button>}
      </HStack>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Box>
          <Text fontWeight="700" fontSize="sm" mb={2}>Checklist {c.ready ? <Badge colorScheme="green" ml={2}>Ready</Badge> : <Badge colorScheme="orange" ml={2}>Not ready</Badge>}</Text>
          {c.errors.map((e) => <Alert key={e} status="error" py={1} mb={1} borderRadius="md" fontSize="xs"><AlertIcon boxSize="12px" /><AlertDescription>{e}</AlertDescription></Alert>)}
          {c.warnings.map((e) => <Alert key={e} status="warning" py={1} mb={1} borderRadius="md" fontSize="xs"><AlertIcon boxSize="12px" /><AlertDescription>{e}</AlertDescription></Alert>)}
          {!c.errors.length && !c.warnings.length && <Text fontSize="xs" color="gray.500">Everything is set.</Text>}
          <Text fontSize="xs" color="gray.500" mt={3}>
            Booking {fmtDate(season.booking_start)} – {fmtDate(season.booking_end)} · Delivery {season.delivery_start ? `${fmtDate(season.delivery_start)} – ${fmtDate(season.delivery_end)}` : "—"} · Minimum advance {season.min_advance_pct ?? "default"}%{season.min_advance_amount ? ` (at least ${money(season.min_advance_amount)} per booking)` : ""}
          </Text>
          {season.opened_at && <Text fontSize="xs" color="gray.500">Opened by {season.opened_by_name || "—"} on {fmtDateTime(season.opened_at)}</Text>}
          {season.closed_at && <Text fontSize="xs" color="gray.500">Closed by {season.closed_by_name || "—"} on {fmtDateTime(season.closed_at)}</Text>}
        </Box>
        <Box>
          <Text fontWeight="700" fontSize="sm" mb={2}>Set-up history</Text>
          <List spacing={1} maxH="220px" overflowY="auto" fontSize="xs">
            {(season.log || []).map((l) => (
              <ListItem key={l.id}><Text as="span" color="gray.500">{fmtDateTime(l.created_at)} · {l.user_name || "—"}:</Text> {l.entity} {l.action.replace(/_/g, " ").toLowerCase()} {l.detail ? `— ${String(l.detail).slice(0, 160)}` : ""}</ListItem>
            ))}
            {!(season.log || []).length && <ListItem color="gray.500">No change recorded yet.</ListItem>}
          </List>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

// ----------------------------------------------------------------- price list & production plan
// row checks mirror the server, so the officer sees the problem before saving
const rowProblem = (r, cropSeason) => {
  const rate = n(r.booking_rate);
  const mrp = n(r.mrp);
  const min = n(r.min_qty) || 0;
  const max = n(r.max_qty_per_party);
  const plan = n(r.production_qty);
  if (r.is_active && r.crop_in_season === false) return `Not a ${cropSeason} crop product — fix the crop of the stock item or the season of its crop, or switch it off`;
  if (!(rate > 0)) return "Booking rate is required";
  if (mrp !== null && mrp > 0 && rate > mrp) return "Booking rate is more than MRP";
  if (min < 0 || (max !== null && max < 0) || (plan !== null && plan < 0)) return "Quantities cannot be negative";
  if (max !== null && max > 0 && max < min) return `Max per party (${max}) is less than the min per booking (${min})`;
  if (plan !== null && plan > 0 && plan < min) return `Production plan (${plan}) is less than the min per booking (${min})`;
  if (plan !== null && plan > 0 && max !== null && max > 0 && plan < max) return `Production plan (${plan}) is less than the max per party (${max})`;
  if (plan !== null && plan > 0 && plan < (r.booked_qty || 0)) return `Production plan is below the ${r.booked_qty} already booked`;
  return null;
};

const PriceList = ({ season, onSaved }) => {
  const notify = useAbsToast();
  const [confirm, confirmDialog] = useConfirm();
  const [rows, setRows] = useState([]);
  const [cropId, setCropId] = useState("");
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState(null); // stock items of the chosen crop
  const [pick, setPick] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [busy, setBusy] = useState(false);
  const locked = season.status === "COMPLETED";
  const crops = season.crops || [];

  useEffect(() => {
    setRows((season.products || []).map((p) => ({ ...p, booking_rate: blank(p.booking_rate), mrp: blank(p.mrp), min_qty: blank(p.min_qty), max_qty_per_party: blank(p.max_qty_per_party), production_qty: blank(p.production_qty), is_active: !!p.is_active, saved: true })));
  }, [season]);
  useEffect(() => {
    if (!cropId && crops.length) setCropId(String(crops[0].crop_id));
  }, [crops, cropId]);

  // products (stock items) of the chosen crop in this season — reloaded when the crop or search changes
  useEffect(() => {
    if (!cropId) return setOptions(null);
    let alive = true;
    setLoadingOptions(true);
    const t = setTimeout(() => {
      absApi.seasonCropProducts(season.id, cropId, search.trim() || undefined)
        .then((d) => alive && setOptions(d.products || []))
        .catch((e) => { if (alive) { setOptions([]); notify.fail(e); } })
        .finally(() => alive && setLoadingOptions(false));
    }, search ? 300 : 0);
    return () => { alive = false; clearTimeout(t); };
  }, [season.id, cropId, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const inRows = new Set(rows.map((r) => r.stock_item_id));
  const crop = crops.find((c) => String(c.crop_id) === String(cropId));
  const free = (options || []).filter((o) => !inRows.has(o.stock_item_id));

  const addProduct = (it) => {
    if (!it || inRows.has(it.stock_item_id)) return;
    setRows((cur) => [...cur, {
      stock_item_id: it.stock_item_id, item_name: it.item_name, unit: it.unit, gst_percent: it.gst_percent,
      crop_id: it.crop_id, crop_name: it.crop_name, crop_in_season: true, item_active: true,
      booking_rate: "", mrp: "", min_qty: "", max_qty_per_party: "", production_qty: "", is_active: true, booked_qty: 0, saved: false,
    }]);
  };
  const addPicked = () => {
    addProduct(free.find((o) => String(o.stock_item_id) === String(pick)));
    setPick("");
  };
  const addAll = () => free.forEach(addProduct);
  const set = (id, k, v) => setRows((cur) => cur.map((r) => (r.stock_item_id === id ? { ...r, [k]: v } : r)));

  const problems = rows.map((r) => ({ name: r.item_name, problem: rowProblem(r, season.season) })).filter((x) => x.problem);

  const save = async () => {
    if (problems.length) return notify.fail(`${problems[0].name}: ${problems[0].problem}`);
    setBusy(true);
    try {
      const body = rows.map((r) => ({
        stock_item_id: r.stock_item_id,
        booking_rate: r.booking_rate,
        mrp: r.mrp === "" ? null : r.mrp,
        min_qty: r.min_qty === "" ? 0 : r.min_qty,
        max_qty_per_party: r.max_qty_per_party === "" ? null : r.max_qty_per_party,
        production_qty: r.production_qty === "" ? null : r.production_qty,
        is_active: r.is_active,
      }));
      notify.ok((await absApi.saveSeasonProducts(season.id, body)).message);
      onSaved();
    } catch (err) {
      notify.fail(err);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (r) => {
    if (!r.saved) return setRows((cur) => cur.filter((x) => x.stock_item_id !== r.stock_item_id));
    if (!(await confirm("Remove from price list", `Remove ${r.item_name} from this season? (Only possible while no booking uses it.)`, { yes: "Remove", danger: true }))) return;
    try {
      notify.ok((await absApi.deleteSeasonProduct(season.id, r.stock_item_id)).message);
      onSaved();
    } catch (err) {
      notify.fail(err);
    }
  };

  const cell = (r, k, props = {}) => (
    <Input size="xs" type="number" min={0} maxW="92px" value={r[k]} isDisabled={locked} onChange={(e) => set(r.stock_item_id, k, e.target.value)} {...props} />
  );

  return (
    <Box>
      {confirmDialog}
      {crops.length === 0 ? (
        <Alert status="warning" borderRadius="md" fontSize="sm" mb={3}><AlertIcon />No crop is linked to {season.season}. In Crop Management, edit the crop and tick {season.season} as its season.</Alert>
      ) : (
        <Box border="1px solid" borderColor="gray.100" borderRadius="12px" p={3} mb={4}>
          <Text fontSize="xs" fontWeight="700" color="gray.600" mb={2}>Add products: {season.season} crop → its products (stock items linked to the crop)</Text>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={3}>
            <Select size="sm" value={cropId} onChange={(e) => { setCropId(e.target.value); setPick(""); setSearch(""); }}>
              {crops.map((c) => <option key={c.crop_id} value={c.crop_id}>{c.crop_name} ({c.in_price_list}/{c.product_count} in list)</option>)}
            </Select>
            <Input size="sm" placeholder="Search product…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select size="sm" value={pick} onChange={(e) => setPick(e.target.value)} isDisabled={locked || loadingOptions}
              placeholder={loadingOptions ? "Loading…" : free.length ? `Select a ${crop ? crop.crop_name : ""} product (${free.length})` : "No more products of this crop"}>
              {free.map((o) => <option key={o.stock_item_id} value={o.stock_item_id}>{o.item_name}{o.unit ? ` · ${o.unit}` : ""}</option>)}
            </Select>
            <HStack>
              <Button size="sm" colorScheme="teal" isDisabled={!pick || locked} onClick={addPicked}>Add</Button>
              <Button size="sm" variant="outline" colorScheme="teal" isDisabled={!free.length || locked} onClick={addAll}>Add all ({free.length})</Button>
            </HStack>
          </SimpleGrid>
          {options && options.length === 0 && !loadingOptions && (
            <Text fontSize="xs" color="orange.500" mt={2}>No active stock item has {crop ? crop.crop_name : "this crop"} as its crop{search ? ` matching "${search}"` : ""}. Set the crop on the stock item (Inventory → Stock Item).</Text>
          )}
        </Box>
      )}

      <Box overflowX="auto">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Product</Th>
              <Th isNumeric>Booking rate * <Text as="span" fontWeight="400" textTransform="none">(₹/unit, before GST)</Text></Th>
              <Th isNumeric>MRP</Th>
              <Th isNumeric><Tooltip label="Smallest quantity one booking line may have (blank = no minimum)" hasArrow><span>Min / booking</span></Tooltip></Th>
              <Th isNumeric><Tooltip label="Most one party may book in the whole season, all its bookings together (blank = no limit)" hasArrow><span>Max / party</span></Tooltip></Th>
              <Th isNumeric><Tooltip label="Production plan: the most all parties together may book this season (blank = no limit). Bookings can never go above it." hasArrow><span>Production plan</span></Tooltip></Th>
              <Th isNumeric>Booked</Th>
              <Th>Used</Th>
              <Th>Active</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {rows.length === 0 && <Tr><Td colSpan={10}><Text fontSize="sm" color="gray.500">No product yet. Choose a crop above and add its products.</Text></Td></Tr>}
            {rows.map((r) => {
              const p = rowProblem(r, season.season);
              const plan = n(r.production_qty);
              const pct = plan ? Math.round(((r.booked_qty || 0) / plan) * 1000) / 10 : null;
              return (
                <Tr key={r.stock_item_id} bg={p ? "red.50" : undefined}>
                  <Td>
                    <Text fontSize="sm" fontWeight="600">{r.item_name}</Text>
                    <Text fontSize="xs" color="gray.500">{[r.crop_name || "no crop", r.unit, `GST ${r.gst_percent || 0}%`].filter(Boolean).join(" · ")}</Text>
                    {p && <Text fontSize="xs" color="red.600">{p}</Text>}
                    {!r.saved && <Badge colorScheme="purple" fontSize="9px">not saved</Badge>}
                  </Td>
                  <Td isNumeric>{cell(r, "booking_rate")}</Td>
                  <Td isNumeric>{cell(r, "mrp")}</Td>
                  <Td isNumeric>{cell(r, "min_qty", { placeholder: "none" })}</Td>
                  <Td isNumeric>{cell(r, "max_qty_per_party", { placeholder: "no limit" })}</Td>
                  <Td isNumeric>{cell(r, "production_qty", { placeholder: "no limit", maxW: "110px" })}</Td>
                  <Td isNumeric>
                    <Text fontSize="sm">{qty(r.booked_qty)}</Text>
                    {plan !== null && plan > 0 && <Text fontSize="xs" color="gray.500">{qty(Math.max(plan - (r.booked_qty || 0), 0))} left</Text>}
                  </Td>
                  <Td minW="100px">
                    {pct === null ? <Text fontSize="xs" color="gray.500">no plan</Text> : (
                      <Tooltip label={`${pct}% of the plan booked`} hasArrow>
                        <Box><Progress size="sm" value={Math.min(pct, 100)} colorScheme={pct >= 100 ? "red" : pct >= 80 ? "orange" : "teal"} borderRadius="full" /></Box>
                      </Tooltip>
                    )}
                  </Td>
                  <Td><Checkbox isChecked={r.is_active} isDisabled={locked} onChange={(e) => set(r.stock_item_id, "is_active", e.target.checked)} /></Td>
                  <Td><Button size="xs" variant="ghost" colorScheme="red" isDisabled={locked || r.booked_qty > 0} onClick={() => remove(r)}>Remove</Button></Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
      <Text fontSize="11px" color="gray.500" mt={2}>
        Quantities are in the product&apos;s unit (e.g. packets, bags). Booked = quantity of submitted and later bookings, from the booking lines — it goes up on submit and down on rejection, cancellation, short supply and short-close (drafts do not count). A product with bookings cannot be removed — switch it off.
      </Text>
      <Button mt={3} size="sm" colorScheme="teal" isLoading={busy} isDisabled={!rows.length || locked} onClick={save}>Save price list</Button>
    </Box>
  );
};

// ----------------------------------------------------------------- schemes
const SCHEME_TYPES = {
  EARLY_BOOKING: "Early booking discount",
  QUANTITY_SLAB: "Quantity slab discount",
  ADVANCE_PAYMENT: "Advance-payment discount",
};
const SCHEME_HELP = {
  EARLY_BOOKING: "Bookings made on or before the date get the discount (e.g. ₹20/packet till 15 March).",
  QUANTITY_SLAB: "From a quantity of one booking line (e.g. 2% from 100 packets). Add one scheme per slab; the highest slab that applies wins.",
  ADVANCE_PAYMENT: "Given on the invoice when the party paid at least this % of the booking value by the date (e.g. ₹10/packet for 50% by 31 March).",
};

const SchemeModal = ({ season, scheme, onClose, onSaved }) => {
  const notify = useAbsToast();
  const [f, setF] = useState(() => ({
    name: blank(scheme?.name), scheme_type: scheme?.scheme_type || "EARLY_BOOKING",
    scope: scheme?.stock_item_id ? "PRODUCT" : "SEASON",
    stock_item_id: blank(scheme?.stock_item_id),
    valid_from: blank(scheme?.valid_from), valid_till: blank(scheme?.valid_till), min_qty: blank(scheme?.min_qty),
    min_advance_pct: blank(scheme?.min_advance_pct), discount_type: scheme?.discount_type || "PER_UNIT", discount_value: blank(scheme?.discount_value),
  }));
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const t = f.scheme_type;
  const save = async () => {
    if (!f.name.trim()) return notify.fail("Enter the scheme name");
    if (!(Number(f.discount_value) > 0)) return notify.fail("Enter the discount");
    if (f.scope === "PRODUCT" && !f.stock_item_id) return notify.fail("Select the product");
    if (t === "QUANTITY_SLAB" && !(Number(f.min_qty) > 0)) return notify.fail("Enter the quantity from which the slab applies");
    setBusy(true);
    try {
      const body = {
        name: f.name, scheme_type: t,
        stock_item_id: f.scope === "PRODUCT" ? Number(f.stock_item_id) : null,
        valid_from: f.valid_from || null, valid_till: f.valid_till || null,
        min_qty: f.min_qty || 0, min_advance_pct: f.min_advance_pct || 0,
        discount_type: f.discount_type, discount_value: f.discount_value,
      };
      notify.ok((await absApi.saveScheme(season.id, scheme?.id, body)).message);
      onSaved();
      onClose();
    } catch (err) {
      notify.fail(err);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal isOpen onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">{scheme ? "Edit scheme" : "New scheme"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            <F label="Scheme name" isRequired><Input size="sm" value={f.name} onChange={set("name")} placeholder="e.g. Early bird till 15 March" /></F>
            <F label="Type">
              <Select size="sm" value={t} onChange={set("scheme_type")}>
                {Object.entries(SCHEME_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </F>
            <F label="Applies to">
              <Select size="sm" value={f.scope} onChange={set("scope")}>
                <option value="SEASON">Every product of the season</option>
                <option value="PRODUCT">One product</option>
              </Select>
            </F>
            {f.scope === "PRODUCT" && (
              <F label="Product" isRequired>
                <Select size="sm" value={f.stock_item_id} onChange={set("stock_item_id")} placeholder="Select">
                  {(season.products || []).map((p) => <option key={p.stock_item_id} value={p.stock_item_id}>{p.item_name}{p.crop_name ? ` (${p.crop_name})` : ""}</option>)}
                </Select>
              </F>
            )}
            <F label="Valid from"><Input size="sm" type="date" value={f.valid_from} onChange={set("valid_from")} /></F>
            <F label={t === "ADVANCE_PAYMENT" ? "Advance to be paid by" : t === "EARLY_BOOKING" ? "Booked on or before" : "Valid till"} isRequired={t !== "QUANTITY_SLAB"}>
              <Input size="sm" type="date" value={f.valid_till} onChange={set("valid_till")} />
            </F>
            {t === "QUANTITY_SLAB" && <F label="From quantity (per booking line)" isRequired><Input size="sm" type="number" value={f.min_qty} onChange={set("min_qty")} /></F>}
            {t === "ADVANCE_PAYMENT" && <F label="Advance % of booking value" isRequired><Input size="sm" type="number" value={f.min_advance_pct} onChange={set("min_advance_pct")} /></F>}
            <F label="Discount" isRequired>
              <HStack>
                <Select size="sm" maxW="140px" value={f.discount_type} onChange={set("discount_type")}><option value="PER_UNIT">₹ per unit</option><option value="PERCENT">% of rate</option></Select>
                <Input size="sm" type="number" value={f.discount_value} onChange={set("discount_value")} />
              </HStack>
            </F>
          </SimpleGrid>
          <Alert status="info" mt={3} borderRadius="md" fontSize="xs"><AlertIcon />{SCHEME_HELP[t]}</Alert>
          <Text fontSize="11px" color="gray.500" mt={2}>The best scheme of each type applies to a line; different types add up. The discount reduces the rate before GST.</Text>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" colorScheme="teal" isLoading={busy} onClick={save}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const Schemes = ({ season, onSaved }) => {
  const notify = useAbsToast();
  const [confirm, confirmDialog] = useConfirm();
  const [edit, setEdit] = useState(null);
  const off = async (s) => {
    if (!(await confirm("Switch off scheme", `Stop "${s.name}" for new bookings? Bookings already made keep their discount.`, { yes: "Switch off", danger: true }))) return;
    try {
      notify.ok((await absApi.deleteScheme(season.id, s.id)).message);
      onSaved();
    } catch (err) {
      notify.fail(err);
    }
  };
  const hasPacks = (season.products || []).length > 0;
  const locked = season.status === "COMPLETED";
  const scope = (s) => (s.stock_item_id ? s.item_name || `Product ${s.stock_item_id}` : "All products");
  return (
    <Box>
      {confirmDialog}
      <HStack mb={3}>
        <Button size="sm" colorScheme="teal" onClick={() => setEdit({})} isDisabled={!hasPacks || locked}>Add scheme</Button>
        {!hasPacks && <Text fontSize="xs" color="orange.500">Save at least one product in the price list first — a scheme gives a discount on the booking rate.</Text>}
      </HStack>
      <DataTable
        rows={season.schemes || []}
        emptyText="No scheme for this season."
        columns={[
          { key: "name", label: "Scheme", render: (s) => <Box><Text fontWeight="700">{s.name}</Text><Text fontSize="xs" color="gray.500">{SCHEME_TYPES[s.scheme_type]}</Text></Box> },
          { key: "scope", label: "Applies to", render: scope },
          {
            key: "cond",
            label: "Condition",
            render: (s) => (s.scheme_type === "QUANTITY_SLAB" ? `From ${qty(s.min_qty)} units` : s.scheme_type === "ADVANCE_PAYMENT" ? `${s.min_advance_pct}% paid by ${fmtDate(s.valid_till)}` : `Booked by ${fmtDate(s.valid_till)}`),
          },
          { key: "discount_value", label: "Discount", render: (s) => (s.discount_type === "PERCENT" ? `${s.discount_value}%` : `${money(s.discount_value)} / unit`) },
          { key: "is_active", label: "Status", render: (s) => (s.is_active ? <AbsBadge status="OPEN" label="Active" /> : <AbsBadge status="CLOSED" />) },
          { key: "x", label: "", render: (s) => <HStack><Button size="xs" variant="outline" isDisabled={locked} onClick={() => setEdit(s)}>Edit</Button>{s.is_active ? <Button size="xs" variant="ghost" colorScheme="red" onClick={() => off(s)}>Switch off</Button> : null}</HStack> },
        ]}
      />
      {edit && <SchemeModal season={season} scheme={edit.id ? edit : null} onClose={() => setEdit(null)} onSaved={onSaved} />}
    </Box>
  );
};

// ----------------------------------------------------------------- seasons tab
const Seasons = ({ masters, reloadMasters }) => {
  const notify = useAbsToast();
  const [confirm, confirmDialog] = useConfirm();
  const [list, setList] = useState(null);
  const [selId, setSelId] = useState(null);
  const [sel, setSel] = useState(null);
  const [edit, setEdit] = useState(null);
  const [error, setError] = useState(null);

  const loadList = useCallback(async () => {
    try {
      const rows = await absApi.seasons();
      setList(rows);
      setSelId((cur) => cur || (rows[0] && rows[0].id) || null);
    } catch (err) {
      setError(apiError(err));
    }
  }, []);
  const loadSel = useCallback(async () => {
    if (!selId) return setSel(null);
    try {
      setSel(await absApi.season(selId));
    } catch (err) {
      setError(apiError(err));
    }
  }, [selId]);
  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { loadSel(); }, [loadSel]);
  const refresh = () => { loadList(); loadSel(); reloadMasters(); };

  const status = async (s, to) => {
    const text = {
      OPEN: `Open ${s.name}? Field staff can book from ${fmtDate(s.booking_start)} to ${fmtDate(s.booking_end)}.`,
      CLOSED: `Close ${s.name}? No new bookings; existing bookings carry on to payment and dispatch.`,
      DRAFT: `Move ${s.name} back to draft? Field staff will not see it.`,
      COMPLETED: `Mark ${s.name} completed? Every booking is settled; the season becomes read-only.`,
    }[to];
    if (!(await confirm("Season status", text, { yes: "Yes", danger: to === "CLOSED" }))) return;
    try {
      notify.ok((await absApi.seasonStatus(s.id, to)).message);
      refresh();
    } catch (err) {
      notify.fail(err);
    }
  };

  const summary = useMemo(() => (sel ? `${sel.product_count} product(s) of ${sel.crop_count} crop(s) · ${sel.schemes.length} scheme(s)` : ""), [sel]);

  if (error) return <ErrorBox message={error} onRetry={() => { setError(null); loadList(); }} />;
  if (!list) return <Loading />;
  return (
    <Box>
      {confirmDialog}
      <Button size="sm" colorScheme="teal" mb={3} onClick={() => setEdit({})}>New season</Button>
      <DataTable
        rows={list}
        onRowClick={(s) => setSelId(s.id)}
        emptyText="No booking season yet."
        columns={[
          { key: "name", label: "Season", render: (s) => <Box><Text fontWeight={s.id === selId ? "800" : "600"} color={s.id === selId ? "teal.600" : undefined}>{s.name}</Text><Text fontSize="xs" color="gray.500">{s.season}{s.financial_year ? ` · ${s.financial_year}` : ""}</Text></Box> },
          { key: "booking_start", label: "Booking window", render: (s) => `${fmtDate(s.booking_start)} – ${fmtDate(s.booking_end)}` },
          { key: "delivery_start", label: "Delivery", render: (s) => (s.delivery_start ? `${fmtDate(s.delivery_start)} – ${fmtDate(s.delivery_end)}` : "—") },
          { key: "crop_count", label: "Crops", numeric: true },
          { key: "product_count", label: "Products", numeric: true },
          { key: "booking_count", label: "Bookings", numeric: true },
          { key: "status", label: "Status", render: (s) => <AbsBadge status={s.display_status || s.status} label={s.display_label} /> },
          { key: "x", label: "", render: (s) => <Button size="xs" variant="outline" isDisabled={s.status === "COMPLETED"} onClick={(e) => { e.stopPropagation(); setEdit(s); }}>Edit</Button> },
        ]}
      />
      {sel && (
        <Box mt={6} borderTop="1px solid" borderColor="gray.200" pt={4}>
          <Flex align="center" gap={2} mb={1} wrap="wrap"><Text fontWeight="800">{sel.name}</Text><AbsBadge status={sel.display_status} label={sel.display_label} /><Text fontSize="xs" color="gray.500">{sel.season} · {summary}</Text></Flex>
          <Tabs size="sm" colorScheme="teal" isLazy mt={3}>
            <TabList flexWrap="wrap">
              <Tab>Overview &amp; status</Tab>
              <Tab>1. Price list &amp; production plan</Tab>
              <Tab>2. Schemes</Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0}><SeasonOverview season={sel} onAction={(to) => status(sel, to)} /></TabPanel>
              <TabPanel px={0}><PriceList season={sel} onSaved={refresh} /></TabPanel>
              <TabPanel px={0}><Schemes season={sel} onSaved={loadSel} /></TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      )}
      {edit && <SeasonModal season={edit.id ? edit : null} masters={masters} onClose={() => setEdit(null)} onSaved={(s) => { if (s && s.id) setSelId(s.id); refresh(); }} />}
    </Box>
  );
};

const AbsSettings = () => {
  const { masters, error, reload } = useAbsMasters();
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  return (
    <Box>
      <PageTitle title="Advance Booking Settings" subtitle="Booking seasons (price list by crop, production plan, minimum advance, schemes) and the booking policy" />
      <Tabs size="sm" variant="soft-rounded" colorScheme="teal" isLazy>
        <TabList mb={3}><Tab>Seasons</Tab><Tab>Booking policy</Tab></TabList>
        <TabPanels>
          <TabPanel px={0}><Seasons masters={masters} reloadMasters={reload} /></TabPanel>
          <TabPanel px={0}><PolicyForm masters={masters} onSaved={reload} /></TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AbsSettings;
