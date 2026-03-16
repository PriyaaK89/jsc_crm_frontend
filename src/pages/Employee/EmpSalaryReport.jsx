import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Select,
  Text,
  SimpleGrid,
  FormControl,
  FormLabel,
  VStack,Heading,
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
  HStack,Img,useToast 
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import sort_icon from "../../assets/sort.svg";
import useUsersapi from "../../Apis/GetUsersapi";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const EmpSalaryReport = () => {
  const {users} = useUsersapi();
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

  // ✅ Handle Search
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

  return (
    <Box bg="white"  borderRadius="lg" >
        <HStack justifyContent="space-between" flexWrap="wrap">
                        <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
                          <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">
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
      

      <VStack spacing={6} align="stretch" >
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
              <Box 
                overflowX="auto" 
                borderWidth="1px" 
                borderColor="gray.200" 
                borderRadius="lg" 
                mt={5}
                
              >
                <Table size="sm" minW="2100px" variant="simple" >
                  <Thead bg="gray.50">
                    <Tr>

                      {[
                        "Employee Id", "Salary Date", "Attendance Type", "Working Hours", 
                        "Per Day Salary", "Basic Salary", "Travelling Allowance",
                        "Daily Allowance", "Gross Salary", "Net Salary", "Created At"
                      ].map((header, index) => (
                        <Th 
                          key={index} 
                           fontSize="14px"
                        fontWeight="500"
                        color="#2C2D33"
                        textTransform="capitalize"
                        borderColor="#D9D9D9" p={4} >
                           <Flex align="center" gap="4px">
                          <Text  fontSize="14px"  color="#2C2D33"
                                   fontWeight="400"
                                   fontFamily="InterRegular" >
                                 {header}
                         </Text>
                         <Img src={sort_icon} alt="sort_icon" />
                       </Flex>
                        </Th>
                      ))}
                    </Tr>
                  </Thead>

                  <Tbody p={4}>
                    {dailySalry.length > 0 ? (
                      dailySalry.map((emp) => (
                        <Tr key={emp.id} _hover={{ bg: "gray.50" }}>
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
                    ) : (
                      <Tr>
                        <Td colSpan={11} textAlign="center" py={10}>
                          No data found for the selected criteria.
                        </Td>
                      </Tr>
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

export default EmpSalaryReport;