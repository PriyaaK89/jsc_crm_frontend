import { Flex, FormControl,FormLabel,Input } from "@chakra-ui/react";
import { Select } from '@chakra-ui/react'
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack,VStack,Heading,Button,SimpleGrid} from "@chakra-ui/react";

import { GoHomeFill } from "react-icons/go";





const CreateGroup = () => {
   const labelStyles = {
        fontSize: "12px",
        color: "#686868",
        marginBottom: "3px",
    };


    return (
    <Box w="100%" bg="white" p={6} borderRadius="lg" >
                <HStack justifyContent='space-between'>
                      <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
                        <BreadcrumbItem>
                          <BreadcrumbLink href='/dashboard'><GoHomeFill color="#5570F1" /> </BreadcrumbLink>
                        </BreadcrumbItem>
            
                        <BreadcrumbItem>
                          <BreadcrumbLink href='#' color='#8B8D97' fontSize='13px'>Create Group</BreadcrumbLink>
                        </BreadcrumbItem>
            
                      </Breadcrumb>
                   
            
                    </HStack>
                
       
                <Heading size="lg" textAlign="center" mb={6}>
                  Create Group
                </Heading>
          
                <Box as="form" >
                 
                     <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                    
                    <FormControl isRequired>
                      <FormLabel {...labelStyles}>
                         Name
                      </FormLabel>
                      <Input placeholder="Enter name" fontSize="12px" />
                    </FormControl>

                      <FormControl isRequired>
                                  <FormLabel {...labelStyles}>Under</FormLabel>
                                  <Select placeholder='Select Any One ' fontSize="14px" >
                               <option value='option2'>option 1</option>
                               <option value='option3'>Option 3</option>
                                 </Select>
                                </FormControl>
</SimpleGrid>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={5}>      
                          <FormControl isRequired >
                                
                                  <FormLabel {...labelStyles}>Group behaves like a sub-legers</FormLabel>
                                  <Select placeholder='Select Any One' fontSize="14px">
                               <option value='yes'>Yes </option>
                               <option value='no'>No</option>
                                 </Select>
                             
                                </FormControl>
                                  <FormControl isRequired >
                                
                                  <FormLabel {...labelStyles}>Nett Debit/Credit balance for report </FormLabel>
                                  <Select placeholder='Select Any One' fontSize="14px">
                               <option value='yes'>Yes</option>
                               <option value='no'>No</option>
                                 </Select>
                             
                                </FormControl>
                                </SimpleGrid> 
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={5}>   
               
                                  <FormControl isRequired >
                                
                                  <FormLabel {...labelStyles}>Used for calculation</FormLabel>
                                  <Select placeholder='Select Any One' fontSize="14px">
                               <option value='yes'>Yes </option>
                               <option value='no'>No </option>
                                 </Select>
                             
                                </FormControl>
                                  <FormControl isRequired >
                                
                                  <FormLabel {...labelStyles} >Method to allocate when used in purchase invoice</FormLabel>
                                  <Select placeholder='Select Any One' fontSize="14px">
                               <option value='applicable'>Applicable</option>
                               <option value='notapplicable'>NotApplicable </option>
                                 </Select>
                             
                                </FormControl>
                                </SimpleGrid>
                             
           <Box textAlign="center" mt={8}>
            <Button
              w={{ base: "100%", md: "200px" }}
              colorScheme="blue"
            >
              Create
            </Button>
          </Box>
                  
                </Box>
                
              </Box>

    );
}   
export default CreateGroup;