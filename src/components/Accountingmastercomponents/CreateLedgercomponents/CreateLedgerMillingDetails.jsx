import React from 'react'
import { Select } from '@chakra-ui/react'
import { FormControl,FormLabel,Input } from "@chakra-ui/react";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack,Heading,Button,SimpleGrid} from "@chakra-ui/react";

function CreateLedgerMillingDetails() {
     const labelStyles = {
        fontSize: "12px",
        color: "#686868",
        marginBottom: "3px",
    };
  return (
    <>
       <Box w="100%" bg="#fffdfd"  border="1px" borderRadius="lg" mt={5}>
           <HStack justifyContent='space-between' bg="#e9f2ff" borderBottom="1px solid #d9e5f8" p={1} pl={6}>
                            <Breadcrumb  padding='10px 0px 1rem 0px' >
                              <BreadcrumbItem>
                                <BreadcrumbLink  color='#000000' size="lg" >Mailing Details :</BreadcrumbLink>
                              </BreadcrumbItem>
                            </Breadcrumb>
                          </HStack>
                         
          
                   <FormControl isRequired  p={4}>
               <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                        <FormControl isRequired mt={5}>
                            <FormLabel {...labelStyles} >
                             Name
                            </FormLabel>
                            <Input placeholder="Enter A/C holder's name" />
                          </FormControl>   
      
                         
                         <FormControl isRequired mt={5}>
                                        <FormLabel {...labelStyles} >Location</FormLabel>
                             <Select name="location" fontSize="14px">
                              <option value="-1"> Plese Select</option>
                               <option value="yes">Yes</option>
                              <option value="no">No</option>
                                  </Select>
                             </FormControl>  
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                        
                        <FormControl isRequired mt={5}>
                            <FormLabel {...labelStyles} >
                          Country
                            </FormLabel>
                            <Input placeholder="Enter country name" />
                          </FormControl> 
      
                        <FormControl isRequired mt={5}>
                            <FormLabel {...labelStyles} >
                       State
                            </FormLabel>
                            <Input placeholder="Enter state name" />
                          </FormControl> 
      
                         </SimpleGrid>
                         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                        <FormControl isRequired mt={5}>
                            <FormLabel {...labelStyles} >
                           Pincode
                            </FormLabel>
                            <Input placeholder="Enter pin code " />
                          </FormControl>  
      </SimpleGrid>
       </FormControl>
         </Box>
    </>
  )
}

export default CreateLedgerMillingDetails
