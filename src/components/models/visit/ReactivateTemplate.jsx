import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Alert,
  AlertIcon,
  Box,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";

import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";

/**
 * Reactivation flow:
 *  1. On open, immediately try PATCH with no body.
 *     - If the template's original period is still valid, the backend
 *       reactivates it right away -> we close and refresh.
 *  2. If the backend responds 400 (period has passed), we stop showing
 *     a spinner and instead show start_date/end_date inputs, then retry
 *     the same PATCH with those dates included.
 *  3. If the backend responds 409 (employee conflicts), we show the
 *     conflict list and let the user close the modal to go resolve it
 *     via Edit Template first.
 */
const ReactivateTemplateModal = ({ isOpen, onClose, templateId, onSuccess }) => {
  const toast = useToast();

  const [phase, setPhase] = useState("confirm"); // confirm | needs_dates | error
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [conflicts, setConflicts] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const resetState = () => {
    setPhase("confirm");
    setStartDate("");
    setEndDate("");
    setConflicts(null);
    setErrorMessage("");
    setSubmitting(false);
  };

  const attemptReactivate = async (payload = {}) => {
    try {
      setSubmitting(true);

      const response = await API.patch(
        API_ENDPOINTS.REACTIVATE_TEMPLATE(templateId),
        payload
      );

      if (response?.status === 200) {
        toast({
          title: "Template reactivated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        onSuccess?.();
        onClose();
      }
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || "Something went wrong";

      if (status === 400) {
        // Original period has passed — ask the user for a new one.
        setPhase("needs_dates");
        setErrorMessage(message);
      } else if (status === 409) {
        setPhase("error");
        setConflicts(error?.response?.data?.conflicts || []);
        setErrorMessage(message);
      } else {
        setPhase("error");
        setErrorMessage(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen && templateId) {
      resetState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, templateId]);

  const handleConfirmReactivate = () => {
    attemptReactivate();
  };

  const handleSubmitDates = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Please select both start and end dates",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    attemptReactivate({ start_date: startDate, end_date: endDate });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader bg="#e5eef0" padding="20px 4px 20px 16px" fontSize='15px' color="#4d4d4d" borderRadius="8px 8px 0px 0px" fontWeight="600">Reactivate Template</ModalHeader>
        <ModalCloseButton top={1} right={2} fontSize="11px"/>

        <ModalBody>
          {phase === "confirm" && (
            <Text color="gray.600" fontSize="14px" pt={3}>
              This will reactivate the template and create fresh active assignments for its
              employees. Are you sure you want to continue?
            </Text>
          )}

          {phase === "needs_dates" && (
            <VStack align="stretch" spacing={4}>
              <Alert status="info" borderRadius="8px">
                <AlertIcon />
                {errorMessage || "This template's original period has passed. Please choose a new one."}
              </Alert>

              <FormControl isRequired>
                <FormLabel fontSize="14px">Start Date</FormLabel>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="14px">End Date</FormLabel>
                <Input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </FormControl>
            </VStack>
          )}

          {phase === "error" && (
            <VStack align="stretch" spacing={3}>
              <Alert status="error" borderRadius="8px">
                <AlertIcon />
                {errorMessage}
              </Alert>

              {Array.isArray(conflicts) && conflicts.length > 0 && (
                <Box fontSize="13px" color="gray.600">
                  <Text fontWeight="600" mb={1}>Conflicting employees:</Text>
                  {conflicts.map((c, idx) => (
                    <Text key={idx}>
                      Employee ID {c?.employee_id} — already assigned under template {c?.template_id}
                    </Text>
                  ))}
                  <Text mt={2}>
                    Remove these employees from this template (via Edit Template) before reactivating,
                    or choose a period that doesn&apos;t overlap with their current assignment.
                  </Text>
                </Box>
              )}
            </VStack>
          )}
        </ModalBody>

       <ModalFooter>
  <Button variant="ghost" mr={3} onClick={onClose} fontSize="14px" fontWeight="500" border="1px solid grey">
    {phase === "needs_dates" ? "Cancel" : "Close"}
  </Button>

  {phase === "confirm" && (
    <Button  bg="#2369aa" _hover={{bg: "#1d5991"}} fontSize="14px" fontWeight="500" color="white" onClick={handleConfirmReactivate} isLoading={submitting}>
      Reactivate
    </Button>
  )}

  {phase === "needs_dates" && (
    <Button bg="#2369aa" fontSize="14px" fontWeight="500" onClick={handleSubmitDates} isLoading={submitting}>
      Reactivate
    </Button>
  )}
</ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReactivateTemplateModal;