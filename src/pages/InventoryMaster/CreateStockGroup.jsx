import {
  Box,
  Text,
  FormControl,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  VStack,
  Button,
} from "@chakra-ui/react";
import React from "react";
import { Form } from "react-router-dom";

const CreateStockGroup = () => {
  return (
          <>

      <VStack spacing={4} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">
          Create Stock Group
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input placeholder="Enter stock group name" />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Under</FormLabel>
            <Select placeholder="Select Stock Group">
              <option>Stock Group 1</option>
              <option>Stock Group 2</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Should quantities of items be added</FormLabel>
            <Select>
              <option>Yes</option>
              <option>No</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Override Limit</FormLabel>
            <Input type="number" />
          </FormControl>
        </SimpleGrid>

        <Button colorScheme="blue" width="fit-content" mx="auto">
          Create Stock Group
        </Button>
      </VStack>
      </>
  );
};

export default CreateStockGroup;