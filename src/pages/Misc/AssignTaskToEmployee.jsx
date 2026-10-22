import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Link as ChakraLink,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Tab,
  Table,
  TableContainer,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";

import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

/* =====================================================
    CONSTANTS & HELPERS
===================================================== */

const ACTION_OPTIONS = [
  { value: "START_TASK", label: "Start Task" },
  { value: "UPLOAD_PROOF", label: "Upload Proof" },
  { value: "COMMENT", label: "Comment" },
  { value: "COMPLETE", label: "Complete" },
];

const PRIORITY_COLORS = { HIGH: "red", MEDIUM: "orange", LOW: "green" };
const STATUS_COLORS = { PENDING: "gray", IN_PROGRESS: "blue", COMPLETED: "green" };

const INITIAL_FORM = {
  title: "",
  description: "",
  priority: "MEDIUM",
  job_role_id: "",
  assigned_to: "",
  deadline: "",
  allowed_actions: ["START_TASK", "COMPLETE"],
  proof_required: false,
};

// value for <input type="datetime-local">, in the browser's local time
const toLocalInputValue = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "-";

/* =====================================================
    PREVIEW CARD (mirrors the mobile card)
===================================================== */

const TaskPreview = ({ form }) => {
  const has = (a) => form.allowed_actions.includes(a);

  return (
    <Box
      border="1px solid"
      borderColor="gray.200"
      borderRadius="16px"
      p={4}
      bg="white"
      boxShadow="sm"
    >
      <Text fontSize="xs" color="gray.500" mb={2}>
        Preview (as shown in the app)
      </Text>

      <Flex justify="space-between" align="center" gap={2}>
        <Text fontWeight="700" noOfLines={1}>
          {form.title || "Task title"}
        </Text>
        <Badge colorScheme={PRIORITY_COLORS[form.priority]}>{form.priority}</Badge>
      </Flex>

      <Text fontSize="sm" color="gray.600" mt={1} noOfLines={3}>
        {form.description || "Task description will appear here."}
      </Text>

      <Text fontSize="xs" color="gray.500" mt={3}>
        DEADLINE
      </Text>
      <Text fontSize="sm" fontWeight="600">
        {form.deadline ? formatDateTime(form.deadline) : "-"}
      </Text>

      <HStack mt={4} spacing={3}>
        {has("UPLOAD_PROOF") && (
          <Button size="sm" variant="outline" flex={1}>
            Upload Proof
          </Button>
        )}
        {has("COMMENT") && (
          <Button size="sm" variant="outline" flex={1}>
            Comment
          </Button>
        )}
        {has("START_TASK") && (
          <Button size="sm" bg="#1B6B3A" color="white" _hover={{ bg: "#14502B" }} flex={1}>
            Start Task
          </Button>
        )}
        {has("COMPLETE") && (
          <Button size="sm" bg="#1B6B3A" color="white" _hover={{ bg: "#14502B" }} flex={1}>
            Complete
          </Button>
        )}
      </HStack>
    </Box>
  );
};

/* =====================================================
    ASSIGN TASK FORM
===================================================== */

