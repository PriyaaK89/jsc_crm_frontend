import React, { useEffect, useState } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, VStack, FormControl, FormLabel, Input, Text, useToast, InputGroup, InputLeftElement, Spinner, Box, Divider} from "@chakra-ui/react";
import { FiEdit2 } from "react-icons/fi";
import API from "../../services/api";
import { API_ENDPOINTS} from "../../services/endpoints";

const EditSubteamModel = ({ isEditModelOpen, onEditModelClose, getSubteamsList, selectedSubteam}) => {

  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
      name: "",
      sub_team_target_amount: ""
    });

  // ================= SET DATA =================

  useEffect(() => {
    if (selectedSubteam) {
      setFormData({
        name:
          selectedSubteam.name || "",
        sub_team_target_amount:
          selectedSubteam.sub_team_target_amount || ""
      });
    }
  }, [selectedSubteam]);

  // ================= HANDLE CHANGE =================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setFormData((prev) => ({

      ...prev,

      [name]:
        name ===
        "sub_team_target_amount"

          ? value

          : value
    }));
  };

  // ================= CLOSE MODAL =================

  const handleClose = () => {
    setFormData({
      name: "",
      sub_team_target_amount: ""
    });
    onEditModelClose();
  };

  // ================= SUBMIT =================

  const handleEditSubteamModel =
    async () => {
      try {
        if (
          !formData.name.trim() ||
          !formData.sub_team_target_amount
        ) {
          toast({

            title: "Validation Error",
            description: "All fields are required",
            status: "warning",
            duration: 3000,
            isClosable: true,
            position: "top-right"
          });

          return;
        }

        if (
          Number(
            formData.sub_team_target_amount
          ) <= 0
        ) {

          toast({
            title: "Invalid Amount",
            description: "Target amount must be greater than 0",
            status: "warning",
            duration: 3000,
            isClosable: true,
            position: "top-right"
          });

          return;
        }

        setLoading(true);
        const payload = {

          name:
            formData.name.trim(),

          sub_team_target_amount:
            Number(
              formData.sub_team_target_amount
            )
        };

        const response =  await API.put( `${API_ENDPOINTS.edit_suTeam}/${selectedSubteam.id}`, payload );
        toast({
          title: "Success",
          description:
            response?.data?.message ||
            "Sub team updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right"
        });
        getSubteamsList();
        handleClose();

      } catch (error) {
        console.log(error);
        toast({
          title: "Error",
          description:
            error?.response?.data
              ?.message ||
            "Something went wrong",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right"
        });

      } finally {
        setLoading(false);
      }
    };

  return (

    <Modal
      isOpen={isEditModelOpen}
      onClose={handleClose}
      isCentered
      size="lg" >

      <ModalOverlay
        bg="blackAlpha.400"
        backdropFilter="blur(3px)"
      />

      <ModalContent
        borderRadius="20px"
        overflow="hidden"
      >

        {/* HEADER */}

        <Box
          bg="#c3dae0"
          px={6}
          py={6}
          borderBottom="1px solid"
          borderColor="gray.100"
        >

          <ModalHeader p={0}>

            <VStack
              spacing={2}
              align="start"
            >


              <Box>

                <Text
                  fontSize="18px"
                  fontWeight="500"
                  color="gray.700"
                >
                  Edit Sub Team
                </Text>

            

              </Box>

            </VStack>

          </ModalHeader>

          <ModalCloseButton
            top="10px"
            right="10px"
          />

        </Box>

        {/* BODY */}

        <ModalBody py={6} px={6}>

          <VStack spacing={5}>

            {/* NAME */}

            <FormControl isRequired>

              <FormLabel
                fontSize="14px"
                fontWeight="500"
                color="gray.700"
              >
                Sub Team Name
              </FormLabel>

              <Input
                placeholder="Enter sub team name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                h="48px"
                borderRadius="12px"
                borderColor="gray.300"
                _focus={{
                  borderColor:
                    "#237086",
                  boxShadow:
                    "0 0 0 1px #237086"
                }}
              />

            </FormControl>

            {/* TARGET */}

            <FormControl isRequired>

              <FormLabel
                fontSize="14px"
                fontWeight="500"
                color="gray.700"
              >
                Target Amount
              </FormLabel>

              <InputGroup>

                <InputLeftElement
                  h="48px"
                  pointerEvents="none"
                  color="gray.500"
                >
                  ₹
                </InputLeftElement>

                <Input
                  type="number"
                  min={1}
                  placeholder="Enter target amount"
                  name="sub_team_target_amount"
                  value={
                    formData.sub_team_target_amount
                  }
                  onChange={handleChange}
                  h="48px"
                  borderRadius="12px"
                  borderColor="gray.300"
                  _focus={{
                    borderColor:
                      "#237086",
                    boxShadow:
                      "0 0 0 1px #237086"
                  }}
                />

              </InputGroup>

            </FormControl>

          </VStack>

        </ModalBody>

        <Divider />

        {/* FOOTER */}

        <ModalFooter gap={3} py={4}>

          <Button
            variant="outline"
            onClick={handleClose}
            borderRadius="12px" fontWeight="500"
          >
            Cancel
          </Button>

          <Button
            bg="#237086"
            color="white"
            _hover={{
              bg: "#1B5A6B"
            }} fontWeight="500"
            borderRadius="12px"
            onClick={
              handleEditSubteamModel
            }
            isLoading={loading}
            loadingText="Updating..."
            minW="160px"
            isDisabled={
              !formData.name ||
              !formData.sub_team_target_amount
            }
          >
            Update Sub Team
          </Button>

        </ModalFooter>

      </ModalContent>

    </Modal>
  );
};

export default EditSubteamModel;