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
import { Link } from "react-router-dom";

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
    <Box 
     bg="white"
     mt={{base:2, md:5}}
     px={{base:3 ,md:6}}
     py={{base:3, md:4}}
     borderRadius="lg"
     boxShadow="md"
    >

      {/* Breadcrumb */}
      <HStack justifyContent="space-between">
        <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/dashboard">
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
      <FormControl mb={4} w="100%">
        <FormLabel>Sales No.</FormLabel>
        <Input value="2104" />
      </FormControl>

      {/* Party Name */}
      <FormControl mb={4} w="100%">
        <FormLabel>Party A/c Name</FormLabel>

        <Select
         size="sm"
         w="100%"
          placeholder="--Please Select--"
          value={party}
          onChange={(e) => setParty(e.target.value)}
        >
          <option value="test1">test1</option>
        </Select>

      </FormControl>

      {/* Consignee */}
      <FormControl mb={6} w="100%">
        <FormLabel>Is Consignee</FormLabel>

        <Select
          placeholder="--Please Select--"
          w="100%"
          size="sm"
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
          <Input placeholder="Dealer Name" size="sm"w="100%" />
          <Input placeholder="Prop Name" size="sm" w="100%" />
          <Input placeholder="Contact" size="sm" w="100%" />
          <Input placeholder="Address" size="sm" w="100%" />
          <Input placeholder="GST No" size="sm" w="100%" />
        </SimpleGrid>

      )}

      {/* Balance Section */}
      {party && (

        <SimpleGrid columns={3} spacing={4} mb={6}>
          <FormControl mb={6} w="100%">
            <FormLabel>Current Balance</FormLabel>
            <Input defaultValue="0" />
          </FormControl>

          <FormControl mb={6} w="100%">
            <FormLabel>Security Amount</FormLabel>
            <Input defaultValue="10000" />
          </FormControl>

          <FormControl mb={6} w="100%">
            <FormLabel>Credit Limit</FormLabel>
            <Input defaultValue="50000" />
          </FormControl>
        </SimpleGrid>

      )}

      {/* Item Table */}
      {party && (
        <Box w="100%" overflowX="auto">

            <Table
               border="1px solid #ccc"
               width="100%"
               size={{ base: "sm", md: "md", lg:"lg" }}
               variant="simple"
             >

          <Thead bg="gray.100">
            <Tr>
              <Th minW="150px">Name of Item</Th>
              <Th minW="120px">Billed Qty.</Th>
              <Th minW="150px">Rate</Th>
              <Th minW="180px">Unit</Th>
              <Th minW="180px">Amount</Th>
              <Th minW="180px">Action</Th>
            </Tr>
          </Thead>

          <Tbody>

            {rows.map((row, index) => (

              <Tr key={index}>

                <Td>
                  <Select size="sm" w="100%">
                    <option>End Of List</option>
                    <option>Item 1</option>
                  </Select>
                </Td>

                <Td>
                  <Input type="number" defaultValue="0" size="sm" w="100%" />
                </Td>

                <Td>
                  <Input type="number" defaultValue="0" size="sm" w="100%" />
                </Td>

                <Td>
                  <Input size="sm" w="100%" />
                </Td>

                <Td>
                  <Input type="number" defaultValue="0" size="sm" w="100%" />
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
        </Box>

      )}

      {/* GST Section */}
      {party && (

        <SimpleGrid columns={2} spacing={4} mb={6}>

          <FormControl size="sm" w="100%">
            <FormLabel>IGST</FormLabel>
            <Input />
          </FormControl>

          <FormControl size="sm" w="100%">
            <FormLabel>CGST</FormLabel>
            <Input />
          </FormControl>

          <FormControl size="sm" w="100%">
            <FormLabel>SGST</FormLabel>
            <Input />
          </FormControl>

          <FormControl size="sm" w="100%">
            <FormLabel>Total Amount</FormLabel>
            <Input />
          </FormControl>

        </SimpleGrid>

      )}

      {/* Narration */}
      

        <FormControl mb={4} w="100%">
          <FormLabel>Narration</FormLabel>
          <Textarea defaultValue="Sale" />
        </FormControl>


      {/* Upload */}
      

        <FormControl mb={6} w="100%">
          <FormLabel>Upload Document *</FormLabel>
          <Input type="file" />
        </FormControl>

      {/* Save Button */}
      

        <Flex justify={{base:"center", md: "flex-end"}}>
          <Button colorScheme="blue">
            SAVE
          </Button>
        </Flex>

      

    </Box>
  );
};

export default Sales;