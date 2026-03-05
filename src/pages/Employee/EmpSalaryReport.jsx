import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Select,
  Text,
  SimpleGrid,
  FormControl,
  FormLabel,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Spinner   
} from "@chakra-ui/react";

import API from "../../services/api";
import { API_ENDPOINTS } from '../../services/endpoints';

const EmpSalaryReport = () => {
  const [users, setUsers] = useState([]);
  const [dailySalry, setdailySalry] = useState([]);
  const [hasDatafind,setDatafind]=useState(false);
  const [loading, setLoading] = useState(false);
 


  const [filters, setFilters] = useState({
    userId: "",
    startDate: "",
    endDate: "",
  });

  // ✅ Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await API.get(API_ENDPOINTS.GET_USERS);
      if (res.status === 200) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);



  const handleViewDailySalary = async () => {
    setLoading(true);
    setDatafind(true);
    try {
      const res = await API.get(
        `${API_ENDPOINTS.get_daily_salary_report}/${filters.userId}`,
        {
          params: {
            startDate: filters.startDate,
            endDate: filters.endDate,
          },
        }
      );

      if (res.status === 200) {
        setdailySalry(res.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box  bg="white" >

      {/* ================= salary report ================= */}
      <Text fontSize="2xl" fontWeight="bold" mb={6}>
        Daily Salary Report
      </Text>

      <VStack spacing={6} align="stretch">
        
        {/* Filters */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          
          <FormControl>
            <FormLabel>User Name</FormLabel>
            <Select
              placeholder="Select User"
              value={filters.userId}
              onChange={(e) =>
                setFilters({ ...filters, userId: e.target.value })
              }
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl >
            <FormLabel>Start Date</FormLabel>
            <input 
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>End Date</FormLabel>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </FormControl>

          <Button
            colorScheme="blue"
            alignSelf="end"
            isLoading={loading}
            onClick={handleViewDailySalary}
          >
            View
          </Button>
        </SimpleGrid>

           
        {/* table */}
        {hasDatafind && (
        <>
        {loading ? (
                 <Flex justify="center" py={10}>
                   <Spinner size="lg" />
                 </Flex>
               ) : (
                 <Box overflowX="auto"  border="1px solid #b2b2b2" borderRadius="lg" mt={5} >
                   <Table size="sm" minW="1300px" variant="simple" >    
                     <Thead bg="gray.50">
                       <Tr >
                         {["Employee Id", "Salary Date", "Attendance Type", "Working Hours", "Per Day Salary", "Basic Salary", "Travelling Allowance",
                          "Daily Allowance", "Gross Salary", "Net Salary", "Created At"].map((header, index) => (
                           <Th key={index} fontSize='14px' fontWeight='500' color='#2C2D33' textTransform='capitalize'
                             width={header === "employee_id" ? "7%" : "auto" && header === "Per Day Salary" ? '11%' : 'auto' && header === "Created At" ? "8%" : 'auto'} borderColor='#D9D9D9'
                           p={5}>
                             <Flex alignItems="center" gap='7px'>
                               <Text fontSize='14px' color='#2C2D33' fontWeight='400' textTransform='capitalize' fontFamily='InterRegular'>
                                 {header}
                               </Text>

                             </Flex>
                           </Th>
                         ))}
                       </Tr>                                                                      
              
                     </Thead>
       
                     <Tbody >
                       {Array.isArray(dailySalry) && dailySalry.length > 0 && (
                         dailySalry.map((emp) => (
  <Tr key={emp.id} _hover={{ bg: "gray.50" }} p={5}>
    <Td>{emp.employee_id}</Td>
    <Td>{new Date(emp.salary_date).toLocaleDateString()}</Td>
    <Td>{emp.attendance_type}</Td>
    <Td>{emp.working_hours}</Td>
    <Td>{emp.per_day_salary}</Td>
    <Td>{emp.basic_salary}</Td>
    <Td>{emp.travelling_allowance}</Td>
    <Td>{emp.daily_allowance}</Td>
    <Td>{emp.gross_salary}</Td>
    <Td>{emp.net_salary}</Td>
    <Td>{new Date(emp.created_at).toLocaleDateString()}</Td>
  </Tr>
))
                         
                          )}
                     </Tbody>
                   </Table>
                 </Box>
               )}
               </>
               )}
  </VStack>
    </Box>
  );
};

export default EmpSalaryReport
