import { Flex, Box, HStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Text, VStack, Select, Spinner, IconButton, Divider } from "@chakra-ui/react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import { useYearlyHolidays } from "../../hook/useYearlyHolidays";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import MobileTopbar from "../../components/layout/MobileTopbar";
import NotificationBtn from "../../components/NotificationBtn/NotificationBtn";
import { holidayTokens as t } from "../../theme/holidayTokens";
import { FiTrash2 } from "react-icons/fi";
import DeleteHolidayModal from "../../components/layout/HRMaster/Hoilday/DeleteHolidayModal"; // adjust path

const YearlyHolidayCalendarLayout = () => {
  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const { year, setYear, holidays, loading, removeHoliday, availableYears } = useYearlyHolidays();
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const grouped = holidays.reduce((acc, h) => {
    const m = new Date(h.holiday_date).getMonth();
    if (!acc[m]) acc[m] = [];
    acc[m].push(h);
    return acc;
  }, {});

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await removeHoliday(pendingDelete.id);
      setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box bg="#f2f1f1" minH="100vh">
      {/* ... sidebar/topbar unchanged ... */}
      <Box display={{ base: "none", md: "block" }}><Sidebar /></Box>
      <Box display={{ base: "none", md: "block" }}><Topbar /></Box>
      <Box display={{ base: "block", md: "none" }}><MobileTopbar /></Box>

      <Box ml={{ base: 5, md: "295px" }} mr={{ base: 5, md: 5 }} pt="5rem" pb={6}>
        <NotificationBtn />
        <Box bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="md">
          <HStack justifyContent="space-between">
            <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} to="/dashboard"> <GoHomeFill color="#5570F1" /> </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink color="#8B8D97" fontSize="13px"> Company Holiday Calendar </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </HStack>

          <Text className="action_heading" mb={6} textAlign="center"> Holiday Calendar</Text>

          <Box>
            <Box bg={t.cream} minH="100vh" px={{ base: 4, md: 8 }} py={6} fontFamily={t.fontBody} borderRadius="8px">
              <HStack justify="space-between" mb={5} flexWrap="wrap">
                <VStack align="start" spacing={0}>
                 
                  <Text fontFamily={t.fontDisplay} fontSize="22px" fontWeight="600" color={t.ink}>
                    All holidays — {year}
                  </Text>
                </VStack>

                <Select
                  size="sm" width="110px" bg="white" borderColor={t.line}
                  value={year} onChange={(e) => setYear(Number(e.target.value))}
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </Select>
              </HStack>

              {loading ? (
                <Spinner color={t.forest} />
              ) : holidays.length === 0 ? (
                <Box bg="white" border={`1px solid ${t.line}`} borderRadius="4px" px={5} py={8} textAlign="center">
                  <Text fontSize="13px" color={t.ink} opacity={0.55}>
                    No holidays marked for {year} yet.
                  </Text>
                </Box>
              ) : (
                <VStack align="stretch" spacing={4}>
                  {Object.keys(grouped)
                    .sort((a, b) => a - b)
                    .map((monthIdx) => (
                      <Box key={monthIdx} bg="white" borderRadius="4px" border={`1px solid ${t.line}`} overflow="hidden">
                        <Box px={4} py={2.5} bg={t.sage100} borderBottom={`1px solid ${t.line}`}>
                          <Text fontSize="12.5px" fontWeight="600" color={t.forest}>
                            {MONTH_NAMES[monthIdx]}
                          </Text>
                        </Box>

                        <VStack align="stretch" spacing={0} divider={<Divider borderColor={t.line} />}>
                          {grouped[monthIdx].map((h) => (
                            <HStack key={h.id} justify="space-between" px={4} py={3}>
                              <HStack spacing={3}>
                                <Text
                                  fontFamily={t.fontDisplay} fontSize="17px" fontWeight="600"
                                  color={t.terracotta} minW="28px"
                                >
                                  {new Date(h.holiday_date).getDate()}
                                </Text>
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="13px" fontWeight="500" color={t.ink}>
                                    {h.holiday_name}
                                  </Text>
                                  <Text fontSize="10.5px" color={t.ink} opacity={0.5}>
                                    {new Date(h.holiday_date).toLocaleDateString("en-IN", { weekday: "long" })}
                                  </Text>
                                </VStack>
                              </HStack>

                              <IconButton
                                aria-label="Delete holiday"
                                size="xs"
                                variant="ghost"
                                color={t.terracotta}
                                opacity={0.65}
                                icon={<FiTrash2 size={15} />}
                                _hover={{ opacity: 1, bg: t.terracottaLight }}
                                onClick={() => setPendingDelete(h)}
                              />
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    ))}
                </VStack>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

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

export default YearlyHolidayCalendarLayout;