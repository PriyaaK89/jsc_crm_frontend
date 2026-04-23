import React from 'react';
import { useState } from 'react';
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
import { IoMdAdd } from "react-icons/io";
import { IoMdRemove } from "react-icons/io";
import { Link } from 'react-router-dom';



const Purchase = () => {

  const [rows, setRows] = useState([
    { particulars: "", balance: 0, amount: 0, type: "", bank: "" },
  ]);
  const [consignee, setConsignee] = useState("");
  const [party, setParty] = useState("");

  const handleAddRow = () => {
    setRows([...rows, { particulars: "", balance: 0, amount: 0, type: "", bank: "" }]);
  };
  const handleRemoveRow = (index) => {
    if (index === 0) return;
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  return (
    <Box
      bg="white"
      mt={{ base: 2, md: 5 }}
      px={{ base: 3, md: 6 }}
      py={{ base: 3, md: 6 }}
    >
      <HStack justifyContent="space-between">
        <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/dashboard">
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink fontSize="13px">
              Purchase
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>
      <Text fontSize="xl" fontWeight="bold" mb={6}>
        Purchase
      </Text>
      <FormControl mb={4} w="100%">
        <FormLabel>Purchase Order No *</FormLabel>
        <Input value="1" />
      </FormControl>
      <FormControl mb={4} w="100%">
        <FormLabel>Party Name *</FormLabel>
        <Select size="sm" w="100%" placeholder="Please Select -- " value={party} onChange={(e) => setParty(e.target.value)}>
          <option value="test1">test1</option>
        </Select>
      </FormControl>
      <FormControl mb={4} w="100%">
        <FormLabel>Consignee Name *</FormLabel>
        <Select size="sm" w="100%" placeholder="Please Select -- " value={consignee} onChange={(e) => setConsignee(e.target.value)}>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </Select>
      </FormControl>
      {consignee === "yes" && (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>

          <Input placeholder="Dealer Name" size="sm" w="100%" />
          <Input placeholder="Prop Name" size="sm" w="100%" />
          <Input placeholder="Contact" size="sm" w="100%" />
          <Input placeholder="Address" size="sm" w="100%" />
          <Input placeholder="GST No" size="sm" w="100%" />
        </SimpleGrid>
      )}
      {/* Balance Section */}
      {party && (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
          <FormControl mb={5} w="100%">
            <FormLabel>Current Balance</FormLabel>
            <Input defaultValue="0" />
          </FormControl>

          <FormControl mb={5} w="100%">
            <FormLabel>Security Amount</FormLabel>
            <Input defaultValue="10000" />
          </FormControl>

          <FormControl mb={5} w="100%">
            <FormLabel>Credit Limit</FormLabel>
            <Input defaultValue="50000" size="sm" w="100%" />
          </FormControl>
        </SimpleGrid>
      )}
      {party && (
        <Box overflow="auto" w="100%" mb={2}>   



      <Table  w="100%"
  size={{ base: "sm", md: "md", xl: "lg" }}
  variant="simple">
            <Thead bg="gray.100">
              <Tr>
                <Th minW="180px">Name of Item</Th>
                <Th minW="150px">Billed Qty.</Th>
                <Th minW="200px">Rate</Th>
                <Th minW="180px">Unit</Th>
                <Th minW="200px">Amount</Th>
                <Th minW="200px">Action</Th>
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
        </Box>


      )}

      {/* GST Section */}
      {party && (

        <SimpleGrid columns={2} spacing={4} mb={6}>

          <FormControl mb={5} w="100%">
            <FormLabel>IGST</FormLabel>
            <Input />
          </FormControl>
          <FormControl mb={5} w="100%">
            <FormLabel>CGST</FormLabel>
            <Input />
          </FormControl>

          <FormControl mb={5} w="100%">

            <FormLabel>SGST</FormLabel>
            <Input />
          </FormControl>

          <FormControl mb={5} w="100%">

            <FormLabel>Total Amount</FormLabel>
            <Input />
          </FormControl>

        </SimpleGrid>

      )}



      {/* Narration */}
      <FormControl mb={4} mt={6}>
        <FormLabel>IGST ()</FormLabel>
        <Input type="text" />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>
          CGST ()
          <Input type="text" />

        </FormLabel>
      </FormControl>
      <FormControl mb={4} w="100%">
        <FormLabel>SGST ()</FormLabel>
        <Input type="text" />
      </FormControl>
      <FormControl mb={4} w="100%">
        <FormLabel>Total Amount</FormLabel>
        <Input type="number" />
      </FormControl>



      <FormControl mb={4} w="100%">
        <FormLabel>Narration</FormLabel>
        <Textarea defaultValue="Purchase" />
      </FormControl>


      {/* Upload */}


      <FormControl mb={6} w="100%">
        <FormLabel>Upload Document *</FormLabel>
        <Input type="file" />
      </FormControl>

      {/* Save Button */}


      <Flex justify={{base: "center", md:"flex-end"}}>
        <Button colorScheme="blue">
          SAVE
        </Button>
      </Flex>

    </Box>
  )
}

export default Purchase;