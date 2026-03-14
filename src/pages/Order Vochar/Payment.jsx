import React, { useState } from "react";
import {
  Box,
  Text,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Flex,
  Textarea,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  TableContainer,
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";

const Payment = () => {
  const [rows, setRows] = useState([
    { particulars: "", balance: 0, amount: 0, type: "", bank: "" },
  ]);

  const handleAddRow = () => {
    setRows([
      ...rows,
      { particulars: "", balance: 0, amount: 0, type: "", bank: "" },
    ]);
  };

  const handleRemoveRow = (index) => {
    if (index === 0) return;
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  return (
    <Box bg="white" overflow="hidden">

      {/* Breadcrumb */}
      <HStack justifyContent="space-between" flexWrap="wrap">
        <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink fontSize="13px">
              Payment 
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      <Text fontSize="lg" fontWeight="bold" mb={6}>
        Payment 
      </Text>

      {/* Payment No */}
      <FormControl mb={4}>
        <FormLabel>Payment No.</FormLabel>
        <Input defaultValue="3044" />
      </FormControl>

      {/* Account */}
      <FormControl mb={6}>
        <FormLabel>Account</FormLabel>
        <Select placeholder="Select Account"></Select>
      </FormControl>

      {/* Responsive Table */}
      <TableContainer overflowX="auto" w="100%">
        <Table
          className="productsTable"
          minW="900px"
          border="1px solid #cdcdcd"
        >
          <Thead bg="gray.100">
            <Tr>
              <Th>Particulars</Th>
              <Th>Current Balance</Th>
              <Th>Amount</Th>
              <Th>Transaction Type</Th>
              <Th>Bank Name</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>

          <Tbody>
            {rows.map((row, index) => (
              <Tr key={index}>
                <Td>
                  <Select size="sm" minW="150px">
                    <option>End Of List</option>
                    <option>Test 1</option>
                  </Select>
                </Td>

                <Td>
                  <Input
                    size="sm"
                    type="number"
                    defaultValue="0"
                    minW="80px"
                  />
                </Td>

                <Td>
                  <Input
                    size="sm"
                    type="number"
                    defaultValue="0"
                    minW="80px"
                  />
                </Td>

                <Td>
                  <Select
                    size="sm"
                    minW="160px"
                    placeholder="Please select"
                  >
                    <option>Cash</option>
                    <option>Cheque/DD</option>
                    <option>e-Fund Transfer</option>
                    <option>Other</option>
                  </Select>
                </Td>

                <Td>
                  <Select size="sm" minW="150px" placeholder="Select Bank">
                    <option>SBI</option>
                    <option>HDFC</option>
                    <option>ICICI</option>
                  </Select>
                </Td>

                <Td>
                  <Flex gap={2}>
                    <Button
                      size="xs"
                      colorScheme="blue"
                      onClick={handleAddRow}
                    >
                      Add
                    </Button>

                    {index !== 0 && (
                      <Button
                        size="xs"
                        colorScheme="red"
                        onClick={() => handleRemoveRow(index)}
                      >
                        Delete
                      </Button>
                    )}
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Total Amount */}
      <FormControl mt={5}>
        <FormLabel>Total Amount</FormLabel>
        <Input type="number" />
      </FormControl>

      {/* Narration */}
      <FormControl mt={5}>
        <FormLabel>Narration</FormLabel>
        <Textarea placeholder="Enter narration..." />
      </FormControl>

      {/* Upload */}
      <FormControl mt={5}>
        <FormLabel>Upload Document *</FormLabel>
        <Input type="file" p={1} />
      </FormControl>

      {/* Save Button */}
      <Flex justify={{ base: "center", md: "flex-end" }} mt={6}>
        <Button colorScheme="blue" w={{ base: "100%", md: "200px" }}>
          SAVE
        </Button>
      </Flex>
    </Box>
  );
};

export default Payment;