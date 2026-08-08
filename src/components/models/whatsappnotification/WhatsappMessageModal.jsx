import React from "react";
import {
  Box,
  Button,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FaWhatsapp } from "react-icons/fa";

const WhatsappMessageModal = ({
  isWhatsappModalOpen,
  onWhatsappModalClose,
  onConfirm,
  isSending,
  ledgerName,
}) => {
  return (
    <Modal
      isOpen={isWhatsappModalOpen}
      onClose={onWhatsappModalClose}
      isCentered
      size="md"
    >
      <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(3px)" />

      <ModalContent
        borderRadius="xl"
        overflow="hidden"
        boxShadow="2xl"
      >
        <ModalHeader
          bg="green.500"
          color="white"
          py={2.5}
        >
          <HStack spacing={2}>
            <Icon as={FaWhatsapp} boxSize={5} />
            <Text fontSize="16px" fontWeight="500">
              Send WhatsApp Message
            </Text>
          </HStack>
        </ModalHeader>

        <ModalCloseButton color="white" top={1} right={1} />

        <ModalBody py={8}>
          <VStack spacing={5}>
            <Box
              w="60px"
              h="60px"
              borderRadius="full"
              bg="green.50"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon
                as={FaWhatsapp}
                boxSize={9}
                color="green.500"
              />
            </Box>

            <VStack spacing={2}>
              <Text
                fontSize="16px"
                fontWeight="semibold"
                textAlign="center"
                color="gray.800"
              >
                Send WhatsApp Confirmation?
              </Text>

              <Text
                textAlign="center"
                color="gray.600"
                lineHeight="1.7" fontSize="13px"
              >
                Are you sure you want to send a WhatsApp confirmation
                {ledgerName ? (
                  <>
                    {" "}
                    to{" "}
                    <Text
                      as="span"
                      fontWeight="bold"
                      color="gray.800"
                    >
                      {ledgerName}
                    </Text>
                  </>
                ) : (
                  "?"
                )}
                {ledgerName && "?"}
              </Text>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="gray.100">
          <HStack spacing={3} w="100%">
            <Button
              flex={1} fontSize="14px"
              variant="outline"
              onClick={onWhatsappModalClose}
              borderRadius="lg"
            >
              No
            </Button>

            <Button
              flex={1} fontSize="14px"
              bg="green.500"
              color="white"
              _hover={{ bg: "green.600" }}
              _active={{ bg: "green.700" }}
              borderRadius="lg"
              onClick={onConfirm}
              isLoading={isSending}
              loadingText="Sending..."
            >
              Yes, Send
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WhatsappMessageModal;