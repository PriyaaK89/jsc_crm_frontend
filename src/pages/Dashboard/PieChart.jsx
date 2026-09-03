import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import {
  Box,
  Text,
  Flex,
  Input,
  FormControl,
  FormLabel,
  HStack,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const COLORS = [
  "#3c6586", // Indigo
  "#2ba056", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#47a1ca", // Blue
];

//  Modern Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        bg="white"
        p={3}
        borderRadius="lg"
        boxShadow="lg"
        fontSize="12px"
      >
        <Text fontWeight="bold">{payload[0].name}</Text>
        <Text color="gray.600">Count: {payload[0].value}</Text>
      </Box>
    );
  }
  return null;
};

export default function MyPieChart() {
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({});
  const [totalEmp, setTotalEmp] = useState([]);

  const fetchChartData = async () => {
    try {
      const res = await API.get(API_ENDPOINTS.emp_daily_summary, {
        params: { date },
      });

      const s = res.data.summary;
      setSummary(s);
      console.log('summary', res.data.summary)
      setTotalEmp(res?.data?.summary?.total_employees)
      console.log("total",  res?.data?.summary?.total_employees)

      const data = [
        { name: "Active", value: s.active_employees },
        { name: "Checked In", value: s.checked_in },
        { name: "Half Day", value: s.half_day },
        { name: "Absent", value: s.absent_count },
        { name: "Leave", value: s.leave_count },
      ];

      setChartData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (date) fetchChartData();
  }, [date]);

  //  total for center
  const total = chartData.reduce((acc, item) => acc + item.value, 0);

  return (
    <Box bg="white" borderRadius="13px" boxShadow="0px 2px 6px #c6c6c6" w="100%" maxW="500px" mt={8} >
      {/* Header */}
      <Flex justify="space-between" align="flex-start" padding="14px 14px 8px" background="#e3eeeb" borderRadius="13px 13px 0px 0px">
        <Text fontWeight="bold" fontSize="16px" color="#464748">
          Employee Summary
        </Text>

        <FormControl maxW="160px" bg="white" borderRadius="12px">
          <Input size="sm" type="date" value={date} onChange={(e) => setDate(e.target.value)} borderRadius="12px" />
        </FormControl>
      </Flex>

      {/* Chart */}
      <Box position="relative" h="260px" >
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={70}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/*  Center Content */}
        <Flex
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          direction="column"
          align="center"
        >
          <Text fontSize="20px" fontWeight="bold">
           {totalEmp}
          </Text>
          <Text fontSize="12px" color="gray.500">
            Total
          </Text>
        </Flex>
      </Box>

      <Divider my={4} />

      {/*  Legend (Custom Professional) */}
      <Box p={5}>
      <VStack align="stretch" spacing={2}>
        {chartData.map((item, index) => (
          <Flex key={index} justify="space-between" align="center">
            <HStack>
              <Box
                w="10px"
                h="10px"
                borderRadius="full"
                bg={COLORS[index % COLORS.length]}
              />
              <Text fontSize="11px">{item.name}</Text>
            </HStack>

            <Text fontSize="11px" fontWeight="medium">
              {item.value}
            </Text>
          </Flex>
        ))}
      </VStack>

      {/* Extra Summary */}
      <Box mt={4}>
        <Text fontSize="12px" color="gray.600">
          Completed Day: {summary.completed_day || 0}
        </Text>
      </Box>
      </Box>
    </Box>
  );
}