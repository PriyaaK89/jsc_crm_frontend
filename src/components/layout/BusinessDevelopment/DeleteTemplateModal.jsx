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
import { FiSlash } from "react-icons/fi";


const DeleteTemplateModal = ({ isOpen, onClose, templateId, onSuccess }) => {
  const toast = useToast();
  const cancelRef = useRef();
  const [loading, setLoading] = useState(false);

  const handleDeactivate = async () => {
    try {
      setLoading(true);

      API.delete( API_ENDPOINTS.DELETE_TEMPLATE(templateId));

      toast({
        title: "Template Deactivated",
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
        description: error?.response?.data?.message || "Failed to deactivate template",
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
            bg="orange.50"
            align="center"
            justify="center"
          >
            <Icon
              as={FiSlash}
              boxSize={9}
              color="orange.500"
            />
          </Flex>

          <Text
            fontSize="18px"
            fontWeight="600"
            color="gray.800"
            textAlign="center"
          >
            Deactivate Template?
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
          This template will be marked as{" "}
          <Text as="span" fontWeight="600" color="orange.500">
            INACTIVE
          </Text>
          . Existing assignment history will remain unchanged, but no new
          assignment periods will be generated for this template.
        </Text>

        <Text
          mt={4}
          textAlign="center"
          fontSize="sm"
          fontWeight="600"
          color="red.500"
        >
          You can reactivate this template later if needed.
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
          onClick={onClose}
          variant="outline"
          flex={1}
          h="46px" fontSize="14px" fontWeight="500"
          borderRadius="10px"
          isDisabled={loading}
        >
          Cancel
        </Button>

        <Button
          colorScheme="orange"
          onClick={handleDeactivate}
          isLoading={loading}
          flex={1}
          h="46px" fontSize="14px" fontWeight="500"
          borderRadius="10px"
          loadingText="Deactivating..."
        >
          Deactivate
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialogOverlay>
</AlertDialog>
  );
}

export default DeleteTemplateModal;