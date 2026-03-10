import React from "react";
import { Box, Heading, Text, Button, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const ESignError = () => {
  const navigate = useNavigate();

  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="red.50"
    >
      <VStack spacing={6} bg="white" p={10} rounded="lg" shadow="lg">
        <Heading color="red.500">Signing Failed</Heading>

        <Text textAlign="center">
          Something went wrong while signing the document.
          Please try again or contact support.
        </Text>

        <Button
          colorScheme="red"
          onClick={() => navigate("/dashboard")}
        >
          Go Back
        </Button>
      </VStack>
    </Box>
  );
};

export default ESignError;