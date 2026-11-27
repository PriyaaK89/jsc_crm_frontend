// Shared pieces for the Additional Discount screens (reuses the Business Plan table / dialogs /
// formatting, like Advance Booking does). Colours follow the approved discount.html design:
// amber = pending, blue = pending final, purple = clarification, green = approved, red = rejected.
import React, { useCallback, useEffect, useState } from "react";
import {
  Badge, Box, Button, Flex, HStack, Input, Link as CLink, Select, SimpleGrid, Stat, StatHelpText, StatLabel,
  StatNumber, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, VStack,
} from "@chakra-ui/react";
import { adrApi, apiError } from "../../services/additionalDiscountApi";
import { usePermissions } from "../../context/PermissionContext";

export {
  DataTable, Empty, ErrorBox, InfoGrid, Loading, PageTitle, fmtDate, fmtDateTime, qty, todayIST,
  useBpToast as useAdrToast, useCommentPrompt, useConfirm,
} from "../BusinessPlan/bpShared";
export { adrApi, apiError };

// ₹ with paise (discounts are small amounts per unit)
export const rs = (v) =>
  `₹${(Number(v) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const pctText = (v) => `${(Math.round((Number(v) || 0) * 100) / 100).toLocaleString("en-IN")}%`;

export const STATUS = {
  DRAFT: ["gray", "Draft"],
  PENDING_RSM: ["orange", "Pending RSM"],
  PENDING_FINAL: ["blue", "Pending Final"],
  CLARIFICATION: ["purple", "Clarification"],
  APPROVED: ["green", "Approved"],
  PARTIALLY_APPROVED: ["teal", "Partially Approved"],
  REJECTED: ["red", "Rejected"],
  CANCELLED: ["gray", "Cancelled"],
  EXPIRED: ["gray", "Expired"],
  // lines / stages / utilization
  PENDING: ["orange", "Pending"],
  MODIFIED: ["teal", "Modified"],
  SKIPPED: ["gray", "Skipped"],
  RESERVED: ["orange", "Reserved"],
  CONSUMED: ["green", "Used"],
  RELEASED: ["gray", "Released"],
};

export const AdrBadge = ({ status, label }) => {
  const [scheme, text] = STATUS[status] || ["gray", String(status || "-").replace(/_/g, " ")];
  return (
    <Badge colorScheme={scheme} borderRadius="full" px={2} fontSize="10px" whiteSpace="nowrap">
      {label || text}
    </Badge>
  );
};

export const Tile = ({ label, value, sub, tone = "gray", onClick }) => (
  <Stat
    p={3}
    borderRadius="12px"
    border="1px solid"
    borderColor={`${tone}.100`}
    bg={`${tone}.50`}
    cursor={onClick ? "pointer" : "default"}
    onClick={onClick}
    _hover={onClick ? { boxShadow: "sm" } : undefined}
  >
    <StatLabel fontSize="11px" color="gray.600" textTransform="uppercase" letterSpacing="0.03em">{label}</StatLabel>
    <StatNumber fontSize="xl" color={`${tone}.700`}>{value}</StatNumber>
    {sub ? <StatHelpText fontSize="11px" mb={0}>{sub}</StatHelpText> : null}
  </Stat>
);
export const TileGrid = ({ children, columns = { base: 2, md: 3, xl: 6 } }) => (
  <SimpleGrid columns={columns} spacing={3} mb={5}>{children}</SimpleGrid>
);

export const Section = ({ title, right, children, ...rest }) => (
  <Box border="1px solid" borderColor="gray.100" borderRadius="12px" p={4} mb={4} {...rest}>
    {(title || right) && (
      <Flex justify="space-between" align="center" mb={3} gap={2} wrap="wrap">
        <Text fontWeight="700" fontSize="sm" color="gray.700">{title}</Text>
        {right}
      </Flex>
    )}
    {children}
  </Box>
);

// Access flags + queue counts from /additional-discount/me (loaded once by PermissionContext;
// pages may ask for a fresh copy after an action).
export const useAdrMe = () => {
  const { adr, refreshAdr } = usePermissions();
  return { me: adr, refresh: refreshAdr };
};

// search / status / dates filter row; value: { search, status, date_from, date_to }
// noSearch: hide the text search where the endpoint has no search filter (utilization)
export const FilterRow = ({ value, onChange, statuses, extra, noSearch = false, searchPlaceholder = "Request no., party or employee" }) => {
  const [search, setSearch] = useState(value.search || "");
  useEffect(() => {
    const t = setTimeout(() => {
      if ((value.search || "") !== search.trim()) onChange({ ...value, search: search.trim() });
    }, 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k, v) => onChange({ ...value, [k]: v });
  return (
    <Flex gap={2} mb={4} wrap="wrap" align="center">
      {!noSearch && <Input size="sm" maxW="260px" placeholder={searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} borderRadius="8px" />}
      {statuses && (
        <Select size="sm" maxW="200px" value={value.status || ""} onChange={(e) => set("status", e.target.value)} borderRadius="8px">
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{(STATUS[s] || [null, s])[1]}</option>
          ))}
        </Select>
      )}
      <HStack spacing={1}>
        <Text fontSize="xs" color="gray.500">From</Text>
        <Input size="sm" type="date" maxW="150px" value={value.date_from || ""} onChange={(e) => set("date_from", e.target.value)} borderRadius="8px" />
        <Text fontSize="xs" color="gray.500">to</Text>
        <Input size="sm" type="date" maxW="150px" value={value.date_to || ""} onChange={(e) => set("date_to", e.target.value)} borderRadius="8px" />
      </HStack>
      {extra}
    </Flex>
  );
};

export const Pager = ({ pagination, onPage, loading, what = "request(s)" }) => {
  const p = pagination || { page: 1, total: 0, total_pages: 1 };
  return (
    <Flex justify="space-between" align="center" mt={3}>
      <Text fontSize="sm" color="gray.500">{p.total} {what} · page {p.page} of {p.total_pages || 1}</Text>
      <HStack>
        <Button size="sm" onClick={() => onPage(p.page - 1)} isDisabled={p.page <= 1 || loading}>Previous</Button>
        <Button size="sm" onClick={() => onPage(p.page + 1)} isDisabled={p.page >= (p.total_pages || 1) || loading}>Next</Button>
      </HStack>
    </Flex>
  );
};

// generic loader: const { data, loading, error, reload } = useLoad(() => adrApi.x(), [deps])
export const useLoad = (fn, deps) => {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      setState({ data: await fn(), loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: apiError(err, "Could not load") });
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    reload();
  }, [reload]);
  return { ...state, reload };
};

// ---------------------------------------------------------------- request pieces
const HISTORY_LABEL = {
  CREATED: "Draft created",
  UPDATED: "Edited",
  SUBMITTED: "Submitted",
  RESUBMITTED: "Re-submitted after clarification",
  RSM_SKIPPED: "RSM stage skipped",
  RSM_REASSIGNED: "RSM re-assigned",
  RSM_APPROVED: "Recommended by RSM",
  RSM_REJECTED: "Rejected by RSM",
  CLARIFICATION_REQUESTED: "Clarification requested",
  CLARIFICATION_REPLIED: "Clarification replied",
  FINAL_APPROVED: "Final approval",
  FINAL_PARTIALLY_APPROVED: "Final approval (partial)",
  FINAL_REJECTED: "Rejected at final approval",
  ITEM_DECIDED: "Line decided",
  CREDIT_REVIEW: "Credit review noted",
  CANCELLED: "Cancelled",
  EXPIRY_WARNED: "Expiry notice sent",
  EXPIRED: "Expired",
  RESERVED: "Reserved on a sales order",
  RELEASED: "Reservation released",
  UTILIZED: "Used on a sales voucher",
  ATTACHMENT_ADDED: "Document added",
  ATTACHMENT_REMOVED: "Document removed",
};
const EVENT_COLOR = (e) =>
  /REJECT|CANCEL|EXPIRED/.test(e) ? "red.400" : /APPROVED|UTILIZED/.test(e) ? "green.400" : /CLARIF/.test(e) ? "purple.400" : /SKIPPED|RESERV|RELEAS/.test(e) ? "orange.400" : "blue.400";

export const Timeline = ({ history = [], fmtDateTime }) => (
  <VStack align="stretch" spacing={0}>
    {history.filter((h) => h.event !== "ITEM_DECIDED").map((h) => (
      <Flex key={h.id} gap={3} pb={3} position="relative">
        <Box w="10px" h="10px" mt="5px" borderRadius="full" bg={EVENT_COLOR(h.event)} flexShrink={0} />
        <Box flex="1" borderBottom="1px dashed" borderColor="gray.100" pb={2}>
          <Flex justify="space-between" gap={2} wrap="wrap">
            <Text fontSize="sm" fontWeight="700">{HISTORY_LABEL[h.event] || h.event.replace(/_/g, " ")}</Text>
            <Text fontSize="xs" color="gray.500">{fmtDateTime(h.created_at)}</Text>
          </Flex>
          <Text fontSize="xs" color="gray.600">
            {h.actor_name || (h.actor_role === "SYSTEM" ? "System" : "—")}
            {h.actor_role && h.actor_role !== "SYSTEM" ? ` · ${h.actor_role.replace(/_/g, " ").toLowerCase()}` : ""}
            {h.round_no ? ` · round ${h.round_no}` : ""}
          </Text>
          {h.remarks ? <Text fontSize="sm" mt={1} whiteSpace="pre-wrap">{h.remarks}</Text> : null}
        </Box>
      </Flex>
    ))}
  </VStack>
);

export const ApprovalStages = ({ approvals = [], fmtDateTime }) => (
  <TableContainer border="1px solid" borderColor="gray.100" borderRadius="12px">
    <Table size="sm">
      <Thead bg="gray.50">
        <Tr>
          <Th fontSize="10px">Round</Th>
          <Th fontSize="10px">Stage</Th>
          <Th fontSize="10px">Approver</Th>
          <Th fontSize="10px">Status</Th>
          <Th fontSize="10px">Decided by</Th>
          <Th fontSize="10px">When</Th>
          <Th fontSize="10px">Remarks</Th>
        </Tr>
      </Thead>
      <Tbody>
        {approvals.map((a) => (
          <Tr key={a.id}>
            <Td>{a.round_no}</Td>
            <Td>{a.stage === "RSM" ? "RSM recommendation" : "Final approval"}</Td>
            <Td>{a.assigned_user_name || "—"}</Td>
            <Td><AdrBadge status={a.status} /></Td>
            <Td>{a.acted_by_name || (a.acted_as === "SYSTEM" ? "System" : "—")}</Td>
            <Td whiteSpace="nowrap">{a.acted_at ? fmtDateTime(a.acted_at) : "—"}</Td>
            <Td maxW="320px" whiteSpace="normal">{a.remarks || "—"}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </TableContainer>
);

// product lines with requested / approved / reserved / used / balance
export const ItemsTable = ({ items = [], showUsage = true }) => (
  <TableContainer border="1px solid" borderColor="gray.100" borderRadius="12px" overflowX="auto">
    <Table size="sm">
      <Thead bg="gray.50">
        <Tr>
          <Th fontSize="10px">Product</Th>
          <Th fontSize="10px" isNumeric>Price</Th>
          <Th fontSize="10px" isNumeric>Regular disc.</Th>
          <Th fontSize="10px" isNumeric>Req. qty</Th>
          <Th fontSize="10px" isNumeric>Requested</Th>
          <Th fontSize="10px" isNumeric>Est. final rate</Th>
          <Th fontSize="10px">Decision</Th>
          <Th fontSize="10px" isNumeric>Appr. qty</Th>
          <Th fontSize="10px" isNumeric>Approved</Th>
          {showUsage && (
            <>
              <Th fontSize="10px" isNumeric>Reserved</Th>
              <Th fontSize="10px" isNumeric>Used</Th>
              <Th fontSize="10px" isNumeric>Balance</Th>
            </>
          )}
        </Tr>
      </Thead>
      <Tbody>
        {items.map((i) => (
          <Tr key={i.id}>
            <Td>
              <Text fontWeight="700" fontSize="sm">{i.item_name}</Text>
              <Text fontSize="xs" color="gray.500">GST {i.gst_percent}% · per {i.unit_symbol || "unit"}</Text>
            </Td>
            <Td isNumeric>{rs(i.base_rate)}</Td>
            <Td isNumeric>{rs(i.regular_discount_per_unit)}</Td>
            <Td isNumeric>{Number(i.requested_qty).toLocaleString("en-IN")}</Td>
            <Td isNumeric>
              <Text>{i.discount_type === "PERCENT" ? pctText(i.requested_value) : rs(i.requested_value)}</Text>
              <Text fontSize="xs" color="gray.500">{rs(i.requested_per_unit)}/unit · {rs(i.requested_amount)}</Text>
            </Td>
            <Td isNumeric>{rs(i.est_final_rate)}</Td>
            <Td>
              <AdrBadge status={i.item_status} />
              {i.decision_remarks ? <Text fontSize="xs" color="gray.600" maxW="200px" whiteSpace="normal">{i.decision_remarks}</Text> : null}
            </Td>
            <Td isNumeric>{i.approved_qty === null ? "—" : Number(i.approved_qty).toLocaleString("en-IN")}</Td>
            <Td isNumeric>
              {i.approved_per_unit === null ? "—" : (
                <>
                  <Text>{rs(i.approved_per_unit)}/unit</Text>
                  <Text fontSize="xs" color="gray.500">{rs(i.approved_amount)} · net {rs(i.approved_net_rate)}</Text>
                </>
              )}
            </Td>
            {showUsage && (
              <>
                <Td isNumeric color={i.reserved_qty > 0 ? "orange.600" : undefined}>{Number(i.reserved_qty).toLocaleString("en-IN")}</Td>
                <Td isNumeric>
                  <Text>{Number(i.used_qty).toLocaleString("en-IN")}</Text>
                  <Text fontSize="xs" color="gray.500">{rs(i.used_amount)}</Text>
                </Td>
                <Td isNumeric fontWeight="700" color={i.balance_qty > 0 ? "green.600" : "gray.500"}>{Number(i.balance_qty).toLocaleString("en-IN")}</Td>
              </>
            )}
          </Tr>
        ))}
      </Tbody>
    </Table>
  </TableContainer>
);

// sales lines that reserved / used this request
export const UsageTable = ({ rows = [], fmtDateTime }) =>
  !rows.length ? (
    <Text fontSize="sm" color="gray.500">Not used on any sales order or voucher yet.</Text>
  ) : (
    <TableContainer border="1px solid" borderColor="gray.100" borderRadius="12px" overflowX="auto">
      <Table size="sm">
        <Thead bg="gray.50">
          <Tr>
            <Th fontSize="10px">Product</Th>
            <Th fontSize="10px">Source</Th>
            <Th fontSize="10px">Order / Voucher</Th>
            <Th fontSize="10px">Status</Th>
            <Th fontSize="10px" isNumeric>Qty</Th>
            <Th fontSize="10px" isNumeric>Gross</Th>
            <Th fontSize="10px" isNumeric>Disc./unit</Th>
            <Th fontSize="10px" isNumeric>Net</Th>
            <Th fontSize="10px" isNumeric>Discount</Th>
            <Th fontSize="10px">When</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((u) => (
            <Tr key={u.id}>
              <Td>{u.item_name}</Td>
              <Td>{u.source === "DIRECT_SALE" ? "Sales voucher" : "Sales order"}</Td>
              <Td>{u.voucher_no || (u.order_no ? `Order ${u.order_no}` : u.approval_id ? `Order #${u.approval_id}` : "—")}</Td>
              <Td>
                <AdrBadge status={u.status} />
                {u.release_reason ? <Text fontSize="xs" color="gray.500" maxW="180px" whiteSpace="normal">{u.release_reason}</Text> : null}
              </Td>
              <Td isNumeric>{Number(u.qty).toLocaleString("en-IN")}</Td>
              <Td isNumeric>{rs(u.gross_rate)}</Td>
              <Td isNumeric>{rs(u.discount_per_unit)}</Td>
              <Td isNumeric>{rs(u.net_rate)}</Td>
              <Td isNumeric>{rs(u.discount_amount)}</Td>
              <Td whiteSpace="nowrap">{fmtDateTime(u.consumed_at || u.released_at || u.created_at)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );

