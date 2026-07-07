import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Spinner,
  Switch,
  Text,
  Wrap,
  WrapItem,
  useToast,
  useOutsideClick,
  VStack,
} from "@chakra-ui/react";

import { useEffect, useRef, useState } from "react";
import { SearchIcon, CloseIcon, ChevronDownIcon, CalendarIcon } from "@chakra-ui/icons";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";

const VISIT_TYPES = ["farmer", "retailer", "distributor"];

const emptyTargets = { farmer: "", retailer: "", distributor: "" };

const TemplateFormModal = ({ isOpen, onClose, templateId, onSuccess }) => {
  const toast = useToast();
  const isEditMode = Boolean(templateId);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [form, setForm] = useState({
    template_name: "",
    frequency: "MONTHLY",
    is_recurring: true,
    start_date: "",
    end_date: "",
    employee_ids: [],
  });

  const [targets, setTargets] = useState(emptyTargets);

  // ==============================
  // EMPLOYEE DROPDOWN STATE
  // ==============================
  const [empSearch, setEmpSearch] = useState("");
  const [empDropdownOpen, setEmpDropdownOpen] = useState(false);
  const empDropdownRef = useRef(null);

  useOutsideClick({
    ref: empDropdownRef,
    handler: () => setEmpDropdownOpen(false),
  });

  // ==============================
  // LOAD EMPLOYEE DROPDOWN
  // ==============================
  const getEmployees = async () => {
    try {
      setUsersLoading(true);

      const response = await API.get(API_ENDPOINTS?.get_user_list);

      if (response?.status === 200) {
        // NOTE: adjust this mapping once you see the real response shape —
        // falls back across a few common field-name variants for now.
        const raw = response?.data?.data || response?.data || [];

        const normalized = raw.map((u) => ({
          id: u.id ?? u.user_id ?? u.value,
          name: u.name ?? u.user_name ?? u.full_name ?? u.label,
        }));

        setEmployeeOptions(normalized);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setUsersLoading(false);
    }
  };

  // ==============================
  // LOAD EXISTING TEMPLATE (edit mode)
  // ==============================
  const getTemplateDetail = async () => {
    try {
      setLoading(true);

      const response = await API.get(API_ENDPOINTS.GET_TEMPLATE_BY_ID(templateId));

      if (response?.status === 200) {
        const data = response?.data?.data;

        setForm({
          template_name: data?.template_name || "",
          frequency: data?.frequency || "MONTHLY",
          is_recurring: Boolean(data?.is_recurring),
          start_date: data?.start_date?.substring(0, 10) || "",
          end_date: data?.end_date?.substring(0, 10) || "",
          employee_ids: data?.employees?.map((e) => String(e.id)) || [],
        });

        const targetMap = { ...emptyTargets };
        data?.targets?.forEach((t) => {
          targetMap[t.visit_type] = t.target_value;
        });
        setTargets(targetMap);
      }
    } catch (error) {
      console.log(error);

      toast({
        title: "Error",
        description: "Failed to load template",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    getEmployees();

    if (isEditMode) {
      getTemplateDetail();
    } else {
      setForm({
        template_name: "",
        frequency: "MONTHLY",
        is_recurring: true,
        start_date: "",
        end_date: "",
        employee_ids: [],
      });
      setTargets(emptyTargets);
    }
    setEmpSearch("");
    setEmpDropdownOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, templateId]);

  // ==============================
  // HANDLERS
  // ==============================
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTargetChange = (visitType, value) => {
    setTargets((prev) => ({ ...prev, [visitType]: value }));
  };

  // ---- employee multi-select helpers ----
  const toggleEmployee = (id) => {
    const idStr = String(id);
    setForm((prev) => {
      const exists = prev.employee_ids.includes(idStr);
      return {
        ...prev,
        employee_ids: exists
          ? prev.employee_ids.filter((e) => e !== idStr)
          : [...prev.employee_ids, idStr],
      };
    });
  };

  const removeEmployee = (id) => {
    const idStr = String(id);
    setForm((prev) => ({
      ...prev,
      employee_ids: prev.employee_ids.filter((e) => e !== idStr),
    }));
  };

  const getEmployeeName = (id) => {
    const emp = employeeOptions.find((e) => String(e.id) === String(id));
    return emp?.name || "Unknown";
  };

  const filteredEmployeeOptions = employeeOptions.filter((emp) =>
    emp.name?.toLowerCase().includes(empSearch.toLowerCase())
  );

  const validate = () => {
    if (!form.template_name.trim()) return "Template name is required";
    if (!form.start_date || !form.end_date) return "Start and end date are required";
    if (form.start_date > form.end_date) return "Start date must be before end date";
    if (form.employee_ids.length === 0) return "Select at least one employee";

    const hasAtLeastOneTarget = VISIT_TYPES.some(
      (type) => targets[type] !== "" && Number(targets[type]) > 0
    );
    if (!hasAtLeastOneTarget) return "Enter at least one visit-type target";

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();

    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const payload = {
      template_name: form.template_name,
      frequency: form.frequency,
      is_recurring: form.is_recurring,
      start_date: form.start_date,
      end_date: form.end_date,
      employee_ids: form.employee_ids.map(Number),
      targets: VISIT_TYPES.filter(
        (type) => targets[type] !== "" && Number(targets[type]) > 0
      ).map((type) => ({
        visit_type: type,
        target_value: Number(targets[type]),
      })),
    };

    try {
      setSaving(true);

      if (isEditMode) {
        await API.put(API_ENDPOINTS.UPDATE_TEMPLATE_BY_ID(templateId), payload);
      } else {
        await API.post(API_ENDPOINTS?.CREATE_VISIT_TARGET_TEMPLATE, payload);
      }

      toast({
        title: "Success",
        description: `Template ${isEditMode ? "updated" : "created"} successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.log(error);

      const conflicts = error?.response?.data?.conflicts;

      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          (conflicts
            ? "Some employees already have an active target for this period"
            : `Failed to ${isEditMode ? "update" : "create"} template`),
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const FREQUENCY_COLORS = {
    DAILY: "orange",
    WEEKLY: "purple",
    FORTNIGHT: "teal",
    MONTHLY: "blue",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside" isCentered>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(2px)" />
      <ModalContent borderRadius="16px" overflow="hidden">
        <ModalHeader
          bg="linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)"
          color="white"
          py={5}
        >
          <VStack spacing={4} alignItems="baseline">
          <Text fontSize="16px" fontWeight="500">
            {isEditMode ? "Edit Target Template" : "Create Target Template"}
          </Text>
          <Text fontSize="10px" fontWeight="400" color="whiteAlpha.800" mt={1}>
            {isEditMode
              ? "Update targets and assigned employees"
              : "Set up visit targets for your field team"}
          </Text></VStack>
        </ModalHeader>
        <ModalCloseButton color="white" top={5} />

        <ModalBody bg="gray.50" py={6}>
          {loading ? (
            <Flex justify="center" align="center" py={16}>
              <Spinner size="lg" color="blue.500" thickness="3px" />
            </Flex>
          ) : (
            <>
              {/* ---- Basic Details Card ---- */}
              <Box bg="white" borderRadius="12px" p={5} mb={4} boxShadow="sm" border="1px solid" borderColor="gray.100">
                <Text fontSize="12px" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.5px" mb={4}>
                  Basic Details
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="13px" fontWeight="600" color="gray.700">
                      Template Name
                    </FormLabel>
                    <Input
                      value={form.template_name}
                      onChange={(e) => handleChange("template_name", e.target.value)}
                      placeholder="e.g. Visit Target"
                      bg="gray.50"
                      borderRadius="8px"
                      _focus={{ bg: "white", borderColor: "blue.400", boxShadow: "0 0 0 1px #4299E1" }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="13px" fontWeight="600" color="gray.700">
                      Frequency
                    </FormLabel>
                    <Flex align="center" gap={2}>
                      <Select
                        value={form.frequency}
                        onChange={(e) => handleChange("frequency", e.target.value)}
                        bg="gray.50"
                        borderRadius="8px"
                        _focus={{ bg: "white", borderColor: "blue.400" }}
                      >
                        {/* <option value="DAILY">Daily</option> */}
                        <option value="WEEKLY">Weekly</option>
                        <option value="FORTNIGHT">Fortnightly</option>
                        <option value="MONTHLY">Monthly</option>
                      </Select>
                      <Badge
                        colorScheme={FREQUENCY_COLORS[form.frequency]}
                        borderRadius="6px"
                        px={2}
                        py={1}
                        fontSize="10px"
                        whiteSpace="nowrap"
                      >
                        {form.frequency}
                      </Badge>
                    </Flex>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="13px" fontWeight="600" color="gray.700">
                      Start Date
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <CalendarIcon color="gray.400" fontSize="13px" />
                      </InputLeftElement>
                      <Input
                        type="date"
                        value={form.start_date}
                        onChange={(e) => handleChange("start_date", e.target.value)}
                        bg="gray.50"
                        borderRadius="8px"
                        _focus={{ bg: "white", borderColor: "blue.400" }}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="13px" fontWeight="600" color="gray.700">
                      End Date
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <CalendarIcon color="gray.400" fontSize="13px" />
                      </InputLeftElement>
                      <Input
                        type="date"
                        value={form.end_date}
                        onChange={(e) => handleChange("end_date", e.target.value)}
                        bg="gray.50"
                        borderRadius="8px"
                        _focus={{ bg: "white", borderColor: "blue.400" }}
                      />
                    </InputGroup>
                  </FormControl>
                </SimpleGrid>

                <Divider mb={4} />

                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <FormLabel fontSize="13px" fontWeight="600" color="gray.700" mb={0}>
                      Recurring Template
                    </FormLabel>
                    <Text fontSize="12px" color="gray.500">
                      Auto-continue into the next period
                    </Text>
                  </Box>
                  <Switch
                    isChecked={form.is_recurring}
                    onChange={(e) => handleChange("is_recurring", e.target.checked)}
                    colorScheme="blue"
                    size="lg"
                  />
                </FormControl>
              </Box>

              {/* ---- Targets Card ---- */}
              <Box bg="white" borderRadius="12px" p={5} mb={4} boxShadow="sm" border="1px solid" borderColor="gray.100">
                <Text fontSize="12px" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.5px" mb={4}>
                  Visit-type Targets (per period)
                </Text>

                <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                  {VISIT_TYPES.map((type) => (
                    <FormControl key={type}>
                      <FormLabel fontSize="13px" fontWeight="600" color="gray.700" textTransform="capitalize">
                        {type}
                      </FormLabel>
                      <Input
                        type="number"
                        min={0}
                        value={targets[type]}
                        onChange={(e) => handleTargetChange(type, e.target.value)}
                        placeholder="0"
                        bg="gray.50"
                        borderRadius="8px"
                        textAlign="center"
                        fontWeight="600"
                        _focus={{ bg: "white", borderColor: "blue.400" }}
                      />
                    </FormControl>
                  ))}
                </SimpleGrid>
              </Box>

              {/* ---- Employee Assignment Card ---- */}
              <Box bg="white" borderRadius="12px" p={5} boxShadow="sm" border="1px solid" borderColor="gray.100">
                <Flex justify="space-between" align="center" mb={4}>
                  <Text fontSize="12px" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.5px">
                    Assign Employees
                  </Text>
                  {form.employee_ids.length > 0 && (
                    <Badge colorScheme="blue" borderRadius="full" px={2}>
                      {form.employee_ids.length} selected
                    </Badge>
                  )}
                </Flex>

                <Box position="relative" ref={empDropdownRef}>
                  {/* Input that shows selected chips + search */}
                  <Flex
                    wrap="wrap"
                    align="center"
                    gap={2}
                    minH="44px"
                    px={3}
                    py={2}
                    bg="gray.50"
                    border="1px solid"
                    borderColor={empDropdownOpen ? "blue.400" : "gray.200"}
                    borderRadius="8px"
                    cursor="text"
                    onClick={() => setEmpDropdownOpen(true)}
                    boxShadow={empDropdownOpen ? "0 0 0 1px #4299E1" : "none"}
                    transition="all 0.15s"
                  >
                    {form.employee_ids.map((id) => (
                      <Flex
                        key={id}
                        align="center"
                        bg="blue.50"
                        color="blue.700"
                        borderRadius="6px"
                        pl={2}
                        pr={1}
                        py={1}
                        fontSize="13px"
                        fontWeight="500"
                        gap={1}
                      >
                        {getEmployeeName(id)}
                        <Icon
                          as={CloseIcon}
                          boxSize="8px"
                          ml={1}
                          cursor="pointer"
                          color="blue.500"
                          _hover={{ color: "red.500" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeEmployee(id);
                          }}
                        />
                      </Flex>
                    ))}

                    <Input
                      value={empSearch}
                      onChange={(e) => {
                        setEmpSearch(e.target.value);
                        setEmpDropdownOpen(true);
                      }}
                      onFocus={() => setEmpDropdownOpen(true)}
                      placeholder={form.employee_ids.length === 0 ? "Search and select employees..." : ""}
                      variant="unstyled"
                      flex="1"
                      minW="120px"
                      fontSize="14px"
                    />

                    <Icon as={ChevronDownIcon} color="gray.400" />
                  </Flex>

                  {/* Dropdown list */}
                  {empDropdownOpen && (
                    <Box
                      position="absolute"
                      top="calc(100% + 4px)"
                      left={0}
                      right={0}
                      bg="white"
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="8px"
                      boxShadow="lg"
                      maxH="220px"
                      overflowY="auto"
                      zIndex={20}
                    >
                      {usersLoading ? (
                        <Flex justify="center" py={4}>
                          <Spinner size="sm" color="blue.500" />
                        </Flex>
                      ) : filteredEmployeeOptions.length > 0 ? (
                        filteredEmployeeOptions.map((emp) => {
                          const checked = form.employee_ids.includes(String(emp.id));
                          return (
                            <Flex
                              key={emp.id}
                              align="center"
                              px={3}
                              py={2}
                              cursor="pointer"
                              bg={checked ? "blue.50" : "white"}
                              _hover={{ bg: checked ? "blue.50" : "gray.50" }}
                              onClick={() => toggleEmployee(emp.id)}
                            >
                              <Checkbox
                                isChecked={checked}
                                pointerEvents="none"
                                colorScheme="blue"
                                mr={3}
                              />
                              <Text fontSize="14px" color="gray.700">
                                {emp.name}
                              </Text>
                            </Flex>
                          );
                        })
                      ) : (
                        <Text fontSize="13px" color="gray.500" px={3} py={3}>
                          No employees found
                        </Text>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            </>
          )}
        </ModalBody>

        <ModalFooter bg="white" borderTop="1px solid" borderColor="gray.100">
          <Button variant="ghost" border="1px solid grey" mr={3} onClick={onClose} borderRadius="8px" fontSize="14px" fontWeight="500">
            Cancel
          </Button>
          <Button
            bg="blue.600"
            color="white" fontSize="14px" fontWeight="500"
            _hover={{ bg: "blue.700" }}
            onClick={handleSubmit}
            isLoading={saving}
            borderRadius="8px"
            px={6}
          >
            {isEditMode ? "Save Changes" : "Create Template"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TemplateFormModal;