import { useRef } from "react";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Icon,
  Progress,
  SimpleGrid,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import { MdInsertChartOutlined } from "react-icons/md";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Fixed order: a series keeps its colour whichever filter is active.
export const SERIES = {
  blue: "#2a78d6",
  orange: "#eb6834",
  aqua: "#1baf7a",
  yellow: "#eda100",
  magenta: "#e87ba4",
  green: "#008300",
  violet: "#6250d6",
  red: "#e34948",
};
const CATEGORICAL = Object.values(SERIES);

// Reserved for order state. Always shown with its label, never by colour alone.
export const STATUS = {
  APPROVED: { label: "Approved", color: "#0ca30c" },
  PENDING: { label: "Pending", color: "#fab219" },
  RETURNED: { label: "Returned", color: "#ec835a" },
  REJECTED: { label: "Rejected", color: "#d03b3b" },
};

const INK = { muted: "#898781", grid: "#e1e0d9", axis: "#c3c2b7" };

export const CARD_TONES = {
  blue: "linear(135deg, #1b4f96, #2a78d6)",
  green: "linear(135deg, #0a5c40, #12906a)",
  amber: "linear(135deg, #94530a, #c47500)",
  violet: "linear(135deg, #3f3196, #6250d6)",
  rose: "linear(135deg, #8f2545, #cc4068)",
};

// ---------- formatters ----------
export const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

export const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const formatCompact = (value) => {
  const n = Number(value || 0);
  const abs = Math.abs(n);
  if (abs >= 10000000) return `₹${(n / 10000000).toFixed(abs >= 100000000 ? 0 : 1)}Cr`;
  if (abs >= 100000) return `₹${(n / 100000).toFixed(abs >= 1000000 ? 0 : 1)}L`;
  if (abs >= 1000) return `₹${(n / 1000).toFixed(abs >= 10000 ? 0 : 1)}K`;
  return `₹${Math.round(n)}`;
};

export const titleCase = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const shortName = (value) => {
  const text = String(value || "");
  return text.length > 16 ? `${text.slice(0, 15)}…` : text;
};

// Recharts needs gradient ids that are unique on the page.
let nextChartId = 0;
const useChartId = () => {
  const ref = useRef(null);
  if (ref.current === null) {
    nextChartId += 1;
    ref.current = `dash-chart-${nextChartId}`;
  }
  return ref.current;
};

// ---------- cards ----------
export const StatCard = ({ label, value, hint, tone = "blue", progress, loading }) => (
  <Box
    bgGradient={CARD_TONES[tone]}
    color="white"
    borderRadius="14px"
    p={{ base: 3, md: 4 }}
    minW={0}
    boxShadow="0 6px 16px rgba(27, 79, 150, 0.16)"
    transition="transform 0.2s ease"
    _hover={{ transform: "translateY(-2px)" }}
  >
    <Text fontSize="xs" fontWeight="600" noOfLines={1}>
      {label}
    </Text>
    {loading ? (
      <Skeleton height="28px" mt={2} startColor="whiteAlpha.300" endColor="whiteAlpha.500" />
    ) : (
      <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="800" mt={1} noOfLines={1} title={String(value)}>
        {value}
      </Text>
    )}
    {progress !== undefined && !loading && (
      <Progress
        value={Math.min(Number(progress) || 0, 100)}
        size="xs"
        mt={2}
        borderRadius="full"
        bg="whiteAlpha.300"
        sx={{ "& > div": { background: "white" } }}
        aria-label={label}
      />
    )}
    {hint && !loading && (
      <Text fontSize="xs" mt={1} noOfLines={1} title={hint}>
        {hint}
      </Text>
    )}
  </Box>
);

export const StatGrid = ({ children, columns = { base: 2, md: 3, xl: 5 } }) => (
  <SimpleGrid columns={columns} spacing={3} mb={4}>
    {children}
  </SimpleGrid>
);

// Twelve columns on large screens: span 12 is full width, 6 is two side by side.
export const ChartGrid = ({ children }) => (
  <Grid templateColumns={{ base: "minmax(0, 1fr)", xl: "repeat(12, minmax(0, 1fr))" }} gap={4}>
    {children}
  </Grid>
);

