import React, { useState, useEffect } from "react";
import {
  Box,
  Select,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Text,
  Flex,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Link,
} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const TRANSACTION_TYPES = [
  "Sales",
  "Purchase",
  "Credit Note",
  "Debit Note",
  "Payment",
  "Receipt",
];

const TransactionDocReport = () => {
  const [transactionType, setTransactionType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [transactionDoc, setTransactionDoc] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const getTransactionDocument = async () => {
    if (!transactionType) return;

    setLoading(true);
    try {
      const res = await API?.get(API_ENDPOINTS?.GET_TRANSACTION_REPORT_IMAGES, {
        params: {
          transaction_type: transactionType,
          date: selectedDate || undefined,
        },
      });

      setTransactionDoc(res?.data?.data || []);
    } catch (error) {
      console.log(error, "Error in fetching API.");
      setTransactionDoc([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShow = () => {
    getTransactionDocument();
  };

  const openImagePreview = (url) => {
    if (!url) return;
    setPreviewImage(url);
    onOpen();
  };

  const filteredData = transactionDoc.filter((row) =>
    row.transaction_no?.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderDocCell = (url, label) => {
    if (!url) return <Text color="gray.400">-</Text>;
    return (
      <Link color="blue.500" onClick={() => openImagePreview(url)} cursor="pointer">
        {label}
      </Link>
    );
  };

  return (
    <Box p={4}>
      {/* Filter section */}
      <Box border="1px solid #e2e2e2" borderRadius="md" p={4} mb={4}>
        <Text fontWeight="bold" mb={3}>
          View Transaction Documents
        </Text>

        <Flex gap={4} align="flex-end" flexWrap="wrap">
          <Box>
            <Text fontSize="sm" mb={1}>
              Select Transaction Type
            </Text>
            <Select
              placeholder="--Please Select--"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              width="220px"
            >
              {TRANSACTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </Box>

          <Box>
            <Text fontSize="sm" mb={1}>
              Select Date
            </Text>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              width="180px"
            />
          </Box>

          <Button colorScheme="blue" onClick={handleShow} isLoading={loading}>
            Show
          </Button>
        </Flex>
      </Box>

      {/* Report section */}
      <Box border="1px solid #e2e2e2" borderRadius="md" p={4}>
        <Text fontWeight="bold" mb={3}>
          Report
        </Text>

        <Flex justify="flex-end" mb={3}>
          <Input
            placeholder="Search:"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            width="220px"
          />
        </Flex>

        {loading ? (
          <Flex justify="center" py={8}>
            <Spinner />
          </Flex>
        ) : (
          <Table size="sm" variant="striped">
            <Thead>
              <Tr>
                <Th>Transaction No</Th>
                <Th>Transaction Date</Th>
                <Th>Bill-T Doc</Th>
                <Th>Dispatch Doc</Th>
                <Th>Others</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredData.length === 0 ? (
                <Tr>
                  <Td colSpan={5} textAlign="center">
                    No data available
                  </Td>
                </Tr>
              ) : (
                filteredData.map((row, idx) => (
                  <Tr key={idx}>
                    <Td>{row.transaction_no}</Td>
                    <Td>
                      {row.transaction_date
                        ? new Date(row.transaction_date).toLocaleDateString()
                        : "-"}
                    </Td>
                    <Td>{renderDocCell(row.bill_t_doc, "View")}</Td>
                    <Td>{renderDocCell(row.dispatch_doc, "View")}</Td>
                    <Td>{renderDocCell(row.others, "View")}</Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Image preview modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={6}>
            {previewImage && (
              <Image src={previewImage} alt="Document preview" w="100%" objectFit="contain" />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TransactionDocReport;