// Advance Booking → one booking: lines, money, stock, dispatches, approval and timeline,
// with the action buttons the user is allowed (computed by the server in `actions`).
import React, { useCallback, useEffect, useState } from "react";
import { Alert, AlertIcon, Box, Button, Flex, HStack, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Wrap } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { absApi, apiError } from "../../services/absApi";
import { toRecordId } from "../../services/businessPlanApi";
import {
  AbsBadge,
  ApprovalSteps,
  DataTable,
  ErrorBox,
  InfoGrid,
  InvalidId,
  Loading,
  Tile,
  TileGrid,
  fmtDate,
  fmtDateTime,
  money,
  qty,
  useAbsMasters,
  useAbsToast,
  useCommentPrompt,
} from "./absShared";
import { AllocateModal, CancelModal, ConfirmModal, DeliverModal, DispatchModal, PaymentModal, ShortCloseModal, VerifyModal } from "./absModals";

const EVENT_LABEL = {
  CREATED: "Booked",
  UPDATED: "Edited",
  SUBMITTED: "Submitted",
  LEVEL_APPROVED: "Approved (level)",
  APPROVED: "Approved",
  RETURNED: "Returned",
  REJECTED: "Rejected",
  CONFIRMED: "Order confirmed",
  PAYMENT_RECORDED: "Payment recorded",
  PAYMENT_POSTED: "Advance received",
  PAYMENT_BOUNCED: "Cheque bounced",
  PAYMENT_REJECTED: "Payment rejected",
  ALLOCATED: "Stock allocated",
  ALLOCATION_RELEASED: "Stock released",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  DELIVERED_WITH_ISSUES: "Delivered (short / damaged)",
  LINE_SHORT_CLOSED: "Quantity short-closed",
  SHORT_CLOSED: "Balance closed",
  CANCELLED: "Cancelled",
  CLOSED: "Closed",
  STATUS: "Status",
  REFUND_PAID: "Refund paid",
  REFUND_FORFEITED: "Advance forfeited",
  REFUND_CARRIED_FORWARD: "Advance carried forward",
};

