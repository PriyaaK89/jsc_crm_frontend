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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Textarea,
  Button,
  Flex,
  TableContainer
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";

const Credit = () => {

  const [consignee, setConsignee] = useState("no");

  return (
    <Box p={{ base: 3, md: 6 }} overflowX="hidden">

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
              Credit Note 
            </BreadcrumbLink>
          </BreadcrumbItem>

        </Breadcrumb>
      </HStack>

      {/* Title */}
      <Text fontSize="lg" fontWeight="bold" mb={6}>
        Credit Note
      </Text>

      {/* Credit Note */}
      <FormControl mb={4}>
        <FormLabel>Credit Note No.</FormLabel>
        <Input value="1" />
      </FormControl>

      {/* Party */}
      <FormControl mb={4}>
        <FormLabel>Party A/c Name</FormLabel>

        <Select placeholder="--Please Select--">
          <option value="test1">test1</option>
        </Select>

      </FormControl>

      {/* Balance */}
      <FormControl mb={6}>
        <FormLabel>Current Balance</FormLabel>
        <Input value="1" />
      </FormControl>

      {/* Consignee */}
      <FormControl mb={6}>
        <FormLabel>Is Consignee</FormLabel>

        <Select
          value={consignee}
          onChange={(e) => setConsignee(e.target.value)}
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </Select>

      </FormControl>

      {/* Dealer Table */}
      {consignee === "yes" && (

        <TableContainer overflowX="auto" mb={6} maxWidth="100vw">

          <Table border="1px solid #ccc" maxW="500px">

            <Thead bg="#f5f5f5">
              <Tr>
                <Th>Dealer Name</Th>
                <Th>Prop Name</Th>
                <Th>Contact</Th>
                <Th>Address</Th>
                <Th>GSTN No</Th>
              </Tr>
            </Thead>

            <Tbody>
              <Tr>
                <Td><Input placeholder="Dealer Name" /></Td>
                <Td><Input placeholder="Prop Name" /></Td>
                <Td><Input placeholder="Contact" /></Td>
                <Td><Input placeholder="Address" /></Td>
                <Td><Input placeholder="GSTN No" /></Td>
              </Tr>
            </Tbody>

          </Table>

        </TableContainer>

      )}

      {/* Transport Section */}
      <Text fontWeight="bold" mb={3}>
        Transport Details
      </Text>

      <TableContainer overflowX="scroll" maxWidth="100vw">

        <Table border="1px solid #ccc" maxW="500px">

          <Thead bg="#f5f5f5">
            <Tr>
              <Th>Transport Name</Th>
              <Th>LR No</Th>
              <Th>Vehicle No</Th>
            </Tr>
          </Thead>

          <Tbody>
            <Tr>
              <Td><Input value="sg" /></Td>
              <Td><Input type="file" /></Td>
              <Td><Input type="file" /></Td>
            </Tr>
          </Tbody>

        </Table>

      </TableContainer>

      {/* GST Fields */}

      <FormControl mt={6} mb={4}>
        <FormLabel>IGST</FormLabel>
        <Input />
      </FormControl>

      <FormControl mb={4}>
        <FormLabel>CGST</FormLabel>
        <Input />
      </FormControl>

      <FormControl mb={4}>
        <FormLabel>SGST</FormLabel>
        <Input />
      </FormControl>

      <FormControl mb={4}>
        <FormLabel>Total Amount</FormLabel>
        <Input type="number" />
      </FormControl>

      {/* Narration */}
      <FormControl mb={4}>
        <FormLabel>Narration</FormLabel>
        <Textarea />
      </FormControl>

      {/* Upload */}
      <FormControl mb={6}>
        <FormLabel>Upload Document</FormLabel>
        <Input type="file" />
      </FormControl>

      {/* Save */}
      <Flex justify="flex-end">
        <Button colorScheme="blue">
          SAVE
        </Button>
      </Flex>

    </Box>
  );
};

export default Credit;