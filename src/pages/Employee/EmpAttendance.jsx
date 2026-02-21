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
  Card,
  CardHeader,
  CardBody,
  Badge,
  Heading,
} from "@chakra-ui/react";

import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const EmpAttendance = () => {
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [empRep, setEmpRep] = useState([]);

 
   

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
  const employeesReport =  async() => {
     try {
      const res = await API.get(API_ENDPOINTS.get_Emp_Attendance_Summary);
      if (res.status === 200) {
        setEmpRep(res.data.data);
      }
    }
      catch (error) {
            console.log(error);
      }
      
     }
     useEffect(() => {
      employeesReport();
     },[]);

  const handleViewAttendance = async () => {
    setLoading(true);
    try {
      const res = await API.get(
        `${API_ENDPOINTS.get_Emp_Attendance}/${filters.userId}`,
        {
          params: {
            start_date: filters.startDate,
            end_date: filters.endDate,
          },
        }
      );

      if (res.status === 200) {
        setAttendance(res.data.attendance);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box  bg="white" >
      
      {/* ================= Employee Summary Section ================= */}
      <Box>
        <Heading size="lg" mb={6}>
          Employee Summary Report data
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {empRep.map((emp) => (
            <Card
              key={emp.id}
              borderRadius="lg"
              boxShadow="md"
              border="1px solid"
              borderColor="gray.200"
            >
              <CardHeader>
                <Text fontSize="lg" fontWeight="bold">
                  {emp.name}
                </Text>
                <Badge
                  mt={2}
                  colorScheme={emp.status === "Active" ? "green" : "red"}
                >
                  {emp.status}
                </Badge>
              </CardHeader>

              <CardBody>
                <Text>
                  <strong bg="blue">Department:</strong> {emp.department}
                </Text>
                <Text>
                  <strong>Position:</strong> {emp.position}
                </Text>
                <Text>
                  <strong>Salary:</strong> ₹{emp.salary}
                </Text>
                <Text>
                  <strong>Joining Date:</strong> {emp.joiningDate}
                </Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      {/* ================= Attendance Section ================= */}
      <Text fontSize="2xl" fontWeight="bold" mb={6}>
        Attendance List
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

          <FormControl>
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
            onClick={handleViewAttendance}
          >
            View
          </Button>
        </SimpleGrid>

        {/* Attendance Table */}
        {attendance.length > 0 && (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th>Login Time</Th>
                <Th>Logout Time</Th>
              </Tr>
            </Thead>
            <Tbody>
              {attendance.map((item, index) => (
                <Tr key={index}>
                  <Td>{item.date}</Td>
                  <Td>{item.status}</Td>
                  <Td>{item.login_time}</Td>
                  <Td>{item.logout_time}</Td>
                </Tr> 
              ))}
            </Tbody>
          </Table>
        )}
      </VStack>
    </Box>
  );
};

export default EmpAttendance;
