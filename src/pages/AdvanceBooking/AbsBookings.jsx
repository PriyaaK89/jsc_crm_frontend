// Advance Booking → Bookings: work queues (approval, confirmation, overdue advance, dispatch) and all bookings.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Flex, HStack, Input, Select, Tab, TabList, Tabs, Text } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { absApi, apiError } from "../../services/absApi";
import { toRecordId } from "../../services/businessPlanApi";
import { AbsBadge, DataTable, ErrorBox, PageTitle, SeasonSelect, fmtDate, money, qty, useAbsMasters, useAbsToast } from "./absShared";

const TABS = [
  ["approval", "Pending My Approval", { scope: "pending" }],
  ["confirm", "To Confirm", { scope: "team", status: "APPROVED" }],
  ["overdue", "Advance Overdue", { scope: "team", flag: "overdue" }],
  ["allocate", "To Allocate", { scope: "team", flag: "allocation" }],
  ["dispatch", "Ready to Dispatch", { scope: "team", flag: "dispatch" }],
  ["all", "All Bookings", { scope: "team" }],
];

const STATUSES = ["", "DRAFT", "SUBMITTED", "RETURNED", "APPROVED", "CONFIRMED", "PARTIALLY_DISPATCHED", "DISPATCHED", "DELIVERED", "CLOSED", "CANCELLED", "REJECTED"];

const AbsBookings = () => {
  const navigate = useNavigate();
  const notify = useAbsToast();
  const [params, setParams] = useSearchParams();
  const { masters } = useAbsMasters();
  const tab = TABS.some(([k]) => k === params.get("tab")) ? params.get("tab") : "all";
  const seasonId = Number(params.get("season_id")) || "";
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const set = (k, v) => {
    const p = new URLSearchParams(params);
    if (v === "" || v === undefined || v === null) p.delete(k);
    else p.set(k, v);
    setParams(p, { replace: true });
  };

  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => setPage(1), [tab, seasonId, status, query]);

  const filters = useMemo(() => {
    const base = TABS.find(([k]) => k === tab)[2];
    return { ...base, season_id: seasonId || undefined, status: base.status || status || undefined, search: query || undefined, page, limit: 25 };
  }, [tab, seasonId, status, query, page]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await absApi.bookings(filters));
    } catch (err) {
      setError(apiError(err, "Could not load bookings"));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const open = (b) => {
    const id = toRecordId(b.id);
    if (id) navigate(`/advance-booking/bookings/${id}`);
    else notify.fail("This row has no booking to open");
  };

  return (
    <Box>
      <PageTitle title="Seed Advance Bookings" subtitle="Booked in the field by sales officers for their distributors / dealers" />
      <Tabs size="sm" variant="soft-rounded" colorScheme="teal" index={TABS.findIndex(([k]) => k === tab)} onChange={(i) => set("tab", TABS[i][0])} mb={3}>
        <TabList flexWrap="wrap" gap={1}>
          {TABS.map(([k, l]) => (
            <Tab key={k}>{l}</Tab>
          ))}
        </TabList>
      </Tabs>
      <Flex gap={2} mb={4} wrap="wrap">
        <SeasonSelect seasons={masters ? masters.seasons : []} value={seasonId} onChange={(v) => set("season_id", v)} allowAll />
        {tab === "all" && (
          <Select size="sm" maxW="220px" value={status} onChange={(e) => setStatus(e.target.value)} borderRadius="8px">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s ? s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : "All statuses"}</option>
            ))}
          </Select>
        )}
        <Input size="sm" maxW="280px" placeholder="Booking no. or party" value={search} onChange={(e) => setSearch(e.target.value)} borderRadius="8px" />
      </Flex>
      {error && <ErrorBox message={error} onRetry={load} />}
      <DataTable
        rows={result.items}
        onRowClick={open}
        emptyText={loading ? "Loading…" : "No bookings here."}
        columns={[
          { key: "booking_no", label: "Booking", render: (b) => <Box><Text fontWeight="700">{b.booking_no}</Text><Text fontSize="xs" color="gray.500">{fmtDate(b.booking_date)} · {b.season_name}</Text></Box> },
          { key: "party_name", label: "Party", render: (b) => <Box><Text>{b.party_name}</Text><Text fontSize="xs" color="gray.500">{b.party_location || ""}</Text></Box> },
          { key: "booked_by_name", label: "Booked by" },
          { key: "total_qty", label: "Qty", numeric: true, render: (b) => qty(b.total_qty) },
          { key: "net_value", label: "Value", numeric: true, render: (b) => money(b.net_value) },
          {
            key: "advance",
            label: "Advance",
            render: (b) => (
              <Box>
                <Text fontSize="sm">{money(b.advance_received)} <Text as="span" color="gray.500">/ {money(b.advance_required)}</Text></Text>
                {b.advance_overdue && <Text fontSize="xs" color="red.500" fontWeight="700">Overdue since {fmtDate(b.advance_due_date)}</Text>}
                {b.advance_pending_verification > 0 && <Text fontSize="xs" color="orange.500">{money(b.advance_pending_verification)} to verify</Text>}
              </Box>
            ),
          },
          { key: "supply", label: "Allocated / Dispatched", render: (b) => `${qty(b.allocated_qty)} / ${qty(b.dispatched_qty)}` },
          { key: "status", label: "Status", render: (b) => <Box><AbsBadge status={b.status} />{b.pending_level ? <Text fontSize="xs" color="gray.500">L{b.pending_level} · {b.pending_with}</Text> : null}</Box> },
        ]}
      />
      <Flex justify="space-between" align="center" mt={3}>
        <Text fontSize="sm" color="gray.500">{result.total} booking(s) · page {page} of {result.totalPages || 1}</Text>
        <HStack>
          <Button size="sm" onClick={() => setPage((p) => p - 1)} isDisabled={page <= 1 || loading}>Previous</Button>
          <Button size="sm" onClick={() => setPage((p) => p + 1)} isDisabled={page >= (result.totalPages || 1) || loading}>Next</Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default AbsBookings;
