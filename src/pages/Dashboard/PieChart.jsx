import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Box, Flex, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const pad = (n) => String(n).padStart(2, "0");
// Local date (toISOString is UTC and shows yesterday early in the morning in India).
const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const SLICES = [
  { key: "active_employees", name: "Active", color: "#16a34a" },
  { key: "checked_in", name: "Checked in", color: "#2563eb" },
  { key: "half_day", name: "Half day", color: "#f59e0b" },
  { key: "absent_count", name: "Absent", color: "#ef4444" },
  { key: "leave_count", name: "Leave", color: "#8b5cf6" },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box bg="white" p={2.5} borderRadius="8px" boxShadow="md" border="1px solid" borderColor="gray.100" fontSize="12px">
      <Text fontWeight="700" color="gray.800">{payload[0].name}</Text>
      <Text color="gray.600">Employees: {payload[0].value}</Text>
    </Box>
  );
};

export default function AttendanceCard() {
  const [date, setDate] = useState(todayLocal());
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!date) return undefined;
    let cancelled = false;
    setLoading(true);

    API.get(API_ENDPOINTS.emp_daily_summary, { params: { date } })
      .then((res) => {
        if (!cancelled) setSummary(res.data?.summary || {});
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setSummary({});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  const slices = SLICES.map((s) => ({ ...s, value: Number(summary[s.key]) || 0 }));
  const hasData = slices.some((s) => s.value > 0);
  const pieData = hasData ? slices.filter((s) => s.value > 0) : [{ name: "No data", value: 1, color: "#e5e7eb" }];

  return (
    <Flex
      direction="column"
      h="100%"
      bg="white"
      borderRadius="12px"
      border="1px solid"
      borderColor="gray.100"
      boxShadow="0 1px 3px rgba(0,0,0,0.06)"
      overflow="hidden"
    >
      <Flex justify="space-between" align="center" gap={3} px={5} py={3.5} borderBottom="1px solid" borderColor="gray.100">
        <Box minW={0}>
          <Text fontSize="sm" fontWeight="700" color="gray.800">Employee attendance</Text>
          <Text fontSize="xs" color="gray.500">Daily summary</Text>
        </Box>
        <Input size="sm" type="date" w="150px" borderRadius="8px" max={todayLocal()} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
      </Flex>

      <Box position="relative" h="190px" mt={2} opacity={loading ? 0.5 : 1} transition="opacity 0.2s">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={pieData} innerRadius={58} outerRadius={80} paddingAngle={hasData ? 3 : 0} dataKey="value" stroke="none">
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            {hasData && <Tooltip content={<CustomTooltip />} />}
          </PieChart>
        </ResponsiveContainer>

        <Flex position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" direction="column" align="center" pointerEvents="none">
          <Text fontSize="22px" fontWeight="800" color="gray.800" lineHeight="1">
            {summary.total_employees ?? 0}
          </Text>
          <Text fontSize="11px" color="gray.500" mt={1}>Total</Text>
        </Flex>
      </Box>

      <VStack align="stretch" spacing={2} px={5} py={4} mt="auto">
        {slices.map((s) => (
          <Flex key={s.key} justify="space-between" align="center">
            <HStack spacing={2}>
              <Box w="8px" h="8px" borderRadius="full" bg={s.color} />
              <Text fontSize="xs" color="gray.600">{s.name}</Text>
            </HStack>
            <Text fontSize="xs" fontWeight="600" color="gray.800">{s.value}</Text>
          </Flex>
        ))}
        <Flex justify="space-between" pt={2} borderTop="1px solid" borderColor="gray.100">
          <Text fontSize="xs" color="gray.500">Completed day</Text>
          <Text fontSize="xs" fontWeight="600" color="gray.800">{summary.completed_day || 0}</Text>
        </Flex>
      </VStack>
    </Flex>
  );
}