export const Section = ({ title, subtitle, accent = "blue", children }) => (
  <Box as="section" mb={8} aria-label={title}>
    <Flex align="center" gap={3} mb={3}>
      <Box w="5px" h="34px" borderRadius="full" bgGradient={CARD_TONES[accent]} flexShrink={0} />
      <Box minW={0}>
        <Text fontSize="md" fontWeight="800" color="gray.800">
          {title}
        </Text>
        {subtitle && (
          <Text fontSize="xs" color="gray.500">
            {subtitle}
          </Text>
        )}
      </Box>
    </Flex>
    {children}
  </Box>
);

const CenterState = ({ children, height }) => (
  <Flex h={`${height}px`} align="center" justify="center" direction="column" gap={2} textAlign="center" px={4}>
    {children}
  </Flex>
);

export const ChartCard = ({ title, subtitle, loading, isEmpty, height = 280, span = 6, children }) => (
  <Box
    bg="white"
    borderRadius="14px"
    p={{ base: 3, md: 4 }}
    minW={0}
    gridColumn={{ xl: `span ${span}` }}
    boxShadow="sm"
    border="1px solid"
    borderColor="gray.100"
  >
    <Text fontSize="sm" fontWeight="700" color="gray.800">
      {title}
    </Text>
    {subtitle && (
      <Text fontSize="xs" color="gray.500" mt="2px">
        {subtitle}
      </Text>
    )}
    <Box mt={3}>
      {loading ? (
        <Skeleton height={`${height}px`} borderRadius="10px" />
      ) : isEmpty ? (
        <CenterState height={height}>
          <Icon as={MdInsertChartOutlined} boxSize={8} color="gray.300" />
          <Text fontSize="sm" color="gray.500">
            No data for the selected filters
          </Text>
        </CenterState>
      ) : (
        <Box h={`${height}px`} role="img" aria-label={title}>
          {children}
        </Box>
      )}
    </Box>
  </Box>
);

export const SectionError = ({ message, onRetry }) => (
  <Alert status="error" borderRadius="12px" mb={4} flexWrap="wrap" gap={2}>
    <AlertIcon />
    <Text fontSize="sm" flex="1" minW="160px">
      {message}
    </Text>
    <Button size="sm" colorScheme="red" variant="outline" onClick={onRetry}>
      Try again
    </Button>
  </Alert>
);

// ---------- chart parts ----------
const LegendRow = ({ items }) => (
  <HStack spacing={4} wrap="wrap" justify="center" pt={2}>
    {items.map((item) => (
      <HStack key={item.name} spacing={1.5}>
        <Box w="10px" h="10px" borderRadius="3px" bg={item.color} />
        <Text fontSize="xs" color="gray.600">
          {item.name}
        </Text>
      </HStack>
    ))}
  </HStack>
);

const TooltipBox = ({ title, rows }) => (
  <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="10px" boxShadow="lg" px={3} py={2} maxW="240px">
    {title && (
      <Text fontSize="xs" fontWeight="700" color="gray.800" mb={1}>
        {title}
      </Text>
    )}
    {rows.map((row) => (
      <Flex key={row.name} align="center" justify="space-between" gap={4}>
        <HStack spacing={1.5}>
          {row.color && <Box w="8px" h="8px" borderRadius="2px" bg={row.color} />}
          <Text fontSize="xs" color="gray.600">
            {row.name}
          </Text>
        </HStack>
        <Text fontSize="xs" fontWeight="700" color="gray.800">
          {row.value}
        </Text>
      </Flex>
    ))}
  </Box>
);

const SeriesTooltip = ({ active, payload, label, format, extra, series }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  // entry.color is the gradient url, so the swatch colour comes from the series.
  const rows = payload.map((entry) => ({
    name: entry.name,
    color: series?.find((s) => s.key === entry.dataKey)?.color,
    value: format(entry.value),
  }));
  return <TooltipBox title={point.name || label} rows={extra ? [...rows, ...extra(point)] : rows} />;
};

const barGradient = (id, color) => (
  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor={color} stopOpacity={1} />
    <stop offset="100%" stopColor={color} stopOpacity={0.72} />
  </linearGradient>
);

const sideGradient = (id, color) => (
  <linearGradient key={id} id={id} x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stopColor={color} stopOpacity={0.72} />
    <stop offset="100%" stopColor={color} stopOpacity={1} />
  </linearGradient>
);

