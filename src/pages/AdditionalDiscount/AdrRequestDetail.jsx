// Additional Discount → Request detail: full commercial view, product lines (requested /
// approved / reserved / used / balance), approval stages, timeline, documents, sales usage,
// and the actions the server allows this user (data.actions).
import React, { useRef, useState } from "react";
import {
  Alert, AlertIcon, Box, Button, Flex, HStack, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter,
  ModalHeader, ModalOverlay, SimpleGrid, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Textarea,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AdrBadge, ApprovalStages, AttachmentList, ErrorBox, InfoGrid, ItemsTable, Loading, PageTitle, Section, Timeline,
  UsageTable, adrApi, fmtDate, fmtDateTime, label, rs, useAdrMe, useAdrToast, useCommentPrompt, useConfirm, useLoad,
} from "./adrShared";

export const RequestSummary = ({ r }) => (
  <InfoGrid
    items={[
      ["Party", `${r.party_name}${r.party_state ? ` · ${r.party_state}` : ""}`],
      ["Requested by", `${r.requested_by_name}${r.requested_by_role ? ` (${r.requested_by_role})` : ""}`],
      ["Route", r.rsm_skipped ? "Direct to final (no RSM in the line)" : r.rsm_name ? `RSM ${r.rsm_name} → final` : "—"],
      ["Reason", r.reason_text],
      ["Gross value", rs(r.gross_value)],
      ["Regular discount", rs(r.regular_discount_value)],
      ["Additional requested", rs(r.requested_discount_value)],
      ["Additional approved", r.final_decided_at ? rs(r.approved_discount_value) : "—"],
      ["Used on sales", rs(r.utilized_discount_value)],
      ["Balance", r.final_decided_at && r.status !== "REJECTED" ? rs(r.balance_discount_value) : "—"],
      ["Valid", r.valid_from ? `${fmtDate(r.valid_from)} – ${fmtDate(r.valid_till)}` : "—"],
      ["Submitted", r.submitted_at ? fmtDateTime(r.submitted_at) : "—"],
      ["Final decision", r.final_decided_at ? `${r.final_decided_by_name} · ${fmtDateTime(r.final_decided_at)}` : "—"],
      ["Payment terms", label(r.payment_terms)],
      ["Payment note", r.payment_note],
      ["Order link", [label(r.order_link_type), r.order_reference].filter(Boolean).join(" · ") || null],
      ["Competitor", r.competitor_name ? `${r.competitor_name}${r.competitor_price !== null ? ` · ${rs(r.competitor_price)}` : ""}` : null],
      ["Competitor note", r.competitor_note],
      ["Credit review", r.credit_review_done ? `${r.credit_review_by_name || "Done"}${r.credit_review_note ? ` — ${r.credit_review_note}` : ""}` : "Not recorded"],
      ["Cancelled", r.cancelled_at ? `${r.cancelled_by_name} · ${fmtDateTime(r.cancelled_at)}${r.cancel_reason ? ` — ${r.cancel_reason}` : ""}` : undefined],
    ]}
  />
);

