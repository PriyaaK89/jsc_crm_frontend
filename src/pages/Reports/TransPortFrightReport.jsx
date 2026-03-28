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
import { GoHomeFill } from "react-icons/go";
import useUsersapi from '../../Apis/GetUsersapi';
import { Link } from 'react-router-dom';

function TransPortFrightReport() {
   const {users}=useUsersapi();
  return (
    
           <Box
            bg="white"
            mt={{base:2, md:5}}
            px={{base:3, md:6}}
            py={{base:3, md:4}}
           borderRadius="lg"
           boxShadow="md"
        >
          <Breadcrumb mb={6} fontSize="sm">
                        <BreadcrumbItem>
                                      <BreadcrumbLink as={Link} to="/dashboard">
                                        <GoHomeFill color="#5570F1"  size={20}/>
                                      </BreadcrumbLink>
                                    </BreadcrumbItem>
                 
                         <BreadcrumbItem isCurrentPage>
                           <BreadcrumbLink>Transport Fright Report</BreadcrumbLink>
                         </BreadcrumbItem>
                       </Breadcrumb>
                 
         <Heading size="md" mb={6}>
           View Fright Report
         </Heading>
   
   
         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
   

    <FormControl>
             <FormLabel>Select Ledger</FormLabel>
             <Select placeholder="--Please Select--" />
           </FormControl>

           <FormControl>
             <FormLabel>Select Transaction </FormLabel>
             <Select placeholder="--Please Select--" />
           </FormControl>
   
          
   
           <FormControl>
             <FormLabel>Select Employee</FormLabel>
             <Select placeholder="--Please Select--" >
              {users?.map((emp)=>(
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
             </Select>
           </FormControl>
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
             SEARCH
           </Button>
         </Box>
       </Box>
  )
}

export default TransPortFrightReport
