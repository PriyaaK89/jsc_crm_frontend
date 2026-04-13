import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Spinner,
  Box,
  Text,
  VStack,
} from "@chakra-ui/react";

function DistributorAgreementModel({
  isOpen,
  onClose,
  pdfUrl,
  loading,
  selectedId,
}) {
  const [error, setError] = useState(false);

  const handleDownload = async () => {
  try {
    const response = await fetch(pdfUrl);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `distributor_agreement_${selectedId}.pdf`;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
  }
};

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" borderRadius="lg" >
      <ModalOverlay />
      <ModalContent >
        <Box bg="#EDF2F7" h="100%"  borderTopLeftRadius="xl" borderTopRightRadius="xl">
        <ModalHeader m={4} >Distributor Agreement</ModalHeader>
        <ModalCloseButton m={1}  size="lg" mb={2} bg="-moz-initial" borderRadius="full" _hover={{ bg: "gray.500", color: "white" }} />
        </Box>

        <ModalBody borderRadius="lg">
          {loading ? (
            <VStack py={10}>
              <Spinner size="lg" />
              <Text>Loading PDF...</Text>
            </VStack>
          ) : pdfUrl ? (
            <>
              {!error ? (
                <Box height="650px" border="1px solid #eee" borderRadius="md">
                  <iframe
                    src={pdfUrl}
                    title="PDF Preview"
                    width="100%"
                    height="100%"
                    onError={() => setError(true)}
                  />
                </Box>
              ) : (
                <VStack py={10}>
                  <Text color="red.500">
                    Failed to load PDF in preview
                  </Text>

                  <Button
                    colorScheme="blue"
                    onClick={() => window.open(pdfUrl, "_blank")}
                  >
                    Open in New Tab
                  </Button>
                </VStack>
              )}

              {/* Actions */}
              <VStack mt={4}  mb={4} spacing={3} justify="center" justifyContent="center" flexDirection={{ base: "column", md: "row" }}>
                <Button
                 variant="outline"
                 
                  onClick={() => window.open(pdfUrl, "_blank")}
                >
                  Open Full Screen
                </Button>

                <Button
                 
                   colorScheme="blue"
                    onClick={handleDownload}
                    >
                  Download PDF
                </Button>
              </VStack>
            </>
          ) : (
            <Text textAlign="center" py={10}>
              No PDF available
            </Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default DistributorAgreementModel;