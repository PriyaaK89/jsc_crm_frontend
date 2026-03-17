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
  SimpleGrid,
  VStack,
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";

function InterestReport() {
  return (
    <Box p={6}>
           
                 {/* Breadcrumb */}
                 <Breadcrumb mb={6} fontSize="sm">
                  <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard">
                                  <GoHomeFill color="#5570F1"  size={20}/>
                                </BreadcrumbLink>
                              </BreadcrumbItem>
           
           
                   <BreadcrumbItem isCurrentPage>
                     <BreadcrumbLink>Interest Report  </BreadcrumbLink>
                   </BreadcrumbItem>
                 </Breadcrumb>
           
                 {/* Page Heading */}
                 <Heading size="md" mb={6}>
                 Interest Report 
                 </Heading>
           
                 {/* Form Card */}
                 <Box
                   bg="white"
                 >
           
                   <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
           
                     <FormControl>
                       <FormLabel>Party Name </FormLabel>
                       <Select placeholder="Please Select">
                         <option>SHAYAM </option>
                         <option>gorauv</option>
                        
                       </Select>
                     </FormControl>
         
                      <FormControl>
                       <FormLabel>Form Date</FormLabel>
                      
                         <Input type="date" />
                       
                       
                     </FormControl>
         
              <FormControl>
         
                       <FormLabel>To Date</FormLabel>
                         <Input type="date" />
      
                     </FormControl>
                   </SimpleGrid>
           
                   {/* Search Button */}
                   
                   
                   <Box textAlign="right" mt={6}>
                     <Button colorScheme="blue">
                       SEARCH
                     </Button>
                   </Box>
                 
           
                 </Box>
               </Box>
  )
}

export default InterestReport
