import React from 'react';
import { useState } from 'react';
import{Box,
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



const Purchase = () => {

  const [rows,setRows] = useState([
    { particulars: "", balance: 0, amount: 0, type: "", bank: "" },
  ]);
   const [consignee, setConsignee] = useState("");
    const [party, setParty] = useState("");

  const handleAddRow = () => {
    setRows([...rows, { particulars: "", balance: 0, amount: 0, type: "", bank: "" }]);
  };
  const handleRemoveRow = (index) => {
    if(index===0) return;
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
                            Purchase
                        </BreadcrumbLink>
                    </BreadcrumbItem>   
                  </Breadcrumb>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" mb={6}>
                    Purchase 
                </Text>
                <FormControl mb={4}>
                    <FormLabel>Purchase Order No *</FormLabel>
                    <Input value="1"/>
                </FormControl>
                <FormControl mb={4}>
                    <FormLabel>Party Name *</FormLabel>
                    <Select placeholder="Please Select -- " value={party} onChange={(e) => setParty(e.target.value)}>
                        <option value="test1">test1</option>
                    </Select>
                </FormControl>
                <FormControl mb={4}>
                    <FormLabel>Consignee Name *</FormLabel>
                    <Select placeholder="Please Select -- " value={consignee} onChange={(e) => setConsignee(e.target.value)}>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </Select>
                </FormControl>
                {consignee ==="yes" && (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
               
                   <Input placeholder="Dealer Name" />
                             <Input placeholder="Prop Name" />
                             <Input placeholder="Contact" />
                             <Input placeholder="Address" />
                             <Input placeholder="GST No" />
                           </SimpleGrid>
                )}
                  {/* Balance Section */}
                  {party && (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
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
                           <FormControl mb={4} mt={6}>
                                                              <FormLabel>IGST ()</FormLabel>
                                                              <Input type="text"  />
                                                            </FormControl>
                                                            <FormControl mb={4}>
                                                              <FormLabel>
                                                                 CGST ()
                                                                                                     <Input type="text"  />
                          
                                                               </FormLabel>
                                                            </FormControl><FormControl mb={4}>
                                                              <FormLabel>SGST ()</FormLabel>
                                                              <Input type="text"  />
                                                            </FormControl>
                                                            <FormControl mb={4}>
                                                              <FormLabel>Total Amount</FormLabel>
                                                              <Input type="number"  />
                                                            </FormControl>
                          
                          
                    
                            <FormControl mb={4}>
                              <FormLabel>Narration</FormLabel>
                              <Textarea defaultValue="Purchase" />
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
            )
        }

export default Purchase;