import React, { useCallback, useEffect, useState } from "react";
import { Avatar, Badge, Box, Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter,
  DrawerHeader, DrawerOverlay, Flex, Heading, HStack, Icon, Input, InputGroup, InputLeftElement,
  Select, SimpleGrid, Spinner, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useToast,
} from "@chakra-ui/react";
import { MdAdminPanelSettings, MdPeople, MdSearch, MdVerifiedUser, MdVpnKey } from "react-icons/md";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import PermissionEditor, { PermissionSummary } from "../Permissions/PermissionEditor";


const LIMIT = 10;
const EMPTY_FILTERS = { role: "", status: "", department_id: "", access: "", permission_code: "" };

const StatCard = ({ icon, label, value, color }) => (
  <Flex align="center" gap={3} bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl" p={4} boxShadow="sm">
    <Flex w="44px" h="44px" align="center" justify="center" borderRadius="lg" bg={`${color}.50`} color={`${color}.600`}>
      <Icon as={icon} boxSize={6} />
    </Flex>
    <Box>
      <Text fontSize="xl" fontWeight="800" lineHeight="1.1">{value}</Text>
      <Text fontSize="xs" color="gray.500">{label}</Text>
    </Box>
  </Flex>
);

const PermissionManagement = () => {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [catalog, setCatalog] = useState([]);

  const [openUser, setOpenUser] = useState(null); // { id, mode }
  const [detail, setDetail] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);

  const showError = useCallback(
    (error, title) =>
      toast({
        title: error?.response?.data?.message || title,
        status: "error",
        duration: 3000,
        isClosable: true,
      }),
    [toast],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setTerm(search.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    try {
      const params = { page, limit: LIMIT };
      if (term) params.search = term;
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const res = await API.get(API_ENDPOINTS.permissions_admin_users, { params });
      setData(res?.data?.data);
    } catch (error) {
      setData((prev) => prev || { users: [], summary: {}, totalPages: 0 });
      showError(error, "Could not load users");
    }
  }, [page, term, filters, showError]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    API.get(API_ENDPOINTS.get_department)
      .then((res) => setDepartments(res?.data?.data || res?.data || []))
      .catch(() => {});
    API.get(API_ENDPOINTS.permissions_catalog)
      .then((res) => setCatalog(res?.data?.data || []))
      .catch(() => {});
  }, []);

  const setFilter = (key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const openDetail = async (id, mode) => {
    setOpenUser({ id, mode });
    setDetail(null);
    try {
      const res = await API.get(API_ENDPOINTS.permissions_admin_user(id));
      const value = res?.data?.data;
      setDetail(value);
      setSelected(new Set(value?.permission_ids || []));
    } catch (error) {
      setOpenUser(null);
      showError(error, "Could not load permissions");
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await API.put(API_ENDPOINTS.permissions_admin_user(openUser.id), {
        permission_ids: [...selected],
      });
      toast({ title: "Permissions saved successfully", status: "success", duration: 2000, isClosable: true });
      setOpenUser(null);
      await load();
    } catch (error) {
      showError(error, "Could not save permissions");
    } finally {
      setSaving(false);
    }
  };

  const summary = data?.summary || {};
  const editing = openUser?.mode === "edit" && !detail?.is_admin;
  // Marketing department: permissions the user has automatically (shown locked, never saved)
  const autoIds = new Set(detail?.is_admin ? [] : detail?.auto_permission_ids || []);

  return (
    <Box bg="gray.50" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={5} borderRadius="xl" boxShadow="md">
      <Heading size="md">Permission Management</Heading>
      <Text fontSize="sm" color="gray.600" mb={5}>
        See and update what each user can access
      </Text>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={5}>
        <StatCard icon={MdPeople} label="Users" value={summary.total_users ?? "-"} color="blue" />
        <StatCard icon={MdVerifiedUser} label="With permissions" value={summary.with_permissions ?? "-"} color="green" />
        <StatCard icon={MdAdminPanelSettings} label="Full access" value={summary.full_access ?? "-"} color="purple" />
        <StatCard icon={MdVpnKey} label="Available permissions" value={summary.total_permissions ?? "-"} color="orange" />
      </SimpleGrid>

      <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl" p={4} mb={4}>
        <SimpleGrid columns={{ base: 1, md: 3, xl: 6 }} spacing={3}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={MdSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              aria-label="Search users"
              placeholder="Name, email or mobile"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          <Select aria-label="Role" value={filters.role} onChange={(e) => setFilter("role", e.target.value)}>
            <option value="">All roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </Select>
          <Select aria-label="Status" value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Select aria-label="Department" value={filters.department_id} onChange={(e) => setFilter("department_id", e.target.value)}>
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
          <Select aria-label="Access" value={filters.access} onChange={(e) => setFilter("access", e.target.value)}>
            <option value="">Any access</option>
            <option value="granted">Has permissions</option>
            <option value="none">No permissions</option>
          </Select>
          <Select aria-label="Permission" value={filters.permission_code} onChange={(e) => setFilter("permission_code", e.target.value)}>
            <option value="">Any permission</option>
            {catalog.flatMap((m) => m.permissions).map((p) => (
              <option key={p.id} value={p.code}>{p.name}</option>
            ))}
          </Select>
        </SimpleGrid>
      </Box>

      <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl" overflow="hidden">
        {!data ? (
          <Flex justify="center" py={12}><Spinner /></Flex>
        ) : data.users.length === 0 ? (
          <Text textAlign="center" color="gray.500" py={12}>No users match your filters.</Text>
        ) : (
          <TableContainer>
            <Table size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>User</Th>
                  <Th>Role</Th>
                  <Th>Department</Th>
                  <Th>Status</Th>
                  <Th>Permissions</Th>
                  <Th textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.users.map((u) => (
                  <Tr key={u.id}>
                    <Td>
                      <HStack spacing={3}>
                        <Avatar size="sm" name={u.name} />
                        <Box>
                          <Text fontWeight="700" fontSize="sm">{u.name}</Text>
                          <Text fontSize="xs" color="gray.500">{u.email || u.contact_no || "-"}</Text>
                        </Box>
                      </HStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{u.job_role || "-"}</Text>
                      <Badge colorScheme={u.is_admin ? "purple" : "gray"}>{String(u.role || "-").replace("_", " ")}</Badge>
                    </Td>
                    <Td fontSize="sm">{u.department || "-"}</Td>
                    <Td>
                      <Badge colorScheme={u.is_active ? "green" : "red"}>{u.is_active ? "Active" : "Inactive"}</Badge>
                    </Td>
                    <Td>
                      {u.is_admin ? (
                        <Badge colorScheme="purple">Full access</Badge>
                      ) : (
                        <HStack spacing={1}>
                          <Badge colorScheme={u.granted_count ? "blue" : "gray"}>
                            {u.granted_count} of {summary.total_permissions}
                          </Badge>
                          {u.is_marketing && (
                            <Badge colorScheme="green" variant="subtle" textTransform="none">
                              Marketing · {u.auto_count} auto
                            </Badge>
                          )}
                        </HStack>
                      )}
                    </Td>
                    <Td>
                      <HStack justify="flex-end" spacing={2}>
                        <Button size="xs" variant="outline" onClick={() => openDetail(u.id, "view")}>View</Button>
                        {!u.is_admin && (
                          <Button size="xs" colorScheme="blue" onClick={() => openDetail(u.id, "edit")}>Edit</Button>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {data?.totalPages > 1 && (
        <HStack justify="flex-end" mt={3}>
          <Button size="sm" isDisabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <Text fontSize="sm">Page {page} of {data.totalPages}</Text>
          <Button size="sm" isDisabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </HStack>
      )}

      <Drawer isOpen={!!openUser} onClose={() => setOpenUser(null)} placement="right" size="xl">
        <DrawerOverlay />
        <DrawerContent bg="gray.50">
          <DrawerCloseButton />
          <DrawerHeader borderBottom="1px solid" borderColor="gray.200" bg="white">
            {detail ? (
              <HStack spacing={3}>
                <Avatar size="sm" name={detail.user?.name} />
                <Box>
                  <Text fontSize="md">{detail.user?.name}</Text>
                  <Text fontSize="xs" fontWeight="400" color="gray.500">
                    {[detail.user?.job_role, detail.user?.department].filter(Boolean).join(" · ") || detail.user?.role}
                  </Text>
                </Box>
                <Badge colorScheme="blue" ml={2}>
                  {selected.size} selected{autoIds.size > 0 ? ` + ${autoIds.size} automatic` : ""}
                </Badge>
              </HStack>
            ) : "Loading..."}
          </DrawerHeader>
          <DrawerBody py={4}>
            {detail && autoIds.size > 0 && (
              <Box bg="green.50" border="1px solid" borderColor="green.200" borderRadius="lg" px={4} py={3} mb={4}>
          <Text fontSize="sm" fontWeight="700" color="green.800">Marketing department</Text>
          <Text fontSize="sm" color="green.800">
            {autoIds.size} Marketing APK permissions are automatic for this user (ticked and locked below).
            Approvals, settings and other office work still need to be assigned.
          </Text>
        </Box>
            )}
            {!detail ? (
              <Flex justify="center" py={12}><Spinner /></Flex>
            ) : editing ? (
              <PermissionEditor modules={detail.modules} selected={selected} onChange={setSelected} autoIds={autoIds} />
            ) : (
              <>
                {detail.is_admin && (
                  <Text color="gray.600" mb={4}>
                    Admin and Super Admin users automatically have every permission.
                  </Text>
                )}
                <PermissionSummary
                  modules={detail.modules}
                  selected={selected}
                  autoIds={autoIds}
                  emptyText="This user has no permissions assigned."
                />
              </>
            )}
          </DrawerBody>
          <DrawerFooter borderTop="1px solid" borderColor="gray.200" bg="white" gap={3}>
            <Button variant="outline" onClick={() => setOpenUser(null)}>Close</Button>
            {detail && !detail.is_admin && !editing && (
              <Button colorScheme="blue" onClick={() => setOpenUser({ ...openUser, mode: "edit" })}>
                Edit Permissions
              </Button>
            )}
            {editing && (
              <Button colorScheme="blue" isLoading={saving} onClick={save}>Save Permissions</Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default PermissionManagement;