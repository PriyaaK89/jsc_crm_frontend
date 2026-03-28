import React, {  useState } from "react";
import {
  Box,
  Button,
  Select,
  Text,
  SimpleGrid,
  FormControl,
  FormLabel,
  VStack, Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Spinner,
  Input,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack, Img, useToast,
  TableContainer
} from "@chakra-ui/react";
import { FiUpload  } from "react-icons/fi";
import { GoHomeFill } from "react-icons/go";
import sort_icon from "../../assets/sort.svg";
import useUsersapi from "../../Apis/GetUsersapi";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { Link } from "react-router-dom";

const EmpSalaryReport = () => {
  const { users } = useUsersapi();
  const [dailySalry, setdailySalry] = useState([]);
  const [hasDatafind, setDatafind] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [filters, setFilters] = useState({
    userId: "",
    startDate: "",
    endDate: "",
  });

  const toast = useToast()
  const toastIdRef = React.useRef()

  const validateForm = () => {
    const newErrors = {};

    // tost function 
    function showToast() {
      if (!toast.isActive(toastIdRef.current)) {
        toastIdRef.current = toast({
          title: "Validation Error",
          description: "Please select User, Start Date, or End Date",
          status: "warning",
          duration: 2000,
          isClosable: true,
        });
      }
    }

    // Check if all filters are empty
    if (!filters.userId && !filters.startDate && !filters.endDate) {
      newErrors.userId = "Please select at least one filter";
      showToast()
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  //  Handle Search
  const handleViewDailySalary = async () => {
    if (!validateForm()) return;

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
        setdailySalry(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching salary report:", error);
      setdailySalry([]);
    } finally {
      setLoading(false);
    }
  };

  const labelStyles = {
    fontSize: "14px",
    color: "#686868",
    fontWeight: "500",
  };



  const downloadCSV = () => {
    if (!dailySalry.length) {
      toast({
        title: "No Data",
        description: "No data available to download",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    // CSV Headers
    const headers = [
      "Employee Id",
      "Salary Date",
      "Attendance Type",
      "Working Hours",
      "Per Day Salary",
      "Basic Salary",
      "Travelling Allowance",
      "Daily Allowance",
      "Gross Salary",
      "Net Salary",
      "Created At",
    ];

    // Convert data to rows
    const rows = dailySalry.map((emp, index) => [
      index + 1,
      new Date(emp.salary_date).toLocaleDateString(),
      emp.attendance_type,
      emp.working_hours,
      emp.per_day_salary,
      emp.basic_salary,
      emp.travelling_allowance,
      emp.daily_allowance,
      emp.gross_salary,
      emp.net_salary,
      new Date(emp.created_at).toLocaleDateString(),
    ]);

    // Combine headers + rows
    const csvContent =
      [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");

    // Create Blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "salary_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
       <Box
          bg="white"
          mt={{base:2, md:5}}
          px={{base:3, md:6}}
          py={{base:3, md:4}}
         borderRadius="lg"
         boxShadow="md"
      >
        <HStack justifyContent="space-between" flexWrap="wrap">
                        <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
                          <BreadcrumbItem>
                            <BreadcrumbLink as={Link} to="/dashboard">
                              <GoHomeFill color="#5570F1" />
                            </BreadcrumbLink>
                          </BreadcrumbItem>
              
                          <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink fontSize="13px">
                            Daily Salary Report
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                        </Breadcrumb>
                      </HStack>

      <Heading fontSize="xl" fontWeight="bold" mb={6}>
        Daily Salary Report
      </Heading>


      <VStack spacing={6} align="stretch" className="empsalryreportsection" w="100%" maxW="100%" >
        {/* Filters */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} alignItems="flex-end">
          <FormControl isInvalid={!!errors.userId}  >
            <FormLabel {...labelStyles}>User Name</FormLabel>
            <Select
              placeholder="Select User"
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>


          </FormControl>

          <FormControl isInvalid={!!errors.startDate}>
            <FormLabel {...labelStyles}>Start Date</FormLabel>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />

          </FormControl>

          <FormControl isInvalid={!!errors.endDate}>
            <FormLabel {...labelStyles}>End Date</FormLabel>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </FormControl>

          <Button
            colorScheme="blue"
            isLoading={loading}
            onClick={handleViewDailySalary}
            w="full"
            p={{ base: "2px", md: "1px" }}
          >
            View Report

          </Button>
        </SimpleGrid>
       
        {/* Table Section */}
        {hasDatafind && (
          <>
            {loading ? (
              <Flex justify="center" py={10}>
                <Spinner size="lg" color="blue.500" />
              </Flex>
            ) : (
              <Box>

               <Box textAlign="end" mr={5}>
                  <Button 
                  rightIcon={<FiUpload  />}
                    colorScheme="green"
                    onClick={downloadCSV}
                   
                  >
                 Export
                  </Button>
                </Box>

              <Box
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="lg"
                mt={5}
                maxW="100%"
                overflowX="auto"
              >
           

                <TableContainer overflowX="auto" whiteSpace="nowrap" sx={{
                  "&::-webkit-scrollbar": { width: "8px", height: '8px' },
                  "&::-webkit-scrollbar-thumb": {
                    width: "8px", backgroundColor: "#7A7A7A", borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "#E8E8E8", borderRadius: "4px",
                  },
                }}>

                  <Table
                    size="sm"
                    minW="1000px"
                    variant="simple"
                    whiteSpace="nowrap"
                    overflowX="auto"

                  >

                    <Thead bg="gray.50" p={5}>
                      <Tr >
                        {[
                          "Employee Id",
                          "Salary Date",
                          "Attendance Type",
                          "Working Hours",
                          "Per Day Salary",
                          "Basic Salary",
                          "Travelling Allowance",
                          "Daily Allowance",
                          "Gross Salary",
                          "Net Salary",
                          "Created At"
                        ].map((header, index) => (
                          <Th key={index} p={5} color='#2C2D33' textTransform='capitalize' >
                            <Flex align="center" gap="4px">
                              <Text fontSize={{ base: "14px", md: "16px" }} fontWeight='500'>{header}</Text>
                              <Img src={sort_icon} alt="sort" />
                            </Flex>
                          </Th>
                        ))}
                      </Tr>
                    </Thead>

                    <Tbody >
                      {dailySalry.length > 0 ? (
                        dailySalry.map((emp, index) => (
                          <Tr key={emp.id} className="empsalaryreporttablebodytd" >
                            <Td>{index + 1}</Td>
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
                      ) : (
                        <Tr>
                          <Td colSpan={11} textAlign="center" py={10}>
                            No data found for the selected criteria.
                          </Td>
                        </Tr>
                      )}
                    </Tbody>

                  </Table>

                </TableContainer>

                

              </Box>
              </Box>
            )}
          </>
        )}
      </VStack>
    </Box>
  );
};

export default EmpSalaryReport;