// Business Plan → Settings → Territories (and Territory Managers)
//
// Who sees what (the server checks the same rules on every call):
//   - Admin / Super Admin: every state, plus the Territory Managers section
//   - MANAGE_BP_TERRITORIES + assigned state(s): manage territories of those states only
//   - MANAGE_BP_TERRITORIES without a state: read-only list + a notice
//   - everybody else never reaches this section (route + tab are hidden)
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Switch,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Tooltip,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { bpApi, apiError } from "../../services/businessPlanApi";
import { DataTable, ErrorBox, Loading, StatusBadge, fmtDateTime, refreshMasters, useBpToast, useConfirm, useMasters } from "./bpShared";

const Block = ({ title, subtitle, children, right }) => (
  <Box border="1px solid" borderColor="gray.100" borderRadius="12px" p={4} mb={4}>
    <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} mb={3} gap={2} direction={{ base: "column", md: "row" }}>
      <Box>
        <Text fontWeight="800" fontSize="sm">{title}</Text>
        {subtitle && <Text fontSize="xs" color="gray.500">{subtitle}</Text>}
      </Box>
      {right}
    </Flex>
    {children}
  </Box>
);

// small grey district names under a territory (same style as the plan form)
export const DistrictNames = ({ names, max = 12 }) => {
  const list = names || [];
  if (!list.length) return <Text fontSize="xs" color="gray.400">No districts</Text>;
  const shown = list.slice(0, max).join(", ");
  return (
    <Text fontSize="xs" color="gray.500" whiteSpace="normal">
      {shown}
      {list.length > max ? ` +${list.length - max} more` : ""}
    </Text>
  );
};

const districtName = (d) => d.district_name || d.district_name_english || d.name || `District #${d.id}`;

