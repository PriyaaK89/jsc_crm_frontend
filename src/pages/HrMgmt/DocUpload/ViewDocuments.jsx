import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Box,
  Text,
  VStack,
  SimpleGrid,
  Image,
  Divider,
  Button,
  Input,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import { FiUploadCloud } from "react-icons/fi";


const DOCUMENT_LABELS = {
  aadhar_card: "Aadhar Card",
  pan_card: "PAN Card",
  voter_card: "Voter ID",
  driving_licence: "Driving Licence",
  bank_passbook: "Bank Passbook",
  address_proof: "Address Proof",
  education_certificate: "Education Certificate",
  experience_certificate: "Experience Certificate",
  old_salary_slip: "Old Salary Slip",
};

const ViewUploadedDocument = ({ isOpen, onClose, selectedId }) => {
  const [docs, setDocs] = useState({});
  const [userName, setUserName] = useState("");
  const [uploadingKey, setUploadingKey] = useState(null);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const getEmployeeDocuments = async () => {
    try {
      const res = await API.get(
        `${API_ENDPOINTS?.get_user_docs}/${selectedId}`
      );

      if (res?.status === 200) {
        setDocs(res?.data?.documents || {});
        setUserName(res?.data?.documents?.user_name || "");
      }
    } catch {
      toast({
        status: "error",
        description: "Failed to load documents",
      });
    }
  };

  useEffect(() => {
    if (selectedId && isOpen) getEmployeeDocuments();
  }, [selectedId, isOpen]);

  const handleUploadClick = (docKey) => {
    setUploadingKey(docKey);
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadingKey) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", selectedId);
    formData.append("document_type", uploadingKey);

    try {
      await API.post(API_ENDPOINTS?.upload_img, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({
        status: "success",
        description: "Document uploaded successfully",
      });

      getEmployeeDocuments();
    } catch (err) {
      toast({
        status: "error",
        description: "Upload failed",
      });
    } finally {
      setUploadingKey(null);
      e.target.value = "";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent borderRadius="12px" mx="10px">
        <ModalHeader bg="blue.500" textColor="white" p={7} fontSize={{ base: "15px", md: "lg" }} >Uploaded Documents</ModalHeader>
        <ModalCloseButton color="white" p={5} size={{ base: "md", md: "lg" }} />

        <ModalBody pb={6}>
          {userName && (
            <>

              <Text fontSize="lg" fontWeight="600" mb={4} mt={4}>
                UserName:
                {userName}
              </Text>
              <Divider mb={6} />
            </>
          )}

          <Input
            type="file"
            ref={fileInputRef}
            display="none"
            onChange={handleFileChange}
          />

          <VStack spacing={8} align="stretch">
            {Object.keys(DOCUMENT_LABELS).map((key) => {
              const url = docs[key];

              return (
                <Box key={key} mt={4}>
                    <SimpleGrid columns={3} justify="space-between" spacing={{sm:0, base:0, md:"7rem"}}>

                  <Text fontSize={{base:"12px",md:"14px"}} fontWeight="500" mb={2}  width={{base:"100px", md:"200px"}}>
                    {DOCUMENT_LABELS[key]}
                  </Text>

                  {url ? (
                    <>
                      <Image
                        src={url}
                        alt={key}
                        w="100%"
                        maxH="450px"
                        objectFit="contain"
                        bg="gray.50"
                        borderRadius="8px"
                        border="1px solid"
                        borderColor="gray.200"
                        mb={3}
                      />

                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handleUploadClick(key)}
                        isLoading={uploadingKey === key}
                      >
                        Update
                      </Button>
                    </>
                  ) : (
                    <>
                      <Text fontSize={{base:"12px",md:"14px"}}  fontStyle="italic" mb={2}>
                        Not provided
                      </Text>
                      <Box>

                        <Button
                        rightIcon={<FiUploadCloud  size={15} color="white"/>
}
                          // size="sm"
                          fontSize={{base:"12px",md:"14px"}}
                          colorScheme="blue"
                          onClick={() => handleUploadClick(key)}
                          isLoading={uploadingKey === key}
                        >
                          Upload
                        </Button>
                      </Box>

                    </>
                  )}
                  </SimpleGrid>
                </Box>
              );
            })}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ViewUploadedDocument;
