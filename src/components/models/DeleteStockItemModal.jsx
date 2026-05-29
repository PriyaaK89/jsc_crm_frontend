import React, { useState } from "react";
import { Modal, ModalOverlay, ModalContent, ModalBody, ModalFooter, ModalCloseButton, Button, Text, useToast, Flex} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
 
const DeleteStockItemModal = ({isDeleteModalOpen, onClose, selectedId, getStockItemList }) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  console.log(selectedId, "Selected Id")

    const deleteStockItem = async () => {
        try {
            const response = await API.delete( `${API_ENDPOINTS.deleteStockItem}/${selectedId}` );
            if (response?.status === 200) {
                toast({
                    title: "Success",
                    description: "Stock item deleted successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                onClose();
                getStockItemList();
            }
        } catch (error) {
            console.log(error);
            toast({
                title: "Error",
                description: "Failed to delete stock item",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };


  return (
    <Modal
      isOpen={isDeleteModalOpen}
      onClose={onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent mx="12px" borderRadius="12px">

        <Flex bg="#E53E3E" borderRadius="12px 12px 0px 0px " color="white" py={2} px={4} justify="space-between" alignItems="center"  size="xl">
         <Text fontWeight="bold">
          Delete Item
         </Text>
         <ModalCloseButton position="static" color="white"/>
        </Flex>
       

        <ModalBody mt={4}>
          <Text fontSize={{base:"12px",md:"14px"}}>
            Are you sure you want to{" "}
            <b style={{ color: "red" }}>delete</b> this Item?
            <br />
            This action cannot be undone.
          </Text>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="outline"
            mr={3}
          onClick={onClose}
            fontSize={{base:"12px",md:"14px"}} fontWeight="500"
          >
            Cancel
          </Button>

          <Button
           bg="#E53E3E"
           fontSize={{base:"12px",md:"14px"}}
            isLoading={loading}
            color="white" fontWeight="500"
            onClick={deleteStockItem}
            _hover={{bg:"#dd2c2c"}}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
export default DeleteStockItemModal