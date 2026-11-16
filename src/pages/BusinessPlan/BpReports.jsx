// Business Plan → Reports (GET /business-plan/reports/:key, ?format=csv for Excel)
import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Flex, Select, SimpleGrid, Text } from "@chakra-ui/react";
import { bpApi, apiError } from "../../services/businessPlanApi";
import { DataTable, EMPTY_FILTERS, ErrorBox, FilterBar, Loading, PageTitle, PerfBadge, money, pct, qty, signedMoney, useBpToast } from "./bpShared";

const REPORTS = [
  ["company", "Company Business Plan"],
  ["state", "State-wise Business Plan"],
  ["territory", "Territory-wise Business Plan"],
  ["employee", "Employee-wise Business Plan"],
  ["distributor", "Distributor-wise Business Plan"],
  ["retailer", "Retailer-wise Business Plan"],
  ["product", "Product-wise Business Plan"],
  ["variance", "Variance Report"],
  ["underDist", "Underperforming Distributor Report"],
  ["underProduct", "Underperforming Product Report"],
  ["growth", "Business Growth Report"],
];

const BpReports = () => {
  const notify = useBpToast();
  const [key, setKey] = useState("company");
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReport(await bpApi.report(key, filters));
    } catch (err) {
      setError(apiError(err, "Could not load the report"));
    } finally {
      setLoading(false);
    }
  }, [key, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      await bpApi.downloadReport(key, filters);
      notify.ok("Report downloaded");
    } catch (err) {
      notify.fail(err, "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const isQty = key === "product" || key === "underProduct";
  const render = (colKey) => (r) => {
    const v = r[colKey];
    if (v === null || v === undefined) return "—";
    if (colKey === "achievement_percent") return <PerfBadge performance={r.performance} percent={v} />;
    if (colKey.endsWith("growth_percent")) return <Text as="span" color={v < 0 ? "red.500" : "green.600"}>{pct(v)}</Text>;
    if (colKey === "variance") return <Text as="span" color={v < 0 ? "red.500" : "green.600"}>{signedMoney(v)}</Text>;
    if (["target", "actual", "previous"].includes(colKey) && typeof v === "number") return isQty ? qty(v) : money(v);
    return String(v);
  };

  return (
    <Box>
      <PageTitle
        title="Business Plan Reports"
        subtitle="Filter, view and export to Excel (CSV)"
        right={
          <Button size="sm" colorScheme="teal" onClick={exportCsv} isLoading={exporting}>
            ⬇ Export to Excel
          </Button>
        }
      />
      <Flex gap={2} mb={3}>
        <Select size="sm" maxW="360px" value={key} onChange={(e) => setKey(e.target.value)} borderRadius="8px">
          {REPORTS.map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </Select>
      </Flex>
      <FilterBar value={filters} onChange={setFilters} show={["financial_year", "season", "state_id", "territory_id", "product_id", "employee_id"]} />
      {error && <ErrorBox message={error} onRetry={load} />}
      {loading && !report ? (
        <Loading />
      ) : report && key === "company" ? (
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
          {(report.rows || []).map((r) => (
            <Box key={r.metric} border="1px solid" borderColor="gray.100" borderRadius="12px" p={4}>
              <Text fontSize="xs" color="gray.500" fontWeight="700">{r.metric}</Text>
              <Text fontSize="xl" fontWeight="800">
                {r.metric.includes("%") ? pct(r.value) : r.metric.includes("Plans") ? r.value : money(r.value)}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      ) : report ? (
        <DataTable
          rows={report.rows}
          emptyText="No data for these filters."
          rowKey={(r) => `${r.key ?? r.ledger_id ?? r.plan_id ?? r.line_id ?? r.name}`}
          columns={(report.columns || []).map((c) => ({ key: c.key, label: c.label, render: render(c.key), numeric: ["target", "actual", "previous", "variance"].includes(c.key) }))}
        />
      ) : null}
    </Box>
  );
};

export default BpReports;
