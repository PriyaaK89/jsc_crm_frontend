import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Image,
  Flex,
  Text,
  ModalCloseButton,
} from "@chakra-ui/react";


const PreviewDocumentModal = ({ isOpen, onClose, image }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(image);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "document";
      document.body.appendChild(link);
      link.click();

      link.remove();
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
              <ModalContent borderRadius="12px" mx="12px" overflow="hidden">
                {/* HEADER */}
                <Flex
                  bg="blue.500"
                  color="white"
                  px={4}
                  py={3}
                  justifyContent="space-between"
                  align="center"
                  borderRadius="12px 12px 0px 0px"

                >
                  <Text fontWeight="bold">Preview  Documents</Text>
                  <ModalCloseButton position="static" color="white" />
                </Flex>
      
     
        <ModalBody textAlign="center">
          <Image src={image} maxH="400px" mx="auto" />
        </ModalBody>

        <ModalFooter justifyContent="end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleDownload} ml={2}>
            Download
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PreviewDocumentModal;