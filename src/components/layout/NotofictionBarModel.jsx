import {
  Box,
  Text,
  Flex,
  Avatar,
  Button,
  HStack,
  Spinner
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import NotifictionSocket from "./NotifictionSocket";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const NotofictionBarModel = () => {
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [tab, setTab] = useState("unread");

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeId, setActiveId] = useState(null);

  // 🔥 SOCKET (Unread)
  useEffect(() => {
    NotifictionSocket.on("locationStatusChanged", (data) => {
      const newNotification = {
        id: Date.now(),
        name: data.employee_name,
        message: data.message,
        profile_image_url: data.profile_image,
        created_at: data.time,
        is_read: 0
      };

      setNotifications((prev) => [newNotification, ...prev]);
    });

    return () => {
      NotifictionSocket.off("locationStatusChanged");
    };
  }, []);

  // 🌐 API (All)
  const fetchAllNotifications = async (pageNo = 1) => {
    try {
      setLoading(true);

      const res = await API.get(API_ENDPOINTS.Get_notification, {
        params: { page: pageNo, limit: 10 }
      });

      if (res.status === 200) {
        setAllNotifications(res?.data?.data || []);
        setPage(res?.data?.pagination?.page || 1);
        setTotalPages(res?.data?.pagination?.total_pages || 1);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const list = tab === "unread" ? notifications : allNotifications;

  const handleToggle = (id) => {
  setActiveId((prev) => (prev === id ? null : id));
};

  return (
    <>
      {/* HEADER */}
      <Box p={4} borderBottom="1px solid #eee">
        <Flex justify="space-between" align="center">
          <Text fontWeight="bold">Notifications</Text>

          <HStack bg="gray.100" p="3px" borderRadius="full">
            <Button
              size="xs"
              borderRadius="full"
              bg={tab === "all" ? "white" : "transparent"}
              onClick={() => {
                setTab("all");
                fetchAllNotifications(1);
              }}
            >
              All
            </Button>

            <Button
              size="xs"
              borderRadius="full"
              bg={tab === "unread" ? "white" : "transparent"}
              onClick={() => setTab("unread")}
            >
              Unread
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* ✅ PAGINATION (ONLY FOR ALL TAB) */}
      {tab === "all" && (
        <Flex
          justify="space-between"
          align="center"
          px={4}
          py={2}
          borderBottom="1px solid #eee"
        >
          <Button
            size="xs"
            isDisabled={page === 1}
            onClick={() => fetchAllNotifications(page - 1)}
          >
            Prev
          </Button>

          <Text fontSize="xs">
            Page {page} of {totalPages}
          </Text>

          <Button
            size="xs"
            isDisabled={page === totalPages}
            onClick={() => fetchAllNotifications(page + 1)}
          >
            Next
          </Button>
        </Flex>
      )}

      {/* BODY */}
      <Box maxH="400px" overflowY="auto">
        {loading ? (
          <Flex justify="center" p={4}>
            <Spinner />
          </Flex>
        ) : list.length === 0 ? (
          <Text p={4} textAlign="center">
            No Notifications
          </Text>
        ) : (
        list.map((n, i) => (
  <Box
    key={i}
    borderBottom="1px solid #f1f1f1"
    _hover={{ bg: "gray.50" }}
    cursor="pointer"
    onClick={() => handleToggle(n.id)}
  >
    {/* TOP ROW */}
    <Flex p={3} gap={3}>
      <Avatar size="sm" src={n.profile_image_url} />

      <Box flex="1">
        <Text fontSize="sm">
          <b>{n.name}</b> {n.message}
        </Text>

        <Text fontSize="xs" color="gray.500">
          {new Date(n.created_at).toLocaleString()}
        </Text>
      </Box>

      {n.is_read === 0 && (
        <Box
          w="8px"
          h="8px"
          bg="green.400"
          borderRadius="full"
          mt={2}
        />
      )}
    </Flex>

    {/* 🔽 EXPAND BOX */}
    {activeId === n.id && (
      <Box
        px={4}
        pb={3}
        bg="gray.50"
        borderTop="1px solid #eee"
      >
        <Text fontSize="sm" color="gray.700">
          {n.message}
        </Text>

        {/* optional extra details */}
        <Text fontSize="xs" color="gray.400" mt={1}>
          Full details shown here...
        </Text>
      </Box>
    )}
  </Box>
))
        )}
      </Box>
    </>
  );
};

export default NotofictionBarModel;