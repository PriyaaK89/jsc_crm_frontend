// ABS (Advance Booking) and Business Plan notifications of the dashboard bell.
// Both modules write to beat_notifications (the table the APK bell reads); this modal lists the
// logged-in user's own rows of one category through the existing endpoint
//   GET   /beat-plan/notifications?category=ABS|BP&page&limit
//   PATCH /beat-plan/notifications/:id/read
//   PATCH /beat-plan/notifications/read-all?category=
// The server returns only the caller's notifications (user_id), so nobody sees another
// user's alerts. Opening a row marks it read and goes to the booking / plan / target sheet; the
// page itself checks the user's access.
import {
  Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, ModalCloseButton,
  VStack, Text, Box, Badge, Spinner, Center, Flex, Button,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";

// per category: header, empty text, label of each type, and where a row opens
export const INBOX_CATEGORIES = {
  ABS: {
    title: "Advance Booking (ABS) Notifications",
    empty: "No advance booking notifications",
    emptyHint: "Booking approvals, payments and dispatch updates appear here.",
    gradient: "linear(to-r, teal.600, teal.500)",
    accent: "teal",
    // ref_id = booking id
    route: (n) => (n.ref_id ? `/advance-booking/bookings/${n.ref_id}` : "/advance-booking/bookings"),
    actionTypes: ["ABS_SUBMITTED"],
  },
  BP: {
    title: "Business Plan Notifications",
    empty: "No business plan notifications",
    emptyHint: "Plan and target sheet approvals, revisions and decisions appear here.",
    gradient: "linear(to-r, green.700, green.500)",
    accent: "green",
    // ref_id = target sheet id (BP_SHEET_*) or business plan id (BP_PLAN_*)
    route: (n) => {
      const type = String(n.type || "");
      if (type.startsWith("BP_SHEET_")) return n.ref_id ? `/business-plan/target-sheets/${n.ref_id}` : "/business-plan/target-sheets";
      return n.ref_id ? `/business-plan/plans/${n.ref_id}` : "/business-plan/plans";
    },
    actionTypes: ["BP_SHEET_SUBMITTED", "BP_PLAN_SUBMITTED", "BP_SHEET_REVISION_REQUESTED"],
  },
};

const PAGE_SIZE = 30;

const typeLabel = (type) =>
  String(type || "")
    .replace(/^(ABS|BP)_/, "")
    .replaceAll("_", " ")
    .toLowerCase();

const ModuleInboxModal = ({ isOpen, onClose, category, onCountChange }) => {
  const cfg = INBOX_CATEGORIES[category] || null;
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(
    async (nextPage = 1) => {
      if (!cfg) return;
      setIsLoading(true);
      try {
        const res = await API.get(API_ENDPOINTS.beat_notifications, {
          params: { category, page: nextPage, limit: PAGE_SIZE, ...(unreadOnly ? { unread: 1 } : {}) },
        });
        const d = res.data?.data || {};
        const rows = Array.isArray(d.items) ? d.items : [];
        setItems((prev) => (nextPage === 1 ? rows : [...prev, ...rows]));
        setTotal(Number(d.total) || 0);
        setPage(nextPage);
      } catch (error) {
        console.log(error);
        if (nextPage === 1) setItems([]);
      } finally {
        setIsLoading(false);
      }
    },
    [category, cfg, unreadOnly],
  );

  useEffect(() => {
    if (isOpen) load(1);
  }, [isOpen, load]);

  const markRead = async (item) => {
    if (item.is_read) return;
    setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: 1 } : n)));
    try {
      await API.patch(API_ENDPOINTS.beat_notification_read(item.id));
    } catch (err) {
      console.log(err);
    }
    onCountChange?.();
  };

  const open = async (item) => {
    await markRead(item);
    onClose();
    navigate(cfg.route(item));
  };

  const markAllRead = async () => {
    try {
      // only this category: the other bell categories keep their unread state
      await API.patch(API_ENDPOINTS.beat_notifications_read_all, null, { params: { category } });
      setItems((prev) => (unreadOnly ? [] : prev.map((n) => ({ ...n, is_read: 1 }))));
      onCountChange?.();
    } catch (err) {
      console.log(err);
    }
  };

  if (!cfg) return null;
  const hasUnread = items.some((n) => !n.is_read);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside" isCentered>
      <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="16px" overflow="hidden" boxShadow="2xl" maxH="80vh">
        <ModalHeader
          bgGradient={cfg.gradient}
          color="white" py={4} px={6}
          fontSize="lg" fontWeight="500" letterSpacing="0.3px" lineHeight="12px !important">
          <Flex justify="space-between" align="center" pr={8}>
            <Text>{cfg.title}</Text>
            {hasUnread && (
              <Text fontSize="12px" fontWeight="400" cursor="pointer" _hover={{ textDecoration: "underline" }} onClick={markAllRead}>
                Mark all as read
              </Text>
            )}
          </Flex>
        </ModalHeader>

        <ModalCloseButton color="white" top="8px" right="8px" bg="whiteAlpha.200"
          fontSize="14px" _hover={{ bg: "whiteAlpha.300" }} transition="all 0.2s ease" />

        <ModalBody bg="gray.50" py={4} px={4}>
          <Flex gap={2} mb={3}>
            <Button size="xs" variant={unreadOnly ? "solid" : "outline"} colorScheme={cfg.accent} onClick={() => setUnreadOnly(true)}>
              Unread
            </Button>
            <Button size="xs" variant={!unreadOnly ? "solid" : "outline"} colorScheme={cfg.accent} onClick={() => setUnreadOnly(false)}>
              All
            </Button>
          </Flex>

          {isLoading && items.length === 0 ? (
            <Center py={12}>
              <Spinner size="lg" color={`${cfg.accent}.500`} thickness="3px" />
            </Center>
          ) : items.length === 0 ? (
            <Center py={14}>
              <Box textAlign="center">
                <Text fontWeight="600" color="gray.700">{cfg.empty}</Text>
                <Text fontSize="sm" color="gray.500" mt={1}>{cfg.emptyHint}</Text>
              </Box>
            </Center>
          ) : (
            <VStack spacing={4} align="stretch">
              {items.map((item) => {
                const isUnread = !item.is_read;
                const needsAction = cfg.actionTypes.includes(item.type);
                return (
                  <Box key={item.id} bg="white"
                    borderRadius="12px" borderWidth="1px"
                    borderColor={isUnread ? `${cfg.accent}.200` : "gray.200"}
                    overflow="hidden" boxShadow={isUnread ? "md" : "sm"}
                    transition="all .25s ease" cursor="pointer"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                    onClick={() => open(item)}>
                    <Box h="4px" bg={needsAction ? "orange.400" : `${cfg.accent}.400`} />
                    <Box p={4}>
                      <Flex justify="space-between" align="center" mb={1} gap={2}>
                        <Flex align="center" gap={2}>
                          {isUnread && <Box w="10px" h="10px" borderRadius="full" bg={`${cfg.accent}.500`} flexShrink={0} />}
                          <Text fontSize="12px" fontWeight="700" color="gray.800">{item.title}</Text>
                        </Flex>
                        <Flex gap={2} flexShrink={0}>
                          {isUnread && (
                            <Badge colorScheme={cfg.accent} variant="subtle" px={3} py={0.5} borderRadius="full" fontSize="11px">NEW</Badge>
                          )}
                          <Badge colorScheme={needsAction ? "orange" : "gray"} px={3} py={0.5} borderRadius="full" fontSize="11px" textTransform="capitalize">
                            {typeLabel(item.type)}
                          </Badge>
                        </Flex>
                      </Flex>
                      {item.message && (
                        <Text fontSize="12px" color="gray.700" lineHeight="1.8">{item.message}</Text>
                      )}
                      <Flex justify="space-between" align="center" mt={2} pt={1} borderTop="1px solid" borderColor="gray.100">
                        <Text fontSize="xs" color={needsAction ? "orange.600" : `${cfg.accent}.600`} fontWeight="700">
                          {needsAction ? "Open to review & decide" : "Open"}
                        </Text>
                        <Flex align="center" gap={3}>
                          {isUnread && (
                            <Text
                              fontSize="xs" color="gray.500" cursor="pointer" _hover={{ textDecoration: "underline" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                markRead(item);
                              }}>
                              Mark read
                            </Text>
                          )}
                          {item.created_at && (
                            <Text fontSize="xs" color="gray.500" fontWeight="500">
                              {new Date(item.created_at).toLocaleDateString()}
                              {" • "}
                              {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </Text>
                          )}
                        </Flex>
                      </Flex>
                    </Box>
                  </Box>
                );
              })}
              {items.length < total && (
                <Button size="sm" variant="outline" onClick={() => load(page + 1)} isLoading={isLoading}>
                  Load more ({total - items.length} more)
                </Button>
              )}
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModuleInboxModal;
