import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,   
  Image,
  Button        
} from "@chakra-ui/react";
import React from "react";

const PreviewDocument = ({ isOpen, onClose, image }) => {

  //  Download function
  const handleDownload = async () => {
    try {
      const response = await fetch(image);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "document.jpg"; // file name
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="12px" mx="10px">
        
        <ModalHeader
          bg="blue.500"
          textColor="white"
          p={7}
          fontSize={{ base: "15px", md: "lg" }}
        >
          Document Preview
        </ModalHeader>

        <ModalCloseButton color="white" p={5} />

        <ModalBody>
          <Image
            src={image}
            w="100%"
            maxH="500px"
            objectFit="contain"
          />
        </ModalBody>

        {/* ✅ Footer with buttons */}
        <ModalFooter>
          <Button variant="ghost" border="1px solid #ccc" onClick={onClose} mr={2}>
            Cancel
          </Button>

          <Button colorScheme="blue" onClick={handleDownload}>
            Download
          </Button>
        </ModalFooter>

      </ModalContent>
    </Modal>                                                               
  );
};

export default PreviewDocument;