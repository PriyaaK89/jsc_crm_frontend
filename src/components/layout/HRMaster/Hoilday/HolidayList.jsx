import React, { useState } from "react";
import { Box, Text, HStack, VStack, IconButton } from "@chakra-ui/react";
import { holidayTokens as t } from "../../../../theme/holidayTokens";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import DeleteHolidayModal from "./DeleteHolidayModal";

const HolidayList = ({ holidays, onEdit, onDelete }) => {
  const [pendingDelete, setPendingDelete] = useState(null); // holds the holiday object
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(pendingDelete.id);
      setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box
      bg={t.paper}
      borderRadius={t.radius}
      border={`1px solid ${t.line}`}
      boxShadow={t.shadowCard}
      h="100%"
      overflow="hidden"
    >
      {/* ... header unchanged ... */}

      {holidays.length === 0 ? (
        /* ... unchanged empty state ... */
        <VStack align="start" px={4} py={8} spacing={2}>
          <Box
            w="34px" h="34px" borderRadius="50%" border={`1px dashed ${t.line}`}
            display="flex" alignItems="center" justifyContent="center"
            fontSize="15px" color={t.wheat}
          >
            ✦
          </Box>
          <Text fontSize="12.5px" color={t.ink} opacity={0.55} lineHeight="1.55">
            No holidays marked for this month yet. Click any date on the calendar to add one.
          </Text>
        </VStack>
      ) : (
        <VStack align="stretch" spacing={0}>
          {holidays.map((h, idx) => (
            <HStack
              key={h.id}
              justify="space-between"
              px={4}
              py={3}
              borderTop={idx === 0 ? "none" : `1px dashed ${t.line}`}
              _hover={{ bg: t.cream }}
              transition="background 0.12s ease"
            >
              <HStack spacing={3}>
                <VStack spacing={0} minW="42px" py={1} borderRight={`1px solid ${t.lineSoft}`} pr={2.5}>
                  <Text
                    fontFamily={t.fontDisplay} fontSize="19px" fontWeight="600"
                    color={t.terracotta} lineHeight="1" sx={{ fontFeatureSettings: '"tnum"' }}
                  >
                    {new Date(h.holiday_date).getDate()}
                  </Text>
                  <Text fontSize="9px" color={t.ink} opacity={0.5} mt={0.5}>
                    {new Date(h.holiday_date).toLocaleDateString("en-IN", { month: "short" })}
                  </Text>
                </VStack>
                <Text fontSize="13.5px" fontWeight="500" color={t.ink}>
                  {h.holiday_name}
                </Text>
              </HStack>

              <HStack spacing={0.5}>
                <IconButton
                  aria-label="Delete holiday"
                  size="xs"
                  variant="ghost"
                  borderRadius="50%"
                  color={t.terracotta}
                  opacity={0.65}
                  icon={<FiTrash2 size={15} />}
                  _hover={{ opacity: 1, bg: t.terracottaLight }}
                  onClick={() => setPendingDelete(h)}
                />
              </HStack>
            </HStack>
          ))}
        </VStack>
      )}

      <DeleteHolidayModal
        isOpen={!!pendingDelete}
        onClose={() => (isDeleting ? null : setPendingDelete(null))}
        holidayName={pendingDelete?.holiday_name}
        holidayDate={pendingDelete?.holiday_date}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </Box>
  );
};

export default HolidayList;