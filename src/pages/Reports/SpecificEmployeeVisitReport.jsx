import React, { useEffect, useState } from "react";
import { Badge, Box, Button, Flex, FormControl, FormLabel, HStack, Input, Select, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr, VStack, Avatar, Tag, IconButton, useToast, Stat, StatLabel, StatNumber, SimpleGrid, Divider, } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

// ─── Visit type badge color map ───────────────────────────────────────────────
const visitTypeBadge = {
  retailer: { bg: "#EBF5FF", color: "#1A6EC7", label: "Retailer" },
  wholesaler: { bg: "#F0FFF4", color: "#276749", label: "Wholesaler" },
  distributor: { bg: "#FFF8E1", color: "#B7791F", label: "Distributor" },
};

const purposeBadge = {
  sales_order: { bg: "#F0FFF4", color: "#276749", label: "Sales Order" },
  collection: { bg: "#EBF5FF", color: "#1A6EC7", label: "Collection" },
  complaint: { bg: "#FFF5F5", color: "#C53030", label: "Complaint" },
  introduction: { bg: "#FAF5FF", color: "#6B46C1", label: "Introduction" },
};

const customerTypeBadge = {
  new: { bg: "#E6FFFA", color: "#234E52", label: "New" },
  existing: { bg: "#EBF8FF", color: "#2A4365", label: "Existing" },
};

const getBadge = (map, key) =>
  map[key] || { bg: "#F7FAFC", color: "#4A5568", label: key || "—" };

