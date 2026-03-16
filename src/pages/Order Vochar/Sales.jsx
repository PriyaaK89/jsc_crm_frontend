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
  SimpleGrid
} from "@chakra-ui/react";

import { GoHomeFill } from "react-icons/go";
import { IoMdAdd, IoMdRemove } from "react-icons/io";

const Sales = () => {

  const [party, setParty] = useState("");
  const [consignee, setConsignee] = useState("");

  const [rows, setRows] = useState([
    { item: "", qty: 0, rate: 0, unit: "", amount: 0 }
  ]);

  const handleAddRow = () => {
    setRows([
      ...rows,
      { item: "", qty: 0, rate: 0, unit: "", amount: 0 }
    ]);
  };

  const handleRemoveRow = (index) => {
    if (index === 0) return;
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  return (
    <Box p={6}>

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
              Sales
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      <Text fontSize="xl" fontWeight="bold" mb={6}>
        Sales
      </Text>

      {/* Sales No */}
      <FormControl mb={4}>
        <FormLabel>Sales No.</FormLabel>
        <Input value="2104" />
      </FormControl>

      {/* Party Name */}
      <FormControl mb={4}>
        <FormLabel>Party A/c Name</FormLabel>

        <Select
          placeholder="--Please Select--"
          value={party}
          onChange={(e) => setParty(e.target.value)}
        >
          <option value="test1">test1</option>
        </Select>

      </FormControl>

      {/* Consignee */}
      <FormControl mb={6}>
        <FormLabel>Is Consignee</FormLabel>

        <Select
          placeholder="--Please Select--"
          value={consignee}
          onChange={(e) => setConsignee(e.target.value)}
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </Select>

      </FormControl>

      {/* Dealer Details */}
      {consignee === "yes" && (

        <SimpleGrid columns={5} spacing={4} mb={6}>
          <Input placeholder="Dealer Name" />
          <Input placeholder="Prop Name" />
          <Input placeholder="Contact" />
          <Input placeholder="Address" />
          <Input placeholder="GST No" />
        </SimpleGrid>

      )}

      {/* Balance Section */}
      {party && (

        <SimpleGrid columns={3} spacing={4} mb={6}>
          <FormControl>
            <FormLabel>Current Balance</FormLabel>
            <Input defaultValue="0" />
          </FormControl>

          <FormControl>
            <FormLabel>Security Amount</FormLabel>
            <Input defaultValue="10000" />
          </FormControl>

          <FormControl>
            <FormLabel>Credit Limit</FormLabel>
            <Input defaultValue="50000" />
          </FormControl>
        </SimpleGrid>

      )}

      {/* Item Table */}
      {party && (

        <Table variant="simple" border="1px solid #cdcdcd" mb={6}>

          <Thead bg="gray.100">
            <Tr>
              <Th>Name of Item</Th>
              <Th>Billed Qty.</Th>
              <Th>Rate</Th>
              <Th>Unit</Th>
              <Th>Amount</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>

          <Tbody>

            {rows.map((row, index) => (

              <Tr key={index}>

                <Td>
                  <Select>
                    <option>End Of List</option>
                    <option>Item 1</option>
                  </Select>
                </Td>

                <Td>
                  <Input type="number" defaultValue="0" />
                </Td>

                <Td>
                  <Input type="number" defaultValue="0" />
                </Td>

                <Td>
                  <Input />
                </Td>

                <Td>
                  <Input type="number" defaultValue="0" />
                </Td>

                <Td>

                  <Flex gap={2}>

                    <Button
                      size="sm"
                      onClick={handleAddRow}
                      border="1px solid blue"
                      bg="white"
                    >
                      <IoMdAdd color="blue" />
                    </Button>

                    {index !== 0 && (

                      <Button
                        size="sm"
                        border="1px solid red"
                        bg="white"
                        onClick={() => handleRemoveRow(index)}
                      >
                        <IoMdRemove color="red" />
                      </Button>

                    )}

                  </Flex>

                </Td>

              </Tr>

            ))}

          </Tbody>

        </Table>

      )}

      {/* GST Section */}
      {party && (

        <SimpleGrid columns={2} spacing={4} mb={6}>

          <FormControl>
            <FormLabel>IGST</FormLabel>
            <Input />
          </FormControl>

          <FormControl>
            <FormLabel>CGST</FormLabel>
            <Input />
          </FormControl>

          <FormControl>
            <FormLabel>SGST</FormLabel>
            <Input />
          </FormControl>

          <FormControl>
            <FormLabel>Total Amount</FormLabel>
            <Input />
          </FormControl>

        </SimpleGrid>

      )}

      {/* Narration */}
      

        <FormControl mb={4}>
          <FormLabel>Narration</FormLabel>
          <Textarea defaultValue="Sale" />
        </FormControl>


      {/* Upload */}
      

        <FormControl mb={6}>
          <FormLabel>Upload Document *</FormLabel>
          <Input type="file" />
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

export default Sales;