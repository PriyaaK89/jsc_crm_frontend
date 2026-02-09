import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  useToast,
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
      <ModalContent>
        <ModalHeader>Delete Employee</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Text>
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
          >
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={handleDeleteEmployee}
            isLoading={loading}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteEmployeeModel;