const axisTick = { fontSize: 11, fill: INK.muted };
const hoverBand = { fill: "rgba(42, 120, 214, 0.06)" };

// Change over time, one measure.
export const TrendArea = ({ data, dataKey, name, color = SERIES.blue, format = formatNumber, axisFormat, extra }) => {
  const id = useChartId();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={INK.grid} />
        <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: INK.axis }} minTickGap={24} />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} width={52} tickFormatter={axisFormat || format} allowDecimals={false} />
        <Tooltip
          cursor={{ stroke: INK.axis }}
          content={<SeriesTooltip format={format} extra={extra} series={[{ key: dataKey, color }]} />}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${id})`}
          dot={data.length === 1 ? { r: 5, fill: color, strokeWidth: 0 } : false}
          activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
          animationDuration={700}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Stacked columns over time. series = [{ key, name, color }]
export const StackedColumns = ({ data, series, format = formatNumber }) => {
  const id = useChartId();
  return (
    <Flex direction="column" h="100%">
      <Box flex="1" minH={0}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>{series.map((s) => barGradient(`${id}-${s.key}`, s.color))}</defs>
            <CartesianGrid vertical={false} stroke={INK.grid} />
            <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: INK.axis }} minTickGap={24} />
            <YAxis tick={axisTick} tickLine={false} axisLine={false} width={40} allowDecimals={false} />
            <Tooltip cursor={hoverBand} content={<SeriesTooltip format={format} series={series} />} />
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.name}
                stackId="total"
                fill={`url(#${id}-${s.key})`}
                stroke="#fff"
                strokeWidth={1}
                maxBarSize={30}
                animationDuration={700}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <LegendRow items={series} />
    </Flex>
  );
};

// Named items compared on one measure or on target vs achieved.
// series = [{ key, name, color }]
export const CompareBars = ({ data, series, categoryKey = "name", format = formatNumber, axisFormat, extra }) => {
  const id = useChartId();
  const multiple = series.length > 1;
  return (
    <Flex direction="column" h="100%">
      <Box flex="1" minH={0}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barGap={2}>
            <defs>{series.map((s) => sideGradient(`${id}-${s.key}`, s.color))}</defs>
            <CartesianGrid horizontal={false} stroke={INK.grid} />
            <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} tickFormatter={axisFormat || format} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey={categoryKey}
              width={112}
              tick={axisTick}
              tickLine={false}
              axisLine={{ stroke: INK.axis }}
              tickFormatter={shortName}
              interval={0}
            />
            <Tooltip cursor={hoverBand} content={<SeriesTooltip format={format} extra={extra} series={series} />} />
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.name}
                fill={`url(#${id}-${s.key})`}
                radius={[0, 4, 4, 0]}
                maxBarSize={multiple ? 12 : 18}
                animationDuration={700}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>
      {multiple && <LegendRow items={series} />}
    </Flex>
  );
};

// items = [{ name, value, color? }]. Parts of a whole, up to seven.
export const Donut = ({ items, format = formatNumber, centerLabel = "Total" }) => {
  const coloured = items.map((item, index) => ({
    ...item,
    color: item.color || CATEGORICAL[index % CATEGORICAL.length],
  }));
  const total = coloured.reduce((sum, item) => sum + Number(item.value || 0), 0);

  const DonutTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0].payload;
    const share = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
    return (
      <TooltipBox
        title={item.name}
        rows={[
          { name: "Value", value: format(item.value) },
          { name: "Share", value: `${share}%` },
        ]}
      />
    );
  };

  return (
    <Flex direction="column" h="100%">
      <Box flex="1" minH={0} position="relative">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPie>
            <Pie
              data={coloured}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="90%"
              paddingAngle={2}
              stroke="#fff"
              strokeWidth={2}
              animationDuration={700}
            >
              {coloured.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </RechartsPie>
        </ResponsiveContainer>
        <Flex position="absolute" inset={0} direction="column" align="center" justify="center" pointerEvents="none">
          <Text fontSize="lg" fontWeight="800" color="gray.800">
            {format(total)}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {centerLabel}
          </Text>
        </Flex>
      </Box>
      <LegendRow items={coloured} />
    </Flex>
  );
};