// ---------------------------------------------------------------------
//  create / edit a territory
// ---------------------------------------------------------------------
const TerritoryEditor = ({ isOpen, onClose, territory, access, allTerritories, onSaved }) => {
  const notify = useBpToast();
  const { masters } = useMasters();
  const [name, setName] = useState("");
  const [stateId, setStateId] = useState("");
  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = !!territory?.id;

  // states this user may manage (Admin / Super Admin: all)
  const stateOptions = useMemo(() => {
    const all = masters?.states || [];
    if (!access || access.can_manage_all_states) return all;
    const allowed = new Set((access.state_ids || []).map(String));
    return all.filter((s) => allowed.has(String(s.id)));
  }, [masters, access]);

  useEffect(() => {
    if (!isOpen) return;
    setName(territory?.name || "");
    setStateId(territory?.state_id ? String(territory.state_id) : stateOptions.length === 1 ? String(stateOptions[0].id) : "");
    setSelected((territory?.district_ids || []).map(String));
    setSearch("");
    setRemark("");
    setError(null);
  }, [isOpen, territory, stateOptions]);

  // districts of the state (existing geo API: GET /geo/districts?state_id=)
  useEffect(() => {
    if (!isOpen || !stateId) {
      setDistricts([]);
      return undefined;
    }
    let alive = true;
    setLoadingDistricts(true);
    API.get(API_ENDPOINTS.GEO_DISTRICTS, { params: { state_id: stateId } })
      .then((r) => alive && setDistricts((r?.data?.data || []).filter((d) => String(d.state_id ?? stateId) === String(stateId))))
      .catch(() => alive && setDistricts([]))
      .finally(() => alive && setLoadingDistricts(false));
    return () => {
      alive = false;
    };
  }, [isOpen, stateId]);

  // district id -> name of another ACTIVE territory of the state that has it
  const takenBy = useMemo(() => {
    const map = new Map();
    for (const t of allTerritories || []) {
      if (!t.is_active || String(t.state_id) !== String(stateId) || (territory && t.id === territory.id)) continue;
      for (const d of t.district_ids || []) map.set(String(d), t.name);
    }
    return map;
  }, [allTerritories, stateId, territory]);

  const original = useMemo(() => new Set((territory?.district_ids || []).map(String)), [territory]);
  const sameState = isEdit && String(territory.state_id) === String(stateId);
  // a district of another active territory can be selected only when this territory already had it
  // (existing overlap, kept) or when this territory is inactive (checked again on activation)
  const willBeActive = isEdit ? !!territory.is_active : true;
  const blocked = (id) => willBeActive && takenBy.has(id) && !(sameState && original.has(id));

  const filtered = districts.filter((d) => districtName(d).toLowerCase().includes(search.trim().toLowerCase()));
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const selectAll = () => {
    const add = filtered.map((d) => String(d.id)).filter((id) => !blocked(id));
    setSelected((s) => [...new Set([...s, ...add])]);
  };
  const clearAll = () => {
    const visible = new Set(filtered.map((d) => String(d.id)));
    setSelected((s) => (search.trim() ? s.filter((id) => !visible.has(id)) : []));
  };

  const save = async () => {
    setError(null);
    if (!name.trim()) return setError("Enter the territory name");
    if (!stateId) return setError("Select a state");
    if (!selected.length) return setError("Select at least one district");
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        state_id: Number(stateId),
        district_ids: selected.map(Number),
        ...(remark.trim() ? { remark: remark.trim() } : {}),
      };
      const res = isEdit
        ? await bpApi.updateTerritory(territory.id, { ...body, expected_version_no: territory.current_version_no })
        : await bpApi.createTerritory(body);
      if (res?.data?.overlap_warnings?.length) notify.warn(res.message);
      else notify.ok(res.message || "Territory saved");
      onSaved();
      onClose();
    } catch (err) {
      setError(apiError(err, "Could not save the territory"));
    } finally {
      setSaving(false);
    }
  };

  const stateLocked = isEdit && territory.plans_total > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">
          {isEdit ? `Edit Territory · version ${territory.current_version_no}` : "Create Territory"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {error && (
            <Alert status="error" borderRadius="md" mb={3} fontSize="sm">
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Territory Name</FormLabel>
              <Input size="sm" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm">State</FormLabel>
              <Select
                size="sm"
                placeholder="Select state"
                value={stateId}
                isDisabled={stateLocked}
                onChange={(e) => {
                  setStateId(e.target.value);
                  setSelected([]);
                  setSearch("");
                }}
              >
                {stateOptions.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
              {stateLocked && <FormHelperText fontSize="xs">Used by {territory.plans_total} plan(s): the state cannot change.</FormHelperText>}
            </FormControl>
          </SimpleGrid>

          {stateId && (
            <Box mt={4}>
              <Flex justify="space-between" align="center" mb={2} gap={2} wrap="wrap">
                <Text fontSize="sm" fontWeight="700">
                  Districts <Text as="span" color="gray.500" fontWeight="400">({selected.length} selected)</Text>
                </Text>
                <HStack>
                  <Button size="xs" variant="outline" onClick={selectAll} isDisabled={!filtered.length}>Select All</Button>
                  <Button size="xs" variant="ghost" onClick={clearAll} isDisabled={!selected.length}>Clear</Button>
                </HStack>
              </Flex>
              <InputGroup size="sm" mb={2}>
                <InputLeftElement pointerEvents="none"><SearchIcon color="gray.400" /></InputLeftElement>
                <Input placeholder="Search districts" value={search} onChange={(e) => setSearch(e.target.value)} />
              </InputGroup>
              {loadingDistricts ? (
                <Flex py={6} justify="center"><Spinner size="sm" /></Flex>
              ) : !districts.length ? (
                <Text fontSize="sm" color="gray.500">No districts found for this state.</Text>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={1} maxH="320px" overflowY="auto" border="1px solid" borderColor="gray.100" borderRadius="md" p={2}>
                  {filtered.map((d) => {
                    const id = String(d.id);
                    const owner = takenBy.get(id);
                    const isBlocked = blocked(id) && !selected.includes(id);
                    const kept = owner && !isBlocked && selected.includes(id) && sameState && original.has(id);
                    return (
                      <Tooltip key={id} label={owner ? `Also in active territory "${owner}"` : ""} isDisabled={!owner} hasArrow>
                        <Box>
                          <Checkbox size="sm" isChecked={selected.includes(id)} isDisabled={isBlocked} onChange={() => toggle(id)}>
                            <Text as="span" fontSize="sm">{districtName(d)}</Text>
                            {owner && (
                              <Text as="span" fontSize="10px" color={kept ? "orange.500" : "gray.400"} ml={1}>
                                ({kept ? "overlap kept" : `in ${owner}`})
                              </Text>
                            )}
                          </Checkbox>
                        </Box>
                      </Tooltip>
                    );
                  })}
                </SimpleGrid>
              )}
              <Text fontSize="xs" color="gray.500" mt={2}>
                A district can be in only one active territory of a state. Districts already in another active territory are
                greyed out; existing overlaps of this territory are kept.
              </Text>
            </Box>
          )}

          <FormControl mt={4}>
            <FormLabel fontSize="sm">Remark (optional, stored in the version history)</FormLabel>
            <Input size="sm" value={remark} onChange={(e) => setRemark(e.target.value)} maxLength={255} />
          </FormControl>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" colorScheme="teal" onClick={save} isLoading={saving}>
            {isEdit ? "Save (new version)" : "Create Territory"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------
//  version history
// ---------------------------------------------------------------------
const CHANGE_SCHEME = { BASELINE: "purple", CREATED: "teal", EDITED: "blue", ACTIVATED: "green", DEACTIVATED: "gray" };

const VersionsModal = ({ territory, onClose }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!territory) return;
    setData(null);
    setError(null);
    bpApi.territoryVersions(territory.id).then(setData).catch((err) => setError(apiError(err, "Could not load the history")));
  }, [territory]);
  return (
    <Modal isOpen={!!territory} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">Version history · {territory?.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {error ? (
            <ErrorBox message={error} />
          ) : !data ? (
            <Loading />
          ) : (
            <DataTable
              rows={data.versions}
              rowKey={(v) => v.version_no}
              emptyText="No versions recorded."
              columns={[
                { key: "version_no", label: "Version", render: (v) => <Text fontWeight="700">v{v.version_no}{v.version_no === data.territory.current_version_no ? " (current)" : ""}</Text> },
                { key: "change", label: "Change", render: (v) => <Badge colorScheme={CHANGE_SCHEME[v.change_type] || "gray"} fontSize="10px">{v.change_label}</Badge> },
                { key: "name", label: "Name / State", wrap: true, render: (v) => <Box><Text fontSize="sm">{v.name}</Text><Text fontSize="xs" color="gray.500">{v.state_name}</Text></Box> },
                { key: "districts", label: "Districts", wrap: true, render: (v) => <Box minW="220px"><Text fontSize="xs" fontWeight="700">{v.district_count}</Text><DistrictNames names={v.district_names} max={30} /></Box> },
                { key: "status", label: "Status", render: (v) => <StatusBadge status={v.is_active ? "ACTIVE" : "CLOSED"} label={v.is_active ? "Active" : "Inactive"} /> },
                { key: "by", label: "By / At", render: (v) => <Box><Text fontSize="sm">{v.changed_by_name || "—"}</Text><Text fontSize="xs" color="gray.500">{fmtDateTime(v.changed_at)}</Text></Box> },
                { key: "remark", label: "Remark", wrap: true, render: (v) => <Text fontSize="xs">{v.remark || "—"}</Text> },
              ]}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button size="sm" onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ---------------------------------------------------------------------
//  territory list
// ---------------------------------------------------------------------
export const TerritoryManagement = ({ access }) => {
  const notify = useBpToast();
  const [confirm, confirmDialog] = useConfirm();
  const [rows, setRows] = useState(null);
  const [overlaps, setOverlaps] = useState([]);
  const [error, setError] = useState(null);
  const [stateFilter, setStateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  const [editor, setEditor] = useState(null); // {} = new, territory = edit
  const [history, setHistory] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const canManage = !!access?.can_manage_territories;

  const load = useCallback(async () => {
    setError(null);
    try {
      const [list, ov] = await Promise.all([
        bpApi.territories({ include_inactive: 1 }),
        canManage ? bpApi.territoryOverlaps().catch(() => []) : Promise.resolve([]),
      ]);
      setRows(list || []);
      setOverlaps(ov || []);
    } catch (err) {
      setError(apiError(err, "Could not load territories"));
    }
  }, [canManage]);

  useEffect(() => {
    load();
  }, [load]);

  const changed = async () => {
    await load();
    try {
      await refreshMasters(); // the plan form offers the new list at once
    } catch {
      /* refreshed on next page open */
    }
  };

  const setStatus = async (t, isActive) => {
    const text = isActive
      ? `Activate ${t.name}? It will be offered again for new business plans.`
      : `Deactivate ${t.name}? Existing business plans keep it (approved plans keep their saved snapshot); it is no longer offered for new plans.`;
    if (!(await confirm(isActive ? "Activate territory" : "Deactivate territory", text, { yes: isActive ? "Activate" : "Deactivate", danger: !isActive }))) return;
    setBusyId(t.id);
    try {
      const res = await bpApi.setTerritoryStatus(t.id, isActive);
      notify.ok(res.message || "Done");
      await changed();
    } catch (err) {
      notify.fail(err);
    } finally {
      setBusyId(null);
    }
  };

  const visible = (rows || []).filter(
    (t) =>
      (!stateFilter || String(t.state_id) === stateFilter) &&
      (showInactive || t.is_active) &&
      (!search.trim() || `${t.name} ${(t.district_names || []).join(" ")}`.toLowerCase().includes(search.trim().toLowerCase())),
  );
  // grouped by state
  const groups = [];
  for (const t of visible) {
    let g = groups.find((x) => x.state_id === t.state_id);
    if (!g) {
      g = { state_id: t.state_id, state_name: t.state_name || `State #${t.state_id}`, items: [] };
      groups.push(g);
    }
    g.items.push(t);
  }
  const statesWithRows = [...new Map((rows || []).map((t) => [t.state_id, t.state_name])).entries()];

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!rows) return <Loading />;

  return (
    <Box>
      {confirmDialog}
      {access?.permission_without_scope && (
        <Alert status="warning" borderRadius="md" mb={4} fontSize="sm">
          <AlertIcon />
          <AlertDescription>
            You have territory-management permission, but no state is assigned to you yet. Please ask an Admin to assign your state(s).
          </AlertDescription>
        </Alert>
      )}
      {canManage && !access.can_manage_all_states && (access.states || []).length > 0 && (
        <Text fontSize="sm" mb={3}>
          You can manage territories in: <b>{access.states.map((s) => s.name).join(", ")}</b>
        </Text>
      )}
      {overlaps.length > 0 && (
        <Alert status="warning" borderRadius="md" mb={4} fontSize="sm" alignItems="flex-start">
          <AlertIcon />
          <Box>
            <Text fontWeight="700">Existing overlaps ({overlaps.length} district{overlaps.length === 1 ? "" : "s"} in more than one active territory)</Text>
            <Text fontSize="xs" mb={1}>They were kept as they were. New overlaps cannot be created; remove the district from one territory to resolve it.</Text>
            {overlaps.slice(0, 8).map((o) => (
              <Text key={o.district_id} fontSize="xs">
                {o.state_name} · <b>{o.district_name}</b>: {o.territories.map((t) => t.name).join(", ")}
              </Text>
            ))}
            {overlaps.length > 8 && <Text fontSize="xs">… and {overlaps.length - 8} more</Text>}
          </Box>
        </Alert>
      )}

      <Block
        title="Territories"
        subtitle="One state per territory, many districts. Every change is saved as a new version; approved plans keep the territory they were approved with."
        right={canManage ? <Button size="sm" colorScheme="teal" onClick={() => setEditor({})}>+ Create Territory</Button> : null}
      >
        <Stack direction={{ base: "column", md: "row" }} spacing={3} mb={4}>
          <Select size="sm" maxW={{ md: "240px" }} value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
            <option value="">All states</option>
            {statesWithRows.map(([id, name]) => (
              <option key={id} value={String(id)}>{name}</option>
            ))}
          </Select>
          <InputGroup size="sm" maxW={{ md: "320px" }}>
            <InputLeftElement pointerEvents="none"><SearchIcon color="gray.400" /></InputLeftElement>
            <Input placeholder="Search territory or district" value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          {canManage && (
            <FormControl display="flex" alignItems="center" w="auto">
              <Switch size="sm" isChecked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} colorScheme="teal" mr={2} />
              <FormLabel mb={0} fontSize="sm">Show inactive</FormLabel>
            </FormControl>
          )}
        </Stack>

        {!groups.length ? (
          <Text fontSize="sm" color="gray.500">No territories{stateFilter || search ? " match the filter" : " yet"}.</Text>
        ) : (
          groups.map((g) => (
            <Box key={g.state_id} mb={5}>
              <Text fontSize="xs" fontWeight="800" color="teal.700" textTransform="uppercase" letterSpacing="0.05em" mb={2}>
                {g.state_name} · {g.items.length}
              </Text>
              <DataTable
                rows={g.items}
                columns={[
                  {
                    key: "name",
                    label: "Territory",
                    wrap: true,
                    render: (t) => (
                      <Box minW="200px">
                        <Text fontWeight="700" fontSize="sm">{t.name}</Text>
                        <DistrictNames names={t.district_names} />
                      </Box>
                    ),
                  },
                  { key: "district_count", label: "Districts", numeric: true },
                  {
                    key: "status",
                    label: "Status",
                    render: (t) => (
                      <HStack spacing={1}>
                        <StatusBadge status={t.is_active ? "ACTIVE" : "CLOSED"} label={t.is_active ? "Active" : "Inactive"} />
                        {t.is_active && !t.selectable && <Badge colorScheme="orange" fontSize="10px">Not offered (no districts)</Badge>}
                      </HStack>
                    ),
                  },
                  {
                    key: "plans",
                    label: "Business Plans",
                    render: (t) => (
                      <Tooltip label={`${t.plans_approved} approved / closed · ${t.plans_open} open`} hasArrow>
                        <Text fontSize="sm">{t.plans_total}</Text>
                      </Tooltip>
                    ),
                  },
                  { key: "version", label: "Version", render: (t) => `v${t.current_version_no}` },
                  { key: "updated", label: "Updated", render: (t) => <Box><Text fontSize="xs">{fmtDateTime(t.updated_at)}</Text><Text fontSize="xs" color="gray.500">{t.updated_by_name || t.created_by_name || ""}</Text></Box> },
                  {
                    key: "actions",
                    label: "",
                    render: (t) =>
                      t.can_manage ? (
                        <HStack spacing={1}>
                          <Button size="xs" variant="outline" onClick={() => setEditor(t)}>Edit</Button>
                          {t.is_active ? (
                            <Button size="xs" variant="ghost" colorScheme="red" isLoading={busyId === t.id} onClick={() => setStatus(t, false)}>Deactivate</Button>
                          ) : (
                            <Button size="xs" variant="ghost" colorScheme="green" isLoading={busyId === t.id} onClick={() => setStatus(t, true)}>Activate</Button>
                          )}
                          <Button size="xs" variant="ghost" onClick={() => setHistory(t)}>History</Button>
                        </HStack>
                      ) : null,
                  },
                ]}
              />
            </Box>
          ))
        )}
      </Block>

      {canManage && (
        <TerritoryEditor
          isOpen={!!editor}
          onClose={() => setEditor(null)}
          territory={editor?.id ? editor : null}
          access={access}
          allTerritories={rows}
          onSaved={changed}
        />
      )}
      {canManage && <VersionsModal territory={history} onClose={() => setHistory(null)} />}
    </Box>
  );
};

// ---------------------------------------------------------------------
//  territory managers (Admin / Super Admin only)
// ---------------------------------------------------------------------
const AssignStatesModal = ({ target, onClose, onSaved }) => {
  const notify = useBpToast();
  const { masters } = useMasters();
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [states, setStates] = useState([]);
  const [stateSearch, setStateSearch] = useState("");
  const [grant, setGrant] = useState(true);
  const [saving, setSaving] = useState(false);
  const isNew = target && !target.user_id;

  useEffect(() => {
    if (!target) return;
    setUserId(target.user_id ? String(target.user_id) : "");
    setUserName(target.name || "");
    setSearch("");
    setCandidates([]);
    setStates([]);
    setStateSearch("");
    setGrant(!target.permission_granted);
  }, [target]);

  useEffect(() => {
    if (!isNew) return undefined;
    const h = setTimeout(() => {
      bpApi.territoryManagerCandidates(search.trim()).then((r) => setCandidates(r || [])).catch(() => setCandidates([]));
    }, 300);
    return () => clearTimeout(h);
  }, [search, isNew]);

  const already = new Set((target?.active_states || []).map((s) => String(s.state_id)));
  const stateList = (masters?.states || []).filter((s) => !already.has(String(s.id)) && s.name.toLowerCase().includes(stateSearch.trim().toLowerCase()));

  const save = async () => {
    if (!userId) return notify.fail("Select a user");
    if (!states.length && !(isNew && grant)) return notify.fail("Select at least one state");
    setSaving(true);
    try {
      if (grant && !target.permission_granted) {
        const r = await bpApi.setTerritoryPermission(Number(userId), true);
        if (!states.length) notify.warn(r.message);
      }
      if (states.length) {
        const r = await bpApi.grantTerritoryStates(Number(userId), states.map(Number));
        if (/no effect/.test(r.message || "")) notify.warn(r.message);
        else notify.ok(r.message || "States assigned");
      }
      onSaved();
      onClose();
    } catch (err) {
      notify.fail(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={!!target} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">{isNew ? "Add Territory Manager" : `Assign States · ${userName}`}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isNew && (
            <FormControl mb={4} isRequired>
              <FormLabel fontSize="sm">User</FormLabel>
              {userId ? (
                <HStack>
                  <Tag colorScheme="teal"><TagLabel>{userName}</TagLabel><TagCloseButton onClick={() => { setUserId(""); setUserName(""); }} /></Tag>
                </HStack>
              ) : (
                <>
                  <InputGroup size="sm">
                    <InputLeftElement pointerEvents="none"><SearchIcon color="gray.400" /></InputLeftElement>
                    <Input placeholder="Search user by name" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </InputGroup>
                  <Box border="1px solid" borderColor="gray.100" borderRadius="md" mt={1} maxH="180px" overflowY="auto">
                    {candidates.map((c) => (
                      <Flex key={c.user_id} px={3} py={2} _hover={{ bg: "gray.50" }} cursor="pointer" justify="space-between"
                        onClick={() => { setUserId(String(c.user_id)); setUserName(c.name); }}>
                        <Text fontSize="sm">{c.name}</Text>
                        <Text fontSize="xs" color="gray.500">{c.job_role || c.role || ""}</Text>
                      </Flex>
                    ))}
                    {!candidates.length && <Text fontSize="xs" color="gray.500" p={3}>No users found.</Text>}
                  </Box>
                  <FormHelperText fontSize="xs">Admin and Super Admin are not listed: they already manage every state.</FormHelperText>
                </>
              )}
            </FormControl>
          )}
          {!target?.permission_granted && (
            <Checkbox size="sm" isChecked={grant} onChange={(e) => setGrant(e.target.checked)} mb={3}>
              Grant MANAGE_BP_TERRITORIES (without it the states have no effect)
            </Checkbox>
          )}
          <FormLabel fontSize="sm">States to assign ({states.length} selected)</FormLabel>
          <InputGroup size="sm" mb={2}>
            <InputLeftElement pointerEvents="none"><SearchIcon color="gray.400" /></InputLeftElement>
            <Input placeholder="Search states" value={stateSearch} onChange={(e) => setStateSearch(e.target.value)} />
          </InputGroup>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={1} maxH="260px" overflowY="auto" border="1px solid" borderColor="gray.100" borderRadius="md" p={2}>
            {stateList.map((s) => (
              <Checkbox key={s.id} size="sm" isChecked={states.includes(String(s.id))}
                onChange={() => setStates((x) => (x.includes(String(s.id)) ? x.filter((y) => y !== String(s.id)) : [...x, String(s.id)]))}>
                <Text as="span" fontSize="sm">{s.name}</Text>
              </Checkbox>
            ))}
          </SimpleGrid>
          {already.size > 0 && <Text fontSize="xs" color="gray.500" mt={2}>Already assigned states are not listed.</Text>}
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" colorScheme="teal" onClick={save} isLoading={saving}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const TerritoryManagers = () => {
  const notify = useBpToast();
  const [confirm, confirmDialog] = useConfirm();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [assign, setAssign] = useState(null); // {} = new manager, manager = add states
  const [showHistory, setShowHistory] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await bpApi.territoryManagers());
    } catch (err) {
      setError(apiError(err, "Could not load territory managers"));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const togglePermission = async (m) => {
    const granting = !m.permission_granted;
    const text = granting
      ? `Grant MANAGE_BP_TERRITORIES to ${m.name}? The user can manage territories only in the states assigned to them.`
      : `Revoke MANAGE_BP_TERRITORIES from ${m.name}? The user can no longer manage any territory. Assigned states are kept but have no effect.`;
    if (!(await confirm(granting ? "Grant permission" : "Revoke permission", text, { yes: granting ? "Grant" : "Revoke", danger: !granting }))) return;
    try {
      const r = await bpApi.setTerritoryPermission(m.user_id, granting);
      if (granting && !m.active_states.length) notify.warn(r.message);
      else notify.ok(r.message || "Saved");
      await load();
    } catch (err) {
      notify.fail(err);
    }
  };

  const revoke = async (m, s) => {
    if (!(await confirm("Revoke state", `Revoke ${s.state_name} from ${m.name}?`, { yes: "Revoke", danger: true }))) return;
    try {
      const r = await bpApi.revokeTerritoryState(m.user_id, s.state_id);
      notify.ok(r.message || "Revoked");
      await load();
    } catch (err) {
      notify.fail(err);
    }
  };

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!data) return <Loading />;

  return (
    <Block
      title="Territory Managers"
      subtitle="Only Admin and Super Admin can grant MANAGE_BP_TERRITORIES and assign state scopes. A user needs both the permission and a state."
      right={
        <HStack>
          <FormControl display="flex" alignItems="center" w="auto">
            <Switch size="sm" isChecked={showHistory} onChange={(e) => setShowHistory(e.target.checked)} colorScheme="teal" mr={2} />
            <FormLabel mb={0} fontSize="sm">Show revoked</FormLabel>
          </FormControl>
          <Button size="sm" colorScheme="teal" onClick={() => setAssign({})}>+ Add Manager</Button>
        </HStack>
      }
    >
      {confirmDialog}
      <Text fontSize="xs" color="gray.500" mb={3}>
        Full access by role (all states): {(data.admins || []).map((a) => `${a.name} (${a.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"})`).join(", ") || "—"}
      </Text>
      <DataTable
        rows={data.managers}
        rowKey={(m) => m.user_id}
        emptyText="No territory managers yet. Admin and Super Admin manage every state."
        columns={[
          { key: "name", label: "User", wrap: true, render: (m) => <Box><Text fontWeight="700" fontSize="sm">{m.name}{!m.user_is_active ? " (inactive)" : ""}</Text><Text fontSize="xs" color="gray.500">{m.job_role || m.role || "—"}</Text></Box> },
          {
            key: "permission",
            label: "Permission",
            render: (m) => (
              <Badge colorScheme={m.permission_granted ? "green" : "gray"} fontSize="10px">{m.permission_granted ? "Granted" : "Not granted"}</Badge>
            ),
          },
          {
            key: "states",
            label: "States",
            wrap: true,
            render: (m) => {
              const scopes = showHistory ? m.scopes : m.scopes.filter((s) => s.is_active);
              return (
                <Wrap minW="220px">
                  {!scopes.length && <Text fontSize="xs" color="orange.500">No state assigned</Text>}
                  {scopes.map((s) => (
                    <WrapItem key={s.state_id}>
                      <Tooltip
                        hasArrow
                        label={s.is_active
                          ? `Assigned by ${s.granted_by_name || "—"} on ${fmtDateTime(s.granted_at)}`
                          : `Revoked by ${s.revoked_by_name || "—"} on ${fmtDateTime(s.revoked_at)} (assigned ${fmtDateTime(s.granted_at)})`}
                      >
                        <Tag size="sm" colorScheme={s.is_active ? "teal" : "gray"} variant={s.is_active ? "subtle" : "outline"}>
                          <TagLabel textDecoration={s.is_active ? "none" : "line-through"}>{s.state_name}</TagLabel>
                          {s.is_active && <TagCloseButton onClick={() => revoke(m, s)} />}
                        </Tag>
                      </Tooltip>
                    </WrapItem>
                  ))}
                </Wrap>
              );
            },
          },
          {
            key: "effective",
            label: "Can manage now",
            render: (m) => <Badge colorScheme={m.can_manage_now ? "green" : "orange"} fontSize="10px">{m.can_manage_now ? "Yes" : "No"}</Badge>,
          },
          {
            key: "actions",
            label: "",
            render: (m) => (
              <HStack spacing={1}>
                <Button size="xs" variant="outline" onClick={() => setAssign(m)} isDisabled={!m.user_is_active}>Assign States</Button>
                <Button size="xs" variant="ghost" colorScheme={m.permission_granted ? "red" : "green"} onClick={() => togglePermission(m)}>
                  {m.permission_granted ? "Revoke Permission" : "Grant Permission"}
                </Button>
              </HStack>
            ),
          },
        ]}
      />
      <AssignStatesModal target={assign} onClose={() => setAssign(null)} onSaved={load} />
    </Block>
  );
};

// the whole Settings → Territories tab
const BpTerritories = () => {
  const [access, setAccess] = useState(null);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    setError(null);
    try {
      setAccess(await bpApi.territoryAccess());
    } catch (err) {
      setError(apiError(err, "Could not load your territory access"));
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!access) return <Loading />;
  return (
    <Box>
      <TerritoryManagement access={access} />
      {access.can_manage_managers && <TerritoryManagers />}
    </Box>
  );
};

export default BpTerritories;
