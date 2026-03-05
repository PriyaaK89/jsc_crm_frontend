import { Flex, FormControl,FormLabel,Input } from "@chakra-ui/react";
import { Select } from '@chakra-ui/react'
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack,VStack,Heading,Button,SimpleGrid} from "@chakra-ui/react";


function CreateLedgerActivationIntersetcalcuation() {
     const labelStyles = {
        fontSize: "12px",
        color: "#686868",
        marginBottom: "3px",
    };
  return (
    <>
      <FormControl isRequired mt={5}>
                                        <FormLabel {...labelStyles} >Activate interest calculation</FormLabel>
                             <Select name="active_interest_calculation" fontSize="14px">
          <option value="-1"> Plese Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
       </Select>
       </FormControl>
    </>
  )
}

export default CreateLedgerActivationIntersetcalcuation
