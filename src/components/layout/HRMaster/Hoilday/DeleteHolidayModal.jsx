import React from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, Button, Text, Box, HStack,
} from "@chakra-ui/react";
import { FiTrash2 } from "react-icons/fi";
import { holidayTokens as t } from "../../../../theme/holidayTokens";

const DeleteHolidayModal = ({ isOpen, onClose, holidayName, holidayDate, onConfirm, isDeleting }) => {
  const displayDate = holidayDate
    ? new Date(holidayDate).toLocaleDateString("en-IN", {
        weekday: "short", day: "numeric", month: "long", year: "numeric",
      })
    : "";

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent borderRadius={t.radius} overflow="hidden" boxShadow={t.shadowLift}>
        <Box px={6} py={4} bg={t.terracottaLight} borderBottom={`1px solid ${t.line}`}>
          <HStack spacing={2}>
            <Box
              w="30px" h="30px" borderRadius="50%"
              bg="white" display="flex" alignItems="center" justifyContent="center"
              color={t.terracotta}
            >
              <FiTrash2 size={15} />
            </Box>
            <Text fontFamily={t.fontDisplay} fontSize="16px" fontWeight="600" color={t.ink}>
              Remove holiday?
            </Text>
          </HStack>
        </Box>
        <ModalCloseButton top="14px" />

        <ModalBody px={6} pt={5} pb={1}>
          <Text fontSize="13.5px" color={t.ink} lineHeight="1.6">
            You're about to remove{" "}
            <Text as="span" fontWeight="600">
              {holidayName}
            </Text>
            {displayDate && (
              <>
                {" "}on{" "}
                <Text as="span" fontWeight="600">
                  {displayDate}
                </Text>
              </>
            )}
            . This can't be undone.
          </Text>
        </ModalBody>

        <ModalFooter px={6} pt={4} pb={5}>
          <Button
            variant="ghost"
            mr={2}
            size="sm"
            onClick={onClose}
            color={t.ink}
            _hover={{ bg: t.sage100 }}
            isDisabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            bg={t.terracotta}
            color="white"
            _hover={{ bg: t.terracottaDark || t.terracotta }}
            size="sm"
            borderRadius={t.radiusSm}
            onClick={onConfirm}
            isLoading={isDeleting}
            loadingText="Removing"
          >
            Remove holiday
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteHolidayModal;