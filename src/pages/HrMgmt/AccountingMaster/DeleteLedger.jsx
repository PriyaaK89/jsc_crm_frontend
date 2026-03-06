import { Flex, FormControl,FormLabel,Input } from "@chakra-ui/react";
import { Select } from '@chakra-ui/react'
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack,VStack,Heading,Button,SimpleGrid} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";


function DeleteLedger() {
   const labelStyles = {
        fontSize: "12px",
        color: "#686868",
        marginBottom: "3px",
    };
  return (
    <>
   <Box >
                 <HStack justifyContent='space-between'>
                                      <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
                                        <BreadcrumbItem>
                                          <BreadcrumbLink href='/dashboard'><GoHomeFill color="#5570F1" /> </BreadcrumbLink>
                                        </BreadcrumbItem>
                            
                                        <BreadcrumbItem>
                                          <BreadcrumbLink href='#' color='#8B8D97' fontSize='13px'>Delete Ledger </BreadcrumbLink>
                                        </BreadcrumbItem>
                            
                                      </Breadcrumb>
                                   
                            
                                    </HStack>
                                 < Heading size="lg" textAlign="center" mb={6}>
                                                    Delete Ledger 
                                                    </Heading>
                <FormControl>
                               <FormLabel {...labelStyles}>Select Ledger </FormLabel>
                             <Select fontSize="12px" placeholder='Select Ledger name' >
                      </Select>
                     </FormControl>
                     <Box textAlign="center" mt={8}>
                    <Button w={{ base: "100%", md: "200px" }} colorScheme="blue">Delete Ledger </Button>
                    </Box>
                    </Box>
     
    </>
  )
}

export default DeleteLedger;
