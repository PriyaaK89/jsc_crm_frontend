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
  Image,
  Divider,
  Button,
  Input,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";

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
        `${API_ENDPOINTS?.get_emp_docs}/${selectedId}`
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
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent borderRadius="14px">
        <ModalHeader>Uploaded Documents</ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          {userName && (
            <>
              <Text fontSize="lg" fontWeight="600" mb={4}>
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
                <Box key={key}>
                  <Text fontWeight="500" mb={2}>
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
                      <Text color="gray.500" fontStyle="italic" mb={2}>
                        Not provided
                      </Text>

                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={() => handleUploadClick(key)}
                        isLoading={uploadingKey === key}
                      >
                        Upload
                      </Button>
                    </>
                  )}
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
