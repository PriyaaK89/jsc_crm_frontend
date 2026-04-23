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
import { Link } from 'react-router-dom';


function PartyLedgerReport() {
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
           <Breadcrumb mb={6} fontSize="sm">
            <BreadcrumbItem>
                          <BreadcrumbLink as={Link} to="/dashboard">
                            <GoHomeFill color="#5570F1"  size={20}/>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
     
          
     
             <BreadcrumbItem isCurrentPage>
               <BreadcrumbLink>Party Report </BreadcrumbLink>
             </BreadcrumbItem>
           </Breadcrumb>
     
           {/* Page Heading */}
           <Heading size="md" mb={6}>
            Party Report
           </Heading>
     
           {/* Form Card */}
           <Box
             bg="white"
           >
     
             <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
     
               <FormControl>
                 <FormLabel>Select Party</FormLabel>
                 <Select placeholder="Please Select">
                   <option>veer bagvati agro </option>
                   <option>balaji</option>
                  
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
             <Flex justifyContent="flex-end">
              <Box textAlign="right" mt={6} mr={5}>
               <Button colorScheme="green">
                 Download Report 
               </Button>
             </Box>
             <Box textAlign="right" mt={6}>
               <Button colorScheme="blue">
                 SEARCH
               </Button>
             </Box>
             </Flex>
     
           </Box>
         </Box>
  )
}

export default PartyLedgerReport
