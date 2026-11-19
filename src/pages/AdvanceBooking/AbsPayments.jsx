// Advance Booking → Payments: accounts verify advances collected in the field (post Receipt
// vouchers), mark bounced cheques, and settle refunds of cancelled bookings.
import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Flex, HStack, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Tab, TabList, Tabs, Text } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { absApi, apiError } from "../../services/absApi";
import { AbsBadge, DataTable, ErrorBox, PageTitle, fmtDate, fmtDateTime, money, useAbsMasters, useAbsToast, useCommentPrompt } from "./absShared";
import { VerifyModal } from "./absModals";

const PAY_TABS = [["PENDING_VERIFICATION", "To Verify"], ["POSTED", "Received"], ["BOUNCED", "Bounced"], ["", "All"]];

const RefundModal = ({ refund, onClose, onDone }) => {
  const notify = useAbsToast();
  const [status, setStatus] = useState("PAID");
  const [voucher, setVoucher] = useState("");
  const [remarks, setRemarks] = useState("");
  const [busy, setBusy] = useState(false);
  if (!refund) return null;
  const save = async () => {
    setBusy(true);
    try {
      notify.ok((await absApi.settleRefund(refund.id, { status, payment_voucher_no: voucher, remarks })).message);
      onClose();
      onDone();
    } catch (err) {
      notify.fail(err);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal isOpen onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">Settle {money(refund.amount)} — {refund.booking_no}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="sm" mb={3}>{refund.party_name} · {refund.reason}</Text>
          <Select size="sm" mb={3} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="PAID">Refunded (Payment voucher made in accounts)</option>
            <option value="CARRIED_FORWARD">Carry forward (keep as party credit)</option>
            <option value="FORFEITED">Forfeited (as per booking terms)</option>
          </Select>
          {status === "PAID" && <Input size="sm" mb={3} placeholder="Payment voucher no." value={voucher} onChange={(e) => setVoucher(e.target.value)} />}
          <Input size="sm" placeholder={status === "FORFEITED" ? "Reason (required)" : "Remarks"} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" colorScheme="teal" isLoading={busy} onClick={save}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const AbsPayments = () => {
  const navigate = useNavigate();
  const notify = useAbsToast();
  const [params, setParams] = useSearchParams();
  const { masters } = useAbsMasters();
  const [askComment, commentDialog] = useCommentPrompt();
  const view = params.get("tab") === "refunds" ? "refunds" : "payments";
  const [status, setStatus] = useState("PENDING_VERIFICATION");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState({ items: [] });
  const [refunds, setRefunds] = useState([]);
  const [refundStatus, setRefundStatus] = useState("DUE");
  const [error, setError] = useState(null);
  const [verify, setVerify] = useState(null);
  const [settle, setSettle] = useState(null);
  const canVerify = !!(masters && masters.me.can_verify_payment);

  const load = useCallback(async () => {
    setError(null);
    try {
      if (view === "payments") setRows(await absApi.payments({ status, search: search.trim() || undefined, limit: 100 }));
      else setRefunds(await absApi.refunds(refundStatus || undefined));
    } catch (err) {
      setError(apiError(err, "Could not load"));
    }
  }, [view, status, search, refundStatus]);
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const refuse = async (p, kind) => {
    const reason = await askComment(kind === "bounce" ? "Cheque bounced" : "Reject payment", { required: true, placeholder: "Reason (the officer is told)", yes: "Save", danger: true });
    if (reason === null) return;
    try {
      notify.ok((await absApi.refusePayment(p.id, kind, reason)).message);
      load();
    } catch (err) {
      notify.fail(err);
    }
  };

  return (
    <Box>
      {commentDialog}
      <PageTitle title="Advance Payments" subtitle="Verify field collections and post Receipt vouchers; settle refunds" />
      <Tabs size="sm" variant="soft-rounded" colorScheme="teal" index={view === "refunds" ? 1 : 0} onChange={(i) => setParams(i ? { tab: "refunds" } : {}, { replace: true })} mb={3}>
        <TabList><Tab>Payments</Tab>{canVerify && <Tab>Refunds</Tab>}</TabList>
      </Tabs>
      {error && <ErrorBox message={error} onRetry={load} />}
      {view === "payments" ? (
        <>
          <Flex gap={2} mb={4} wrap="wrap">
            <Select size="sm" maxW="220px" value={status} onChange={(e) => setStatus(e.target.value)} borderRadius="8px">
              {PAY_TABS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
            <Input size="sm" maxW="280px" placeholder="Booking, party or cheque / UTR no." value={search} onChange={(e) => setSearch(e.target.value)} borderRadius="8px" />
          </Flex>
          <DataTable
            rows={rows.items}
            emptyText="Nothing here."
            columns={[
              { key: "collected_on", label: "Collected", render: (p) => <Box><Text>{fmtDate(p.collected_on)}</Text><Text fontSize="xs" color="gray.500">{p.collected_by_name}</Text></Box> },
              { key: "booking_no", label: "Booking", render: (p) => <Button size="xs" variant="link" colorScheme="teal" onClick={() => navigate(`/advance-booking/bookings/${p.booking_id}`)}>{p.booking_no}</Button> },
              { key: "party_name", label: "Party" },
              { key: "amount", label: "Amount", numeric: true, render: (p) => money(p.amount) },
              { key: "payment_mode", label: "Mode", render: (p) => `${p.payment_mode}${p.instrument_no ? ` · ${p.instrument_no}` : ""}${p.bank_name ? ` (${p.bank_name})` : ""}` },
              { key: "status", label: "Status", render: (p) => <Box><AbsBadge status={p.status} />{p.reject_reason ? <Text fontSize="xs" color="red.500">{p.reject_reason}</Text> : null}</Box> },
              { key: "receipt_voucher_no", label: "Receipt", render: (p) => (p.receipt_voucher_no ? <Box><Text>{p.receipt_voucher_no}</Text><Text fontSize="xs" color="gray.500">{p.account_ledger_name} · {fmtDateTime(p.verified_at)}</Text></Box> : "—") },
              {
                key: "x",
                label: "",
                render: (p) =>
                  canVerify && p.status === "PENDING_VERIFICATION" ? (
                    <HStack>
                      <Button size="xs" colorScheme="green" onClick={() => setVerify(p)}>Verify</Button>
                      <Button size="xs" variant="ghost" colorScheme="red" onClick={() => refuse(p, "bounce")}>Bounced</Button>
                      <Button size="xs" variant="ghost" onClick={() => refuse(p, "reject")}>Reject</Button>
                    </HStack>
                  ) : null,
              },
            ]}
          />
        </>
      ) : (
        <>
          <Select size="sm" maxW="220px" mb={4} value={refundStatus} onChange={(e) => setRefundStatus(e.target.value)} borderRadius="8px">
            <option value="DUE">Due</option><option value="PAID">Refunded</option><option value="CARRIED_FORWARD">Carried forward</option><option value="FORFEITED">Forfeited</option><option value="">All</option>
          </Select>
          <DataTable
            rows={refunds}
            emptyText="No refunds here."
            columns={[
              { key: "created_at", label: "Date", render: (r) => fmtDate(r.created_at) },
              { key: "booking_no", label: "Booking", render: (r) => <Button size="xs" variant="link" colorScheme="teal" onClick={() => navigate(`/advance-booking/bookings/${r.booking_id}`)}>{r.booking_no}</Button> },
              { key: "party_name", label: "Party" },
              { key: "amount", label: "Amount", numeric: true, render: (r) => money(r.amount) },
              { key: "reason", label: "Reason" },
              { key: "status", label: "Status", render: (r) => <Box><AbsBadge status={r.status} />{r.payment_voucher_no ? <Text fontSize="xs">{r.payment_voucher_no}</Text> : null}</Box> },
              { key: "x", label: "", render: (r) => (r.status === "DUE" ? <Button size="xs" colorScheme="teal" onClick={() => setSettle(r)}>Settle</Button> : null) },
            ]}
          />
        </>
      )}
      {verify && <VerifyModal payment={verify} masters={masters} isOpen onClose={() => setVerify(null)} onDone={load} />}
      {settle && <RefundModal refund={settle} onClose={() => setSettle(null)} onDone={load} />}
    </Box>
  );
};

export default AbsPayments;
