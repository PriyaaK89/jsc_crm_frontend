import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Spinner,
  Center,
  Flex,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import {
  buildSalesOrderNumber,
  formatDate,
  getStatusColor,
} from "../../common/notificationHelper";
import { Link } from "react-router-dom";

const AlertTabModal = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);

    try {
      const res = await API.get(
        `${API_ENDPOINTS?.GET_ORDER_NOTIFICATIONS}?notification_category=STATUS`,
      );

      const raw = res.data?.data || [];
      // Deduplicate: keep one entry per unique approval_id + message combo
      const seen = new Set();
      const deduped = raw.filter((item) => {
        const key = `${item.approval_id}__${item.message}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setNotifications(deduped);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      scrollBehavior="inside"
      isCentered>
      <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(4px)" />

      <ModalContent
        borderRadius="16px"
        overflow="hidden"
        boxShadow="2xl"
        maxH="80vh">
        {/* Header */}
        <ModalHeader
          bgGradient="linear(to-r, blue.600, blue.500)"
          color="white"
          py={4}
          px={6}
          borderBottom="1px solid"
          borderColor="blue.700"
          fontSize="lg"
          fontWeight="500"
          letterSpacing="0.3px"
          lineHeight="12px !important">
          Alerts
        </ModalHeader>

        {/* Enhanced Close Button */}
        <ModalCloseButton
          color="white"
          top="8px"
          right="8px"
          bg="whiteAlpha.200"
          fontSize="14px"
          _hover={{
            bg: "whiteAlpha.300",
          }}
          transition="all 0.2s ease"
        />

        <ModalBody bg="gray.50" py={4} px={4}>
          {isLoading ? (
            <Center py={12}>
              <Spinner
                size="lg"
                color="blue.500"
                thickness="3px"
                speed="0.7s"
              />
            </Center>
          ) : notifications.length === 0 ? (
            <Center py={14}>
              <Box textAlign="center">
                <Text fontSize="md" color="gray.600" fontWeight="medium">
                  You're all caught up 🎉
                </Text>

                <Text fontSize="sm" color="gray.500" mt={1}>
                  No alerts available right now.
                </Text>
              </Box>
            </Center>
          ) : (
            <VStack spacing={4} align="stretch">
              {notifications.map((item) => {
                const soNumber = buildSalesOrderNumber(
                  item.user_id,
                  item.approval_id,
                );

                const statusColor = getStatusColor(item.status);

                const isUnread = !item.is_read;

                return (
                  <Box
                    key={item.id}
                    bg="white"
                    borderRadius="12px"
                    borderWidth="1px"
                    borderColor={isUnread ? "blue.200" : "gray.200"}
                    overflow="hidden"
                    boxShadow={isUnread ? "md" : "sm"}
                    transition="all 0.25s ease"
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                    }}>
                    {/* Top Accent Bar */}
                    <Box h="4px" bg={`${statusColor}.400`} />

                    <Box p={4}>
                      <Flex justify="space-between" align="baseline" mb={1}>
                        <Flex align="center" gap={2}>
                          {isUnread && (
                            <Box
                              w="10px"
                              h="10px"
                              borderRadius="full"
                              bg="blue.500"
                            />
                          )}

                          <Text fontSize="sm" fontWeight="600" color="gray.800">
                            {item.title}
                          </Text>
                        </Flex>

                        <Badge
                          colorScheme={statusColor}
                          px={3}
                          py={0.5}
                          borderRadius="full"
                          textTransform="capitalize"
                          fontSize="11px"
                          fontWeight="700">
                          {item.status}
                        </Badge>
                      </Flex>

                      <Text fontSize="12px" color="gray.700" lineHeight="1.7">
                        <Text as="span" fontWeight="700" color="gray.900">
                          {soNumber}
                        </Text>{" "}
                        — {item.message}{" "}
                        <Text
                          as="span"
                          color="blue.600"
                          fontWeight="700"
                          cursor="pointer"
                          _hover={{
                            color: "blue.700",
                            textDecoration: "underline",
                          }}>
                          <Link to={`/order-voucher/sales/${item.approval_id}`}>
                            Click here
                          </Link>
                        </Text>{" "}
                        to view details.
                      </Text>

                      <Flex
                        justify="flex-end"
                        mt={2}
                        pt={1}
                        borderTop="1px solid"
                        borderColor="gray.100">
                        <Text fontSize="xs" color="gray.500" fontWeight="500">
                          {formatDate(item.created_at)} •{" "}
                          {new Date(item.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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

export default AlertTabModal;