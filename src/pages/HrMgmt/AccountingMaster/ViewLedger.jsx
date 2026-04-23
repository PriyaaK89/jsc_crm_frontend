import { Flex, FormControl,FormLabel,Input } from "@chakra-ui/react";
import { Select } from '@chakra-ui/react'
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack,VStack,Heading,Button,SimpleGrid} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";

function ViewLedger() {
  const labelStyles = {
        fontSize: "12px",
        color: "#686868",
        marginBottom: "3px",
    };
  return (
    <>
   <Box
       bg="white"
       mt={{base:2, md:5}}
       px={{base:3, md:6}}
       py={{base:3, md:4}}
      borderRadius="lg"
      boxShadow="md"
   >
       
                 <HStack justifyContent='space-between'>
                                      <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
                                        <BreadcrumbItem>
                                          <BreadcrumbLink as={Link} to='/dashboard'><GoHomeFill color="#5570F1" /> </BreadcrumbLink>
                                        </BreadcrumbItem>
                            
                                        <BreadcrumbItem>
                                          <BreadcrumbLink isCurrentPage color='#8B8D97' fontSize='13px'> Select Ledger </BreadcrumbLink>
                                        </BreadcrumbItem>
                            
                                      </Breadcrumb>
                                   
                            
                                    </HStack>
                                 < Heading size="md" textAlign="center" mb={6}>
                                                    Select Ledger 
                                                    </Heading>
                <FormControl>
                               <FormLabel {...labelStyles}>Select Ledger </FormLabel>
                             <Select fontSize="12px" placeholder='Select Ledger name' >
                      </Select>
                     </FormControl>
                     <Box textAlign="center" mt={8}>
                    <Button w={{ base: "100%", md: "200px" }} colorScheme="blue">View Ledger </Button>
                    </Box>
                    </Box>
     
    </>
  )
}

export default ViewLedger
