import React, { useState } from "react";
import { Box, Grid, Text, Button, HStack, useDisclosure, Spinner } from "@chakra-ui/react";
import { useHolidayCalendar } from "../../hook/useHolidayCalendar";
import HolidayCalendarGrid from "../../components/layout/HRMaster/Hoilday/HolidayCalendarGrid";
import HolidayList from "../../components/layout/HRMaster/Hoilday/HolidayList";
import HolidayFormModal from "../../components/layout/HRMaster/Hoilday/HolidayFormModal";
import { holidayTokens as t } from "../../theme/holidayTokens";

const HolidayCalendar = () => {
  const {
    month, year, loading,
    existingHolidays, festivalSuggestions, pendingSelection,
    changeMonth, goToMonthYear, availableYears,
    togglePendingDate, removePendingDate, savePendingHolidays,
    editHoliday, removeHoliday,
  } = useHolidayCalendar();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalMode, setModalMode] = useState("add");
  const [activeDate, setActiveDate] = useState(null);
  const [activeHoliday, setActiveHoliday] = useState(null);

  const handleDateClick = (dateStr, hint) => {
    setModalMode("add");
    setActiveDate(dateStr);
    setActiveHoliday({ holiday_name: hint || "" });
    onOpen();
  };

  const handleSavedHolidayClick = (holiday) => {
    setModalMode("edit");
    setActiveDate(holiday.holiday_date.slice(0, 10));
    setActiveHoliday(holiday);
    onOpen();
  };

  const handleModalSubmit = (name) => {
    if (modalMode === "add") {
      togglePendingDate(activeDate, name);
    } else {
      editHoliday(activeHoliday.id, activeDate, name);
    }
    onClose();
  };

  const handleModalDelete = () => {
    removeHoliday(activeHoliday.id);
    onClose();
  };

  return (
    // No page-level background or title here — the parent HolidayCalendarLayout
    // already supplies the breadcrumb, the "Holiday Calendar" heading, and the
    // white card this renders inside. This component only owns the content.
    <Box fontFamily={t.fontBody}>
      <Text fontSize="12.5px" color={t.ink} opacity={0.55} mb={4} textAlign={{ base: "left", md: "center" }}>
        Click a date to mark a holiday, or select several before saving.
      </Text>

      {loading ? (
        <HStack justify="center" py={16}>
          <Spinner color={t.forest} thickness="2.5px" />
        </HStack>
      ) : (
        <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={5} pb={pendingSelection.length ? 20 : 0}>
          <HolidayCalendarGrid
            month={month}
            year={year}
            existingHolidays={existingHolidays}
            festivalSuggestions={festivalSuggestions}
            pendingSelection={pendingSelection}
            availableYears={availableYears}
            onDateClick={handleDateClick}
            onSavedHolidayClick={handleSavedHolidayClick}
            onChangeMonth={changeMonth}
            onGoToMonthYear={goToMonthYear}
          />

          <HolidayList
            holidays={existingHolidays}
            onEdit={handleSavedHolidayClick}
            onDelete={removeHoliday}
          />
        </Grid>
      )}

      {/* Ticket-stub save bar — fixed, so it doesn't get lost while HR scrolls the grid.
          left offset matches the layout's sidebar width so it doesn't run under it. */}
      {pendingSelection.length > 0 && (
        <HStack
          position="fixed"
          bottom={0}
          left={{ base: 0, md: "295px" }}
          right={0}
          bg={t.forest}
          px={{ base: 4, md: 8 }}
          py={3.5}
          justify="space-between"
          boxShadow="0 -6px 20px -6px rgba(30,42,31,0.35)"
          borderTop={`1px solid ${t.forestDark}`}
          zIndex={10}
        >
          <HStack spacing={2.5}>
            <Box w="6px" h="6px" borderRadius="50%" bg={t.wheat} />
            <Text fontSize="13px" color="white">
              {pendingSelection.length} date{pendingSelection.length > 1 ? "s" : ""} selected
            </Text>
          </HStack>
          <Button
            size="sm"
            bg={t.wheat}
            color="white"
            borderRadius={t.radiusSm}
            fontWeight="600"
            _hover={{ bg: "#A87729" }}
            onClick={savePendingHolidays}
          >
            Save holidays
          </Button>
        </HStack>
      )}

      <HolidayFormModal
        isOpen={isOpen}
        onClose={onClose}
        mode={modalMode}
        initialDate={activeDate}
        initialName={activeHoliday?.holiday_name}
        onSubmit={handleModalSubmit}
        onDelete={handleModalDelete}
      />
    </Box>
  );
};

export default HolidayCalendar;