import React from "react";
import { Box, Grid, Text, VStack, IconButton, Select, HStack } from "@chakra-ui/react";
import { holidayTokens as t } from "../../../../theme/holidayTokens";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const HolidayCalendarGrid = ({
  month, year, existingHolidays, festivalSuggestions, pendingSelection,
  availableYears, onDateClick, onSavedHolidayClick, onChangeMonth, onGoToMonthYear,
}) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOffset = new Date(year, month - 1, 1).getDay();
  const dateStrFor = (d) => `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const findExisting = (dateStr) =>
    existingHolidays.find((h) => h.holiday_date.startsWith(dateStr));
  const isPending = (dateStr) => pendingSelection.some((p) => p.date === dateStr);

  // Purely visual — highlights today's cell, doesn't touch any data flow
  const today = new Date();
  const isToday = (d) =>
    today.getFullYear() === year && today.getMonth() === month - 1 && today.getDate() === d;

  const cells = [];
  for (let i = 0; i < firstDayOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <Box
      bg={t.paper}
      borderRadius={t.radius}
      border={`1px solid ${t.line}`}
      boxShadow={t.shadowCard}
      overflow="hidden"
    >
      {/* Header band — ledger-cover green with a faint hairline texture, one bold moment */}
      <Box
        bg={t.forest}
        px={5}
        py={4}
        position="relative"
        backgroundImage={`repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 10px)`}
      >
        <HStack justify="space-between">
          <IconButton
            aria-label="Previous month"
            size="sm"
            variant="ghost"
            color="white"
            _hover={{ bg: "whiteAlpha.200" }}
            _active={{ bg: "whiteAlpha.300" }}
            onClick={() => onChangeMonth(-1)}
          >
            ‹
          </IconButton>

          <HStack spacing={2} justifyContent="space-between" width="100%">
            <Text
              fontFamily={t.fontDisplay}
              fontWeight="600"
              fontSize="16px"
              color="white"
              lineHeight="1"
              letterSpacing="0.2px"
            >
              {MONTH_NAMES[month - 1]} {year}
            </Text>
            <HStack >
              <Select
                size="xs"
                width="112px"
                bg="whiteAlpha.200"
                color="white"
                border="1px solid"
                borderColor="whiteAlpha.300"
                borderRadius={t.radiusSm}
                fontSize="12px"
                sx={{
                  "& option": { color: "black" },
                  "& > option": { backgroundColor: "white" },
                }}
                iconColor="white"
                value={month}
                onChange={(e) => onGoToMonthYear(Number(e.target.value), year)}
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx + 1}>{name}</option>
                ))}
              </Select>
              <Select
                size="xs"
                width="82px"
                bg="whiteAlpha.200"
                color="white"
                border="1px solid"
                borderColor="whiteAlpha.300"
                borderRadius={t.radiusSm}
                fontSize="12px"
                sx={{
                  "& option": { color: "black" },
                  "& > option": { backgroundColor: "white" },
                }}
                iconColor="white"
                value={year}
                onChange={(e) => onGoToMonthYear(month, Number(e.target.value))}
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Select>
            </HStack>
          </HStack>

          <IconButton
            aria-label="Next month"
            size="sm"
            variant="ghost"
            color="white"
            _hover={{ bg: "whiteAlpha.200" }}
            _active={{ bg: "whiteAlpha.300" }}
            onClick={() => onChangeMonth(1)}
          >
            ›
          </IconButton>
        </HStack>
      </Box>

      <Box p={4}>
        <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={2}>
          {WEEKDAYS.map((w, i) => (
            <Text
              key={`${w}-${i}`}
              fontSize="11px"
              fontWeight="600"
              color={t.ink}
              opacity={0.4}
              textAlign="center"
              fontFamily={t.fontBody}
            >
              {w}
            </Text>
          ))}
        </Grid>

        <Grid templateColumns="repeat(7, 1fr)" gap={1.5}>
          {cells.map((d, idx) => {
            if (d === null) return <Box key={`blank-${idx}`} />;

            const dateStr = dateStrFor(d);
            const isSunday = new Date(year, month - 1, d).getDay() === 0;
            const existing = findExisting(dateStr);
            const hint = festivalSuggestions[dateStr];
            const pending = isPending(dateStr);
            const todayCell = isToday(d);

            // Ledger-style: a thin top accent bar signals state, not a full fill —
            // keeps the grid legible instead of turning into a color-block calendar
            let accentColor = "transparent";
            if (existing) accentColor = t.terracotta;
            else if (pending) accentColor = t.wheat;

            return (
              <VStack
                key={dateStr}
                spacing={0}
                minH="62px"
                borderRadius={t.radiusSm}
                bg={pending ? t.wheatLight : existing ? t.terracottaLight : isSunday ? t.sage100 : "white"}
                border="1px solid"
                borderColor={
                  todayCell && !existing && !pending ? t.forest : existing || pending ? "transparent" : t.lineSoft
                }
                cursor={isSunday ? "default" : "pointer"}
                opacity={isSunday ? 0.55 : 1}
                justify="flex-start"
                position="relative"
                overflow="hidden"
                onClick={() => {
                  if (isSunday) return;
                  if (existing) onSavedHolidayClick(existing);
                  else onDateClick(dateStr, hint);
                }}
                _hover={
                  !isSunday
                    ? { borderColor: t.forest, boxShadow: `0 3px 8px -3px rgba(46,83,57,0.28)` }
                    : {}
                }
                transition="border-color 0.14s ease, box-shadow 0.14s ease"
              >
                <Box w="100%" h="3px" bg={accentColor} flexShrink={0} />
                <VStack spacing={0} pt={1.5} px={1} flex={1} justify="center" position="relative" w="100%">
                  <Text
                    fontSize="13px"
                    fontWeight={todayCell ? "700" : "600"}
                    color={todayCell ? t.forest : t.ink}
                    fontFamily={t.fontBody}
                    sx={{ fontFeatureSettings: '"tnum"' }}
                  >
                    {d}
                  </Text>
                  {existing && (
                    <Text
                      fontSize="8px"
                      color={t.terracottaDark}
                      fontWeight="600"
                      textAlign="center"
                      noOfLines={1}
                      px={0.5}
                    >
                      {existing.holiday_name}
                    </Text>
                  )}
                  {!existing && hint && (
                    <Text
                      fontSize="8px"
                      color={t.wheat}
                      textAlign="center"
                      noOfLines={1}
                      px={0.5}
                      fontStyle="italic"
                    >
                      {hint}
                    </Text>
                  )}
                </VStack>
              </VStack>
            );
          })}
        </Grid>

        {/* Legend — explains the ledger marks, doesn't decorate */}
        <HStack mt={4} pt={3} spacing={5} fontSize="11px" color={t.ink} opacity={0.65} borderTop={`1px dashed ${t.line}`}>
          <HStack spacing={1.5}>
            <Box w="10px" h="3px" bg={t.terracotta} borderRadius="2px" />
            <Text>Saved holiday</Text>
          </HStack>
          <HStack spacing={1.5}>
            <Box w="10px" h="3px" bg={t.wheat} borderRadius="2px" />
            <Text>Suggested festival</Text>
          </HStack>
          <HStack spacing={1.5}>
            <Box w="10px" h="10px" borderRadius="2px" border={`1px solid ${t.forest}`} />
            <Text>Today</Text>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
};

export default HolidayCalendarGrid;