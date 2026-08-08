import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  Icon,
  Text,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  useToast,
} from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";
import { useContext, useRef, useState } from "react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { AuthContext } from "../../context/AuthContext";

const CanclePartyTransactionModal = ({
  isOpen,
  onClose,
  transactionType,
  referenceId,
  onSuccess,
}) => {
  const cancelRef = useRef();
  const toast = useToast();

  const [isDeleting, setIsDeleting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [wasApiCalled, setWasApiCalled] = useState(false);
  const { auth } = useContext(AuthContext)
  console.log("userID: ", auth?.user?.id)
  const userID = auth?.user?.id

  const handleCancelPartyTransaction = async () => {
    setIsDeleting(true);

    try {
      const res = await API.delete(
        API_ENDPOINTS.DELETE_PARTY_TRANSACTION,
        {
          data: {
            transaction_type: transactionType,
            reference_id: referenceId,
          },
        }
      );

      if (res?.data?.success) {
        onClose();
        setWasApiCalled(true);
        setShowSuccessModal(true);
      }

    } catch (error) {
      toast({
        title: "Failed to cancel transaction",
        description:
          error?.response?.data?.message ||
          "Something went wrong.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false); // correct state

    if (wasApiCalled) {
      onSuccess?.();
    }
  };

  return (
    <>
      {/* Confirm Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="12px" py={6}>
            <AlertDialogBody>
              <VStack spacing={3}>
                <Icon as={WarningIcon} boxSize={12} color="orange.400" />
                <Text fontSize="xl" fontWeight="bold">
                  Are you sure?
                </Text>
                <Text color="gray.600" textAlign="center">
                  Once Delete, you will not be able to undo the entry!
                </Text>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter justifyContent="center" gap={3}>
              <Button
                ref={cancelRef}
                onClick={() => {
                  onClose();
                  setShowCancelModal(true);
                }}
                variant="outline"
              >
                CANCEL
              </Button>
              <Button
                colorScheme="red"
                onClick={handleCancelPartyTransaction}
                isLoading={isDeleting}
              >
                OK
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalBody py={6}>
            <Text textAlign="center">
              Request Cancelled!
            </Text>
          </ModalBody>

          <ModalFooter justifyContent="center">
            <Button
              onClick={() => setShowCancelModal(false)}
            >
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalBody py={6}>
            <Text textAlign="center">
              Transaction Cancelled Successfully!
            </Text>
          </ModalBody>

          <ModalFooter justifyContent="center">
            <Button
              colorScheme="green"
              onClick={handleSuccessClose}
            >
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CanclePartyTransactionModal;