import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
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
  Flex,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import PreviewDocument from "./PreviewDocumentModal";
import { FiUploadCloud, FiEye } from "react-icons/fi";
import { useDisclosure } from "@chakra-ui/react";
import { RxUpdate } from "react-icons/rx";

const DOCUMENT_LABELS = {
  aadhar_card: "Aadhar Card Front",
  aadhar_card_back: "Aadhar Card Back",
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
  const [previewImage, setPreviewImage] = useState(null);

  const toast = useToast();

  const {
    isOpen: isPreviewDocumentOpen,
    onOpen: onPreviewDocumentOpen,
    onClose: onPreviewDocumentClose,
  } = useDisclosure();

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
    } catch {
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
    <>
      <PreviewDocument
        isOpen={isPreviewDocumentOpen}
        onClose={onPreviewDocumentClose}
        image={previewImage}
      />

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay />

        <ModalContent borderRadius="12px" mx="10px">
          {/* Header */}
          <Flex
            bg="blue.500"
            color="white"
            px={4}
            py={3}
            justifyContent="space-between"
            alignItems="center"
            borderRadius="12px 12px 0px 0px"
          >
            <Text fontWeight="bold">View Employee Documents</Text>
            <ModalCloseButton color="white" position="static" />
          </Flex>

          <ModalBody pb={6}>
            {userName && (
              <>
                <Text fontSize="lg" fontWeight="600" my={4}>
                  UserName: {userName}
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

            <VStack spacing={6} align="stretch">
              {Object.keys(DOCUMENT_LABELS).map((key) => {
                const url = docs[key];

                return (
                  <Box key={key}>
                    <SimpleGrid
                      columns={{ base: 1, md: 3 }} 
                      spacing={{base: 2, md: 4}} 
                      alignItems="center"
                    >
                      {/* Label */}
                      <Text fontSize="sm" fontWeight="500">
                        {DOCUMENT_LABELS[key]}
                      </Text>

                      {/* Image */}
                      {url ? (
                        <Box
  position="relative"
  w={{ base: "100%", md: "120px" }}  
  h={{ base: "150px", md: "80px" }}   
>
                          <Image
                            src={url}
                            alt={key}
                            w="100%"
                            h="100%"
                            objectFit="cover"
                            borderRadius="8px"
                            border="1px solid"
                            borderColor="gray.200"
                          />

                          <Box
                            position="absolute"
                            top="5px"
                            right="5px"
                            bg="blackAlpha.600"
                            borderRadius="50%"
                            p="5px"
                            cursor="pointer"
                            onClick={() => {
                              const isPdf = url
                                .toLowerCase()
                                .includes(".pdf");

                              if (isPdf) {
                                window.open(url, "_blank");
                              } else {
                                setPreviewImage(url);
                                onPreviewDocumentOpen();
                                onClose();
                              }
                            }}
                          >
                            <FiEye size={16} color="white" />
                          </Box>
                        </Box>
                      ) : (
                        <Text fontSize="sm" fontStyle="italic">
                          Not provided
                        </Text>
                      )}

                      {/* Button */}
                      <Flex justify={{ base: "center", md: "flex-end" }}>
                        <Button
                          rightIcon={
                            url ? (
                              <RxUpdate size={15} />
                            ) : (
                              <FiUploadCloud size={15} />
                            )
                          }
                          size="sm"
                          w="120px"
                          px={4}
                          fontSize="sm"
                          colorScheme="blue"
                          onClick={() => handleUploadClick(key)}
                          isLoading={uploadingKey === key}
                        >
                          {url ? "Update" : "Upload"}
                        </Button>
                      </Flex>
                    </SimpleGrid>
                  </Box>
                );
              })}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ViewUploadedDocument;