const AssignTaskForm = ({ onCreated }) => {
  const toast = useToast();

  const [form, setForm] = useState(INITIAL_FORM);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [canAssign, setCanAssign] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const showWarning = (description) =>
    toast({
      title: "Validation Error",
      description,
      status: "warning",
      duration: 3000,
      isClosable: true,
    });

  /* ---------- load roles once ---------- */
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await API.get(API_ENDPOINTS.TASK_ASSIGNABLE_ROLES);
        setRoles(res?.data?.roles || []);
      } catch (error) {
        if (error?.response?.status === 403) {
          setCanAssign(false);
        } else {
          toast({
            title: "Error",
            description: error?.response?.data?.message || "Failed to load roles",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- generic input handler ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------- role -> employees ---------- */
  const handleRoleChange = async (e) => {
    const jobRoleId = e.target.value;

    setForm((prev) => ({ ...prev, job_role_id: jobRoleId, assigned_to: "" }));
    setUsers([]);

    if (!jobRoleId) return;

    try {
      setLoadingUsers(true);
      const res = await API.get(API_ENDPOINTS.TASK_ASSIGNABLE_USERS, {
        params: { job_role_id: jobRoleId },
      });
      setUsers(res?.data?.users || []);
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load employees",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  /* ---------- action checkboxes ---------- */
  const toggleAction = (value) => {
    setForm((prev) => {
      const exists = prev.allowed_actions.includes(value);
      const allowed_actions = exists
        ? prev.allowed_actions.filter((a) => a !== value)
        : [...prev.allowed_actions, value];

      return {
        ...prev,
        allowed_actions,
        // proof can't be required if the upload button is off
        proof_required:
          value === "UPLOAD_PROOF" && exists ? false : prev.proof_required,
      };
    });
  };

  /* ---------- submit ---------- */
  const handleSubmit = async () => {
    if (!form.title.trim()) return showWarning("Task title is required");
    if (!form.job_role_id) return showWarning("Please select a role");
    if (!form.assigned_to) return showWarning("Please select an employee");
    if (!form.deadline) return showWarning("Deadline is required");

    const deadlineDate = new Date(form.deadline);
    if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
      return showWarning("Deadline must be in the future");
    }
    if (form.allowed_actions.length === 0) {
      return showWarning("Select at least one action button");
    }

    try {
      setSubmitting(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        assigned_to: Number(form.assigned_to),
        deadline: deadlineDate.toISOString(),
        allowed_actions: form.allowed_actions,
        proof_required: form.proof_required,
      };

      const res = await API.post(API_ENDPOINTS.CREATE_TASK, payload);

      toast({
        title: "Success",
        description: res?.data?.message || "Task assigned successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setForm(INITIAL_FORM);
      setUsers([]);
      onCreated?.();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to assign task",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- render ---------- */
  if (loadingRoles) {
    return (
      <Flex justify="center" py={10}>
        <Spinner />
      </Flex>
    );
  }

  if (!canAssign) {
    return (
      <Alert status="warning" borderRadius="8px">
        <AlertIcon />
        You are not allowed to assign tasks.
      </Alert>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
      {/* ---------- form ---------- */}
      <Box gridColumn={{ lg: "span 2" }}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
          <FormControl isRequired gridColumn={{ md: "span 2" }}>
            <FormLabel>Task Header</FormLabel>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              maxLength={255}
              placeholder="e.g. Verify Stock at Aaman Kisan Seva Kendra"
            />
          </FormControl>

          <FormControl gridColumn={{ md: "span 2" }}>
            <FormLabel>Sub Heading / Description</FormLabel>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe what needs to be done"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Role</FormLabel>
            <Select
              placeholder="Select role"
              value={form.job_role_id}
              onChange={handleRoleChange}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Assign To</FormLabel>
            <Select
              placeholder={loadingUsers ? "Loading..." : "Select employee"}
              name="assigned_to"
              value={form.assigned_to}
              onChange={handleChange}
              isDisabled={!form.job_role_id || loadingUsers}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                  {u.contact_no ? ` (${u.contact_no})` : ""}
                </option>
              ))}
            </Select>
            {form.job_role_id && !loadingUsers && users.length === 0 && (
              <Text fontSize="xs" color="orange.500" mt={1}>
                No employees found for this role in your team.
              </Text>
            )}
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Priority</FormLabel>
            <Select name="priority" value={form.priority} onChange={handleChange}>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Deadline</FormLabel>
            <Input
              type="datetime-local"
              name="deadline"
              value={form.deadline}
              min={toLocalInputValue(new Date())}
              onChange={handleChange}
            />
          </FormControl>
        </SimpleGrid>

        {/* ---------- action buttons ---------- */}
        <FormControl mt={6}>
          <FormLabel>Buttons shown on the employee's task card</FormLabel>
          <Stack direction="row" spacing={6} wrap="wrap">
            {ACTION_OPTIONS.map((a) => (

              <Checkbox
                key={a.value}
                isChecked={form.allowed_actions.includes(a.value)}
                isDisabled={a.value === "COMPLETE"}
                onChange={() => toggleAction(a.value)}
              >
                {a.label}
              </Checkbox>
            ))}
          </Stack>

          <Checkbox
            mt={3}
            isChecked={form.proof_required}
            isDisabled={!form.allowed_actions.includes("UPLOAD_PROOF")}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, proof_required: e.target.checked }))
            }
          >
            Proof is mandatory before the task can be completed
          </Checkbox>
        </FormControl>

        <Box textAlign="center" mt={10}>
          <Button
            bg="#237086"
            fontWeight="500"
            fontSize="14px"
            color="white"
            px={8}
            borderRadius="12px"
            onClick={handleSubmit}
            isLoading={submitting}
            loadingText="Assigning"
            _hover={{ transform: "translateY(-2px)", boxShadow: "md", bg: "#1B5A6B" }}
            transition="all 0.2s ease"
          >
            Assign Task
          </Button>
        </Box>
      </Box>

      {/* ---------- preview ---------- */}
      <Box>
        <TaskPreview form={form} />
      </Box>
    </SimpleGrid>
  );
};

/* =====================================================
    ASSIGNED TASKS LIST
===================================================== */

const LIMIT = 10;

const AssignedTaskList = ({ refreshKey }) => {
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(API_ENDPOINTS.TASKS_ASSIGNED_BY_ME, {
        params: { status: status || undefined, page, limit: LIMIT },
      });
      setTasks(res?.data?.tasks || []);
      setTotal(res?.data?.total || 0);
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load tasks",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, refreshKey]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <Box>
      <HStack mb={4} justify="space-between">
        <Select
          maxW="220px"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </Select>
        <Text fontSize="sm" color="gray.600">
          {total} task{total === 1 ? "" : "s"}
        </Text>
      </HStack>

      <TableContainer border="1px solid" borderColor="gray.200" borderRadius="12px">
        <Table size="sm" variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Task</Th>
              <Th>Assigned To</Th>
              <Th>Priority</Th>
              <Th>Deadline</Th>
              <Th>Status</Th>
              <Th>Proof</Th>
              <Th>Comment</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={7} textAlign="center" py={8}>
                  <Spinner size="sm" />
                </Td>
              </Tr>
            ) : tasks.length === 0 ? (
              <Tr>
                <Td colSpan={7} textAlign="center" py={8} color="gray.500">
                  No tasks found
                </Td>
              </Tr>
            ) : (
              tasks.map((t) => (
                <Tr key={t.id}>
                  <Td maxW="260px">
                    <Text fontWeight="600" noOfLines={1}>
                      {t.title}
                    </Text>
                    <Text fontSize="xs" color="gray.500" noOfLines={2}>
                      {t.description}
                    </Text>
                  </Td>
                  <Td>
                    {t.assigned_to_name || "-"}
                    {t.assigned_to_role && (
                      <Text fontSize="xs" color="gray.500">
                        {t.assigned_to_role}
                      </Text>
                    )}
                  </Td>
                  <Td>
                    <Badge colorScheme={PRIORITY_COLORS[t.priority]}>{t.priority}</Badge>
                  </Td>
                  <Td whiteSpace="nowrap">{formatDateTime(t.deadline)}</Td>
                  <Td>
                    <Badge colorScheme={STATUS_COLORS[t.status]}>
                      {t.status.replace("_", " ")}
                    </Badge>
                    {t.completed_at && (
                      <Text fontSize="xs" color="gray.500">
                        {formatDateTime(t.completed_at)}
                      </Text>
                    )}
                  </Td>
                  <Td>
                    {t.proofs?.length ? (
                      <Stack spacing={0}>
                        {t.proofs.map((p, i) => (
                          <ChakraLink
                            key={p.id}
                            href={p.url}
                            isExternal
                            color="blue.500"
                            fontSize="xs"
                          >
                            {p.file_name || `Proof ${i + 1}`}
                          </ChakraLink>
                        ))}
                      </Stack>
                    ) : (
                      "-"
                    )}
                  </Td>
                  <Td maxW="200px">
                    <Text fontSize="xs" noOfLines={2}>
                      {t.comment || "-"}
                    </Text>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>

      <HStack justify="flex-end" mt={4}>
        <Button
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          isDisabled={page <= 1 || loading}
        >
          Previous
        </Button>
        <Text fontSize="sm">
          Page {page} of {totalPages}
        </Text>
        <Button
          size="sm"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          isDisabled={page >= totalPages || loading}
        >
          Next
        </Button>
      </HStack>
    </Box>
  );
};

/* =====================================================
    PAGE
===================================================== */

const AssignTaskToEmployee = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = () => {
    setRefreshKey((k) => k + 1);
    setTabIndex(1); // jump to the list after a successful assign
  };

  return (
    <Box>
      <Heading size="md" mb={5}>
        Task Assignment
      </Heading>

      <Tabs index={tabIndex} onChange={setTabIndex} variant="enclosed" isLazy>
        <TabList>
          <Tab>Assign Task</Tab>
          <Tab>Assigned Tasks</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0} pt={6}>
            <AssignTaskForm onCreated={handleCreated} />
          </TabPanel>
          <TabPanel px={0} pt={6}>
            <AssignedTaskList refreshKey={refreshKey} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AssignTaskToEmployee;