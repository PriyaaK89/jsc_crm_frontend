// Advance Booking → Settings (MANAGE_ABS_SETTINGS): booking policy, booking seasons,
// the season's booking price list (variety-wise rate, MRP, min / max qty, production plan)
// and the early-booking / quantity / advance-payment schemes.
import React, { useCallback, useEffect, useState } from "react";
import {
  Box, Button, Checkbox, Flex, FormControl, FormHelperText, FormLabel, HStack, Input, Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalFooter, ModalHeader, ModalOverlay, Select, SimpleGrid, Switch, Tab, TabList, TabPanel, TabPanels, Tabs, Table, Tbody, Td, Text, Th, Thead, Tr,
} from "@chakra-ui/react";
import { absApi, apiError } from "../../services/absApi";
import { AbsBadge, DataTable, ErrorBox, Loading, PageTitle, fmtDate, money, qty, useAbsMasters, useAbsToast, useConfirm } from "./absShared";

const F = ({ label, help, children, isRequired }) => (
  <FormControl isRequired={isRequired}>
    <FormLabel fontSize="xs" mb={1}>{label}</FormLabel>
    {children}
    {help ? <FormHelperText fontSize="11px">{help}</FormHelperText> : null}
  </FormControl>
);
const blank = (v) => (v === null || v === undefined ? "" : String(v));

