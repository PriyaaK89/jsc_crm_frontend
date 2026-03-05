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
  BreadcrumbLink
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
    <Box p={6}>
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
        <Input value="3044" />
      </FormControl>

      {/* Account */}
      <FormControl mb={6}>
        <FormLabel>Account</FormLabel>
        <Select placeholder="Select Account">
        </Select>
      </FormControl>

      {/* Table */}
      <Table variant="simple" mb={6} border="1px solid #cdcdcd" mt={2}>
        <Thead bgColor="aliceblue">
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
                <Select>
                  <option>End Of List</option>
                  <option>Test 1</option>
                </Select>
              </Td>

              <Td>
                <Input type="number" defaultValue="0" />
              </Td>

              <Td>
                <Input type="number" defaultValue="0" />
              </Td>

              <Td>
                <Select placeholder="Please select">
                  <option>Cash</option>
                  <option>Cheque/DD</option>
                  <option>e-Fund Transfer</option>
                  <option>Other</option>
                </Select>
              </Td>

              <Td>
                <Select placeholder="Select Bank">
                </Select>
              </Td>

              <Td>
                <Flex gap={2}>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={handleAddRow}
                  >
                    Add
                  </Button>

                  {index !== 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
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

      {/* Total Amount */}
      <FormControl mb={4}>
        <FormLabel>Total Amount</FormLabel>
        <Input type="number" />
      </FormControl>

      {/* Narration */}
      <FormControl mb={4}>
        <FormLabel>Narration</FormLabel>
        <Textarea placeholder="Enter narration..." />
      </FormControl>

      {/* Upload Document */}
      <FormControl mb={6}>
        <FormLabel>Upload Document *</FormLabel>
        <Input type="file" p={1} />
      </FormControl>

      {/* Save Button */}
      <Flex justify="flex-end">
        <Button colorScheme="blue">
          SAVE
        </Button>
      </Flex>
    </Box>
  );
};

export default Payment;