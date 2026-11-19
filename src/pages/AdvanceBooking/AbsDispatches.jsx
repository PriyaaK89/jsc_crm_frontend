// Advance Booking → Dispatches: vehicles on the road and delivery confirmation (POD).
import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Flex, Input, Select, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { absApi, apiError } from "../../services/absApi";
import { AbsBadge, DataTable, ErrorBox, PageTitle, fmtDate, money, qty } from "./absShared";
import { DeliverModal } from "./absModals";

const AbsDispatches = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("IN_TRANSIT");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState({ items: [] });
  const [error, setError] = useState(null);
  const [deliver, setDeliver] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setRows(await absApi.dispatches({ status: status || undefined, search: search.trim() || undefined, limit: 100 }));
    } catch (err) {
      setError(apiError(err, "Could not load dispatches"));
    }
  }, [status, search]);
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const openDeliver = async (d) => {
    // the list rows carry no item lines; read the full dispatch
    try {
      setDeliver(await absApi.dispatchDetail(d.id));
    } catch (err) {
      setError(apiError(err, "Could not open the dispatch"));
    }
  };

  return (
    <Box>
      <PageTitle title="Dispatches" subtitle="Each dispatch is a Sales invoice from one godown on one vehicle" />
      <Flex gap={2} mb={4} wrap="wrap">
        <Select size="sm" maxW="220px" value={status} onChange={(e) => setStatus(e.target.value)} borderRadius="8px">
          <option value="IN_TRANSIT">In transit</option>
          <option value="DELIVERED_WITH_ISSUES">Delivered with shortage / damage</option>
          <option value="DELIVERED">Delivered</option>
          <option value="">All</option>
        </Select>
        <Input size="sm" maxW="300px" placeholder="Dispatch, invoice, booking, party, vehicle" value={search} onChange={(e) => setSearch(e.target.value)} borderRadius="8px" />
      </Flex>
      {error && <ErrorBox message={error} onRetry={load} />}
      <DataTable
        rows={rows.items}
        emptyText="Nothing here."
        columns={[
          { key: "dispatch_no", label: "Dispatch", render: (d) => <Box><Text fontWeight="700">{d.dispatch_no}</Text><Text fontSize="xs" color="gray.500">{fmtDate(d.dispatch_date)} · {d.godown_name}</Text></Box> },
          { key: "booking_no", label: "Booking / party", render: (d) => <Box><Button size="xs" variant="link" colorScheme="teal" onClick={() => navigate(`/advance-booking/bookings/${d.booking_id}`)}>{d.booking_no}</Button><Text fontSize="xs">{d.party_name}</Text></Box> },
          { key: "invoice_no", label: "Invoice", render: (d) => d.invoice_no || d.sale_id },
          { key: "vehicle_no", label: "Vehicle", render: (d) => <Box><Text>{d.vehicle_no}</Text><Text fontSize="xs" color="gray.500">{[d.transport_name, d.lr_no && `LR ${d.lr_no}`, d.driver_mobile].filter(Boolean).join(" · ")}</Text></Box> },
          { key: "total_qty", label: "Qty", numeric: true, render: (d) => qty(d.total_qty) },
          { key: "invoice_amount", label: "Invoice", numeric: true, render: (d) => money(d.invoice_amount) },
          { key: "balance_due", label: "Balance due", numeric: true, render: (d) => money(d.balance_due) },
          { key: "status", label: "Delivery", render: (d) => <Box><AbsBadge status={d.status} />{d.delivery_remarks ? <Text fontSize="xs" color="orange.600">{d.delivery_remarks}</Text> : null}</Box> },
          { key: "x", label: "", render: (d) => (d.status === "IN_TRANSIT" ? <Button size="xs" colorScheme="green" variant="outline" onClick={() => openDeliver(d)}>Delivered</Button> : null) },
        ]}
      />
      {deliver && <DeliverModal dispatch={deliver} isOpen onClose={() => setDeliver(null)} onDone={load} />}
    </Box>
  );
};

export default AbsDispatches;
