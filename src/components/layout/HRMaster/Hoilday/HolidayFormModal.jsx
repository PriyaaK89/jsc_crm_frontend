import React, { useState, useEffect } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, FormControl, FormLabel, Input, Button, Text, Box, HStack,
} from "@chakra-ui/react";
import { holidayTokens as t } from "../../../../theme/holidayTokens";

const HolidayFormModal = ({ isOpen, onClose, mode, initialDate, initialName, onSubmit, onDelete }) => {
  const [name, setName] = useState(initialName || "");

  useEffect(() => {
    setName(initialName || "");
  }, [initialName, isOpen]);

  const displayDate = initialDate
    ? new Date(initialDate).toLocaleDateString("en-IN", {
        weekday: "short", day: "numeric", month: "long", year: "numeric",
      })
    : "";

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent borderRadius={t.radius} overflow="hidden" boxShadow={t.shadowLift}>
        <Box
          bg={t.forest}
          px={6}
          py={4}
          backgroundImage={`repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 10px)`}
        >
          <HStack spacing={2} mb={1}>
            <Box w="6px" h="6px" borderRadius="50%" bg={mode === "add" ? t.wheat : t.terracotta} />
            <Text fontFamily={t.fontBody} fontSize="11.5px" color="whiteAlpha.800" fontWeight="600">
              {mode === "add" ? "Add holiday" : "Edit holiday"}
            </Text>
          </HStack>
          <Text fontFamily={t.fontDisplay} fontSize="19px" fontWeight="600" color="white" lineHeight="1.2">
            {displayDate}
          </Text>
        </Box>
        <ModalCloseButton color="white" top="14px" />

        <ModalBody px={6} pt={5} pb={1}>
          <FormControl>
            <FormLabel fontSize="12.5px" color={t.ink} fontWeight="500">
              Holiday name
            </FormLabel>
            <Input
              size="md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Diwali"
              borderColor={t.line}
              borderRadius={t.radiusSm}
              bg={t.paper}
              _hover={{ borderColor: t.forestLight }}
              _focus={{ borderColor: t.forest, boxShadow: `0 0 0 1px ${t.forest}` }}
              autoFocus
            />
          </FormControl>
        </ModalBody>

        <ModalFooter px={6} pt={4} pb={5}>
          {mode === "edit" && (
            <Button
              variant="ghost"
              color={t.terracotta}
              mr="auto"
              size="sm"
              _hover={{ bg: t.terracottaLight }}
              onClick={onDelete}
            >
              Remove holiday
            </Button>
          )}
          <Button variant="ghost" mr={2} size="sm" onClick={onClose} color={t.ink} _hover={{ bg: t.sage100 }}>
            Cancel
          </Button>
          <Button
            bg={t.forest}
            color="white"
            _hover={{ bg: t.forestDark }}
            size="sm"
            borderRadius={t.radiusSm}
            isDisabled={!name.trim()}
            onClick={() => onSubmit(name.trim())}
          >
            {mode === "add" ? "Add holiday" : "Save changes"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default HolidayFormModal;