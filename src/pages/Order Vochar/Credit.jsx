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
  <Box
       bg="white"
       mt={{base:2, md:5}}
       px={{base:3, md:6}}
       py={{base:3, md:4}}
      borderRadius="lg"
      boxShadow="md"
   >
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

      {/* Page Title */}
      <Text fontSize="lg" fontWeight="bold" mb={6}>
        Credit Note
      </Text>
              <FormControl mb={4} w="100%">
              <FormLabel>Credit Note No.</FormLabel>
              <Input value="1" />
            </FormControl>
      
            {/* Party Name */}
            <FormControl mb={4} w="100%">
              <FormLabel>Party A/c Name</FormLabel>
      
              <Select
               size="sm"
               w="100%"
                placeholder="--Please Select--"
                onChange={(e) => setParty(e.target.value)}
              >
                <option value="test1">test1</option>
              </Select>
      
            </FormControl>

      <FormControl mb={6} w="100%">
        <FormLabel>Current Balance</FormLabel>
        <Input value="1" />
      </FormControl>

      {/* Consignee Select */}
      <FormControl mb={6} w="100%">
        <FormLabel>Is Consignee</FormLabel>

        <Select
          value={consignee}
          onChange={(e) => setConsignee(e.target.value)}
          size="sm"
          w="100%"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </Select>

      </FormControl>


      {/* Dealer Details Table */}
      {consignee === "yes" && (
            <Box w="100%" overflowX="auto" >

        <Table
          border="1px solid #ccc"
           w="100%"
           size={{base:"sm",md: "md", lg: "lg"}}
           variant="simple"
         >
          <Thead bg="#d9e5f8">
            <Tr>
              <Th minW="150px">Dealer Name</Th>
              <Th minW="150px">Prop Name</Th>
              <Th minW="120px">Contact</Th>
              <Th minW="200px">Address</Th>
              <Th minW="180px">GSTN No</Th>
            </Tr>
          </Thead>

          <Tbody>
            <Tr>
              <Td><Input placeholder="Dealer Name" sm="sm" w="100%" /></Td>
              <Td><Input placeholder="Prop Name" sm="sm" w="100%" /></Td>
              <Td><Input placeholder="Contact" sm="sm" w="100%" /></Td>
              <Td><Input placeholder="Address" sm="sm" w="100%" /></Td>
              <Td><Input placeholder="GSTN No" sm="sm" w="100%" /></Td>
            </Tr>
          </Tbody>

        </Table>
        </Box>

      )}


      {/* Transport Section */}
      <Text fontWeight="bold" mb={3} w="100%">
        Transport Details
      </Text>
                   <Box overflowX="auto" w="100%" mb={2}>
      
      <Table w="100%" size={{base:"sm", md:"md", xl:"lg"}} variant="simple" 
        
      >
        

        <Thead bg="#d9e5f8">
          <Tr>
            <Th minW="180px">Transport Name</Th>
            <Th minW="180px">LR No</Th>
            <Th minW="180px">Vehicle No</Th>
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
</Box>

      <FormControl mb={4} mt={6} w="100%">
                                    <FormLabel>IGST ()</FormLabel>
                                    <Input type="text"  />
                                  </FormControl>
                                  <FormControl mb={4}>
                                    <FormLabel>
                                       CGST ()
                                                                           <Input type="text"  />

                                     </FormLabel>
                                  </FormControl>
                                  <FormControl mb={6} w="100%">
                                    <FormLabel>SGST ()</FormLabel>
                                    <Input type="text"  />
                                  </FormControl>
                                  <FormControl mb={4} w="100%">
                                    <FormLabel>Total Amount</FormLabel>
                                    <Input type="number"  />
                                  </FormControl>

       {/* Narration */}
                                
                          
                                  <FormControl mb={4} w="100%">
                                    <FormLabel>Narration</FormLabel>
                                    <Textarea defaultValue="debit" />
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
  );
};

export default Credit;