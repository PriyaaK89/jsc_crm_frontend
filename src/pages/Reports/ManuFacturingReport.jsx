import React from 'react'
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  HStack,
  SimpleGrid,
  VStack,
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go"
import { useState } from 'react';

function ManuFacturingReport() {
  const [value, setValue]=useState("");


  const itemwise=["item-wise"].includes(value);
  const gowdownwise=["godown-wise"].includes(value);

  return (
    <Box
          
            p={6}
          >
             <Breadcrumb mb={6} fontSize="sm">
                           <BreadcrumbItem>
                                         <BreadcrumbLink href="/dashboard">
                                           <GoHomeFill color="#5570F1"  size={20}/>
                                         </BreadcrumbLink>
                                       </BreadcrumbItem>
                    
                    
                            <BreadcrumbItem isCurrentPage>
                              <BreadcrumbLink> Manufacturing Report</BreadcrumbLink>
                            </BreadcrumbItem>
                          </Breadcrumb>
                    
            <Heading size="md" mb={6}>
             View Item Manufacturing Report 
            </Heading>
      
      
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
              <FormControl>
                <FormLabel>Select Filter Type</FormLabel>
                <Select placeholder="--Please Select--" onChange={(e)=>setValue(e.target.value)}>
                  <option value="item-wise">item wise</option>
                  <option value="godown-wise">godown wise</option>
                </Select>
              </FormControl>
      
      {itemwise &&(
              <FormControl>
                <FormLabel>Select item Type</FormLabel>
                <Select placeholder="--Please Select--" />
              </FormControl>
      )}
      {gowdownwise &&(
       <FormControl>
                <FormLabel>Select Godwon</FormLabel>
                <Select placeholder="--Please Select--" />
              </FormControl>
       )}
              
       <HStack>
              <FormControl>
                <FormLabel>Start Date</FormLabel>
                  <Input type="date" />
              </FormControl>
              <FormControl>
                <FormLabel> To  Date</FormLabel>
                  <Input type="date" />
              </FormControl>
              </HStack>
      
            </SimpleGrid>
      
            <Box textAlign="right" mt={6}>
              <Button colorScheme="blue">
              Show
              </Button>
            </Box>
          </Box>
  )
}

export default ManuFacturingReport
