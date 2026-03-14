import React from "react";
import { Box, Heading, Text, Button, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const ESignSuccess = () => {
  const navigate = useNavigate();

  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="green.50"
    >
      <VStack spacing={6} bg="white" p={10} rounded="lg" shadow="lg">
        <Heading color="green.500">Document Signed Successfully</Heading>

        <Text textAlign="center">
          Thank you! Your document has been signed successfully.
        </Text>

        <Button
          colorScheme="green"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
        </Button>
      </VStack>
    </Box>
  );
};

export default ESignSuccess;