import { Flex, FormControl,FormLabel,Input } from "@chakra-ui/react";
import { Select } from '@chakra-ui/react'
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack,VStack,Heading,Button,SimpleGrid} from "@chakra-ui/react";

function CreateLedgerGst() {
      const labelStyles = {
        fontSize: "12px",
        color: "#686868",
        marginBottom: "3px",
    };
  return (
    <>
       <Box w="100%"  bg="#fffdfd"  border="1px" borderRadius="lg" mt={5}>
        <HStack justifyContent='space-between' bg="#e9f2ff" borderBottom="1px solid #d9e5f8" p={1} pl={6}>
               <Breadcrumb  padding='10px 0px 1rem 0px' >
                                            <BreadcrumbItem>
                                              <BreadcrumbLink  color='#000000' size="lg" >Tax Registration Details :</BreadcrumbLink>
                                            </BreadcrumbItem>
              
                                          </Breadcrumb>
                                          </HStack>
               <FormControl p={6}>
               <SimpleGrid columns={{ base: 1, md: 2}} spacing={5} >
               
                        <FormControl isRequired >
                            <FormLabel {...labelStyles}>PAN/IT No.</FormLabel>
                                         <Input
                                            />
                          </FormControl>
                          <FormControl isRequired >
                            <FormLabel {...labelStyles}>GSTIN/UN</FormLabel>
                                         <Input/>
                                  </FormControl>
                          
      
                        </SimpleGrid>
                        </FormControl>
          </Box>
    </>
  )
}

export default CreateLedgerGst