// ─── Format date ──────────────────────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, accent }) => (
  <Box
    bg="white"
    border="1px solid #E2E8F0"
    borderRadius="xl"
    px={5}
    py={4}
    borderLeft="4px solid"
    borderLeftColor={accent}
  >
    <Text fontSize="12px" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="wider">
      {label}
    </Text>
    <Text fontSize="26px" fontWeight="700" color="gray.800" mt={1}>
      {value}
    </Text>
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const SpecificEmployeeVisitReport = () => {
  const toast = useToast();

  const [visitReport, setVisitReport] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    user_id: "",
    from_date: "",
    to_date: "",
  });

  // ── Handle input change ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // ── Validate before search ───────────────────────────────────────────────
  const validateFilters = () => {
    if (!filters.user_id) {
      toast({
        title: "Select Employee",
        description: "Please select an employee to fetch the report.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    if (!filters.from_date || !filters.to_date) {
      toast({
        title: "Select Date Range",
        description: "Please select both From Date and To Date.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    if (new Date(filters.from_date) > new Date(filters.to_date)) {
      toast({
        title: "Invalid Date Range",
        description: "From Date cannot be after To Date.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    return true;
  };

  // ── Fetch visit report (only on Search click) ────────────────────────────
  const getEmpVisitReport = async (page = 1) => {
    if (!validateFilters()) return;

    try {
      setLoading(true);
      setHasSearched(true);

      const response = await API.get(
        API_ENDPOINTS.GET_EMPLOYEE_VISIT_REPORT_SUMMARY,
        { params: { ...filters, page, limit: 10 } }
      );

      const res = response?.data;
      setVisitReport(res?.data || []);
      setPagination({
        total: res?.total || 0,
        page: res?.page || 1,
        totalPages: res?.totalPages || 1,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch visit report. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch employees dropdown ─────────────────────────────────────────────
  const getEmployees = async () => {
    try {
      const response = await API.get(API_ENDPOINTS.get_user_list);
      setEmployees(response?.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getEmployees();
  }, []);

  // ── Derived stats ────────────────────────────────────────────────────────
  const uniqueCustomers = new Set(visitReport.map((v) => v.contact_number)).size;
  const uniqueAreas = new Set(visitReport.map((v) => v.area)).size;

  return (
    <Box fontFamily="'DM Sans', sans-serif" minH="100vh" bg="white">
      {/* ── Filter Card ── */}
      <Box bg="white" p={0}  mb={5} boxShadow="sm">
        <Flex gap={4} flexWrap="wrap" alignItems="flex-end">

          <FormControl maxW="240px">
            <FormLabel fontSize="13px" fontWeight="600" color="gray.600" mb={1}>
              Employee <Text as="span" color="red.400">*</Text>
            </FormLabel>
            <Select
              placeholder="Select Employee"
              name="user_id"
              value={filters.user_id}
              onChange={handleChange}
              size="md"
              borderRadius="lg"
              borderColor="#CBD5E0"
              _focus={{ borderColor: "#5570F1", boxShadow: "0 0 0 1px #5570F1" }}
              fontSize="14px"
            >
              {employees.map((emp) => (
                <option key={emp?.id} value={emp?.id}>
                  {emp?.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl maxW="190px">
            <FormLabel fontSize="13px" fontWeight="600" color="gray.600" mb={1}>
              From Date <Text as="span" color="red.400">*</Text>
            </FormLabel>
            <Input
              type="date"
              name="from_date"
              value={filters.from_date}
              onChange={handleChange}
              size="md"
              borderRadius="lg"
              borderColor="#CBD5E0"
              _focus={{ borderColor: "#5570F1", boxShadow: "0 0 0 1px #5570F1" }}
              fontSize="14px"
            />
          </FormControl>

          <FormControl maxW="190px">
            <FormLabel fontSize="13px" fontWeight="600" color="gray.600" mb={1}>
              To Date <Text as="span" color="red.400">*</Text>
            </FormLabel>
            <Input
              type="date"
              name="to_date"
              value={filters.to_date}
              onChange={handleChange}
              size="md"
              borderRadius="lg"
              borderColor="#CBD5E0"
              _focus={{ borderColor: "#5570F1", boxShadow: "0 0 0 1px #5570F1" }}
              fontSize="14px"
            />
          </FormControl>

          <Button
            leftIcon={<SearchIcon />}
            bg="#44747c"
            color="white"
            _hover={{ bg: "#2a7a88", transform: "translateY(-1px)", boxShadow: "md" }}
            _active={{ bg: "#2a7a88" }}
            borderRadius="lg"
            size="md"
            px={7}
            fontWeight="500"
            transition="all 0.15s"
            onClick={() => getEmpVisitReport(1)}
          >
            Search
          </Button>

          {hasSearched && (
            <Button
              variant="ghost"
              color="gray.500"
              borderRadius="lg"
              size="md"
              onClick={() => {
                setFilters({ user_id: "", from_date: "", to_date: "" });
                setVisitReport([]);
                setHasSearched(false);
                setPagination({ total: 0, page: 1, totalPages: 1 });
              }}
            >
              Clear
            </Button>
          )}

        </Flex>
      </Box>

      {/* ── Stat Summary (shown after search) ── */}
      {hasSearched && !loading && visitReport.length > 0 && (
        <SimpleGrid columns={{ base: 2, md: 3 }} gap={4} mb={5}>
          <StatCard label="Total Visits" value={pagination.total} accent="#5570F1" />
         
          <StatCard label="Unique Customers" value={uniqueCustomers} accent="#ED8936" />
          <StatCard label="Areas Covered" value={uniqueAreas} accent="#9F7AEA" />
        </SimpleGrid>
      )}

      {/* ── Table Card ── */}
      <Box bg="white" border="1px solid #E2E8F0" borderRadius="xl" overflowX="auto" boxShadow="sm">

        {/* Empty / loading states */}
        {!hasSearched && (
          <Flex direction="column" align="center" justify="center" py={16} gap={3}>
            <Box fontSize="40px">🔍</Box>
            <Text fontWeight="600" color="gray.600" fontSize="15px">
              Select filters and click Search
            </Text>
            <Text fontSize="13px" color="gray.400">
              Choose an employee and date range to load visit data
            </Text>
          </Flex>
        )}

        {hasSearched && loading && (
          <Flex justify="center" align="center" h="200px" gap={3}>
            <Spinner size="lg" color="#5570F1" thickness="3px" />
            <Text color="gray.500" fontSize="14px">Loading visit data…</Text>
          </Flex>
        )}

        {hasSearched && !loading && visitReport.length === 0 && (
          <Flex direction="column" align="center" justify="center" py={16} gap={3}>
            <Box fontSize="40px">📭</Box>
            <Text fontWeight="600" color="gray.600" fontSize="15px">No records found</Text>
            <Text fontSize="13px" color="gray.400">
              Try adjusting the employee or date range
            </Text>
          </Flex>
        )}

        {hasSearched && !loading && visitReport.length > 0 && (
          <>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg="#F4F6FF">
                  <Th py={4} color="gray.500" fontSize="11px" letterSpacing="wider">#</Th>
                  <Th py={4} color="gray.500" fontSize="11px" letterSpacing="wider">CUSTOMER</Th>
                  <Th py={4} color="gray.500" fontSize="11px" letterSpacing="wider">VISIT TYPE</Th>
                  <Th py={4} color="gray.500" fontSize="11px" letterSpacing="wider">PURPOSE</Th>
                  <Th py={4} color="gray.500" fontSize="11px" letterSpacing="wider">NO OF VISIT</Th>
                  <Th py={4} color="gray.500" fontSize="11px" letterSpacing="wider">LOCATION</Th>
                  <Th py={4} color="gray.500" fontSize="11px" letterSpacing="wider">CONTACT</Th>
           
                </Tr>
              </Thead>
              <Tbody>
                {visitReport.map((item, index) => {
                  const vtBadge = getBadge(visitTypeBadge, item?.visit_type);
                  const ppBadge = getBadge(purposeBadge, item?.visit_purpose);
                  const ctBadge = getBadge(customerTypeBadge, item?.customer_type);
                  const rowNum = (pagination.page - 1) * 10 + index + 1;

                  return (
                    <Tr
                      key={item?.id || index}
                      _hover={{ bg: "#FAFBFF" }}
                      transition="background 0.1s"
                    >
                      {/* S.No */}
                      <Td py={4}>
                        <Text fontSize="13px" color="gray.400" fontWeight="500">
                          {rowNum}
                        </Text>
                      </Td>

                      {/* Customer */}
                      <Td py={4}>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="13px" fontWeight="600" color="gray.800">
                            {item?.customer_name || "—"}
                          </Text>
                          <Text fontSize="12px" color="gray.500">
                            {item?.firm_name || ""}
                          </Text>
                        </VStack>
                      </Td>

                      {/* Visit Type */}
                      <Td py={4}>
                        <Tag
                          bg={vtBadge.bg}
                          color={vtBadge.color}
                          fontWeight="600"
                          fontSize="12px"
                          borderRadius="full"
                          px={3}
                          py={1}
                        >
                          {vtBadge.label}
                        </Tag>
                      </Td>

                      {/* Purpose */}
                      <Td py={4}>
                        <Tag
                          bg={ppBadge.bg}
                          color={ppBadge.color}
                          fontWeight="600"
                          fontSize="12px"
                          borderRadius="full"
                          px={3}
                          py={1}
                        >
                          {ppBadge.label}
                        </Tag>
                      </Td>

                      {/* Customer Type */}
                    
                      <Td>{item?.number_of_visits}</Td>

                      {/* Location */}
                      <Td py={4}>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="13px" fontWeight="500" color="gray.700">
                            {item?.area || "—"}
                          </Text>
                          <Text fontSize="12px" color="gray.400">
                            {[item?.district, item?.pincode].filter(Boolean).join(" · ")}
                          </Text>
                        </VStack>
                      </Td>

                      {/* Contact */}
                      <Td py={4}>
                        <Text fontSize="13px" color="gray.700" fontFamily="mono">
                          {item?.contact_number || "—"}
                        </Text>
                      </Td>

                     
                      
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>

            {/* ── Pagination ── */}
            {pagination.totalPages > 1 && (
              <Flex
                align="center"
                justify="space-between"
                px={5}
                py={4}
                borderTop="1px solid #E2E8F0"
              >
                <Text fontSize="13px" color="gray.500">
                  Page {pagination.page} of {pagination.totalPages} · {pagination.total} records
                </Text>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="lg"
                    isDisabled={pagination.page <= 1}
                    onClick={() => getEmpVisitReport(pagination.page - 1)}
                    fontSize="13px"
                  >
                    ← Prev
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="lg"
                    isDisabled={pagination.page >= pagination.totalPages}
                    onClick={() => getEmpVisitReport(pagination.page + 1)}
                    fontSize="13px"
                  >
                    Next →
                  </Button>
                </HStack>
              </Flex>
            )}
          </>
        )}

      </Box>
    </Box>
  );
};

export default SpecificEmployeeVisitReport;