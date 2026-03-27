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
  TableContainer
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";

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
        <Box
         bg="white"
         mt={{base:2, md:5}}
         px={{base:3, md:6}}
         py={{base:3, md:4}}
        borderRadius="lg"
        boxShadow="md"
     >
         <HStack justifyContent="space-between">
                  <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
                    <BreadcrumbItem>
                      <BreadcrumbLink as={Link}  to="/dashboard">
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
      <TableContainer border="1px solid #e0e2e6"  mb={6} mt={2} borderRadius="lg">
      <Table variant="simple" >
        <Thead bgColor="#d9e5f8">
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
      </TableContainer>

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