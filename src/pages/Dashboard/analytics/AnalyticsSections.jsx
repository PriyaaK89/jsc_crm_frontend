import { Box, Flex, Text } from "@chakra-ui/react";
import { ChartCard, ChartGrid,
  CompareBars, Donut, Section, SectionError, SERIES,
  StackedColumns, StatCard, StatGrid, STATUS, TrendArea,
  formatCompact, formatMoney, formatNumber, titleCase, } from "./chartKit";

const TARGET_NOTE = "Targets running in the selected dates, measured over each target's full period";

const TARGET_SERIES = [
  { key: "target", name: "Target", color: SERIES.blue },
  { key: "achieved", name: "Achieved", color: SERIES.orange },
];

const STATUS_SERIES = ["approved", "pending", "returned", "rejected"].map((key) => ({
  key,
  name: STATUS[key.toUpperCase()].label,
  color: STATUS[key.toUpperCase()].color,
}));

const hasPoints = (rows, key) => (rows || []).some((row) => Number(row[key]) > 0);

const targetTooltip = (format) => (point) => [
  { name: "Pending", value: format(point.pending) },
  { name: "Achieved %", value: `${point.percent}%` },
];

// ---------- top row ----------
// A section that failed shows a dash here, never a false zero.
const Kpi = ({ section, value, hint, progress, ...card }) =>
  section.error ? (
    <StatCard {...card} value="—" hint="Not available" />
  ) : (
    <StatCard {...card} loading={section.loading} value={value} hint={hint} progress={progress} />
  );

export const KpiRow = ({ sections }) => {
  const { orders, approvals, visits, sales, collections } = sections;
  const value = (section, key) => section.data?.summary?.[key];

  return (
    <StatGrid columns={{ base: 2, md: 3, xl: 6 }}>
      <Kpi section={sales} label="Net sales" value={formatCompact(value(sales, "net_sales"))} hint={`${value(sales, "percent") || 0}% of target`} tone="blue" progress={value(sales, "percent")} />
      <Kpi section={orders} label="Sales orders" value={formatNumber(value(orders, "total"))} hint={`${formatNumber(value(orders, "pending"))} pending`} tone="violet" />
      <Kpi section={collections} label="Collected" value={formatCompact(value(collections, "collected"))} hint={`${value(collections, "percent") || 0}% of target`} tone="green" progress={value(collections, "percent")} />
      <Kpi section={collections} label="Outstanding" value={formatCompact(value(collections, "outstanding"))} hint={`${formatCompact(value(collections, "overdue"))} overdue`} tone="rose" />
      <Kpi section={visits} label="Visits completed" value={`${formatNumber(value(visits, "achieved"))} / ${formatNumber(value(visits, "target"))}`} hint={`${value(visits, "percent") || 0}% of target`} tone="green" progress={value(visits, "percent")} />
      <Kpi section={approvals} label="Pending approvals" value={formatNumber(value(approvals, "pending"))} hint={`${value(approvals, "approval_rate") || 0}% approved`} tone="amber" />
    </StatGrid>
  );
};

// ---------- sections ----------
export const OrdersSection = ({ section }) => {
  const { data, loading, error, reload } = section;
  const s = data?.summary || {};
  const statusItems = (data?.status || []).map((row) => ({
    name: STATUS[row.status]?.label || titleCase(row.status),
    value: row.count,
    color: STATUS[row.status]?.color,
  }));

  return (
    <Section title="Sales order analytics" subtitle="Orders raised in the selected period" accent="blue">
      {error ? (
        <SectionError message={error} onRetry={reload} />
      ) : (
        <>
          <StatGrid columns={{ base: 2, md: 4 }}>
            <StatCard loading={loading} label="Total orders" value={formatNumber(s.total)} hint={formatMoney(s.total_value)} tone="blue" />
            <StatCard loading={loading} label="Approved" value={formatNumber(s.approved)} hint={formatMoney(s.approved_value)} tone="green" />
            <StatCard loading={loading} label="Pending" value={formatNumber(s.pending)} hint={formatMoney(s.pending_value)} tone="amber" />
            <StatCard loading={loading} label="Rejected" value={formatNumber(s.rejected)} hint={`${formatNumber(s.returned)} returned`} tone="rose" />
          </StatGrid>
          <ChartGrid>
            <ChartCard span={8} title="Sales order trend" subtitle="Orders by status in each period" loading={loading} isEmpty={!hasPoints(data?.trend, "total")}>
              <StackedColumns data={data?.trend} series={STATUS_SERIES} />
            </ChartCard>
            <ChartCard span={4} title="Order status split" subtitle="Share of all orders" loading={loading} isEmpty={!statusItems.length}>
              <Donut items={statusItems} centerLabel="Orders" />
            </ChartCard>
            <ChartCard title="Order value trend" subtitle="Value of all orders raised" loading={loading} isEmpty={!hasPoints(data?.trend, "value")}>
              <TrendArea data={data?.trend} dataKey="value" name="Order value" format={formatMoney} axisFormat={formatCompact} />
            </ChartCard>
            <ChartCard title="Orders by employee" subtitle="Top 8 by orders raised" loading={loading} isEmpty={!data?.by_employee?.length}>
              <CompareBars
                data={data?.by_employee}
                series={[{ key: "total", name: "Orders", color: SERIES.blue }]}
                extra={(p) => [
                  { name: "Approved", value: formatNumber(p.approved) },
                  { name: "Pending", value: formatNumber(p.pending) },
                ]}
              />
            </ChartCard>
          </ChartGrid>
        </>
      )}
    </Section>
  );
};

