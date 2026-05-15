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
  
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";

const Debit = () => {

  const [consignee, setConsignee] = useState("no");
  const [party, setParty] = useState("");
  const [item, setItem] = useState("");

  return (
    <Box
     bg="white"
     mt={{base:2, md:5}}
     px={{base:3, md:6}}
     py={{base:3, md:4}}
    borderRadius="lg"
    boxShadow="md"
 >
      {/* Breadcrumb */}
      <HStack justifyContent="space-between"  spacing="space-between">
        <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">

          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/dashboard">
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink fontSize="13px">
              Debit Note
            </BreadcrumbLink>
          </BreadcrumbItem>

        </Breadcrumb>
      </HStack>

      {/* Page Title */}
      <Text fontSize="lg" fontWeight="bold" mb={6}>
        Debit Note
      </Text>

      {/* Debit Note No */}
      <FormControl mb={4} w="100%">
        <FormLabel>Debit Note No.</FormLabel>
        <Input defaultValue="1" />
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

      {/* Current Balance */}
      <FormControl mb={6} w="100%">
        <FormLabel>Current Balance</FormLabel>
        <Input defaultValue="1" />
      </FormControl>

      {/* Consignee */}
      <FormControl mb={6} w="100%">
        <FormLabel>Is Consignee</FormLabel>

        <Select
         sm="sm"
         w="100%"
          value={consignee}
          onChange={(e) => setConsignee(e.target.value)}
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </Select>

      </FormControl>

      {/* Item Table */}
      {consignee === "yes" && (

    <Box w="100%" overflowX="auto" >

  <Table
    border="1px solid #ccc"
    width="100%"
    size={{ base: "sm", md: "md", lg:"lg" }}
    variant="simple"
  >

    <Thead bg="#f2f1f1">
      <Tr>
        <Th minW="150px">Name of item</Th>
        <Th minW="150px">Billed Qty</Th>
        <Th minW="80px">Rate</Th>
        <Th minW="120px">Unit</Th>
        <Th minW="150px">Amount</Th>
      </Tr>
    </Thead>

    <Tbody>
      <Tr>

        <Td>
          <Select
            value={item}
            onChange={(e) => setItem(e.target.value)}
            w="100%"
            size="sm"
          >
            <option value="">End Of List</option>
          </Select>
        </Td>

        <Td>
          <Input type="number" defaultValue="0" size="sm" w="100%"  />
        </Td>

        <Td>
          <Input type="number" defaultValue="0" size="sm" w="100%" />
        </Td>

        <Td>
          <Input type="text" defaultValue="0" size="sm" w="100%" />
        </Td>

        <Td>
          <Input type="number" defaultValue="0" size="sm" w="100%" />
        </Td>

      </Tr>
    </Tbody>

  </Table>

</Box>
      )}

      {/* Transport Details */}
      <Text fontWeight="bold" mb={3} mt={3}>
        Transport Details
      </Text>
             <Box overflowX="auto" w="100%" mb={2}>

      <Table  w="100%"
  size={{ base: "sm", md: "md", xl: "lg" }}
  variant="simple">

        <Thead bg="#d9e5f8">
          <Tr>
            <Th minW="180px">Transport Name </Th>
            <Th minW="100px">LR No</Th>
            <Th minW="180px">Vehicle No</Th>
          </Tr>
        </Thead>

        <Tbody>
          <Tr>
            <Td><Input defaultValue="sg" /></Td>
            <Td><Input type="text" /></Td>
            <Td><Input type="text" /></Td>
          </Tr>
        </Tbody>

      </Table>
      </Box> 

      {/* Tax Section */}

      <FormControl mb={4} mt={6} w="100%">
        <FormLabel>IGST</FormLabel>
        <Input type="text" />
      </FormControl>

      <FormControl mb={4} w="100%">
        <FormLabel>CGST</FormLabel>
        <Input type="text" />
      </FormControl>

      <FormControl mb={4} w="100%">
        <FormLabel>SGST</FormLabel>
        <Input type="text" />
      </FormControl>

      <FormControl mb={4} w="100%">
        <FormLabel>Total Amount</FormLabel>
        <Input type="number" />
      </FormControl>

      {/* Narration */}

      <FormControl mb={4} w="100%">
        <FormLabel>Narration</FormLabel>
        <Textarea defaultValue="debit note" />
      </FormControl>

      {/* Upload */}

      <FormControl mb={6} w="100%">
        <FormLabel>Upload Document *</FormLabel>
        <Input type="file" />
      </FormControl>

      {/* Button */}
<Flex justify={{ base: "center", md: "flex-end" }}>
        <Button colorScheme="blue">
          Create
        </Button>
      </Flex>

    </Box>
  );
};

export default Debit;
 