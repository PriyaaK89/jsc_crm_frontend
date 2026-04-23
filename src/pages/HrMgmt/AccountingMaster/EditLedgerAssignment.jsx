import React from 'react'
import {Box,FormControl,FormLabel,Select,Button,Flex,HStack,Breadcrumb,BreadcrumbItem,Heading,BreadcrumbLink, SimpleGrid} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go"; 
import useUsersapi from '../../../Apis/GetUsersapi';
import {Link} from "react-router-dom";

function EditLedgerAssignment() {
  const {users}=useUsersapi();
  
  return (
    <>
    <Box
         bg="white"
         mt={{base:2, md:5}}
         px={{base:3, md:6}}
         py={{base:3, md:4}}
        borderRadius="lg"
        boxShadow="md">
       <HStack justifyContent='space-between'>
                            <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
                              <BreadcrumbItem>
                                <BreadcrumbLink as={Link} to='/dashboard'><GoHomeFill color="#5570F1" /> </BreadcrumbLink>
                              </BreadcrumbItem>
                  
                              <BreadcrumbItem>
                                <BreadcrumbLink color='#8B8D97' fontSize='13px'>Assign Ledger</BreadcrumbLink>
                              </BreadcrumbItem>
                            </Breadcrumb>
                        </HStack>
                         < Heading size="md" textAlign="center" mb={6}>
                                                                 Assign Ledger 
                                                                  </Heading>
                        <SimpleGrid columns={{base:1,md:2}} spacing={5}>
      <FormControl mt={5}>
                     <FormLabel>Ledger Name</FormLabel>
                   <Select fontSize="13px" placeholder='Select Ledger name' >
            </Select>
           </FormControl>

            <FormControl mt={5}>
                     <FormLabel>Employee under</FormLabel>
                   <Select fontSize="13px" placeholder='Select employee under' >
                    {users?.map((emp)=>(
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
            </Select>
           </FormControl>
           </SimpleGrid>
          <Box textAlign="center"  mt={10} >
  <Flex justify="center" gap={6} flexDirection={{ base: "column", md: "row" }}>
    <Button
      w={{ base: "100%", md: "200px" }}
      colorScheme="red"
      variant="outline"
      _hover={{
        bg: "red.500",
        color: "white",
        transform: "translateY(-2px)",
        boxShadow: "md",
      }}
      transition="all 0.2s ease"
      borderRadius="xl"
    >
      Delete Ledger
    </Button>

    <Button
      w={{ base: "100%", md: "200px" }}
      colorScheme="blue"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "md",
      }}
      transition="all 0.2s ease"
      borderRadius="xl"
    >
      Assign Ledger
    </Button>
  </Flex>
</Box>
           
          </Box>
     
    </>
  )
}

export default EditLedgerAssignment