const ReplyModal = ({ isOpen, onClose, onSend, sending, question }) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const ref = useRef();
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">Respond to clarification</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {question && <Box p={3} bg="purple.50" borderRadius="8px" mb={3}><Text fontSize="xs" color="purple.700" fontWeight="700">Question</Text><Text fontSize="sm">{question}</Text></Box>}
          <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your reply" />
          <Input ref={ref} type="file" multiple display="none" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
          <Button size="sm" mt={3} variant="outline" onClick={() => ref.current && ref.current.click()}>Attach documents</Button>
          {files.map((f) => <Text key={f.name} fontSize="xs" mt={1}>{f.name}</Text>)}
          <Text fontSize="xs" color="gray.500" mt={3}>To change products or amounts, use "Edit request" first, then reply.</Text>
        </ModalBody>
        <ModalFooter>
          <Button size="sm" variant="ghost" mr={2} onClick={onClose}>Cancel</Button>
          <Button size="sm" colorScheme="purple" isLoading={sending} isDisabled={message.trim().length < 3} onClick={() => onSend(message.trim(), files)}>Send & re-submit</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const AdrRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useAdrToast();
  const { refresh } = useAdrMe();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const { ask, dialog: askDialog } = useCommentPrompt();
  const fileRef = useRef();
  const [replyOpen, setReplyOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { data, loading, error, reload } = useLoad(() => adrApi.detail(id), [id]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const { request: r, items, approvals, history, attachments, utilization, routing, actions } = data;
  const lastQuestion = [...history].reverse().find((h) => h.event === "CLARIFICATION_REQUESTED");

  const run = async (fn, okText) => {
    setBusy(true);
    try {
      const out = await fn();
      if (okText) notify.ok(typeof okText === "function" ? okText(out) : okText);
      await reload();
      if (refresh) refresh();
    } catch (err) {
      notify.fail(err, "Action failed");
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!(await confirm("Submit request", routing && routing.route === "DIRECT_TO_FINAL" ? "There is no RSM in your reporting line, so it goes directly to final approval." : `It goes to ${routing && routing.rsm_name ? routing.rsm_name : "your RSM"} for a recommendation, then to final approval.`, { yes: "Submit" }))) return;
    run(() => adrApi.submit(r.id, r.version), (x) => `${x.request_no}: ${x.status_label}`);
  };
  const cancel = async () => {
    const own = actions.can_edit || r.status === "DRAFT";
    const reason = await ask(r.status === "APPROVED" || r.status === "PARTIALLY_APPROVED" ? "Cancel the unused balance of this approval" : "Cancel this request", { required: !own, placeholder: "Reason", yes: "Cancel request", danger: true });
    if (reason === null) return;
    run(() => adrApi.cancel(r.id, reason || undefined, r.version), "Request cancelled");
  };
  const creditReview = async () => {
    const note = await ask("Credit review note (information only)", { placeholder: "Outstanding, overdue, credit limit…", yes: "Save" });
    if (note === null) return;
    run(() => adrApi.creditReview(r.id, note), "Credit review recorded");
  };
  const addFiles = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length) run(() => adrApi.addAttachments(r.id, files), "Document(s) added");
  };

  return (
    <Box>
      {confirmDialog}
      {askDialog}
      <ReplyModal
        isOpen={replyOpen}
        onClose={() => setReplyOpen(false)}
        sending={busy}
        question={lastQuestion ? lastQuestion.remarks : null}
        onSend={async (message, files) => {
          await run(() => adrApi.reply(r.id, message, files, r.version), (x) => `${x.request_no} re-submitted (${x.status_label})`);
          setReplyOpen(false);
        }}
      />
      <PageTitle
        title={<HStack as="span" spacing={3}><span>{r.request_no}</span><AdrBadge status={r.status} /></HStack>}
        subtitle={`${r.party_name} · ${r.requested_by_name} · created ${fmtDate(r.created_at)}${r.round_no > 1 ? ` · round ${r.round_no}` : ""}`}
        right={
          <HStack flexWrap="wrap">
            {actions.can_rsm_decide && <Button size="sm" colorScheme="orange" onClick={() => navigate(`/additional-discount/requests/${r.id}/rsm-approval`)}>RSM decision</Button>}
            {actions.can_final_decide && <Button size="sm" colorScheme="blue" onClick={() => navigate(`/additional-discount/requests/${r.id}/final-approval`)}>Final decision</Button>}
            {actions.can_reply && <Button size="sm" colorScheme="purple" onClick={() => setReplyOpen(true)}>Respond to clarification</Button>}
            {actions.can_edit && <Button size="sm" variant="outline" onClick={() => navigate(`/additional-discount/requests/${r.id}/edit`)}>Edit request</Button>}
            {actions.can_submit && <Button size="sm" colorScheme="teal" onClick={submit} isLoading={busy}>Submit</Button>}
            {actions.can_credit_review && <Button size="sm" variant="outline" onClick={creditReview}>Credit review</Button>}
            {actions.can_cancel && <Button size="sm" variant="ghost" colorScheme="red" onClick={cancel} isLoading={busy}>Cancel</Button>}
            <Button size="sm" variant="ghost" onClick={() => navigate(-1)}>Back</Button>
          </HStack>
        }
      />

      {r.status === "CLARIFICATION" && lastQuestion && (
        <Alert status="warning" borderRadius="8px" mb={4} fontSize="sm"><AlertIcon /><Box><Text fontWeight="700">Clarification asked by {lastQuestion.actor_name}</Text><Text>{lastQuestion.remarks}</Text></Box></Alert>
      )}
      {(r.status === "REJECTED" || r.status === "CANCELLED") && (r.final_remarks || r.cancel_reason) && (
        <Alert status="error" borderRadius="8px" mb={4} fontSize="sm"><AlertIcon />{r.status === "REJECTED" ? `Rejected: ${r.final_remarks}` : `Cancelled: ${r.cancel_reason}`}</Alert>
      )}
      {routing && r.status === "DRAFT" && (
        <Alert status="info" borderRadius="8px" mb={4} fontSize="sm"><AlertIcon />{routing.route === "DIRECT_TO_FINAL" ? `On submit it goes directly to final approval (${routing.reason}).` : `On submit it goes to ${routing.rsm_name} (RSM), then to final approval.`}</Alert>
      )}
      {data.other_open_requests.length > 0 && (
        <Alert status="warning" borderRadius="8px" mb={4} fontSize="sm"><AlertIcon />Also in approval for this party: {data.other_open_requests.map((o) => `${o.item_name} on ${o.request_no}`).join("; ")}</Alert>
      )}
      {data.other_active_approvals.length > 0 && (
        <Alert status="info" borderRadius="8px" mb={4} fontSize="sm"><AlertIcon />Existing approved balance for this party: {data.other_active_approvals.map((o) => `${o.item_name} ${o.balance_qty} at ${rs(o.approved_per_unit)}/unit (${o.request_no}, till ${fmtDate(o.valid_till)})`).join("; ")}</Alert>
      )}

      <Section title="Summary" right={<Button size="xs" variant="link" onClick={() => navigate(`/additional-discount/party-history?party=${r.party_ledger_id}`)}>Party discount history →</Button>}>
        <RequestSummary r={r} />
        {r.justification && <Box mt={3}><Text fontSize="xs" color="gray.500">Justification</Text><Text fontSize="sm" whiteSpace="pre-wrap">{r.justification}</Text></Box>}
        {r.final_remarks && r.status !== "REJECTED" && <Box mt={3}><Text fontSize="xs" color="gray.500">Final approver's remarks</Text><Text fontSize="sm">{r.final_remarks}</Text></Box>}
      </Section>

      <Section title="Products">
        <ItemsTable items={items} showUsage={!!r.final_decided_at} />
      </Section>

      <Tabs size="sm" variant="enclosed" colorScheme="teal">
        <TabList flexWrap="wrap">
          <Tab>Approval status & timeline</Tab>
          <Tab>Utilization ({utilization.length})</Tab>
          <Tab>Documents ({attachments.length})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
              <Box><Text fontWeight="700" fontSize="sm" mb={2}>Stages</Text><ApprovalStages approvals={approvals} fmtDateTime={fmtDateTime} /></Box>
              <Box><Text fontWeight="700" fontSize="sm" mb={2}>Timeline</Text><Timeline history={history} fmtDateTime={fmtDateTime} /></Box>
            </SimpleGrid>
          </TabPanel>
          <TabPanel px={0}>
            <UsageTable rows={utilization} fmtDateTime={fmtDateTime} />
          </TabPanel>
          <TabPanel px={0}>
            <AttachmentList
              attachments={attachments}
              onRemove={actions.can_edit ? async (a) => (await confirm("Remove document", a.original_name, { yes: "Remove", danger: true })) && run(() => adrApi.removeAttachment(r.id, a.id), "Document removed") : undefined}
            />
            {actions.can_add_attachment && (
              <Flex mt={3}>
                <Input ref={fileRef} type="file" multiple display="none" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx" onChange={addFiles} />
                <Button size="sm" variant="outline" onClick={() => fileRef.current && fileRef.current.click()} isLoading={busy}>Add documents</Button>
              </Flex>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AdrRequestDetail;
