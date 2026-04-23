import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, 
    ModalOverlay, useToast, Flex, Button,Text } from '@chakra-ui/react'
import React, { useState } from 'react';
import API from '../../services/api';

import { API_ENDPOINTS } from '../../services/endpoints';

const DeleteDistributorModal = ({
     selectedId,
     isOpen,
     onClose,
     fetchDistributors
}) => {
    const [loading, setLoading] = useState(false);
    const toast = useToast();

  const handleDeleteDistributor =  async() => {
     try{
        setLoading(true);
      
        const res = await  API.delete(`${API_ENDPOINTS?.delete_distributor}/${selectedId}`);
        if(res?.status === 200){
         toast({
          title: "Delete Distributor",
          description: "distributor has been deleted successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
         onClose();
         fetchDistributors();
        }
       
     }
      catch (error) {
        console.log(error, "error")
         toast({
        title: "Delete Failed",
        description: "Unable to delete distibutor.",
        status: "error",
        duration: 3000,
        isClosable: true,
      }); 
      console.log("Error in delete distributor !", error)   
        } 
        finally{
            setLoading(false);
        }
  }
  return (
    <Modal
     isOpen={isOpen}
     onClose={onClose}
     isCentered
    >
        <ModalOverlay/>
        <ModalContent mx="12px" borderRadius="12px">
            <Flex
             justify="space-between"
             alignItems="center"
             bg="#E53E2E" borderRadius="12px 12px 0px 0px" color="white" px={4} py={2}
            >
                <Text fontWeight ="bold">
                    Delete Distributor
                </Text>
                <ModalCloseButton position="static" color="white"/>
            </Flex>
            <ModalBody mt={4}>
                        <Text fontSize={{base:"12px",md:"14px"}}>
                
               Are you sure you want to{" "}
                          <b style={{ color: "red" }}>delete</b> this distributor?
                          <br />
                          This action cannot be undone.
                        </Text>
            </ModalBody>
            <ModalFooter>
                <Button
                 variant="outline"
                 mr={3}
                 onClick={onClose}
                 fontSize={{base:"12px", md:"14px"}}
                >Cancel</Button>
           <Button
            bg="#E53E3E"
            fontSize={{base:"12px",md:"14px"}}
            onClick={handleDeleteDistributor}
            isLoading={loading}
            color="white"
            _hover={{bg:"#dd2c2c"}}   
            
           >
            Delete 
           </Button>
            </ModalFooter>
        </ModalContent>

    </Modal>
  )
}

export default DeleteDistributorModal