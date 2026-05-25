import React, { useEffect, useState } from "react";

import {
    Badge,
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Select,
    Spinner,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useToast,
} from "@chakra-ui/react";

import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const EmpMonthlySalaryTable = () => {

    const toast = useToast();

    /* =====================================================
       STATES
    ===================================================== */

    const [salary, setSalary] = useState([]);
    const [emp, setEmp] = useState([]);
    const [months, setMonths] = useState([]);
    const [loading, setLoading] = useState(false);

    const [totals, setTotals] = useState({
        salary: 0,
        ta: 0,
        da: 0,
        hotel: 0,
        other: 0,
        toll: 0,
    });

    const [filters, setFilters] = useState({
        employee_id: "",
        month: "",
        year: "",
        page: 1,
        limit: 10,
    });

    const [pagination, setPagination] = useState({
        total_records: 0,
        total_pages: 1,
        current_page: 1,
        per_page: 10,
    });

    /* =====================================================
       GET EMPLOYEES
    ===================================================== */

    const getEmployees = async () => {

        try {

            const response = await API.get(
                API_ENDPOINTS.get_user_list
            );

            setEmp(response?.data?.data || []);

        } catch (error) {

            console.error(error);

            toast({
                title: "Failed to load employees",
                status: "error",
                duration: 3000,
                isClosable: true,
            });

        }

    };

    /* =====================================================
       GET SALARY MONTHS
    ===================================================== */

    const getSalaryMonths = async (
        employeeId
    ) => {

        if (!employeeId) {
            setMonths([]);
            return;
        }

        try {

            const response = await API.get(
                `${API_ENDPOINTS.GET_SALARY_MONTHS}/${employeeId}`
            );

            const monthData =
                response?.data?.data || [];

            setMonths(monthData);

            /* =========================================
               AUTO SELECT LAST MONTH
            ========================================= */

            if (monthData.length > 0) {

                const lastMonth =
                    monthData[monthData.length - 1];

                setFilters((prev) => ({
                    ...prev,
                    month: lastMonth.month,
                    year: lastMonth.year,
                    page: 1,
                }));

            }

        } catch (error) {

            console.log(error);

            toast({
                title: "Failed to load months",
                status: "error",
                duration: 3000,
                isClosable: true,
            });

        }

    };

    /* =====================================================
       GET MONTHLY SALARY
    ===================================================== */

    const getMonthlySalary = async () => {

        try {

            if (
                !filters.employee_id ||
                !filters.month ||
                !filters.year
            ) {
                return;
            }

            setLoading(true);

            const response = await API.get(
                API_ENDPOINTS.GET_MONTHLY_SALARY_REPORT,
                {
                    params: filters,
                }
            );

            setSalary(
                response?.data?.data || []
            );

            setPagination(
                response?.data?.pagination || {}
            );

            setTotals(
                response?.data?.totals || {}
            );

        } catch (error) {

            console.log(error);

            toast({
                title: "Failed to fetch salary data",
                status: "error",
                duration: 3000,
                isClosable: true,
            });

        } finally {

            setLoading(false);

        }

    };

    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        getEmployees();
    }, []);

    /* =====================================================
       GET MONTHS WHEN EMPLOYEE CHANGES
    ===================================================== */

    useEffect(() => {

        if (filters.employee_id) {
            getSalaryMonths(
                filters.employee_id
            );
        }

    }, [filters.employee_id]);

    /* =====================================================
       GET SALARY DATA
    ===================================================== */

    useEffect(() => {
        getMonthlySalary();
    }, [
        filters.page,
        filters.limit,
        filters.month,
        filters.year,
        filters.employee_id,
    ]);

    /* =====================================================
       HANDLE FILTER
    ===================================================== */

    const handleFilterChange = (e) => {

        const { name, value } = e.target;

        /* =========================================
           MONTH SELECT
        ========================================= */

        if (name === "month") {

            const selected = months.find(
                (m) =>
                    `${m.month}-${m.year}` === value
            );

            if (selected) {

                setFilters((prev) => ({
                    ...prev,
                    month: selected.month,
                    year: selected.year,
                    page: 1,
                }));

            }

            return;
        }

        setFilters((prev) => ({
            ...prev,
            [name]: value,
            page: 1,
        }));

    };

    /* =====================================================
       ATTENDANCE COLOR
    ===================================================== */

    const getAttendanceColor = (
        type
    ) => {

        switch (type) {

            case "P":
                return "green";

            case "A":
                return "red";

            case "H":
                return "orange";

            case "W":
                return "blue";

            case "L":
                return "purple";

            default:
                return "gray";

        }

    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString(
            "en-IN"
        );
    };

    return (

        <Box
        >

            <Flex
                justify="space-between"
                align="center"
                mb={5}
            >

                <Heading size="md">
                    Employee Monthly Salary
                </Heading>

            </Flex>

            <Flex
                gap={5}
                mb={6}
                flexWrap="wrap"
            >

                {/* EMPLOYEE */}

                <FormControl maxW="300px">

                    <FormLabel>
                        Employee Name
                    </FormLabel>

                    <Select
                        placeholder="Select Employee"
                        name="employee_id"
                        value={filters.employee_id}
                        onChange={handleFilterChange}
                    >

                        {emp.map((item) => (

                            <option
                                key={item.id}
                                value={item.id}
                            >
                                {item.name ||
                                    item.employee_name}
                            </option>

                        ))}

                    </Select>

                </FormControl>

                {/* MONTH */}

                <FormControl maxW="300px">

                    <FormLabel>
                        Select Month
                    </FormLabel>

                    <Select
                        placeholder="Select Month"
                        name="month"
                        value={
                            filters.month &&
                                filters.year
                                ? `${filters.month}-${filters.year}`
                                : ""
                        }
                        onChange={handleFilterChange}
                    >

                        {months.map((item, index) => (

                            <option
                                key={index}
                                value={`${item.month}-${item.year}`}
                            >
                                {item.label}
                            </option>

                        ))}

                    </Select>

                </FormControl>

            </Flex>

            {/* =========================================
          TOTALS
      ========================================= */}

            <Flex
                gap={4}
                flexWrap="wrap"
                mb={6}
            >

                <Box
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    minW="150px"
                >
                    <Text fontSize="sm">
                        Total Salary
                    </Text>

                    <Text
                        fontWeight="bold"
                        color="green.500"
                    >
                        ₹ {totals.salary}
                    </Text>
                </Box>

                <Box
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    minW="120px"
                >
                    <Text fontSize="sm">
                        Total T.A
                    </Text>

                    <Text fontWeight="bold">
                        ₹ {totals.ta}
                    </Text>
                </Box>

                <Box
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    minW="120px"
                >
                    <Text fontSize="sm">
                        Total D.A
                    </Text>

                    <Text fontWeight="bold">
                        ₹ {totals.da}
                    </Text>
                </Box>

                <Box
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    minW="150px"
                >
                    <Text fontSize="sm">
                        Hotel Expense
                    </Text>

                    <Text fontWeight="bold">
                        ₹ {totals.hotel}
                    </Text>
                </Box>

                <Box
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    minW="150px"
                >
                    <Text fontSize="sm">
                        Other Expense
                    </Text>

                    <Text fontWeight="bold">
                        ₹ {totals.other}
                    </Text>
                </Box>

                <Box
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    minW="170px"
                >
                    <Text fontSize="sm">
                        Bus/Train/Toll
                    </Text>

                    <Text fontWeight="bold">
                        ₹ {totals.toll}
                    </Text>
                </Box>

            </Flex>

            {/* =========================================
          TABLE
      ========================================= */}

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

                <Table variant="simple" className="productsTable">
                    <Thead bg="gray.100">
                        <Tr>
                            <Th>Date</Th>
                            <Th>Attendance</Th>
                            <Th>Working Hours</Th>
                            <Th>Salary</Th>
                            <Th>Total Reading</Th>
                            <Th>T.A</Th>
                            <Th>D.A</Th>
                            <Th>Hotel Expense</Th>
                            <Th>Other Expense</Th>
                            <Th>Bus/Train/Toll</Th>
                        </Tr>
                    </Thead>

                    <Tbody>

                        {loading ? (

                            <Tr>
                                <Td colSpan={11}>
                                    <Flex
                                        justify="center"
                                        py={10}
                                    >
                                        <Spinner />
                                    </Flex>
                                </Td>
                            </Tr>

                        ) : salary.length === 0 ? (

                            <Tr>
                                <Td
                                    colSpan={11}
                                    textAlign="center"
                                >
                                    No Data Found
                                </Td>
                            </Tr>

                        ) : (

                            salary.map((item) => (

                                <Tr key={item.id}>

                                    <Td>
                                        {formatDate(item.date)}
                                    </Td>

                                    <Td>

                                        <Badge
                                            colorScheme={getAttendanceColor(
                                                item.attendance_type
                                            )}
                                        >
                                            {
                                                item.attendance_type
                                            }
                                        </Badge>

                                    </Td>

                                    <Td>
                                        {item.working_hours ||
                                            "-"}
                                    </Td>

                                    <Td>
                                        ₹ {item.salary}
                                    </Td>

                                    <Td>
                                        {item.total_reading}
                                    </Td>

                                    <Td>
                                        ₹ {item.ta}
                                    </Td>

                                    <Td>
                                        ₹ {item.da}
                                    </Td>

                                    <Td>
                                        ₹{" "}
                                        {item.hotel_expense}
                                    </Td>

                                    <Td>
                                        ₹{" "}
                                        {item.other_expense}
                                    </Td>

                                    <Td>
                                        ₹{" "}
                                        {
                                            item.bus_train_toll_expense
                                        }
                                    </Td>

                                </Tr>

                            ))

                        )}

                    </Tbody>

                </Table>

            </Box>

            {/* =========================================
          PAGINATION
      ========================================= */}

            <Flex
                justify="space-between"
                align="center"
                mt={5}
                flexWrap="wrap"
                gap={3}
            >

                <Text fontSize="sm">

                    Total Records :{" "}
                    <b>
                        {
                            pagination.total_records
                        }
                    </b>

                </Text>

                <HStack>

                    <Button
                        size="sm"
                        isDisabled={
                            pagination.current_page ===
                            1
                        }
                        onClick={() =>
                            setFilters((prev) => ({
                                ...prev,
                                page:
                                    prev.page - 1,
                            }))
                        }
                    >
                        Previous
                    </Button>

                    <Text fontSize="sm">

                        Page{" "}
                        <b>
                            {
                                pagination.current_page
                            }
                        </b>{" "}
                        of{" "}
                        <b>
                            {
                                pagination.total_pages
                            }
                        </b>

                    </Text>

                    <Button
                        size="sm"
                        isDisabled={
                            pagination.current_page ===
                            pagination.total_pages
                        }
                        onClick={() =>
                            setFilters((prev) => ({
                                ...prev,
                                page:
                                    prev.page + 1,
                            }))
                        }
                    >
                        Next
                    </Button>

                </HStack>

            </Flex>

        </Box>

    );

};

export default EmpMonthlySalaryTable;