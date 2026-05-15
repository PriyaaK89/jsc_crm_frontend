import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  Box
} from "@chakra-ui/react";
import React from "react";

const NotificationModel = ({ isOpen, onClose, notifications }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />

        <ModalBody>
          <Box p={4}>
            <Text fontSize="lg" fontWeight="bold" mb={3}>
              Notifications
            </Text>

            {notifications.length === 0 ? (
              <Text>No notifications</Text>
            ) : (
              notifications.map((n) => (
                <Box
                  key={n.id}
                  p={2}
                  mb={2}
                  borderBottom="1px solid #eee"
                  bg={n.read ? "white" : "gray.100"}
                  borderRadius="6px"
                >
                  <Text fontWeight="medium">{n.message}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(n.time).toLocaleString()}
                  </Text>
                </Box>
              ))
            )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default NotificationModel;