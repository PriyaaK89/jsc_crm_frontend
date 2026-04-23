import {
  Modal,
  ModalOverlay,
  Flex,
  Text,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Image,
  Center,
} from "@chakra-ui/react";

const ViewEmpImageModal = ({ isOpen, onClose, image }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />

      <ModalContent borderRadius="12px" mx="12px" overflow="hidden">
        {/* Header */}
        <Flex
          bg="blue.500"
          color="white"
          px={4}
          py={3}
          justifyContent="space-between"
          alignItems="center"
          borderTopRadius="12px"
        >
          <Text fontWeight="bold">Image Preview</Text>

          <ModalCloseButton position="static" color="white" />
        </Flex>

        {/* Body */}
        <ModalBody p={4}>
          {image ? (
            <Image
              src={image}
              alt="Preview"
              w="100%"
              maxH="80vh"
              objectFit="contain"
              borderRadius="lg"
            />
          ) : (
            <Center h="200px">
              <Text color="gray.400">No Image Available</Text>
            </Center>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ViewEmpImageModal;