// Additional Discount → RSM Approval (mode="rsm") and Final Approval (mode="final").
//   RSM:   Recommend (does NOT activate the discount) · Reject (remarks) · Clarification (remarks)
//   Final: per product Approve / Modify (lower qty and/or lower % / ₹) / Reject (remarks),
//          Reject all (remarks), Clarification (remarks). Any one final approver decides.
// The preview below is for the approver; the server recalculates and enforces every limit.
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, AlertIcon, Box, Button, ButtonGroup, Flex, HStack, Input, Select, SimpleGrid, Text, Textarea,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AdrBadge, ApprovalStages, ErrorBox, ItemsTable, Loading, PageTitle, Section, Timeline, adrApi, fmtDateTime, pctText,
  rs, useAdrMe, useAdrToast, useConfirm, useLoad,
} from "./adrShared";
import { RequestSummary } from "./AdrRequestDetail";

const r2 = (v) => Math.round((Number(v) + Number.EPSILON) * 100) / 100;
const perUnit = (type, value, base) => (type === "PERCENT" ? r2((Number(base) * Number(value)) / 100) : r2(value));

const LineDecision = ({ item, value, onChange }) => {
  const set = (k, v) => onChange({ ...value, [k]: v });
  const pu = value.decision === "REJECT" ? 0 : value.decision === "MODIFY" ? perUnit(value.discount_type, value.discount_value, item.base_rate) : item.requested_per_unit;
  const q = value.decision === "REJECT" ? 0 : value.decision === "MODIFY" ? Number(value.approved_qty) || 0 : item.requested_qty;
  const over = value.decision === "MODIFY" && (q > item.requested_qty || pu > item.requested_per_unit + 0.001 || !(q > 0) || !(pu > 0));
  return (
    <Box border="1px solid" borderColor={value.decision === "REJECT" ? "red.200" : value.decision === "MODIFY" ? "teal.200" : "green.200"} borderRadius="12px" p={3}>
      <Flex justify="space-between" align="flex-start" gap={2} wrap="wrap">
        <Box>
          <Text fontWeight="800">{item.item_name}</Text>
          <Text fontSize="xs" color="gray.600">
            Price {rs(item.base_rate)} · requested {item.discount_type === "PERCENT" ? pctText(item.requested_value) : rs(item.requested_value)} = {rs(item.requested_per_unit)}/unit × {item.requested_qty} = {rs(item.requested_amount)}
          </Text>
        </Box>
        <ButtonGroup size="xs" isAttached variant="outline">
          <Button colorScheme="green" variant={value.decision === "APPROVE" ? "solid" : "outline"} onClick={() => set("decision", "APPROVE")}>Approve</Button>
          <Button colorScheme="teal" variant={value.decision === "MODIFY" ? "solid" : "outline"} onClick={() => set("decision", "MODIFY")}>Modify</Button>
          <Button colorScheme="red" variant={value.decision === "REJECT" ? "solid" : "outline"} onClick={() => set("decision", "REJECT")}>Reject</Button>
        </ButtonGroup>
      </Flex>
      {value.decision === "MODIFY" && (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2} mt={3}>
          <Box><Text fontSize="xs" color="gray.500">Approved qty (max {item.requested_qty})</Text><Input size="sm" type="number" value={value.approved_qty} onChange={(e) => set("approved_qty", e.target.value)} /></Box>
          <Box>
            <Text fontSize="xs" color="gray.500">Discount as</Text>
            <Select size="sm" value={value.discount_type} onChange={(e) => set("discount_type", e.target.value)}>
              <option value="PERCENT">% of price</option>
              <option value="AMOUNT">₹ per unit</option>
            </Select>
          </Box>
          <Box><Text fontSize="xs" color="gray.500">Value (max {rs(item.requested_per_unit)}/unit)</Text><Input size="sm" type="number" step="0.01" value={value.discount_value} onChange={(e) => set("discount_value", e.target.value)} /></Box>
        </SimpleGrid>
      )}
      {(value.decision === "REJECT" || value.decision === "MODIFY") && (
        <Input size="sm" mt={2} placeholder={value.decision === "REJECT" ? "Rejection remarks (required)" : "Remarks (optional)"} value={value.remarks} onChange={(e) => set("remarks", e.target.value)} />
      )}
      <Text fontSize="sm" mt={2} color={over ? "red.600" : "gray.700"}>
        {value.decision === "REJECT" ? "Rejected — nothing approved for this product" : over ? "Not allowed: quantity and discount must be above 0 and not more than requested" : `Approves ${rs(pu)}/unit × ${q} = ${rs(pu * q)} · net rate ${rs(item.base_rate - item.regular_discount_per_unit - pu)}`}
      </Text>
    </Box>
  );
};