export const AttachmentList = ({ attachments = [], onRemove }) =>
  !attachments.length ? (
    <Text fontSize="sm" color="gray.500">No documents.</Text>
  ) : (
    <VStack align="stretch" spacing={1}>
      {attachments.map((a) => (
        <Flex key={a.id} justify="space-between" align="center" borderBottom="1px solid" borderColor="gray.100" py={1}>
          <Box>
            {a.url ? (
              <CLink href={a.url} isExternal color="blue.600" fontSize="sm" fontWeight="600">{a.original_name}</CLink>
            ) : (
              <Text fontSize="sm">{a.original_name}</Text>
            )}
            <Text fontSize="xs" color="gray.500">{a.uploaded_by_name}{a.history_id ? " · with a clarification reply" : ""}</Text>
          </Box>
          {onRemove && <Button size="xs" variant="ghost" colorScheme="red" onClick={() => onRemove(a)}>Remove</Button>}
        </Flex>
      ))}
    </VStack>
  );

export const LABEL = {
  PRE_ORDER: "Pre-order",
  SALES_ORDER: "Sales order",
  EXISTING_ORDER: "Existing order",
  OTHER: "Other",
  ADVANCE: "Advance",
  CASH: "Cash",
  AGAINST_DISPATCH: "Against dispatch",
  CREDIT: "Credit",
  PART_ADVANCE: "Part advance",
};
export const label = (v) => (v ? LABEL[v] || v : null);