export const VisitsSection = ({ section }) => {
  const { data, loading, error, reload } = section;
  const s = data?.summary || {};
  const byType = (data?.by_type || []).map((row) => ({ ...row, name: titleCase(row.visit_type) }));
  const outcomes = (data?.outcomes || []).slice(0, 7).map((row) => ({ name: titleCase(row.outcome), value: row.count }));

  return (
    <Section title="Employee visit performance" subtitle="Assigned visit targets against completed visits" accent="green">
      {error ? (
        <SectionError message={error} onRetry={reload} />
      ) : (
        <>
          <StatGrid columns={{ base: 2, md: 4 }}>
            <StatCard loading={loading} label="Assigned target" value={formatNumber(s.target)} tone="blue" />
            <StatCard loading={loading} label="Completed" value={formatNumber(s.achieved)} hint={`${s.percent || 0}% of target`} tone="green" progress={s.percent} />
            <StatCard loading={loading} label="Pending visits" value={formatNumber(s.pending)} tone="amber" />
            <StatCard loading={loading} label="All visits in period" value={formatNumber(s.total_visits)} tone="violet" />
          </StatGrid>
          <ChartGrid>
            <ChartCard span={12} title="Employee-wise visit performance" subtitle={TARGET_NOTE} loading={loading} isEmpty={!data?.by_employee?.length} height={340}>
              <CompareBars data={data?.by_employee} series={TARGET_SERIES} extra={targetTooltip(formatNumber)} />
            </ChartCard>
            <ChartCard span={4} title="Target vs completed by visit type" loading={loading} isEmpty={!byType.length}>
              <CompareBars data={byType} series={TARGET_SERIES} extra={targetTooltip(formatNumber)} />
            </ChartCard>
            <ChartCard span={4} title="Visits over time" loading={loading} isEmpty={!hasPoints(data?.trend, "visits")}>
              <TrendArea data={data?.trend} dataKey="visits" name="Visits" color={SERIES.aqua} />
            </ChartCard>
            <ChartCard span={4} title="Visit outcomes" loading={loading} isEmpty={!outcomes.length}>
              <Donut items={outcomes} centerLabel="Visits" />
            </ChartCard>
          </ChartGrid>
        </>
      )}
    </Section>
  );
};

export const SalesSection = ({ section }) => {
  const { data, loading, error, reload } = section;
  const s = data?.summary || {};

  return (
    <Section title="Employee sales performance" subtitle="Sales achieved against sales targets" accent="violet">
      {error ? (
        <SectionError message={error} onRetry={reload} />
      ) : (
        <>
          <StatGrid>
            <StatCard loading={loading} label="Net sales" value={formatCompact(s.net_sales)} hint={`${formatNumber(s.invoices)} invoices`} tone="blue" />
            <StatCard loading={loading} label="Sales with tax" value={formatCompact(s.gross_sales)} hint={`Average ${formatCompact(s.average_invoice)}`} tone="violet" />
            <StatCard loading={loading} label="Sales target" value={formatCompact(s.target)} hint={`${formatNumber(s.target_count)} targets`} tone="blue" />
            <StatCard loading={loading} label="Target achieved" value={formatCompact(s.achieved)} hint={`${s.percent || 0}% of target`} tone="green" progress={s.percent} />
            <StatCard loading={loading} label="Target pending" value={formatCompact(s.pending)} tone="amber" />
          </StatGrid>
          <ChartGrid>
            <ChartCard
              span={12}
              title="Sales trend"
              subtitle="Net sales before tax"
              loading={loading}
              isEmpty={!hasPoints(data?.trend, "net")}
            >
              <TrendArea
                data={data?.trend}
                dataKey="net"
                name="Net sales"
                format={formatMoney}
                axisFormat={formatCompact}
                extra={(p) => [
                  { name: "With tax", value: formatMoney(p.gross) },
                  { name: "Invoices", value: formatNumber(p.invoices) },
                ]}
              />
            </ChartCard>
            <ChartCard title="Sales target vs achievement" subtitle={TARGET_NOTE} loading={loading} isEmpty={!data?.by_employee?.length} height={320}>
              <CompareBars data={data?.by_employee} series={TARGET_SERIES} format={formatMoney} axisFormat={formatCompact} extra={targetTooltip(formatMoney)} />
            </ChartCard>
            <ChartCard title="Employee-wise sales" subtitle="Top 10 by net sales in the selected dates" loading={loading} isEmpty={!data?.employee_sales?.length} height={320}>
              <CompareBars
                data={data?.employee_sales}
                series={[{ key: "amount", name: "Net sales", color: SERIES.blue }]}
                format={formatMoney}
                axisFormat={formatCompact}
                extra={(p) => [{ name: "Invoices", value: formatNumber(p.invoices) }]}
              />
            </ChartCard>
          </ChartGrid>
        </>
      )}
    </Section>
  );
};

