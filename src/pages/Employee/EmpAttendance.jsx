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
} from "@chakra-ui/react";

import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const EmpAttendance = () => {
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    userId: "",
    startDate: "",
    endDate: "",
  });

  // ✅ Fetch Users for Username Dropdown
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

  // ✅ Fetch Attendance when View button clicked
  const handleViewAttendance = async () => {
    if (!filters.userId || !filters.startDate || !filters.endDate) {
      alert("Please select all fields");
      return;
    }

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
  const fetchEmpAttendanceSummary = async()=>{
     
  }

  return (
    <Box p={6} bg="white" borderRadius="10px">
      <Text fontSize="2xl" fontWeight="bold" mb={6}>
        Attendance List
      </Text>

      <VStack spacing={6} align="stretch">
        {/* 🔽 Filters */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          {/* Username Dropdown */}
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

          {/* Start Date */}
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

          {/* End Date */}
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

          {/* View Button */}
          <Button
            colorScheme="blue"
            alignSelf="end"
            isLoading={loading}
            onClick={handleViewAttendance}
          >
            View
          </Button>
        </SimpleGrid>

        {/* 📋 Attendance Table */}
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
