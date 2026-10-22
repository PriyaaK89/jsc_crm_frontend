import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Textarea,
  VStack,
  useToast,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiChevronRight,
  FiMapPin,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUsers,
  FiX,
} from "react-icons/fi";

import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

/* =====================================================
   CONSTANTS & HELPERS
===================================================== */

const PRIMARY = "#237086";
const PRIMARY_HOVER = "#1B5A6B";
const BORDER = "gray.200";

const ROLE_LABELS = {
  ZSM: "Zonal Sales Manager",
  RSM: "Regional Sales Manager",
  ASM: "Area Sales Manager",
  TSM: "Territory Sales Manager",
  SM: "Sales Officer",
  FA: "Field Assistant",
};

const LEVEL_LABELS = {
  state: "State",
  district: "District",
  tehsil: "Tehsil",
  village: "Village",
};

const NAME_KEY = {
  state: "state_name",
  district: "district_name",
  tehsil: "tehsil_name",
  village: "village_name",
};

const errMsg = (error, fallback) =>
  error?.response?.data?.message || fallback;

const normalizeId = (id) => String(id ?? "");

const buildLabel = (item, levels) =>
  levels
    .map((level) => item[NAME_KEY[level]])
    .filter(Boolean)
    .join(" / ");

const getApiData = (res) => res?.data?.data || [];

const SectionCard = ({ children, ...props }) => (
  <Box
    bg="white"
    border="1px solid"
    borderColor={BORDER}
    borderRadius="xl"
    p={{ base: 4, md: 5 }}
    {...props}
  >
    {children}
  </Box>
);

/* =====================================================
   AREA PICKER

   unit   = what is being assigned
   levels = what is displayed for the selected role
===================================================== */