export const CollectionsSection = ({ section }) => {
  const { data, loading, error, reload } = section;
  const s = data?.summary || {};

  return (
    <Section title="Collection analytics" subtitle="Collections against targets and pending amounts" accent="green">
      {error ? (
        <SectionError message={error} onRetry={reload} />
      ) : (
        <>
          <StatGrid>
            <StatCard loading={loading} label="Collected" value={formatCompact(s.collected)} hint={`${formatNumber(s.receipts)} receipts`} tone="green" />
            <StatCard loading={loading} label="Collection target" value={formatCompact(s.target)} hint={`${formatNumber(s.target_count)} targets`} tone="blue" />
            <StatCard loading={loading} label="Target achieved" value={`${s.percent || 0}%`} hint={formatCompact(s.achieved)} tone="violet" progress={s.percent} />
            <StatCard loading={loading} label="Target pending" value={formatCompact(s.pending)} tone="amber" />
            <StatCard loading={loading} label="Outstanding today" value={formatCompact(s.outstanding)} hint={`${formatCompact(s.overdue)} overdue`} tone="rose" />
          </StatGrid>
          <ChartGrid>
            <ChartCard span={12} title="Collection trend" subtitle="Receipts in each period" loading={loading} isEmpty={!hasPoints(data?.trend, "collected")}>
              <TrendArea
                data={data?.trend}
                dataKey="collected"
                name="Collected"
                color={SERIES.aqua}
                format={formatMoney}
                axisFormat={formatCompact}
                extra={(p) => [{ name: "Receipts", value: formatNumber(p.receipts) }]}
              />
            </ChartCard>
            <ChartCard title="Collection target vs actual" subtitle={TARGET_NOTE} loading={loading} isEmpty={!data?.by_employee?.length} height={320}>
              <CompareBars data={data?.by_employee} series={TARGET_SERIES} format={formatMoney} axisFormat={formatCompact} extra={targetTooltip(formatMoney)} />
            </ChartCard>
            <ChartCard title="Employee-wise collection" subtitle="Top 10 by receipts in the selected dates" loading={loading} isEmpty={!data?.employee_collections?.length} height={320}>
              <CompareBars
                data={data?.employee_collections}
                series={[{ key: "amount", name: "Collected", color: SERIES.aqua }]}
                format={formatMoney}
                axisFormat={formatCompact}
                extra={(p) => [{ name: "Receipts", value: formatNumber(p.receipts) }]}
              />
            </ChartCard>
            <ChartCard title="Pending amount by age" subtitle="Unpaid bills as of today, not affected by the dates" loading={loading} isEmpty={!hasPoints(data?.ageing, "amount")}>
              <CompareBars
                data={data?.ageing}
                categoryKey="label"
                series={[{ key: "amount", name: "Pending", color: SERIES.orange }]}
                format={formatMoney}
                axisFormat={formatCompact}
                extra={(p) => [{ name: "Bills", value: formatNumber(p.bills) }]}
              />
            </ChartCard>
            <ChartCard title="Largest overdue parties" subtitle="Top 5, as of today" loading={loading} isEmpty={!data?.overdue_parties?.length}>
              <Box h="100%" overflowY="auto">
                {(data?.overdue_parties || []).map((party) => (
                  <Flex key={party.id} justify="space-between" align="center" gap={3} py={2.5} borderBottom="1px solid" borderColor="gray.100">
                    <Box minW={0}>
                      <Text fontSize="sm" fontWeight="600" color="gray.800" noOfLines={1}>
                        {party.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatNumber(party.bills)} overdue bills
                      </Text>
                    </Box>
                    <Text fontSize="sm" fontWeight="700" color="gray.800" flexShrink={0}>
                      {formatMoney(party.amount)}
                    </Text>
                  </Flex>
                ))}
              </Box>
            </ChartCard>
          </ChartGrid>
        </>
      )}
    </Section>
  );
};

