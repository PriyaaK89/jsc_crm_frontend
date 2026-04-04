import {
  Modal,
  ModalOverlay,
  Flex,
  Text,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  Progress,
  Avatar,
  Divider,
} from "@chakra-ui/react";

const UploadEmpExpenseModal = ({ isOpen, onClose, selectData }) => {
  const getPercent = (used, total) => {
    if (!total) return 0;
    return Math.round((used / total) * 100);
  };

  const getColor = (percent) => {
    if (percent <= 50) return "green";
    if (percent <= 80) return "yellow";
    return "red";
  };

  const ExpenseRow = (title, allocated, used) => {
    const percent = getPercent(used, allocated);
    const remaining = allocated - used;

    return (
      <Box
        p={4}
        borderRadius="10px"
        bg="gray.50"
        boxShadow="sm"
        mb={4}
      >
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontWeight="600" fontSize="lg">
            {title}
          </Text>

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
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />

      <ModalContent borderRadius="16px" overflow="hidden">
        
        {/* Header */}
        <Flex
          bg="blue.600"
          color="white"
          px={5}
          py={4}
          align="center"
          justify="space-between"
        >
          <Text fontWeight="600" fontSize="md">
            Employee Expense Overview
          </Text>
          <ModalCloseButton position="static" color="white" />
        </Flex>

        {/* Body */}
        <ModalBody p={5}>
          {selectData ? (
            <>
              {/* 👤 Profile */}
              <Flex align="center" mb={5}>
                <Avatar
                  size="md"
                  name={selectData.employee_name}
                  mr={3}
                />
                <Box>
                  <Text fontWeight="600" fontSize="lg">
                    {selectData.employee_name}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    Expense Summary
                  </Text>
                </Box>
              </Flex>

              <Divider mb={4} />

              {/* Expense Sections */}
              {ExpenseRow(
                "🏨 Hotel",
                selectData.allocation?.HOTEL || 0,
                selectData.usage?.HOTEL || 0
              )}

              {ExpenseRow(
                "🚌 Travel",
                selectData.allocation?.BUS_TRAIN_TOLL || 0,
                selectData.usage?.BUS_TRAIN_TOLL || 0
              )}

              {ExpenseRow(
                "⛽ Petrol",
                selectData.allocation?.PETROL_DIESEL || 0,
                selectData.usage?.PETROL_DIESEL || 0
              )}

              {ExpenseRow(
                "📦 Other",
                selectData.allocation?.OTHER || 0,
                selectData.usage?.OTHER || 0
              )}
            </>
          ) : (
            <Text textAlign="center" color="gray.500">
              No Data Found
            </Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default UploadEmpExpenseModal;