// ----------------------------------------------------------------- policy
const PolicyForm = ({ masters, onSaved }) => {
  const notify = useAbsToast();
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    absApi.settings().then((s) => setF(Object.fromEntries(Object.entries(s).map(([k, v]) => [k, k === "require_booking_approval" ? !!Number(v) : blank(v)])))).catch((e) => setError(apiError(e)));
  }, []);
  if (error) return <ErrorBox message={error} />;
  if (!f) return <Loading />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const save = async () => {
    setBusy(true);
    try {
      const keys = ["min_advance_pct", "advance_due_days", "require_booking_approval", "dispatch_payment_rule", "dispatch_min_paid_pct", "allocation_priority", "sales_ledger_id", "booking_prefix", "cancellation_refund_rule", "company_state_code"];
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
        <F label="Minimum advance % (default for seasons)" help="Advance required = booking value × this %."><Input size="sm" type="number" value={f.min_advance_pct} onChange={set("min_advance_pct")} /></F>
        <F label="Advance due in (days after confirmation)"><Input size="sm" type="number" value={f.advance_due_days} onChange={set("advance_due_days")} /></F>
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
        <F label="Advance of quantity not supplied / cancelled">
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
    min_advance_pct: blank(season?.min_advance_pct), remarks: blank(season?.remarks),
  }));
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async () => {
    setBusy(true);
    try {
      const res = await absApi.saveSeason(season?.id, { ...f, min_advance_pct: f.min_advance_pct === "" ? null : f.min_advance_pct, delivery_start: f.delivery_start || null, delivery_end: f.delivery_end || null });
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
          <SimpleGrid columns={2} spacing={3}>
            <F label="Name" isRequired><Input size="sm" placeholder="Kharif 2027 Advance Booking" value={f.name} onChange={set("name")} /></F>
            <F label="Crop season" isRequired>
              <Select size="sm" value={f.season} onChange={set("season")} placeholder="Select">
                {(masters ? masters.crop_seasons : []).map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </F>
            <F label="Booking opens" isRequired><Input size="sm" type="date" value={f.booking_start} onChange={set("booking_start")} /></F>
            <F label="Booking closes" isRequired><Input size="sm" type="date" value={f.booking_end} onChange={set("booking_end")} /></F>
            <F label="Delivery from"><Input size="sm" type="date" value={f.delivery_start} onChange={set("delivery_start")} /></F>
            <F label="Delivery till"><Input size="sm" type="date" value={f.delivery_end} onChange={set("delivery_end")} /></F>
            <F label="Financial year"><Input size="sm" placeholder="2026-27" value={f.financial_year} onChange={set("financial_year")} /></F>
            <F label="Minimum advance %" help="Blank = the default in Settings"><Input size="sm" type="number" value={f.min_advance_pct} onChange={set("min_advance_pct")} /></F>
          </SimpleGrid>
          <Box mt={3}><F label="Remarks"><Input size="sm" value={f.remarks} onChange={set("remarks")} /></F></Box>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" colorScheme="teal" isLoading={busy} onClick={save}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ----------------------------------------------------------------- price list
const PriceList = ({ season, onSaved }) => {
  const notify = useAbsToast();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [found, setFound] = useState([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setRows((season.products || []).map((p) => ({ ...p, booking_rate: blank(p.booking_rate), mrp: blank(p.mrp), min_qty: blank(p.min_qty), max_qty_per_party: blank(p.max_qty_per_party), production_qty: blank(p.production_qty), is_active: !!Number(p.is_active) })));
  }, [season]);
  useEffect(() => {
    if (search.trim().length < 2) return setFound([]);
    const t = setTimeout(() => absApi.stockItems(search.trim()).then(setFound).catch(() => setFound([])), 300);
    return () => clearTimeout(t);
  }, [search]);
  const add = (si) => {
    if (rows.some((r) => r.stock_item_id === si.id)) return notify.fail("This variety is already in the list");
    setRows([...rows, { stock_item_id: si.id, item_name: si.item_name, crop_name: si.crop_name, gst_percent: si.rate_of_duty, booking_rate: "", mrp: "", min_qty: "", max_qty_per_party: "", production_qty: "", is_active: true, booked_qty: 0, isNew: true }]);
    setSearch("");
    setFound([]);
  };
  const set = (i, k, v) => setRows(rows.map((r, n) => (n === i ? { ...r, [k]: v } : r)));
  const save = async () => {
    setBusy(true);
    try {
      const body = rows.map((r) => ({
        stock_item_id: r.stock_item_id, booking_rate: r.booking_rate, mrp: r.mrp === "" ? null : r.mrp, min_qty: r.min_qty === "" ? 0 : r.min_qty,
        max_qty_per_party: r.max_qty_per_party === "" ? null : r.max_qty_per_party, production_qty: r.production_qty === "" ? null : r.production_qty, is_active: r.is_active,
      }));
      notify.ok((await absApi.saveSeasonProducts(season.id, body)).message);
      onSaved();
    } catch (err) {
      notify.fail(err);
    } finally {
      setBusy(false);
    }
  };
  const cell = (i, k) => <Input size="xs" type="number" maxW="100px" value={rows[i][k]} onChange={(e) => set(i, k, e.target.value)} />;
  return (
    <Box>
      <Box position="relative" maxW="420px" mb={3}>
        <Input size="sm" placeholder="Add a variety — type 2+ letters of the stock item" value={search} onChange={(e) => setSearch(e.target.value)} />
        {found.length > 0 && (
          <Box position="absolute" zIndex={5} bg="white" borderWidth="1px" borderRadius="8px" w="100%" maxH="260px" overflowY="auto" boxShadow="md">
            {found.map((si) => (
              <Box key={si.id} px={3} py={2} fontSize="sm" cursor="pointer" _hover={{ bg: "teal.50" }} onClick={() => add(si)}>
                {si.item_name}{si.crop_name ? <Text as="span" color="gray.500"> · {si.crop_name}</Text> : null}
              </Box>
            ))}
          </Box>
        )}
      </Box>
      <Box overflowX="auto">
        <Table size="sm">
          <Thead><Tr><Th>Variety</Th><Th isNumeric>Booking rate *</Th><Th isNumeric>MRP</Th><Th isNumeric>Min qty</Th><Th isNumeric>Max / party</Th><Th isNumeric>Production plan</Th><Th isNumeric>Booked</Th><Th>Active</Th></Tr></Thead>
          <Tbody>
            {rows.length === 0 && <Tr><Td colSpan={8}><Text fontSize="sm" color="gray.500">No variety yet. Add the varieties offered for booking this season.</Text></Td></Tr>}
            {rows.map((r, i) => (
              <Tr key={r.stock_item_id}>
                <Td><Text fontSize="sm" fontWeight="600">{r.item_name}</Text><Text fontSize="xs" color="gray.500">{[r.crop_name, r.gst_percent !== undefined && r.gst_percent !== null ? `GST ${r.gst_percent}%` : null, r.unit].filter(Boolean).join(" · ")}</Text></Td>
                <Td isNumeric>{cell(i, "booking_rate")}</Td>
                <Td isNumeric>{cell(i, "mrp")}</Td>
                <Td isNumeric>{cell(i, "min_qty")}</Td>
                <Td isNumeric>{cell(i, "max_qty_per_party")}</Td>
                <Td isNumeric>{cell(i, "production_qty")}</Td>
                <Td isNumeric>{qty(r.booked_qty)}</Td>
                <Td><Checkbox isChecked={r.is_active} onChange={(e) => set(i, "is_active", e.target.checked)} /></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      <Text fontSize="11px" color="gray.500" mt={2}>Rates are per unit of the stock item, before GST. A variety that already has bookings cannot be removed — switch it off instead.</Text>
      <Button mt={3} size="sm" colorScheme="teal" isLoading={busy} isDisabled={!rows.length} onClick={save}>Save price list</Button>
    </Box>
  );
};

// ----------------------------------------------------------------- schemes
const SCHEME_TYPES = { EARLY_BOOKING: "Early booking", QUANTITY_SLAB: "Quantity slab", ADVANCE_PAYMENT: "Advance payment" };

const SchemeModal = ({ season, scheme, onClose, onSaved }) => {
  const notify = useAbsToast();
  const [f, setF] = useState(() => ({
    name: blank(scheme?.name), scheme_type: scheme?.scheme_type || "EARLY_BOOKING", stock_item_id: blank(scheme?.stock_item_id),
    valid_from: blank(scheme?.valid_from), valid_till: blank(scheme?.valid_till), min_qty: blank(scheme?.min_qty), min_advance_pct: blank(scheme?.min_advance_pct),
    discount_type: scheme?.discount_type || "PER_UNIT", discount_value: blank(scheme?.discount_value),
  }));
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async () => {
    setBusy(true);
    try {
      const body = { ...f, stock_item_id: f.stock_item_id ? Number(f.stock_item_id) : null, valid_from: f.valid_from || null, valid_till: f.valid_till || null, min_qty: f.min_qty || 0, min_advance_pct: f.min_advance_pct || 0 };
      notify.ok((await absApi.saveScheme(season.id, scheme?.id, body)).message);
      onSaved();
      onClose();
    } catch (err) {
      notify.fail(err);
    } finally {
      setBusy(false);
    }
  };
  const t = f.scheme_type;
  return (
    <Modal isOpen onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">{scheme ? "Edit scheme" : "New scheme"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SimpleGrid columns={2} spacing={3}>
            <F label="Scheme name" isRequired><Input size="sm" value={f.name} onChange={set("name")} /></F>
            <F label="Type">
              <Select size="sm" value={t} onChange={set("scheme_type")}>
                {Object.entries(SCHEME_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </F>
            <F label="Variety" help="Blank = all varieties of the season">
              <Select size="sm" value={f.stock_item_id} onChange={set("stock_item_id")} placeholder="All varieties">
                {(season.products || []).map((p) => <option key={p.stock_item_id} value={p.stock_item_id}>{p.item_name}</option>)}
              </Select>
            </F>
            <F label="Valid from"><Input size="sm" type="date" value={f.valid_from} onChange={set("valid_from")} /></F>
            <F label={t === "ADVANCE_PAYMENT" ? "Advance to be paid by" : t === "EARLY_BOOKING" ? "Booked on or before" : "Valid till"} isRequired={t !== "QUANTITY_SLAB"}>
              <Input size="sm" type="date" value={f.valid_till} onChange={set("valid_till")} />
            </F>
            {t === "QUANTITY_SLAB" && <F label="Line quantity from" isRequired><Input size="sm" type="number" value={f.min_qty} onChange={set("min_qty")} /></F>}
            {t === "ADVANCE_PAYMENT" && <F label="Advance % of booking value" isRequired><Input size="sm" type="number" value={f.min_advance_pct} onChange={set("min_advance_pct")} /></F>}
            <F label="Discount">
              <HStack>
                <Select size="sm" maxW="140px" value={f.discount_type} onChange={set("discount_type")}><option value="PER_UNIT">₹ per unit</option><option value="PERCENT">% of rate</option></Select>
                <Input size="sm" type="number" value={f.discount_value} onChange={set("discount_value")} />
              </HStack>
            </F>
          </SimpleGrid>
          <Text fontSize="11px" color="gray.500" mt={3}>The best scheme of each type applies to a line; different types add up. The discount reduces the rate before GST. The advance-payment scheme is given on the invoice when the advance was paid in time.</Text>
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
  const item = (id) => (season.products || []).find((p) => p.stock_item_id === id);
  return (
    <Box>
      {confirmDialog}
      <Button size="sm" colorScheme="teal" mb={3} onClick={() => setEdit({})} isDisabled={!(season.products || []).length}>Add scheme</Button>
      <DataTable
        rows={season.schemes || []}
        emptyText="No scheme for this season."
        columns={[
          { key: "name", label: "Scheme", render: (s) => <Box><Text fontWeight="700">{s.name}</Text><Text fontSize="xs" color="gray.500">{SCHEME_TYPES[s.scheme_type]}</Text></Box> },
          { key: "stock_item_id", label: "Variety", render: (s) => (s.stock_item_id ? (item(s.stock_item_id) || {}).item_name || s.stock_item_id : "All") },
          { key: "cond", label: "Condition", render: (s) => (s.scheme_type === "QUANTITY_SLAB" ? `Qty ≥ ${qty(s.min_qty)}` : s.scheme_type === "ADVANCE_PAYMENT" ? `${s.min_advance_pct}% paid by ${fmtDate(s.valid_till)}` : `Booked by ${fmtDate(s.valid_till)}`) },
          { key: "discount_value", label: "Discount", render: (s) => (s.discount_type === "PERCENT" ? `${s.discount_value}%` : `${money(s.discount_value)} / unit`) },
          { key: "is_active", label: "Status", render: (s) => (Number(s.is_active) ? <AbsBadge status="OPEN" label="Active" /> : <AbsBadge status="CLOSED" />) },
          { key: "x", label: "", render: (s) => <HStack><Button size="xs" variant="outline" onClick={() => setEdit(s)}>Edit</Button>{Number(s.is_active) ? <Button size="xs" variant="ghost" colorScheme="red" onClick={() => off(s)}>Switch off</Button> : null}</HStack> },
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
    const text = to === "OPEN" ? `Open ${s.name} for booking? Field staff can book from ${fmtDate(s.booking_start)} to ${fmtDate(s.booking_end)}.` : to === "CLOSED" ? `Close ${s.name}? No new bookings; existing bookings carry on to dispatch.` : `Move ${s.name} back to draft?`;
    if (!(await confirm("Season status", text, { yes: "Yes" }))) return;
    try {
      notify.ok((await absApi.seasonStatus(s.id, to)).message);
      refresh();
    } catch (err) {
      notify.fail(err);
    }
  };

  if (error) return <ErrorBox message={error} onRetry={loadList} />;
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
          { key: "product_count", label: "Varieties", numeric: true },
          { key: "booking_count", label: "Bookings", numeric: true },
          { key: "status", label: "Status", render: (s) => <AbsBadge status={s.status} /> },
          {
            key: "x",
            label: "",
            render: (s) => (
              <HStack onClick={(e) => e.stopPropagation()}>
                <Button size="xs" variant="outline" onClick={() => setEdit(s)}>Edit</Button>
                {s.status !== "OPEN" && <Button size="xs" colorScheme="green" onClick={() => status(s, "OPEN")}>Open</Button>}
                {s.status === "OPEN" && <Button size="xs" colorScheme="red" variant="outline" onClick={() => status(s, "CLOSED")}>Close</Button>}
                {s.status === "CLOSED" && !s.booking_count && <Button size="xs" variant="ghost" onClick={() => status(s, "DRAFT")}>Draft</Button>}
              </HStack>
            ),
          },
        ]}
      />
      {sel && (
        <Box mt={6} borderTop="1px solid" borderColor="gray.200" pt={4}>
          <Flex align="center" gap={2} mb={3}><Text fontWeight="800">{sel.name}</Text><AbsBadge status={sel.status} /></Flex>
          <Tabs size="sm" colorScheme="teal" isLazy>
            <TabList><Tab>Booking price list</Tab><Tab>Schemes</Tab></TabList>
            <TabPanels>
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
      <PageTitle title="Advance Booking Settings" subtitle="Booking policy, seasons, booking price list and schemes" />
      <Tabs size="sm" variant="soft-rounded" colorScheme="teal" isLazy>
        <TabList mb={3}><Tab>Seasons &amp; price list</Tab><Tab>Booking policy</Tab></TabList>
        <TabPanels>
          <TabPanel px={0}><Seasons masters={masters} reloadMasters={reload} /></TabPanel>
          <TabPanel px={0}><PolicyForm masters={masters} onSaved={reload} /></TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AbsSettings;
