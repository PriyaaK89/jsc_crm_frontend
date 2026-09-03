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
import { FiXCircle } from "react-icons/fi";

const PermanentDeleteTemplateModal = ({ isOpen, onClose, templateId, onSuccess }) => {
  const toast = useToast();
  const cancelRef = useRef();
  const [loading, setLoading] = useState(false);

  const handlePermanentDelete = async () => {
    try {
      setLoading(true);

      await API.delete(`${API_ENDPOINTS.DELETE_TEMPLATE_PERMANENT(templateId)}?confirm=true`);

      toast({
        title: "Template Permanently Deleted",
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
        description: error?.response?.data?.message || "Failed to permanently delete template",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay bg="blackAlpha.500" backdropFilter="blur(3px)">
        <AlertDialogContent borderRadius="16px" overflow="hidden" mx={4} boxShadow="2xl">
          <AlertDialogHeader py={6} px={6}>
            <Flex direction="column" align="center" gap={4}>
              <Flex w="70px" h="70px" borderRadius="full" bg="red.50" align="center" justify="center">
                <Icon as={FiXCircle} boxSize={9} color="red.600" />
              </Flex>

              <Text fontSize="18px" fontWeight="600" color="gray.800" textAlign="center">
                Permanently Delete Template?
              </Text>
            </Flex>
          </AlertDialogHeader>

          <AlertDialogBody px={8} pb={2}>
            <Text textAlign="center" color="gray.600" fontSize="13px" lineHeight="1.8">
              This will{" "}
              <Text as="span" fontWeight="600" color="red.600">
                permanently remove
              </Text>{" "}
              this template along with all its assignments and progress history. This action{" "}
              <Text as="span" fontWeight="600" color="red.600">
                cannot be undone.
              </Text>
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
              colorScheme="red"
              onClick={handlePermanentDelete}
              isLoading={loading}
              flex={1}
              h="46px"
              fontSize="14px"
              fontWeight="500"
              borderRadius="10px"
              loadingText="Deleting..."
            >
              Delete Permanently
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default PermanentDeleteTemplateModal;