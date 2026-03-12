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
import { useState } from 'react';

function PsLReport() {
   const [SelectGroup, setSelectGroup] = useState("");
    const setledger=["ledger-wise"].includes(SelectGroup);
    const employeewise=["employee-wise"].includes(SelectGroup);
    const statewise =["state-wise"].includes(SelectGroup);
    const districwise=["distric-wise"].includes(SelectGroup);
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
                   
                           <BreadcrumbItem>
                             <BreadcrumbLink href="#">Reports</BreadcrumbLink>
                           </BreadcrumbItem>
                   
                           <BreadcrumbItem isCurrentPage>
                             <BreadcrumbLink> View Profit Loss Report</BreadcrumbLink>
                           </BreadcrumbItem>
                         </Breadcrumb>
                   
           <Heading size="md" mb={6}>
           View Profit Loss Report
           </Heading>
     
     
           <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
             <FormControl>
               <FormLabel>Select Filter Type</FormLabel>
               <Select placeholder="--Please Select--"  onChange={(e) => setSelectGroup(e.target.value)} >
                <option value="ledger-wise">Ledger wise</option>
                 <option value="employee-wise">Employee Wise</option>
                  <option value="state-wise">State Wise</option>
                   <option value="distric-wise">Distric wise</option>
               </Select>
             </FormControl>
   
     {setledger &&(
<FormControl>
               <FormLabel>Select Ledger</FormLabel>
               <Select placeholder="--Please Select--" />
             </FormControl>
     )}
      {employeewise &&(
<FormControl>
               <FormLabel>Select Employee</FormLabel>
               <Select placeholder="--Please Select--" />
             </FormControl>
     )}

 {statewise &&(
<FormControl>
               <FormLabel>Select state</FormLabel>
               <Select placeholder="--Please Select--" />
             </FormControl>
     )}

 {districwise &&(
 
    
<FormControl>
               <FormLabel>Select Ledger</FormLabel>
               <Select placeholder="--Please Select--" />
             </FormControl>
            
            
     )}

      {districwise &&(
      <FormControl>
               <FormLabel>Select state</FormLabel>
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

export default PsLReport
