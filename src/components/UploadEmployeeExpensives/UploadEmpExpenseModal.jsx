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
} from "@chakra-ui/react";
import { ViewIcon, CloseIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { RepeatIcon } from "@chakra-ui/icons";

const UploadEmpExpenseModal = ({ isOpen, onClose, selectData }) => {
  const [rotation, setRotation] = useState(0);
  const [previewImg, setPreviewImg] = useState(null);

  const {
    isOpen: isPreviewOpen,
    onOpen,
    onClose: onPreviewClose,
  } = useDisclosure();

  const openPreview = (img) => {
    setPreviewImg(img);
    setRotation(0); //for ration 
    onOpen();
  };

  // ✅ helpers
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

  // ✅ reusable row
  const ExpenseRow = ({ title, allocated = 0, used = 0 }) => {
    const percent = getPercent(used, allocated);
    const remaining = allocated - used;

    return (
      <Box p={4} borderRadius="10px" bg="gray.50" boxShadow="sm" mb={4}>
        <Flex justify="space-between" mb={2}>
          <Text fontWeight="600">{title}</Text>
          <Text fontSize="sm" color="gray.500">
            {percent}%
          </Text>
        </Flex>

        <Progress
          value={percent}
          size="sm"
          borderRadius="6px"
          colorScheme={getColor(percent)}
        />

        <Flex justify="space-between" mt={2} fontSize="xs" color="gray.600">
          <Text>Allocated: {allocated}</Text>
          <Text>Used: {used}</Text>
          <Text>Left: {remaining}</Text>
        </Flex>
      </Box>
    );
  };

  return (
    <>
      {/* 🔵 MAIN MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg" >
        <ModalOverlay />
        <ModalContent borderRadius="16px" maxH="90vh">
          {/* Header */}
          <Flex
            bg="blue.600"
            color="white"
            px={5}
            py={4}
            justify="space-between"
            align="center"
          >
            <Text fontWeight="600">Employee Expense Overview</Text>
            <ModalCloseButton position="static" color="white" />
          </Flex>

          {/* Scrollable Body */}
          <ModalBody p={5} overflowY="auto">
            {selectData ? (
              <>
                {/* 👤 Profile */}
                <Flex align="center" mb={5}>
                  <Avatar name={selectData?.employee_name} mr={3} />
                  <Box>
                    <Text fontWeight="600">
                      {selectData?.employee_name}
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      Expense Summary
                    </Text>
                  </Box>
                </Flex>

                <Divider mb={4} />

                {/* 💰 Expense Summary */}
                <ExpenseRow
                  title="🏨 Hotel"
                  allocated={selectData?.allocation?.HOTEL}
                  used={selectData?.usage?.HOTEL}
                />
                <ExpenseRow
                  title="🚌 Travel"
                  allocated={selectData?.allocation?.BUS_TRAIN_TOLL}
                  used={selectData?.usage?.BUS_TRAIN_TOLL}
                />
                <ExpenseRow
                  title="⛽ Petrol"
                  allocated={selectData?.allocation?.PETROL_DIESEL}
                  used={selectData?.usage?.PETROL_DIESEL}
                />
                <ExpenseRow
                  title="📦 Other"
                  allocated={selectData?.allocation?.OTHER}
                  used={selectData?.usage?.OTHER}
                />

                {/* 📸 Bills Section */}
                {selectData?.entries?.length > 0 && (
                  <Box mt={6}>
                    <Text fontWeight="600" mb={3}>
                      Expense Bills
                    </Text>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {selectData.entries.map((item) => (
                        <Box
                          key={item.id}
                          borderRadius="12px"
                          overflow="hidden"
                          boxShadow="sm"
                          bg="white"
                          _hover={{ boxShadow: "lg" }}
                          transition="0.2s"
                        >
                          {/* Image */}
                          <Box position="relative">
                            <Image
                              src={item.bill_url}
                              fallbackSrc="https://via.placeholder.com/300"
                              objectFit="cover"
                              w="100%"
                              h="150px"
                            />

                            {/* 👁 */}
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

                            {/* 💰 */}
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

                          {/* Details */}
                          <Box p={3}>
                            <Flex justify="space-between" mb={1}>
                              <Text fontSize="sm" fontWeight="600">
                                {formatType(item.expense_type)}
                              </Text>

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
                )}
              </>
            ) : (
              <Text textAlign="center">No Data Found</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* 🔍 IMAGE PREVIEW */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.700" />

        <ModalContent
          bg="transparent"
          boxShadow="none"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            position="relative"
            role="group"
            w="90vw"
            h="80vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {/*  CLOSE BUTTON */}
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

            {/*  ROTATE BUTTON */}
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

            {/* 📸 IMAGE WRAPPER (IMPORTANT FIX) */}
            <Box
              maxW="100%"
              maxH="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
              borderRadius="lg"
            >
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