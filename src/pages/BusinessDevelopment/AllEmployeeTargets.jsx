import React, { useCallback, useEffect, useState } from "react";
import {
  Badge, Box, Button, Flex, FormControl, FormLabel, Heading, HStack, Input,
  Progress, Select, SimpleGrid, Spinner, Table, TableContainer, Tbody, Td,
  Text, Th, Thead, Tr, useToast, VStack
} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const PAGE_SIZE = 10;

const LEVEL_OPTIONS = [
  { value: 1, label: "ZSM" },
  { value: 2, label: "RSM" },
  { value: 3, label: "ASM" },
  { value: 4, label: "TSM" },
  { value: 5, label: "SM" },
  { value: 6, label: "FA" }
];

const TYPE_LABELS = {
  SALE: "Sales Target",
  COLLECTION: "Collection Target",
  NEW_DISTRIBUTOR: "New Distributor"
};

const initialFilters = {
  search: "",
  level: "",
  target_type: "",
  duration_type: "",
  period: "current", // current | all | custom
  start_date: "",
  end_date: ""
};

// ================= FORMATTERS =================

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(n) || 0);

const formatCompactINR = (n) => {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (Math.abs(v) >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return formatINR(v);
};

// NEW_DISTRIBUTOR is a plain count, the others are rupees
const formatValue = (type, n, compact = false) => {
  if (type === "NEW_DISTRIBUTOR") return String(Number(n) || 0);
  return compact ? formatCompactINR(n) : formatINR(n);
};

const formatDate = (d) => {
  if (!d) return "";
  const [y, m, day] = String(d).slice(0, 10).split("-");
  return `${day}-${m}-${y}`;
};

const labelDuration = (d) => String(d || "").replace("_", " ");

const progressColor = (pct) => {
  if (pct >= 100) return "green";
  if (pct >= 60) return "teal";
  if (pct >= 30) return "orange";
  return "red";
};

// ================= COMPONENT =================

const AllEmployeeTargets = () => {
  const toast = useToast();

  const [filters, setFilters] = useState(initialFilters);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [targets, setTargets] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search.trim()), 400);
    return () => clearTimeout(t);
  }, [filters.search]);

  // ================= FETCH =================

  const fetchTargets = useCallback(async () => {
    // custom range needs both dates
    if (filters.period === "custom" && (!filters.start_date || !filters.end_date)) {
      return;
    }

    try {
      setLoading(true);

      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.level) params.level = filters.level;
      if (filters.target_type) params.target_type = filters.target_type;
      if (filters.duration_type) params.duration_type = filters.duration_type;

      if (filters.period === "all") {
        params.period = "all";
      } else if (filters.period === "custom") {
        params.start_date = filters.start_date;
        params.end_date = filters.end_date;
      }

      const res = await API.get(API_ENDPOINTS.get_all_targets, { params });

      setTargets(res?.data?.data || []);
      setSummary(res?.data?.summary || []);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to fetch targets",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    filters.level,
    filters.target_type,
    filters.duration_type,
    filters.period,
    filters.start_date,
    filters.end_date
  ]);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  // back to page 1 whenever the data changes
  useEffect(() => {
    setPage(1);
  }, [targets]);

  // ================= PAGINATION =================

  const totalPages = Math.max(Math.ceil(targets.length / PAGE_SIZE), 1);
  const pagedRows = targets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ================= RENDER =================

  return (
    <Box p={0}>
      <VStack spacing={6} align="stretch">
        <Heading size="md" color="gray.700">
          Employee Targets
        </Heading>

        {/* ---------- SUMMARY CARDS ---------- */}
        {summary.length > 0 && (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
            {summary.map((s) => {
              const pct = s.achievement_percent || 0;

              return (
                <Box
                  key={`${s.target_type}-${s.duration_type}`}
                  bg="white" p={4} borderRadius="10px"
                  borderWidth="1px" borderColor="gray.100" boxShadow="sm"
                >
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="600" color="gray.700">
                      {TYPE_LABELS[s.target_type] || s.target_type}
                    </Text>
                    <Badge colorScheme="gray">{labelDuration(s.duration_type)}</Badge>
                  </HStack>

                  <HStack align="baseline" spacing={2}>
                    <Text fontSize="2xl" fontWeight="700" color="#237086">
                      {formatValue(s.target_type, s.achieved_amount, true)}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      of {formatValue(s.target_type, s.target_amount, true)}
                    </Text>
                  </HStack>

                  <Progress
                    mt={3} size="sm" borderRadius="full"
                    value={Math.min(pct, 100)}
                    colorScheme={progressColor(pct)}
                  />
                  <Text mt={1} fontSize="xs" color="gray.500">
                    {pct}% achieved
                  </Text>
                </Box>
              );
            })}
          </SimpleGrid>
        )}

        {/* ---------- FILTERS ---------- */}
        <Box bg="white" p={4} borderRadius="10px" borderWidth="1px" borderColor="gray.100">
          <SimpleGrid columns={{ base: 1, md: 3, xl: 6 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm">Search Employee</FormLabel>
              <Input
                name="search" placeholder="Employee name"
                value={filters.search} onChange={handleFilterChange}
                fontSize="15px"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Role</FormLabel>
              <Select
                name="level" placeholder="All roles"
                value={filters.level} onChange={handleFilterChange}
                color="gray.700" fontSize="15px"
              >
                {LEVEL_OPTIONS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Target Type</FormLabel>
              <Select
                name="target_type" placeholder="All types"
                value={filters.target_type} onChange={handleFilterChange}
                color="gray.700" fontSize="15px"
              >
                <option value="SALE">SALE</option>
                <option value="COLLECTION">COLLECTION</option>
                <option value="NEW_DISTRIBUTOR">NEW DISTRIBUTOR</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Duration</FormLabel>
              <Select
                name="duration_type" placeholder="All durations"
                value={filters.duration_type} onChange={handleFilterChange}
                color="gray.700" fontSize="15px"
              >
                <option value="MONTHLY">MONTHLY</option>
                <option value="QUARTERLY">QUARTERLY</option>
                <option value="HALF_YEARLY">HALF YEARLY</option>
                <option value="YEARLY">YEARLY</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Period</FormLabel>
              <Select
                name="period" value={filters.period} onChange={handleFilterChange}
                color="gray.700" fontSize="15px"
              >
                <option value="current">Current (running)</option>
                <option value="all">All time</option>
                <option value="custom">Custom range</option>
              </Select>
            </FormControl>

            <Flex align="flex-end">
              <Button
                variant="outline" w="100%"
                onClick={() => setFilters(initialFilters)}
              >
                Reset
              </Button>
            </Flex>
          </SimpleGrid>

          {filters.period === "custom" && (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4} maxW="480px">
              <FormControl>
                <FormLabel fontSize="sm">From</FormLabel>
                <Input
                  type="date" name="start_date"
                  value={filters.start_date} onChange={handleFilterChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">To</FormLabel>
                <Input
                  type="date" name="end_date"
                  value={filters.end_date} onChange={handleFilterChange}
                />
              </FormControl>
            </SimpleGrid>
          )}
        </Box>

        {/* ---------- TABLE ---------- */}
        <Box bg="white" borderRadius="10px" borderWidth="1px" borderColor="gray.100">
          {loading && targets.length === 0 ? (
            <Flex justify="center" py={12}>
              <Spinner color="#237086" />
            </Flex>
          ) : targets.length === 0 ? (
            <Flex justify="center" py={12}>
              <Text color="gray.500">No targets found</Text>
            </Flex>
          ) : (
            <>
              <TableContainer opacity={loading ? 0.6 : 1}>
                <Table size="sm" variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Employee</Th>
                      <Th>Role</Th>
                      <Th>Type</Th>
                      <Th>Duration</Th>
                      <Th>Period</Th>
                      <Th isNumeric>Target</Th>
                      <Th isNumeric>Achieved</Th>
                      <Th isNumeric>Pending</Th>
                      <Th minW="160px">Progress</Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {pagedRows.map((t) => {
                      const pct = t.achievement_percent || 0;

                      return (
                        <Tr key={t.id}>
                          <Td>
                            <Text fontWeight="500">{t.user_name}</Text>
                            <Text fontSize="xs" color="gray.500">{t.contact_no}</Text>
                          </Td>
                          <Td>{t.role_name || "-"}</Td>
                          <Td>
                            <Badge
                              colorScheme={
                                t.target_type === "SALE" ? "green"
                                  : t.target_type === "COLLECTION" ? "purple"
                                    : "orange"
                              }
                            >
                              {t.target_type.replace("_", " ")}
                            </Badge>
                          </Td>
                          <Td>{labelDuration(t.duration_type)}</Td>
                          <Td whiteSpace="nowrap">
                            {formatDate(t.start_date)} → {formatDate(t.end_date)}
                          </Td>
                          <Td isNumeric>{formatValue(t.target_type, t.target_amount)}</Td>
                          <Td isNumeric>{formatValue(t.target_type, t.achieved_amount)}</Td>
                          <Td isNumeric>{formatValue(t.target_type, t.pending_amount)}</Td>
                          <Td>
                            <Progress
                              size="sm" borderRadius="full"
                              value={Math.min(pct, 100)}
                              colorScheme={progressColor(pct)}
                            />
                            <Text fontSize="xs" color="gray.500" mt={1}>{pct}%</Text>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>

              {/* ---------- PAGINATION ---------- */}
              <Flex justify="space-between" align="center" p={4}>
                <Text fontSize="sm" color="gray.500">
                  {targets.length} target{targets.length > 1 ? "s" : ""}
                </Text>

                <HStack>
                  <Button
                    size="sm" variant="outline"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    isDisabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Text fontSize="sm">
                    Page {page} of {totalPages}
                  </Text>
                  <Button
                    size="sm" variant="outline"
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    isDisabled={page === totalPages}
                  >
                    Next
                  </Button>
                </HStack>
              </Flex>
            </>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default AllEmployeeTargets;