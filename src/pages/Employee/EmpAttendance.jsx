// EmpAttendance.js
import React, { useEffect, useState, Fragment } from "react";
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
  Heading,
  Spinner,
  Input
} from "@chakra-ui/react";

import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const EmpAttendance = () => {
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [empRep, setEmpRep] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const [filters, setFilters] = useState({
    userId: "",
    startDate: "",
    endDate: "",
    month: "",
    year: "",
  });

  // Fetch Users
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

    const today = new Date();
    setFilters((prev) => ({
      ...prev,
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    }));
  }, []);

  const handleViewAttendance = async () => {
    if (!filters.userId) {
      alert("Please select user");
      return;
    }

    setLoading(true);
    setNoData(false);
    setAttendance([]);
    setEmpRep([]);

    try {
      // Attendance API
      const attendanceRes = await API.get(
        `${API_ENDPOINTS.get_Emp_Attendance}/${filters.userId}`,
        {
          params: {
            start_date: filters.startDate,
            end_date: filters.endDate,
          },
        }
      );

      if (attendanceRes.status === 200) {
        setAttendance(attendanceRes.data.attendance || []);
      }

      // Summary API
      const summaryRes = await API.get(
        `${API_ENDPOINTS.get_Emp_Attendance_Summary}/${filters.userId}`,
        {
          params: {
            month: filters.month,
            year: filters.year,
          },
        }
      );

      if (summaryRes.status === 200 && summaryRes.data?.summary) {
        setEmpRep([summaryRes.data.summary]);
      } else {
        setNoData(true);
      }
    } catch (error) {
      console.log(error);
      setNoData(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatMinutesToHours = (minutes) => {
    if (!minutes) return "0h 0m";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const labelStyles = {
    fontSize: "12px",
    color: "#686868",
    marginBottom: "3px"
  };

  return (
    <Box bg="white" p={6}>
      <Heading size="md" mb={6} lineHeight="45px">
        Employee Summary & Attendance
      </Heading>

      <VStack spacing={6} align="stretch">

        {/* Filters */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <FormControl>
            <FormLabel {...labelStyles}>User Name</FormLabel>
            <Select
              fontSize="12px"
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
            <FormLabel {...labelStyles}>Start Date</FormLabel>
            <Input
              type="date"
              fontSize="12px"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel {...labelStyles}>End Date</FormLabel>
            <Input
              type="date"
              fontSize="12px"
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

        {loading && <Spinner size="lg" />}

        {/* Summary Cards */}
        {empRep.length > 0 && (
          <SimpleGrid columns={{ base: 1, md: 5 }} spacing={6}>
            {empRep.map((emp, index) => (
              <Fragment key={index}>
                <Card>
                  <CardHeader bg="green.100" p="6px 0px">
                    <Heading size="sm" textAlign="center">Full Days</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text textAlign="center">{emp.full_days}</Text>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader bg="yellow.100" p="6px 0px">
                    <Heading size="sm" textAlign="center">Half Days</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text textAlign="center">{emp.half_days}</Text>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader bg="red.100" p="6px 0px">
                    <Heading size="sm" textAlign="center">Absent Days</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text textAlign="center">{emp.absent_days}</Text>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader bg="blue.100" p="6px 0px">
                    <Heading size="sm" textAlign="center">Leave Days</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text textAlign="center">{emp.leave_days}</Text>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader bg="purple.100" p="6px 0px">
                    <Heading size="sm" textAlign="center">Total Work Days</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text textAlign="center">{emp.total_working_days}</Text>
                  </CardBody>
                </Card>
              </Fragment>
            ))}
          </SimpleGrid>
        )}

        {/* No Data */}
        {noData && !loading && (
          <Text color="red.500">
            No data found for selected user.
          </Text>
        )}

        {/* Attendance Table */}
        {attendance.length > 0 && (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Employee Id</Th>
                <Th>Employee Name</Th>
                <Th>Attendance Date</Th>
                <Th>Login Time</Th>
                <Th>Logout Time</Th>
                <Th>Working Hours</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {attendance.map((item, index) => (
                <Tr key={index}>
                  <Td>CRM - {item.employee_id}</Td>
                  <Td>{item.employee_name}</Td>
                  <Td>{formatDate(item.attendance_date)}</Td>
                  <Td>{item.check_in_time}</Td>
                  <Td>{item.check_out_time}</Td>
                  <Td>{formatMinutesToHours(item.working_minutes)}</Td>
                  <Td>{item.status}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}

        {/* Empty Attendance Message */}
        {attendance.length === 0 && !loading && !noData && (
          <Text color="red.500">
            No attendance report available for this employee.
          </Text>
        )}

      </VStack>
    </Box>
  );
};

export default EmpAttendance;