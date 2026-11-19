// Shared pieces for the Advance Booking screens (reuses the Business Plan table / dialogs / formatting).
import React, { useCallback, useEffect, useState } from "react";
import { Badge, Box, Select, SimpleGrid, Text } from "@chakra-ui/react";
import { absApi, apiError } from "../../services/absApi";

export {
  DataTable,
  Empty,
  ErrorBox,
  InfoGrid,
  InvalidId,
  Loading,
  PageTitle,
  ApprovalSteps,
  fmtDate,
  fmtDateTime,
  money,
  qty,
  todayIST,
  useBpToast as useAbsToast,
  useCommentPrompt,
  useConfirm,
} from "../BusinessPlan/bpShared";

export const BOOKING_STATUS = {
  DRAFT: ["gray", "Draft"],
  SUBMITTED: ["orange", "Pending Approval"],
  RETURNED: ["yellow", "Returned"],
  REJECTED: ["red", "Rejected"],
  APPROVED: ["purple", "To Confirm"],
  CONFIRMED: ["blue", "Confirmed"],
  PARTIALLY_DISPATCHED: ["cyan", "Part Dispatched"],
  DISPATCHED: ["teal", "Dispatched"],
  DELIVERED: ["green", "Delivered"],
  CLOSED: ["gray", "Closed"],
  CANCELLED: ["red", "Cancelled"],
  // payments / dispatches / refunds
  PENDING_VERIFICATION: ["orange", "To Verify"],
  POSTED: ["green", "Received"],
  BOUNCED: ["red", "Bounced"],
  IN_TRANSIT: ["blue", "In Transit"],
  DELIVERED_WITH_ISSUES: ["orange", "Short / Damaged"],
  DUE: ["orange", "Refund Due"],
  PAID: ["green", "Refunded"],
  CARRIED_FORWARD: ["blue", "Carried Forward"],
  FORFEITED: ["gray", "Forfeited"],
  ACTIVE: ["blue", "Reserved"],
  CONSUMED: ["green", "Dispatched"],
  RELEASED: ["gray", "Released"],
  OPEN: ["green", "Open"],
};

export const AbsBadge = ({ status, label }) => {
  const [scheme, text] = BOOKING_STATUS[status] || ["gray", String(status || "-").replace(/_/g, " ")];
  return (
    <Badge colorScheme={scheme} borderRadius="full" px={2} fontSize="10px" title={label || text}>
      {text}
    </Badge>
  );
};

// masters cached for the session
let cache = null;
export const useAbsMasters = () => {
  const [masters, setMasters] = useState(cache);
  const [error, setError] = useState(null);
  const load = useCallback(async (force = false) => {
    if (cache && !force) return setMasters(cache);
    try {
      cache = await absApi.masters();
      setMasters(cache);
    } catch (err) {
      setError(apiError(err, "Could not load booking masters"));
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  return { masters, error, reload: () => load(true) };
};

export const SeasonSelect = ({ seasons = [], value, onChange, allowAll = false, ...rest }) => (
  <Select size="sm" maxW="260px" borderRadius="8px" value={value || ""} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")} {...rest}>
    {allowAll && <option value="">All seasons</option>}
    {seasons.map((s) => (
      <option key={s.id} value={s.id}>
        {s.name} {s.status !== "OPEN" ? `(${s.status.toLowerCase()})` : ""}
      </option>
    ))}
  </Select>
);

// small KPI tile; onClick makes it a shortcut to the filtered list
export const Tile = ({ label, value, sub, tone = "gray", onClick }) => (
  <Box
    border="1px solid"
    borderColor="gray.100"
    borderRadius="12px"
    p={3}
    cursor={onClick ? "pointer" : "default"}
    _hover={onClick ? { borderColor: `${tone}.300`, bg: `${tone}.50` } : undefined}
    onClick={onClick}
  >
    <Text fontSize="xs" color="gray.500" fontWeight="700">{label}</Text>
    <Text fontSize="xl" fontWeight="800" color={`${tone}.600`}>{value}</Text>
    {sub && <Text fontSize="xs" color="gray.500">{sub}</Text>}
  </Box>
);

export const TileGrid = ({ children }) => <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} spacing={3} mb={5}>{children}</SimpleGrid>;

export const PAYMENT_HELP = {
  CREDIT_LIMIT: "Dispatch follows the party's credit limit / overdue rules (same as Sales)",
  MIN_PERCENT: "A minimum % of the booking value must be received before dispatch",
  FULL_PAYMENT: "The invoice must be fully covered by the advance before dispatch",
};
