// Business Plan → Analysis: Plan vs Actual, Matrix, Forecast, Alerts
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  ButtonGroup,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { bpApi, apiError } from "../../services/businessPlanApi";
import { ChartCard, ChartGrid, CompareBars, SERIES, formatCompact, formatMoney, formatNumber } from "../Dashboard/analytics/chartKit";
import { DataTable, EMPTY_FILTERS, ErrorBox, FilterBar, Loading, PageTitle, PerfBadge, money, pct, qty, signedMoney, useOpenPlan } from "./bpShared";

const TABS = ["pva", "matrix", "forecast", "alerts"];

// fetches one view whenever the filters change
const useView = (fetcher, filters, active) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetcher(filters));
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }, [fetcher, filters]);
  useEffect(() => {
    if (active) load();
  }, [active, load]);
  return { data, error, loading, load };
};

const PlanVsActual = ({ filters, active }) => {
  const navigate = useNavigate();
  const openPlan = useOpenPlan(navigate);
  const { data, error, loading, load } = useView(bpApi.planVsActual, filters, active);
  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!data) return <Loading />;
  const chart = (data.plans || []).slice(0, 12).map((p) => ({ name: p.plan_code, target: p.target, actual: p.actual }));
  const products = (data.products || []).slice(0, 12).map((p) => ({ name: p.name, target: p.qty_target, actual: p.actual_qty }));
  return (
    <Box>
      <ChartGrid>
        <ChartCard title="Target vs Achievement" subtitle="Sales by plan" loading={loading} isEmpty={!chart.length} height={Math.max(220, chart.length * 38)} span={6}>
          <CompareBars
            data={chart}
            series={[
              { key: "target", name: "Target", color: SERIES.blue },
              { key: "actual", name: "Actual", color: SERIES.aqua },
            ]}
            format={formatMoney}
            axisFormat={formatCompact}
          />
        </ChartCard>
        <ChartCard title="Product-wise Performance" subtitle="Quantity: target vs sold" loading={loading} isEmpty={!products.length} height={Math.max(220, products.length * 38)} span={6}>
          <CompareBars
            data={products}
            series={[
              { key: "target", name: "Target Qty", color: SERIES.blue },
              { key: "actual", name: "Actual Qty", color: SERIES.aqua },
            ]}
            format={formatNumber}
          />
        </ChartCard>
      </ChartGrid>
      <Text fontWeight="800" fontSize="sm" mt={6} mb={2}>Plans</Text>
      <DataTable
        rows={data.plans}
        rowKey={(r) => r.plan_id}
        onRowClick={openPlan}
        emptyText="No plans for these filters."
        columns={[
          { key: "name", label: "Plan", render: (r) => (<Box><Text fontWeight="700">{r.plan_code}</Text><Text fontSize="xs" color="gray.500">{r.name}</Text></Box>) },
          { key: "target", label: "Target", numeric: true, render: (r) => money(r.target) },
          { key: "actual", label: "Actual", numeric: true, render: (r) => money(r.actual) },
          { key: "difference", label: "Diff", numeric: true, render: (r) => <Text as="span" color={r.difference < 0 ? "red.500" : "green.600"}>{signedMoney(r.difference)}</Text> },
          { key: "pct", label: "Achv", render: (r) => <PerfBadge performance={r.performance} percent={r.achievement_percent} /> },
        ]}
      />
      <Text fontWeight="800" fontSize="sm" mt={6} mb={2}>Distributor Contribution</Text>
      <DataTable
        rows={data.distributor_contribution}
        rowKey={(r) => r.ledger_id}
        emptyText="No distributor targets yet."
        columns={[
          { key: "name", label: "Distributor" },
          { key: "target", label: "Target", numeric: true, render: (r) => money(r.target) },
          { key: "actual", label: "Actual", numeric: true, render: (r) => money(r.actual) },
          { key: "share_percent", label: "Share", numeric: true, render: (r) => pct(r.share_percent) },
          { key: "pct", label: "Achv", render: (r) => <PerfBadge performance={r.performance} percent={r.achievement_percent} /> },
        ]}
      />
    </Box>
  );
};

const METRICS = [
  ["QUANTITY", "Quantity"],
  ["SALES_VALUE", "Sales Value"],
  ["ACHIEVEMENT", "Achievement %"],
  ["GROWTH", "Growth %"],
];

