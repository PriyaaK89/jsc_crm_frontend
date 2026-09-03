import { Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, ModalCloseButton, 
  VStack, HStack, Text, Box, Badge, Spinner, Center, Flex, Image, } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import { extractAfterKeyword, buildSalesOrderNumber, formatDate, getStatusColor, } from "../../common/notificationHelper";
import { Link } from "react-router-dom";

const ReceiptNotificationModal = ({ isOpen, onClose, onViewOrder }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Lightbox state — holds the currently previewed image URL, or null when closed
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (isOpen) { fetchNotifications(); }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await API.get(`${API_ENDPOINTS.GET_ORDER_NOTIFICATIONS}?module_type=RECEIPT&notification_category=APPROVAL`,);
      setNotifications(res.data?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrder = (item) => { if (onViewOrder) onViewOrder(item); };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside" isCentered>

        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="16px" overflow="hidden" boxShadow="2xl" maxH="80vh">
          {/* Header */}
          <ModalHeader bgGradient="linear(to-r, blue.600, blue.500)"
            color="white" py={4} px={6} borderBottom="1px solid" borderColor="blue.700" fontSize="lg"
            fontWeight="500" letterSpacing="0.3px" lineHeight="12px !important">
            Receipt Notifications
          </ModalHeader>

          {/* Close Button */}
          <ModalCloseButton color="white" top="8px" right="8px" bg="whiteAlpha.200"
            fontSize="14px" _hover={{ bg: "whiteAlpha.300", }} transition="all 0.2s ease" />

          <ModalBody bg="gray.50" py={4} px={4}>
            {isLoading ? (
              <Center py={12}>
                <Spinner size="lg" color="green.500" thickness="3px" />
              </Center>
            ) : notifications.length === 0 ? (
              <Center py={14}>
                <Box textAlign="center">
                  <Text fontWeight="600" color="gray.700"> No receipt notifications </Text>
                  <Text fontSize="sm" color="gray.500" mt={1}> New approval requests will appear here. </Text>
                </Box>
              </Center>
            ) : (
              <VStack spacing={4} align="stretch">
                {notifications.map((item) => {
                  const employeeName = item?.generated_by_name;
                  const receiptNumber = buildSalesOrderNumber( item.generated_by_id, item.order_no, );
                  const statusColor = getStatusColor(item.status);
                  const isUnread = !item.is_read;
                  const attachmentUrl = item.attachment_url || null;

                  return (
                    <Box
                      key={item.id}
                      bg="white"
                      borderRadius="12px"
                      borderWidth="1px"
                      borderColor={isUnread ? "green.200" : "gray.200"}
                      overflow="hidden"
                      boxShadow={isUnread ? "md" : "sm"}
                      transition="all .25s ease"
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "lg",
                      }}>
                      {/* Top Status Bar */}
                      <Box h="4px" bg={`${statusColor}.400`} />

                      <Box p={4}>
                        <Flex justify="space-between" align="center" mb={1}>
                          <Flex align="center" gap={2}>
                            {isUnread && (
                              <Box
                                w="10px"
                                h="10px"
                                borderRadius="full"
                                bg="green.500"
                              />
                            )}

                            <Text
                              fontSize="11px"
                              fontWeight="700"
                              color="gray.800">
                              {item.title}
                            </Text>
                          </Flex>
                          <Flex gap={2}>
                            {isUnread && (
                              <Badge
                                colorScheme="green"
                                variant="subtle"
                                px={3}
                                py={0.5}
                                borderRadius="full"
                                fontSize="11px"
                                textTransform="capitalize">
                                NEW
                              </Badge>
                            )}
                            <Badge
                              colorScheme={statusColor}
                              px={3}
                              py={0.5}
                              borderRadius="full"
                              fontSize="11px"
                              textTransform="capitalize">
                              {item.status}
                            </Badge>
                          </Flex>
                        </Flex>

                        <Text fontSize="12px" color="gray.700" lineHeight="1.8">
                          {item?.message} {" "}
                          Click{" "}
                          <Text
                            as="span"
                            color="green.600"
                            fontWeight="700"
                            cursor="pointer"
                            _hover={{
                              color: "green.700",
                              textDecoration: "underline",
                            }}>
                            <Link to={`/order-voucher/receipt/${item.approval_id}`}>
                              {receiptNumber}
                            </Link>
                          </Text>{" "}
                          ({formatDate(item.created_at)}) to review the receipt
                          voucher.
                        </Text>

                        {/* Attachment thumbnail — only rendered when an attachment exists */}
                        {attachmentUrl && (
                          <Box
                            mt={2}
                            position="relative"
                            display="inline-block"
                            cursor="pointer"
                            role="group"
                            onClick={() => setPreviewImage(attachmentUrl)}>
                            <Image
                              src={attachmentUrl}
                              alt="Attachment"
                              boxSize="72px"
                              objectFit="cover"
                              borderRadius="8px"
                              borderWidth="1px"
                              borderColor="gray.200"
                              fallback={
                                <Center
                                  boxSize="72px"
                                  bg="gray.100"
                                  borderRadius="8px"
                                  borderWidth="1px"
                                  borderColor="gray.200">
                                  <Spinner size="sm" color="gray.400" />
                                </Center>
                              }
                            />
                            <Center
                              position="absolute"
                              top={0}
                              left={0}
                              boxSize="72px"
                              bg="blackAlpha.500"
                              borderRadius="8px"
                              opacity={0}
                              transition="opacity .15s ease"
                              _groupHover={{ opacity: 1 }}>
                              <Text fontSize="10px" color="white" fontWeight="600">
                                View
                              </Text>
                            </Center>
                          </Box>
                        )}

                        {/* Footer */}
                        <Flex
                          justify="space-between"
                          align="center"
                          mt={2}
                          pt={1}
                          borderTop="1px solid"
                          borderColor="gray.100">
                          <Text
                            fontSize="xs"
                            color="gray.500"
                            ml="auto"
                            fontWeight="500">
                            {new Date(item.created_at).toLocaleDateString()}
                            {" • "}
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

      {/* Full-size image lightbox */}
      <Modal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        isCentered
        size="4xl">
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="transparent" boxShadow="none" onClick={() => setPreviewImage(null)}>
          <ModalCloseButton color="white" bg="whiteAlpha.300" top="12px" right="12px" />
          <Center>
            <Image
              src={previewImage}
              alt="Attachment preview"
              maxH="85vh"
              maxW="100%"
              objectFit="contain"
              borderRadius="8px"
              onClick={(e) => e.stopPropagation()}
            />
          </Center>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ReceiptNotificationModal;