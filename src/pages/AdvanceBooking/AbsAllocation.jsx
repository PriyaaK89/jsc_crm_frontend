// Advance Booking → Stock Allocation: per variety, free stock by godown / batch and the confirmed
// bookings waiting, in priority order. Auto-allocate by priority or pro-rata when supply is short.
import React, { useCallback, useEffect, useState } from "react";
import { Alert, AlertIcon, Box, Button, Flex, HStack, Select, Text } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { absApi, apiError } from "../../services/absApi";
import { DataTable, ErrorBox, Loading, PageTitle, SeasonSelect, Tile, TileGrid, fmtDate, qty, useAbsMasters, useAbsToast, useConfirm } from "./absShared";

const AbsAllocation = () => {
  const navigate = useNavigate();
  const notify = useAbsToast();
  const [confirm, confirmDialog] = useConfirm();
  const [params] = useSearchParams();
  const { masters } = useAbsMasters();
  const [seasonId, setSeasonId] = useState(Number(params.get("season_id")) || "");
  const [products, setProducts] = useState([]);
  const [itemId, setItemId] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!seasonId && masters && masters.seasons.length) setSeasonId((masters.open_seasons[0] || masters.seasons[0]).id);
  }, [masters, seasonId]);

  useEffect(() => {
    if (!seasonId) return;
    absApi.season(seasonId).then((s) => {
      setProducts(s.products || []);
      setItemId((cur) => cur || (s.products[0] ? s.products[0].stock_item_id : ""));
    }).catch((err) => setError(apiError(err)));
  }, [seasonId]);

  const load = useCallback(async () => {
    if (!itemId) return;
    setError(null);
    try {
      setData(await absApi.queue(seasonId, itemId));
    } catch (err) {
      setError(apiError(err, "Could not load the allocation queue"));
    }
  }, [seasonId, itemId]);
  useEffect(() => {
    setData(null);
    load();
  }, [load]);

  const auto = async (mode) => {
    const text = mode === "PRO_RATA"
      ? "Share the free stock over all waiting bookings in proportion to what each still needs?"
      : `Give the free stock to waiting bookings in priority order (${data.priority === "ADVANCE_FIRST" ? "advance paid first, then booking date" : "booking date"})?`;
    if (!(await confirm("Auto allocate", text, { yes: "Allocate" }))) return;
    setBusy(true);
    try {
      const res = await absApi.autoAllocate({ season_id: seasonId, stock_item_id: itemId, mode });
      notify.ok(res.message);
      await load();
    } catch (err) {
      notify.fail(err);
    } finally {
      setBusy(false);
    }
  };

  const product = products.find((p) => p.stock_item_id === Number(itemId));

  return (
    <Box>
      {confirmDialog}
      <PageTitle title="Stock Allocation" subtitle="Reserve godown / batch stock for confirmed bookings" />
      <Flex gap={2} mb={4} wrap="wrap">
        <SeasonSelect seasons={masters ? masters.seasons : []} value={seasonId} onChange={(v) => { setSeasonId(v); setItemId(""); }} />
        <Select size="sm" maxW="320px" borderRadius="8px" value={itemId} onChange={(e) => setItemId(Number(e.target.value))}>
          {products.map((p) => <option key={p.stock_item_id} value={p.stock_item_id}>{p.item_name}</option>)}
        </Select>
      </Flex>
      {error && <ErrorBox message={error} onRetry={load} />}
      {!data ? (itemId ? <Loading /> : <Text fontSize="sm" color="gray.500">Pick a season and a variety.</Text>) : (
        <>
          <TileGrid>
            <Tile label="Waiting bookings" value={data.queue.length} tone="blue" />
            <Tile label="Still to allocate" value={qty(data.need)} tone="orange" />
            <Tile label="Free stock" value={qty(data.free)} tone="green" />
            <Tile label="Shortfall" value={qty(data.shortfall)} tone={data.shortfall > 0 ? "red" : "gray"} />
            <Tile label="Production plan" value={product && product.production_qty !== null ? qty(product.production_qty) : "—"} sub={product ? `booked ${qty(product.booked_qty)}` : undefined} tone="gray" />
          </TileGrid>
          {data.shortfall > 0 && <Alert status="warning" borderRadius="10px" mb={3} fontSize="sm"><AlertIcon />Supply is short by {qty(data.shortfall)}. Use pro-rata to share it fairly, or short-close bookings that will not be supplied.</Alert>}
          <HStack mb={4}>
            <Button size="sm" colorScheme="teal" isLoading={busy} isDisabled={!data.queue.length || data.free <= 0} onClick={() => auto("PRIORITY")}>Auto allocate by priority</Button>
            <Button size="sm" variant="outline" colorScheme="teal" isLoading={busy} isDisabled={!data.queue.length || data.free <= 0} onClick={() => auto("PRO_RATA")}>Auto allocate pro-rata</Button>
          </HStack>
          <Text fontWeight="800" fontSize="sm" mb={2}>Free stock by godown / batch</Text>
          <DataTable
            rows={data.availability}
            rowKey={(r) => `${r.godown_id}|${r.batch_no || ""}`}
            emptyText="No stock of this variety in any godown."
            columns={[
              { key: "godown_name", label: "Godown" },
              { key: "batch_no", label: "Batch", render: (r) => r.batch_no || "—" },
              { key: "physical", label: "In godown", numeric: true, render: (r) => qty(r.physical) },
              { key: "reserved", label: "Reserved (ABS)", numeric: true, render: (r) => qty(r.reserved) },
              { key: "free", label: "Free", numeric: true, render: (r) => <Text fontWeight="700" color={r.free > 0 ? "green.600" : "gray.500"}>{qty(r.free)}</Text> },
            ]}
          />
          <Text fontWeight="800" fontSize="sm" mt={5} mb={2}>Waiting bookings (priority order)</Text>
          <DataTable
            rows={data.queue}
            rowKey={(r) => r.booking_item_id}
            onRowClick={(r) => navigate(`/advance-booking/bookings/${r.booking_id}`)}
            emptyText="No confirmed booking is waiting for this variety."
            columns={[
              { key: "n", label: "#", render: (r) => data.queue.indexOf(r) + 1 },
              { key: "booking_no", label: "Booking", render: (r) => <Box><Text fontWeight="700">{r.booking_no}</Text><Text fontSize="xs" color="gray.500">{fmtDate(r.booking_date)}</Text></Box> },
              { key: "party_name", label: "Party" },
              { key: "paid_pct", label: "Advance paid", numeric: true, render: (r) => `${r.paid_pct}%` },
              { key: "supply_qty", label: "Confirmed", numeric: true, render: (r) => qty(r.supply_qty) },
              { key: "allocated_qty", label: "Allocated", numeric: true, render: (r) => qty(r.allocated_qty) },
              { key: "to_allocate", label: "Waiting", numeric: true, render: (r) => <Text fontWeight="700" color="orange.600">{qty(r.to_allocate)}</Text> },
            ]}
          />
        </>
      )}
    </Box>
  );
};

export default AbsAllocation;