const Matrix = ({ filters, active }) => {
  const [metric, setMetric] = useState("QUANTITY");
  const { data, error, load } = useView(bpApi.matrix, filters, active);
  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!data) return <Loading />;
  const cell = (c) => {
    if (!c?.planned) return "—";
    switch (metric) {
      case "SALES_VALUE":
        return (<Box><Text>{money(c.planned_value)}</Text><Text fontSize="xs" color="gray.500">act {money(c.actual_value)}</Text></Box>);
      case "ACHIEVEMENT":
        return pct(c.achievement_percent);
      case "GROWTH":
        return c.growth_percent === null || c.growth_percent === undefined ? "—" : pct(c.growth_percent);
      default:
        return (<Box><Text>{qty(c.planned_qty)}</Text><Text fontSize="xs" color="gray.500">act {qty(c.actual_qty)}</Text></Box>);
    }
  };
  return (
    <Box>
      <ButtonGroup size="sm" isAttached variant="outline" mb={4} flexWrap="wrap">
        {METRICS.map(([v, l]) => (
          <Button key={v} colorScheme={metric === v ? "teal" : "gray"} variant={metric === v ? "solid" : "outline"} onClick={() => setMetric(v)}>
            {l}
          </Button>
        ))}
      </ButtonGroup>
      <DataTable
        rows={data.rows}
        rowKey={(r) => r.ledger_id}
        emptyText="Add distributors with product planning to see the matrix."
        columns={[
          { key: "name", label: "Party", render: (r) => <Text fontWeight="700">{r.name}</Text> },
          ...(data.products || []).map((p, i) => ({ key: `p${p.stock_item_id}`, label: p.name, render: (r) => cell(r.cells[i]) })),
          { key: "total_target", label: "Total Target", numeric: true, render: (r) => money(r.total_target) },
        ]}
      />
    </Box>
  );
};

const Forecast = ({ filters, active }) => {
  const navigate = useNavigate();
  const openPlan = useOpenPlan(navigate);
  const { data, error, load } = useView(bpApi.forecast, filters, active);
  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!data) return <Loading />;
  const items = data.items || [];
  if (!items.length) return <Text color="gray.500" textAlign="center" py={8}>No active plans to forecast. Approve a plan first.</Text>;
  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
      {items.map((f) => (
        <Box key={f.plan_id} border="1px solid" borderColor="gray.100" borderRadius="12px" p={4} cursor="pointer" onClick={() => openPlan(f)}>
          <Text fontSize="xs" color="gray.500" fontWeight="700">{f.plan_code}</Text>
          <Text fontWeight="800" mb={3}>{f.name}</Text>
          <SimpleGrid columns={3} spacing={2} mb={3}>
            {[["Target", money(f.target)], ["Achieved", money(f.achieved)], ["Remaining", money(f.remaining)]].map(([l, v]) => (
              <Box key={l} bg="gray.50" borderRadius="10px" p={2} textAlign="center">
                <Text fontWeight="800" fontSize="sm">{v}</Text>
                <Text fontSize="10px" color="gray.500" fontWeight="700">{l.toUpperCase()}</Text>
              </Box>
            ))}
          </SimpleGrid>
          <Text fontSize="sm">Days elapsed / total: <b>{f.days_elapsed} / {f.days_total}</b> · remaining {f.days_remaining}</Text>
          <Text fontSize="sm">Current run-rate: <b>{money(f.current_run_rate)}/day</b></Text>
          <Text fontSize="sm">Projected final: <b>{money(f.projected_final)}</b> ({pct(f.projected_percent)})</Text>
          <Alert status={f.on_pace ? "success" : "warning"} borderRadius="10px" mt={3} fontSize="sm">
            <AlertIcon />
            {f.on_pace_label} — required run-rate {money(f.required_run_rate)}/day
          </Alert>
        </Box>
      ))}
    </SimpleGrid>
  );
};

const Alerts = ({ filters, active }) => {
  const navigate = useNavigate();
  const openPlan = useOpenPlan(navigate);
  const { data, error, load } = useView(bpApi.alerts, filters, active);
  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!data) return <Loading />;
  if (!data.items?.length) return <Text color="gray.500" textAlign="center" py={8}>No alerts — everything on track.</Text>;
  return (
    <Box>
      {data.items.map((a, i) => (
        <Alert key={`${a.plan_id}-${i}`} status={a.severity === "HIGH" ? "error" : "warning"} borderRadius="10px" mb={2} cursor="pointer" onClick={() => openPlan(a)}>
          <AlertIcon />
          <Box>
            <Text fontWeight="700" fontSize="sm">
              {a.plan_name} <Badge ml={1} fontSize="9px">{a.type.replace(/_/g, " ")}</Badge>
            </Text>
            <Text fontSize="sm">{a.text}</Text>
          </Box>
        </Alert>
      ))}
    </Box>
  );
};

const BpAnalysis = () => {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const index = Math.max(TABS.indexOf(params.get("tab") || "pva"), 0);
  return (
    <Box>
      <PageTitle title="Plan Analysis" subtitle="Plan vs actual, party × product matrix, run-rate forecast and alerts" />
      <FilterBar value={filters} onChange={setFilters} />
      <Tabs index={index} onChange={(i) => setParams({ tab: TABS[i] }, { replace: true })} size="sm" variant="soft-rounded" colorScheme="teal" isLazy>
        <TabList flexWrap="wrap" gap={1}>
          <Tab>Plan vs Actual</Tab>
          <Tab>Matrix</Tab>
          <Tab>Forecast</Tab>
          <Tab>Alerts</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}><PlanVsActual filters={filters} active={index === 0} /></TabPanel>
          <TabPanel px={0}><Matrix filters={filters} active={index === 1} /></TabPanel>
          <TabPanel px={0}><Forecast filters={filters} active={index === 2} /></TabPanel>
          <TabPanel px={0}><Alerts filters={filters} active={index === 3} /></TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default BpAnalysis;
