import React from 'react'
import {Modal, ModalOverlay, ModalContent, Text, Box, Flex, ModalCloseButton, ModalBody, ModalFooter,Button} from "@chakra-ui/react"

const ViewCompanyModal = ({ isOpen, onClose, companies }) => {
    const company = companies?.[0];
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="12px" overflow="hidden" mx={4}>
                      {/* HEADER */}
                      <Flex
                        bg="blue.500"
                        color="white"
                        px={4}
                        py={3}
                        justifyContent="space-between"
                        align="center"
                      >
                        <Text fontWeight="bold">Preview  Documents</Text>
                        <ModalCloseButton position="static" color="white" />
                      </Flex>
            
        <ModalBody>
                <Box  mb={4} p={3} >

                    <Text mb={3}><b>Company Name : </b>{company?.company_name || "-"}</Text>
                    <Text mb={3}><b> Turnover : </b> {company?.turnover || "-"}</Text>
                </Box>
          
        </ModalBody> 
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ViewCompanyModal