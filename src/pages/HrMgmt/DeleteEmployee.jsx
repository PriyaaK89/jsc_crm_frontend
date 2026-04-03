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
 
const DeleteEmployeeModel = ({
  selectedId,
  isDeleteModalOpen,
  onDeleteModalClose, fetchEmployeeList
}) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleDeleteEmployee = async () => {
    try {
      setLoading(true);

      const res = await API.delete(
        `${API_ENDPOINTS.delete_users}/${selectedId}`
      );

      if (res?.status === 200) {
        toast({
          title: "Employee Deleted",
          description: "Employee has been deleted successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });


        onDeleteModalClose();
        fetchEmployeeList()
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Unable to delete employee.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.log("Error in deleting employee!", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isDeleteModalOpen}
      onClose={onDeleteModalClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent mx="12px" borderRadius="12px">

        <Flex bg="#E53E3E" borderTopRadius="12px" color="white" py={2} px={4} justify="space-between" alignItems="center"  size="xl">
         <Text fontWeight="bold">
          Delete Employee
         </Text>
         <ModalCloseButton position="static" size="md"/>
        </Flex>
       

        <ModalBody mt={4}>
          <Text fontSize={{base:"12px",md:"14px"}}>
            Are you sure you want to{" "}
            <b style={{ color: "red" }}>delete</b> this employee?
            <br />
            This action cannot be undone.
          </Text>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="outline"
            mr={3}
            onClick={onDeleteModalClose}
            fontSize={{base:"12px",md:"14px"}}
          >
            Cancel
          </Button>
          <Button
           bg="#E53E3E"
           fontSize={{base:"12px",md:"14px"}}
            onClick={handleDeleteEmployee}
            isLoading={loading}
            color="white"
            _hover={{bg:"#dd2c2c"}}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteEmployeeModel;
