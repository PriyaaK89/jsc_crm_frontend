import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Grid, Input, Select, Text, Button, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Spinner, Center, Flex, HStack, Progress, useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const ALL_STATUSES = "APPROVED,IN_PROGRESS,COMPLETED";
const STATUS_COLOR = { APPROVED: "blue", IN_PROGRESS: "orange", COMPLETED: "green" };
const LIMIT = 20;

const thStyle = { borderColor: "#c8d8cc", p: "8px 6px", fontWeight: "700", whiteSpace: "nowrap", fontSize: "11px" };
const tdStyle = { p: "6px", borderColor: "#e0e8e2", verticalAlign: "middle", fontSize: "12px" };
const filterInput = { size: "sm", height: "40px", fontSize: "12px", borderRadius: "6px", borderColor: "#c8d0d8", bg: "white" };

const DemoResultsList = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [demos, setDemos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [crops, setCrops] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [cropId, setCropId] = useState("");
  const [page, setPage] = useState(1);

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    API.get(API_ENDPOINTS.get_crops_list)
      .then((res) => setCrops(res?.data?.data || []))
      .catch(() => {});
  }, []);

  const fetchDemos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(API_ENDPOINTS.get_demo_requests_list, {
        params: {
          status: status || ALL_STATUSES,
          search: search || undefined,
          crop_id: cropId || undefined,
          page,
          limit: LIMIT,
        },
      });
      setDemos(res?.data?.data || []);
      setTotal(res?.data?.total ?? 0);
    } catch (e) {
      toast({
        title: e?.response?.data?.message || "Failed to load demos",
        status: "error", duration: 3000, isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [status, search, cropId, page, toast]);

  useEffect(() => { fetchDemos(); }, [fetchDemos]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <>
      <Text className="action_heading" mb={4} textAlign="center">Demo Results</Text>

      <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap={3} mb={4}>
        <Input {...filterInput} placeholder="Search demo no. or customer name"
          value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <Select {...filterInput} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All (approved onwards)</option>
          <option value="APPROVED">Approved – no results yet</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
        </Select>
        <Select {...filterInput} value={cropId} onChange={(e) => { setCropId(e.target.value); setPage(1); }}>
          <option value="">All crops</option>
          {crops.map((c) => <option key={c.id} value={c.id}>{c.crop_name}</option>)}
        </Select>
      </Grid>

      <Box border="1px solid #d0d7de" borderRadius="6px" overflow="hidden">
        {loading ? (
          <Center py={16}><Spinner size="lg" color="#4f9190" /></Center>
        ) : (
          <Box overflowX="auto">
            <Table size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th {...thStyle}>#</Th>
                  <Th {...thStyle}>Demo No.</Th>
                  <Th {...thStyle}>Product</Th>
                  <Th {...thStyle}>Crop</Th>
                  <Th {...thStyle}>Customer</Th>
                  <Th {...thStyle} minW="140px">Result Progress</Th>
                  <Th {...thStyle}>Status</Th>
                  <Th {...thStyle}>Raised By</Th>
                  <Th {...thStyle}>Date</Th>
                  <Th {...thStyle}></Th>
                </Tr>
              </Thead>
              <Tbody>
                {demos.length === 0 && (
                  <Tr>
                    <Td colSpan={10} textAlign="center" py={8} fontSize="12px" color="gray.500">
                      No demos found
                    </Td>
                  </Tr>
                )}
                {demos.map((d, i) => {
                  const customers = Number(d.customer_count) || 0;
                  const done = Number(d.completed_customer_count) || 0;
                  const pct = customers ? Math.round((done / customers) * 100) : 0;
                  return (
                    <Tr key={d.id} bg={i % 2 === 0 ? "white" : "#f7faf8"}>
                      <Td {...tdStyle}>{(page - 1) * LIMIT + i + 1}</Td>
                      <Td {...tdStyle} fontWeight="700">{d.demo_no}</Td>
                      <Td {...tdStyle}>{d.product_name || "-"}</Td>
                      <Td {...tdStyle}>{d.crop_name || "-"}</Td>
                      <Td {...tdStyle}>
                        {d.party_name || "-"}
                        {customers > 1 && (
                          <Text as="span" color="gray.500"> +{customers - 1} more</Text>
                        )}
                      </Td>
                      <Td {...tdStyle}>
                        <Text fontSize="11px" color="gray.600" mb="2px">
                          {done} of {customers} customers done
                        </Text>
                        <Progress value={pct} size="xs" colorScheme="teal" borderRadius="full" />
                      </Td>
                      <Td {...tdStyle}>
                        <Badge colorScheme={STATUS_COLOR[d.status] || "gray"} fontSize="10px" textTransform="capitalize">
                          {String(d.status).replaceAll("_", " ").toLowerCase()}
                        </Badge>
                      </Td>
                      <Td {...tdStyle}>{d.created_by_name || "-"}</Td>
                      <Td {...tdStyle}>{new Date(d.created_at).toLocaleDateString()}</Td>
                      <Td {...tdStyle}>
                        <Button size="xs" bg="#237086" color="white" _hover={{ bg: "#1B5A6B" }}
                          onClick={() => navigate(`/product-demo/demo-results/${d.id}`)}>
                          View Results
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      <Flex justify="space-between" align="center" mt={3}>
        <Text fontSize="12px" color="gray.600">{total} demo(s)</Text>
        <HStack>
          <Button size="xs" variant="outline" isDisabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Text fontSize="12px">Page {page} of {totalPages}</Text>
          <Button size="xs" variant="outline" isDisabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </HStack>
      </Flex>
    </>
  );
};

export default DemoResultsList;