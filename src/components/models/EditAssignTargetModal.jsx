import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Spinner,
  Text,
  useToast,
  Badge,
  VStack,
  ModalHeader,
} from "@chakra-ui/react";

import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const EditAssignTargetForm = ({
  isEditModalOpen,
  onEditModalClose,
  selectedId,
  getTargetList,
}) => {

  const toast = useToast();

  const [loading, setLoading] = useState(false);

  const [submitLoading, setSubmitLoading] =
    useState(false);

  const [targetInfo, setTargetInfo] = useState(null);

  const [formData, setFormData] = useState({
    target: "",
    role: "",
  });

  // GET TARGET INFO

  const getTargetInfoById = async () => {

    try {

      setLoading(true);

      const response = await API.get(
        `${API_ENDPOINTS.get_assigned_targets_by_id}/${selectedId}`
      );

      if (response?.status === 200) {

        const data = response?.data?.data;

        setTargetInfo(data);

        setFormData({
          target: data?.total_target || "",
          role: data?.role || "",
        });
      }

    } catch (error) {

      console.log(error);

      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to fetch target info",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

    } finally {

      setLoading(false);
    }
  };

  // FETCH ON MODAL OPEN

  useEffect(() => {

    if (selectedId && isEditModalOpen) {
      getTargetInfoById();
    }

  }, [selectedId, isEditModalOpen]);

  // HANDLE CHANGE

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // RESET FORM

  const resetForm = () => {

    setFormData({
      target: "",
      role: "",
    });

    setTargetInfo(null);
  };

  // CLOSE MODAL

  const handleClose = () => {

    resetForm();

    onEditModalClose();
  };

  // EDIT TARGET

  const handleEditTarget = async () => {

    try {

      if (!formData.target) {

        toast({
          title: "Validation Error",
          description: "Target is required",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });

        return;
      }

      setSubmitLoading(true);

      const payload = {
        target: Number(formData.target),
        role: formData.role,
      };

      const response = await API.put(
        `${API_ENDPOINTS.edit_assigned_targets}/${selectedId}`,
        payload
      );

      if (response?.status === 200) {

        toast({
          title: "Success",
          description:
            response?.data?.message ||
            "Assigned target updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // REFRESH LIST

        if (getTargetList) {
          getTargetList();
        }
        resetForm();
        onEditModalClose();
      }

    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to update assigned target",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

    } finally {

      setSubmitLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleClose}
        isCentered
        size="md"
      >
        <ModalOverlay />

        <ModalContent borderRadius="14px">

          {/* HEADER */}

            <Box bg="#c3dae0" px={6} py={6} borderBottom="1px solid" borderColor="gray.100" borderRadius="14px 14px 0px 0px" >
                                 <ModalHeader p={0}>
                                     <VStack spacing={2} align="start" >
                                         <HStack>
                                             <Text fontSize="16px" fontWeight="600" color="gray.700" > Edit Assigned Target </Text>
                                    
                                         </HStack>
                                     </VStack>
                                 </ModalHeader>
                                 <ModalCloseButton top="10px" right="10px" />
                             </Box>

          <Divider />

          <ModalBody py={6}>

            {loading ? (

              <Flex
                justify="center"
                align="center"
                minH="180px"
              >
                <Spinner size="lg" />
              </Flex>

            ) : (

              <VStack spacing={5} align="stretch">

                <Box
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.100"
                  borderRadius="12px"
                  p={4}
                >

                  <VStack
                    spacing={3}
                    align="stretch"
                  >

                    <HStack
                      justify="space-between"
                    >
                      <Text
                        fontSize="13px"
                        color="gray.500"
                      >
                        User ID
                      </Text>

                      <Badge
                        colorScheme="blue"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {targetInfo?.user_id}
                      </Badge>
                    </HStack>

                    <HStack
                      justify="space-between"
                    >
                      <Text
                        fontSize="13px"
                        color="gray.500"
                      >
                        Current Pending
                      </Text>

                      <Badge
                        colorScheme="orange"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {targetInfo?.pending_target}
                      </Badge>
                    </HStack>

                  </VStack>
                </Box>

                {/* ROLE */}

                <FormControl>

                  <FormLabel
                    fontSize="14px"
                    fontWeight="600"
                  >
                    Role
                  </FormLabel>

                  <Input
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="Enter role"
                    focusBorderColor="#184E68"
                  />

                </FormControl>

                {/* TARGET */}

                <FormControl>

                  <FormLabel
                    fontSize="14px"
                    fontWeight="600">
                    Target
                  </FormLabel>

                  <Input
                    name="target" type="number"
                    value={formData.target}
                    onChange={handleChange}
                    placeholder="Enter target"
                    focusBorderColor="#184E68" />

                </FormControl>

                {/* BUTTONS */}

                <Flex
                  justify="flex-end"
                  gap={3}
                  pt={2}
                >

                  <Button
                    variant="outline"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>

                  <Button
                    bg="#237086" color="white"
                        _hover={{ bg: "#1B5A6B" }} fontWeight="500"
                        borderRadius="12px"
                        minW="160px" fontSize="14px"
                    onClick={handleEditTarget}
                    isLoading={submitLoading}
                  >
                    Update Target
                  </Button>

                </Flex>

              </VStack>
            )}

          </ModalBody>

        </ModalContent>
      </Modal>
    </>
  );
};

export default EditAssignTargetForm;