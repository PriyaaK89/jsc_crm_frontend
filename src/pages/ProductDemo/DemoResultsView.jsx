import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box, Grid, Text, Badge, Button, Spinner, Center, Flex, HStack,
  Tabs, TabList, Tab, TabPanels, TabPanel, useToast,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import ResultStagePanel from "./ResultStagePanel";
import FieldRouteMap from "./FieldRouteMap";

const STATUS_COLOR = { APPROVED: "blue", IN_PROGRESS: "orange", COMPLETED: "green" };
const STAGES = [
  { no: 1, title: "Sowing" },
  { no: 2, title: "Crop Growth" },
  { no: 3, title: "Final Evaluation" },
];

const pretty = (v) =>
  v ? String(v).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "";

const InfoItem = ({ label, value }) => (
  <Box>
    <Text fontSize="10px" color="gray.500" textTransform="uppercase">{label}</Text>
    <Text fontSize="13px" fontWeight="600" color="gray.800">{value || "-"}</Text>
  </Box>
);

const DemoResultsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const panelRef = useRef(null);

  const [demo, setDemo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);

  const [tracks, setTracks] = useState([]);

  // results grouped by customer -> { 1: r, 2: r, 3: r }
  const byCustomer = useMemo(() => {
    const map = new Map();
    (demo?.results || []).forEach((r) => {
      const key = r.demo_request_customer_id;
      if (!map.has(key)) map.set(key, {});
      map.get(key)[r.result_no] = r;
    });
    return map;
  }, [demo]);

  const latestTab = (customerId, grouped = byCustomer) => {
    const got = grouped.get(customerId) || {};
    const nos = Object.keys(got).map(Number);
    return nos.length ? Math.max(...nos) - 1 : 0;
  };

  // one track per (customer, stage): prefer the one linked to the submitted
  // result, otherwise the newest (list comes back oldest -> newest)
  const trackFor = (customerId, stageNo) => {
    const list = tracks.filter(
      (t) =>
        Number(t.demo_request_customer_id) === Number(customerId) &&
        Number(t.result_no) === stageNo
    );
    return list.find((t) => t.linked) || list[list.length - 1] || null;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await API.get(API_ENDPOINTS.get_demo_request_details(id));
        const d = res?.data?.data;
        setDemo(d);

        try {
          const tr = await API.get(API_ENDPOINTS.demo_tracks(id));
          setTracks(tr?.data?.data || []);
        } catch {
          setTracks([]);
        }

        const grouped = new Map();
        (d?.results || []).forEach((r) => {
          if (!grouped.has(r.demo_request_customer_id)) grouped.set(r.demo_request_customer_id, {});
          grouped.get(r.demo_request_customer_id)[r.result_no] = r;
        });
        const customers = d?.customers || [];
        const first = customers.find((c) => Number(c.results_count) > 0) || customers[0];
        if (first) {
          setSelectedId(first.id);
          setTabIndex(latestTab(first.id, grouped));
        }
      } catch (e) {
        toast({
          title: e?.response?.data?.message || "Failed to load demo",
          status: "error", duration: 3000, isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const selectCustomer = (c) => {
    setSelectedId(c.id);
    setTabIndex(latestTab(c.id));
    if (window.innerWidth < 768) {
      setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  };

  if (loading) return <Center py={20}><Spinner size="xl" color="#4f9190" /></Center>;
  if (!demo) return <Center py={20}><Text color="gray.500">Demo not found</Text></Center>;

  const customers = demo.customers || [];
  const selected = customers.find((c) => c.id === selectedId);
  const selectedResults = byCustomer.get(selectedId) || {};
  const doneCount = customers.filter((c) => c.result_status === "COMPLETED").length;
  const item = demo.items?.[0];

  return (
    <>
      <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={2}>
        <Text className="action_heading">Demo Results – {demo.demo_no}</Text>
        <HStack>
          <Button size="sm" variant="outline" onClick={() => navigate("/product-demo/demo-results")}>
            Back to list
          </Button>
          <Button size="sm" variant="outline" colorScheme="teal"
            onClick={() => navigate(`/product-demo/view-demo-request/${demo.id}`)}>
            View request details
          </Button>
        </HStack>
      </Flex>

      {/* Summary */}
      <Box border="1px solid #d0d7de" borderRadius="6px" p={4} mb={4} bg="#fafcfb">
        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(5, 1fr)" }} gap={4}>
          <InfoItem label="Product" value={item ? `${item.item_name || ""}${item.qty ? ` (${Number(item.qty)} ${item.unit || ""})` : ""}` : null} />
          <InfoItem label="Crop" value={demo.crop_name} />
          <InfoItem label="Raised by" value={demo.created_by_name} />
          <InfoItem label="Field officer" value={demo.field_officer_name} />
          <Box>
            <Text fontSize="10px" color="gray.500" textTransform="uppercase">Status</Text>
            <Badge colorScheme={STATUS_COLOR[demo.status] || "gray"} fontSize="11px" mt="2px">
              {pretty(demo.status)}
            </Badge>
            <Text fontSize="11px" color="gray.600" mt={1}>
              {doneCount} of {customers.length} customers completed
            </Text>
          </Box>
        </Grid>
      </Box>

      {customers.length === 0 ? (
        <Center py={10}><Text color="gray.500" fontSize="13px">No customers on this demo</Text></Center>
      ) : (
        <Grid templateColumns={{ base: "1fr", md: "300px 1fr" }} gap={4} alignItems="start">
          {/* Customers */}
          <Box border="1px solid #d0d7de" borderRadius="6px" overflow="hidden">
            <Box bg="#4f9190" color="white" px={4} py={2}>
              <Text fontSize="sm" fontWeight="500">Customers ({customers.length})</Text>
            </Box>
            <Box maxH={{ base: "none", md: "560px" }} overflowY="auto">
              {customers.map((c) => {
                const got = byCustomer.get(c.id) || {};
                const active = c.id === selectedId;
                return (
                  <Box key={c.id} px={3} py={3} cursor="pointer"
                    borderBottom="1px solid #eef2ef"
                    bg={active ? "#e6f2f1" : "white"}
                    borderLeft={active ? "4px solid #237086" : "4px solid transparent"}
                    _hover={{ bg: active ? "#e6f2f1" : "#f4f9f8" }}
                    onClick={() => selectCustomer(c)}>
                    <Flex justify="space-between" align="start" gap={2}>
                      <Box>
                        <Text fontSize="13px" fontWeight="700" color="gray.800">{c.party_name}</Text>
                        {c.party_firm_name && (
                          <Text fontSize="11px" color="gray.500">{c.party_firm_name}</Text>
                        )}
                      </Box>
                      <Badge colorScheme="purple" fontSize="9px">{c.party_type}</Badge>
                    </Flex>
                    {c.parent_name && (
                      <Text fontSize="10px" color="gray.500" mt={1}>Under {c.parent_name}</Text>
                    )}
                    <Flex justify="space-between" align="center" mt={2}>
                      <HStack spacing={1}>
                        {STAGES.map((s) => (
                          <Box key={s.no} w="22px" h="22px" borderRadius="full"
                            display="flex" alignItems="center" justifyContent="center"
                            bg={got[s.no] ? "green.500" : "gray.200"}
                            color={got[s.no] ? "white" : "gray.500"}
                            fontSize="10px" fontWeight="700" title={`Result ${s.no}`}>
                            {got[s.no] ? <CheckIcon boxSize="8px" /> : s.no}
                          </Box>
                        ))}
                      </HStack>
                      <Badge colorScheme={c.result_status === "COMPLETED" ? "green" : c.result_status === "IN_PROGRESS" ? "orange" : "gray"}
                        fontSize="9px">
                        {pretty(c.result_status)}
                      </Badge>
                    </Flex>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Results of selected customer */}
          <Box ref={panelRef} border="1px solid #d0d7de" borderRadius="6px" overflow="hidden" scrollMarginTop="80px">
            <Box bg="#4f9190" color="white" px={4} py={2}>
              <Text fontSize="sm" fontWeight="500">
                {selected ? `Results – ${selected.party_name}` : "Select a customer"}
              </Text>
            </Box>
            {selected && (
              <Box p={{ base: 2, md: 4 }}>
                {/* <Tabs index={tabIndex} onChange={setTabIndex} colorScheme="teal" variant="enclosed" isFitted> */}
                <Tabs isLazy index={tabIndex} onChange={setTabIndex} colorScheme="teal" variant="enclosed" isFitted>
                  <TabList>
                    {STAGES.map((s) => {
                      const done = !!selectedResults[s.no];
                      return (
                        <Tab key={s.no} fontSize={{ base: "11px", md: "13px" }} px={2}>
                          <Flex align="center" gap={2} direction={{ base: "column", md: "row" }}>
                            <Box w="18px" h="18px" borderRadius="full"
                              display="flex" alignItems="center" justifyContent="center"
                              bg={done ? "green.500" : "gray.300"} color="white" fontSize="10px" fontWeight="700">
                              {done ? <CheckIcon boxSize="8px" /> : s.no}
                            </Box>
                            <Text>{s.title}</Text>
                          </Flex>
                        </Tab>
                      );
                    })}
                  </TabList>
                  <TabPanels>
                    {STAGES.map((s) => (
                      <TabPanel key={s.no} px={{ base: 1, md: 3 }} pt={4}>
                        <ResultStagePanel stage={s.no} result={selectedResults[s.no]} />
                        <Box mt={4}>
                          <FieldRouteMap
                            key={`${selectedId}-${s.no}-${trackFor(selectedId, s.no)?.id || "none"}`}
                            track={trackFor(selectedId, s.no)}
                          />
                        </Box>
                      </TabPanel>
                    ))}
                  </TabPanels>
                </Tabs>
              </Box>
            )}
          </Box>
        </Grid>
      )}
    </>
  );
};

export default DemoResultsView;