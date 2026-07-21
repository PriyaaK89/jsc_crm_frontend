import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  Flex,
  Text,
  Avatar,
  Divider,
  Progress,
  Image,
  SimpleGrid,
  IconButton,
  useDisclosure,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { ViewIcon, CloseIcon, RepeatIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import CustomDatePicker from "../common/CustomDatepicker";

const todayStr = () => new Date().toISOString().slice(0, 10);

const UploadEmpExpenseModal = ({ isOpen, onClose, selectData }) => {
  const [rotation, setRotation] = useState(0);
  const [previewImg, setPreviewImg] = useState(null);
  const { isOpen: isPreviewOpen, onOpen, onClose: onPreviewClose } = useDisclosure();

  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(todayStr());
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null); // fresh data from admin-expense-by-date

  const openPreview = (img) => {
    setPreviewImg(img);
    setRotation(0);
    onOpen();
  };

  const getPercent = (used, total) =>
    total ? Math.round((used / total) * 100) : 0;

  const getColor = (percent) => {
    if (percent <= 50) return "green";
    if (percent <= 80) return "yellow";
    return "red";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatType = (type) => type?.replaceAll("_", " ");

  // fetch fresh, date-scoped data for this employee whenever
  // the modal opens or the admin changes the date range inside it
  const fetchDetail = async (employeeId, start, end) => {
    if (!employeeId || !start || !end) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("employee_id", employeeId);
      params.append("start_date", start);
      params.append("end_date", end);

      const url = `${API_ENDPOINTS?.get_employee_expense_by_date}?${params.toString()}`;
      const response = await API.get(url);

      if (response.status === 200) {
        setDetail(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch employee expense detail:", error);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

  // whenever the modal opens with a new employee, reset to today and fetch
  useEffect(() => {
    if (isOpen && selectData?.user_id) {
      const s = todayStr();
      const e = todayStr();
      setStartDate(s);
      setEndDate(e);
      fetchDetail(selectData.user_id, s, e);
    }
    if (!isOpen) {
      setDetail(null); // clear stale data when modal closes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectData?.user_id]);

  const handleStartChange = (date) => {
    setStartDate(date);
    fetchDetail(selectData?.user_id, date, endDate);
  };

  const handleEndChange = (date) => {
    setEndDate(date);
    fetchDetail(selectData?.user_id, startDate, date);
  };

  const summary = detail?.summary || {};
  const entries = detail?.entries || [];
  const employeeName = detail?.employee?.name || selectData?.employee_name;

  const ExpenseRow = ({ title, type }) => {
    const allocated = parseFloat(summary?.[type]?.allocated_amount || 0);
    const used = parseFloat(summary?.[type]?.used_amount || 0);
    const remaining = parseFloat(summary?.[type]?.remaining_amount ?? (allocated - used));
    const percent = getPercent(used, allocated);
    const overBudget = used > allocated;

    return (
      <Box p={4} borderRadius="10px" bg="gray.50" boxShadow="sm" mb={4}>
        <Flex justify="space-between" mb={2} align="center">
          <Flex align="center" gap={2}>
            <Text fontWeight="600">{title}</Text>
            {overBudget && (
              <Badge colorScheme="red" fontSize="10px">
                Over budget
              </Badge>
            )}
          </Flex>
          <Text fontSize="sm" color="gray.500">
            {percent}%
          </Text>
        </Flex>

        <Progress
          value={Math.min(percent, 100)}
          size="sm"
          borderRadius="6px"
          colorScheme={getColor(percent)}
        />

        <Flex justify="space-between" mt={2} fontSize="xs" color="gray.600">
          <Text>Allocated: ₹{allocated}</Text>
          <Text>Used: ₹{used}</Text>
          <Text>Left: ₹{remaining}</Text>
        </Flex>
      </Box>
    );
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="16px" maxH="90vh">
          <Flex bg="blue.600" color="white" px={5} py={4} justify="space-between" align="center">
            <Text fontWeight="600">Employee Expense Overview</Text>
            <ModalCloseButton position="static" color="white" />
          </Flex>

          <ModalBody p={5} overflowY="auto">
            {selectData ? (
              <>
                <Flex align="center" mb={4}>
                  <Avatar name={employeeName} mr={3} />
                  <Box>
                    <Text fontWeight="600">{employeeName}</Text>
                    <Text fontSize="xs" color="gray.400">
                      Expense Summary
                    </Text>
                  </Box>
                </Flex>

                {/* Date range picker — lets admin drill into any specific day/range */}
                <Flex gap={3} mb={4} flexWrap="wrap">
                  <Box flex="1" minW="140px">
                    <CustomDatePicker
                      label="Start Date"
                      name="detail_start"
                      value={startDate}
                      onChange={handleStartChange}
                    />
                  </Box>
                  <Box flex="1" minW="140px">
                    <CustomDatePicker
                      label="End Date"
                      name="detail_end"
                      value={endDate}
                      onChange={handleEndChange}
                    />
                  </Box>
                </Flex>

                <Divider mb={4} />

                {loading ? (
                  <Flex justify="center" py={10}>
                    <Spinner size="lg" />
                  </Flex>
                ) : (
                  <>
                    <ExpenseRow title="🏨 Hotel" type="HOTEL" />
                    <ExpenseRow title="🚌 Travel" type="BUS_TRAIN_TOLL" />
                    <ExpenseRow title="⛽ Petrol" type="PETROL_DIESEL" />
                    <ExpenseRow title="📦 Other" type="OTHER" />

                    {entries.length > 0 ? (
                      <Box mt={6}>
                        <Text fontWeight="600" mb={3}>
                          Expense Bills ({formatDate(startDate)} – {formatDate(endDate)})
                        </Text>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          {entries.map((item) => (
                            <Box
                              key={item.id}
                              borderRadius="12px"
                              overflow="hidden"
                              boxShadow="sm"
                              bg="white"
                              _hover={{ boxShadow: "lg" }}
                              transition="0.2s"
                            >
                              <Box position="relative">
                                <Image
                                  src={item.bill_url}
                                  fallbackSrc="https://via.placeholder.com/300"
                                  objectFit="cover"
                                  w="100%"
                                  h="150px"
                                />

                                {item.bill_url && (
                                  <IconButton
                                    icon={<ViewIcon />}
                                    size="sm"
                                    position="absolute"
                                    top="8px"
                                    right="8px"
                                    onClick={() => openPreview(item.bill_url)}
                                    bg="blackAlpha.600"
                                    color="white"
                                    _hover={{ bg: "blackAlpha.800" }}
                                  />
                                )}

                                <Box
                                  position="absolute"
                                  bottom="8px"
                                  left="8px"
                                  bg="blackAlpha.700"
                                  color="white"
                                  px={2}
                                  py={1}
                                  borderRadius="6px"
                                  fontSize="xs"
                                >
                                  ₹ {item.amount}
                                </Box>
                              </Box>

                              <Box p={3}>
                                <Flex justify="space-between" mb={1}>
                                  <Text fontSize="sm" fontWeight="600">
                                    {formatType(item.expense_type)}
                                  </Text>
                                  <Badge fontSize="10px" colorScheme={item.status === "PENDING" ? "yellow" : "green"}>
                                    {item.status}
                                  </Badge>
                                </Flex>

                                <Text fontSize="12px" color="gray.500">
                                  📅 {formatDate(item.expense_date)}
                                </Text>

                                <Text fontSize="12px" mt={1} color="gray.600">
                                  {item.remarks || "No remarks"}
                                </Text>
                              </Box>
                            </Box>
                          ))}
                        </SimpleGrid>
                      </Box>
                    ) : (
                      <Text textAlign="center" color="gray.500" mt={6}>
                        No bills uploaded in this date range
                      </Text>
                    )}
                  </>
                )}
              </>
            ) : (
              <Text textAlign="center">No Data Found</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Image preview modal — unchanged */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.700" />
        <ModalContent bg="transparent" boxShadow="none" display="flex" alignItems="center" justifyContent="center">
          <Box position="relative" role="group" w="90vw" h="80vh" display="flex" alignItems="center" justifyContent="center">
            <IconButton
              icon={<CloseIcon />}
              position="absolute"
              top="10px"
              left="50%"
              transform="translateX(-50%)"
              zIndex="20"
              borderRadius="full"
              bg="white"
              size="sm"
              opacity={{ base: 1, md: 0 }}
              _groupHover={{ md: { opacity: 1 } }}
              onClick={onPreviewClose}
            />
            <IconButton
              icon={<RepeatIcon />}
              position="absolute"
              bottom="10px"
              left="50%"
              transform="translateX(-50%)"
              zIndex="20"
              borderRadius="full"
              bg="white"
              size="sm"
              opacity={{ base: 1, md: 0 }}
              _groupHover={{ md: { opacity: 1 } }}
              onClick={() => setRotation((prev) => prev + 90)}
            />
            <Box maxW="100%" maxH="100%" display="flex" alignItems="center" justifyContent="center" overflow="hidden" borderRadius="lg">
              <Image
                src={previewImg}
                alt="Preview"
                maxW="80vw"
                maxH="80vh"
                objectFit="contain"
                transform={`rotate(${rotation}deg)`}
                transition="0.3s ease"
                borderRadius="lg"
              />
            </Box>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UploadEmpExpenseModal;