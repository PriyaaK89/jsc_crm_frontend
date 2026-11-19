// Advance Booking → Dashboard: one season at a glance + shortcuts to the work queues.
import React, { useCallback, useEffect, useState } from "react";
import { Box, Flex, Progress, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { absApi, apiError } from "../../services/absApi";
import { DataTable, ErrorBox, Loading, PageTitle, SeasonSelect, Tile, TileGrid, money, qty, useAbsMasters } from "./absShared";

const AbsDashboard = () => {
  const navigate = useNavigate();
  const { masters, error: mErr } = useAbsMasters();
  const [seasonId, setSeasonId] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await absApi.dashboard(seasonId || undefined);
      setData(d);
      if (!seasonId && d.season) setSeasonId(d.season.id);
    } catch (err) {
      setError(apiError(err, "Could not load the dashboard"));
    }
  }, [seasonId]);

  useEffect(() => {
    load();
  }, [load]);

  if (mErr) return <ErrorBox message={mErr} />;
  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!data || !masters) return <Loading />;
  if (!data.season) return <PageTitle title="Advance Booking" subtitle="No booking season yet — create one in Settings." />;

  const t = data.totals;
  const go = (q) => navigate(`/advance-booking/bookings?season_id=${data.season.id}&${q}`);

  return (
    <Box>
      <PageTitle
        title="Advance Booking"
        subtitle={`${data.season.name} · booking ${data.season.booking_start} – ${data.season.booking_end}`}
        right={<SeasonSelect seasons={masters.seasons} value={seasonId} onChange={setSeasonId} />}
      />
      <TileGrid>
        <Tile label="Bookings" value={t.bookings} sub={`${t.parties} parties`} tone="blue" onClick={() => go("tab=all")} />
        <Tile label="Booking value" value={money(t.booking_value)} sub="before GST" tone="blue" />
        <Tile label="Advance received" value={money(t.advance_received)} sub={`${t.collection_pct}% of value`} tone="green" onClick={() => navigate("/advance-booking/payments")} />
        <Tile label="To verify" value={money(t.advance_pending_verification)} sub="payments in the field" tone="orange" onClick={() => navigate("/advance-booking/payments")} />
        <Tile label="Invoiced" value={money(t.invoiced_value)} sub="dispatched so far" tone="teal" />
        <Tile label="Refunds due" value={t.refunds_due} sub={money(t.refunds_due_amount)} tone="red" onClick={() => navigate("/advance-booking/payments?tab=refunds")} />
      </TileGrid>
      <Text fontWeight="800" fontSize="sm" mb={2}>Work waiting</Text>
      <TileGrid>
        <Tile label="Pending approval" value={t.pending_approval} tone="orange" onClick={() => go("tab=approval")} />
        <Tile label="To confirm" value={t.awaiting_confirmation} tone="purple" onClick={() => go("tab=confirm")} />
        <Tile label="Advance overdue" value={t.advance_overdue} tone="red" onClick={() => go("tab=overdue")} />
        <Tile label="To allocate" value={t.to_allocate} tone="blue" onClick={() => navigate(`/advance-booking/allocation?season_id=${data.season.id}`)} />
        <Tile label="Ready to dispatch" value={t.ready_to_dispatch} tone="teal" onClick={() => go("tab=dispatch")} />
        <Tile label="In transit" value={t.in_transit} sub={t.delivery_issues ? `${t.delivery_issues} with issues` : undefined} tone="cyan" onClick={() => navigate("/advance-booking/dispatches")} />
      </TileGrid>

      <Box border="1px solid" borderColor="gray.100" borderRadius="12px" p={4} mb={4}>
        <Text fontWeight="800" fontSize="sm" mb={1}>Demand vs production plan (by variety)</Text>
        <Text fontSize="xs" color="gray.500" mb={3}>Supply = confirmed quantity less short-closed. Gap = production plan − supply (negative = more booked than planned).</Text>
        <DataTable
          rows={data.varieties}
          rowKey={(r) => r.stock_item_id}
          emptyText="No bookings yet."
          columns={[
            { key: "item_name", label: "Variety", render: (r) => <Box><Text fontWeight="700">{r.item_name}</Text><Text fontSize="xs" color="gray.500">{r.crop_name || ""}</Text></Box> },
            { key: "bookings", label: "Bookings", numeric: true },
            { key: "booked_qty", label: "Booked", numeric: true, render: (r) => `${qty(r.booked_qty)} ${r.unit || ""}` },
            { key: "production_qty", label: "Production plan", numeric: true, render: (r) => (r.production_qty === null ? "—" : qty(r.production_qty)) },
            { key: "supply_qty", label: "Supply", numeric: true, render: (r) => qty(r.supply_qty) },
            { key: "demand_gap", label: "Gap", numeric: true, render: (r) => (r.demand_gap === null ? "—" : <Text color={r.demand_gap < 0 ? "red.500" : "green.600"} fontWeight="700">{qty(r.demand_gap)}</Text>) },
            {
              key: "progress",
              label: "Allocated / Dispatched / Delivered",
              render: (r) => (
                <Box minW="180px">
                  <Progress size="xs" colorScheme="teal" value={r.supply_qty ? (r.dispatched_qty / r.supply_qty) * 100 : 0} borderRadius="full" mb={1} />
                  <Text fontSize="xs" color="gray.600">{qty(r.allocated_qty)} / {qty(r.dispatched_qty)} / {qty(r.delivered_qty)}</Text>
                </Box>
              ),
            },
            { key: "booking_value", label: "Value", numeric: true, render: (r) => money(r.booking_value) },
          ]}
        />
      </Box>

      <Flex gap={4} direction={{ base: "column", xl: "row" }}>
        <Box flex="1" border="1px solid" borderColor="gray.100" borderRadius="12px" p={4}>
          <Text fontWeight="800" fontSize="sm" mb={3}>Top parties</Text>
          <DataTable
            rows={data.parties}
            rowKey={(r) => r.party_ledger_id}
            columns={[
              { key: "party_name", label: "Party", render: (r) => <Box><Text fontWeight="700">{r.party_name}</Text><Text fontSize="xs" color="gray.500">{r.location || ""}</Text></Box> },
              { key: "booking_value", label: "Booked", numeric: true, render: (r) => money(r.booking_value) },
              { key: "advance_received", label: "Advance", numeric: true, render: (r) => money(r.advance_received) },
              { key: "invoiced_value", label: "Invoiced", numeric: true, render: (r) => money(r.invoiced_value) },
            ]}
          />
        </Box>
        <Box flex="1" border="1px solid" borderColor="gray.100" borderRadius="12px" p={4}>
          <Text fontWeight="800" fontSize="sm" mb={3}>Field officers</Text>
          <DataTable
            rows={data.employees}
            rowKey={(r) => r.booked_by}
            columns={[
              { key: "employee_name", label: "Officer" },
              { key: "bookings", label: "Bookings", numeric: true },
              { key: "parties", label: "Parties", numeric: true },
              { key: "booking_value", label: "Booked", numeric: true, render: (r) => money(r.booking_value) },
              { key: "advance_received", label: "Advance", numeric: true, render: (r) => money(r.advance_received) },
            ]}
          />
        </Box>
      </Flex>
    </Box>
  );
};

export default AbsDashboard;
