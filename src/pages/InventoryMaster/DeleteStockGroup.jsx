import { FormControl, Text, FormLabel, SimpleGrid, VStack,Box, Select,Button} from '@chakra-ui/react'
import React from 'react'

const DeleteStockGroup = () => {
  return (

    <Box>
        <VStack spacing={4} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">
          Delete Stock Group
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%"> 
         <FormControl>
            <FormLabel>Select Stock Group</FormLabel>
            <Select name="stockGroup" id="stockGroup">
                <option value="group1">Stock Group 1</option> 
                <option value="group2">Stock Group 2</option>  
            </Select>
         </FormControl>
         </SimpleGrid>
         <Button ml="auto" colorScheme="red">Delete</Button>
        </VStack>
    </Box>
  )
}

export default DeleteStockGroup;