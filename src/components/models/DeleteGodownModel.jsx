import React, { useState } from "react";
import { Modal, ModalOverlay, ModalContent, ModalBody, ModalFooter, ModalCloseButton, Button, Text, useToast, Flex} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
 
const DeleteGodownModel = ({
deleteModelIsOpen, deleteModelOnClose,selectedId, fetchGodownList
}) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  console.log(selectedId, "Selected Id")

  const handleDelete = async () => {
  try {
    await API.delete(
      `${API_ENDPOINTS.delete_godown}/${selectedId}`
    );

    toast({
      title: "Success",
      description: "Godown deleted successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    fetchGodownList();
    deleteModelOnClose()

  } catch (error) {

    console.log(error);

    toast({
      title: "Error",
      description: "Failed to delete godown",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};

  return (
    <Modal
    isOpen={deleteModelIsOpen} onClose={deleteModelOnClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent mx="12px" borderRadius="12px">

        <Flex bg="#c23333" borderRadius="12px 12px 0px 0px " color="white" py={2} px={4} justify="space-between" alignItems="center"  size="xl">
         <Text fontWeight="500">
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
          onClick={deleteModelOnClose} fontWeight="500"
            fontSize={{base:"12px",md:"14px"}}
          >
            Cancel
          </Button>

          <Button
           bg="#c23333"
           fontSize={{base:"12px",md:"14px"}}
            isLoading={loading}
            color="white" fontWeight="500"
          onClick={handleDelete}
            _hover={{bg:"#b33535"}}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
export default DeleteGodownModel