const AreaPicker = ({ unit, levels, selected, onChange }) => {
  const toast = useToast();

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [villages, setVillages] = useState([]);

  const [filters, setFilters] = useState({
    state_id: "",
    district_id: "",
    tehsil_id: "",
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState("");

  const showToast = (status, title, description) =>
    toast({
      status,
      title,
      description,
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });

  const fetchList = async (endpoint, params, setter) => {
    setLoading(true);
    setListError("");

    try {
      const res = await API.get(endpoint, { params });
      setter(getApiData(res));
    } catch (error) {
      setter([]);
      setListError(errMsg(error, "Failed to load areas. Please try again."));
      showToast(
        "error",
        "Unable to load areas",
        errMsg(error, "Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------- States ---------- */

  useEffect(() => {
    fetchList(API_ENDPOINTS.GEO_STATES, undefined, setStates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Districts ---------- */

  useEffect(() => {
    if (unit === "state") return;

    fetchList(
      API_ENDPOINTS.GEO_DISTRICTS,
      { state_id: filters.state_id || undefined },
      setDistricts
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, filters.state_id]);

  /* ---------- Tehsils ---------- */

  useEffect(() => {
    if (unit !== "tehsil" && unit !== "village") return;

    if (!filters.district_id) {
      setTehsils([]);
      return;
    }

    fetchList(
      API_ENDPOINTS.GEO_TEHSILS,
      { district_id: filters.district_id },
      setTehsils
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, filters.district_id]);

  /* ---------- Villages ---------- */

  useEffect(() => {
    if (unit !== "village") return;

    if (!filters.tehsil_id) {
      setVillages([]);
      return;
    }

    fetchList(
      API_ENDPOINTS.GEO_VILLAGES,
      {
        tehsil_id: filters.tehsil_id,
        limit: 2000,
      },
      setVillages
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, filters.tehsil_id]);

  /* ---------- Filters ---------- */

  const handleFilter = (name, value) => {
    setSearch("");
    setListError("");

    setFilters((prev) => {
      if (name === "state_id") {
        return {
          state_id: value,
          district_id: "",
          tehsil_id: "",
        };
      }

      if (name === "district_id") {
        return {
          ...prev,
          district_id: value,
          tehsil_id: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const showState = unit !== "state";
  const showDistrict = unit === "tehsil" || unit === "village";
  const showTehsil = unit === "village";

  const missingParent =
    (unit === "tehsil" && !filters.district_id) ||
    (unit === "village" &&
      (!filters.district_id || !filters.tehsil_id));

  const items =
    unit === "state"
      ? states
      : unit === "district"
        ? districts
        : unit === "tehsil"
          ? tehsils
          : villages;

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items
      .map((item) => ({
        ...item,
        label: buildLabel(item, levels),
      }))
      .filter((item) => {
        if (!query) return true;
        return item.label.toLowerCase().includes(query);
      });
  }, [items, levels, search]);

  /* ---------- Selection ---------- */

  const toggle = (item) => {
    const id = normalizeId(item.id);
    const next = { ...selected };

    if (next[id]) {
      delete next[id];
    } else {
      next[id] = {
        id: item.id,
        label: item.label,
      };
    }

    onChange(next);
  };

  const selectAllVisible = () => {
    const next = { ...selected };

    visible.forEach((item) => {
      next[normalizeId(item.id)] = {
        id: item.id,
        label: item.label,
      };
    });

    onChange(next);
  };

  const clearVisible = () => {
    const next = { ...selected };

    visible.forEach((item) => {
      delete next[normalizeId(item.id)];
    });

    onChange(next);
  };

  const allVisibleSelected =
    visible.length > 0 &&
    visible.every((item) => !!selected[normalizeId(item.id)]);

  const clearFilters = () => {
    setFilters({
      state_id: "",
      district_id: "",
      tehsil_id: "",
    });
    setSearch("");
  };

  return (
    <VStack align="stretch" spacing={5}>
      {/* Filter section */}

      {(showState || showDistrict || showTehsil) && (
        <Box>
          <HStack mb={3} spacing={2}>
            <Icon as={FiMapPin} color={PRIMARY} boxSize={4} />
            <Text fontSize="sm" fontWeight="700" color="gray.700">
              Filter areas
            </Text>
          </HStack>

          <SimpleGrid
            columns={{ base: 1, sm: 2, lg: 3 }}
            spacing={4}
          >
            {showState && (
              <FormControl>
                <FormLabel fontSize="sm">State</FormLabel>
                <Select
                  size="md"
                  borderRadius="lg"
                  placeholder="All states"
                  value={filters.state_id}
                  onChange={(e) =>
                    handleFilter("state_id", e.target.value)
                  }
                >
                  {states.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.state_name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            {showDistrict && (
              <FormControl isRequired>
                <FormLabel fontSize="sm">District</FormLabel>
                <Select
                  size="md"
                  borderRadius="lg"
                  placeholder="Select district"
                  value={filters.district_id}
                  onChange={(e) =>
                    handleFilter("district_id", e.target.value)
                  }
                >
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.district_name}
                      {district.state_name
                        ? ` (${district.state_name})`
                        : ""}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            {showTehsil && (
              <FormControl isRequired>
                <FormLabel fontSize="sm">Tehsil</FormLabel>
                <Select
                  size="md"
                  borderRadius="lg"
                  placeholder="Select tehsil"
                  value={filters.tehsil_id}
                  onChange={(e) =>
                    handleFilter("tehsil_id", e.target.value)
                  }
                  isDisabled={!filters.district_id}
                >
                  {tehsils.map((tehsil) => (
                    <option key={tehsil.id} value={tehsil.id}>
                      {tehsil.tehsil_name}
                    </option>
                  ))}
                </Select>
                {!filters.district_id && (
                  <FormHelperText>
                    Select a district first.
                  </FormHelperText>
                )}
              </FormControl>
            )}
          </SimpleGrid>
        </Box>
      )}

      <Divider borderColor="gray.100" />

      {/* Search and selection list */}

      <Box>
        <Flex
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap={2}
          mb={3}
        >
          <Box>
            <Text fontSize="sm" fontWeight="700" color="gray.700">
              Select {LEVEL_LABELS[unit]} areas
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              Choose one or more areas to assign to this employee.
            </Text>
          </Box>

          <Badge
            colorScheme="teal"
            borderRadius="full"
            px={3}
            py={1}
            whiteSpace="nowrap"
          >
            {visible.length} shown
          </Badge>
        </Flex>

        <InputGroup mb={3}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>

          <Input
            placeholder={`Search ${LEVEL_LABELS[unit].toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            isDisabled={missingParent || loading}
            borderRadius="lg"
            bg="gray.50"
            _focus={{
              bg: "white",
              borderColor: PRIMARY,
              boxShadow: `0 0 0 1px ${PRIMARY}`,
            }}
          />
        </InputGroup>

        <Flex
          gap={2}
          wrap="wrap"
          align="center"
          mb={3}
        >
          <Button
            size="sm"
            variant="outline"
            color={PRIMARY}
            borderColor="gray.300"
            leftIcon={<FiCheckCircle />}
            onClick={selectAllVisible}
            isDisabled={
              loading ||
              missingParent ||
              visible.length === 0 ||
              allVisibleSelected
            }
            _hover={{ bg: "gray.50" }}
          >
            Select all shown
          </Button>

          <Button
            size="sm"
            variant="ghost"
            leftIcon={<FiX />}
            onClick={clearVisible}
            isDisabled={
              loading ||
              missingParent ||
              !visible.some(
                (item) => !!selected[normalizeId(item.id)]
              )
            }
          >
            Clear shown
          </Button>

          <Button
            size="sm"
            variant="ghost"
            leftIcon={<FiRefreshCw />}
            onClick={clearFilters}
            isDisabled={
              loading ||
              (!filters.state_id &&
                !filters.district_id &&
                !filters.tehsil_id &&
                !search)
            }
          >
            Reset filters
          </Button>
        </Flex>

        <Box
          border="1px solid"
          borderColor="gray.200"
          borderRadius="xl"
          overflow="hidden"
        >
          <Flex
            px={4}
            py={3}
            bg="gray.50"
            borderBottom="1px solid"
            borderColor="gray.200"
            justify="space-between"
            align="center"
          >
            <Text fontSize="xs" fontWeight="700" color="gray.600">
              AVAILABLE AREAS
            </Text>

            <Text fontSize="xs" color="gray.500">
              {visible.filter(
                (item) => !!selected[normalizeId(item.id)]
              ).length}{" "}
              selected in this list
            </Text>
          </Flex>

          <Box
            p={4}
            maxH="320px"
            minH="140px"
            overflowY="auto"
          >
            {loading ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                minH="130px"
                gap={3}
              >
                <Spinner color={PRIMARY} size="md" />
                <Text fontSize="sm" color="gray.500">
                  Loading areas...
                </Text>
              </Flex>
            ) : missingParent ? (
              <Flex
                align="center"
                justify="center"
                direction="column"
                minH="110px"
                gap={2}
              >
                <Icon
                  as={FiMapPin}
                  boxSize={6}
                  color="gray.400"
                />
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  {unit === "tehsil"
                    ? "Select a district to view its tehsils."
                    : "Select a district and tehsil to view villages."}
                </Text>
              </Flex>
            ) : listError ? (
              <Flex
                align="center"
                justify="center"
                direction="column"
                minH="110px"
                gap={3}
              >
                <Text fontSize="sm" color="red.500" textAlign="center">
                  {listError}
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (unit === "state") {
                      fetchList(
                        API_ENDPOINTS.GEO_STATES,
                        undefined,
                        setStates
                      );
                    } else if (unit === "district") {
                      fetchList(
                        API_ENDPOINTS.GEO_DISTRICTS,
                        {
                          state_id: filters.state_id || undefined,
                        },
                        setDistricts
                      );
                    } else if (unit === "tehsil") {
                      fetchList(
                        API_ENDPOINTS.GEO_TEHSILS,
                        { district_id: filters.district_id },
                        setTehsils
                      );
                    } else if (unit === "village") {
                      fetchList(
                        API_ENDPOINTS.GEO_VILLAGES,
                        {
                          tehsil_id: filters.tehsil_id,
                          limit: 2000,
                        },
                        setVillages
                      );
                    }
                  }}
                >
                  Retry
                </Button>
              </Flex>
            ) : visible.length === 0 ? (
              <Flex
                align="center"
                justify="center"
                direction="column"
                minH="110px"
                gap={2}
              >
                <Icon as={FiSearch} boxSize={6} color="gray.400" />
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  {items.length === 0
                    ? "No areas available for the selected filter."
                    : "No matching areas found. Try another search."}
                </Text>
              </Flex>
            ) : (
              <SimpleGrid
                columns={{ base: 1, md: 2 }}
                spacing={3}
              >
                {visible.map((item) => {
                  const id = normalizeId(item.id);
                  const checked = !!selected[id];

                  return (
                    <Box
                      key={id}
                      border="1px solid"
                      borderColor={checked ? PRIMARY : "gray.200"}
                      borderRadius="lg"
                      p={3}
                      bg={checked ? "teal.50" : "white"}
                      transition="all 0.15s ease"
                      _hover={{
                        borderColor: PRIMARY,
                        bg: checked ? "teal.50" : "gray.50",
                      }}
                    >
                      <Checkbox
                        w="100%"
                        isChecked={checked}
                        onChange={() => toggle(item)}
                        colorScheme="teal"
                        sx={{
                          ".chakra-checkbox__label": {
                            width: "100%",
                            overflowWrap: "anywhere",
                          },
                        }}
                      >
                        <Text
                          fontSize="sm"
                          fontWeight={checked ? "600" : "400"}
                          color="gray.700"
                        >
                          {item.label}
                        </Text>
                      </Checkbox>
                    </Box>
                  );
                })}
              </SimpleGrid>
            )}
          </Box>
        </Box>
      </Box>
    </VStack>
  );
};

/* =====================================================
   MAIN PAGE
===================================================== */

const AssignArea = () => {
  const toast = useToast();

  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState("");
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [selected, setSelected] = useState({});
  const [initialCount, setInitialCount] = useState(0);

  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [coverageError, setCoverageError] = useState(null);
  const [overrideReason, setOverrideReason] = useState("");

  const cfg = roles.find((item) => item.role === role);
  const selectedList = Object.values(selected);

  const showToast = (status, title, description) =>
    toast({
      title,
      description,
      status,
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });

  /* ---------- Load roles ---------- */

  useEffect(() => {
    let active = true;

    const fetchRoles = async () => {
      try {
        const res = await API.get(
          API_ENDPOINTS.COLLECTION_AREA_CONFIG
        );

        if (active) {
          setRoles(getApiData(res));
        }
      } catch (error) {
        if (active) {
          showToast(
            "error",
            "Unable to load roles",
            errMsg(error, "Failed to load roles.")
          );
        }
      } finally {
        if (active) setLoadingRoles(false);
      }
    };

    fetchRoles();

    return () => {
      active = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Reset helpers ---------- */

  const resetSelection = () => {
    setSelected({});
    setInitialCount(0);
    setCoverageError(null);
    setOverrideReason("");
  };

  // Called only after a successful assignment API response.
  const resetFormAfterSuccess = () => {
    setRole("");
    setEmployeeId("");
    setEmployees([]);
    setSelected({});
    setInitialCount(0);
    setCoverageError(null);
    setOverrideReason("");
    setLoadingEmployees(false);
    setLoadingAreas(false);
  };

  /* ---------- Role -> Employees ---------- */

  const handleRoleChange = async (event) => {
    const value = event.target.value;

    setRole(value);
    setEmployeeId("");
    setEmployees([]);
    resetSelection();

    if (!value) return;

    try {
      setLoadingEmployees(true);

      const res = await API.get(
        API_ENDPOINTS.COLLECTION_AREA_EMPLOYEES,
        {
          params: { role: value },
        }
      );

      setEmployees(getApiData(res));
    } catch (error) {
      showToast(
        "error",
        "Unable to load employees",
        errMsg(error, "Failed to load employees.")
      );
    } finally {
      setLoadingEmployees(false);
    }
  };

  /* ---------- Employee -> Existing areas ---------- */

  const handleEmployeeChange = async (event) => {
    const value = event.target.value;

    setEmployeeId(value);
    resetSelection();

    if (!value) return;

    try {
      setLoadingAreas(true);

      const res = await API.get(
        API_ENDPOINTS.EMPLOYEE_COLLECTION_AREAS(value)
      );

      const areas = getApiData(res);
      const map = {};

      areas.forEach((area) => {
        map[normalizeId(area.area_id)] = {
          id: area.area_id,
          label: area.label,
        };
      });

      setSelected(map);
      setInitialCount(areas.length);
    } catch (error) {
      showToast(
        "error",
        "Unable to load assigned areas",
        errMsg(error, "Failed to load the employee's assigned areas.")
      );
    } finally {
      setLoadingAreas(false);
    }
  };

  /* ---------- Remove selected area ---------- */

  const removeSelected = (id) => {
    const key = normalizeId(id);

    setSelected((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    // If the warning was generated for an earlier selection,
    // remove it so the next save validates the current selection.
    setCoverageError(null);
    setOverrideReason("");
  };

  /* ---------- Submit assignment ---------- */

  const handleSubmit = async (withOverride = false) => {
    if (submitting) return;

    const ids = Object.values(selected).map((item) => Number(item.id));

    if (!role) {
      return showToast(
        "warning",
        "Role required",
        "Please select a role."
      );
    }

    if (!employeeId) {
      return showToast(
        "warning",
        "Employee required",
        "Please select an employee."
      );
    }

    if (loadingEmployees || loadingAreas) {
      return showToast(
        "info",
        "Please wait",
        "Wait until the employee's data has finished loading."
      );
    }

    if (ids.length === 0) {
      if (initialCount === 0) {
        return showToast(
          "warning",
          "No areas selected",
          "Select at least one area before saving."
        );
      }

      const confirmed = window.confirm(
        "No areas are selected. This will remove all assigned areas of this employee. Continue?"
      );

      if (!confirmed) return;
    }

    if (withOverride && overrideReason.trim().length < 5) {
      return showToast(
        "warning",
        "Override reason required",
        "Enter an override reason with at least 5 characters."
      );
    }

    const payload = {
      employee_id: Number(employeeId),
      role,
      area_ids: ids,
    };

    if (withOverride) {
      payload.override = {
        enabled: true,
        reason: overrideReason.trim(),
      };
    }

    try {
      setSubmitting(true);

      const res = await API.post(
        API_ENDPOINTS.ASSIGN_COLLECTION_AREAS,
        payload
      );

      // Reset the form ONLY after the assignment API succeeds.
      resetFormAfterSuccess();

      showToast(
        "success",
        "Assignment saved",
        res?.data?.message ||
          "Collection areas have been assigned successfully."
      );
    } catch (error) {
      const data = error?.response?.data;

      if (
        error?.response?.status === 422 &&
        data?.code === "OUTSIDE_MANAGER_COVERAGE"
      ) {
        // Keep the employee and selected areas so the user can
        // correct the selection or submit a permitted override.
        setCoverageError(data);

        showToast(
          "warning",
          "Manager coverage validation",
          data?.message ||
            "Some selected areas are outside the manager's coverage."
        );
      } else {
        // Preserve form values after any other API failure.
        showToast(
          "error",
          "Unable to save assignment",
          errMsg(error, "Failed to save collection areas.")
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Loading screen ---------- */

  if (loadingRoles) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="280px"
        gap={3}
      >
        <Spinner size="lg" color={PRIMARY} thickness="3px" />
        <Text fontSize="sm" color="gray.500">
          Loading collection area configuration...
        </Text>
      </Flex>
    );
  }

  const outsideIds = new Set(
    (coverageError?.outside_area_ids || []).map(normalizeId)
  );

  /* ---------- Render ---------- */

  return (
    <Box color="gray.700">
      {/* Page heading */}

      <Flex
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={3}
        mb={6}
      >
        <Box>
          <HStack spacing={2} mb={1}>
            <Flex
              align="center"
              justify="center"
              bg="teal.50"
              color={PRIMARY}
              borderRadius="lg"
              boxSize="40px"
            >
              <Icon as={FiMapPin} boxSize={5} />
            </Flex>

            <Heading
              size="md"
              color="gray.800"
              letterSpacing="-0.3px"
            >
              Assign Collection Areas
            </Heading>
          </HStack>

          <Text
            fontSize="sm"
            color="gray.500"
            mt={2}
            maxW="650px"
          >
            Assign geographical areas to employees according to
            their roles and manager coverage.
          </Text>
        </Box>

        <Badge
          colorScheme="teal"
          borderRadius="full"
          px={3}
          py={2}
          fontSize="xs"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Icon as={FiShield} />
          Role-based assignment
        </Badge>
      </Flex>

      <SimpleGrid
        columns={{ base: 1, xl: 3 }}
        spacing={5}
        alignItems="start"
      >
        {/* Main form */}

        <Box gridColumn={{ base: "auto", xl: "span 2" }}>
          <SectionCard>
            <HStack spacing={2} mb={1}>
              <Icon as={FiUsers} color={PRIMARY} boxSize={5} />
              <Heading size="sm" color="gray.800">
                Employee details
              </Heading>
            </HStack>

            <Text fontSize="sm" color="gray.500" mb={5}>
              Select the employee before choosing the areas to assign.
            </Text>

            <SimpleGrid
              columns={{ base: 1, md: 2 }}
              spacing={4}
              mb={5}
            >
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600">
                  Employee role
                </FormLabel>

                <Select
                  placeholder="Select role"
                  value={role}
                  onChange={handleRoleChange}
                  borderRadius="lg"
                  isDisabled={submitting}
                  _focus={{
                    borderColor: PRIMARY,
                    boxShadow: `0 0 0 1px ${PRIMARY}`,
                  }}
                >
                  {roles.map((item) => (
                    <option key={item.role} value={item.role}>
                      {ROLE_LABELS[item.role] || item.role} (
                      {item.role})
                    </option>
                  ))}
                </Select>

                <FormHelperText>
                  Determines the geographical level available for assignment.
                </FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600">
                  Employee
                </FormLabel>

                <Select
                  placeholder={
                    loadingEmployees
                      ? "Loading employees..."
                      : "Select employee"
                  }
                  value={employeeId}
                  onChange={handleEmployeeChange}
                  isDisabled={
                    !role || loadingEmployees || submitting
                  }
                  borderRadius="lg"
                  _focus={{
                    borderColor: PRIMARY,
                    boxShadow: `0 0 0 1px ${PRIMARY}`,
                  }}
                >
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                      {employee.contact_no
                        ? ` (${employee.contact_no})`
                        : ""}
                    </option>
                  ))}
                </Select>

                {role &&
                  !loadingEmployees &&
                  employees.length === 0 && (
                    <FormHelperText color="orange.500">
                      No employees found for this role.
                    </FormHelperText>
                  )}
              </FormControl>
            </SimpleGrid>

            {/* Role information */}

            {cfg && (
              <Box
                bg="gray.50"
                border="1px solid"
                borderColor="gray.100"
                borderRadius="lg"
                p={3}
                mb={5}
              >
                <Text fontSize="sm" color="gray.600">
                  <Text as="span" fontWeight="700" color="gray.800">
                    {ROLE_LABELS[role] || role}
                  </Text>{" "}
                  assignments are made at the{" "}
                  <Text
                    as="span"
                    color={PRIMARY}
                    fontWeight="700"
                  >
                    {LEVEL_LABELS[cfg.unit] || cfg.unit}
                  </Text>{" "}
                  level.
                </Text>

                <Text fontSize="xs" color="gray.500" mt={1}>
                  Display hierarchy:{" "}
                  {cfg.levels
                    .map((level) => LEVEL_LABELS[level] || level)
                    .join(" / ")}
                </Text>
              </Box>
            )}

            <Divider borderColor="gray.100" mb={5} />

            {/* Area selector */}

            {loadingAreas ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                py={10}
                gap={3}
              >
                <Spinner color={PRIMARY} size="lg" />
                <Text fontSize="sm" color="gray.500">
                  Loading previously assigned areas...
                </Text>
              </Flex>
            ) : cfg && employeeId ? (
              <AreaPicker
                key={`${role}-${employeeId}`}
                unit={cfg.unit}
                levels={cfg.levels}
                selected={selected}
                onChange={(next) => {
                  setSelected(next);

                  // A new selection needs fresh coverage validation.
                  if (coverageError) {
                    setCoverageError(null);
                    setOverrideReason("");
                  }
                }}
              />
            ) : (
              <Flex
                direction="column"
                align="center"
                justify="center"
                bg="gray.50"
                border="1px dashed"
                borderColor="gray.300"
                borderRadius="xl"
                minH="190px"
                px={5}
                py={8}
                textAlign="center"
                gap={3}
              >
                <Flex
                  align="center"
                  justify="center"
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="full"
                  boxSize="48px"
                >
                  <Icon as={FiMapPin} boxSize={5} color="gray.400" />
                </Flex>

                <Text fontWeight="600" color="gray.700">
                  Choose a role and employee
                </Text>

                <Text fontSize="sm" color="gray.500" maxW="350px">
                  The geographical area selector will appear here
                  after you select an employee.
                </Text>
              </Flex>
            )}

            {/* Manager coverage validation */}

            {coverageError && (
              <Alert
                status="warning"
                borderRadius="xl"
                mt={5}
                alignItems="flex-start"
                variant="left-accent"
              >
                <AlertIcon mt={1} />

                <Box flex="1" minW={0}>
                  <Text fontWeight="700" fontSize="sm">
                    Manager coverage validation
                  </Text>

                  <AlertDescription
                    fontSize="sm"
                    mt={1}
                    overflowWrap="anywhere"
                  >
                    {coverageError.message ||
                      "Some selected areas are outside the manager's coverage."}
                  </AlertDescription>

                  {outsideIds.size > 0 && (
                    <Text fontSize="xs" color="gray.600" mt={2}>
                      {outsideIds.size} area(s) are outside the permitted
                      coverage. Affected selections are highlighted below.
                    </Text>
                  )}

                  {coverageError.can_override ? (
                    <Box mt={4}>
                      <FormControl
                        isRequired
                        isInvalid={
                          overrideReason.length > 0 &&
                          overrideReason.trim().length < 5
                        }
                      >
                        <FormLabel fontSize="sm" fontWeight="600">
                          Reason for override
                        </FormLabel>

                        <Textarea
                          value={overrideReason}
                          onChange={(e) =>
                            setOverrideReason(e.target.value)
                          }
                          placeholder="Explain why these areas need to be assigned outside the manager's coverage."
                          bg="white"
                          borderRadius="lg"
                          rows={3}
                          maxLength={1000}
                          isDisabled={submitting}
                        />

                        <FormErrorMessage>
                          Enter at least 5 characters.
                        </FormErrorMessage>

                        <FormHelperText>
                          Minimum 5 characters. This reason will be sent
                          with the override request.
                        </FormHelperText>
                      </FormControl>

                      <Button
                        mt={3}
                        size="md"
                        colorScheme="orange"
                        onClick={() => handleSubmit(true)}
                        isLoading={submitting}
                        loadingText="Saving override..."
                        isDisabled={
                          submitting ||
                          overrideReason.trim().length < 5
                        }
                      >
                        Save with override
                      </Button>
                    </Box>
                  ) : (
                    <Text fontSize="sm" mt={3} fontWeight="500">
                      This assignment cannot be overridden with your
                      current permissions. Change the selected areas
                      or contact a Super Admin.
                    </Text>
                  )}
                </Box>
              </Alert>
            )}

            {/* Form actions */}

            <Divider borderColor="gray.100" mt={6} mb={4} />

            <Flex
              justify="space-between"
              align={{ base: "stretch", sm: "center" }}
              direction={{ base: "column", sm: "row" }}
              gap={3}
            >
              <Text fontSize="xs" color="gray.500">
                {initialCount > 0
                  ? `${initialCount} area(s) were previously assigned. Saving updates the assignment.`
                  : "Changes are applied when you save the assignment."}
              </Text>

              <HStack
                justify={{ base: "stretch", sm: "flex-end" }}
                spacing={3}
              >
                <Button
                  variant="outline"
                  borderColor="gray.300"
                  onClick={resetFormAfterSuccess}
                  isDisabled={
                    submitting ||
                    (!role &&
                      !employeeId &&
                      selectedList.length === 0)
                  }
                  leftIcon={<FiRefreshCw />}
                >
                  Reset form
                </Button>

                <Button
                  bg={PRIMARY}
                  color="white"
                  _hover={{
                    bg: PRIMARY_HOVER,
                    transform: "translateY(-1px)",
                    boxShadow: "md",
                  }}
                  _active={{ transform: "translateY(0)" }}
                  borderRadius="lg"
                  px={6}
                  onClick={() => handleSubmit(false)}
                  isLoading={submitting}
                  loadingText="Saving..."
                  isDisabled={
                    !role ||
                    !employeeId ||
                    loadingEmployees ||
                    loadingAreas
                  }
                  leftIcon={<FiCheckCircle />}
                >
                  {selectedList.length === 0 && initialCount > 0
                    ? "Clear assigned areas"
                    : "Save assignment"}
                </Button>
              </HStack>
            </Flex>
          </SectionCard>
        </Box>

        {/* Selected areas panel */}

        <Box>
          <SectionCard
            position={{ base: "static", xl: "sticky" }}
            top="100px"
          >
            <Flex
              justify="space-between"
              align="center"
              gap={2}
              mb={2}
            >
              <HStack spacing={2}>
                <Icon as={FiMapPin} color={PRIMARY} boxSize={5} />
                <Heading size="sm" color="gray.800">
                  Selected areas
                </Heading>
              </HStack>

              <Badge
                colorScheme={selectedList.length ? "teal" : "gray"}
                borderRadius="full"
                px={3}
                py={1}
              >
                {selectedList.length}
              </Badge>
            </Flex>

            <Text fontSize="sm" color="gray.500" mb={4}>
              Review your selection before saving.
            </Text>

            <Divider borderColor="gray.100" mb={4} />

            <SimpleGrid columns={2} spacing={3} mb={4}>
              <Box
                bg="gray.50"
                borderRadius="lg"
                p={3}
              >
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Selected
                </Text>
                <Heading size="md" color="gray.800">
                  {selectedList.length}
                </Heading>
              </Box>

              <Box
                bg="gray.50"
                borderRadius="lg"
                p={3}
              >
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Previously saved
                </Text>
                <Heading size="md" color="gray.800">
                  {initialCount}
                </Heading>
              </Box>
            </SimpleGrid>

            {!employeeId ? (
              <Flex
                direction="column"
                align="center"
                textAlign="center"
                py={7}
                gap={2}
              >
                <Icon as={FiUsers} boxSize={7} color="gray.300" />
                <Text fontSize="sm" fontWeight="600" color="gray.600">
                  No employee selected
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Select an employee to view assigned areas.
                </Text>
              </Flex>
            ) : selectedList.length === 0 ? (
              <Flex
                direction="column"
                align="center"
                textAlign="center"
                py={7}
                gap={2}
              >
                <Icon as={FiMapPin} boxSize={7} color="gray.300" />
                <Text fontSize="sm" fontWeight="600" color="gray.600">
                  No areas selected
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Select areas from the list to see them here.
                </Text>
              </Flex>
            ) : (
              <Box maxH="420px" overflowY="auto" pr={1}>
                <Wrap spacing={2}>
                  {selectedList.map((area) => {
                    const outside = outsideIds.has(
                      normalizeId(area.id)
                    );

                    return (
                      <WrapItem key={normalizeId(area.id)}>
                        <Tag
                          size="md"
                          borderRadius="lg"
                          py={2}
                          px={2}
                          maxW="100%"
                          colorScheme={outside ? "red" : "teal"}
                          variant={outside ? "solid" : "subtle"}
                          whiteSpace="normal"
                          alignItems="flex-start"
                        >
                          <TagLabel
                            whiteSpace="normal"
                            overflowWrap="anywhere"
                            lineHeight="1.5"
                          >
                            {area.label}
                            {outside && (
                              <Text
                                as="span"
                                display="block"
                                fontSize="10px"
                                fontWeight="700"
                              >
                                Outside manager coverage
                              </Text>
                            )}
                          </TagLabel>

                          <TagCloseButton
                            mt={0.5}
                            onClick={() => removeSelected(area.id)}
                            aria-label={`Remove ${area.label}`}
                            isDisabled={submitting}
                          />
                        </Tag>
                      </WrapItem>
                    );
                  })}
                </Wrap>
              </Box>
            )}

            {selectedList.length > 0 && (
              <Button
                mt={4}
                size="sm"
                variant="outline"
                colorScheme="red"
                width="100%"
                leftIcon={<FiX />}
                onClick={() => {
                  setSelected({});
                  setCoverageError(null);
                  setOverrideReason("");
                }}
                isDisabled={submitting}
              >
                Clear selection
              </Button>
            )}

            <Divider borderColor="gray.100" my={4} />

            <HStack align="flex-start" spacing={2}>
              <Icon
                as={FiShield}
                color="gray.400"
                mt={0.5}
                boxSize={4}
              />
              <Text fontSize="xs" color="gray.500" lineHeight="1.6">
                Assignments may be checked against the employee's
                manager coverage. If an exception is permitted, a
                reason is required.
              </Text>
            </HStack>
          </SectionCard>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default AssignArea;