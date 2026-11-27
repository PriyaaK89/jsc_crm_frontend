// Additional Discount → request lists. One component, eight screens (AppRoute passes `view`):
//   all · mine · pending_rsm · pending_final · approved · rejected · expired · clarification
// Backend: GET /additional-discount/requests?tab=… (server applies scope and permissions).
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, HStack, Select, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  AdrBadge, DataTable, ErrorBox, FilterRow, PageTitle, Pager, adrApi, apiError, fmtDate, rs, useAdrMe,
} from "./adrShared";

const VIEWS = {
  all: { tab: "all", title: "All Requests", subtitle: "Every request you can see", statuses: ["DRAFT", "PENDING_RSM", "PENDING_FINAL", "CLARIFICATION", "APPROVED", "PARTIALLY_APPROVED", "REJECTED", "CANCELLED", "EXPIRED"] },
  mine: { tab: "mine", title: "My Requests", subtitle: "Requests you have raised (drafts included)", statuses: ["DRAFT", "PENDING_RSM", "PENDING_FINAL", "CLARIFICATION", "APPROVED", "PARTIALLY_APPROVED", "REJECTED", "CANCELLED", "EXPIRED"] },
  pending_rsm: { tab: "pending_rsm", title: "Pending RSM Approvals", subtitle: "Waiting for the RSM's recommendation (it does not activate the discount)", action: "rsm" },
  pending_final: { tab: "pending_final", title: "Pending Final Approvals", subtitle: "Recommended by the RSM, or sent directly because there is no RSM in the line", action: "final" },
  approved: { tab: "approved", title: "Approved Requests", subtitle: "Active approvals that sales can use until the validity date", statuses: ["APPROVED", "PARTIALLY_APPROVED"] },
  rejected: { tab: "rejected", title: "Rejected Requests", subtitle: "Rejected by the RSM or at final approval, with remarks" },
  expired: { tab: "expired", title: "Expired Requests", subtitle: "Approvals past their validity date" },
  clarification: { tab: "clarification", title: "Clarification Management", subtitle: "Requests sent back to the employee — reply from the request page" },
};

const SORTS = [
  ["created_at", "Newest"],
  ["request_no", "Request no."],
  ["party", "Party"],
  ["requested_by", "Employee"],
  ["requested_discount_value", "Requested value"],
  ["approved_discount_value", "Approved value"],
  ["valid_till", "Valid till"],
];

const AdrRequestList = ({ view = "all" }) => {
  const cfg = VIEWS[view] || VIEWS.all;
  const navigate = useNavigate();
  const { me } = useAdrMe();
  const [filters, setFilters] = useState({ search: "", status: "", date_from: "", date_to: "" });
  const [sort, setSort] = useState("created_at");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ rows: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => setPage(1), [view, filters, sort]);
  const params = useMemo(
    () => ({ tab: cfg.tab, ...filters, sort, dir: sort === "created_at" ? "desc" : sort.endsWith("value") ? "desc" : "asc", page, limit: 25 }),
    [cfg.tab, filters, sort, page],
  );
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await adrApi.list(params));
    } catch (err) {
      setError(apiError(err, "Could not load requests"));
    } finally {
      setLoading(false);
    }
  }, [params]);
  useEffect(() => {
    load();
  }, [load]);

  const open = (r) => {
    if (cfg.action === "rsm" && r.status === "PENDING_RSM" && me && Number(r.rsm_user_id) === Number(me.id)) return navigate(`/additional-discount/requests/${r.id}/rsm-approval`);
    if (cfg.action === "final" && r.status === "PENDING_FINAL" && me && me.can_final_approve && Number(r.requested_by) !== Number(me.id)) return navigate(`/additional-discount/requests/${r.id}/final-approval`);
    if (r.status === "DRAFT" && me && Number(r.requested_by) === Number(me.id)) return navigate(`/additional-discount/requests/${r.id}/edit`);
    return navigate(`/additional-discount/requests/${r.id}`);
  };

  return (
    <Box>
      <PageTitle
        title={cfg.title}
        subtitle={cfg.subtitle}
        right={
          <HStack>
            <Select size="sm" value={sort} onChange={(e) => setSort(e.target.value)} borderRadius="8px" maxW="180px">
              {SORTS.map(([k, l]) => <option key={k} value={k}>Sort: {l}</option>)}
            </Select>
            {me && me.can_create && <Button size="sm" colorScheme="teal" onClick={() => navigate("/additional-discount/requests/new")}>+ New request</Button>}
          </HStack>
        }
      />
      <FilterRow value={filters} onChange={setFilters} statuses={cfg.statuses} />
      {error && <ErrorBox message={error} onRetry={load} />}
      <DataTable
        rows={result.rows}
        onRowClick={open}
        emptyText={loading ? "Loading…" : "No requests here."}
        columns={[
          { key: "request_no", label: "Request", render: (r) => <Box><Text fontWeight="700">{r.request_no}</Text><Text fontSize="xs" color="gray.500">{fmtDate(r.created_at)} · {r.item_count} product(s)</Text></Box> },
          { key: "party_name", label: "Party", render: (r) => <Box><Text>{r.party_name}</Text><Text fontSize="xs" color="gray.500">{r.party_state || ""}</Text></Box> },
          { key: "requested_by_name", label: "Employee" },
          { key: "route", label: "RSM", render: (r) => (r.rsm_skipped ? <Text fontSize="xs" color="gray.500">Direct to final</Text> : r.rsm_name || "—") },
          { key: "reason_text", label: "Reason" },
          { key: "requested_discount_value", label: "Requested", numeric: true, render: (r) => rs(r.requested_discount_value) },
          { key: "approved_discount_value", label: "Approved / Used", numeric: true, render: (r) => (r.approved_discount_value ? <Box><Text>{rs(r.approved_discount_value)}</Text><Text fontSize="xs" color="gray.500">used {rs(r.utilized_discount_value)}</Text></Box> : "—") },
          { key: "valid_till", label: "Valid till", render: (r) => (r.valid_till ? fmtDate(r.valid_till) : "—") },
          { key: "status", label: "Status", render: (r) => <AdrBadge status={r.status} /> },
        ]}
      />
      <Pager pagination={result.pagination} onPage={setPage} loading={loading} />
    </Box>
  );
};

export default AdrRequestList;
