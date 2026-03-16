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
import useUsersapi from '../../Apis/GetUsersapi';

function EmployeeBalanceSheet() {
  const {users}=useUsersapi();
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
                  <BreadcrumbLink>Employee Balance Sheet  </BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
        
              {/* Page Heading */}
              <Heading size="md" mb={6}>
               Employee Balance Sheet 
              </Heading>
        
              {/* Form Card */}
              <Box
                bg="white"
              >
        
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        
                  <FormControl>
                    <FormLabel>Select Employee</FormLabel>
                    <Select placeholder="Please Select">

                      {users?.map((emp)=>(
                       <option key={emp.id} value={emp.id}>{emp.name} </option>
                      ))} 
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

export default EmployeeBalanceSheet
