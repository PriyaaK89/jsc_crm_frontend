// Shared pieces for the Business Plan admin screens.
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
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
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { apiError, bpApi, toRecordId } from "../../services/businessPlanApi";
import { SectionError } from "../Dashboard/analytics/chartKit";

// ---------------------------------------------------------------------
//  formatting
// ---------------------------------------------------------------------
export const money = (v) => `₹${Math.round(Number(v) || 0).toLocaleString("en-IN")}`;
export const qty = (v) => {
  const n = Number(v) || 0;
  return Number.isInteger(n) ? n.toLocaleString("en-IN") : n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};
export const pct = (v) => (v === null || v === undefined ? "—" : `${Math.round(Number(v) || 0)}%`);
export const signedMoney = (v) => `${Number(v) < 0 ? "-" : "+"}${money(Math.abs(Number(v) || 0))}`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fmtDate = (iso) => {
  if (!iso || String(iso).length < 10) return iso || "—";
  const s = String(iso);
  return `${s.slice(8, 10)} ${MONTHS[Number(s.slice(5, 7)) - 1]} ${s.slice(0, 4)}`;
};
export const fmtDateTime = (s) => {
  if (!s || String(s).length < 16) return fmtDate(s);
  let h = Number(s.slice(11, 13));
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${fmtDate(s)}, ${String(h).padStart(2, "0")}:${s.slice(14, 16)} ${ampm}`;
};
export const todayIST = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
// calendar months touched by a period "YYYY-MM-DD".."YYYY-MM-DD" (same rule as the backend)
export const monthsBetween = (from, to) => {
  if (!from || !to || from > to) return 1;
  const [fy, fm] = String(from).split("-").map(Number);
  const [ty, tm] = String(to).split("-").map(Number);
  return Math.max((ty - fy) * 12 + (tm - fm) + 1, 1);
};

// ---------------------------------------------------------------------
//  toasts
// ---------------------------------------------------------------------
export const useBpToast = () => {
  const toast = useToast();
  return {
    ok: (description) => toast({ description, status: "success", duration: 2500, isClosable: true }),
    warn: (description) => toast({ description, status: "warning", duration: 7000, isClosable: true }),
    fail: (err, fallback) =>
      toast({ description: typeof err === "string" ? err : apiError(err, fallback), status: "error", duration: 4000, isClosable: true }),
  };
};

// ---------------------------------------------------------------------
//  masters (dropdown lists) — cached for the session, refreshable
// ---------------------------------------------------------------------
let mastersCache = null;
let productsCache = null;
const listeners = new Set();

export const refreshMasters = async () => {
  const [m, p] = await Promise.all([bpApi.masters(), bpApi.products()]);
  mastersCache = m;
  productsCache = p || [];
  listeners.forEach((fn) => fn());
  return mastersCache;
};

export const useMasters = () => {
  const [, force] = useState(0);
  const [loading, setLoading] = useState(!mastersCache);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await refreshMasters();
    } catch (err) {
      setError(apiError(err, "Could not load business plan lists"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fn = () => force((x) => x + 1);
    listeners.add(fn);
    if (!mastersCache) load();
    return () => listeners.delete(fn);
  }, [load]);

  return { masters: mastersCache, products: productsCache || [], loading, error, reload: load };
};

// ---------------------------------------------------------------------
//  filters
// ---------------------------------------------------------------------
export const EMPTY_FILTERS = { financial_year: "", season: "", state_id: "", territory_id: "", product_id: "", employee_id: "" };

export const FilterBar = ({ value, onChange, show = ["financial_year", "season", "state_id", "territory_id", "product_id"], extra }) => {
  const { masters, products } = useMasters();
  const set = (key) => (e) => {
    const next = { ...value, [key]: e.target.value };
    if (key === "state_id") next.territory_id = "";
    onChange(next);
  };
  const territories = (masters?.territories || []).filter((t) => !value.state_id || String(t.state_id) === String(value.state_id));
  const fields = {
    financial_year: { label: "Year", options: (masters?.financial_years || []).map((v) => [v, v]) },
    season: { label: "Season", options: (masters?.seasons || []).map((v) => [v, v]) },
    state_id: { label: "State", options: (masters?.states || []).map((s) => [s.id, s.name]) },
    territory_id: { label: "Territory", options: territories.map((t) => [t.id, t.name]) },
    product_id: { label: "Product", options: products.map((p) => [p.id, p.name]) },
    employee_id: { label: "Employee", options: (masters?.employees || []).map((e) => [e.id, e.name]) },
  };
  return (
    <Flex gap={2} wrap="wrap" mb={4} align="flex-end">
      {show.map((key) => (
        <FormControl key={key} w={{ base: "47%", md: "170px" }}>
          <FormLabel fontSize="xs" mb={1} color="gray.600">
            {fields[key].label}
          </FormLabel>
          <Select size="sm" borderRadius="8px" value={value[key] || ""} onChange={set(key)}>
            <option value="">All</option>
            {fields[key].options.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </FormControl>
      ))}
      {Object.values(value).some(Boolean) && (
        <Button size="sm" variant="ghost" onClick={() => onChange({ ...EMPTY_FILTERS })}>
          Clear
        </Button>
      )}
      {extra}
    </Flex>
  );
};

// ---------------------------------------------------------------------
//  badges / states
// ---------------------------------------------------------------------
const STATUS_SCHEME = {
  DRAFT: "gray",
  SUBMITTED: "blue",
  UNDER_REVIEW: "orange",
  ACTIVE: "green",
  REJECTED: "red",
  CLOSED: "purple",
  MANAGER_APPROVED: "teal",
  APPROVED: "green",
  RETURNED: "orange",
  OPEN: "orange",
  IN_PROGRESS: "blue",
  HIGH: "red",
  MEDIUM: "orange",
  LOW: "gray",
  PENDING: "orange",
  WAITING: "gray",
  SKIPPED: "gray",
  ACCEPTED: "teal",
  RESOLVED: "green",
  DECLINED: "red",
  CANCELLED: "gray",
  LEGACY: "purple",
  PLAN: "teal",
};

export const StatusBadge = ({ status, label }) => (
  <Badge colorScheme={STATUS_SCHEME[status] || "gray"} borderRadius="full" px={2} fontSize="10px">
    {label || String(status || "-").replace(/_/g, " ")}
  </Badge>
);

const TONE_SCHEME = { green: "green", orange: "orange", red: "red" };
export const PerfBadge = ({ performance, percent }) =>
  performance ? (
    <Badge colorScheme={TONE_SCHEME[performance.tone] || "gray"} borderRadius="full" px={2} fontSize="10px">
      {percent !== undefined ? `${pct(percent)} · ` : ""}
      {performance.label}
    </Badge>
  ) : (
    <Text as="span">{pct(percent)}</Text>
  );

export const Loading = ({ py = 10 }) => (
  <Flex justify="center" py={py}>
    <Spinner color="teal.500" />
  </Flex>
);

export const Empty = ({ text = "Nothing to show yet." }) => (
  <Text textAlign="center" color="gray.500" fontSize="sm" py={8}>
    {text}
  </Text>
);

export const ErrorBox = ({ message, onRetry }) => <SectionError message={message} onRetry={onRetry} />;

export const InfoGrid = ({ items, columns = { base: 1, md: 2, xl: 3 } }) => (
  <SimpleGrid columns={columns} spacingX={6} spacingY={2}>
    {items
      .filter(([, v]) => v !== undefined)
      .map(([label, v]) => (
        <Flex key={label} justify="space-between" borderBottom="1px solid" borderColor="gray.100" py={1.5} gap={3}>
          <Text fontSize="sm" color="gray.500">
            {label}
          </Text>
          <Text fontSize="sm" fontWeight="700" textAlign="right">
            {v === null || v === "" ? "—" : v}
          </Text>
        </Flex>
      ))}
  </SimpleGrid>
);

// ---------------------------------------------------------------------
//  table: columns = [{ key, label, render?(row), numeric? }]
// ---------------------------------------------------------------------
export const DataTable = ({ columns, rows, onRowClick, emptyText, size = "sm", rowKey }) => {
  if (!rows || !rows.length) return <Empty text={emptyText} />;
  return (
    <TableContainer border="1px solid" borderColor="gray.100" borderRadius="12px" overflowX="auto">
      <Table size={size}>
        <Thead bg="gray.50">
          <Tr>
            {columns.map((c) => (
              <Th key={c.key} isNumeric={c.numeric} fontSize="10px" whiteSpace="nowrap">
                {c.label}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((r, i) => (
            <Tr
              key={rowKey ? rowKey(r) : r.id ?? r.line_id ?? r.key ?? i}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              cursor={onRowClick ? "pointer" : undefined}
              _hover={onRowClick ? { bg: "gray.50" } : undefined}
            >
              {columns.map((c) => (
                <Td key={c.key} isNumeric={c.numeric} fontSize="sm" whiteSpace={c.wrap ? "normal" : "nowrap"}>
                  {c.render ? c.render(r) : r[c.key] ?? "—"}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

// ---------------------------------------------------------------------
//  confirm + comment dialogs (promise based)
// ---------------------------------------------------------------------
export const useConfirm = () => {
  const [state, setState] = useState(null);
  const cancelRef = useRef();
  const confirm = (title, message, { yes = "Yes", danger = false } = {}) =>
    new Promise((resolve) => setState({ title, message, yes, danger, resolve }));
  const close = (value) => {
    state?.resolve(value);
    setState(null);
  };
  const dialog = (
    <AlertDialog isOpen={!!state} leastDestructiveRef={cancelRef} onClose={() => close(false)} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="md">{state?.title}</AlertDialogHeader>
          <AlertDialogBody fontSize="sm">{state?.message}</AlertDialogBody>
          <AlertDialogFooter gap={2}>
            <Button ref={cancelRef} size="sm" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button size="sm" colorScheme={state?.danger ? "red" : "teal"} onClick={() => close(true)}>
              {state?.yes}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
  return [confirm, dialog];
};

// asks for a comment; resolves to the text or null
export const useCommentPrompt = () => {
  const [state, setState] = useState(null);
  const [text, setText] = useState("");
  const ask = (title, { required = false, placeholder = "", yes = "Submit", danger = false } = {}) =>
    new Promise((resolve) => {
      setText("");
      setState({ title, required, placeholder, yes, danger, resolve });
    });
  const close = (value) => {
    state?.resolve(value);
    setState(null);
  };
  const tooShort = state?.required && text.trim().length < 3;
  const dialog = (
    <Modal isOpen={!!state} onClose={() => close(null)} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">{state?.title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={state?.placeholder}
            maxLength={500}
            rows={4}
          />
          {state?.required && (
            <Text fontSize="xs" color={tooShort ? "red.500" : "gray.500"} mt={1}>
              A comment is required (at least 3 characters).
            </Text>
          )}
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" onClick={() => close(null)}>
            Cancel
          </Button>
          <Button
            size="sm"
            colorScheme={state?.danger ? "red" : "teal"}
            isDisabled={tooShort}
            onClick={() => close(text.trim())}
          >
            {state?.yes}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
  return [ask, dialog];
};

export const PageTitle = ({ title, subtitle, right }) => (
  <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} mb={4} gap={3} wrap="wrap">
    <Box>
      <Text className="action_heading" textAlign="left" mb={0}>
        {title}
      </Text>
      {subtitle && (
        <Text fontSize="sm" color="gray.500">
          {subtitle}
        </Text>
      )}
    </Box>
    {right}
  </Flex>
);

// ---------------------------------------------------------------------
//  record links: rows from different endpoints carry the plan id as `id`
//  (plan lists) or `plan_id` (plan vs actual, forecast, alerts, reports)
// ---------------------------------------------------------------------
export { toRecordId };
export const planIdOf = (row) => toRecordId(row?.plan_id ?? row?.id);
export const planPath = (row) => {
  const id = planIdOf(row);
  return id ? `/business-plan/plans/${id}` : null;
};

// navigate to a plan, or tell the user why not (never /plans/undefined)
export const useOpenPlan = (navigate) => {
  const toast = useToast();
  return useCallback(
    (row) => {
      const path = planPath(row);
      if (path) navigate(path);
      else toast({ status: "warning", title: "This row has no business plan to open", duration: 3000, isClosable: true });
    },
    [navigate, toast],
  );
};

// shown instead of a detail page when the URL has no valid id
export const InvalidId = ({ what = "plan", onBack }) => (
  <Box border="1px solid" borderColor="orange.200" bg="orange.50" borderRadius="12px" p={6} textAlign="center">
    <Text fontWeight="800" mb={1}>No valid {what} selected</Text>
    <Text fontSize="sm" color="gray.600" mb={4}>
      The link does not contain a {what} number. Open the {what} again from the list.
    </Text>
    {onBack && (
      <Button size="sm" colorScheme="teal" onClick={onBack}>
        Back to the list
      </Button>
    )}
  </Box>
);

// ---------------------------------------------------------------------
//  multi-level approval: levels of the current submission + every decision
//  (`approval` block of GET /plans/:id and GET /target-sheets/:id)
// ---------------------------------------------------------------------
const KIND_LABEL = { MANAGER: "Manager", RSM: "Final approver (RSM)", ADMIN: "Admin / Super Admin" };

export const ApprovalSteps = ({ approval, showHistory = true }) => {
  if (!approval || (!(approval.steps || []).length && !(approval.history || []).length)) return null;
  const steps = approval.steps || [];
  const history = approval.history || [];
  const heading =
    approval.status === "IN_PROGRESS"
      ? `Level ${approval.current_level} of ${approval.total_levels} — pending with ${approval.pending_with}`
      : approval.status === "APPROVED"
        ? "Approval complete"
        : approval.status === "RETURNED"
          ? "Returned for changes"
          : approval.status === "REJECTED"
            ? "Rejected"
            : "Approval";
  return (
    <Box border="1px solid" borderColor="gray.100" borderRadius="12px" p={4} mb={4}>
      <Text fontWeight="800" fontSize="sm" mb={3}>Approval — {heading}</Text>
      <DataTable
        rows={steps.map((x) => ({ ...x, key: x.id }))}
        rowKey={(r) => r.id}
        columns={[
          { key: "level_no", label: "Level", render: (r) => `L${r.level_no}${r.is_final ? " (final)" : ""}` },
          { key: "approver_name", label: "Approver", render: (r) => r.approver_name || KIND_LABEL[r.approver_kind] },
          { key: "approver_kind", label: "Type", render: (r) => (r.level_no === 1 && r.approver_kind === "MANAGER" ? "Reporting manager" : KIND_LABEL[r.approver_kind] || r.approver_kind) },
          { key: "approver_role", label: "Role", render: (r) => r.approver_role || "—" },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} label={r.status_label} /> },
          { key: "acted_by_name", label: "Acted by", render: (r) => (r.acted_by_name ? `${r.acted_by_name}${r.acted_as === "ADMIN" ? " (admin)" : ""}` : "—") },
          { key: "acted_at", label: "Date", render: (r) => (r.acted_at ? fmtDateTime(r.acted_at) : "—") },
          { key: "remark", label: "Remark", wrap: true, render: (r) => r.remark || "—" },
        ]}
      />
      {showHistory && history.length > 0 && (
        <Box mt={4}>
          <Text fontWeight="800" fontSize="sm" mb={2}>Approval history</Text>
          {history.map((h) => (
            <Text key={h.id} fontSize="sm" color="gray.600" mb={1}>
              {fmtDateTime(h.acted_at)} · Level {h.level_no}
              {h.total_levels ? ` of ${h.total_levels}` : ""}
              {h.round_no > 1 ? ` (submission ${h.round_no})` : ""} · {h.status_label} by {h.acted_by_name}
              {h.acted_by_role ? ` (${h.acted_by_role})` : ""}
              {h.acted_as === "ADMIN" ? " — admin approval" : ""}
              {h.remark ? ` — “${h.remark}”` : ""}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
};
