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

const Debit = () => {

  const [consignee, setConsignee] = useState("no");
  const [party, setParty] = useState("");
  const [item, setItem] = useState("");

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
      <FormControl mb={4}>
        <FormLabel>Debit Note No.</FormLabel>
        <Input defaultValue="1" />
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

      {/* Current Balance */}
      <FormControl mb={6}>
        <FormLabel>Current Balance</FormLabel>
        <Input defaultValue="1" />
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

      {/* Item Table */}
      {consignee === "yes" && (

  <TableContainer border="1px solid #d1d2d4"  mb={6} mt={2} borderRadius="lg">
        <Table >

          <Thead bg="#d9e5f8">
            <Tr>
              <Th>Name of item</Th>
              <Th>Billed Qty</Th>
              <Th>Rate</Th>
              <Th>Unit</Th>
              <Th>Amount</Th>
            </Tr>
          </Thead>

          <Tbody>
            <Tr>

              <Td>
                <Select
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                >
                  <option value="">End Of List</option>
                  <option value="ZYME DRUM STICKER">ZYME DRUM STICKER</option>
                  <option value="ACTIVE GOLD (BAG) -5 KG.">ACTIVE GOLD (BAG) -5 KG.</option>
                  <option value="ACTIVE GOLD (DRUM) -50 KG">ACTIVE GOLD (DRUM) -50 KG</option>
                  <option value="ACTIVE GOLD BKT - 20 KG">ACTIVE GOLD BKT - 20 KG</option>
                  <option value="ACTIVE GOLD BKT -10 KG">ACTIVE GOLD BKT -10 KG</option>
                  <option value="ACTIVE GOLD DRUM -50 KG.">ACTIVE GOLD DRUM -50 KG.</option>
                  <option value="ADVERTISMENT MATTERIALS">ADVERTISMENT MATTERIALS</option>
                  <option value="AGITATOR">AGITATOR</option>
                  <option value="ALUMINIUM FOIL (55MM)">ALUMINIUM FOIL (55MM)</option>
                  <option value="BAJRA VIRAT - 7799">BAJRA VIRAT - 7799</option>
                  <option value="Bajri Multicut Loose">Bajri Multicut Loose</option>
                  <option value="BALTI -20 K.G.">BALTI -20 K.G.</option>
                  <option value="BALTI-10">BALTI-10</option>
                  <option value="BARLE SEED(BH-902)">BARLE SEED(BH-902)</option>
                  <option value="BHINDI(GARIMA)">BHINDI(GARIMA)</option>
                </Select>
              </Td>

              <Td>
                <Input type="number" defaultValue="0" />
              </Td>

              <Td>
                <Input type="number" defaultValue="0" />
              </Td>

              <Td>
                <Input type="text" defaultValue="0" />
              </Td>

              <Td>
                <Input type="number" defaultValue="0" />
              </Td>

            </Tr>
          </Tbody>

        </Table>
        </TableContainer>

      )}

      {/* Transport Details */}
      <Text fontWeight="bold" mb={3}>
        Transport Details
      </Text>
      
      <TableContainer border="1px solid #d1d2d4"  mb={6} mt={2} borderRadius="lg">
      <Table>

        <Thead bg="#d9e5f8">
          <Tr>
            <Th>Transport Name</Th>
            <Th>LR No</Th>
            <Th>Vehicle No</Th>
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
      </TableContainer>

      {/* Tax Section */}

      <FormControl mb={4} mt={6}>
        <FormLabel>IGST</FormLabel>
        <Input type="text" />
      </FormControl>

      <FormControl mb={4}>
        <FormLabel>CGST</FormLabel>
        <Input type="text" />
      </FormControl>

      <FormControl mb={4}>
        <FormLabel>SGST</FormLabel>
        <Input type="text" />
      </FormControl>

      <FormControl mb={4}>
        <FormLabel>Total Amount</FormLabel>
        <Input type="number" />
      </FormControl>

      {/* Narration */}

      <FormControl mb={4}>
        <FormLabel>Narration</FormLabel>
        <Textarea defaultValue="debit note" />
      </FormControl>

      {/* Upload */}

      <FormControl mb={6}>
        <FormLabel>Upload Document *</FormLabel>
        <Input type="file" />
      </FormControl>

      {/* Button */}

      <Flex justify="flex-end">
        <Button colorScheme="blue">
          Create
        </Button>
      </Flex>

    </Box>
  );
};

export default Debit;