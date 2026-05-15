import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  useToast,
  Flex
} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
 
const DeleteTeamModel = ({
deleteModelIsOpen, deleteModelOnClose, getTeams, selectedId
}) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  console.log(selectedId, "Selected Id")

   const handleDelete = async () => {
      try {
        const response = await API.delete(
          `${API_ENDPOINTS.delete_team}/${selectedId}`
        );
  
        if (response?.status === 200) {
  
          toast({
            title: "Success",
            description: "Team deleted successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          deleteModelOnClose();
          getTeams();

        }
  
      } catch (error) {
  
        toast({
          title: "Error",
          description:
            error?.response?.data?.message ||
            "Delete failed",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
  


  return (
    <Modal
      isOpen={deleteModelIsOpen}
      onClose={deleteModelOnClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent mx="12px" borderRadius="12px">

        <Flex bg="#E53E3E" borderRadius="12px 12px 0px 0px " color="white" py={2} px={4} justify="space-between" alignItems="center"  size="xl">
         <Text fontWeight="bold">
          Delete Team
         </Text>
         <ModalCloseButton position="static" color="white"/>
        </Flex>
       

        <ModalBody mt={4}>
          <Text fontSize={{base:"12px",md:"14px"}}>
            Are you sure you want to{" "}
            <b style={{ color: "red" }}>delete</b> this Team?
            <br />
            This action cannot be undone.
          </Text>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="outline"
            mr={3}
          onClick={deleteModelOnClose}
            fontSize={{base:"12px",md:"14px"}}
          >
            Cancel
          </Button>

          <Button
           bg="#E53E3E"
           fontSize={{base:"12px",md:"14px"}}
            isLoading={loading}
            color="white"
            onClick={handleDelete}
            _hover={{bg:"#dd2c2c"}}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
export default DeleteTeamModel