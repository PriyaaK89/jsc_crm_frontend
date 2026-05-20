import React from "react";
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
  Flex,
  Icon,
  Heading,
  Box,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";

const VoucherActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  actionType = "activate", // activate | deactivate
  voucherName = "",
}) => {
  const isActivate = actionType === "activate";

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      isCentered
      motionPreset="scale"
    >
      <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(4px)" />

      <ModalContent
        borderRadius="20px"
        overflow="hidden"
        mx={4}
        bg="white"
        boxShadow="2xl"
      >
        {/* Top Border */}
        <Box
          h="6px"
          bg={isActivate ? "green.400" : "red.400"}
          w="100%"
        />

        <ModalHeader pt={8} pb={2}>
          <Flex direction="column" align="center" textAlign="center" gap={4}>
            {/* Icon */}
            <Flex
              align="center"
              justify="center"
              w="70px"
              h="70px"
              borderRadius="full"
              bg={isActivate ? "green.50" : "red.50"}
            >
              <Icon
                as={CheckCircleIcon}
                boxSize={10}
                color={isActivate ? "green.500" : "red.500"}
              />
            </Flex>

            {/* Title */}
            <Heading size="md" fontWeight="700" color="gray.800">
              {isActivate ? "Activate Voucher" : "Deactivate Voucher"}
            </Heading>
          </Flex>
        </ModalHeader>

        <ModalCloseButton
          mt={2}
          mr={2}
          borderRadius="full"
          _hover={{ bg: "gray.100" }}
          isDisabled={loading}
        />

        <ModalBody px={8} pb={6}>
          <Text
            fontSize="15px"
            color="gray.600"
            textAlign="center"
            lineHeight="1.8"
          >
            Are you sure you want to{" "}
            <Text
              as="span"
              fontWeight="700"
              color={isActivate ? "green.500" : "red.500"}
            >
              {isActivate ? "activate" : "deactivate"}
            </Text>{" "}
            this voucher
            {voucherName ? (
              <>
                {" "}
                <Text as="span" fontWeight="700" color="gray.800">
                  "{voucherName}"
                </Text>
              </>
            ) : null}
            ?
          </Text>

          <Text
            mt={3}
            fontSize="13px"
            color="gray.500"
            textAlign="center"
          >
            This action can be changed later from voucher settings.
          </Text>
        </ModalBody>

        <ModalFooter
          borderTop="1px solid"
          borderColor="gray.100"
          px={6}
          py={4}
        >
          <Flex w="100%" gap={3}>
            <Button
              flex={1}
              variant="outline"
              h="45px"
              borderRadius="10px"
              onClick={onClose}
              isDisabled={loading}
            >
              Cancel
            </Button>

            <Button
              flex={1}
              h="45px"
              borderRadius="10px"
              bg={isActivate ? "green.500" : "red.500"}
              color="white"
              _hover={{
                bg: isActivate ? "green.600" : "red.600",
              }}
              _active={{
                bg: isActivate ? "green.700" : "red.700",
              }}
              onClick={onConfirm}
              isLoading={loading}
              loadingText={
                isActivate ? "Activating..." : "Deactivating..."
              }
            >
              {isActivate ? "Activate" : "Deactivate"}
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default VoucherActionModal;