const AdrDecision = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useAdrToast();
  const { refresh } = useAdrMe();
  const [confirm, dialog] = useConfirm();
  const { data, loading, error, reload } = useLoad(() => adrApi.detail(id), [id]);
  const [remarks, setRemarks] = useState("");
  const [lines, setLines] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data) return;
    const init = {};
    data.items.forEach((i) => {
      init[i.id] = { decision: "APPROVE", approved_qty: String(i.requested_qty), discount_type: i.discount_type, discount_value: String(i.requested_value), remarks: "" };
    });
    setLines(init);
  }, [data]);

  const preview = useMemo(() => {
    if (!data) return { approved: 0, rejected: 0, modified: 0 };
    let approved = 0;
    let rejected = 0;
    let modified = 0;
    data.items.forEach((i) => {
      const v = lines[i.id];
      if (!v) return;
      if (v.decision === "REJECT") rejected += 1;
      else if (v.decision === "MODIFY") {
        modified += 1;
        approved += perUnit(v.discount_type, v.discount_value, i.base_rate) * (Number(v.approved_qty) || 0);
      } else approved += i.requested_amount;
    });
    return { approved: r2(approved), rejected, modified };
  }, [data, lines]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const { request: r, items, approvals, history, actions } = data;
  const allowed = mode === "rsm" ? actions.can_rsm_decide : actions.can_final_decide;
  const rsmStep = [...approvals].reverse().find((a) => a.stage === "RSM" && a.status !== "PENDING");

  const send = async (action) => {
    const needs = action === "REJECT" || action === "CLARIFY";
    if (needs && remarks.trim().length < 3) return notify.warn(action === "REJECT" ? "Rejection remarks are mandatory" : "Write what needs clarification");
    let body = { action, remarks: remarks.trim() || undefined, version: r.version };
    if (mode === "final" && action === "APPROVE") {
      const missing = items.find((i) => lines[i.id].decision === "REJECT" && !lines[i.id].remarks.trim() && remarks.trim().length < 3);
      if (missing) return notify.warn(`${missing.item_name}: rejection remarks are mandatory`);
      body = {
        ...body,
        items: items.map((i) => {
          const v = lines[i.id];
          if (v.decision === "MODIFY") return { item_id: i.id, decision: "MODIFY", approved_qty: Number(v.approved_qty), discount_type: v.discount_type, discount_value: Number(v.discount_value), remarks: v.remarks.trim() || undefined };
          if (v.decision === "REJECT") return { item_id: i.id, decision: "REJECT", remarks: v.remarks.trim() || undefined };
          return { item_id: i.id, decision: "APPROVE" };
        }),
      };
    }
    const titles = {
      APPROVE: mode === "rsm" ? "Recommend for final approval" : preview.rejected === items.length ? "Reject every product" : preview.rejected || preview.modified ? `Approve partially (${rs(preview.approved)})` : `Approve in full (${rs(preview.approved)})`,
      REJECT: "Reject the request",
      CLARIFY: "Send back for clarification",
    };
    if (!(await confirm(titles[action], mode === "rsm" && action === "APPROVE" ? "Your recommendation does not activate the discount. It goes to final approval." : action === "APPROVE" ? "The approved discount becomes usable on sales for this party right away, fixed in ₹ per unit." : "The employee is notified.", { yes: "Confirm", danger: action === "REJECT" }))) return undefined;
    setBusy(true);
    try {
      const out = mode === "rsm" ? await adrApi.rsmDecision(r.id, body) : await adrApi.finalDecision(r.id, body);
      notify.ok(`${out.request_no}: ${out.status_label}`);
      if (refresh) refresh();
      navigate(`/additional-discount/requests/${r.id}`, { replace: true });
    } catch (err) {
      notify.fail(err, "Could not save the decision");
      reload();
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  return (
    <Box>
      {dialog}
      <PageTitle
        title={<HStack as="span" spacing={3}><span>{mode === "rsm" ? "RSM Approval" : "Final Approval"} · {r.request_no}</span><AdrBadge status={r.status} /></HStack>}
        subtitle={`${r.party_name} · requested by ${r.requested_by_name} · ${rs(r.requested_discount_value)} additional discount`}
        right={<Button size="sm" variant="ghost" onClick={() => navigate(`/additional-discount/requests/${r.id}`)}>Open full request</Button>}
      />
      {!allowed && (
        <Alert status="warning" borderRadius="8px" mb={4} fontSize="sm">
          <AlertIcon />
          {mode === "rsm" ? "Only the RSM in the employee's reporting line can decide this stage, while it is pending." : "This request is not waiting for your final decision (already decided, not at final stage, or your own request)."}
        </Alert>
      )}
      {mode === "final" && rsmStep && (
        <Alert status={rsmStep.status === "SKIPPED" ? "info" : "success"} borderRadius="8px" mb={4} fontSize="sm">
          <AlertIcon />
          {rsmStep.status === "SKIPPED" ? `No RSM recommendation: ${rsmStep.remarks || "no RSM in the reporting line"}.` : `Recommended by ${rsmStep.acted_by_name}${rsmStep.remarks ? `: ${rsmStep.remarks}` : ""}`}
        </Alert>
      )}

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={4}>
        <Box p={3} bg="gray.50" borderRadius="10px"><Text fontSize="xs" color="gray.500">Gross value</Text><Text fontWeight="800">{rs(r.gross_value)}</Text></Box>
        <Box p={3} bg="orange.50" borderRadius="10px"><Text fontSize="xs" color="gray.500">Requested</Text><Text fontWeight="800" color="orange.700">{rs(r.requested_discount_value)}</Text></Box>
        <Box p={3} bg="gray.50" borderRadius="10px"><Text fontSize="xs" color="gray.500">Requested % of gross</Text><Text fontWeight="800">{pctText(r.gross_value ? (r.requested_discount_value / r.gross_value) * 100 : 0)}</Text></Box>
        {mode === "final" ? <Box p={3} bg="green.50" borderRadius="10px"><Text fontSize="xs" color="gray.500">Will be approved</Text><Text fontWeight="800" color="green.700">{rs(preview.approved)}</Text></Box> : <Box p={3} bg="gray.50" borderRadius="10px"><Text fontSize="xs" color="gray.500">Credit review</Text><Text fontWeight="800">{r.credit_review_done ? "Done" : "Not recorded"}</Text></Box>}
      </SimpleGrid>

      <Section title="Request"><RequestSummary r={r} />{r.justification && <Box mt={3}><Text fontSize="xs" color="gray.500">Justification</Text><Text fontSize="sm" whiteSpace="pre-wrap">{r.justification}</Text></Box>}</Section>

      {mode === "final" && allowed ? (
        <Section title="Decision per product">
          <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={3}>
            {items.map((i) => (lines[i.id] ? <LineDecision key={i.id} item={i} value={lines[i.id]} onChange={(v) => setLines((l) => ({ ...l, [i.id]: v }))} /> : null))}
          </SimpleGrid>
        </Section>
      ) : (
        <Section title="Products"><ItemsTable items={items} showUsage={false} /></Section>
      )}

      {allowed && (
        <Section title="Remarks">
          <Textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Remarks (required to reject or to ask for clarification)" />
          <Flex justify="flex-end" gap={2} mt={3} wrap="wrap">
            <Button size="sm" variant="outline" colorScheme="purple" onClick={() => send("CLARIFY")} isLoading={busy}>Send back for clarification</Button>
            <Button size="sm" colorScheme="red" variant="outline" onClick={() => send("REJECT")} isLoading={busy}>Reject</Button>
            <Button size="sm" colorScheme={mode === "rsm" ? "orange" : "green"} onClick={() => send("APPROVE")} isLoading={busy}>
              {mode === "rsm" ? "Recommend" : preview.rejected || preview.modified ? "Approve with changes" : "Approve"}
            </Button>
          </Flex>
        </Section>
      )}

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
        <Section title="Approval stages"><ApprovalStages approvals={approvals} fmtDateTime={fmtDateTime} /></Section>
        <Section title="Timeline"><Timeline history={history} fmtDateTime={fmtDateTime} /></Section>
      </SimpleGrid>
    </Box>
  );
};

export default AdrDecision;