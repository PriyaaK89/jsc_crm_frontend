import { Badge, Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button,
  Flex, FormControl, FormLabel, Heading, HStack, IconButton, Input, 
  Progress, Select, Spinner, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tooltip, Tr,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, useDisclosure,
  Icon, } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { GoHomeFill } from "react-icons/go";
import { FiAlertTriangle, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { BsFillCheckCircleFill } from "react-icons/bs";


const AssignVisitTarget=()=> {
  const toast = useToast();
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [templateOptions, setTemplateOptions] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  // --- Complete/Expire action state ---
  const [pendingAction, setPendingAction] = useState(null); // { type: 'complete' | 'expire', assignmentId }
  const [actionLoading, setActionLoading] = useState(false);
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const cancelRef = useRef();

  const getTemplateDropdown = async () => {
    try {
      const response = await API.get(API_ENDPOINTS?.GET_TEMPLATES_DROPDOWN);

      if (response?.status === 200) {
        setTemplateOptions(response?.data?.data || []);
      }
    } catch (error) {
      console.log(error);
      // Non-blocking: dropdown failing shouldn't stop the dashboard from loading
    }
  };

  const getAdminProgress = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();

      if (templateId) queryParams.append("template_id", templateId);
      if (periodStart) queryParams.append("period_start", periodStart);
      if (periodEnd) queryParams.append("period_end", periodEnd);

      const response = await API.get(
        `${API_ENDPOINTS?.GET_ADMIN_PROGRESS}?${queryParams.toString()}`
      );

      if (response?.status === 200) {
        setProgressList(response?.data?.data || []);
      }
    } catch (error) {
      console.log(error);

      toast({
        title: "Error",
        description: "Failed to fetch target progress",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTemplateDropdown();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getAdminProgress();
    }, 500);
    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, periodStart, periodEnd]);


  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN");
  };

  const getOverallPercentage = (breakdown) => {
    const totalTarget = breakdown?.reduce((sum, b) => sum + (b.target_value || 0), 0);
    const totalAchieved = breakdown?.reduce((sum, b) => sum + (b.achieved || 0), 0);
    if (!totalTarget) return 0;

    return Math.min(Math.round((totalAchieved / totalTarget) * 100), 100);
  };

  const statusColor = (status) => {
    if (status === "COMPLETED") return "green";
    if (status === "EXPIRED") return "red";
    return "blue"; // ACTIVE
  };

  // ==============================
  // COMPLETE / EXPIRE ACTIONS
  // ==============================
  const openConfirm = (type, assignmentId) => {
    setPendingAction({ type, assignmentId });
    onConfirmOpen();
  };

  const closeConfirm = () => {
    setPendingAction(null);
    onConfirmClose();
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    const { type, assignmentId } = pendingAction;
    const url = type === "complete" ? API_ENDPOINTS.COMPLETE_ASSIGNMENT(assignmentId) : API_ENDPOINTS.EXPIRE_ASSIGNMENT(assignmentId);

    try {
      setActionLoading(true);
      const response = await API.patch(url);

      if (response?.status === 200) {
        toast({
          title: type === "complete" ? "Assignment marked completed" : "Assignment marked expired",
          status: type === "complete" ? "success" : "warning",
          duration: 3000,
          isClosable: true,
        });

        // Refresh the dashboard so the row reflects the new status
        getAdminProgress();
      }
    } catch (error) {
      console.log(error);

      toast({
        title: "Action failed",
        description:
          error?.response?.data?.message ||
          "This assignment may have already been completed or expired",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
      closeConfirm();
    }
  };

  return (
    <Box
      bg="white"
      mt={{ base: 2, md: 5 }}
      px={{ base: 3, md: 6 }}
      py={{ base: 3, md: 5 }}
      borderRadius="16px"
      boxShadow="sm" >
     
      <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4} mb={6}>
        <Box>
          <Breadcrumb color="#8B8D97" mb={1}>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/dashboard">
                <GoHomeFill color="#5570F1" />
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem>
              <BreadcrumbLink isCurrentPage color="#8B8D97" fontSize="13px">
                Visit Target Progress
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Heading size="md" color="#1A202C"> Visit Target Progress </Heading>
        </Box>
      </Flex>

      <Flex gap={4} mb={6} flexWrap="wrap" alignItems="end">
        <FormControl maxW="240px">
          <FormLabel fontSize="13px">Template</FormLabel>
          <Select
            placeholder="All templates"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
          >
            {templateOptions?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.template_name}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl maxW="180px">
          <FormLabel fontSize="13px">Period Start</FormLabel>
          <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
        </FormControl>

        <FormControl maxW="180px">
          <FormLabel fontSize="13px">Period End</FormLabel>
          <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)}/>
        </FormControl>

      </Flex>

      {loading ? (
        <Flex justifyContent="center" alignItems="center" minH="350px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <TableContainer border="1px solid #E2E8F0" borderRadius="14px" overflowX="auto">
          <Table variant="simple" size="sm" className="productsTable">
            <Thead bg="#F8FAFC">
              <Tr>
                <Th>S.No</Th>
                <Th>Employee</Th>
                <Th>Period</Th>
                <Th>Farmer</Th>
                <Th>Retailer</Th>
                <Th>Distributor</Th>
                <Th>Overall</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>

            <Tbody>
              {progressList?.length > 0 ? (
                progressList.map((item, index) => {
                  const { assignment, breakdown } = item;

                  const byType = {};
                  breakdown?.forEach((b) => {
                    byType[b.visit_type] = b;
                  });

                  const overallPct = getOverallPercentage(breakdown);
                  const isActive = assignment?.status === "ACTIVE";

                  return (
                    <Tr key={assignment?.id} _hover={{ bg: "gray.50" }}>
                      <Td fontWeight="600">{index + 1}</Td>

                      <Td minW="160px">
                        <Text fontWeight="700" color="#1A202C"> {assignment?.employee_name || "-"} </Text>
                        <Text fontSize="12px" color="gray.500"> ID : {assignment?.employee_id} </Text>
                      </Td>

                      <Td minW="180px">
                        {formatDate(assignment?.period_start)} -{" "}
                        {formatDate(assignment?.period_end)}
                      </Td>

                      {["farmer", "retailer", "distributor"].map((type) => (
                        <Td key={type}>
                          {byType[type]
                            ? `${byType[type].achieved} / ${byType[type].target_value}`
                            : "-"}
                        </Td>
                      ))}

                      <Td minW="140px">
                        <Progress
                          value={overallPct}
                          size="sm"
                          borderRadius="full"
                          colorScheme={overallPct >= 100 ? "green" : "blue"}
                          mb={1} />
                        <Text fontSize="12px" color="gray.600"> {overallPct} % </Text>
                      </Td>

                      <Td>
                        <Badge colorScheme={statusColor(assignment?.status)} className="ledger_badge">
                          {assignment?.status || "-"}
                        </Badge>
                      </Td>

                      <Td>
                        {isActive ? (
                          <HStack spacing={1}>
                            <Tooltip label="Mark Completed" hasArrow>
                              <IconButton
                                icon={<FiCheckCircle />}
                                size="sm"
                                variant="ghost"
                                color="green.600"
                                _hover={{ bg: "green.50" }}
                                aria-label="Complete assignment"
                                onClick={() => openConfirm("complete", assignment.id)}
                              />
                            </Tooltip>

                            <Tooltip label="Force Expire" hasArrow>
                              <IconButton
                                icon={<FiXCircle />}
                                size="sm"
                                variant="ghost"
                                color="red.600"
                                _hover={{ bg: "red.50" }}
                                aria-label="Expire assignment"
                                onClick={() => openConfirm("expire", assignment.id)}
                              />
                            </Tooltip>
                          </HStack>
                        ) : (
                          <Text fontSize="12px" color="gray.400">-</Text>
                        )}
                      </Td>
                    </Tr>
                  );
                })
              ) : (
                <Tr>
                  <Td colSpan={9} textAlign="center" py={10}> No active targets found </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {/* Confirm dialog for Complete / Expire */}
      <AlertDialog
  isOpen={isConfirmOpen}
  leastDestructiveRef={cancelRef}
  onClose={closeConfirm}
  isCentered
>
  <AlertDialogOverlay bg="blackAlpha.500" backdropFilter="blur(3px)">
    <AlertDialogContent
      borderRadius="16px"
      overflow="hidden"
      mx={4}
      boxShadow="2xl"
    >
      {/* Header */}
      <AlertDialogHeader py={6} px={6}>
        <Flex direction="column" align="center" gap={4}>
          <Flex
            w="70px"
            h="70px"
            borderRadius="full"
            align="center"
            justify="center"
            bg={
              pendingAction?.type === "complete"
                ? "green.50"
                : "red.50"
            }
          >
            <Icon
              as={
                pendingAction?.type === "complete"
                  ? BsFillCheckCircleFill
                  : FiAlertTriangle
              }
              boxSize={9}
              color={
                pendingAction?.type === "complete"
                  ? "green.500"
                  : "red.500"
              }
            />
          </Flex>

          <Text
            fontSize="18px"
            fontWeight="600"
            color="gray.700"
            textAlign="center"
          >
            {pendingAction?.type === "complete"
              ? "Mark Assignment Complete?"
              : "Force Expire Assignment?"}
          </Text>
        </Flex>
      </AlertDialogHeader>

      {/* Body */}
      <AlertDialogBody px={8} pb={2}>
        <Text
          textAlign="center"
          color="gray.600"
          fontSize="13px"
          lineHeight="1.8"
        >
          {pendingAction?.type === "complete"
            ? "The current assignment will be marked as completed immediately before its scheduled end date."
            : "The assignment will expire immediately and employees will no longer be able to submit progress."}
        </Text>

        <Text
          mt={4}
          textAlign="center"
          fontSize="sm"
          fontWeight="600"
          color="red.500"
        >
          This action cannot be undone.
        </Text>
      </AlertDialogBody>

      {/* Footer */}
      <AlertDialogFooter
        px={6}
        py={5}
        gap={3}
        borderTop="1px solid"
        borderColor="gray.100"
      >
        <Button
          ref={cancelRef}
          onClick={closeConfirm}
          variant="outline"
          flex={1} fontWeight="500" fontSize="14px"
          h="46px"
          borderRadius="10px"
          isDisabled={actionLoading}
        >
          Cancel
        </Button>

        <Button
          flex={1}
          h="46px"
          borderRadius="10px" fontWeight="500" fontSize="14px"
          colorScheme={
            pendingAction?.type === "complete"
              ? "green"
              : "red"
          }
          onClick={handleConfirmAction}
          isLoading={actionLoading}
        >
          {pendingAction?.type === "complete"
            ? "Mark Complete"
            : "Expire Now"}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialogOverlay>
</AlertDialog>
    </Box>
  );
}

export default AssignVisitTarget;