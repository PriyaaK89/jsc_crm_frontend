import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  Image,
  Flex,
} from "@chakra-ui/react";

const EditpageUploadedImagesModel = ({ isOpen, onClose, images }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton  size="lg"/>
        <ModalBody p={{base:3,md:8}} mt={5}>
          <Flex gap={4} justify="center" flexWrap="wrap">
            {images?.logo && (
              <Box textAlign="center"  borderRadius="md">
                <h1>Company logo</h1>
                <Image
                  src={images.logo}
                  alt="Logo"
                  maxH="250px"
                  borderRadius="md"
                />
              </Box>
            )}

            {images?.signature && (
              <Box textAlign="center"  borderRadius="md">
                <h1>Signature</h1>
                <Image
                  src={images.signature}
                  alt="Signature"
                  maxH="250px"
                  borderRadius="md"
                />
              </Box>
            )}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};



export default EditpageUploadedImagesModel
