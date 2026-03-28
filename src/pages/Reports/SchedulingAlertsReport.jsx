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

function SchedulingAlertsReport() {
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
               <BreadcrumbLink>Schedular Report</BreadcrumbLink>
             </BreadcrumbItem>
           </Breadcrumb>
     
           {/* Page Heading */}
           <Heading size="md" mb={6}>
             Schedular Report
           </Heading>
     
           {/* Form Card */}
           <Box
             bg="white"
          
             borderRadius="md"
            
           >
     
             <SimpleGrid columns={{ base: 1, md: 1 }} spacing={6}>
     
               <FormControl>
                 <FormLabel>Ledger Name</FormLabel>
                 <Select placeholder="Please Select">
                   <option></option>
                   <option></option>
                   <option value=""></option>
                   <option value=""></option>
                 </Select>
               </FormControl>
   
                
             </SimpleGrid>
     
             {/* Search Button */}
             <Flex mt={6} justifyContent="end">
                <Box m={3} >
               <Button colorScheme="red">
                 Start Interest
               </Button>
             </Box>
               <Box m={3}  >
               <Button colorScheme="teal">
                 Start SMS
               </Button>
             </Box>
             <Box m={3}  >
               <Button colorScheme="blue">
                 SEARCH
               </Button>
             </Box>
             </Flex>
     
           </Box>
         </Box>
  )
}

export default SchedulingAlertsReport
