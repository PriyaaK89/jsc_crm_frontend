import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Flex,
  Text,
  SimpleGrid,
  Image,
  Spinner,
  Box,
  Center,
  useDisclosure,
} from "@chakra-ui/react";

import { ViewIcon } from "@chakra-ui/icons";
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import ViewEmpImageModal from "./ViewEmpImageModal";

const EmployeeImageModal = ({
  isOpen,
  onClose,
  selectedUserId,
  selectedDate,
}) => {
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewImg, setPreviewImg] = useState("");

  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onClose: onPreviewClose,
  } = useDisclosure();

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // API call
  const fetchEmployeeImages = async () => {
    try {
      setLoading(true);

      const response = await API.get(
        `${API_ENDPOINTS.get_attendance_images}/${selectedUserId}`,
        {
          params: { date: formatDate(selectedDate) },
        }
      );

      if (response.status === 200) {
        setEmp(response.data.images);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectedUserId && selectedDate) {
      fetchEmployeeImages();
    }
  }, [isOpen, selectedUserId, selectedDate]);

  const handlePreviewImage = (image) => {
    setPreviewImg(image);
    onPreviewOpen();
  };

  const capitalize = (text) =>
    text.replace(/\b\w/g, (char) => char.toUpperCase());

  const ImageCard = ({ title, src }) => (
  <Box
    position="relative"
    borderRadius="lg"
    overflow="hidden"
    border="1px solid"
    borderColor="gray.300"
    boxShadow="sm"
    aspectRatio="1"
  >
    {src ? (
      <>
        <Image src={src} alt={title} objectFit="cover" w="100%" h="100%"/>

        {/* Title + Icon */}
        <Box position="absolute" top="0" left="0" w="100%" bg="rgba(0,0,0,0.6)" 
        color="white" px={3} py={2} fontSize="sm" fontWeight="600" display="flex" 
        justifyContent="space-between" alignItems="center" zIndex="2">
          <Text fontSize="sm">
            {capitalize(title)}
          </Text>

          <Box
            bg="white"
            p={1}
            borderRadius="full"
            cursor="pointer"
            onClick={() => handlePreviewImage(src)}
          >
            <ViewIcon boxSize={4} color="blue.500" />
          </Box>
        </Box>
      </>
    ) : (
      <Center h="100%" bg="gray.100">
        <Text color="gray.400">
          {capitalize(title)} - No Image
        </Text>
      </Center>
    )}
  </Box>
);

  return (
    <>
      {/* Main Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />

        <ModalContent borderRadius="12px" mx="12px" overflow="hidden">
          <Flex
            bg="blue.500"
            color="white"
            px={4}
            py={3}
            justifyContent="space-between"
            alignItems="center"
            borderRadius="12px 12px 0px 0px"
          >
            <Text fontWeight="bold">
              Employee Attendance Images
            </Text>
            <ModalCloseButton color="white" position="static" />
          </Flex>

          <ModalBody pb={6} maxH="70vh" overflowY="auto">
            {loading ? (
              <Center py={10}>
                <Spinner size="lg" color="blue.500" />
              </Center>
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                {emp &&
                  Object.entries(emp).map(([key, value]) => (
                    <ImageCard
                      key={key}
                      title={key.replaceAll("_", " ")}
                      src={value}
                    />
                  ))}
              </SimpleGrid>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Preview Modal */}
      <ViewEmpImageModal
        isOpen={isPreviewOpen}
        onClose={onPreviewClose}
        image={previewImg}
      />
    </>
  );
};

export default EmployeeImageModal;