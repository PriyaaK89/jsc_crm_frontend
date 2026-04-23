// src/pages/Dashboard/Dashboard.jsx
import { SimpleGrid, Box, Text } from "@chakra-ui/react";
import DashboardLayout from "../../components/layout/DashboardLayout";

const Dashboard = () => {
  return (
   
    <DashboardLayout > 
     <Box 
     w="100%"
      bg="white"
     mt={{base:2, md:0}}
     px={{base:3, md:4}}
     py={{base:3, md:7}}
    borderRadius="lg"
    boxShadow="md" >
      <SimpleGrid  bg="white"  columns={{ base: 1, md: 3 }}  spacing={6} >
        <Box  bg="blue.100" p={4} borderRadius="md" >
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
      </Box>
    </DashboardLayout>
    

  );
};

export default Dashboard;
