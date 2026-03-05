import React from "react";
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

const ApproveIpRequestModal = ({ isOpen, onClose, userId, refreshData }) => {
  const toast = useToast();
  const [loading, setLoading] = React.useState(false);

  const approveIp = async () => {
    setLoading(true);
    try {
      await API.post(`${API_ENDPOINTS.approve_ip}/${userId}`);

      toast({
        title: "IP approved successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
      refreshData && refreshData();
    } catch (error) {
      toast({
        title: "Failed to approve IP.",
        description: error.message || "Something went wrong.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="12px">

        {/* ✅ Proper Header */}
        <ModalHeader
          bg="blue.500"
          color="white"
          borderTopRadius="12px"
        >
          Approve User Request
        </ModalHeader>

        <ModalCloseButton color="white" />

        <ModalBody py={6}>
          <Text>Are you sure you want to approve this IP?</Text>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>

          {/* ✅ Same Color as Header */}
          <Button
            bg="blue.500"
            color="white"
            _hover={{ bg: "blue.600" }}
            onClick={approveIp}
            isLoading={loading}
          >
            Approve
          </Button>
        </ModalFooter>

      </ModalContent>
    </Modal>
  );
};

export default ApproveIpRequestModal;