const AbsBookingDetail = () => {
  const params = useParams();
  const id = toRecordId(params.id);
  const navigate = useNavigate();
  const notify = useAbsToast();
  const { masters } = useAbsMasters();
  const [askComment, commentDialog] = useCommentPrompt();
  const [b, setB] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(null); // { kind, payload }

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      setB(await absApi.booking(id));
    } catch (err) {
      setError(apiError(err, "Could not load the booking"));
    }
  }, [id]);
  useEffect(() => {
    load();
  }, [load]);

  const back = () => navigate("/advance-booking/bookings");
  if (!id) return <InvalidId what="booking" onBack={back} />;
  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!b) return <Loading />;
  const a = b.actions || {};
  const close = () => setModal(null);

  const decide = async (action, title, required) => {
    const comment = await askComment(title, { required, placeholder: required ? "Reason (the officer sees this)" : "Comment (optional)", yes: title, danger: action === "reject" });
    if (comment === null) return;
    setBusy(true);
    try {
      const res = await absApi.action(b.id, action, { comment });
      notify.ok(res.message);
      await load();
    } catch (err) {
      notify.fail(err);
    } finally {
      setBusy(false);
    }
  };

  const refusePayment = async (p, kind) => {
    const reason = await askComment(kind === "bounce" ? "Cheque bounced" : "Reject payment", { required: true, placeholder: "Reason", yes: "Save", danger: true });
    if (reason === null) return;
    try {
      notify.ok((await absApi.refusePayment(p.id, kind, reason)).message);
      await load();
    } catch (err) {
      notify.fail(err);
    }
  };

  const release = async (al) => {
    const reason = await askComment("Release reserved stock", { required: true, placeholder: "Why is this stock released?", yes: "Release", danger: true });
    if (reason === null) return;
    try {
      notify.ok((await absApi.releaseAllocation(al.id, reason)).message);
      await load();
    } catch (err) {
      notify.fail(err);
    }
  };

  return (
    <Box>
      {commentDialog}
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={3} mb={4}>
        <Box>
          <Text fontSize="xs" color="gray.500" fontWeight="800">{b.booking_no} · {b.season_name}</Text>
          <Text fontSize="lg" fontWeight="800">{b.party_name}</Text>
          <Text fontSize="sm" color="gray.500">
            Booked {fmtDate(b.booking_date)} by {b.booked_by_name}
            {b.requested_delivery_from ? ` · delivery wanted ${fmtDate(b.requested_delivery_from)} – ${fmtDate(b.requested_delivery_to)}` : ""}
          </Text>
          {b.pending_level && <Text fontSize="sm" mt={1} fontWeight="700" color="orange.600">Approval: Level {b.pending_level} — pending with {b.pending_with}</Text>}
        </Box>
        <Wrap justify="flex-end" spacing={2}>
          <AbsBadge status={b.status} />
          {a.can_approve && <Button size="sm" colorScheme="green" isLoading={busy} onClick={() => decide("approve", a.final_if_approved ? "Approve (final)" : `Approve level ${a.approval_level}`, false)}>{a.final_if_approved ? "Approve" : `Approve (L${a.approval_level})`}</Button>}
          {a.can_return && <Button size="sm" variant="outline" colorScheme="orange" isLoading={busy} onClick={() => decide("return", "Return for changes", true)}>Return</Button>}
          {a.can_reject && <Button size="sm" variant="outline" colorScheme="red" isLoading={busy} onClick={() => decide("reject", "Reject", true)}>Reject</Button>}
          {a.can_confirm && <Button size="sm" colorScheme="purple" onClick={() => setModal({ kind: "confirm" })}>Confirm order</Button>}
          {a.can_record_payment && <Button size="sm" colorScheme="teal" variant="outline" onClick={() => setModal({ kind: "payment" })}>Record payment</Button>}
          {a.can_allocate && <Button size="sm" colorScheme="blue" onClick={() => setModal({ kind: "allocate" })}>Allocate stock</Button>}
          {a.can_dispatch && <Button size="sm" colorScheme="teal" onClick={() => setModal({ kind: "dispatch" })}>Dispatch</Button>}
          {a.can_close && <Button size="sm" variant="outline" isLoading={busy} onClick={() => decide("close", "Close booking", false)}>Close</Button>}
          {a.can_cancel && <Button size="sm" variant="ghost" colorScheme="red" onClick={() => setModal({ kind: "cancel" })}>{b.dispatched_qty > 0 ? "Close balance" : "Cancel"}</Button>}
          <Button size="sm" variant="ghost" onClick={() => window.open(`/advance-booking/bookings/${b.id}/print`, "_blank")}>Print</Button>
          <Button size="sm" variant="ghost" onClick={back}>Back</Button>
        </Wrap>
      </Flex>
      {b.return_remark && ["RETURNED", "REJECTED"].includes(b.status) && <Alert status="warning" borderRadius="10px" mb={4} fontSize="sm"><AlertIcon />{b.status === "RETURNED" ? "Returned" : "Rejected"}: {b.return_remark}</Alert>}
      {b.cancel_reason && <Alert status="error" borderRadius="10px" mb={4} fontSize="sm"><AlertIcon />Cancelled: {b.cancel_reason}</Alert>}
      {b.advance_overdue && <Alert status="error" borderRadius="10px" mb={4} fontSize="sm"><AlertIcon />Advance overdue since {fmtDate(b.advance_due_date)} — {money(b.advance_shortfall)} still to collect.</Alert>}

      <TileGrid>
        <Tile label="Booking value" value={money(b.net_value)} sub={b.scheme_discount ? `after ${money(b.scheme_discount)} scheme` : "before GST"} tone="blue" />
        <Tile label="Advance" value={money(b.advance_received)} sub={`of ${money(b.advance_required)} · ${b.paid_pct}%`} tone={b.advance_shortfall > 0 ? "orange" : "green"} />
        <Tile label="To verify" value={money(b.advance_pending_verification)} tone="orange" />
        <Tile label="Allocated" value={qty(b.allocated_qty)} sub={`of ${qty(b.total_qty)}`} tone="blue" />
        <Tile label="Dispatched" value={qty(b.dispatched_qty)} sub={`delivered ${qty(b.delivered_qty)}`} tone="teal" />
        <Tile label="Invoiced" value={money(b.invoiced_value)} sub={b.advance_unadjusted > 0 ? `${money(b.advance_unadjusted)} advance unused` : undefined} tone="teal" />
      </TileGrid>

      <Tabs size="sm" colorScheme="teal" isLazy>
        <TabList flexWrap="wrap">
          <Tab>Varieties</Tab>
          <Tab>Payments ({b.payments.length})</Tab>
          <Tab>Stock ({b.allocations.length})</Tab>
          <Tab>Dispatch & delivery ({b.dispatches.length})</Tab>
          <Tab>Approval</Tab>
          <Tab>Timeline</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <DataTable
              rows={b.items}
              columns={[
                { key: "item_name", label: "Variety", render: (i) => <Box><Text fontWeight="700">{i.item_name}</Text><Text fontSize="xs" color="gray.500">{i.crop_name || ""}</Text></Box> },
                { key: "qty", label: "Booked", numeric: true, render: (i) => `${qty(i.qty)} ${i.unit || ""}` },
                { key: "supply_qty", label: "Supply", numeric: true, render: (i) => (i.confirmed_qty === null ? "—" : <Text color={i.supply_qty < i.qty ? "orange.600" : undefined}>{qty(i.supply_qty)}</Text>) },
                { key: "rate", label: "Booking rate", numeric: true, render: (i) => money(i.rate) },
                { key: "discount_per_unit", label: "Scheme / unit", numeric: true, render: (i) => (i.discount_per_unit ? `−${money(i.discount_per_unit)}` : "—") },
                { key: "gst_percent", label: "GST", numeric: true, render: (i) => `${i.gst_percent}%` },
                { key: "allocated_qty", label: "Allocated", numeric: true, render: (i) => qty(i.allocated_qty) },
                { key: "dispatched_qty", label: "Dispatched", numeric: true, render: (i) => qty(i.dispatched_qty) },
                { key: "delivered_qty", label: "Delivered", numeric: true, render: (i) => qty(i.delivered_qty) },
                { key: "x", label: "", render: (i) => (a.can_short_close && i.supply_qty > i.dispatched_qty ? <Button size="xs" variant="ghost" colorScheme="red" onClick={() => setModal({ kind: "short", payload: i })}>Short-close</Button> : null) },
              ]}
            />
            <Box mt={4}>
              <InfoGrid items={[
                ["Party GSTIN", b.party_gstin || "—"],
                ["Preferred godown", b.preferred_godown || "—"],
                ["Delivery address", b.delivery_address || "—"],
                ["Advance due by", b.advance_due_date ? fmtDate(b.advance_due_date) : "—"],
                ["Confirmed", b.confirmed_at ? `${fmtDateTime(b.confirmed_at)} by ${b.confirmed_by_name}` : "—"],
                ["Remarks", b.remarks || b.confirmation_remark || "—"],
              ]} />
            </Box>
          </TabPanel>
          <TabPanel px={0}>
            <DataTable
              rows={b.payments}
              emptyText="No payment yet."
              columns={[
                { key: "collected_on", label: "Date", render: (p) => fmtDate(p.collected_on) },
                { key: "amount", label: "Amount", numeric: true, render: (p) => money(p.amount) },
                { key: "payment_mode", label: "Mode", render: (p) => `${p.payment_mode}${p.instrument_no ? ` · ${p.instrument_no}` : ""}${p.bank_name ? ` (${p.bank_name})` : ""}` },
                { key: "collected_by_name", label: "Collected by" },
                { key: "status", label: "Status", render: (p) => <Box><AbsBadge status={p.status} />{p.reject_reason ? <Text fontSize="xs" color="red.500">{p.reject_reason}</Text> : null}</Box> },
                { key: "receipt_voucher_no", label: "Receipt", render: (p) => (p.receipt_voucher_no ? `${p.receipt_voucher_no} · ${fmtDate(p.receipt_date)}` : "—") },
                {
                  key: "x",
                  label: "",
                  render: (p) =>
                    p.status === "PENDING_VERIFICATION" && masters && masters.me.can_verify_payment ? (
                      <HStack>
                        <Button size="xs" colorScheme="green" onClick={() => setModal({ kind: "verify", payload: p })}>Verify</Button>
                        <Button size="xs" variant="ghost" colorScheme="red" onClick={() => refusePayment(p, "bounce")}>Bounced</Button>
                      </HStack>
                    ) : null,
                },
              ]}
            />
            {b.refunds.length > 0 && (
              <Box mt={4}>
                <Text fontWeight="800" fontSize="sm" mb={2}>Refunds / carry forward</Text>
                <DataTable rows={b.refunds} columns={[
                  { key: "amount", label: "Amount", numeric: true, render: (r) => money(r.amount) },
                  { key: "reason", label: "Reason" },
                  { key: "status", label: "Status", render: (r) => <AbsBadge status={r.status} /> },
                  { key: "payment_voucher_no", label: "Payment voucher", render: (r) => r.payment_voucher_no || "—" },
                ]} />
              </Box>
            )}
          </TabPanel>
          <TabPanel px={0}>
            <DataTable
              rows={b.allocations}
              emptyText="No stock reserved yet."
              columns={[
                { key: "item_name", label: "Variety" },
                { key: "godown_name", label: "Godown" },
                { key: "batch_no", label: "Batch", render: (x) => x.batch_no || "—" },
                { key: "qty", label: "Reserved", numeric: true, render: (x) => qty(x.qty) },
                { key: "dispatched_qty", label: "Dispatched", numeric: true, render: (x) => qty(x.dispatched_qty) },
                { key: "status", label: "Status", render: (x) => <AbsBadge status={x.status} /> },
                { key: "allocated_at", label: "Allocated", render: (x) => `${fmtDateTime(x.allocated_at)} · ${x.allocated_by_name || ""}` },
                { key: "z", label: "", render: (x) => (x.status === "ACTIVE" && masters && masters.me.can_allocate ? <Button size="xs" variant="ghost" colorScheme="red" onClick={() => release(x)}>Release</Button> : null) },
              ]}
            />
          </TabPanel>
          <TabPanel px={0}>
            <DataTable
              rows={b.dispatches}
              emptyText="Nothing dispatched yet."
              columns={[
                { key: "dispatch_no", label: "Dispatch", render: (d) => <Box><Text fontWeight="700">{d.dispatch_no}</Text><Text fontSize="xs" color="gray.500">{fmtDate(d.dispatch_date)} · {d.godown_name}</Text></Box> },
                { key: "invoice_no", label: "Invoice", render: (d) => <Box><Text>{d.invoice_no || d.sale_id}</Text><Text fontSize="xs" color="gray.500">{d.tax_mode === "IGST" ? "IGST" : "CGST+SGST"}</Text></Box> },
                { key: "vehicle_no", label: "Vehicle / LR", render: (d) => `${d.vehicle_no}${d.lr_no ? ` · LR ${d.lr_no}` : ""}${d.transport_name ? ` · ${d.transport_name}` : ""}` },
                { key: "total_qty", label: "Qty", numeric: true, render: (d) => qty(d.total_qty) },
                { key: "invoice_amount", label: "Invoice", numeric: true, render: (d) => money(d.invoice_amount) },
                { key: "advance_adjusted", label: "Advance adj.", numeric: true, render: (d) => money(d.advance_adjusted) },
                { key: "status", label: "Delivery", render: (d) => <Box><AbsBadge status={d.status} />{d.delivered_on ? <Text fontSize="xs" color="gray.500">{fmtDate(d.delivered_on)} · {d.received_by_name}</Text> : null}{d.delivery_remarks ? <Text fontSize="xs" color="orange.600">{d.delivery_remarks}</Text> : null}</Box> },
                { key: "x", label: "", render: (d) => (d.status === "IN_TRANSIT" ? <Button size="xs" colorScheme="green" variant="outline" onClick={() => setModal({ kind: "deliver", payload: d })}>Delivered</Button> : null) },
              ]}
            />
          </TabPanel>
          <TabPanel px={0}>
            {b.approval && (b.approval.steps || []).length ? <ApprovalSteps approval={b.approval} /> : <Text fontSize="sm" color="gray.500">No approval levels (not submitted, or approval switched off in Settings).</Text>}
          </TabPanel>
          <TabPanel px={0}>
            <DataTable
              rows={b.events}
              columns={[
                { key: "created_at", label: "When", render: (e) => fmtDateTime(e.created_at) },
                { key: "event", label: "What", render: (e) => EVENT_LABEL[e.event] || e.event },
                { key: "acted_by_name", label: "By", render: (e) => e.acted_by_name || "—" },
                { key: "detail", label: "Detail", wrap: true, render: (e) => [e.detail, e.remark && `“${e.remark}”`].filter(Boolean).join(" — ") || "—" },
              ]}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {modal && modal.kind === "confirm" && <ConfirmModal booking={b} isOpen onClose={close} onDone={load} />}
      {modal && modal.kind === "payment" && <PaymentModal booking={b} masters={masters} isOpen onClose={close} onDone={load} />}
      {modal && modal.kind === "verify" && <VerifyModal payment={modal.payload} masters={masters} isOpen onClose={close} onDone={load} />}
      {modal && modal.kind === "allocate" && <AllocateModal booking={b} isOpen onClose={close} onDone={load} />}
      {modal && modal.kind === "dispatch" && <DispatchModal booking={b} masters={masters} isOpen onClose={close} onDone={load} />}
      {modal && modal.kind === "deliver" && <DeliverModal dispatch={modal.payload} isOpen onClose={close} onDone={load} />}
      {modal && modal.kind === "cancel" && <CancelModal booking={b} masters={masters} isOpen onClose={close} onDone={load} />}
      {modal && modal.kind === "short" && <ShortCloseModal booking={b} item={modal.payload} isOpen onClose={close} onDone={load} />}
    </Box>
  );
};

export default AbsBookingDetail;
