// Additional Discount → Party Discount History (?party=<ledger id>): KPIs and the last 10
// submitted requests of one party.
import React, { useEffect, useState } from "react";
import { Box, Flex, Input, Select, Text } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AdrBadge, DataTable, ErrorBox, Loading, PageTitle, Tile, TileGrid, adrApi, apiError, fmtDate, rs, useAdrToast } from "./adrShared";

const AdrPartyHistory = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const notify = useAdrToast();
  const partyId = Number(params.get("party")) || "";
  const [search, setSearch] = useState("");
  const [parties, setParties] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        setParties(await adrApi.parties(search.trim()));
      } catch (_) {
        setParties([]); // users without CREATE can still open a party from a request
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!partyId) {
      setData(null);
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await adrApi.partyHistory(partyId));
      } catch (err) {
        setError(apiError(err, "Could not load the party history"));
        notify.fail(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [partyId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box>
      <PageTitle title="Party Discount History" subtitle="Last 10 submitted requests of a party" />
      <Flex gap={2} mb={4} wrap="wrap">
        <Input size="sm" maxW="240px" placeholder="Search party" value={search} onChange={(e) => setSearch(e.target.value)} borderRadius="8px" />
        <Select size="sm" maxW="320px" value={partyId} onChange={(e) => setParams(e.target.value ? { party: e.target.value } : {})} placeholder="-- Select party --" borderRadius="8px">
          {parties.map((p) => <option key={p.id} value={p.id}>{p.ledger_name}</option>)}
          {data && data.party && !parties.some((p) => p.id === data.party.id) && <option value={data.party.id}>{data.party.ledger_name}</option>}
        </Select>
      </Flex>
      {error && <ErrorBox message={error} />}
      {loading && <Loading />}
      {!partyId && <Text color="gray.500" fontSize="sm">Choose a party.</Text>}
      {data && !loading && (
        <>
          <Text fontWeight="800" mb={2}>{data.party ? data.party.ledger_name : ""}{data.party && data.party.state ? ` · ${data.party.state}` : ""}</Text>
          <TileGrid columns={{ base: 2, md: 5 }}>
            <Tile label="Requests" value={data.kpis.total} />
            <Tile label="Approved" value={data.kpis.approved} tone="green" />
            <Tile label="Rejected" value={data.kpis.rejected} tone="red" />
            <Tile label="Approved value" value={rs(data.kpis.approved_value)} tone="teal" />
            <Tile label="Used on sales" value={rs(data.kpis.utilized_value)} tone="blue" />
          </TileGrid>
          <DataTable
            rows={data.rows}
            onRowClick={(r) => navigate(`/additional-discount/requests/${r.id}`)}
            emptyText="No submitted requests for this party."
            columns={[
              { key: "request_no", label: "Request", render: (r) => <Box><Text fontWeight="700">{r.request_no}</Text><Text fontSize="xs" color="gray.500">{fmtDate(r.created_at)}</Text></Box> },
              { key: "products", label: "Products" },
              { key: "requested_by_name", label: "Employee" },
              { key: "reason_text", label: "Reason" },
              { key: "requested_discount_value", label: "Requested", numeric: true, render: (r) => rs(r.requested_discount_value) },
              { key: "approved_discount_value", label: "Approved", numeric: true, render: (r) => rs(r.approved_discount_value) },
              { key: "utilized_discount_value", label: "Used", numeric: true, render: (r) => rs(r.utilized_discount_value) },
              { key: "status", label: "Status", render: (r) => <AdrBadge status={r.status} /> },
            ]}
          />
        </>
      )}
    </Box>
  );
};

export default AdrPartyHistory;
