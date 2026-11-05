import { Box, Grid, GridItem } from "@chakra-ui/react";
import {
  ChartCard,
  ChartGrid,
  Donut,
  Section,
  SERIES,
  STATUS,
  TrendArea,
  formatCompact,
  formatMoney,
  formatNumber,
  titleCase,
} from "./chartKit";

const hasPoints = (rows, key) => (rows || []).some((row) => Number(row[key]) > 0);

// The "at a glance" tab: only the few charts an admin needs first.
export default function OverviewSection({ sections, attendance }) {
  const { orders, visits, sales, collections } = sections;

  const statusItems = (orders.data?.status || []).map((row) => ({
    name: STATUS[row.status]?.label || titleCase(row.status),
    value: row.count,
    color: STATUS[row.status]?.color,
  }));
  const outcomes = (visits.data?.outcomes || []).slice(0, 7).map((row) => ({
    name: titleCase(row.outcome),
    value: row.count,
  }));

  return (
    <Section title="Overview" subtitle="Key trends for the selected period" accent="blue">
      <Grid
        templateColumns={{ base: "minmax(0,1fr)", xl: attendance ? "minmax(0,4fr) minmax(0,8fr)" : "minmax(0,1fr)" }}
        gap={4}
        alignItems="stretch"
      >
        {attendance && <GridItem minW={0}>{attendance}</GridItem>}
        <GridItem minW={0}>
          <ChartGrid>
            <ChartCard
              span={12}
              title="Sales trend"
              subtitle="Net sales before tax"
              loading={sales.loading}
              isEmpty={!hasPoints(sales.data?.trend, "net")}
            >
              <TrendArea
                data={sales.data?.trend}
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
          </ChartGrid>
        </GridItem>
      </Grid>

      <Box mt={4}>
        <ChartGrid>
          <ChartCard
            span={4}
            title="Collection trend"
            subtitle="Receipts in each period"
            loading={collections.loading}
            isEmpty={!hasPoints(collections.data?.trend, "collected")}
          >
            <TrendArea
              data={collections.data?.trend}
              dataKey="collected"
              name="Collected"
              color={SERIES.aqua}
              format={formatMoney}
              axisFormat={formatCompact}
              extra={(p) => [{ name: "Receipts", value: formatNumber(p.receipts) }]}
            />
          </ChartCard>
          <ChartCard span={4} title="Order status split" subtitle="Share of all orders" loading={orders.loading} isEmpty={!statusItems.length}>
            <Donut items={statusItems} centerLabel="Orders" />
          </ChartCard>
          <ChartCard span={4} title="Visit outcomes" subtitle="Completed visits by result" loading={visits.loading} isEmpty={!outcomes.length}>
            <Donut items={outcomes} centerLabel="Visits" />
          </ChartCard>
        </ChartGrid>
      </Box>
    </Section>
  );
}