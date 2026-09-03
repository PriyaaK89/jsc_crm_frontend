import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
  Textarea,
  Input,
  InputGroup,
  InputLeftAddon,
  Button,
  VStack,
  HStack,
  useToast,
  useDisclosure,
  Card,
  CardBody,
  Avatar,
  Divider,
  Icon,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { WarningTwoIcon, ChatIcon } from "@chakra-ui/icons";

import useUsersapi from "../../Apis/GetUsersapi";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const PenaltyPage = () => {
  const { users, loading: usersLoading } = useUsersapi();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [employeeId, setEmployeeId] = useState("");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const selectedEmployee = users.find(
    (u) => String(u.id) === String(employeeId)
  );

  const validate = () => {
    const newErrors = {};
    if (!employeeId) newErrors.employeeId = "Please select an employee";
    if (!reason.trim()) newErrors.reason = "Reason is required";
    const parsedAmount = Number(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = "Enter a valid amount greater than 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setEmployeeId("");
    setReason("");
    setAmount("");
    setErrors({});
  };

  // Step 1: form submit just validates + opens the confirm modal
  const handleReviewClick = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onOpen();
  };

  // Step 2: actual API call only fires from the modal's confirm button
  const handleConfirmSend = async () => {
    try {
      setSubmitting(true);
      const res = await API.post(API_ENDPOINTS.send_penalty_message, {
        employee_id: employeeId,
        reason: reason.trim(),
        amount: Number(amount),
      });

      if (res.status === 200 && res.data?.success) {
        toast({
          title: "Penalty recorded",
          description: res.data.message,
          status: res.data.whatsappSent ? "success" : "warning",
          duration: 5000,
          isClosable: true,
        });
        onClose();
        resetForm();
      } else {
        throw new Error(res.data?.message || "Something went wrong");
      }
    } catch (error) {
      toast({
        title: "Failed to send penalty notice",
        description:
          error.response?.data?.message ||
          error.message ||
          "Please try again",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const parsedAmount = Number(amount) || 0;

  return (
    <Box
      maxW="lg"
      mx="auto"
      mt={6}
      px={4}
      pb={10}
    >
<HStack
  mb={4}
  spacing={4}
padding="10px 10px 20px 10px"
  borderRadius="xl"
  bgGradient="linear(to-r, #fbb49157, #fcaeaecc)"
  border="1px solid"
  borderColor="orange.100"
>
  <Box
    bgGradient="linear(to-br, orange.400, red.500)"
    p={2}
    borderRadius="xl"
    display="flex"
    alignItems="center"
    justifyContent="center"
    shadow="md"
  >
    <Icon as={WarningTwoIcon} color="white" boxSize={5} />
  </Box>
  <VStack alignItems="baseline" gap={0}>
    <Heading fontSize="20px" letterSpacing="tight" color="#4d4d4d" height="36px">
      Issue Penalty Notice
    </Heading>
    <Text color="gray.600" fontSize="11px">
      Record a penalty and notify the employee via WhatsApp
    </Text>
  </VStack>
</HStack>

      <Card
        variant="outline"
        borderRadius="2xl"
        shadow="lg"
        mt={6}
        borderColor="gray.100"
        overflow="hidden"
      >
        <Box h="4px" bgGradient="linear(to-r, orange.400, red.500)" />
        <CardBody p={8}>
          <form onSubmit={handleReviewClick}>
            <VStack spacing={5} align="stretch">
              <FormControl isInvalid={!!errors.employeeId} isRequired>
                <FormLabel fontWeight="semibold" color="gray.700">
                  Employee
                </FormLabel>
                <Select
                  placeholder={
                    usersLoading ? "Loading employees..." : "Select employee"
                  }
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  isDisabled={usersLoading}
                  focusBorderColor="orange.400"
                  bg="gray.50"
                  borderRadius="lg"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.contact_no ? `— ${u.contact_no}` : ""}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.employeeId}</FormErrorMessage>
              </FormControl>

              {selectedEmployee && (
                <HStack
                  p={3}
                  bg="orange.50"
                  borderRadius="lg"
                  spacing={3}
                  borderWidth="1px"
                  borderColor="orange.100"
                >
                  <Avatar size="sm" name={selectedEmployee.name} bg="orange.400" />
                  <Box flex="1">
                    <Text fontWeight="medium" fontSize="sm" color="gray.800">
                      {selectedEmployee.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {selectedEmployee.contact_no ||
                        "No contact number on file"}
                    </Text>
                  </Box>
                  {!selectedEmployee.contact_no && (
                    <Badge colorScheme="orange" fontSize="0.65rem" borderRadius="full" px={2}>
                      No WhatsApp
                    </Badge>
                  )}
                </HStack>
              )}

              <FormControl isInvalid={!!errors.reason} isRequired>
                <FormLabel fontWeight="semibold" color="gray.700">
                  Reason
                </FormLabel>
                <Textarea
                  placeholder="e.g. Visit Target not completed this month"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  focusBorderColor="orange.400"
                  bg="gray.50"
                  borderRadius="lg"
                />
                <FormErrorMessage>{errors.reason}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.amount} isRequired>
                <FormLabel fontWeight="semibold" color="gray.700">
                  Penalty Amount
                </FormLabel>
                <InputGroup>
                  <InputLeftAddon bg="orange.50" color="orange.700" fontWeight="semibold" borderRadius="lg 0 0 lg">
                    ₹
                  </InputLeftAddon>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    focusBorderColor="orange.400"
                    bg="gray.50"
                    borderRadius="0 lg lg 0"
                  />
                </InputGroup>
                <FormErrorMessage>{errors.amount}</FormErrorMessage>
              </FormControl>

              <Divider />

              <Button
                type="submit"
                size="lg"
                leftIcon={<ChatIcon />}
                borderRadius="lg"
                bgGradient="linear(to-r, orange.400, red.500)"
                color="white"
                _hover={{
                  bgGradient: "linear(to-r, orange.500, red.600)",
                  transform: "translateY(-1px)",
                  shadow: "md",
                }}
                _active={{
                  bgGradient: "linear(to-r, orange.600, red.700)",
                }}
                transition="all 0.15s ease"
              >
                Review &amp; Send
              </Button>
            </VStack>
          </form>
        </CardBody>
      </Card>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={submitting ? () => {} : onClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(2px)" />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <Box h="4px" bgGradient="linear(to-r, orange.400, red.500)" />
          <ModalHeader>
            <HStack spacing={2}>
              <Icon as={WarningTwoIcon} color="red.500" />
              <Text>Confirm Penalty Notice</Text>
            </HStack>
          </ModalHeader>
          {!submitting && <ModalCloseButton />}
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Alert status="warning" borderRadius="lg" fontSize="sm" bg="orange.50">
                <AlertIcon />
                This will notify the employee on WhatsApp immediately.
              </Alert>

              <HStack
                p={3}
                bg="gray.50"
                borderRadius="lg"
                spacing={3}
                borderWidth="1px"
                borderColor="gray.100"
              >
                <Avatar size="sm" name={selectedEmployee?.name} bg="orange.400" />
                <Box>
                  <Text fontWeight="medium" fontSize="sm" color="gray.800">
                    {selectedEmployee?.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {selectedEmployee?.contact_no || "No contact number"}
                  </Text>
                </Box>
              </HStack>

              <Box>
                <Text fontSize="xs" color="gray.500" mb={1} letterSpacing="wide" fontWeight="semibold">
                  REASON
                </Text>
                <Text fontSize="sm" color="gray.700">
                  {reason}
                </Text>
              </Box>

              <Box bg="red.50" p={4} borderRadius="lg" borderWidth="1px" borderColor="red.100">
                <Text fontSize="xs" color="gray.500" mb={1} letterSpacing="wide" fontWeight="semibold">
                  AMOUNT
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="red.600">
                  ₹{parsedAmount.toFixed(2)}
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onClose}
              isDisabled={submitting}
              borderRadius="lg"
            >
              Cancel
            </Button>
            <Button
              bgGradient="linear(to-r, orange.400, red.500)"
              color="white"
              _hover={{ bgGradient: "linear(to-r, orange.500, red.600)" }}
              _active={{ bgGradient: "linear(to-r, orange.600, red.700)" }}
              onClick={handleConfirmSend}
              isLoading={submitting}
              loadingText="Sending..."
              borderRadius="lg"
            >
              Confirm &amp; Send
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PenaltyPage;