import React, { useState } from "react";
import { Modal, ModalOverlay, ModalContent, ModalBody, ModalFooter, ModalCloseButton, Button, Text, useToast, Flex} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { Link, } from "react-router-dom";

const DeleteEmployeeTarget = ({ isDeleteModalOpen, onDeleteModalClose, selectedId, getEmployeeTargets}) => {

    const [loading, setLoading] = useState(false);
    const toast = useToast();
    console.log('selectedID', selectedId);

    const handleDeleteEmpTarget  = async()=>{
        try{
              const response = await API?.delete(`${API_ENDPOINTS?.delete_individual_target}/${selectedId}`);

              if(response?.status === 200){
                toast({
                    description: 'Assigned Target is deleted successfully...',
                    duration: 1000,
                    status: 'success',
                    isClosable: true
                })
               
                onDeleteModalClose();
                setTimeout(()=>{
                    getEmployeeTargets()
                }, 1000)
              }
        }catch(error){
            console.log(error, "Error in fetching API response!")
        }
    }

   

    return (
        <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} isCentered >
            <ModalOverlay />
            <ModalContent mx="12px" borderRadius="12px">

                <Flex bg="#E53E3E" borderRadius="12px 12px 0px 0px " color="white" py={2} px={4} justify="space-between" alignItems="center" size="xl">
                    <Text fontWeight="bold"> Delete Individual Target </Text>
                    <ModalCloseButton position="static" color="white" />
                </Flex>


                <ModalBody mt={4}>
                    <Text fontSize={{ base: "12px", md: "14px" }}>
                        Are you sure you want to{" "}
                        <b style={{ color: "red" }}>delete</b> this Employee Target?
                        <br />
                        This action cannot be undone.
                    </Text>
                </ModalBody>

                <ModalFooter>
                    <Button variant="outline" mr={3} onClick={onDeleteModalClose} fontSize={{ base: "12px", md: "14px" }} fontWeight="500"> Cancel </Button>
                    <Button bg="#E53E3E" fontSize={{ base: "12px", md: "14px" }} onClick={handleDeleteEmpTarget} isLoading={loading} color="white" fontWeight="500" _hover={{ bg: "#dd2c2c" }}> Delete </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};


export default DeleteEmployeeTarget
