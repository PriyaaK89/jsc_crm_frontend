import React, { useEffect, useState } from "react";
import {
  Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  Button, FormControl, FormLabel, Heading,
  Input, Select, HStack, SimpleGrid,
  Table, Thead, Tbody, Tr, Th, Td,
  Flex, Spinner, Text,
  TableContainer
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import useUsersapi from "../../Apis/GetUsersapi";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

function EmployeeVisitReport() {

  const { users } = useUsersapi();

  const [visits, setVisits] = useState([]);
  const [city,seCity]=useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    userId: "",
    city:"",
    startDate: "",
    endDate: "",
  });

  // 🔥 Fetch API
  const fetchVisits = async () => {
    setLoading(true);
    try {
      const res = await API.get(API_ENDPOINTS.get_emp_visit_report, {
        params: {
          user_id: filters.userId || null,
          start_date: filters.startDate || null,
          end_date: filters.endDate || null,
        },
      });

      if (res.data.success) {
        setVisits(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
   const Getcity = async () => {
    setLoading(true);
    try {
      const res = await API.get(API_ENDPOINTS.get_city, {
      });

      if (res.data.success) {
        seCity(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 On Load
  useEffect(() => {
    fetchVisits();
    
  }, []);

   useEffect(() => {
    Getcity();
    
  }, []);


  // 📅 Format Date
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN");
  };

  return (
    <Box p={6}>

      {/* 🔝 Header */}
      <Breadcrumb mb={6}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">
            <GoHomeFill color="#5570F1" size={20} />
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>View Visit Report</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Heading size="md" mb={6}>
        View Visit Report
      </Heading>

      {/* 🔍 Filters */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>

        <FormControl>
          <FormLabel>Select Employee</FormLabel>
          <Select
            placeholder="--Please Select--"
            value={filters.userId}
            onChange={(e) =>
              setFilters({ ...filters, userId: e.target.value })
            }
          >
            {users?.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </Select>
        </FormControl>
         <FormControl>
          <FormLabel>Select City</FormLabel>
          <Select
            placeholder="--Please Select"
            value={filters.city}
            onChange={(e) =>
              setFilters({ ...filters, city: e.target.value })
            }
          >
            {city?.map((city) => (
              <option key={city.id} value={city.id}>
                {city.district}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Start Date</FormLabel>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />
        </FormControl>

        <FormControl>
          <FormLabel>End Date</FormLabel>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />
        </FormControl>

      </SimpleGrid>

      <Box textAlign="right" mt={6}>
        <Button colorScheme="blue" onClick={fetchVisits}>
          SEARCH
        </Button>
      </Box>

      {/* 📊 Table */}
      <Box mt={8} border="1px solid #e5e5e5" borderRadius="md"  w="100%">

        {loading ? (
          <Flex justify="center" py={10}>
            <Spinner />
          </Flex>
        ) : (
          <Box overflowX="auto">
          <TableContainer overflowX="auto" whiteSpace="nowrap" sx={{
                        "&::-webkit-scrollbar": { width: "8px", height: '8px' },
                        "&::-webkit-scrollbar-thumb": {
                            width: "8px", backgroundColor: "#7A7A7A", borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-track": {
                            background: "#E8E8E8", borderRadius: "4px",},
                    }}>
          <Table variant="striped" size="sm" minW="900px" overflow="auto">

            <Thead>
              <Tr>
                <Th>Serial No.</Th>
                <Th>Employee</Th>
                <Th>Visit type</Th>
                <Th>Customer Purpose</Th>
                <Th>comment</Th>
                <Th>Reminder Date</Th>
                <Th>Image</Th>
                <Th>Create At</Th>
                <Th>Customer Name</Th>
                <Th>Firm Name</Th>
                <Th>Firm Address</Th>
                <Th>Contact No.</Th>
                <Th>Address</Th>
                <Th>Area</Th>
                <Th>District</Th>
                <Th>pincode</Th>
                <Th>Image</Th>

              </Tr>
            </Thead>

            <Tbody>
              {visits.length === 0 ? (
                <Tr>
                  <Td colSpan={9} textAlign="center" py={6}>
                    <Text color="gray.500">No Visit Data Found</Text>
                  </Td>
                </Tr>
              ) : (
                visits.map((item, i) => (
                  <Tr key={item.id}>
                    <Td>{i + 1}</Td>
                    <Td>{item.user_id}</Td>
                    <Td>{item.visit_type}</Td>
                    <Td>{item.customer_purpose}</Td>
                    <Td>{item.comment}</Td>
                    <Td>{formatDate(item.reminder_date)}</Td>
                    {/* <Td>{item.image}</Td> */}
                    <Td>
                      {item.image_path ? (
                        <Button colorScheme="blue" size="sm">
                        <a href={item.image_path} target="_blank" rel="noreferrer">
                          View
                        </a>
                        </Button>
                      ) : (
                        "-"
                      )}
                    </Td>
                    <Td> {formatDate(item.created_at)}</Td>
                    <Td>{item.customer_name}</Td>
                    
                    <Td>{item.firm_name }</Td>
                      <Td>{item.firm_address}</Td>
                      <Td>{item.contact_number || "-"}</Td>
                      <Td>{item.address}</Td>
                      <Td>{item.area}</Td>
                      <Td>{item.district}</Td>
                      <Td>{item.pincode}</Td>
                   

                    <Td>
                      {item.image_url ? (
                        <Button colorScheme="blue" size="sm">
                        <a href={item.image_url} target="_blank" rel="noreferrer">
                          View
                        </a>
                        </Button>
                      ) : (
                        "-"
                      )}
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>

          </Table>
          </TableContainer>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default EmployeeVisitReport;