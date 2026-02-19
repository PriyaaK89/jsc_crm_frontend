// src/pages/Dashboard/Dashboard.jsx
import { SimpleGrid, Box, Text } from "@chakra-ui/react";
import DashboardLayout from "../../components/layout/DashboardLayout";

const Dashboard = () => {
  return (
    <DashboardLayout > 
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Box bg="blue.100" p={4} borderRadius="md">
          <Text fontWeight="bold">Total Users</Text>
          <Text fontSize="2xl">120</Text>
        </Box>
        <Box bg="green.100" p={4} borderRadius="md">
          <Text fontWeight="bold">Active Leads</Text>
          <Text fontSize="2xl">45</Text>
        </Box>
        <Box bg="yellow.100" p={4} borderRadius="md">
          <Text fontWeight="bold">Completed Tasks</Text>
          <Text fontSize="2xl">75</Text>
        </Box>
      </SimpleGrid>

      {/* Additional content like tables, charts can go here */}
    </DashboardLayout>
  );
};

export default Dashboard;
