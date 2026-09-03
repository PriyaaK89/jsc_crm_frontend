import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Select,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Flex,
  Spinner,
  Badge,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  NumberInput,
  NumberInputField,
  useToast,
  Icon,
} from "@chakra-ui/react";
import {
  WarningIcon,
  CheckCircleIcon,
  EditIcon,
  ChatIcon,
  LockIcon,
} from "@chakra-ui/icons";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const LABELS = {
  SALARY: "Salary",
  TA: "TA",
  DA: "DA",
  HOTEL: "Hotel Expense",
  OTHER: "Other Expense",
  BUS_TRAIN_TOLL: "Bus/Train/Toll Expense",
};

const TYPE_ORDER = ["SALARY", "TA", "DA", "HOTEL", "OTHER", "BUS_TRAIN_TOLL"];

// Modal step machine:
// action: 'EDIT' | 'HOLD' | 'UNHOLD'
// step:   'AMOUNT' | 'REASON' | 'CONFIRM' | 'SUCCESS'
const initialModalState = {
  open: false,
  action: null,
  step: null,
  type: null,
  originalAmount: 0,
  amount: "",
  reason: "",
  submitting: false,
};

const formatAmount = (val) =>
  Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const EmpPaymentHold = () => {
  const toast = useToast();

  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState("");

  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [monthLocked, setMonthLocked] = useState(false);
  const [grossSalary, setGrossSalary] = useState(0);
  const [netSalary, setNetSalary] = useState(0);
  const [rows, setRows] = useState([]);

  const [modal, setModal] = useState(initialModalState);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await API.get(API_ENDPOINTS.get_user_list);
        setEmployees(res.data?.data || res.data || []);
      } catch (err) {
        toast({
          title: "Failed to load employees",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showError = (err, fallback) => {
    const message = err?.response?.data?.message || fallback || "Something went wrong";
    toast({ title: message, status: "error", duration: 4000, isClosable: true });
  };

  const handleSearch = async () => {
    if (!employeeId || !date) {
      toast({
        title: "Please select employee and date",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSearching(true);
    setSearched(false);

    try {
      const res = await API.get(API_ENDPOINTS.PAYMENT_HOLD_SEARCH, {
        params: { employee_id: employeeId, date },
      });

      const data = res.data;
      setEmployee(data.employee);
      setMonthLocked(!!data.month_locked);
      setGrossSalary(data.gross_salary || 0);
      setNetSalary(data.net_salary || 0);

      const sortedRows = [...data.data].sort(
        (a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
      );
      setRows(sortedRows);
      setSearched(true);
    } catch (err) {
      setRows([]);
      showError(err, "No salary record found for this employee on this date");
    } finally {
      setSearching(false);
    }
  };

  const refreshAfterAction = async () => {
    // Re-pull the row data so amounts/status/reasons reflect the latest state.
    try {
      const res = await API.get(API_ENDPOINTS.PAYMENT_HOLD_SEARCH, {
        params: { employee_id: employeeId, date },
      });
      const data = res.data;
      setGrossSalary(data.gross_salary || 0);
      setNetSalary(data.net_salary || 0);
      const sortedRows = [...data.data].sort(
        (a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
      );
      setRows(sortedRows);
    } catch (err) {
      showError(err, "Failed to refresh data");
    }
  };

  // ---------- Modal open handlers ----------

  const openEditModal = (row) => {
    if (monthLocked) {
      toast({ title: "This month is locked", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (row.status === "HOLD") {
      toast({
        title: "This item is on hold. Unhold it before editing the amount.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    setModal({
      ...initialModalState,
      open: true,
      action: "EDIT",
      step: "AMOUNT",
      type: row.type,
      originalAmount: row.amount,
      amount: String(row.amount),
    });
  };

  const openHoldModal = (row) => {
    if (monthLocked) {
      toast({ title: "This month is locked", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setModal({
      ...initialModalState,
      open: true,
      action: "HOLD",
      step: "REASON",
      type: row.type,
      originalAmount: row.amount,
    });
  };

  const openUnholdModal = (row) => {
    if (monthLocked) {
      toast({ title: "This month is locked", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setModal({
      ...initialModalState,
      open: true,
      action: "UNHOLD",
      step: "CONFIRM",
      type: row.type,
      originalAmount: row.amount,
    });
  };

  const closeModal = () => setModal(initialModalState);

  // ---------- Modal step transitions ----------

  const handleAmountNext = () => {
    const parsed = parseFloat(modal.amount);
    if (modal.amount === "" || isNaN(parsed) || parsed < 0) {
      toast({ title: "Please enter a valid amount", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    // Reason is only required when the amount actually changes (matches
    // the backend's updateAmount check), so unchanged edits skip straight
    // to confirmation.
    const amountChanged = parsed !== Number(modal.originalAmount);
    setModal((m) => ({
      ...m,
      step: amountChanged ? "REASON" : "CONFIRM",
      reason: amountChanged ? m.reason : "",
    }));
  };

  const handleReasonNext = () => {
    if (!modal.reason.trim()) {
      toast({ title: "Please enter a reason", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setModal((m) => ({ ...m, step: "CONFIRM" }));
  };

  const handleConfirm = async () => {
    setModal((m) => ({ ...m, submitting: true }));

    try {
      if (modal.action === "EDIT") {
        await API.put(API_ENDPOINTS?.PAYMENT_UPDATE_AMOUNT, {
          employee_id: employeeId,
          date,
          type: modal.type,
          amount: parseFloat(modal.amount),
          reason: modal.reason || undefined,
        });
      } else {
        await API.put(API_ENDPOINTS.PAYMENT_HOLD_TOGGLE_STATUS, {
          employee_id: employeeId,
          date,
          type: modal.type,
          status: modal.action === "HOLD" ? "HOLD" : "UNHOLD",
          reason: modal.action === "HOLD" ? modal.reason : undefined,
        });
      }

      setModal((m) => ({ ...m, submitting: false, step: "SUCCESS" }));
      await refreshAfterAction();
    } catch (err) {
      setModal((m) => ({ ...m, submitting: false }));
      showError(err, "Action failed");
    }
  };

  const handleSuccessClose = () => {
    closeModal();
  };

  // ---------- Render helpers ----------

  const successMessage =
    modal.action === "EDIT"
      ? "Amount Successfully updated!!!"
      : modal.action === "HOLD"
      ? "Payment held successfully!"
      : "Payment unheld successfully!";

  const modalTypeLabel = modal.type ? LABELS[modal.type] : "";

  return (
    <Box p={0}>
      {/* Search box left completely untouched, per request */}
      <Box className="search_box" border="1px solid" borderColor="gray.200" borderRadius="md" p={4} mb={4}>
        <Flex gap={4} flexDirection="row" justifyContent="center" alignItems="end">
          <FormControl isRequired>
            <FormLabel>Employee Name:</FormLabel>
            <Select
              placeholder="Select employee"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Date:</FormLabel>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FormControl>

          <Button colorScheme="blue" onClick={handleSearch} padding="0 3rem" height="36px" isLoading={searching} fontWeight="500" fontSize="14px">
            Search
          </Button>
        </Flex>
      </Box>

      {searching && (
        <Flex justify="center" py={12}>
          <Spinner size="lg" thickness="3px" color="blue.500" />
        </Flex>
      )}

      {searched && !searching && (
        <Box
          border="1px solid"
          borderColor="gray.100"
          borderRadius="xl"
          boxShadow="sm"
          bg="white"
          overflow="hidden"
        >
          {/* Summary header bar */}
          <Flex
            justify="space-between"
            align="center"
            px={5}
            py={4}
            bg="gray.50"
            borderBottom="1px solid"
            borderColor="gray.100"
            flexWrap="wrap"
            gap={3}
          >
            <Flex align="center" gap={2}>
              <Heading size="sm" color="gray.700">
                Salary Information
              </Heading>
              {employee?.name && (
                <Badge colorScheme="blue" borderRadius="full" px={2} fontSize="0.7rem">
                  {employee.name}
                </Badge>
              )}
            </Flex>

            <Flex gap={6} align="center" flexWrap="wrap">
              <Box textAlign="right">
                <Text fontSize="xs" color="gray.500" mb={0}>
                  Gross Salary
                </Text>
                <Text fontWeight="bold" fontSize="md" color="gray.700">
                  ₹{formatAmount(grossSalary)}
                </Text>
              </Box>
              <Divider orientation="vertical" h="30px" />
              <Box textAlign="right">
                <Text fontSize="xs" color="gray.500" mb={0}>
                  Net Salary
                </Text>
                <Text fontWeight="bold" fontSize="md" color="green.600">
                  ₹{formatAmount(netSalary)}
                </Text>
              </Box>
              {monthLocked && (
                <Badge colorScheme="red" display="flex" alignItems="center" gap={1} px={3} py={1} borderRadius="full">
                  <Icon as={LockIcon} boxSize={2.5} />
                  Month Locked
                </Badge>
              )}
            </Flex>
          </Flex>

          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg="gray.50">
                  <Th color="gray.500" fontSize="0.7rem">Type</Th>
                  <Th color="gray.500" fontSize="0.7rem">Amount</Th>
                  <Th color="gray.500" fontSize="0.7rem">Current Status</Th>
                  <Th color="gray.500" fontSize="0.7rem" textAlign="center">Hold</Th>
                  <Th color="gray.500" fontSize="0.7rem" textAlign="center">Unhold</Th>
                  <Th color="gray.500" fontSize="0.7rem">Reason (amount updated)</Th>
                  <Th color="gray.500" fontSize="0.7rem">Reason (on hold)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {rows.map((row) => (
                  <Tr key={row.type} _hover={{ bg: "gray.50" }}>
                    <Td fontWeight="medium" color="gray.700">
                      {row.label || LABELS[row.type]}
                    </Td>
                    <Td>
                      <Flex align="center" gap={2}>
                        <Input
                          size="sm"
                          value={formatAmount(row.amount)}
                          isReadOnly
                          w="110px"
                          bg="gray.50"
                          borderRadius="md"
                          textAlign="right"
                        />
                        {row.type !== "SALARY" && (
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="blue"
                            leftIcon={<EditIcon boxSize={2.5} />}
                            onClick={() => openEditModal(row)}
                            isDisabled={row.status === "HOLD" || monthLocked}
                          >
                            Edit
                          </Button>
                        )}
                      </Flex>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={row.status === "HOLD" ? "red" : "green"}
                        borderRadius="full"
                        px={3}
                        py={1}
                        fontSize="0.7rem"
                      >
                        {row.status}
                      </Badge>
                    </Td>
                    <Td textAlign="center">
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        borderRadius="md"
                        onClick={() => openHoldModal(row)}
                        isDisabled={row.status === "HOLD" || monthLocked}
                      >
                        Hold
                      </Button>
                    </Td>
                    <Td textAlign="center">
                      <Button
                        size="sm"
                        colorScheme="green"
                        variant="outline"
                        borderRadius="md"
                        onClick={() => openUnholdModal(row)}
                        isDisabled={row.status !== "HOLD" || monthLocked}
                      >
                        Unhold
                      </Button>
                    </Td>
                    <Td>
                      <Text color="blue.600" fontSize="xs">
                        {row.reason_amount_update || "—"}
                      </Text>
                    </Td>
                    <Td>
                      <Text color="red.500" fontSize="xs">
                        {row.reason_hold || "—"}
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* ---------- Modal flow: AMOUNT -> REASON -> CONFIRM -> SUCCESS ---------- */}
      <Modal isOpen={modal.open && modal.step === "AMOUNT"} onClose={closeModal} isCentered size="sm">
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="xl" p={2}>
          <ModalBody pt={8} pb={2} textAlign="center">
            <Flex
              w={12}
              h={12}
              mx="auto"
              mb={3}
              align="center"
              justify="center"
              bg="blue.50"
              borderRadius="full"
            >
              <Icon as={EditIcon} boxSize={5} color="blue.500" />
            </Flex>
            <Heading size="sm" mb={1}>
              Enter Amount
            </Heading>
            <Text fontSize="sm" color="gray.500" mb={4}>
              {modalTypeLabel}
            </Text>
            <NumberInput
              min={0}
              value={modal.amount}
              onChange={(valueString) => setModal((m) => ({ ...m, amount: valueString }))}
            >
              <NumberInputField
                placeholder="Enter amount"
                textAlign="center"
                fontSize="lg"
                fontWeight="semibold"
                borderRadius="md"
              />
            </NumberInput>
          </ModalBody>
          <ModalFooter justifyContent="center" pt={4} gap={3}>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button colorScheme="blue" px={8} borderRadius="md" onClick={handleAmountNext}>
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={modal.open && modal.step === "REASON"} onClose={closeModal} isCentered size="sm">
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="xl" p={2}>
          <ModalBody pt={8} pb={2} textAlign="center">
            <Flex w={12} h={12} mx="auto" mb={3} align="center" justify="center"
              bg={modal.action === "HOLD" ? "red.50" : "blue.50"} borderRadius="full" >
              <Icon as={ChatIcon} boxSize={5} color={modal.action === "HOLD" ? "red.400" : "blue.500"} />
            </Flex>
            <Heading size="sm" mb={1}> {modal.action === "HOLD" ? "Reason to Hold" : "Reason for Update"} </Heading>
            <Text fontSize="sm" color="gray.500" mb={4}> {modalTypeLabel} </Text>
            <Textarea value={modal.reason}
              onChange={(e) => setModal((m) => ({ ...m, reason: e.target.value }))}
              placeholder="Enter reason" borderRadius="md" resize="none" rows={3} />
          </ModalBody>
          <ModalFooter justifyContent="center" pt={4} gap={3}>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button colorScheme="blue" px={8} borderRadius="md" onClick={handleReasonNext}>
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={modal.open && modal.step === "CONFIRM"} onClose={closeModal} isCentered size="sm">
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="xl" p={2}>
          <ModalBody pt={8} textAlign="center">
            <Flex
              w={14}
              h={14}
              mx="auto"
              mb={3}
              align="center"
              justify="center"
              bg="orange.50"
              borderRadius="full"
            >
              <Icon as={WarningIcon} boxSize={6} color="orange.400" />
            </Flex>
            <Heading size="md" mb={2}>
              Are you sure?
            </Heading>
            <Text color="gray.500" fontSize="sm" px={2}>
              {modal.action === "EDIT"
                ? "Once updated, you will not be able to undo the entry!"
                : modal.action === "HOLD"
                ? "This payment will be held and its payable amount set to 0 for this date."
                : "This payment will be unheld and its amount restored."}
            </Text>
          </ModalBody>
          <ModalFooter justifyContent="center" pt={5} gap={3}>
            <Button variant="outline" borderRadius="md" onClick={closeModal} isDisabled={modal.submitting}>
              Cancel
            </Button>
            <Button colorScheme="red" px={8} borderRadius="md" onClick={handleConfirm} isLoading={modal.submitting}>
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={modal.open && modal.step === "SUCCESS"} onClose={handleSuccessClose} isCentered size="sm">
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="xl" p={2}>
          <ModalBody pt={10} pb={2} textAlign="center">
            <Flex
              w={14}
              h={14}
              mx="auto"
              mb={4}
              align="center"
              justify="center"
              bg="green.50"
              borderRadius="full"
            >
              <Icon as={CheckCircleIcon} boxSize={7} color="green.400" />
            </Flex>
            <Text fontWeight="semibold" fontSize="md" color="gray.700">
              {successMessage}
            </Text>
          </ModalBody>
          <ModalFooter justifyContent="center" pt={4}>
            <Button colorScheme="blue" px={10} borderRadius="md" onClick={handleSuccessClose}>
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EmpPaymentHold;