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

function EmployeeDistributor() {
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
                              <BreadcrumbLink> View Distributor </BreadcrumbLink>
                            </BreadcrumbItem>
                          </Breadcrumb>
                    
            <Heading size="md" mb={6}>
        View Distributor
            </Heading>
      
    
            <SimpleGrid columns={{ base: 1, md: 1 }} spacing={5}>
      
      
              <FormControl>
                <FormLabel>Select Employee</FormLabel>
                <Select placeholder="--Please Select--" />
              </FormControl>
      
            </SimpleGrid>
      
            <Box textAlign="right" mt={6}>
              <Button colorScheme="blue">
               View
              </Button>
            </Box>
          
          </Box>
  )
}

export default EmployeeDistributor
