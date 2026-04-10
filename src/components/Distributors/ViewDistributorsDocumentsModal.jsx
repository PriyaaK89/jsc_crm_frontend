import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  Flex,
  Button,
  Text,
  ModalCloseButton,
  Box,
  Image,
  SimpleGrid,
  useDisclosure,
} from "@chakra-ui/react";
import { FiEye } from "react-icons/fi";
import PreviewDocumentModal from "./PreviewDistributor";

const ViewDistributorsDocumentsModal = ({ isOpen, onClose, distributor }) => {
  const documents = distributor || {};

  const [previewImage, setPreviewImage] = useState(null);

  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onClose: onPreviewClose,
  } = useDisclosure();

  const filteredDocuments = Object.entries(documents).filter(
    ([key, value]) =>
      key !== "id" &&
      key !== "distributor_id" &&
      value &&
      typeof value === "string" &&
      value.startsWith("http")
  );

  return (
    <>
      {/* Preview Modal */}
      <PreviewDocumentModal
        isOpen={isPreviewOpen}
        onClose={onPreviewClose}
        image={previewImage}
      />

      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />

        <ModalContent borderRadius="12px" overflow="hidden">
          {/* HEADER */}
          <Flex
            bg="blue.500"
            color="white"
            px={4}
            py={3}
            justifyContent="space-between"
            align="center"
          >
            <Text fontWeight="bold">Distributor Documents</Text>
            <ModalCloseButton position="static" color="white" />
          </Flex>

          {/* BODY */}
          <ModalBody>
            {filteredDocuments.length === 0 ? (
              <Text>No Documents Found</Text>
            ) : (
              <SimpleGrid columns={2} spacing={4}>
                {filteredDocuments.map(([key, url], index) => {
                  const isPDF = url.toLowerCase().endsWith(".pdf");

                  return (
                    <Box key={index} borderWidth="1px" p={3} borderRadius="md">
                      {/* LABEL */}
                      <Text fontWeight="500" mb={2}>
                        {key.replaceAll("_", " ").toUpperCase()}
                      </Text>

                      {/* PDF */}
                      {isPDF ? (
                        <Text
                          color="blue.500"
                          cursor="pointer"
                          onClick={() => window.open(url, "_blank")}
                        >
                          View PDF
                        </Text>
                      ) : (
                        /* IMAGE */
                        <Box position="relative">
                          <Image
                            src={url}
                            alt={key}
                            h="150px"
                            w="100%"
                            objectFit="cover"
                            borderRadius="md"
                          />

                          {/*  VIEW ICON */}
                          <Box
                            position="absolute"
                            top="5px"
                            right="5px"
                            bg="blackAlpha.600"
                            borderRadius="50%"
                            p="5px"
                            cursor="pointer"
                            onClick={() => {
                              setPreviewImage(url);
                              onPreviewOpen();
                              onClose();
                            }}
                          >
                            <FiEye color="white" />
                          </Box>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </SimpleGrid>
            )}
          </ModalBody>

          {/* FOOTER */}
          <ModalFooter>
            <Button onClick={onClose} colorScheme="blue">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ViewDistributorsDocumentsModal;