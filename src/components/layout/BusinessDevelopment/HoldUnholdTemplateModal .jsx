import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Flex,
  Icon,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { API_ENDPOINTS } from "../../../services/endpoints";
import API from "../../../services/api";
import { FiPause, FiPlay } from "react-icons/fi";

const HOLD_CONFIG = {
  hold: {
    title: "Hold Template?",
    icon: FiPause,
    color: "orange",
    statusLabel: "HOLD",
    description:
      "The current assignment period will continue as-is, but no new period will be generated until you resume it.",
    confirmLabel: "Hold",
    loadingText: "Holding...",
    successTitle: "Template Put On Hold",
    errorFallback: "Failed to hold template",
    endpoint: (id) => API_ENDPOINTS.HOLD_TEMPLATE(id),
  },
  unhold: {
    title: "Resume Template?",
    icon: FiPlay,
    color: "green",
    statusLabel: "ACTIVE",
    description:
      "This template will resume generating new assignment periods as scheduled.",
    confirmLabel: "Resume",
    loadingText: "Resuming...",
    successTitle: "Template Resumed",
    errorFallback: "Failed to resume template",
    endpoint: (id) => API_ENDPOINTS.UNHOLD_TEMPLATE(id),
  },
};

const HoldUnholdTemplateModal = ({ isOpen, onClose, templateId, onSuccess, action = "hold" }) => {
  const toast = useToast();
  const cancelRef = useRef();
  const [loading, setLoading] = useState(false);

  const config = HOLD_CONFIG[action] || HOLD_CONFIG.hold;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await API.patch(config.endpoint(templateId));
      toast({
        title: config.successTitle,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || config.errorFallback,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
      <AlertDialogOverlay bg="blackAlpha.500" backdropFilter="blur(3px)">
        <AlertDialogContent borderRadius="16px" overflow="hidden" mx={4} boxShadow="2xl">
          <AlertDialogHeader py={6} px={6}>
            <Flex direction="column" align="center" gap={4}>
              <Flex w="70px" h="70px" borderRadius="full" bg={`${config.color}.50`} align="center" justify="center">
                <Icon as={config.icon} boxSize={9} color={`${config.color}.500`} />
              </Flex>
              <Text fontSize="18px" fontWeight="600" color="gray.800" textAlign="center">
                {config.title}
              </Text>
            </Flex>
          </AlertDialogHeader>

          <AlertDialogBody px={8} pb={2}>
            <Text textAlign="center" color="gray.600" fontSize="13px" lineHeight="1.8">
              This template will be marked as{" "}
              <Text as="span" fontWeight="600" color={`${config.color}.500`}>
                {config.statusLabel}
              </Text>
              . {config.description}
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter px={6} py={5} gap={3} borderTop="1px solid" borderColor="gray.100">
            <Button
              ref={cancelRef}
              onClick={onClose}
              variant="outline"
              flex={1}
              h="46px"
              fontSize="14px"
              fontWeight="500"
              borderRadius="10px"
              isDisabled={loading}
            >
              Cancel
            </Button>
            <Button
              colorScheme={config.color}
              onClick={handleConfirm}
              isLoading={loading}
              flex={1}
              h="46px"
              fontSize="14px"
              fontWeight="500"
              borderRadius="10px"
              loadingText={config.loadingText}
            >
              {config.confirmLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default HoldUnholdTemplateModal;