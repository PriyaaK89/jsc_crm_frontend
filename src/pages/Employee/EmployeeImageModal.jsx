import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  SimpleGrid,
  Image,
  Spinner,
  Box,
  Center,
} from "@chakra-ui/react";

import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const EmployeeImageModal = ({
  isOpen,
  onClose,
  selectedUserId,
  selectedDate,
}) => {
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const fetchEmployeeImages = async () => {
    try {
      setLoading(true);

      const formattedDate = formatDate(selectedDate);

      const response = await API.get(
        `${API_ENDPOINTS.get_attendance_images}/${selectedUserId}`,
        {
          params: { date: formattedDate },
        }
      );

      if (response.status === 200) {
        setEmp(response.data.images);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectedUserId && selectedDate) {
      fetchEmployeeImages();
    }
  }, [isOpen, selectedUserId, selectedDate]);

  //  Capitalize Function
  const capitalize = (text) =>
    text.replace(/\b\w/g, (char) => char.toUpperCase());

  //  Image Card Component
  const ImageCard = ({ title, src }) => (
    <Box
      position="relative"
      borderRadius="lg"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.200"
      boxShadow="sm"
      _hover={{ boxShadow: "md" }}
    >
      {src ? (
        <>
          <Image
            src={src}
            alt={title}
            objectFit="cover"
            w="100%"
            h="220px"
          />

          {/* Overlay Title */}
          <Box
            position="absolute"
            top="0"
            left="0"
            w="100%"
            bg="rgba(0,0,0,0.6)"
            color="white"
            px={3}
            py={2}
            fontSize="sm"
            fontWeight="600"
          >
            {capitalize(title)}
          </Box>
        </>
      ) : (
        <Box
          h="220px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="gray.100"
        >
          <Text color="gray.400">
            {capitalize(title)} - No Image Available
          </Text>
        </Box>
      )}
    </Box>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader fontWeight="600">
          Employee Attendance Images
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          {loading ? (
            <Center py={10}>
              <Spinner size="lg" color="blue.500" />
            </Center>
          ) : (
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={6}
            >
              <ImageCard title="office selfie" src={emp?.office_selfie} />
              <ImageCard title="odometer" src={emp?.odometer} />
              <ImageCard title="day over selfie" src={emp?.day_over_selfie} />
              <ImageCard title="day over odometer" src={emp?.day_over_odometer} />
              <ImageCard title="field selfie" src={emp?.field_selfie} />
            </SimpleGrid>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EmployeeImageModal;