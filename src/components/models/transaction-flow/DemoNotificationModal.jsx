import {
  Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, ModalCloseButton,
  VStack, Text, Box, Badge, Spinner, Center, Flex,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import { getStatusColor } from "../../common/notificationHelper";
import { Link, useNavigate } from "react-router-dom";

// This modal lists only new requests waiting for approval
const NOTIFICATION_PARAMS = { types: "DEMO_SUBMITTED", pending_only: 1, limit: 100 };

const DemoNotificationModal = ({ isOpen, onClose, onCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await API.get(API_ENDPOINTS?.get_demo_request_notification, {
        params: NOTIFICATION_PARAMS,
      });
      setNotifications(res.data?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDemo = (item) => {
    if (!item.is_read) {
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: 1 } : n)));
      API.put(API_ENDPOINTS?.mark_demo_notification_read(item.id))
        .then(() => onCountChange?.())
        .catch((err) => console.log(err));
    }
    onClose();
    //  navigate(`/product-demo/view-demo-request/${item.demo_id}`);
  };

  const handleMarkAllRead = async () => {
    try {
      // only the notifications shown here, so result alerts are not marked read silently
      await API.put(API_ENDPOINTS?.mark_all_demo_notifications_read, null, {
        params: { types: "DEMO_SUBMITTED" },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      onCountChange?.();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside" isCentered>
      <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="16px" overflow="hidden" boxShadow="2xl" maxH="80vh">
        <ModalHeader
          bgGradient="linear(to-r, blue.600, blue.500)"
          color="white" py={4} px={6} borderBottom="1px solid" borderColor="blue.700"
          fontSize="lg" fontWeight="500" letterSpacing="0.3px" lineHeight="12px !important">
          <Flex justify="space-between" align="center">
            <Text>Demo Requests Awaiting Approval</Text>
            {notifications.some((n) => !n.is_read) && (
              <Text
                fontSize="12px" fontWeight="400" cursor="pointer"
                _hover={{ textDecoration: "underline" }}
                onClick={handleMarkAllRead}>
                Mark all as read
              </Text>
            )}
          </Flex>
        </ModalHeader>

        <ModalCloseButton color="white" top="8px" right="8px" bg="whiteAlpha.200"
          fontSize="14px" _hover={{ bg: "whiteAlpha.300" }} transition="all 0.2s ease" />

        <ModalBody bg="gray.50" py={4} px={4}>
          {isLoading ? (
            <Center py={12}>
              <Spinner size="lg" color="green.500" thickness="3px" />
            </Center>
          ) : notifications.length === 0 ? (
            <Center py={14}>
              <Box textAlign="center">
                <Text fontWeight="600" color="gray.700">No pending demo requests</Text>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  New demo requests waiting for approval will appear here.
                </Text>
              </Box>
            </Center>
          ) : (
            <VStack spacing={4} align="stretch">
              {notifications.map((item) => {
                const statusColor = getStatusColor(item.demo_status);
                const isUnread = !item.is_read;

                return (
                  <Box key={item.id} bg="white"
                    borderRadius="12px" borderWidth="1px"
                    borderColor={isUnread ? "green.200" : "gray.200"}
                    overflow="hidden" boxShadow={isUnread ? "md" : "sm"}
                    transition="all .25s ease" cursor="pointer"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                    onClick={() => handleOpenDemo(item)}>
                    <Box h="4px" bg={`${statusColor}.400`} />

                    <Box p={4}>
                      <Flex justify="space-between" align="center" mb={1}>
                        <Flex align="center" gap={2}>
                          {isUnread && <Box w="10px" h="10px" borderRadius="full" bg="green.500" />}
                          <Text fontSize="11px" fontWeight="700" color="gray.800">
                            {item.title}
                          </Text>
                        </Flex>
                        <Flex gap={2}>
                          {isUnread && (
                            <Badge colorScheme="green" variant="subtle" px={3} py={0.5} borderRadius="full" fontSize="11px">
                              NEW
                            </Badge>
                          )}
                          {item.demo_status && (
                            <Badge colorScheme={statusColor} px={3} py={0.5}
                              borderRadius="full" fontSize="11px" textTransform="capitalize">
                              {item.demo_status.replaceAll("_", " ").toLowerCase()}
                            </Badge>
                          )}
                        </Flex>
                      </Flex>

                      <Text fontSize="12px" color="gray.700" lineHeight="1.8">
                        {item.message}{" "}
                        <Text as="span" color="green.600" fontWeight="700">
                          <Link
                            to={`/product-demo/view-demo-request/${item?.demo_id}`}
                            onClick={(e) => e.stopPropagation()}
                          > {item?.demo_no}</Link>
                        </Text>
                      </Text>

                      {item.created_by_name && (
                        <Text fontSize="12px" color="gray.600" mt={1}>
                          Submitted by{" "}
                          <Text as="span" fontWeight="700" color="gray.800">{item.created_by_name}</Text>
                        </Text>
                      )}

                      <Flex justify="flex-end" align="center" mt={2} pt={1}
                        borderTop="1px solid" borderColor="gray.100">
                        <Text fontSize="xs" color="gray.500" ml="auto" fontWeight="500">
                          {new Date(item.created_at).toLocaleDateString()}
                          {" • "}
                          {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </Text>
                      </Flex>
                    </Box>
                  </Box>
                );
              })}
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DemoNotificationModal;