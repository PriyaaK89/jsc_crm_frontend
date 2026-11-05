import React, { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableContainer,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { API_ENDPOINTS } from "../../services/endpoints";
import API from "../../services/api";


const STATUS_COLORS = {
  APPROVED: "green",
  SUBMITTED: "blue",
  PENDING: "orange",
  REJECTED: "red",
  DRAFT: "gray",
  RESUBMIT_REQUIRED: "orange",
};

const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

const rupees = (value) =>
  `₹${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;

const StatusBadge = ({ status }) => (
  <Badge colorScheme={STATUS_COLORS[status] || "gray"}>
    {String(status || "-").replace(/_/g, " ")}
  </Badge>
);

const Info = ({ label, value }) =>
  value === "" || value === null || value === undefined ? null : (
    <Box>
      <Text fontSize="xs" color="gray.500">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="600">
        {value}
      </Text>
    </Box>
  );

const Loading = () => (
  <Flex justify="center" py={10}>
    <Spinner />
  </Flex>
);

const Empty = ({ text }) => (
  <Text textAlign="center" color="gray.500" py={8}>
    {text}
  </Text>
);

const Pager = ({ page, totalPages, onChange }) =>
  totalPages > 1 ? (
    <HStack justify="flex-end" mt={3}>
      <Button size="sm" isDisabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <Text fontSize="sm">
        Page {page} of {totalPages}
      </Text>
      <Button
        size="sm"
        isDisabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </Button>
    </HStack>
  ) : null;

const PartiesTable = ({ parties, showVisited = false }) => {
  if (!parties.length) return <Empty text="No parties in this beat." />;

  return (
    <TableContainer>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>Party</Th>
            <Th>Type</Th>
            <Th>Contact person</Th>
            <Th>Location</Th>
            <Th>Mobile</Th>
            {showVisited && <Th>Visited</Th>}
          </Tr>
        </Thead>
        <Tbody>
          {parties.map((p, i) => (
            <Tr key={p.id}>
              <Td>{i + 1}</Td>
              <Td>{p.name}</Td>
              <Td textTransform="capitalize">{p.type}</Td>
              <Td>{p.person}</Td>
              <Td>{p.location}</Td>
              <Td>{p.contact}</Td>
              {showVisited && (
                <Td>
                  <Badge colorScheme={p.visited ? "green" : "gray"}>
                    {p.visited ? "Yes" : "No"}
                  </Badge>
                </Td>
              )}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

// ------------------------------------------------------------------ beats
const BeatsTab = ({ userId, load }) => {
  const [items, setItems] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setItems(null);
    load(API_ENDPOINTS.beat_history_beats, { user_id: userId }).then((d) =>
      setItems(d ? d.items : []),
    );
  }, [userId, load]);

  if (!items) return <Loading />;
  if (!items.length) return <Empty text="No beats assigned." />;

  return (
    <>
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Beat</Th>
              <Th>Market area</Th>
              <Th>District</Th>
              <Th isNumeric>Parties</Th>
              <Th isNumeric>Km</Th>
              <Th>Assigned by</Th>
              <Th>Status</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {items.map((b) => (
              <Tr key={b.id}>
                <Td>{b.name}</Td>
                <Td>{b.market_area}</Td>
                <Td>{b.district}</Td>
                <Td isNumeric>{b.parties_count}</Td>
                <Td isNumeric>{b.total_km}</Td>
                <Td>{b.created_by_name}</Td>
                <Td>
                  <Badge colorScheme={b.is_active ? "green" : "gray"}>
                    {b.is_active ? "Active" : "Inactive"}
                  </Badge>
                </Td>
                <Td>
                  <Button size="xs" onClick={() => setSelected(b)}>
                    View
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selected?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && <PartiesTable parties={selected.parties} />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

// ------------------------------------------------------------------ date
const DateTab = ({ userId, load }) => {
  const [date, setDate] = useState(today());
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    load(API_ENDPOINTS.beat_history_plan_day, { user_id: userId, date }).then((d) =>
      setData(d || { plan: null }),
    );
  }, [userId, date, load]);

  const plan = data?.plan;

  return (
    <>
      <Input
        type="date"
        maxW="220px"
        mb={4}
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      {!data && <Loading />}
      {data && !plan && <Empty text="No beat plan submitted for this date." />}
      {plan && (
        <>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
            <Info label="Beat" value={plan.beat.name} />
            <Box>
              <Text fontSize="xs" color="gray.500">
                Status
              </Text>
              <StatusBadge status={plan.day_status} />
            </Box>
            <Info label="Market area" value={plan.beat.market_area} />
            <Info label="District" value={plan.beat.district} />
            <Info label="Purpose" value={plan.purpose} />
            <Info label="Sales target" value={rupees(plan.sales_target)} />
            <Info label="Collection target" value={rupees(plan.collection_target)} />
            <Info
              label="New dealers"
              value={`${data.new_dealers_done} of ${plan.new_dealer_target}`}
            />
            <Info
              label="Parties visited"
              value={`${plan.parties_visited} of ${plan.parties.length}`}
            />
            <Info label="Approver" value={plan.approver_name} />
            <Info label="Submitted on" value={plan.submitted_at} />
            <Info label="Decided on" value={plan.decided_at} />
            <Info label="Remark" value={plan.remark} />
            <Info label="Manager remark" value={plan.manager_remark} />
          </SimpleGrid>
          <PartiesTable parties={plan.parties} showVisited />
        </>
      )}
    </>
  );
};

// ------------------------------------------------------------------ plans
const PlansTab = ({ userId, load }) => {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    setData(null);
    load(API_ENDPOINTS.beat_history_plans, {
      user_id: userId,
      status: status || undefined,
      page,
      limit: 20,
    }).then((d) => setData(d || { items: [], totalPages: 1 }));
  }, [userId, status, page, load]);

  const openPlan = async (id) => {
    const d = await load(`${API_ENDPOINTS.beat_plans}/${id}`);
    if (d) setDetail(d);
  };

  return (
    <>
      <Select
        maxW="220px"
        mb={4}
        value={status}
        onChange={(e) => {
          setPage(1);
          setStatus(e.target.value);
        }}
      >
        <option value="">All statuses</option>
        <option value="SUBMITTED">Submitted</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
      </Select>

      {!data && <Loading />}
      {data && !data.items.length && <Empty text="No plans found." />}
      {data && data.items.length > 0 && (
        <>
          <TableContainer>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Week</Th>
                  <Th isNumeric>Days</Th>
                  <Th isNumeric>Sales target</Th>
                  <Th isNumeric>Collection target</Th>
                  <Th>New dealers</Th>
                  <Th>Approver</Th>
                  <Th>Status</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {data.items.map((p) => (
                  <Tr key={p.id}>
                    <Td>
                      {p.week_start} to {p.week_end}
                    </Td>
                    <Td isNumeric>{p.days_planned}</Td>
                    <Td isNumeric>{rupees(p.total_sales)}</Td>
                    <Td isNumeric>{rupees(p.total_collection)}</Td>
                    <Td>
                      {p.new_dealers_done} of {p.new_dealer_target}
                    </Td>
                    <Td>{p.approver_name}</Td>
                    <Td>
                      <StatusBadge
                        status={p.resubmit_days > 0 ? "RESUBMIT_REQUIRED" : p.status}
                      />
                    </Td>
                    <Td>
                      <Button size="xs" onClick={() => openPlan(p.id)}>
                        View
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          <Pager page={page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}

      <Modal isOpen={!!detail} onClose={() => setDetail(null)} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {detail?.week_start} to {detail?.week_end}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {detail && (
              <>
                <TableContainer mb={5}>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Date</Th>
                        <Th>Beat</Th>
                        <Th>Purpose</Th>
                        <Th isNumeric>Sales</Th>
                        <Th isNumeric>Collection</Th>
                        <Th isNumeric>New dealers</Th>
                        <Th>Day status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {detail.days
                        .filter((d) => d.is_planned)
                        .map((d) => (
                          <Tr key={d.date}>
                            <Td>{d.date}</Td>
                            <Td>{d.beat_name}</Td>
                            <Td>{d.purpose}</Td>
                            <Td isNumeric>{rupees(d.sales_target)}</Td>
                            <Td isNumeric>{rupees(d.collection_target)}</Td>
                            <Td isNumeric>{d.new_dealer_target}</Td>
                            <Td>{d.amend_status || "-"}</Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </TableContainer>
                <Text fontWeight="700" mb={2}>
                  History
                </Text>
                {(detail.logs || []).map((l) => (
                  <Text key={l.id} fontSize="sm" mb={1}>
                    {l.created_at} · {l.action.replace(/_/g, " ")}
                    {l.actor_name ? ` · ${l.actor_name}` : ""}
                    {l.remark ? ` · ${l.remark}` : ""}
                  </Text>
                ))}
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

// ------------------------------------------------------------------ changes
const ChangesTab = ({ userId, load }) => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setData(null);
    load(API_ENDPOINTS.beat_change_history, {
      user_id: userId,
      page,
      limit: 20,
    }).then((d) => setData(d || { items: [], totalPages: 1 }));
  }, [userId, page, load]);

  if (!data) return <Loading />;
  if (!data.items.length) return <Empty text="No beat change requests." />;

  return (
    <>
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Requested on</Th>
              <Th>Plan date</Th>
              <Th>Original beat</Th>
              <Th>New beat</Th>
              <Th>Reason</Th>
              <Th>Manager</Th>
              <Th>Status</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {data.items.map((r) => (
              <Tr key={r.id}>
                <Td>{r.created_at}</Td>
                <Td>{r.plan_date}</Td>
                <Td>{r.original_beat_name}</Td>
                <Td>{r.requested_beat_name || r.current_beat_name}</Td>
                <Td>{r.reason}</Td>
                <Td>{r.reporting_manager}</Td>
                <Td>
                  <StatusBadge status={r.status} />
                </Td>
                <Td>
                  <Button size="xs" onClick={() => setSelected(r)}>
                    View
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <Pager page={page} totalPages={data.totalPages} onChange={setPage} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Beat change request</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && (
              <>
                <SimpleGrid columns={2} spacing={3} mb={4}>
                  <Info label="Details" value={selected.details} />
                  <Info label="Manager remark" value={selected.manager_remark} />
                  <Info label="Decided by" value={selected.decided_by_name} />
                  <Info label="Decided on" value={selected.decided_at} />
                </SimpleGrid>
                <Text fontWeight="700" mb={2}>
                  Resubmission history
                </Text>
                {selected.revisions.length === 0 && (
                  <Text fontSize="sm" color="gray.500">
                    No resubmission history.
                  </Text>
                )}
                {selected.revisions.map((v) => (
                  <Text key={v.id} fontSize="sm" mb={1}>
                    {v.created_at} · {v.event} · {v.beat_name}
                    {v.actor_name ? ` · ${v.actor_name}` : ""}
                    {v.note ? ` · ${v.note}` : ""}
                  </Text>
                ))}
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

// ------------------------------------------------------------------ page
const BeatPage = () => {
  const toast = useToast();
  const [employees, setEmployees] = useState(null);
  const [userId, setUserId] = useState("");

  const load = useCallback(
    async (url, params) => {
      try {
        const res = await API.get(url, { params });
        return res.data.data;
      } catch (err) {
        toast({
          title: err.response?.data?.message || "Could not load the data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return null;
      }
    },
    [toast],
  );

  useEffect(() => {
    load(API_ENDPOINTS.beat_history_employees).then((d) => {
      const items = d ? d.items : [];
      setEmployees(items);
      if (items.length) setUserId(String(items[0].id));
    });
  }, [load]);

  if (!employees) return <Loading />;
  if (!employees.length) return <Empty text="No employees found." />;

  return (
    <Box>
      <Select
        maxW="360px"
        mb={5}
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      >
        {employees.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
            {e.job_role ? ` (${e.job_role})` : ""}
            {e.is_active ? "" : " - Inactive"}
          </option>
        ))}
      </Select>

      <Tabs isLazy variant="enclosed">
        <TabList flexWrap="wrap">
          <Tab>Beats & Parties</Tab>
          <Tab>Plan by Date</Tab>
          <Tab>Weekly Plans</Tab>
          <Tab>Beat Changes</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <BeatsTab userId={userId} load={load} />
          </TabPanel>
          <TabPanel px={0}>
            <DateTab userId={userId} load={load} />
          </TabPanel>
          <TabPanel px={0}>
            <PlansTab userId={userId} load={load} />
          </TabPanel>
          <TabPanel px={0}>
            <ChangesTab userId={userId} load={load} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default BeatPage;
