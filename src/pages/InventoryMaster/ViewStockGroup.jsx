import { FormControl, SimpleGrid, VStack, Box, Text, FormLabel, Button, Select } from '@chakra-ui/react'
import React from 'react'

const ViewStockGroup = () => {
  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">
          View Stock Groups
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
          <FormControl>
            <FormLabel>Select Stock Group</FormLabel>
            <Select placeholder="Select Stock Group">
              <option value="group1">Stock Group 1</option>
              <option value="group2">Stock Group 2</option>
            </Select>

          </FormControl>
        </SimpleGrid>
        <Button ml="auto" colorScheme="blue">View</Button>
      </VStack>
    </Box>
  )
}

export default ViewStockGroup