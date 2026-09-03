import { Badge, Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, Flex, FormControl, FormLabel,
  HStack, Heading, Select, Spinner, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useToast, } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import MobileTopbar from "../../components/layout/MobileTopbar";
import NotificationBtn from "../../components/NotificationBtn/NotificationBtn";

const VISIT_TYPES = ["farmer", "retailer", "distributor"];

const ProgressHistory=() =>{
  const toast = useToast();
  const [users, setUsers] = useState([]);

  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [employeeId, setEmployeeId] = useState("");
  const [status, setStatus] = useState("");

  // ==============================
  // API CALLS
  // ==============================
  const getEmployees = async () => {
    try {
      const response = await API.get(API_ENDPOINTS?.get_user_list);

      if (response?.status === 200) {
        // NOTE: adjust this mapping once you see the real response shape.
        const raw = response?.data?.data || response?.data || [];

        setUsers(
          raw.map((u) => ({
            id: u.id ?? u.user_id ?? u.value,
            name: u.name ?? u.user_name ?? u.full_name ?? u.label,
          }))
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getHistory = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: perPage,
      });

      if (employeeId) queryParams.append("employee_id", employeeId);
      if (status) queryParams.append("status", status);

      const response = await API.get(
        `${API_ENDPOINTS?.GET_PROGRESS_HISTORY}?${queryParams.toString()}`
      );

      if (response?.status === 200) {
        setHistoryList(response?.data?.data || []);
        const total = response?.data?.pagination?.total || 0;
        setTotalRecords(total);
        setTotalPages(Math.max(Math.ceil(total / perPage), 1));
      }
    } catch (error) {
      console.log(error);

      toast({
        title: "Error",
        description: "Failed to fetch target history",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmployees();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getHistory();
    }, 500);
    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, perPage, employeeId, status]);

  // ==============================
  // HELPERS
  // ==============================
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN");
  };

  const getOverallPercentage = (breakdown) => {
    const totalTarget = breakdown?.reduce((sum, b) => sum + (b.target_value || 0), 0);
    const totalAchieved = breakdown?.reduce((sum, b) => sum + (b.achieved || 0), 0);

    if (!totalTarget) return 0;

    return Math.min(Math.round((totalAchieved / totalTarget) * 100), 100);
  };

  const statusColor = (s) => (s === "COMPLETED" ? "green" : "red");

  return (

    <Box
      bg="white"
      mt={{ base: 2, md: 5 }}
      px={{ base: 3, md: 6 }}
      py={{ base: 3, md: 5 }}
      borderRadius="16px"
      boxShadow="sm"
    >
      <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4} mb={6}>
        <Box>
          <Breadcrumb color="#8B8D97" mb={1}>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/dashboard"><GoHomeFill color="#5570F1" /></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink isCurrentPage color="#8B8D97" fontSize="13px"> Visit Target History </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Heading size="md" color="#1A202C"> Past Periods </Heading>
        </Box>
      </Flex>

      <Flex gap={4} mb={6} flexWrap="wrap" alignItems="end" justifyContent="space-between">
        <Flex gap={4} flexWrap="wrap">
          <FormControl maxW="220px">
            <FormLabel fontSize="13px">Employee</FormLabel>
            <Select
              placeholder="All employees"
              value={employeeId}
              onChange={(e) => { setEmployeeId(e.target.value); setCurrentPage(1); }}>
              {users?.map((u) => (
                <option key={u.id} value={u.id}> {u.name} </option>
              ))}
            </Select>
          </FormControl>

          <FormControl maxW="180px">
            <FormLabel fontSize="13px">Status</FormLabel>
            <Select
              placeholder="Completed & Expired"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }} >
              <option value="COMPLETED">Completed</option>
              <option value="EXPIRED">Expired</option>
            </Select>
          </FormControl>
        </Flex>

        <Text fontSize="14px" color="gray.500" fontWeight="600"> Total Records : {totalRecords} </Text>
      </Flex>

      {loading ? (
        <Flex justifyContent="center" alignItems="center" minH="350px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <>
          <TableContainer border="1px solid #E2E8F0" borderRadius="14px" overflowX="auto">
            <Table variant="simple" size="sm" className="productsTable">
              <Thead bg="#F8FAFC">
                <Tr>
                  <Th>S.No</Th>
                  <Th>Employee</Th>
                  <Th>Template</Th>
                  <Th>Period</Th>
                  <Th>Farmer</Th>
                  <Th>Retailer</Th>
                  <Th>Distributor</Th>
                  <Th>Overall</Th>
                  <Th>Status</Th>
                  <Th>Completed On</Th>
                </Tr>
              </Thead>

              <Tbody>
                {historyList?.length > 0 ? (
                  historyList.map((item, index) => {
                    const { assignment, breakdown } = item;

                    const byType = {};
                    breakdown?.forEach((b) => {
                      byType[b.visit_type] = b;
                    });

                    const overallPct = getOverallPercentage(breakdown);

                    return (
                      <Tr key={assignment?.id} _hover={{ bg: "gray.50" }}>
                        <Td fontWeight="600">{(currentPage - 1) * perPage + index + 1}</Td>

                        <Td minW="160px">
                          <Text fontWeight="700" color="#1A202C"> {assignment?.employee_name || "-"} </Text>
                        </Td>

                        <Td minW="160px">{assignment?.template_name || "-"}</Td>

                        <Td minW="180px">
                          {formatDate(assignment?.period_start)} -{" "}
                          {formatDate(assignment?.period_end)}
                        </Td>

                        {VISIT_TYPES.map((type) => (
                          <Td key={type}> {byType[type] ? `${byType[type].achieved} / ${byType[type].target_value}` : "-"} </Td>
                        ))}

                        <Td fontWeight="600">{overallPct}%</Td>

                        <Td>
                          <Badge colorScheme={statusColor(assignment?.status)} className="ledger_badge"> {assignment?.status || "-"} </Badge>
                        </Td>

                        <Td>{formatDate(assignment?.completed_at)}</Td>
                      </Tr>
                    );
                  })
                ) : (
                  <Tr>
                    <Td colSpan={9} textAlign="center" py={10}> No past periods found </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>

          <Flex justifyContent="space-between" alignItems="center" mt={6} flexWrap="wrap" gap={4}>
            <HStack w="80%">
              <FormControl maxW="120px">
                <Select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Select>
              </FormControl>

              <Text fontSize="14px" color="gray.600" fontWeight="500"> Showing Page {currentPage} of {totalPages} </Text>
            </HStack>

            <HStack>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((prev) => prev - 1)}
                isDisabled={currentPage === 1}>
                Previous
              </Button>

              <Button
                size="sm"
                colorScheme="blue"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                isDisabled={currentPage === totalPages}>
                Next
              </Button>
            </HStack>
          </Flex>
        </>
      )}
    </Box>
  );
}

export default ProgressHistory;