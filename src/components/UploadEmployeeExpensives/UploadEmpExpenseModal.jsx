import {
  Modal,
  ModalOverlay,
  Flex,
  Text,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  Progress
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

  // reusable block (same UI for all)
  const ExpenseRow = (title, allocated, used) => {
    const percent = getPercent(used, allocated);
    const remaining = allocated - used;

    return (
      <Box mb={6}>
        <Text  fontWeight="bold" letterSpacing="1px">
          {title}
        </Text>

        <Text  fontSize="sm" mt={1}>
          Allocated: {allocated} | Used: {used} | Remaining: {remaining}
        </Text>

        <Flex align="center" mt={2}>
          <Progress
            value={percent}
            flex="1"
            size="xs"
            borderRadius="2px"
            bg="gray.700"
            colorScheme={getColor(percent)}
          />

          <Text color="gray.300" fontSize="xs" ml={2} minW="35px">
            {percent}%
          </Text>
        </Flex>
      </Box>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered  >
      <ModalOverlay  />

      <ModalContent  borderRadius="12px" mx="20px">

        {/* Header */}
         <Flex
          bg="blue.500"
          color="white"
          px={4}
          py={3}
          justifyContent="space-between"
          alignItems="center"
          borderTopRadius="12px"
        >
          <Text fontWeight="bold">Employee Expense</Text>

          <ModalCloseButton position="static" color="white" />
        </Flex>

        {/* Body */}
        <ModalBody p={5}>
          {selectData ? (
            <Box>

              {/* 👤 Name */}
              <Flex align="center" mb={5}>
                <Text fontSize="lg">👤</Text>
                <Text ml={2}>
                  {selectData.employee_name}
                </Text>
              </Flex>

              {/* HOTEL */}
              {ExpenseRow(
                "HOTEL",
                selectData.allocation?.HOTEL || 0,
                selectData.usage?.HOTEL || 0
              )}

              {/* TRAVEL */}
              {ExpenseRow(
                "TRAVEL (Bus/Train/Toll)",
                selectData.allocation?.BUS_TRAIN_TOLL || 0,
                selectData.usage?.BUS_TRAIN_TOLL || 0
              )}

              {/* PETROL */}
              {ExpenseRow(
                "PETROL",
                selectData.allocation?.PETROL_DIESEL || 0,
                selectData.usage?.PETROL_DIESEL || 0
              )}

              {/* OTHER */}
              {ExpenseRow(
                "OTHER",
                selectData.allocation?.OTHER || 0,
                selectData.usage?.OTHER || 0
              )}

            </Box>
          ) : (
            <Text>No Data Found</Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default UploadEmpExpenseModal;