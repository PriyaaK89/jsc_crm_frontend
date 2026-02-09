import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const UpdateEmpStatus = ({ userId, currentStatus, onSuccess }) => {
  const [empStatus, setEmpStatus] = useState(currentStatus || "activate");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // When dropdown value changes
  const handleChange = (e) => {
    const value = e.target.value;

    if (value === empStatus) return; // avoid unnecessary modal

    setSelectedStatus(value);
    onOpen();
  };

  // Confirm button click
  const handleConfirm = async () => {
    try {
      setLoading(true);

      const response = await API.patch(
        `${API_ENDPOINTS.update_emp_status}/${selectedStatus}`,
        { userId }
      );

      if (response?.status === 200) {
        setEmpStatus(selectedStatus);
        onSuccess?.(selectedStatus);

        toast({
          title: "Status Updated",
          description: `Employee has been ${selectedStatus === "activate" ? "activated" : "deactivated"} successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update employee status.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.log("Error in updating status", error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <>
      {/* Dropdown */}
      <select
        value={empStatus}
        onChange={handleChange}
        style={{
          padding: "6px",
          borderRadius: "4px",
          cursor: "pointer", border: '1px solid lightgrey'
        }}
      >
        <option value="activate">Activate</option>
        <option value="deactivate">Deactivate</option>
      </select>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Action</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            Are you sure you want to{" "}
            <b>{selectedStatus === "activate" ? "activate" : "deactivate"}</b>{" "}
            this employee?
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose} mr={3} variant="outline">
              Cancel
            </Button>
            <Button
              colorScheme={selectedStatus === "activate" ? "green" : "red"}
              onClick={handleConfirm}
              isLoading={loading}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateEmpStatus;
