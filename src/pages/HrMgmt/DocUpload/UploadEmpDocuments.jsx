import React from "react";
import { Box, Text, VStack, Divider, Button } from "@chakra-ui/react";
import DocumentRow from "./DocumentRow";
import { useLocation, useNavigate } from "react-router-dom";


const DOCUMENTS = [
  { label: "Old Salary Slip", type: "old_salary_slip" },
  { label: "Experience Certificate", type: "experience_certificate" },
  { label: "Education Certificate", type: "education_certificate" },
  { label: "PAN Card", type: "pan_card" },
  { label: "Aadhar Card", type: "aadhar_card" },
  { label: "Voter Card", type: "voter_card" },
  { label: "Driving Licence", type: "driving_licence" },
  { label: "Bank Passbook", type: "bank_passbook" },
  { label: "Address Proof", type: "address_proof" },
];

const UploadEmpDocuments = () => {
    const location = useLocation();
const navigate = useNavigate();

const { userId, email, mustChangePassword } = location.state || {};

const handleNext = () => {
  if (Number(mustChangePassword) === 1) {
    navigate("/change-password", {
      state: {
        userId,
        email,
      },
    });
  } else {
    navigate("/dashboard"); // or wherever you want to go next
  }
};

console.log(userId, "usersID")
  return (
    <Box p={5} bg="white" rounded="md" shadow="md">
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Upload Employee Documents
      </Text>

      <VStack spacing={4} align="stretch" divider={<Divider />}>
        {DOCUMENTS.map((doc) => (
          <DocumentRow
            key={doc.type}
            label={doc.label}
            documentType={doc.type}
            userId={userId}
            email={email}
            mustChangePassword={mustChangePassword}
          />
        ))}
      </VStack>
        <Box mt={6} textAlign="right">
        <Button colorScheme="blue" onClick={handleNext}>
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default UploadEmpDocuments;
