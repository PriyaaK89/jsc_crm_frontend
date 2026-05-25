import { Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import React from "react";

const EmpExpenseModal = ({isOpen, onClose, selectedBill, billTitle}) => {
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader> {billTitle} </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={5}>

                        <Image
                            src={selectedBill}
                            alt="Bill Image"
                            w="100%"
                            borderRadius="md"
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
}

export default EmpExpenseModal