// Additional Discount → Reports (VIEW_ADDITIONAL_DISCOUNT_REPORTS): the 11 server reports,
// rendered from their column definitions, with date range filters and CSV export.
import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Input, Select, Table, TableContainer, Tbody, Td, Text, Tfoot, Th, Thead, Tr } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ErrorBox, Loading, PageTitle, adrApi, apiError, fmtDate, rs, useLoad } from "./adrShared";

const cell = (type, v) => {
  if (v === null || v === undefined || v === "") return "—";
  if (type === "money") return rs(v);
  if (type === "percent") return `${v}%`;
  if (type === "date") return fmtDate(v);
  if (type === "number") return Number(v).toLocaleString("en-IN");
  return String(v);
};

const toCsv = (rep) => {
  const esc = (s) => `"${String(s === null || s === undefined ? "" : s).replace(/"/g, '""')}"`;
  const lines = [rep.columns.map((c) => esc(c.label)).join(",")];
  rep.rows.forEach((r) => lines.push(rep.columns.map((c) => esc(r[c.key])).join(",")));
  return lines.join("\n");
};

const AdrReports = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: list, error: listError } = useLoad(() => adrApi.reportList(), []);
  const key = params.get("report") || "requests";
  const [range, setRange] = useState({ date_from: "", date_to: "" });
  const [rep, setRep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setRep(await adrApi.report(key, range));
      } catch (err) {
        setError(apiError(err, "Could not load the report"));
        setRep(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [key, range]);

  const exportCsv = () => {
    const blob = new Blob([toCsv(rep)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `additional-discount-${key}-${range.date_from || "all"}-${range.date_to || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (listError) return <ErrorBox message={listError} />;
  return (
    <Box>
      <PageTitle title="Reports" subtitle="Discount governance reports" right={rep && rep.rows.length ? <Button size="sm" variant="outline" onClick={exportCsv}>Export CSV</Button> : null} />
      <Flex gap={2} mb={4} wrap="wrap" align="center">
        <Select size="sm" maxW="300px" value={key} onChange={(e) => setParams({ report: e.target.value })} borderRadius="8px">
          {(list || []).map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
        </Select>
        <Text fontSize="xs" color="gray.500">Requests created from</Text>
        <Input size="sm" type="date" maxW="150px" value={range.date_from} onChange={(e) => setRange((x) => ({ ...x, date_from: e.target.value }))} borderRadius="8px" />
        <Text fontSize="xs" color="gray.500">to</Text>
        <Input size="sm" type="date" maxW="150px" value={range.date_to} onChange={(e) => setRange((x) => ({ ...x, date_to: e.target.value }))} borderRadius="8px" />
      </Flex>
      {error && <ErrorBox message={error} />}
      {loading && <Loading />}
      {rep && !loading && (
        <>
          <Text fontWeight="800" mb={2}>{rep.title} · {rep.rows.length} row(s)</Text>
          <TableContainer border="1px solid" borderColor="gray.100" borderRadius="12px" overflowX="auto">
            <Table size="sm">
              <Thead bg="gray.50">
                <Tr>{rep.columns.map((c) => <Th key={c.key} fontSize="10px" isNumeric={["money", "number", "percent"].includes(c.type)}>{c.label}</Th>)}</Tr>
              </Thead>
              <Tbody>
                {rep.rows.map((r, i) => (
                  <Tr key={r.id || r.item_id || r.group_key || i} cursor={r.id || r.request_id ? "pointer" : "default"} _hover={{ bg: "gray.50" }} onClick={() => (r.id || r.request_id) && navigate(`/additional-discount/requests/${r.id || r.request_id}`)}>
                    {rep.columns.map((c) => <Td key={c.key} isNumeric={["money", "number", "percent"].includes(c.type)}>{cell(c.type, r[c.key])}</Td>)}
                  </Tr>
                ))}
              </Tbody>
              {rep.totals && rep.rows.length > 0 && (
                <Tfoot bg="gray.50">
                  <Tr>{rep.columns.map((c, i) => <Th key={c.key} isNumeric={["money", "number", "percent"].includes(c.type)}>{i === 0 ? "Total" : rep.totals[c.key] !== undefined ? cell(c.type, rep.totals[c.key]) : ""}</Th>)}</Tr>
                </Tfoot>
              )}
            </Table>
          </TableContainer>
          {!rep.rows.length && <Text color="gray.500" fontSize="sm" mt={3}>No data for this period.</Text>}
        </>
      )}
    </Box>
  );
};

export default AdrReports;
