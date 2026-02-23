import { FormControl, SimpleGrid, VStack, Box, Text, FormLabel, Button, Select,Input } from '@chakra-ui/react'
import React from 'react'

const CreateStockCategory = () => {
  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">
          Create Stock Category
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input type="text"  />
          </FormControl>
          <FormControl>
            <FormLabel isRequired>Select Stock Group</FormLabel>
            <Select placeholder="Select Stock Name">
              <option value="group1">Stock Group 1</option>
              <option value="group2">Stock Group 2</option>
            </Select>

          </FormControl>
        </SimpleGrid>
        <Button ml="auto" colorScheme="blue">Create</Button>
      </VStack>
    </Box>
  )
}

export default CreateStockCategory