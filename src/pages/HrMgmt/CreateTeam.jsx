import { FormControl,FormLabel,Input } from "@chakra-ui/react";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack,VStack,Heading,Button} from "@chakra-ui/react";

import { GoHomeFill } from "react-icons/go";




const CreateTeam = () => {
   const labelStyles = {
        fontSize: "12px",
        color: "#686868",
        marginBottom: "3px",
    };

    return (
    <Box w="100%" >
                <HStack justifyContent='space-between'>
                      <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
                        <BreadcrumbItem>
                          <BreadcrumbLink href='/dashboard'><GoHomeFill color="#5570F1" /> </BreadcrumbLink>
                        </BreadcrumbItem>
            
                        <BreadcrumbItem>
                          <BreadcrumbLink href='#' color='#8B8D97' fontSize='13px'>Create Business Development Team</BreadcrumbLink>
                        </BreadcrumbItem>
            
                      </Breadcrumb>
                   
            
                    </HStack>
                
         <Box>

                <Heading size="md" textAlign="center" mb={6}>
                  Create Business Developement Team
                </Heading>
                   </Box>

                <Box as="form" >
                  <VStack spacing={5}>
                    <FormControl isRequired>
                      <FormLabel {...labelStyles}>
                        Team Name
                      </FormLabel>
                      <Input placeholder="Enter department name" />
                    </FormControl>

                     <FormControl isRequired>
                      <FormLabel {...labelStyles}>
                        Team Target Amount
                      </FormLabel>
                      <Input placeholder="Enter department name" />
                    </FormControl>
          
                    <Button type="submit" colorScheme="blue" margin='auto'  loadingText="Creating..."w="200px" >
                      Create Team
                    </Button>
                  </VStack>
                </Box>
              </Box>










    );
}   
export default CreateTeam;