import React, { useEffect, useState, Fragment } from "react";
import {
    Box, Button, Select, Text, SimpleGrid, FormControl, FormLabel, Table, Thead, Tbody, Tr, Th, Td, Card, CardHeader, CardBody, Heading, Spinner,
    Input, Flex, Img, useDisclosure, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack, TableContainer
} from "@chakra-ui/react";
import { Badge } from "@chakra-ui/react";
import { useMemo } from "react";
import { InputGroup, InputRightElement } from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
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
    const [attendanceSummary, setAttendanceSummary] = useState([]);   

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total_pages: 1,
    });

    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    const { isOpen, onOpen, onClose } = useDisclosure();

    //  Fetch API
    const fetchAttendance = async (page = 1) => {
        setLoading(true);

        try {
            const res = await API.get(
                API_ENDPOINTS.get_Emp_Attendance_filter_search,
                {
                    params: {
                        employee_id: filters.userId || null,
                        search: debouncedSearch || null, // change here
                        start_date: filters.startDate || null,
                        end_date: filters.endDate || null,
                        page,
                        limit: pagination.limit,
                    },
                }
            );

            if (res.status === 200) {
                setAttendance(res.data.attendance || []);

                setPagination({
                    page: res.data.pagination.page,
                    limit: res.data.pagination.limit,
                    total_pages: res.data.pagination.total_pages,
                });
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

    //  ONLY ON LOAD
    // useEffect(() => {
    //     fetchUsers();
    // }, []);

    //FILTER CHANGE ONLY
    useEffect(() => {
        fetchAttendance(1);
    }, [debouncedSearch, filters.userId, filters.startDate, filters.endDate]);

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
    
const getMonth = (date) => {
    if (!date) return null;
    return new Date(date).getMonth() + 1;
};

const getYear = (date) => {
    if (!date) return null;
    return new Date(date).getFullYear();
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
     const handleRefresh = () => {
    setSearch("");
    setDebouncedSearch("");

    setFilters({
      userId: "",
      startDate: "",
      endDate: "",
    });

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    fetchAttendance(1); //  reload data
  };

   const FetchEmpAttendanceSummary = async () =>{
    setLoading(true);
    try {
       const res = await API.get(`${API_ENDPOINTS.get_Emp_Attendance_Summary}/${filters.userId}?&month=${getMonth(filters.startDate)}&year=${getYear(filters.startDate)}`)
        if (res.status === 200) {
            setAttendanceSummary(res.data.summary);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
};
useEffect(() => {
    if (users.length > 0) {
        setFilters((prev) => ({
            ...prev,
            userId: users[0].id, // first user auto select
        }));
    }
}, [users]);

useEffect(() => {
    if (filters.startDate && filters.endDate) {
        FetchEmpAttendanceSummary();
    }
}, [ filters.startDate, filters.endDate]);


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
      mt={{base:2, md:5}}
      px={{base:3, md:6}}
      py={{base:3, md:4}}
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
                    <BreadcrumbItem >
                        <BreadcrumbLink isCurrentPage fontSize="13px"
                        >
                            Attendance Report
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                  <Heading size="md" mb={2} color="#2C2D33" fontWeight="600">
                                           Employee Attendance Summary Report
                  </Heading>
                     <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>

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
                            label="Month"
                            value={filters.startDate}
                            onChange={(d) =>
                                setFilters((p) => ({ ...p, startDate: d }))
                            }
                        />
                    </FormControl>


                    <FormControl>

                        <CustomDatePicker
                            label="Year"
                            value={filters.endDate}
                            onChange={(d) =>
                                setFilters((p) => ({ ...p, endDate: d }))
                            }
                        />
                    </FormControl>
                    
                 
                </SimpleGrid>
                 {attendanceSummary && (
    <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4} mb={6}>
        
        <Card border="1px solid" borderColor="gray.300"> 
                            <CardHeader bg="green.100">

                <Heading size="sm">Full Days</Heading>
            </CardHeader>
            <CardBody>
                <Text fontSize="xl" fontWeight="bold">
                    {attendanceSummary.full_days}
                </Text>
            </CardBody>
        </Card>

        <Card border="1px solid" borderColor="gray.300">
            <CardHeader bg="blue.100">
                <Heading size="sm">Half Days</Heading>
            </CardHeader>
            <CardBody>
                <Text fontSize="xl" fontWeight="bold" color="green.500">
                    {attendanceSummary.half_days}
                </Text>
            </CardBody>
        </Card>

        <Card border="1px solid" borderColor="gray.300">
            <CardHeader bg="orange.100">
                <Heading size="sm">Absent</Heading>
            </CardHeader>
            <CardBody>
                <Text fontSize="xl" fontWeight="bold" color="red.500">
                    {attendanceSummary.absent_days}
                </Text>
            </CardBody>
        </Card>

        <Card border="1px solid" borderColor="gray.300">
            <CardHeader bg="blue.100">
                <Heading size="sm">Leave Days</Heading>
            </CardHeader>
            <CardBody>
                <Text fontSize="xl" fontWeight="bold" color="blue.500">
                    {attendanceSummary.leave_days}
                </Text>
            </CardBody>
        </Card>
                 <Card border="1px solid" borderColor="gray.300">
            <CardHeader bg="yellow.100">
                <Heading size="sm">Total Working Days</Heading>
            </CardHeader>
            <CardBody>
                <Text fontSize="xl" fontWeight="bold" color="blue.500">
                    {attendanceSummary.total_working_days}
                </Text>
            </CardBody>
        </Card>

    </SimpleGrid>
)}


                <Heading size="md" mb={6}>
                    Attendance Report
                </Heading>

                {/*  Filters */}
                <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4} mb={6}>

                    <FormControl >
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
                            onChange={(d) =>
                                setFilters((p) => ({ ...p, startDate: d }))
                            }
                        />
                    </FormControl>


                    <FormControl>

                        <CustomDatePicker
                            label="End Date"
                            value={filters.endDate}
                            onChange={(d) =>
                                setFilters((p) => ({ ...p, endDate: d }))
                            }
                        />
                    </FormControl>
                     <FormControl mt={5}>
                    
                              <Button onClick={handleRefresh} leftIcon={<RepeatIcon />}>Reset</Button>
                            </FormControl>

                 
                </SimpleGrid>

                {/* 📊 Table */}
                <Box bg="white" borderRadius="md" boxShadow="sm" border="1px solid #e5e5e5" width="100%">
                    {loading ? (
                        <Flex justify="center" py={10}>
                            <Spinner />
                        </Flex>
                    )  : (
                        <Box overflowX="auto"  >
                            <TableContainer overflowX="auto" whiteSpace="nowrap" sx={{
                                "&::-webkit-scrollbar": { width: "8px", height: '8px' },
                                "&::-webkit-scrollbar-thumb": {
                                    width: "8px", backgroundColor: "#7A7A7A", borderRadius: "4px",
                                },
                                "&::-webkit-scrollbar-track": {
                                    background: "#E8E8E8", borderRadius: "4px",
                                },
                            }}>
                                <Table variant="striped" size={{ base: "md", md: "sm" }} minW="1200px">
                                    <Thead>
                                        <Tr>
                                            {["Serial No.",
                                                "Employee Id",
                                                "Name",
                                                "Date",
                                                "Login",
                                                "Logout",
                                                "Hours",
                                                "Status",
                                                "Attendance Time",
                                                "Action",
                                            ].map((h) => (
                                                <Th key={h}  >
                                                    <Flex gap={2} pt={3} pb={3}>
                                                        <Text fontSize='14px' color='#2C2D33' fontWeight='400' textTransform='capitalize' fontFamily='InterRegular' overflow="hidden">{h}</Text>

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
                                        memoizedData.map((item, i) => (
                                            <Tr key={i}>
                                                <Td>{i + 1}</Td>
                                                <Td>CRM-{item.employee_id}</Td>
                                                <Td>{item.employee_name}</Td>
                                                <Td>{formatDate(item.attendance_date)}</Td>
                                                <Td>{formatTime(item.attendance_date, item.check_in_time)}</Td>
                                                <Td>{formatTime(item.attendance_date, item.check_out_time)}</Td>
                                                <Td>{formatMinutes(item.working_minutes)}</Td>
                                                <Td>
                                                    <Badge colorScheme={getStatusColor(item.status)}
                                                        variant="subtle" px={2} py={1}
                                                        borderRadius="md" >
                                                        {formatStatus(item.status)}
                                                    </Badge>
                                                </Td>
                                                <Td>{item.attendance_unit}</Td>
                                                <Td>
                                                    <Button size="md"  color="purple.600" bg="white"  border="1px solid blue" onClick={() =>
                                                        handleImage(item.employee_id, item.attendance_date)

                                                    }>
                                                          <FaRegEye />
                                                    </Button>
                                                </Td>
                                            </Tr>
                                        )))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </Box>

                {/*  Pagination */}
                <HStack justify="end" mt={4}>
                    <Button
                        size="sm"
                        onClick={() => fetchAttendance(pagination.page - 1)}
                        isDisabled={pagination.page === 1}
                    >
                        Prev
                    </Button>

                    <Text>
                        {pagination.page} / {pagination.total_pages}
                    </Text>

                    <Button
                        size="sm"
                        onClick={() => fetchAttendance(pagination.page + 1)}
                        isDisabled={pagination.page === pagination.total_pages}
                    >
                        Next
                    </Button>
                </HStack>
            </Box>
        </>
    );
};



export default EmpAttendance;
