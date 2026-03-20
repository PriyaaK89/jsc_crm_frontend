import React, { useRef, useState } from "react";
import { Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Text, useToast,} from "@chakra-ui/react";
import { FiUpload } from "react-icons/fi";
import { API_ENDPOINTS } from "../../../services/endpoints";
import API from "../../../services/api";

const UploadDocumentModal = ({ isOpen, onClose, userId, documentType }) => {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Please select a file",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", userId);
    formData.append("document_type", documentType);

    try {
      setLoading(true);

      await API.post(API_ENDPOINTS?.upload_img, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({
        title: "Document uploaded successfully",
        status: "success",
        duration: 2000,
      });

      setFile(null);
      onClose();
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          error?.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="12px" mx="10px" >
        <ModalHeader bg="blue.500" color="white" border="12px" fontSize={{base:"15px",md:"lg"}}>Upload Document
        </ModalHeader>
        <ModalCloseButton />

      



        {/* Body */}
        <ModalBody mt={4}>
          <Box
            border="2px dashed #CBD5E0"
            borderRadius="md"
            p={7}
            textAlign="center"
            cursor="pointer"
            onClick={handleBrowseClick}
            _hover={{ bg: "gray.50" }}
          >
            <FiUpload size={40} style={{ margin: "0 auto" }} />

            <Text mt={2}>
              {file ? file.name : "Drag and Drop Files here or"}
            </Text>

            <Button mt={3} colorScheme="blue" variant="outline">
              Browse Files
            </Button>

            {/* Hidden input */}
            <input
              type="file"
              ref={fileInputRef}
              hidden
              onChange={handleFileChange}
              accept="image/*,.pdf"
            />
          </Box>
        </ModalBody>

        {/*  Footer */}
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>

          <Button
            colorScheme="blue"
            isLoading={loading}
            onClick={handleUpload}
          >
            Upload
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UploadDocumentModal;