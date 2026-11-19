// Advance Booking dialogs: confirm order, payment, verify, allocate, dispatch, deliver, cancel, short-close.
import React, { useEffect, useState } from "react";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { absApi, apiError } from "../../services/absApi";
import { Loading, money, qty, todayIST, useAbsToast } from "./absShared";

const Frame = ({ title, isOpen, onClose, children, onSubmit, busy, yes = "Save", size = "lg", danger = false, disabled = false }) => (
  <Modal isOpen={isOpen} onClose={busy ? () => {} : onClose} size={size} scrollBehavior="inside">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader fontSize="md">{title}</ModalHeader>
      <ModalCloseButton isDisabled={busy} />
      <ModalBody>{children}</ModalBody>
      <ModalFooter gap={2}>
        <Button size="sm" variant="ghost" onClick={onClose} isDisabled={busy}>Cancel</Button>
        <Button size="sm" colorScheme={danger ? "red" : "teal"} onClick={onSubmit} isLoading={busy} isDisabled={disabled}>{yes}</Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

const F = ({ label, children, help, isRequired }) => (
  <FormControl mb={3} isRequired={isRequired}>
    <FormLabel fontSize="sm" mb={1}>{label}</FormLabel>
    {children}
    {help && <Text fontSize="xs" color="gray.500" mt={1}>{help}</Text>}
  </FormControl>
);

// run an API call; toast; close on success
const useSubmit = (onDone, onClose) => {
  const notify = useAbsToast();
  const [busy, setBusy] = useState(false);
  const run = async (fn) => {
    setBusy(true);
    try {
      const res = await fn();
      notify.ok(res.message || "Saved");
      onClose();
      onDone && onDone(res);
    } catch (err) {
      notify.fail(err);
    } finally {
      setBusy(false);
    }
  };
  return [busy, run];
};

// ---------------------------------------------------------------- order confirmation
export const ConfirmModal = ({ booking, isOpen, onClose, onDone }) => {
  const [lines, setLines] = useState({});
  const [due, setDue] = useState("");
  const [remark, setRemark] = useState("");
  const [busy, run] = useSubmit(onDone, onClose);
  useEffect(() => {
    if (isOpen) setLines(Object.fromEntries(booking.items.map((i) => [i.id, String(i.qty)])));
  }, [isOpen, booking]);
  return (
    <Frame title={`Confirm order — ${booking.booking_no}`} isOpen={isOpen} onClose={onClose} busy={busy} yes="Confirm order" size="xl"
      onSubmit={() => run(() => absApi.action(booking.id, "confirm", { items: Object.entries(lines).map(([id, q]) => ({ id: Number(id), confirmed_qty: q })), advance_due_date: due || undefined, remark }))}>
      <Text fontSize="sm" color="gray.600" mb={3}>Check the production / stock position. Enter less than booked for short supply.</Text>
      <Table size="sm" mb={3}>
        <Thead><Tr><Th>Variety</Th><Th isNumeric>Booked</Th><Th isNumeric>Confirm qty</Th></Tr></Thead>
        <Tbody>
          {booking.items.map((i) => (
            <Tr key={i.id}>
              <Td>{i.item_name}</Td>
              <Td isNumeric>{qty(i.qty)} {i.unit}</Td>
              <Td isNumeric><Input size="sm" maxW="120px" type="number" value={lines[i.id] ?? ""} onChange={(e) => setLines({ ...lines, [i.id]: e.target.value })} /></Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <SimpleGrid columns={2} spacing={3}>
        <F label="Advance due by" help="Blank = Settings (days after confirmation)"><Input size="sm" type="date" value={due} onChange={(e) => setDue(e.target.value)} /></F>
        <F label="Remark"><Input size="sm" value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="e.g. Maize production short" /></F>
      </SimpleGrid>
    </Frame>
  );
};

// ---------------------------------------------------------------- payment
export const PaymentModal = ({ booking, masters, isOpen, onClose, onDone }) => {
  const canPost = !!(masters && masters.me.can_verify_payment);
  const [f, setF] = useState({});
  const [busy, run] = useSubmit(onDone, onClose);
  useEffect(() => {
    if (isOpen) setF({ amount: booking.advance_shortfall > 0 ? String(booking.advance_shortfall) : "", payment_mode: "Cheque/DD", collected_on: todayIST(), post_now: false, account_ledger_id: "", receipt_date: todayIST() });
  }, [isOpen, booking]);
  const s = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  return (
    <Frame title={`Advance payment — ${booking.booking_no}`} isOpen={isOpen} onClose={onClose} busy={busy} yes={f.post_now ? "Record & post receipt" : "Record payment"}
      onSubmit={() => run(() => absApi.recordPayment(booking.id, { ...f, account_ledger_id: f.post_now ? f.account_ledger_id : undefined }))}>
      <Text fontSize="sm" mb={3}>Advance expected {money(booking.advance_required)} · received {money(booking.advance_received)}{booking.advance_pending_verification > 0 ? ` · ${money(booking.advance_pending_verification)} waiting for verification` : ""}</Text>
      <SimpleGrid columns={2} spacing={3}>
        <F label="Amount (₹)" isRequired><Input size="sm" type="number" value={f.amount || ""} onChange={s("amount")} /></F>
        <F label="Mode" isRequired>
          <Select size="sm" value={f.payment_mode || ""} onChange={s("payment_mode")}>
            {(masters ? masters.payment_modes : ["Cash", "Cheque/DD", "E-Fund Transfer", "UPI", "Others"]).map((m) => <option key={m}>{m}</option>)}
          </Select>
        </F>
        <F label={f.payment_mode === "Cheque/DD" ? "Cheque / DD no." : "UTR / reference no."} isRequired={f.payment_mode !== "Cash"}><Input size="sm" value={f.instrument_no || ""} onChange={s("instrument_no")} /></F>
        <F label="Cheque / transfer date"><Input size="sm" type="date" value={f.instrument_date || ""} onChange={s("instrument_date")} /></F>
        <F label="Bank"><Input size="sm" value={f.bank_name || ""} onChange={s("bank_name")} /></F>
        <F label="Collected on"><Input size="sm" type="date" value={f.collected_on || ""} onChange={s("collected_on")} /></F>
      </SimpleGrid>
      <F label="Remarks"><Input size="sm" value={f.remarks || ""} onChange={s("remarks")} /></F>
      {canPost && (
        <Box borderTop="1px solid" borderColor="gray.100" pt={3}>
          <Checkbox isChecked={!!f.post_now} onChange={s("post_now")} mb={2}>Money is received — post the Receipt voucher now</Checkbox>
          {f.post_now && (
            <SimpleGrid columns={2} spacing={3}>
              <F label="Cash / bank ledger" isRequired>
                <Select size="sm" placeholder="Select" value={f.account_ledger_id} onChange={s("account_ledger_id")}>
                  {masters.account_ledgers.map((l) => <option key={l.id} value={l.id}>{l.ledger_name}</option>)}
                </Select>
              </F>
              <F label="Receipt date"><Input size="sm" type="date" value={f.receipt_date} onChange={s("receipt_date")} /></F>
            </SimpleGrid>
          )}
        </Box>
      )}
    </Frame>
  );
};

export const VerifyModal = ({ payment, masters, isOpen, onClose, onDone }) => {
  const [ledger, setLedger] = useState("");
  const [date, setDate] = useState(todayIST());
  const [busy, run] = useSubmit(onDone, onClose);
  if (!payment) return null;
  return (
    <Frame title="Verify & post receipt" isOpen={isOpen} onClose={onClose} busy={busy} yes="Post receipt" disabled={!ledger}
      onSubmit={() => run(() => absApi.verifyPayment(payment.id, { account_ledger_id: ledger, receipt_date: date }))}>
      <Text fontSize="sm" mb={3}>
        {money(payment.amount)} · {payment.payment_mode}{payment.instrument_no ? ` ${payment.instrument_no}` : ""}{payment.bank_name ? ` (${payment.bank_name})` : ""} from <b>{payment.party_name}</b> for {payment.booking_no}.
      </Text>
      <Alert status="info" fontSize="sm" borderRadius="8px" mb={3}><AlertIcon />A Receipt voucher is posted to the party ledger with an Advance reference = booking no. Only post once the money is in the bank (cheque cleared).</Alert>
      <SimpleGrid columns={2} spacing={3}>
        <F label="Cash / bank ledger" isRequired>
          <Select size="sm" placeholder="Select" value={ledger} onChange={(e) => setLedger(e.target.value)}>
            {(masters ? masters.account_ledgers : []).map((l) => <option key={l.id} value={l.id}>{l.ledger_name}</option>)}
          </Select>
        </F>
        <F label="Receipt date"><Input size="sm" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></F>
      </SimpleGrid>
    </Frame>
  );
};

// ---------------------------------------------------------------- allocation
export const AllocateModal = ({ booking, isOpen, onClose, onDone }) => {
  const notify = useAbsToast();
  const [avail, setAvail] = useState({});
  const [rows, setRows] = useState([]);
  const [busy, run] = useSubmit(onDone, onClose);
  const lines = booking.items.filter((i) => i.to_allocate > 0);
  useEffect(() => {
    if (!isOpen) return;
    setRows(lines.map((i) => ({ booking_item_id: i.id, slot: "", qty: String(i.to_allocate) })));
    Promise.all(lines.map((i) => absApi.availability(i.stock_item_id).then((a) => [i.stock_item_id, a])))
      .then((pairs) => setAvail(Object.fromEntries(pairs)))
      .catch((err) => notify.fail(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  const submit = () =>
    run(() =>
      absApi.allocate(
        booking.id,
        rows.filter((r) => r.slot && Number(r.qty) > 0).map((r) => {
          const [godown_id, batch_no] = r.slot.split("|");
          return { booking_item_id: r.booking_item_id, godown_id: Number(godown_id), batch_no: batch_no || null, qty: r.qty };
        }),
      ),
    );
  return (
    <Frame title={`Allocate stock — ${booking.booking_no}`} isOpen={isOpen} onClose={onClose} busy={busy} yes="Reserve stock" size="3xl" onSubmit={submit}>
      <Text fontSize="sm" color="gray.600" mb={3}>Free stock = godown stock − stock already reserved for other bookings.</Text>
      <Table size="sm">
        <Thead><Tr><Th>Variety</Th><Th isNumeric>To allocate</Th><Th>Godown / batch (free)</Th><Th isNumeric>Qty</Th><Th /></Tr></Thead>
        <Tbody>
          {rows.map((r, idx) => {
            const item = booking.items.find((i) => i.id === r.booking_item_id);
            const a = avail[item.stock_item_id];
            return (
              <Tr key={idx}>
                <Td>{item.item_name}</Td>
                <Td isNumeric>{qty(item.to_allocate)}</Td>
                <Td>
                  {!a ? <Text fontSize="xs">Loading…</Text> : (
                    <Select size="sm" placeholder={a.free > 0 ? "Select" : "No free stock"} value={r.slot} onChange={(e) => setRows(rows.map((x, j) => (j === idx ? { ...x, slot: e.target.value } : x)))}>
                      {a.rows.filter((s) => s.free > 0).map((s) => (
                        <option key={`${s.godown_id}|${s.batch_no || ""}`} value={`${s.godown_id}|${s.batch_no || ""}`}>
                          {s.godown_name}{s.batch_no ? ` · ${s.batch_no}` : ""} — {qty(s.free)} free
                        </option>
                      ))}
                    </Select>
                  )}
                </Td>
                <Td isNumeric><Input size="sm" maxW="100px" type="number" value={r.qty} onChange={(e) => setRows(rows.map((x, j) => (j === idx ? { ...x, qty: e.target.value } : x)))} /></Td>
                <Td><Button size="xs" variant="ghost" onClick={() => setRows([...rows.slice(0, idx + 1), { booking_item_id: r.booking_item_id, slot: "", qty: "" }, ...rows.slice(idx + 1)])}>+ split</Button></Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Frame>
  );
};

// ---------------------------------------------------------------- dispatch
export const DispatchModal = ({ booking, masters, isOpen, onClose, onDone }) => {
  const notify = useAbsToast();
  const [pv, setPv] = useState(null);
  const [f, setF] = useState({});
  const [lineQty, setLineQty] = useState({});
  const [busy, run] = useSubmit(onDone, onClose);
  useEffect(() => {
    if (!isOpen) return;
    setPv(null);
    absApi
      .dispatchPreview(booking.id)
      .then((p) => {
        setPv(p);
        const g = p.godowns[0] ? String(p.godowns[0].godown_id) : "";
        setF({ godown_id: g, dispatch_date: todayIST(), tax_mode: p.tax_mode, sales_ledger_id: p.sales_ledger_id ? String(p.sales_ledger_id) : "", destination: booking.delivery_address || booking.party_location || "" });
        setLineQty(Object.fromEntries(p.allocations.map((a) => [a.id, String(a.open_qty)])));
      })
      .catch((err) => notify.fail(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  const s = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const inGodown = pv ? pv.allocations.filter((a) => String(a.godown_id) === f.godown_id) : [];
  const submit = () =>
    run(() =>
      absApi.dispatch(booking.id, {
        ...f,
        lines: inGodown.filter((a) => Number(lineQty[a.id]) > 0).map((a) => ({ allocation_id: a.id, qty: lineQty[a.id] })),
      }),
    );
  return (
    <Frame title={`Dispatch — ${booking.booking_no}`} isOpen={isOpen} onClose={onClose} busy={busy} yes="Create invoice & dispatch" size="3xl" onSubmit={submit} disabled={!pv || !inGodown.length}>
      {!pv ? <Loading /> : (
        <>
          <Alert status="info" fontSize="sm" borderRadius="8px" mb={3}><AlertIcon />A Sales invoice is created (stock out, GST, party ledger). Advance available {money(pv.advance_unadjusted)} is adjusted against it.</Alert>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
            <F label="From godown" isRequired>
              <Select size="sm" value={f.godown_id || ""} onChange={s("godown_id")}>
                {pv.godowns.map((g) => <option key={g.godown_id} value={g.godown_id}>{g.godown_name}</option>)}
              </Select>
            </F>
            <F label="Dispatch / invoice date"><Input size="sm" type="date" value={f.dispatch_date || ""} onChange={s("dispatch_date")} /></F>
            <F label="Tax" help={`Auto: ${pv.tax_mode === "IGST" ? "IGST (other state)" : "CGST + SGST (same state)"}`}>
              <Select size="sm" value={f.tax_mode || ""} onChange={s("tax_mode")}><option value="CGST_SGST">CGST + SGST</option><option value="IGST">IGST</option></Select>
            </F>
            <F label="Sales ledger" isRequired>
              <Select size="sm" placeholder="Select" value={f.sales_ledger_id || ""} onChange={s("sales_ledger_id")}>
                {(masters ? masters.sales_ledgers : []).map((l) => <option key={l.id} value={l.id}>{l.ledger_name}</option>)}
              </Select>
            </F>
            <F label="Vehicle no." isRequired><Input size="sm" value={f.vehicle_no || ""} onChange={s("vehicle_no")} placeholder="RJ14GA1234" /></F>
            <F label="Transporter"><Input size="sm" value={f.transport_name || ""} onChange={s("transport_name")} /></F>
            <F label="LR / bilty no."><Input size="sm" value={f.lr_no || ""} onChange={s("lr_no")} /></F>
            <F label="E-way bill no."><Input size="sm" value={f.eway_number || ""} onChange={s("eway_number")} /></F>
            <F label="Freight (₹)"><Input size="sm" type="number" value={f.transport_freight || ""} onChange={s("transport_freight")} /></F>
            <F label="Driver"><Input size="sm" value={f.driver_name || ""} onChange={s("driver_name")} /></F>
            <F label="Driver mobile"><Input size="sm" value={f.driver_mobile || ""} onChange={s("driver_mobile")} /></F>
            <F label="Destination"><Input size="sm" value={f.destination || ""} onChange={s("destination")} /></F>
          </SimpleGrid>
          <Table size="sm" mt={2}>
            <Thead><Tr><Th>Variety</Th><Th>Batch</Th><Th isNumeric>Reserved</Th><Th isNumeric>Dispatch qty</Th></Tr></Thead>
            <Tbody>
              {inGodown.map((a) => (
                <Tr key={a.id}>
                  <Td>{a.item_name}</Td>
                  <Td>{a.batch_no || "—"}</Td>
                  <Td isNumeric>{qty(a.open_qty)}</Td>
                  <Td isNumeric><Input size="sm" maxW="100px" type="number" value={lineQty[a.id] ?? ""} onChange={(e) => setLineQty({ ...lineQty, [a.id]: e.target.value })} /></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}
    </Frame>
  );
};

// ---------------------------------------------------------------- delivery
export const DeliverModal = ({ dispatch, isOpen, onClose, onDone }) => {
  const [f, setF] = useState({});
  const [items, setItems] = useState({});
  const [busy, run] = useSubmit(onDone, onClose);
  useEffect(() => {
    if (isOpen && dispatch) {
      setF({ delivered_on: todayIST(), received_by_name: "", remarks: "" });
      setItems(Object.fromEntries(dispatch.items.map((i) => [i.id, { received_qty: String(i.qty), damaged_qty: "0" }])));
    }
  }, [isOpen, dispatch]);
  if (!dispatch) return null;
  return (
    <Frame title={`Confirm delivery — ${dispatch.dispatch_no}`} isOpen={isOpen} onClose={onClose} busy={busy} yes="Confirm delivery" size="xl"
      onSubmit={() => run(() => absApi.deliver(dispatch.id, { ...f, items: Object.entries(items).map(([id, v]) => ({ id: Number(id), ...v })) }))}>
      <SimpleGrid columns={2} spacing={3}>
        <F label="Delivered on"><Input size="sm" type="date" value={f.delivered_on || ""} onChange={(e) => setF({ ...f, delivered_on: e.target.value })} /></F>
        <F label="Received by (name)" isRequired><Input size="sm" value={f.received_by_name || ""} onChange={(e) => setF({ ...f, received_by_name: e.target.value })} /></F>
      </SimpleGrid>
      <Table size="sm" mb={3}>
        <Thead><Tr><Th>Variety</Th><Th isNumeric>Sent</Th><Th isNumeric>Received</Th><Th isNumeric>Damaged</Th></Tr></Thead>
        <Tbody>
          {dispatch.items.map((i) => (
            <Tr key={i.id}>
              <Td>{i.item_name}{i.batch_no ? ` · ${i.batch_no}` : ""}</Td>
              <Td isNumeric>{qty(i.qty)}</Td>
              <Td isNumeric><Input size="sm" maxW="90px" type="number" value={items[i.id]?.received_qty ?? ""} onChange={(e) => setItems({ ...items, [i.id]: { ...items[i.id], received_qty: e.target.value } })} /></Td>
              <Td isNumeric><Input size="sm" maxW="90px" type="number" value={items[i.id]?.damaged_qty ?? ""} onChange={(e) => setItems({ ...items, [i.id]: { ...items[i.id], damaged_qty: e.target.value } })} /></Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <F label="Remarks" help="Required when anything is short or damaged"><Textarea size="sm" value={f.remarks || ""} onChange={(e) => setF({ ...f, remarks: e.target.value })} /></F>
    </Frame>
  );
};

// ---------------------------------------------------------------- cancel / short-close
export const CancelModal = ({ booking, masters, isOpen, onClose, onDone }) => {
  const [reason, setReason] = useState("");
  const [rule, setRule] = useState("");
  const [busy, run] = useSubmit(onDone, onClose);
  const partly = booking.dispatched_qty > 0;
  return (
    <Frame title={partly ? `Close balance — ${booking.booking_no}` : `Cancel booking — ${booking.booking_no}`} isOpen={isOpen} onClose={onClose} busy={busy} danger yes={partly ? "Close balance qty" : "Cancel booking"} disabled={reason.trim().length < 3}
      onSubmit={() => run(() => absApi.action(booking.id, "cancel", { reason, refund_rule: rule || undefined }))}>
      {partly && <Alert status="warning" fontSize="sm" borderRadius="8px" mb={3}><AlertIcon />Part is already dispatched: the rest will not be supplied and the booking will be closed.</Alert>}
      <Text fontSize="sm" mb={3}>Reserved stock goes back to free stock. Advance not yet adjusted: <b>{money(booking.advance_unadjusted)}</b>.</Text>
      <F label="Reason" isRequired><Textarea size="sm" value={reason} onChange={(e) => setReason(e.target.value)} /></F>
      {booking.advance_unadjusted > 0 && (
        <F label="Advance">
          <Select size="sm" value={rule} onChange={(e) => setRule(e.target.value)}>
            <option value="">As in Settings ({masters && masters.settings.cancellation_refund_rule === "CARRY_FORWARD" ? "carry forward" : "refund"})</option>
            <option value="REFUND">Refund to the party</option>
            <option value="CARRY_FORWARD">Carry forward (keep as party credit)</option>
          </Select>
        </F>
      )}
    </Frame>
  );
};

export const ShortCloseModal = ({ booking, item, isOpen, onClose, onDone }) => {
  const [q, setQ] = useState("");
  const [reason, setReason] = useState("");
  const [busy, run] = useSubmit(onDone, onClose);
  if (!item) return null;
  const open = Math.round((item.supply_qty - item.dispatched_qty) * 1000) / 1000;
  return (
    <Frame title={`Short-close — ${item.item_name}`} isOpen={isOpen} onClose={onClose} busy={busy} danger yes="Close quantity" disabled={!q || reason.trim().length < 3}
      onSubmit={() => run(() => absApi.shortClose(booking.id, item.id, { qty: q, reason }))}>
      <Text fontSize="sm" mb={3}>Supply {qty(item.supply_qty)} · dispatched {qty(item.dispatched_qty)} · not yet dispatched {qty(open)}.</Text>
      <F label="Quantity that will not be supplied" isRequired><Input size="sm" type="number" value={q} onChange={(e) => setQ(e.target.value)} /></F>
      <F label="Reason" isRequired><Input size="sm" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Production short / party does not need" /></F>
    </Frame>
  );
};

export { apiError };
