import React, { useEffect, useState } from "react";
import { Box, Button, Select, Text, SimpleGrid, FormControl, FormLabel, Table, Thead, Tbody, Tr, Th, Td, Card, CardHeader, CardBody, Heading, Spinner, Input, Flex, Img, useDisclosure, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack, TableContainer, } from "@chakra-ui/react";
import { Badge } from "@chakra-ui/react";
import { useMemo } from "react";
import { InputGroup, InputRightElement } from "@chakra-ui/react";
import { CheckCircleIcon, RepeatIcon, SmallCloseIcon, TimeIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { SearchIcon } from "@chakra-ui/icons";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import sort_icon from "../../assets/sort.svg";
import EmployeeImageModal from "./EmployeeImageModal";
import { GoHomeFill } from "react-icons/go";
import CustomDatePicker from "../../components/common/CustomDatepicker";
import useUsersapi from "../../Apis/GetUsersapi";
import { FaRegEye } from "react-icons/fa";
import EmpCard from "./EmpCard";
import Pagination from "../../Pagination/Pagination";

const EmpAttendance = () => {
  const { users } = useUsersapi();
  const [attendance, setAttendance] = useState([]);
  const memoizedData = useMemo(() => attendance, [attendance]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [filters, setFilters] = useState({
    userId: "",
    startDate: "",
    endDate: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total_pages: 1,
    total_Items: 0
  });

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const headers = ["S.No", "Employee Id", "Name", "Date", "Login", "Logout", "Hours", "Status", "Attendance Unit", "Odometer Reading", "Day Over Odometer", "Travel Mode", "Total KM", "Visit location", "Work Type", "Leave Reason", "Vehicle  Type", "Action",]
  const widthMap = {

  }


  //  Fetch API
  const fetchAttendance = async () => {
    setLoading(true);

    try {
      const res = await API.get(
        API_ENDPOINTS.get_Emp_Attendance_filter_search,
        {
          params: {
            page: pagination.page,
            employee_id: filters.userId || null,
            search: debouncedSearch.trim() !== "" ? debouncedSearch : null,
            start_date: filters.startDate || null,
            end_date: filters.endDate || null,
            limit: pagination.limit,

          },
        },
      );

      if (res.status === 200) {
        setAttendance(res.data.attendance || []);
        setPagination((prev) => ({
          ...prev,
          total_pages: res.data.pagination.total_pages,
          total_Items: res.data.pagination.total_records,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search]);



  //    after user clear seacrh bar date and employee name  end dta every filter ----------
  const query = useMemo(() => {
    return {
      search: debouncedSearch?.trim() || null,
      userId: filters.userId || null,
      startDate: filters.startDate || null,
      endDate: filters.endDate || null,
    };
  }, [debouncedSearch, filters]);

  useEffect(() => {
    fetchAttendance();
  }, [
    pagination.page,
    pagination.limit,
    debouncedSearch,
    filters.userId,
    filters.startDate,
    filters.endDate,
  ]);

  const handleImage = (id, date) => {
    setSelectedUserId(id);
    setSelectedDate(date);
    onOpen();
  };

  // Utils

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN");
  };

  const formatTime = (date, time) => {
    if (!date || !time) return "-";
    const d = new Date(`${date.split("T")[0]}T${time}Z`);
    return d.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatMinutes = (min) => {
    if (!min) return "0h 0m";
    return `${Math.floor(min / 60)}h ${min % 60}m`;
  };

  const formatStatus = (status) => {
    if (!status) return "-";

    switch (status) {
      case "present":
        return "Present";
      case "day_over":
        return "Day Over";
      case "absent":
        return "Absent";
      case "leave":
        return "On Leave";
      default:
        return status;
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "green";
      case "day_over":
        return "orange";
      case "absent":
        return "red";
      case "leave":
        return "purple";
      default:
        return "gray";
    }
  };
  // ---------------------------handle refresh toggle-----------------
  const handleRefresh = () => {
    const resetFilters = {
      userId: "",
      startDate: "",
      endDate: "",
    };
    setSearch("");
    setDebouncedSearch("");
    setFilters(resetFilters);
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    //  call with fresh values
    fetchAttendance(1, resetFilters, "");
  };
  // ---------------------pafter pagination=----------------------
  useEffect(() => {
    fetchAttendance(pagination.page);
  }, [pagination.page, pagination.limit]);

  return (
    <>
      <EmployeeImageModal
        isOpen={isOpen}
        onClose={onClose}
        selectedUserId={selectedUserId}
        selectedDate={selectedDate}
      />

      <Box
        bg="white"
        mt={{ base: 2, md: 5 }}
        px={{ base: 3, md: 6 }}
        py={{ base: 3, md: 4 }}
        borderRadius="lg"
        boxShadow="md"
      >
        {/* Header */}
        <Breadcrumb mb={4}>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/dashboard">
              <GoHomeFill color="blue" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink isCurrentPage fontSize="13px">
              Attendance Report
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <EmpCard />

        <Heading size="md" mb={6}>
          Attendance Report
        </Heading>

        {/*  Filters */}
        <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4} mb={6}>
          <FormControl>
            <FormLabel>Search Employee</FormLabel>

            <InputGroup>
              <Input
                placeholder="Search Employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                pr="40px" // space for icon
              />

              <InputRightElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <FormControl>
            <FormLabel>Employee List</FormLabel>
            <Select
              placeholder="Select Employee"
              value={filters.userId}
              onChange={(e) =>
                setFilters({ ...filters, userId: e.target.value })
              }
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <CustomDatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(d) => setFilters((p) => ({ ...p, startDate: d }))}
            />
          </FormControl>

          <FormControl>
            <CustomDatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(d) => setFilters((p) => ({ ...p, endDate: d }))}
            />
          </FormControl>
          <FormControl mt={5}>
            <Button onClick={handleRefresh} leftIcon={<RepeatIcon />}>
              Reset
            </Button>
          </FormControl>
        </SimpleGrid>

        {/*  Table */}
        <Box
          bg="white"
          borderRadius="md"
          boxShadow="sm"
          border="1px solid #e5e5e5"
          width="100%"
        >
          {loading ? (
            <Flex justify="center" py={10}>
              <Spinner />
            </Flex>
          ) : (
            <Box
              overflowX="auto"
              whiteSpace="nowrap"
              sx={{
                "&::-webkit-scrollbar": { width: "8px", height: "8px" },
                "&::-webkit-scrollbar-thumb": {
                  width: "8px",
                  backgroundColor: "#7A7A7A",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#E8E8E8",
                  borderRadius: "4px",
                },
              }}
            >
              <Table
                variant="striped"
                colorScheme="gray"
                size="sm"
                minW="2000px"
                className="productsTable">
                <Thead>
                  <Tr>
                    {
                      headers.map((header, index) => (
                        <Th key={index}
                          fontSize="14px"
                          fontWeight="500"
                          color="#2C2D33"
                          textTransform="capitalize"
                          width={widthMap[header]}
                        >
                          <Flex align="center" gap="7px">
                            <Text
                              fontSize="14px"
                            >
                              {header}
                            </Text>

                            <Img src={sort_icon} />
                          </Flex>
                        </Th>
                      ))}
                  </Tr>

                </Thead>

                <Tbody>
                  {attendance.length === 0 ? (
                    <Tr>
                      <Td colSpan={10} textAlign="center" py={6}>
                        <Text fontSize="md" color="gray.500">
                          No Data Found
                        </Text>
                      </Td>
                    </Tr>
                  ) : (
                    memoizedData.map((item, index) => (
                      <Tr key={index}>
                        <Td>{(pagination.page - 1) * pagination.limit + index + 1}</Td>
                        <Td>CRM-{item.employee_id}</Td>
                        <Td>{item.employee_name}</Td>
                        <Td>{formatDate(item.attendance_date)}</Td>
                        <Td>
                          {formatTime(item.attendance_date, item.check_in_time,)}
                        </Td>
                        <Td>
                          {formatTime(
                            item.attendance_date,
                            item.check_out_time,
                          )}
                        </Td>
                        <Td>{formatMinutes(item.working_minutes)}</Td>
                        <Td>
                          <Badge
                            colorScheme={getStatusColor(item.status)}
                            variant="subtle"
                            px={2}
                            py={1}
                            borderRadius="full" fontSize="11px"
                          >
                            {formatStatus(item.status)}
                          </Badge>
                        </Td>
                        <Td>
                          {item.attendance_unit === "full" && (
                            <Badge
                              colorScheme="green"
                              px={3}
                              py={1}
                              borderRadius="full"
                            >
                              <HStack spacing={1}>
                                <CheckCircleIcon boxSize={3} />
                                <Text fontSize="11px">Full Day</Text>
                              </HStack>
                            </Badge>
                          )}
                          {item.attendance_unit === "absent" && (
                            <Badge
                              colorScheme="green"
                              px={3}
                              py={1}
                              borderRadius="full"
                            >
                              <HStack spacing={1}>
                                <Text fontSize="11px">Absent</Text>
                              </HStack>
                            </Badge>
                          )}

                          {item.attendance_unit === "half" && (
                            <Badge
                              colorScheme="yellow"
                              px={3}
                              py={1}
                              borderRadius="full"
                            >
                              <HStack spacing={1}>
                                <TimeIcon boxSize={3} />
                                <Text fontSize="11px">Half Day</Text>
                              </HStack>
                            </Badge>
                          )}

                          {item.attendance_unit === "leave" && (
                            <Badge
                              colorScheme="red"
                              px={3}
                              py={1}
                              borderRadius="full"
                            >
                              <HStack spacing={1}>
                                <SmallCloseIcon boxSize={3} />
                                <Text fontSize="11px">Leave</Text>
                              </HStack>
                            </Badge>
                          )}

                          {item.attendance_unit === "WEEK_OFF" && (
                            <Badge
                              colorScheme="purple"
                              px={3}
                              py={1}
                              borderRadius="full"
                            >
                              <Text fontSize="11px">Week Off</Text>
                            </Badge>
                          )}
                        </Td>
                        <Td>{item.odometer_reading || 0}</Td>
                        <Td>{item.day_over_odometer_reading || 0}</Td>
                        <Td>{item?.travel_mode}</Td>
                        <Td>
                          {item?.day_over_odometer_reading != null && item?.odometer_reading != null
                            ? item.day_over_odometer_reading - item.odometer_reading
                            : "-"}
                        </Td>
                        <Td>{item.visit_location || "-"}</Td>
                        <Td>{item.work_type || "-"}</Td>
                        <Td>{item.leave_reason || "-"}</Td>
                        <Td>{item.vehicle_type || "-"}</Td>

                        <Td>
                          <Button size="md" color="purple.600" bg="white" border="1px solid blue"
                            onClick={() =>
                              handleImage(item.employee_id, item.attendance_date,)}>
                            <FaRegEye />
                          </Button>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>

        <Pagination
          page={pagination.page}
          limit={pagination.limit}
          totalItems={pagination.total_Items}
          totalPages={pagination.total_pages}
          onPageChange={(newPage) => {
            setPagination((prev) => ({ ...prev, page: newPage, }));
          }}
          onLimitChange={(newLimit) => {
            setPagination((prev) => ({ ...prev, limit: newLimit, page: 1, }));
          }}
        />
      </Box>
    </>
  );
};

export default EmpAttendance;
