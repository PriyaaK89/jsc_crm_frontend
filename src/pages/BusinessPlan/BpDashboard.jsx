// Business Plan → Dashboard (GET /business-plan/dashboard)
import React, { useCallback, useEffect, useState } from "react";
import { Alert, AlertIcon, Box, Button, Flex, HStack, SimpleGrid, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { bpApi, apiError } from "../../services/businessPlanApi";
import {
  ChartCard,
  ChartGrid,
  CompareBars,
  SERIES,
  StatCard,
  StatGrid,
  formatCompact,
  formatMoney,
} from "../Dashboard/analytics/chartKit";
import {
  DataTable,
  EMPTY_FILTERS,
  ErrorBox,
  FilterBar,
  PageTitle,
  PerfBadge,
  StatusBadge,
  money,
  pct,
  qty, useOpenPlan } from "./bpShared";

const BpDashboard = () => {
  const navigate = useNavigate();
  const openPlan = useOpenPlan(navigate);
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await bpApi.dashboard(filters));
    } catch (err) {
      setError(apiError(err, "Could not load the dashboard"));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const k = data?.kpis || {};
  const cov = data?.coverage || {};
  const plans = data?.plans || [];
  const chart = plans
    .filter((p) => ["ACTIVE", "CLOSED"].includes(p.status))
    .slice(0, 10)
    .map((p) => ({ name: p.plan_code, target: Number(p.sales_target) || 0, achieved: Number(p.achieved) || 0 }));

  return (
    <Box>
      <PageTitle
        title="Business Plan Dashboard"
        subtitle="Planning, targets & achievement — your scope"
        right={
          <HStack>
            <Button size="sm" variant="outline" onClick={() => navigate("/business-plan/plans?pending=1")}>
              Pending approvals
            </Button>
            <Button size="sm" colorScheme="teal" onClick={() => navigate("/business-plan/plans?create=1")}>
              + Create Business Plan
            </Button>
          </HStack>
        }
      />
      <FilterBar value={filters} onChange={setFilters} />
      {error && <ErrorBox message={error} onRetry={load} />}

      <StatGrid columns={{ base: 2, md: 3, xl: 5 }}>
        <StatCard
          label="Total Business Plan Value"
          value={formatMoney(data?.total_business_plan_value)}
          hint={`${data?.total_plans ?? 0} plan(s), all statuses`}
          tone="violet"
          loading={loading}
        />
        <StatCard
          label="Achievement %"
          value={pct(k.achievement_percent)}
          hint={k.performance?.label}
          tone={k.performance?.tone === "green" ? "green" : k.performance?.tone === "orange" ? "amber" : "rose"}
          progress={k.achievement_percent}
          loading={loading}
        />
        <StatCard label="Sales Target (Active)" value={formatMoney(k.total_sales_target)} tone="blue" loading={loading} />
        <StatCard label="Achieved Sales" value={formatMoney(k.achieved_sales)} tone="green" loading={loading} />
        <StatCard label="Business Plan Gap" value={formatMoney(k.business_plan_gap)} tone="rose" loading={loading} />
        <StatCard label="Collection Target" value={formatMoney(k.total_collection_target)} tone="blue" loading={loading} />
        <StatCard
          label="Achieved Collection"
          value={formatMoney(k.achieved_collection)}
          hint={`${pct(k.collection_achievement_percent)} of target`}
          tone="green"
          loading={loading}
        />
        <StatCard label="Pending Sales Target" value={formatMoney(k.pending_sales_target)} tone="amber" loading={loading} />
        <StatCard label="Pending Collection" value={formatMoney(k.pending_collection)} tone="amber" loading={loading} />
        <StatCard
          label="Open Alerts"
          value={data?.alert_count ?? 0}
          hint="Behind target / follow-ups"
          tone="rose"
          loading={loading}
        />
      </StatGrid>

      <Text fontSize="sm" fontWeight="800" color="gray.700" mb={2}>
        Distributor / Retailer Coverage
      </Text>
      <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} spacing={3} mb={5}>
        {[
          ["Planned Distributors", cov.planned_distributors],
          ["Active Distributors", cov.active_distributors],
          ["Planned Retailers", cov.planned_retailers],
          ["Active Retailers", cov.active_retailers],
          ["Total Planned Qty", qty(cov.total_planned_qty)],
          ["Actual Sold Qty", qty(cov.actual_sold_qty)],
        ].map(([label, value]) => (
          <Box key={label} border="1px solid" borderColor="gray.100" borderRadius="12px" p={3}>
            <Text fontSize="xs" color="gray.500" fontWeight="600">
              {label}
            </Text>
            <Text fontSize="lg" fontWeight="800">
              {loading ? "…" : value ?? 0}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      <ChartGrid>
        <ChartCard
          title="Target vs Achieved — Active plans"
          subtitle="Sales in the plan period, by plan"
          loading={loading}
          isEmpty={!chart.length}
          height={Math.max(220, chart.length * 38)}
          span={7}
        >
          <CompareBars
            data={chart}
            series={[
              { key: "target", name: "Target", color: SERIES.blue },
              { key: "achieved", name: "Achieved", color: SERIES.aqua },
            ]}
            format={formatMoney}
            axisFormat={formatCompact}
          />
        </ChartCard>
        <Box
          gridColumn={{ xl: "span 5" }}
          bg="white"
          borderRadius="14px"
          p={{ base: 3, md: 4 }}
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.100"
        >
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="sm" fontWeight="700">
              Alerts
            </Text>
            <Button size="xs" variant="link" colorScheme="teal" onClick={() => navigate("/business-plan/analysis?tab=alerts")}>
              View all
            </Button>
          </Flex>
          {(data?.alerts || []).length === 0 ? (
            <Text fontSize="sm" color="gray.500" py={6} textAlign="center">
              {loading ? "Loading…" : "No alerts — everything on track."}
            </Text>
          ) : (
            data.alerts.map((a, i) => (
              <Alert
                key={`${a.plan_id}-${i}`}
                status={a.severity === "HIGH" ? "error" : "warning"}
                borderRadius="10px"
                mb={2}
                fontSize="sm"
                cursor="pointer"
                onClick={() => openPlan(a)}
              >
                <AlertIcon />
                <Box>
                  <Text fontWeight="700">{a.plan_name}</Text>
                  <Text>{a.text}</Text>
                </Box>
              </Alert>
            ))
          )}
          <Text fontSize="xs" fontWeight="700" color="gray.600" mt={4} mb={1}>
            Plans by status
          </Text>
          <HStack wrap="wrap" spacing={2}>
            {Object.entries(data?.status_counts || {}).map(([s, n]) => (
              <StatusBadge key={s} status={s} label={`${s.replace(/_/g, " ")}: ${n}`} />
            ))}
          </HStack>
        </Box>
      </ChartGrid>

      <Text fontSize="sm" fontWeight="800" color="gray.700" mt={6} mb={2}>
        Business Plans
      </Text>
      <DataTable
        rows={plans}
        onRowClick={openPlan}
        emptyText={loading ? "Loading…" : "No business plans for these filters yet."}
        columns={[
          { key: "plan_code", label: "Plan", render: (p) => (<Box><Text fontWeight="700">{p.plan_code}</Text><Text fontSize="xs" color="gray.500">{p.name}</Text></Box>) },
          { key: "assigned_user_name", label: "Employee" },
          { key: "fy", label: "FY / Season", render: (p) => `${p.financial_year} · ${p.season}` },
          { key: "territory_name", label: "Territory", render: (p) => p.territory_name || p.state_name },
          { key: "sales_target", label: "Target", numeric: true, render: (p) => money(p.sales_target) },
          { key: "achieved", label: "Achieved", numeric: true, render: (p) => money(p.achieved) },
          { key: "achievement_percent", label: "Achv", render: (p) => <PerfBadge performance={p.performance} percent={p.achievement_percent} /> },
          { key: "status", label: "Status", render: (p) => <StatusBadge status={p.status} label={p.status_label} /> },
        ]}
      />
    </Box>
  );
};

export default BpDashboard;
