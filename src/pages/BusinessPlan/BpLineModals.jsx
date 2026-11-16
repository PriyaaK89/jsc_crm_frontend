// Editors used on the plan detail page.
import React, { useEffect, useMemo, useState } from "react";
import { Alert, AlertIcon, Box, Button, Flex, FormControl,
  FormHelperText, FormLabel, IconButton, Input, InputGroup, 
  InputRightElement, Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalFooter, ModalHeader, ModalOverlay, NumberInput,
  NumberInputField, Select, SimpleGrid, Text, Textarea, } from "@chakra-ui/react";
import { CloseIcon, SearchIcon } from "@chakra-ui/icons";
import { bpApi } from "../../services/businessPlanApi";
import { InfoGrid, Loading, fmtDate, money, monthsBetween, useBpToast, useMasters } from "./bpShared";

const num = (v) => {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const Amount = ({ label, value, onChange, isRequired, helper, isDisabled }) => (
  <FormControl isRequired={isRequired}>
    <FormLabel fontSize="sm">{label}</FormLabel>
    <NumberInput size="sm" min={0} value={value} onChange={(s) => onChange(s)} isDisabled={isDisabled}>
      <NumberInputField />
    </NumberInput>
    {helper && <FormHelperText fontSize="xs">{helper}</FormHelperText>}
  </FormControl>
);

const Frame = ({ isOpen, onClose, title, children, footer, size = "2xl" }) => (
  <Modal isOpen={isOpen} onClose={onClose} size={size} scrollBehavior="inside">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader fontSize="md">{title}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>{children}</ModalBody>
      <ModalFooter gap={2}>{footer}</ModalFooter>
    </ModalContent>
  </Modal>
);

// searchable select backed by an API lookup
const LookupSelect = ({ label, placeholder, load, value, onChange, isRequired, labelOf = (o) => o.name, idOf = (o) => o.id }) => {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const run = async (q) => {
    setLoading(true);
    try {
      setOptions((await load(q)) || []);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormControl isRequired={isRequired}>
      <FormLabel fontSize="sm">{label}</FormLabel>
      <InputGroup size="sm" mb={2}>
        <Input
          placeholder="Type to search, then press Enter"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run(search.trim())}
        />
        <InputRightElement cursor="pointer" onClick={() => run(search.trim())}>
          <SearchIcon color="gray.400" />
        </InputRightElement>
      </InputGroup>
      <Select
        size="sm"
        placeholder={loading ? "Loading…" : placeholder}
        value={value ? String(value) : ""}
        onChange={(e) => {
          const o = options.find((x) => String(idOf(x)) === e.target.value);
          onChange(o || null);
        }}
      >
        {options.map((o) => (
          <option key={idOf(o)} value={idOf(o)}>
            {labelOf(o)}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};

/* ═══════════════════════════ DISTRIBUTOR ═══════════════════════════ */
export const DistributorModal = ({ isOpen, onClose, plan, line, onSaved }) => {
  const notify = useBpToast();
  const { masters, products } = useMasters();
  const [ledger, setLedger] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ stock_item_id: "", planned_qty: "", planned_value: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLedger(line ? { ledger_id: line.ledger_id, name: line.name } : null);
    setProfile(null);
    setForm({
      annual_target: line?.annual_target ?? "",
      seasonal_target: line?.seasonal_target ?? "",
      collection_target: line?.collection_target ?? "",
      seasonal_collection_target: line?.seasonal_collection_target ?? "",
      max_outstanding: line?.max_outstanding ?? "",
      expected_collection: line?.expected_collection ?? "",
    });
    setItems((line?.products || []).map((p) => ({ ...p })));
    setNewItem({ stock_item_id: "", planned_qty: "", planned_value: "" });
  }, [isOpen, line]);

  useEffect(() => {
    if (!isOpen || !ledger?.ledger_id) return;
    bpApi
      .distributorProfile(ledger.ledger_id, plan.start_date, plan.end_date)
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [isOpen, ledger, plan.start_date, plan.end_date]);

  const override = !!masters?.settings?.allow_allocation_override;
  const annual = num(form.annual_target);
  const plannedValue = items.reduce((s, i) => s + num(i.planned_value), 0);
  const prev = Number(profile?.previous_year_sales ?? line?.previous_year_sales ?? 0);
  // D1: the target this plan is measured on (same rule as the backend)
  const planMonths = monthsBetween(plan.start_date, plan.end_date);
  const annualColl = num(form.collection_target);
  const seasonSales = num(form.seasonal_target) > 0 ? num(form.seasonal_target) : Math.round(((annual * planMonths) / 12) * 100) / 100;
  const seasonColl = num(form.seasonal_collection_target) > 0 ? num(form.seasonal_collection_target) : Math.round(((annualColl * planMonths) / 12) * 100) / 100;

  const addItem = () => {
    if (!newItem.stock_item_id || num(newItem.planned_qty) <= 0) {
      notify.fail("Select a product and enter planned units");
      return;
    }
    const p = products.find((x) => String(x.id) === String(newItem.stock_item_id));
    setItems((list) => [
      ...list,
      { stock_item_id: Number(newItem.stock_item_id), name: p?.name, planned_qty: num(newItem.planned_qty), planned_value: num(newItem.planned_value) },
    ]);
    setNewItem({ stock_item_id: "", planned_qty: "", planned_value: "" });
  };

  const save = async () => {
    if (!ledger) return notify.fail("Select a distributor");
    if (annual <= 0) return notify.fail("Enter annual sales target");
    if (!override && num(form.seasonal_target) > annual) return notify.fail("Seasonal target cannot be more than the annual target");
    if (!override && annualColl > 0 && num(form.seasonal_collection_target) > annualColl) {
      return notify.fail("Seasonal collection target cannot be more than the annual collection target");
    }
    if (!override && plannedValue > annual) return notify.fail("Product planning value cannot be more than the annual target");
    const body = {
      ...(line ? {} : { ledger_id: ledger.ledger_id }),
      annual_target: annual,
      seasonal_target: num(form.seasonal_target),
      collection_target: annualColl,
      seasonal_collection_target: num(form.seasonal_collection_target),
      max_outstanding: num(form.max_outstanding),
      expected_collection: num(form.expected_collection),
      products: items.map((i) => ({ stock_item_id: i.stock_item_id, planned_qty: num(i.planned_qty), planned_value: num(i.planned_value) })),
    };
    setSaving(true);
    try {
      const res = await bpApi.saveLine(plan.id, "distributors", line?.id, body);
      // a shared distributor in another overlapping plan is a warning, not an error (D2)
      if (res.data?.overlap_warnings?.length) notify.warn(res.message);
      else notify.ok(res.message || "Distributor plan saved");
      onSaved();
      onClose();
    } catch (err) {
      notify.fail(err, "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const available = products.filter((p) => !items.some((i) => String(i.stock_item_id) === String(p.id)));
  const setF = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Frame
      isOpen={isOpen}
      onClose={onClose}
      title={line ? `Distributor Plan — ${line.name}` : "Add Distributor"}
      footer={
        <>
          <Button size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" colorScheme="teal" onClick={save} isLoading={saving}>Save Distributor Plan</Button>
        </>
      }
    >
      {!line ? (
        <LookupSelect
          label="Distributor"
          placeholder="Select distributor"
          isRequired
          load={(q) => bpApi.distributors(q)}
          idOf={(o) => o.ledger_id}
          labelOf={(o) => `${o.name}${o.location || o.district ? ` — ${o.location || o.district}` : ""}`}
          value={ledger?.ledger_id}
          onChange={(o) => setLedger(o)}
        />
      ) : null}
      {profile && (
        <Box bg="green.50" borderRadius="10px" p={3} my={3}>
          <Text fontSize="xs" fontWeight="700" color="green.700" mb={2}>
            Auto-fetched from Distributor Master
          </Text>
          <InfoGrid
            columns={{ base: 1, md: 2 }}
            items={[
              ["Contact", profile.contact || "—"],
              ["Existing Outstanding", money(profile.existing_outstanding)],
              ["Credit Limit", money(profile.credit_limit)],
              ["Previous Year Sales", money(profile.previous_year_sales)],
              ["Last Order Date", profile.last_order_date ? fmtDate(profile.last_order_date) : "—"],
              ["Status", profile.status],
            ]}
          />
        </Box>
      )}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mt={3}>
        <Amount label="Annual Sales Target (₹)" isRequired value={form.annual_target} onChange={setF("annual_target")} />
        <Amount label="Seasonal Sales Target (₹)" value={form.seasonal_target} onChange={setF("seasonal_target")} />
        <Amount label="Annual Collection Target (₹)" value={form.collection_target} onChange={setF("collection_target")} />
        <Amount label="Seasonal Collection Target (₹)" value={form.seasonal_collection_target} onChange={setF("seasonal_collection_target")} />
        <Amount label="Max Allowed Outstanding (₹)" value={form.max_outstanding} onChange={setF("max_outstanding")} />
        <Amount label="Expected Collection (₹)" value={form.expected_collection} onChange={setF("expected_collection")} />
      </SimpleGrid>
      {annual > 0 && (
        <Box bg="gray.50" borderRadius="10px" p={3} mt={3} fontSize="sm">
          <Text fontWeight="700" mb={1}>Target of this plan ({planMonths} month{planMonths === 1 ? "" : "s"})</Text>
          <Text>
            Sales: {money(seasonSales)}{" "}
            <Text as="span" color="gray.500" fontSize="xs">
              {num(form.seasonal_target) > 0 ? "(seasonal target)" : `(annual ${money(annual)} × ${planMonths} ÷ 12)`}
            </Text>
          </Text>
          <Text>
            Collection: {money(seasonColl)}{" "}
            <Text as="span" color="gray.500" fontSize="xs">
              {num(form.seasonal_collection_target) > 0 ? "(seasonal collection target)" : `(annual ${money(annualColl)} × ${planMonths} ÷ 12)`}
            </Text>
          </Text>
          <Text color="gray.500" fontSize="xs" mt={1}>Monthly default = season target ÷ {planMonths}. Months you change by hand are kept.</Text>
        </Box>
      )}
      {annual > 0 && prev > 0 && (
        <Alert status="success" borderRadius="10px" mt={3} fontSize="sm">
          <AlertIcon />
          Previous: {money(prev)} → Plan: {money(annual)} → Growth: {Math.round((annual / prev - 1) * 100)}%
        </Alert>
      )}

      <Text fontWeight="700" fontSize="sm" mt={5} mb={2}>
        Product Planning
      </Text>
      {items.map((i, idx) => (
        <Flex key={i.stock_item_id} align="center" gap={2} mb={2} bg="gray.50" borderRadius="8px" px={3} py={2}>
          <Text flex="1" fontSize="sm" fontWeight="600">{i.name}</Text>
          <Text fontSize="sm">{i.planned_qty} units</Text>
          <Text fontSize="sm" color="gray.500">{num(i.planned_value) ? money(i.planned_value) : ""}</Text>
          <IconButton size="xs" aria-label="Remove" icon={<CloseIcon />} onClick={() => setItems((l) => l.filter((_, j) => j !== idx))} />
        </Flex>
      ))}
      <Flex gap={2} wrap="wrap" align="flex-end">
        <Select size="sm" flex="2" minW="180px" placeholder="Add product" value={newItem.stock_item_id} onChange={(e) => setNewItem((n) => ({ ...n, stock_item_id: e.target.value }))}>
          {available.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
        <Input size="sm" flex="1" minW="90px" type="number" placeholder="Units" value={newItem.planned_qty} onChange={(e) => setNewItem((n) => ({ ...n, planned_qty: e.target.value }))} />
        <Input size="sm" flex="1" minW="110px" type="number" placeholder="Value ₹ (optional)" value={newItem.planned_value} onChange={(e) => setNewItem((n) => ({ ...n, planned_value: e.target.value }))} />
        <Button size="sm" onClick={addItem}>Add</Button>
      </Flex>
      {!override && plannedValue > annual && annual > 0 && (
        <Text color="red.500" fontSize="xs" mt={2}>Product planning value ({money(plannedValue)}) is more than the annual target.</Text>
      )}
    </Frame>
  );
};

/* ═══════════════════════════ RETAILER ═══════════════════════════ */
const CATEGORIES = [["A", "A"], ["B", "B"], ["C", "C"], ["POTENTIAL", "Potential Retailer"], ["NEW", "New Retailer"]];
const FREQUENCIES = [["WEEKLY", "Weekly"], ["FORTNIGHTLY", "Fortnightly"], ["MONTHLY", "Monthly"]];

export const RetailerModal = ({ isOpen, onClose, plan, line, canEdit, onSaved }) => {
  const notify = useBpToast();
  const [retailer, setRetailer] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dists, setDists] = useState([]);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const activeOnly = !canEdit && plan.status === "ACTIVE";

  useEffect(() => {
    if (!isOpen) return;
    setRetailer(line ? { id: line.retailer_id, name: line.name } : null);
    setProfile(null);
    setForm({
      parent_ledger_id: line?.parent_ledger_id ? String(line.parent_ledger_id) : "",
      category: line?.category || "C",
      sales_target: line?.sales_target ?? "",
      visit_frequency: line?.visit_frequency || "WEEKLY",
      reported_actual: line?.reported_actual ?? "",
    });
    bpApi.distributors("").then((d) => setDists(d || [])).catch(() => setDists([]));
  }, [isOpen, line]);

  useEffect(() => {
    if (!isOpen || !retailer?.id) return;
    bpApi
      .retailerProfile(retailer.id)
      .then((p) => {
        setProfile(p);
        if (p?.parent_distributor) {
          setDists((d) => (d.some((x) => x.ledger_id === p.parent_distributor.ledger_id) ? d : [...d, { ledger_id: p.parent_distributor.ledger_id, name: p.parent_distributor.name }]));
          setForm((f) => (f.parent_ledger_id ? f : { ...f, parent_ledger_id: String(p.parent_distributor.ledger_id) }));
        }
      })
      .catch(() => setProfile(null));
  }, [isOpen, retailer]);

  const save = async () => {
    let body;
    if (activeOnly) {
      if (form.reported_actual === "" || num(form.reported_actual) < 0) return notify.fail("Enter the actual business");
      body = { reported_actual: num(form.reported_actual) };
    } else {
      if (!retailer) return notify.fail("Select a retailer");
      if (num(form.sales_target) <= 0) return notify.fail("Enter sales target");
      body = {
        ...(line ? {} : { retailer_id: retailer.id }),
        parent_ledger_id: form.parent_ledger_id ? Number(form.parent_ledger_id) : null,
        category: form.category,
        sales_target: num(form.sales_target),
        visit_frequency: form.visit_frequency,
      };
    }
    setSaving(true);
    try {
      const res = await bpApi.saveLine(plan.id, "retailers", line?.id, body);
      notify.ok(res.message || "Retailer plan saved");
      onSaved();
      onClose();
    } catch (err) {
      notify.fail(err, "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  return (
    <Frame
      isOpen={isOpen}
      onClose={onClose}
      title={line ? `Retailer Plan — ${line.name}` : "Add Retailer"}
      footer={
        <>
          <Button size="sm" onClick={onClose}>Cancel</Button>
          {(canEdit || activeOnly) && (
            <Button size="sm" colorScheme="teal" onClick={save} isLoading={saving}>
              {activeOnly ? "Save Actual Business" : "Save Retailer Plan"}
            </Button>
          )}
        </>
      }
    >
      {!line && (
        <LookupSelect
          label="Retailer"
          placeholder="Select retailer"
          isRequired
          load={(q) => bpApi.retailers(q)}
          labelOf={(o) => `${o.name}${o.area ? ` — ${o.area}` : ""}`}
          value={retailer?.id}
          onChange={(o) => setRetailer(o)}
        />
      )}
      {profile && (
        <Box bg="gray.50" borderRadius="10px" p={3} my={3}>
          <InfoGrid
            columns={{ base: 1, md: 2 }}
            items={[
              ["Contact", profile.contact || "—"],
              ["Previous Business", money(profile.previous_business)],
              ["Source", profile.previous_business_source],
              ["Current Status", profile.current_status],
            ]}
          />
        </Box>
      )}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mt={3}>
        <FormControl>
          <FormLabel fontSize="sm">Parent Distributor</FormLabel>
          <Select size="sm" placeholder="None" value={form.parent_ledger_id} onChange={setF("parent_ledger_id")} isDisabled={!canEdit}>
            {dists.map((d) => (
              <option key={d.ledger_id} value={d.ledger_id}>{d.name}</option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">Category</FormLabel>
          <Select size="sm" value={form.category} onChange={setF("category")} isDisabled={!canEdit}>
            {CATEGORIES.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Select>
        </FormControl>
        <Amount label="Sales Target (₹)" isRequired value={form.sales_target} onChange={setF("sales_target")} isDisabled={!canEdit} />
        <FormControl>
          <FormLabel fontSize="sm">Visit Frequency</FormLabel>
          <Select size="sm" value={form.visit_frequency} onChange={setF("visit_frequency")} isDisabled={!canEdit}>
            {FREQUENCIES.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Select>
        </FormControl>
        {activeOnly && (
          <Amount
            label="Actual Business (reported, ₹)"
            value={form.reported_actual}
            onChange={setF("reported_actual")}
            helper="Retailers have no ledger, so their business is reported."
          />
        )}
      </SimpleGrid>
    </Frame>
  );
};

/* ═══════════════════════════ PRODUCT ═══════════════════════════ */
export const ProductModal = ({ isOpen, onClose, plan, line, onSaved }) => {
  const notify = useBpToast();
  const { masters, products } = useMasters();
  const [form, setForm] = useState({});
  const [alloc, setAlloc] = useState([]);
  const [newState, setNewState] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      stock_item_id: line?.stock_item_id ? String(line.stock_item_id) : "",
      qty_target: line?.qty_target ?? "",
      value_target: line?.value_target ?? "",
      prev_year_qty: line?.prev_year_qty ?? "",
      prev_year_value: line?.prev_year_value ?? "",
    });
    setAlloc(
      line
        ? (line.allocations || []).map((a) => ({ state_id: a.state_id, state_name: a.state_name, qty: a.qty }))
        : plan.state_id
          ? [{ state_id: plan.state_id, state_name: plan.state_name, qty: "" }]
          : [],
    );
    setNewState("");
  }, [isOpen, line, plan.state_id, plan.state_name]);

  const override = !!masters?.settings?.allow_allocation_override;
  const target = num(form.qty_target);
  const allocated = alloc.reduce((s, a) => s + num(a.qty), 0);
  const states = masters?.states || [];
  const remaining = states.filter((s) => !alloc.some((a) => a.state_id === s.id));
  const setF = (k) => (v) => setForm((f) => ({ ...f, [k]: v?.target ? v.target.value : v }));

  const save = async () => {
    if (!form.stock_item_id) return notify.fail("Select a product");
    if (target <= 0 || num(form.value_target) <= 0) return notify.fail("Enter both quantity and value targets");
    if (!override && allocated > target) return notify.fail(`State allocation (${allocated}) exceeds product target (${target})`);
    const body = {
      ...(line ? {} : { stock_item_id: Number(form.stock_item_id) }),
      qty_target: target,
      value_target: num(form.value_target),
      prev_year_qty: num(form.prev_year_qty),
      prev_year_value: num(form.prev_year_value),
      allocations: alloc.map((a) => ({ state_id: a.state_id, qty: num(a.qty) })),
    };
    setSaving(true);
    try {
      const res = await bpApi.saveLine(plan.id, "products", line?.id, body);
      notify.ok(res.message || "Product target saved");
      onSaved();
      onClose();
    } catch (err) {
      notify.fail(err, "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Frame
      isOpen={isOpen}
      onClose={onClose}
      title={line ? `Product Target — ${line.name}` : "Add Product Target"}
      footer={
        <>
          <Button size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" colorScheme="teal" onClick={save} isLoading={saving}>Save Product Target</Button>
        </>
      }
    >
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
        <FormControl isRequired gridColumn={{ md: "span 2" }}>
          <FormLabel fontSize="sm">Product</FormLabel>
          <Select size="sm" placeholder="Select product" value={form.stock_item_id} onChange={setF("stock_item_id")} isDisabled={!!line}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.category ? `${p.name} — ${p.category}` : p.name}</option>
            ))}
          </Select>
        </FormControl>
        <Amount label="Sales Qty Target" isRequired value={form.qty_target} onChange={setF("qty_target")} />
        <Amount label="Sales Value Target (₹)" isRequired value={form.value_target} onChange={setF("value_target")} />
        <Amount label="Previous Year Qty" value={form.prev_year_qty} onChange={setF("prev_year_qty")} />
        <Amount label="Previous Year Value (₹)" value={form.prev_year_value} onChange={setF("prev_year_value")} />
      </SimpleGrid>
      <Text fontWeight="700" fontSize="sm" mt={5} mb={1}>
        Allocate Across States (Rule: child ≤ parent)
      </Text>
      <Text fontSize="xs" color={!override && allocated > target ? "red.500" : "gray.500"} mb={2}>
        Allocated {allocated} of {target || 0}
        {override ? " · override allowed in Settings" : ""}
      </Text>
      {alloc.map((a, idx) => (
        <Flex key={a.state_id} gap={2} align="center" mb={2}>
          <Text flex="1" fontSize="sm" fontWeight="600">{a.state_name || states.find((s) => s.id === a.state_id)?.name}</Text>
          <Input
            size="sm"
            w="140px"
            type="number"
            placeholder="Qty"
            value={a.qty}
            onChange={(e) => setAlloc((l) => l.map((x, j) => (j === idx ? { ...x, qty: e.target.value } : x)))}
          />
          <IconButton size="xs" aria-label="Remove state" icon={<CloseIcon />} onClick={() => setAlloc((l) => l.filter((_, j) => j !== idx))} />
        </Flex>
      ))}
      <Flex gap={2}>
        <Select size="sm" placeholder="+ Add state" value={newState} onChange={(e) => setNewState(e.target.value)}>
          {remaining.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
        <Button
          size="sm"
          isDisabled={!newState}
          onClick={() => {
            const s = states.find((x) => String(x.id) === newState);
            if (s) setAlloc((l) => [...l, { state_id: s.id, state_name: s.name, qty: "" }]);
            setNewState("");
          }}
        >
          Add
        </Button>
      </Flex>
    </Frame>
  );
};

/* ═══════════════════════════ CORRECTIVE ACTION ═══════════════════════════ */
export const CorrectiveModal = ({ isOpen, onClose, plan, action, distributors = [], presetLineId, onSaved }) => {
  const notify = useBpToast();
  const { masters } = useMasters();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      distributor_line_id: action?.distributor_line_id ? String(action.distributor_line_id) : presetLineId ? String(presetLineId) : "",
      reason: action?.reason || "",
      action_required: action?.action_required || "",
      responsible_user_id: action?.responsible_user_id ? String(action.responsible_user_id) : plan.assigned_user_id ? String(plan.assigned_user_id) : "",
      due_date: action?.due_date || "",
      priority: action?.priority || "MEDIUM",
      manager_comment: action?.manager_comment || "",
      follow_up_date: action?.follow_up_date || "",
      status: action?.status || "OPEN",
    });
  }, [isOpen, action, presetLineId, plan.assigned_user_id]);

  const reasons = useMemo(() => {
    const list = [...(masters?.gap_reasons || [])];
    if (form.reason && !list.includes(form.reason)) list.push(form.reason);
    return list;
  }, [masters, form.reason]);

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.reason) return notify.fail("Select a reason for the gap");
    if (!form.action_required.trim()) return notify.fail("Describe the corrective action");
    const body = {
      distributor_line_id: form.distributor_line_id ? Number(form.distributor_line_id) : null,
      reason: form.reason,
      action_required: form.action_required.trim(),
      responsible_user_id: form.responsible_user_id ? Number(form.responsible_user_id) : null,
      due_date: form.due_date || null,
      priority: form.priority,
      manager_comment: form.manager_comment.trim(),
      follow_up_date: form.follow_up_date || null,
      ...(action ? { status: form.status } : {}),
    };
    setSaving(true);
    try {
      const res = await bpApi.saveLine(plan.id, "corrective-actions", action?.id, body);
      notify.ok(res.message || "Corrective action saved");
      onSaved();
      onClose();
    } catch (err) {
      notify.fail(err, "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Frame
      isOpen={isOpen}
      onClose={onClose}
      title={action ? "Edit Corrective Action" : "Log Gap & Corrective Action"}
      footer={
        <>
          <Button size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" colorScheme="teal" onClick={save} isLoading={saving}>Save Corrective Action</Button>
        </>
      }
    >
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
        <FormControl>
          <FormLabel fontSize="sm">Scope</FormLabel>
          <Select size="sm" value={form.distributor_line_id} onChange={setF("distributor_line_id")}>
            <option value="">General</option>
            {distributors.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
        </FormControl>
        <FormControl isRequired>
          <FormLabel fontSize="sm">Reason for Gap</FormLabel>
          <Select size="sm" placeholder="Select reason" value={form.reason} onChange={setF("reason")}>
            {reasons.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
        </FormControl>
        <FormControl isRequired gridColumn={{ md: "span 2" }}>
          <FormLabel fontSize="sm">Action Required</FormLabel>
          <Textarea size="sm" rows={2} maxLength={1000} value={form.action_required} onChange={setF("action_required")} />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">Responsible Person</FormLabel>
          <Select size="sm" placeholder="Select" value={form.responsible_user_id} onChange={setF("responsible_user_id")}>
            {(masters?.employees || []).map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">Priority</FormLabel>
          <Select size="sm" value={form.priority} onChange={setF("priority")}>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">Due Date</FormLabel>
          <Input size="sm" type="date" value={form.due_date} onChange={setF("due_date")} />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">Follow-up Date</FormLabel>
          <Input size="sm" type="date" value={form.follow_up_date} onChange={setF("follow_up_date")} />
        </FormControl>
        {action && (
          <FormControl>
            <FormLabel fontSize="sm">Status</FormLabel>
            <Select size="sm" value={form.status} onChange={setF("status")}>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CLOSED">Closed</option>
            </Select>
          </FormControl>
        )}
        <FormControl gridColumn={{ md: "span 2" }}>
          <FormLabel fontSize="sm">Manager Comment (optional)</FormLabel>
          <Textarea size="sm" rows={2} maxLength={1000} value={form.manager_comment} onChange={setF("manager_comment")} />
        </FormControl>
      </SimpleGrid>
    </Frame>
  );
};

/* ═══════════════════════════ DEVELOPMENT (overview "Edit") ═══════════════════════════ */
export const DevelopmentModal = ({ isOpen, onClose, plan, overview, onSaved }) => {
  const notify = useBpToast();
  const active = plan.status === "ACTIVE";
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const nd = overview?.new_distributor_acquisition || {};
    const nr = overview?.new_retailer_development || {};
    setForm({
      new_distributor_target: nd.target ?? 0,
      acquisition_target: nr.acquisition_target ?? 0,
      contacted: nr.contacted ?? 0,
      qualified: nr.qualified ?? 0,
      onboarded: nr.onboarded ?? 0,
      ordered: nr.ordered ?? 0,
      expected_business: nr.expected_business ?? 0,
    });
  }, [isOpen, overview]);

  const setF = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    const counts = ["contacted", "qualified", "onboarded", "ordered"].map((k) => num(form[k]));
    if (!(counts[0] >= counts[1] && counts[1] >= counts[2] && counts[2] >= counts[3])) {
      return notify.fail("Funnel counts must go down in order: Contacted ≥ Qualified ≥ Onboarded ≥ Ordered");
    }
    const body = {
      contacted: counts[0],
      qualified: counts[1],
      onboarded: counts[2],
      ordered: counts[3],
      ...(active
        ? {}
        : {
            new_distributor_target: Math.round(num(form.new_distributor_target)),
            acquisition_target: Math.round(num(form.acquisition_target)),
            expected_business: num(form.expected_business),
          }),
    };
    setSaving(true);
    try {
      const res = await bpApi.updateDevelopment(plan.id, body);
      notify.ok(res.message || "Saved");
      onSaved();
      onClose();
    } catch (err) {
      notify.fail(err, "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Frame
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={active ? "Update Development Progress" : "Development Targets"}
      footer={
        <>
          <Button size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" colorScheme="teal" onClick={save} isLoading={saving}>Save</Button>
        </>
      }
    >
      {active && (
        <Alert status="info" borderRadius="10px" mb={3} fontSize="sm">
          <AlertIcon />
          The plan is Active: targets are locked, only progress counts can change.
        </Alert>
      )}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
        <Amount label="New Distributor Target" value={form.new_distributor_target} onChange={setF("new_distributor_target")} isDisabled={active} />
        <Amount label="Retailer Acquisition Target" value={form.acquisition_target} onChange={setF("acquisition_target")} isDisabled={active} />
        <Amount label="Contacted" value={form.contacted} onChange={setF("contacted")} />
        <Amount label="Qualified" value={form.qualified} onChange={setF("qualified")} />
        <Amount label="Onboarded" value={form.onboarded} onChange={setF("onboarded")} />
        <Amount label="Ordered (Productive)" value={form.ordered} onChange={setF("ordered")} />
        <Amount label="Expected Business (₹)" value={form.expected_business} onChange={setF("expected_business")} isDisabled={active} />
      </SimpleGrid>
    </Frame>
  );
};

/* ═══════════════════════════ ONE MONTH (monthly plan) ═══════════════════════════ */
export const MonthModal = ({ isOpen, onClose, plan, group, row, onSaved }) => {
  const notify = useBpToast();
  const [sales, setSales] = useState("");
  const [coll, setColl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !row) return;
    setSales(row.sales_target ?? "");
    setColl(row.collection_target ?? "");
  }, [isOpen, row]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await bpApi.saveMonthly(plan.id, [
        { distributor_line_id: group.distributor_line_id, month: row.month, sales_target: num(sales), collection_target: num(coll) },
      ]);
      notify.ok(res.message || "Monthly plan saved");
      onSaved(res.data);
      onClose();
    } catch (err) {
      notify.fail(err, "Could not save");
    } finally {
      setSaving(false);
    }
  };

  if (!row) return null;
  return (
    <Frame
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={`${group?.name} — ${row.label}`}
      footer={
        <>
          <Button size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" colorScheme="teal" onClick={save} isLoading={saving}>Save</Button>
        </>
      }
    >
      <SimpleGrid columns={1} spacing={3}>
        <Amount label="Sales Target (₹)" value={sales} onChange={setSales} />
        <Amount label="Collection Target (₹)" value={coll} onChange={setColl} />
      </SimpleGrid>
    </Frame>
  );
};

/* ═══════════════════════════ ABS MONTH (plan level; only when ABS is installed) ═══════════════════════════ */
export const AbsMonthModal = ({ isOpen, onClose, plan, row, onSaved }) => {
  const notify = useBpToast();
  const [booking, setBooking] = useState("");
  const [advance, setAdvance] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !row) return;
    setBooking(row.abs_booking_target ?? "");
    setAdvance(row.abs_advance_target ?? "");
  }, [isOpen, row]);

  const save = async (useDefault) => {
    if (!useDefault && num(advance) > num(booking)) {
      notify.fail("ABS advance target cannot be more than the ABS booking target");
      return;
    }
    setSaving(true);
    try {
      const res = await bpApi.saveMonthly(plan.id, [
        useDefault
          ? { month: row.month, abs_booking_target: null, abs_advance_target: null }
          : { month: row.month, abs_booking_target: num(booking), abs_advance_target: num(advance) },
      ]);
      notify.ok(res.message || "Monthly plan saved");
      onSaved(res.data);
      onClose();
    } catch (err) {
      notify.fail(err, "Could not save");
    } finally {
      setSaving(false);
    }
  };

  if (!row) return null;
  return (
    <Frame
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={`ABS targets — ${row.label}`}
      footer={
        <>
          <Button size="sm" onClick={onClose}>Cancel</Button>
          {row.abs_custom && <Button size="sm" variant="outline" onClick={() => save(true)} isLoading={saving}>Use default split</Button>}
          <Button size="sm" colorScheme="teal" onClick={() => save(false)} isLoading={saving}>Save</Button>
        </>
      }
    >
      <SimpleGrid columns={1} spacing={3}>
        <Amount label="ABS Booking Target (₹)" value={booking} onChange={setBooking} />
        <Amount label="ABS Advance Target (₹)" value={advance} onChange={setAdvance} helper="Advances are receipts: they are counted inside collection once." />
      </SimpleGrid>
    </Frame>
  );
};

export { Loading };
