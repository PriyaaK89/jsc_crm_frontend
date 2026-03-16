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

function EmployeePerformanceReport() {
  const {users}=useUsersapi();
  return (
     <Box p={6}>
               <Breadcrumb mb={6} fontSize="sm">
                             <BreadcrumbItem>
                                           <BreadcrumbLink href="/dashboard">
                                             <GoHomeFill color="#5570F1"  size={20}/>
                                           </BreadcrumbLink>
                                         </BreadcrumbItem>
                                         
                              <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink> Employee Performance Report </BreadcrumbLink>
                              </BreadcrumbItem>
                            </Breadcrumb>
                      
              <Heading size="md" mb={6}>
             View Performance Report
              </Heading>
        
        
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        
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
                  Show
                </Button>
              </Box>
            </Box>
  )
}

export default EmployeePerformanceReport
