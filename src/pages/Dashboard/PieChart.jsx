import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { API_ENDPOINTS } from "../../services/endpoints";
import API from "../../services/api";
import { useEffect, useState } from "react";
import { FormControl, FormLabel, Input, Box, Text } from "@chakra-ui/react";

// ✅ More colors (no repeat issue)
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28CFF",
  "#FF6699",
  "#33CC99",
  "#FF4444",
];

// ✅ Clean Custom Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#fff",
          padding: "8px",
          borderRadius: "6px",
          fontSize: "11px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        <p><strong>{payload[0].name}</strong></p>
        <p>Count: {payload[0].value}</p>
      </div>
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

  const fetchChartData = async () => {
    try {
      const res = await API.get(API_ENDPOINTS.emp_daily_summary, {
        params: { date },
      });

      const summaryData = res.data.summary;
      setSummary(summaryData);

      // ✅ Object → Array convert
     
      const formattedData = [
  { name: "Active Employees", value: summaryData.active_employees || 1 },
  { name: "Checked In", value: summaryData.checked_in || 1 },
  { name: "Half Day", value: summaryData.half_day || 1 },
  { name: "Absent", value: summaryData.absent_count || 1 },
  { name: "Leave", value: summaryData.leave_count || 1 },
];

      setChartData(formattedData);
    } catch (error) {
      console.error("Chart API Error:", error);
    }
  };
  {chartData.map((entry, index) => (
  <Cell
    key={index}
    fill={COLORS[index % COLORS.length]}
    stroke="#fff"
    strokeWidth={2}
  />
))}
  

  useEffect(() => {
    if (date) {
      fetchChartData();
    }
  }, [date]);

  return (
    <Box
      mt={{ base: 2, md: 5 }}
      px={{ base: 3, md: 6 }}
      py={{ base: 3, md: 4 }}
      borderRadius="lg"
      boxShadow="md"
      bg="white"
      width={{base:"100%", md:"50%", lg:"40%"}}

    >
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Employee Summary
      </Text>
      {/* ✅ Date Picker */}
      <FormControl maxW="300px" mb={4}>
        <FormLabel fontSize="11px">Select Date:</FormLabel>
        <Input
          fontSize="11px"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </FormControl>

      {/* ✅ Pie Chart */}
      <PieChart width={400} height={350}>
        <Pie
          data={chartData}
          innerRadius={70}
          outerRadius={110}
          paddingAngle={3} // 🔥 gap between slices
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
          fontSize="11px"
        >
           {chartData.map((entry, index) => (
  <Cell
    key={index}
    fill={COLORS[index % COLORS.length]}
    stroke="#fff"
    strokeWidth={2}
  />
))}
  </Pie>

        {/* ✅ Tooltip */}
        <Tooltip content={<CustomTooltip />} />

        {/* ✅ Legend */}
        <Legend wrapperStyle={{ fontSize: "11px" }} />
      </PieChart>

      {/* ✅ Extra Summary */}
      <Text fontSize="11px">
        Completed Day: {summary.completed_day || 0}
      </Text>
      <Text fontSize="11px">
        Checked In: {summary.checked_in || 0}
      </Text>
    </Box>
  );
}