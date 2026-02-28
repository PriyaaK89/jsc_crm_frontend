import React from "react";
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
  Flex,
  
} from "@chakra-ui/react";

import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const ApproveIpRequestModal = ({ isOpen, onClose, userId, refreshData }) => {
  const toast = useToast();
  const [loading, setLoading] = React.useState(false);

  const approveIp = async () => {
    setLoading(true);
    try {
      //  Approve the IP
      await API.post(`${API_ENDPOINTS.approve_ip}/${userId}`);

      //  Fetch the updated IP requests
      const response = await API.get(API_ENDPOINTS.get_ip_requests);
      console.log("Updated IP Requests:", response.data);

      
      toast({
        title: "IP approved successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose(); // close modal
    } catch (error) {
      console.log(error);
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <Flex justify="space-between" align="center" bg="blue" color="white">
          <Text>Approve User Request</Text>
             <ModalCloseButton />

        </Flex>
        <ModalBody>
          <Text>Are you sure you want to approve this IP?</Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={approveIp} isLoading={loading}>
            Approve
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ApproveIpRequestModal;
