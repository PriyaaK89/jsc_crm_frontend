import React from 'react'
import { Select } from '@chakra-ui/react'
import { FormControl,FormLabel,Input } from "@chakra-ui/react";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack,Heading,Button,SimpleGrid} from "@chakra-ui/react";


function CreateLedgerBankAccount() {
    const labelStyles = {
        fontSize: "12px",
        color: "#686868",
        marginBottom: "3px",
    };
  return (
    <>
     <Box w="100%"   borderRadius="lg"  mt={5} border="1px solid black">
         <HStack justifyContent='space-between'  bg="#e9f2ff" borderBottom="1px solid #d9e5f8" p={1} pl={6}>
                          <Breadcrumb  padding='10px 0px 1rem 0px' >
                            
                
                            <BreadcrumbItem>
                              <BreadcrumbLink  color='#000000' size="lg" >Bank Account :</BreadcrumbLink>
                            </BreadcrumbItem>
                          </Breadcrumb>
                        </HStack>
                       
        
                 <FormControl isRequired  p={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                      <FormControl isRequired mt={5}>
                          <FormLabel {...labelStyles} >
                           A/C holder's name
                          </FormLabel>
                          <Input placeholder="Enter A/C holder's name"  />
                        </FormControl>   
    
                       
                      <FormControl isRequired mt={5}>
                          <FormLabel {...labelStyles} >
                         A/C no
                          </FormLabel>
                          <Input placeholder="Enter A/C no" />
                        </FormControl> 
                        </SimpleGrid>
    
                 <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>     
                      <FormControl isRequired mt={5}>
                          <FormLabel {...labelStyles} >
                          IFSC code
                          </FormLabel>
                          <Input placeholder="Enter IFSC code" />
                        </FormControl> 
    
                      <FormControl isRequired mt={5}>
                          <FormLabel {...labelStyles} >
                       Bank Name
                          </FormLabel>
                          <Input placeholder="Enter bank name" />
                        </FormControl> 
    </SimpleGrid>
     <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                       
                      <FormControl isRequired mt={5}>
                          <FormLabel {...labelStyles} >
                          Branch
                          </FormLabel>
                          <Input placeholder="Enter Branch name" />
                        </FormControl>  
    </SimpleGrid>
     </FormControl>
       </Box>

        
      
    </>
  )
}

export default CreateLedgerBankAccount
