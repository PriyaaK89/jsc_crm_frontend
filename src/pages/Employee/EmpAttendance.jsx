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
  Input,
  Flex,
  Img,
  useDisclosure,
} from "@chakra-ui/react";

import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import sort_icon from "../../assets/sort.svg";
import EmployeeImageModal from "./EmployeeImageModal";

const EmpAttendance = () => {
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [empRep, setEmpRep] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();


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
        setUsers(res.data.data || []);
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
  const formatToIST = (date, time) => {
    if (!date || !time) return "-";

    const onlyDate = date.split("T")[0]; // 2026-02-25
    const utcDateTime = new Date(`${onlyDate}T${time}Z`); // treat as UTC

    return utcDateTime.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };
  const handleImage = (id, date) => {
    setSelectedUserId(id);
    setSelectedDate(date);
    onOpen();


  }

  const handleViewAttendance = async () => {
    if (!filters.userId) {
      alert("Please select user");
      return;
    }

    setLoading(true);
    setAttendance([]);
    setEmpRep([]);

    try {
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
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);

    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
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
    marginBottom: "3px",
  };

  return (
    <>
      <EmployeeImageModal isOpen={isOpen} onClose={onClose} selectedUserId={selectedUserId} selectedDate={selectedDate} />
      <Box bg="white" p={6} borderRadius="md">
        <Box mb={5}>

        <Heading size="md">
          Employee Summary & Attendance
        </Heading>
            </Box>

        <VStack spacing={6} align="stretch">
          {/* Filters */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <FormControl>
              <FormLabel {...labelStyles}>User Name</FormLabel>
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
              <FormLabel {...labelStyles}>Start Date</FormLabel>
              <Input
                type="date"
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

          {/* Summary Cards */}
          {empRep.length > 0 && (
            <SimpleGrid columns={{ base: 1, md: 5 }} spacing={6}>
              {empRep.map((emp, index) => (
                <Fragment key={index}>
                  <Card>
                    <CardHeader bg="green.100">
                      <Heading size="sm" textAlign="center">
                        Full Days
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <Text textAlign="center">{emp.full_days}</Text>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader bg="yellow.100">
                      <Heading size="sm" textAlign="center">
                        Half Days
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <Text textAlign="center">{emp.half_days}</Text>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader bg="red.100">
                      <Heading size="sm" textAlign="center">
                        Absent Days
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <Text textAlign="center">{emp.absent_days}</Text>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader bg="blue.100">
                      <Heading size="sm" textAlign="center">
                        Leave Days
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <Text textAlign="center">{emp.leave_days}</Text>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader bg="purple.100">
                      <Heading size="sm" textAlign="center">
                        Total Work Days
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <Text textAlign="center">
                        {emp.total_working_days}
                      </Text>
                    </CardBody>
                  </Card>
                </Fragment>
              ))}
            </SimpleGrid>
          )}

          {/* Attendance Table */}
          <Box
            bg="white"
            borderRadius="md"
            boxShadow="sm"
            overflowX="auto"
            border="1px solid #e5e5e5"
          >
            {loading ? (
              <Flex justify="center" align="center" py={10}>
                <Spinner size="lg" />
              </Flex>
            ) : attendance.length > 0 ? (
              <Table
                variant="striped"
                colorScheme="gray"
                size="sm"
                width="2650px"
                className="productsTable"
              >
                <Thead>
                  <Tr>
                    {[
                      "Employee Id",
                      "Employee Name",
                      "Attendance Date",
                      "Login Time",
                      "Logout Time",
                      "Working Hours",
                      "Status",
                      "Action",
                    ].map((header, index) => (
                      <Th
                        key={index}
                        fontSize="14px"
                        fontWeight="500"
                        color="#2C2D33"
                        textTransform="capitalize"
                        borderColor="#D9D9D9"
                      >
                        <Flex align="center" gap="7px">
                          <Text
                            fontSize="14px"
                            color="#2C2D33"
                            fontWeight="400"
                            fontFamily="InterRegular"
                          >
                            {header}
                          </Text>
                          <Img src={sort_icon} alt="sort_icon" />
                        </Flex>
                      </Th>
                    ))}
                  </Tr>
                </Thead>

                <Tbody>
                  {attendance.map((item, index) => (
                    <Tr key={index}>
                      <Td fontWeight="medium">
                        CRM - {item.employee_id}
                      </Td>
                      <Td>{item.employee_name}</Td>
                      <Td>{formatDate(item.attendance_date)}</Td>
                      <Td>{formatToIST(item.attendance_date, item.check_in_time)}</Td>
                      <Td>{formatToIST(item.attendance_date, item.check_out_time)}</Td>
                      <Td>
                        {formatMinutesToHours(item.working_minutes)}
                      </Td>
                      <Td>{item.status}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleImage(item.employee_id, item.attendance_date)
                          }
                        >
                          View
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : ""
            }
          </Box>
        </VStack>
      </Box>
    </>

  );
};

export default EmpAttendance;