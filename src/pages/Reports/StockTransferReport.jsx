import React, { useEffect, useState } from "react";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  HStack,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import Pagination from "../../Pagination/Pagination";
import CustomDatePicker from "../../components/common/CustomDatepicker";

function StockTransferReport() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [stockTransfer, setStockTransfer] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [pagination, setPagination] = useState({
    total_records: 0,
    total_pages: 1,
    current_page: 1,
    per_page: 10,
  });

  const [filters, setFilters] = useState({
    item_id: "",
    from_date: "",
    to_date: "",
    search: "",
    page: 1,
    limit: 10,
  });

  // =====================================================
  // HELPERS
  // =====================================================

  const fmt = (v, decimals = 2) => Number(v || 0).toFixed(decimals);

  const joinField = (arr, field) =>
    (arr || []).map((x) => x[field] ?? "-").join(", ");

  const joinNum = (arr, field, decimals = 2) =>
    (arr || []).map((x) => fmt(x[field], decimals)).join(", ");

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",

      hour12: true,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const getStockItems = async () => {
    try {
      const response = await API.get(API_ENDPOINTS.GET_STOCK_ITEM_DROPDOWN);
      setStockItems(response?.data?.data || []);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to fetch stock items",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // =====================================================
  // GET REPORT
  // =====================================================

  const getStockTransferReport = async () => {
    try {
      setLoading(true);
      const response = await API.get(API_ENDPOINTS.GET_STOCK_TRANSFER_REPORT, {
        params: {
          item_id: filters.item_id || undefined,
          from_date: filters.from_date || undefined,
          to_date: filters.to_date || undefined,
          search: filters.search || undefined,
          page: filters.page,
          limit: filters.limit,
        },
      });
      setStockTransfer(response?.data?.data || []);
      setPagination(response?.data?.pagination || {});
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to fetch report",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SEARCH / PAGINATION
  // =====================================================

const handleSearch = () => {
  setFilters((prev) => ({
    ...prev,
    page: 1,
  }));
};

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
    getStockTransferReport(page);
  };

const handleSetPage = (newPage) => {
  setFilters((prev) => ({
    ...prev,
    page: newPage,
  }));
};

const handleSetLimit = (newLimit) => {
  setFilters((prev) => ({
    ...prev,
    limit: newLimit,
    page: 1,
  }));
};

  // =====================================================
  // INITIAL LOAD
  // =====================================================
useEffect(() => {
  getStockItems();
}, []);

useEffect(() => {
  getStockTransferReport();
}, [
  filters.page,
  filters.limit,
  filters.item_id,
  filters.from_date,
  filters.to_date,
  filters.search,
]);

  // =====================================================
  // SECTION HEADER STYLE
  // =====================================================

  const sectionThStyle = {
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    py: 2,
    px: 3,
    whiteSpace: "nowrap",
  };

  const colThStyle = {
    fontSize: "11px",
    fontWeight: "600",
    py: 2,
    px: 3,
    whiteSpace: "nowrap",
    color: "gray.600",
  };

  const cellStyle = {
    fontSize: "12px",
    py: 2.5,
    px: 3,
    whiteSpace: "nowrap",
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Box
      bg="white"
      mt={{ base: 2, md: 5 }}
      px={{ base: 3, md: 6 }}
      py={{ base: 3, md: 4 }}
      borderRadius="lg"
      boxShadow="md"
    >
      {/* MAIN CARD */}
      <Box>
        {/* TOP BAR */}
        <HStack justifyContent="space-between">
          <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
            <BreadcrumbItem>
              <BreadcrumbLink
                as={Link}
                to="/dashboard"
              >
                <GoHomeFill color="#5570F1" />
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem>
              <BreadcrumbLink
                isCurrentPage
                color="#8B8D97"
                fontSize="13px"
              >
                Stock Transfer Report
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </HStack>

        <Flex justify="space-between" align="center" flexWrap="wrap" gap={2} mt={4}>
          <Box>
            <Heading size="md" color="gray.800" fontWeight="700"> Stock Transfer Report </Heading>
          </Box>
        </Flex>

        {/* FILTER SECTION */}
        <Box
          px={{ base: 4, md: 5 }} py={5}
          border="2px solid"
          borderColor="gray.200" borderRadius="16px">
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="600" color="gray.600" mb={1}>
                Select Item
              </FormLabel>
              <Select
                placeholder="Select Stock Item"
                name="item_id"
                value={filters.item_id}
                onChange={handleChange}
                size="sm"
                bg="white" height="40px"
                borderColor="gray.200"
                borderRadius="md"
                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #63b3ed" }}
              >
                {stockItems?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.item_name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <CustomDatePicker
              label="From Date"
              name="from_date"
              value={filters.from_date}
              onChange={(val) => setFilters((prev) => ({ ...prev, from_date: val }))}
              placeholder="Select from date"
            />

            <CustomDatePicker
              label="To Date"
              name="to_date"
              value={filters.to_date}
              onChange={(val) => setFilters((prev) => ({ ...prev, to_date: val }))}
              placeholder="Select to date"
            />
          </SimpleGrid>

          <Flex mt={4} justify="end" align="center" flexWrap="wrap" gap={3}>
            <Button
              onClick={handleSearch}
              isLoading={loading}
              bg="#237086" fontWeight="500"
              fontSize="12px" color="white"
              _hover={{ bg: "#1B5A6B" }} height="36px"
              px={8} borderRadius="12px" lineHeight="19px"
            >
              SEARCH
            </Button>
          </Flex>
        </Box>

        {/* TABLE */}
        <HStack mt={6} justifyContent="end">
          {pagination.total_records > 0 && (
            <Badge
              bg="gray.200"
              px={5}
              py={2}
              borderRadius="12px"
              fontSize="xs"
              fontWeight="600"
            >
              Total - {pagination.total_records} Records
            </Badge>
          )}
        </HStack>
        <Box overflowX="auto" mt={2}>
          <Table
            size="sm"
            style={{ borderCollapse: "separate", borderSpacing: 0 }}
          >
            {/* ── GROUP HEADER ROW ── */}
            <Thead>
              <Tr>
                {/* Date */}
                <Th {...sectionThStyle} bg="#4e6571" color="white"
                  rowSpan={2} verticalAlign="middle" borderRight="2px solid" borderColor="gray.500" position="sticky" left={0} zIndex={2} textAlign="center" >
                  Date
                </Th>

                {/* SOURCE group */}
                <Th
                  {...sectionThStyle}
                  bg="green.600"
                  color="white"
                  colSpan={6}
                  textAlign="center"
                  borderLeft="2px solid"
                  borderRight="2px solid"
                  borderColor="green.800"
                >
                  Source
                </Th>

                {/* DESTINATION group */}
                <Th
                  {...sectionThStyle}
                  bg="blue.600"
                  color="white"
                  colSpan={6}
                  textAlign="center"
                  borderRight="2px solid"
                  borderColor="blue.800"
                >
                  Destination
                </Th>

                {/* COST COMPONENTS group */}
                <Th
                  {...sectionThStyle}
                  bg="purple.600"
                  color="white"
                  colSpan={2}
                  textAlign="center"
                  borderRight="2px solid"
                  borderColor="purple.800"
                >
                  Cost Components
                </Th>

                {/* TRANSPORT group */}
                <Th
                  {...sectionThStyle}
                  bg="orange.500"
                  color="white"
                  colSpan={5}
                  textAlign="center"
                  borderRight="2px solid"
                  borderColor="orange.700"
                >
                  Transport
                </Th>

                {/* TOTALS group */}
                <Th
                  {...sectionThStyle}
                  bg="gray.800"
                  color="white"
                  colSpan={5}
                  textAlign="center"
                >
                  Summary Totals
                </Th>
              </Tr>

              {/* ── COLUMN HEADER ROW ── */}
              <Tr>
                {/* SOURCE cols */}
                <Th
                  {...colThStyle}
                  bg="green.50"
                  borderLeft="2px solid"
                  borderColor="green.200"
                  borderTop="1px solid"
                  borderTopColor="green.200"
                >
                  Item Name
                </Th>
                <Th {...colThStyle} bg="green.50" borderTop="1px solid" borderTopColor="green.200">
                  Godown
                </Th>
                <Th {...colThStyle} bg="green.50" borderTop="1px solid" borderTopColor="green.200">
                  Batch
                </Th>
                <Th {...colThStyle} bg="green.50" isNumeric borderTop="1px solid" borderTopColor="green.200">
                  Qty
                </Th>
                <Th {...colThStyle} bg="green.50" isNumeric borderTop="1px solid" borderTopColor="green.200">
                  Rate
                </Th>
                <Th
                  {...colThStyle}
                  bg="green.50"
                  isNumeric
                  borderRight="2px solid"
                  borderColor="green.200"
                  borderTop="1px solid"
                  borderTopColor="green.200"
                >
                  Amount
                </Th>

                {/* DESTINATION cols */}
                <Th {...colThStyle} bg="blue.50" borderTop="1px solid" borderTopColor="blue.200">
                  Item Name
                </Th>
                <Th {...colThStyle} bg="blue.50" borderTop="1px solid" borderTopColor="blue.200">
                  Godown
                </Th>
                <Th {...colThStyle} bg="blue.50" borderTop="1px solid" borderTopColor="blue.200">
                  Batch
                </Th>
                <Th {...colThStyle} bg="blue.50" isNumeric borderTop="1px solid" borderTopColor="blue.200">
                  Qty
                </Th>
                <Th {...colThStyle} bg="blue.50" isNumeric borderTop="1px solid" borderTopColor="blue.200">
                  Rate
                </Th>
                <Th
                  {...colThStyle}
                  bg="blue.50"
                  isNumeric
                  borderRight="2px solid"
                  borderColor="blue.200"
                  borderTop="1px solid"
                  borderTopColor="blue.200"
                >
                  Amount
                </Th>

                {/* COST COMPONENT cols */}
                <Th {...colThStyle} bg="purple.50" borderTop="1px solid" borderTopColor="purple.200">
                  Item
                </Th>
                <Th
                  {...colThStyle}
                  bg="purple.50"
                  isNumeric
                  borderRight="2px solid"
                  borderColor="purple.200"
                  borderTop="1px solid"
                  borderTopColor="purple.200"
                >
                  Amount
                </Th>

                {/* TRANSPORT cols */}
                <Th {...colThStyle} bg="orange.50" borderTop="1px solid" borderTopColor="orange.200">
                  Name
                </Th>
                <Th {...colThStyle} bg="orange.50" borderTop="1px solid" borderTopColor="orange.200">
                  Vehicle No
                </Th>
                <Th {...colThStyle} bg="orange.50" isNumeric borderTop="1px solid" borderTopColor="orange.200">
                  Freight
                </Th>
                <Th {...colThStyle} bg="orange.50" isNumeric borderTop="1px solid" borderTopColor="orange.200">
                  Local Fr.
                </Th>
                <Th
                  {...colThStyle}
                  bg="orange.50"
                  isNumeric
                  borderRight="2px solid"
                  borderColor="orange.200"
                  borderTop="1px solid"
                  borderTopColor="orange.200"
                >
                  Load/Unload
                </Th>

                {/* TOTAL cols */}
                <Th {...colThStyle} bg="gray.100" isNumeric borderTop="1px solid" borderTopColor="gray.300">
                  Src Amt
                </Th>
                <Th {...colThStyle} bg="gray.100" isNumeric borderTop="1px solid" borderTopColor="gray.300">
                  Dest Amt
                </Th>
                <Th {...colThStyle} bg="gray.100" isNumeric borderTop="1px solid" borderTopColor="gray.300">
                  Add. Cost
                </Th>
                <Th {...colThStyle} bg="gray.100" isNumeric borderTop="1px solid" borderTopColor="gray.300">
                  Trans. Cost
                </Th>
                <Th
                  {...colThStyle}
                  bg="gray.800"
                  color="white"
                  isNumeric
                  borderTop="1px solid"
                  borderTopColor="gray.600"
                >
                  Grand Total
                </Th>
              </Tr>
            </Thead>

            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={25} textAlign="center" py={16}>
                    <Flex direction="column" align="center" gap={3}>
                      <Spinner size="md" color="blue.500" thickness="3px" />
                      <Text fontSize="sm" color="gray.400">Loading data...</Text>
                    </Flex>
                  </Td>
                </Tr>

              ) : stockTransfer?.length > 0 ? (

                stockTransfer.map((row, index) => (
                  <Tr
                    key={index}
                    bg={index % 2 === 0 ? "white" : "gray.50"}
                    _hover={{ bg: "blue.50", transition: "background 0.15s ease" }}
                    sx={{ "& td": { borderColor: "gray.100" } }}
                  >
                    {/* DATE */}
                    <Td
                      {...cellStyle}
                      fontWeight="600"
                      color="gray.700"
                      bg={index % 2 === 0 ? "white" : "gray.50"}
                      borderRight="2px solid"
                      borderColor="gray.200 !important"
                      position="sticky"
                      left={0}
                      zIndex={1}
                      fontSize="11px"
                    >
                      {formatDateTime(row.transfer_date)}
                    </Td>

                    {/* SOURCE */}
                    <Td
                      {...cellStyle}
                      color="green.700"
                      fontWeight="600"
                      borderLeft="2px solid"
                      borderColor="green.100 !important"
                    >
                      {joinField(row.source_items, "item_name")}
                    </Td>
                    <Td {...cellStyle} color="green.600">
                      {joinField(row.source_items, "godown")}
                    </Td>
                    <Td {...cellStyle} color="green.600">
                      {joinField(row.source_items, "batch")}
                    </Td>
                    <Td {...cellStyle} isNumeric color="red.500" fontWeight="500">
                      {joinNum(row.source_items, "qty")}
                    </Td>
                    <Td {...cellStyle} isNumeric color="gray.600">
                      {joinNum(row.source_items, "rate")}
                    </Td>
                    <Td
                      {...cellStyle}
                      isNumeric
                      color="green.700"
                      fontWeight="600"
                      borderRight="2px solid"
                      borderColor="green.100 !important"
                    >
                      {joinNum(row.source_items, "amount")}
                    </Td>

                    {/* DESTINATION */}
                    <Td {...cellStyle} color="blue.700" fontWeight="600">
                      {joinField(row.destination_items, "item_name")}
                    </Td>
                    <Td {...cellStyle} color="blue.600">
                      {joinField(row.destination_items, "godown")}
                    </Td>
                    <Td {...cellStyle} color="blue.600">
                      {joinField(row.destination_items, "batch")}
                    </Td>
                    <Td {...cellStyle} isNumeric color="red.500" fontWeight="500">
                      {joinNum(row.destination_items, "qty")}
                    </Td>
                    <Td {...cellStyle} isNumeric color="gray.600">
                      {joinNum(row.destination_items, "rate")}
                    </Td>
                    <Td
                      {...cellStyle}
                      isNumeric
                      color="blue.700"
                      fontWeight="600"
                      borderRight="2px solid"
                      borderColor="blue.100 !important"
                    >
                      {joinNum(row.destination_items, "amount")}
                    </Td>

                    {/* COST COMPONENTS */}
                    <Td {...cellStyle} color="purple.700">
                      {joinField(row.cost_components, "item")}
                    </Td>
                    <Td
                      {...cellStyle}
                      isNumeric
                      color="purple.700"
                      fontWeight="500"
                      borderRight="2px solid"
                      borderColor="purple.100 !important"
                    >
                      {joinNum(row.cost_components, "amount")}
                    </Td>

                    {/* TRANSPORT */}
                    <Td {...cellStyle} color="orange.700"> {row.transport?.name || "-"} </Td>
                    <Td {...cellStyle} color="orange.600"> {row.transport?.vehicle_no || "-"}
                    </Td>  <Td {...cellStyle} isNumeric color="gray.600"> {fmt(row.transport?.transport_freight)}  </Td>
                    <Td {...cellStyle} isNumeric color="gray.600"> {fmt(row.transport?.local_freight)} </Td>
                    <Td {...cellStyle} isNumeric color="gray.600" borderRight="2px solid" borderColor="orange.100 !important">
                      {fmt(row.transport?.load_unload_freight)}
                    </Td>

                    {/* TOTALS */}
                    <Td {...cellStyle} isNumeric fontWeight="600" color="green.700">
                      {fmt(row.total_source_amount)}
                    </Td>
                    <Td {...cellStyle} isNumeric fontWeight="600" color="blue.700">
                      {fmt(row.total_destination_amount)}
                    </Td>
                    <Td {...cellStyle} isNumeric color="gray.600">
                      {fmt(row.total_additional_cost)}
                    </Td>
                    <Td {...cellStyle} isNumeric color="gray.600">
                      {fmt(row.total_transport_cost)}
                    </Td>
                    <Td
                      {...cellStyle}
                      isNumeric
                      fontWeight="700"
                      color="white"
                      bg="gray.700"
                      fontSize="12px"
                    >
                      {fmt(row.grand_total)}
                    </Td>
                  </Tr>
                ))

              ) : (
                <Tr>
                  <Td colSpan={25} textAlign="center" py={16}>
                    <Flex direction="column" align="center" gap={2}>
                      <Text fontSize="2xl">📋</Text>
                      <Text fontSize="sm" fontWeight="600" color="gray.500">
                        No Records Found
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        Try adjusting your filters and search again
                      </Text>
                    </Flex>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>



        <Box px={{ base: 4, md: 6 }} py={4} borderTop="1px solid" borderColor="gray.100" bg="gray.50">
         <Pagination
  page={filters.page}
  limit={filters.limit}
  totalItems={pagination.total_records || 0}
  totalPages={pagination.total_pages || 1}

  onPageChange={(newPage) => {
    handleSetPage(newPage);
  }}

  onLimitChange={(newLimit) => {
    handleSetLimit(newLimit);
  }}
/>
        </Box>
      </Box>
    </Box>
  );
}

export default StockTransferReport;