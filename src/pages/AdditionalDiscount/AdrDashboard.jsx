// Additional Discount → Dashboard: KPIs (same set as discount.html), my work queue, expiring
// approvals and recent requests. Data is scoped by the server to what this user may see.
import React, { useState } from "react";
import { Box, Button, Flex, HStack, Input, SimpleGrid, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  AdrBadge, DataTable, ErrorBox, Loading, PageTitle, Section, Tile, TileGrid, adrApi, fmtDate, pctText, rs,
  useAdrMe, useLoad,
} from "./adrShared";

const AdrDashboard = () => {
  const navigate = useNavigate();
  const { me } = useAdrMe();
  const [range, setRange] = useState({ date_from: "", date_to: "" });
  const { data, loading, error, reload } = useLoad(() => adrApi.dashboard(range), [range.date_from, range.date_to]);
  const k = data ? data.kpis : null;
  const q = me ? me.queue : null;
  const go = (path) => () => navigate(path);

  return (
    <Box>
      <PageTitle
        title="Additional Discount"
        subtitle="Request & approval management — RSM recommendation, then final approval"
        right={
          <HStack>
            {me && me.can_create && (
              <Button size="sm" colorScheme="teal" onClick={go("/additional-discount/requests/new")}>+ Request additional discount</Button>
            )}
          </HStack>
        }
      />

      {q && (q.pending_rsm_for_me > 0 || q.pending_final_for_me > 0 || q.clarification_for_me > 0 || q.my_drafts > 0) && (
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={3} mb={5}>
          {q.pending_rsm_for_me > 0 && <Tile label="Waiting for my RSM recommendation" value={q.pending_rsm_for_me} tone="orange" onClick={go("/additional-discount/pending-rsm")} />}
          {q.pending_final_for_me > 0 && <Tile label="Waiting for final approval" value={q.pending_final_for_me} tone="blue" onClick={go("/additional-discount/pending-final")} />}
          {q.clarification_for_me > 0 && <Tile label="My requests needing clarification" value={q.clarification_for_me} tone="purple" onClick={go("/additional-discount/clarifications")} />}
          {q.my_drafts > 0 && <Tile label="My drafts" value={q.my_drafts} tone="gray" onClick={go("/additional-discount/my-requests")} />}
        </SimpleGrid>
      )}

      <Flex gap={2} mb={4} align="center" wrap="wrap">
        <Text fontSize="xs" color="gray.500">Requests created from</Text>
        <Input size="sm" type="date" maxW="160px" value={range.date_from} onChange={(e) => setRange((r) => ({ ...r, date_from: e.target.value }))} borderRadius="8px" />
        <Text fontSize="xs" color="gray.500">to</Text>
        <Input size="sm" type="date" maxW="160px" value={range.date_to} onChange={(e) => setRange((r) => ({ ...r, date_to: e.target.value }))} borderRadius="8px" />
        {(range.date_from || range.date_to) && <Button size="sm" variant="ghost" onClick={() => setRange({ date_from: "", date_to: "" })}>Clear</Button>}
      </Flex>

      {error && <ErrorBox message={error} onRetry={reload} />}
      {loading && !data ? <Loading /> : null}
      {k && (
        <>
          <Box bg="teal.600" color="white" borderRadius="14px" p={5} mb={4}>
            <Text fontSize="xs" textTransform="uppercase" opacity={0.85}>Approved additional discount</Text>
            <Text fontSize="3xl" fontWeight="800">{rs(k.approved_value)}</Text>
            <Text fontSize="sm" opacity={0.9}>
              Used {rs(k.utilized_value)} ({pctText(k.utilization_pct)}) · Open balance {rs(k.open_balance_value)} · Expired unused {rs(k.expired_unused_value)}
            </Text>
          </Box>
          <TileGrid>
            <Tile label="Total requests" value={k.total} onClick={go("/additional-discount/requests")} />
            <Tile label="Pending RSM" value={k.pending_rsm} tone="orange" onClick={go("/additional-discount/pending-rsm")} />
            <Tile label="Pending final" value={k.pending_final} tone="blue" onClick={go("/additional-discount/pending-final")} />
            <Tile label="Clarification" value={k.clarification} tone="purple" onClick={go("/additional-discount/clarifications")} />
            <Tile label="Approved" value={k.approved} sub={`${k.partially_approved} partially`} tone="green" onClick={go("/additional-discount/approved")} />
            <Tile label="Rejected" value={k.rejected} tone="red" onClick={go("/additional-discount/rejected")} />
            <Tile label="Expired" value={k.expired} tone="gray" onClick={go("/additional-discount/expired")} />
            <Tile label="Cancelled" value={k.cancelled} tone="gray" />
            <Tile label="Direct to final" value={k.direct_to_final} sub="no RSM in the line" tone="gray" />
            <Tile label="Requested value" value={rs(k.requested_value)} tone="orange" />
            <Tile label="Approval rate" value={pctText(k.approval_rate_pct)} tone="green" />
            <Tile label="Avg. decision time" value={k.avg_decision_hours === null ? "—" : `${k.avg_decision_hours} h`} tone="blue" />
          </TileGrid>

          <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
            <Section title="Expiring soon (unused balance)" right={<Button size="xs" variant="link" onClick={go("/additional-discount/utilization")}>Utilization →</Button>}>
              <DataTable
                rows={data.expiring_soon}
                onRowClick={(r) => navigate(`/additional-discount/requests/${r.id}`)}
                emptyText="Nothing expiring."
                columns={[
                  { key: "request_no", label: "Request" },
                  { key: "party_name", label: "Party" },
                  { key: "valid_till", label: "Valid till", render: (r) => fmtDate(r.valid_till) },
                  { key: "balance", label: "Balance", numeric: true, render: (r) => rs(r.balance) },
                ]}
              />
            </Section>
            <Section title="Recent requests" right={<Button size="xs" variant="link" onClick={go("/additional-discount/requests")}>All requests →</Button>}>
              <DataTable
                rows={data.recent}
                onRowClick={(r) => navigate(`/additional-discount/requests/${r.id}`)}
                emptyText="No requests yet."
                columns={[
                  { key: "request_no", label: "Request", render: (r) => <Box><Text fontWeight="700">{r.request_no}</Text><Text fontSize="xs" color="gray.500">{fmtDate(r.created_at)}</Text></Box> },
                  { key: "party_name", label: "Party", render: (r) => <Box><Text>{r.party_name}</Text><Text fontSize="xs" color="gray.500">{r.requested_by_name}</Text></Box> },
                  { key: "requested_discount_value", label: "Requested", numeric: true, render: (r) => rs(r.requested_discount_value) },
                  { key: "status", label: "Status", render: (r) => <AdrBadge status={r.status} /> },
                ]}
              />
            </Section>
          </SimpleGrid>
        </>
      )}
    </Box>
  );
};

export default AdrDashboard;