export const ApprovalsSection = ({ section }) => {
  const { data, loading, error, reload } = section;
  const s = data?.summary || {};
  const byType = (data?.by_type || []).map((row) => ({ ...row, name: titleCase(row.transaction_type) }));

  return (
    <Section title="Approval analytics" subtitle="Sales, purchase, receipt and credit note approvals raised in the selected period" accent="amber">
      {error ? (
        <SectionError message={error} onRetry={reload} />
      ) : (
        <>
          <StatGrid>
            <StatCard loading={loading} label="Total records" value={formatNumber(s.total)} tone="blue" />
            <StatCard loading={loading} label="Approved" value={formatNumber(s.approved)} hint={`${s.approval_rate || 0}% approval rate`} tone="green" progress={s.approval_rate} />
            <StatCard loading={loading} label="Pending" value={formatNumber(s.pending)} tone="amber" />
            <StatCard loading={loading} label="Rejected" value={formatNumber(s.rejected)} hint={`${s.rejection_rate || 0}% of records`} tone="rose" />
            <StatCard loading={loading} label="Returned" value={formatNumber(s.returned)} tone="violet" />
          </StatGrid>
          <ChartGrid>
            <ChartCard span={12} title="Approval trend" subtitle="Records by status in each period" loading={loading} isEmpty={!hasPoints(data?.trend, "total")}>
              <StackedColumns data={data?.trend} series={STATUS_SERIES} />
            </ChartCard>
            <ChartCard title="Approvals by type" subtitle="Hover for the approval rate" loading={loading} isEmpty={!byType.length}>
              <CompareBars
                data={byType}
                series={[
                  { key: "approved", name: "Approved", color: SERIES.blue },
                  { key: "pending", name: "Pending", color: SERIES.orange },
                ]}
                extra={(p) => [
                  { name: "Rejected", value: formatNumber(p.rejected) },
                  { name: "Returned", value: formatNumber(p.returned) },
                  { name: "Approval rate", value: `${p.approval_rate}%` },
                ]}
              />
            </ChartCard>
            <ChartCard title="Pending with approvers" subtitle="Top 8, who the records are waiting on" loading={loading} isEmpty={!data?.pending_by_approver?.length}>
              <CompareBars data={data?.pending_by_approver} series={[{ key: "pending", name: "Pending", color: SERIES.orange }]} />
            </ChartCard>
          </ChartGrid>
        </>
      )}
    </Section>
  );
};

export const BusinessSection = ({ section }) => {
  const { data, loading, error, reload } = section;
  const s = data?.summary || {};
  const categories = (data?.categories || []).map((row) => ({ name: row.name, value: row.amount }));
  const amountSeries = [{ key: "amount", name: "Sales", color: SERIES.blue }];

  return (
    <Section title="Overall business performance" subtitle="Products, customers and new dealers" accent="rose">
      {error ? (
        <SectionError message={error} onRetry={reload} />
      ) : (
        <>
          <StatGrid columns={{ base: 2, md: 3 }}>
            <StatCard loading={loading} label="Customers billed" value={formatNumber(s.active_customers)} tone="blue" />
            <StatCard loading={loading} label="New dealers" value={formatNumber(s.new_dealers)} tone="green" />
            <StatCard
              loading={loading}
              label="New dealer target"
              value={`${formatNumber(s.dealer_target_achieved)} / ${formatNumber(s.dealer_target)}`}
              tone="violet"
              progress={s.dealer_target ? (s.dealer_target_achieved / s.dealer_target) * 100 : 0}
            />
          </StatGrid>
          <ChartGrid>
            <ChartCard span={4} title="Sales by category" subtitle="Item value before tax" loading={loading} isEmpty={!categories.length} height={320}>
              <Donut items={categories} format={formatCompact} centerLabel="Sales" />
            </ChartCard>
            <ChartCard span={4} title="Top products" subtitle="Top 8 by value" loading={loading} isEmpty={!data?.products?.length} height={320}>
              <CompareBars data={data?.products} series={amountSeries} format={formatMoney} axisFormat={formatCompact} />
            </ChartCard>
            <ChartCard span={4} title="Top customers" subtitle="Top 8 by net sales" loading={loading} isEmpty={!data?.customers?.length} height={320}>
              <CompareBars
                data={data?.customers}
                series={amountSeries}
                format={formatMoney}
                axisFormat={formatCompact}
                extra={(p) => [{ name: "Invoices", value: formatNumber(p.invoices) }]}
              />
            </ChartCard>
            <ChartCard span={12} title="New dealers over time" loading={loading} isEmpty={!hasPoints(data?.new_dealers, "dealers")} height={240}>
              <TrendArea data={data?.new_dealers} dataKey="dealers" name="New dealers" color={SERIES.violet} />
            </ChartCard>
          </ChartGrid>
        </>
      )}
    </Section>
  );
};
