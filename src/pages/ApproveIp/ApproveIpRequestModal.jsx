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
     const response = await API.post(`${API_ENDPOINTS.approve_ip}/${userId}`);
     if(response.status === 200){


      toast({
        title: "IP approved successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
      refreshData && refreshData();
    }
  }

    catch (error) {
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

      <ModalContent borderRadius="12px" mx="10px">

        {/* ✅ Proper Header */}
        <ModalHeader
          bg="blue.500"
          color="white"
         borderTopRadius="12px" p={7}
         fontSize={{base:"15px",md:"2xl"}}
        >
          Approve User Request
        </ModalHeader>

        <ModalCloseButton color="white"  p={5} size={{base:"md",md:"lg"}}/>

        <ModalBody py={6} >
          <Text fontSize={{base:"12px",md:"20px"}}>Are you sure you want to approve this IP?</Text>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" size={{base:"sm",md:"lg"}} mr={3} onClick={onClose}>
            Cancel
          </Button>

          {/* ✅ Same Color as Header */}
         <Button
         overflow="hidden"
  bg="blue.500"
  size={{base:"sm",md:"lg"}}
  color="white"    
  _hover={{ bg: "blue.600" }}
  onClick={approveIp}
  isLoading={loading}
  loadingText="Approving..."
  
>
  Approve
</Button>
        </ModalFooter>

      </ModalContent>

    </Modal>
  );
};

export default ApproveIpRequestModal;