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
import { Skeleton, SkeletonCircle } from "@chakra-ui/react";
import NotifictionSocket from "./NotifictionSocket";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const NotofictionBarModel = ({ setUnreadCount }) => {

  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [tab, setTab] = useState("unread");

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // const [activeId, setActiveId] = useState(null);

  //  SOCKET (Unread)
  useEffect(() => {
    NotifictionSocket.on("locationStatusChanged", (data) => {
      const newNotification = {
        id: data.id || Date.now(),
        name: data.name,
        message: data.message,
        profile_image_url: data.profile_image_url || "",
        created_at: data.time,
        is_read: 0
      };
      console.log("MARK ID =>", data.id);
      console.log(data, "data")

      setNotifications((prev) => [newNotification, ...prev]);
    });

    return () => {
      NotifictionSocket.off("locationStatusChanged");
    };
  }, []);
  //  ----------------this for first user seen count on bell ico
  useEffect(() => {
    const count = [...notifications, ...allNotifications].filter(
      (n) => n.is_read === 0
    ).length;

    setUnreadCount(count);
  }, [notifications, allNotifications]);

  //  API (All)
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

  const mergedNotifications = Array.from(
    new Map(
      [...notifications, ...allNotifications].map(n => [n.id, n])
    ).values()
  );

  const list =
    tab === "unread"
      ? mergedNotifications.filter((n) => n.is_read === 0)
      : [...mergedNotifications].sort((a, b) => a.is_read - b.is_read);

  //  const handleToggle = (id) => {
  //   setActiveId((prev) => (prev === id ? null : id));
  // };

  //---------------------mark as read -----------------------------------------------------
  //  MARK SINGLE
  const markAsRead = async (id) => {
    //  instant ui upadet
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
    );

    setAllNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
    );

    try {
      const res = await API.post(`${API_ENDPOINTS.Mark_single_notificaction}/${id}`, {
        data: { id },
      });

      if (res.status === 200) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
        );

        setAllNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
        );
      }

    } catch (err) {
      console.log("MARK ERROR =>", err.response || err);
    }
  };


  // ----------------------mark all read ---------------------------------
  // MARK ALL
  const markAllAsRead = async () => {
    try {
      await API.patch(API_ENDPOINTS.Mark_all_asread_notifiction, {});

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: 1 }))
      );

      setAllNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: 1 }))
      );
    } catch (err) {
      console.log(err);
    }
  };
  // -------------------------------------------delete single on -----------------------------
  //DELETE SINGLE
  const deleteNotification = async (id) => {
    try {
      await API.delete(`${API_ENDPOINTS.Delete_single_one_notification}/${id}`, {
        data: { id },
      });

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setAllNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.log(err);
    }
  };
  //  ------------------------------delete all =====----------------------
  // DELETE ALL
  const deleteAllNotifications = async () => {
    try {
      await API.delete(API_ENDPOINTS.Delete_all_notifiction);

      setNotifications([]);
      setAllNotifications([]);
    } catch (err) {
      console.log(err);
    }
  };

  // skeleton ------------------
  const SkeletonItem = () => (
    <Flex p={3} gap={3} align="center">
      <SkeletonCircle size="10" />

      <Box flex="1">
        <Skeleton height="10px" mb={2} />
        <Skeleton height="8px" width="60%" />
      </Box>

      <Skeleton height="20px" width="50px" />
    </Flex>
  );

  return (
    <>
      {/* HEADER */}
      <Box p={4} borderBottom="1px solid #eee">
        <Flex justify="space-between" align="center">
          <Text fontWeight="bold">Notifications</Text>

          <HStack spacing={2}>
            <Button size="xs" onClick={markAllAsRead} bg="gray.200">
              Mark All Read
            </Button>

            <Button size="xs" colorScheme="red" onClick={deleteAllNotifications}>
              Clear All
            </Button>
          </HStack>
        </Flex>

        {/* Tabs */}
        <HStack mt={3} bg="gray.200" p="3px" borderRadius="full" width="fit-content">
          <Button
            size="xs"
            borderRadius="full"
            bg={tab === "all" ? "white" : "transparent"}
            color={tab === "all" ? "black" : "gray.600"}
            _hover={{
              bg: tab === "all" ? "white" : "gray.700",
              color: tab === "all" ? "black" : "white"
            }}
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
            _hover={{
              bg: "gray.700",
              color: "white"
            }}
            onClick={() => setTab("unread")}
          >
            Unread
          </Button>

        </HStack>
      </Box>

      {/* PAGINATION (ONLY FOR ALL TAB) */}
      {tab === "all" && (
        <Flex
          justify="space-between"
          align="center"
          px={4}
          py={2}
          borderBottom="1px solid #ffffff"
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
          <>
            {[...Array(5)].map((_, i) => (
              <SkeletonItem key={i} />
            ))}
          </>
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
            >
              <Flex p={3} gap={3} align="center">

                {/* Avatar */}
                <Avatar
                  size="sm" src={n.profile_image_url} name={n.name} onError={(e) => { e.target.src = "/default-avatar.png" }}
                // fallback if any error whith image
                />

                {/* Text */}
                <Box flex="1">
                  <Text fontSize="sm">
                    <b>{n.name}</b> {n.message}
                  </Text>

                  <Text fontSize="xs" color="gray.500">
                    {new Date(n.created_at).toLocaleString()}
                  </Text>
                </Box>

                {/* Status Dot */}
                {n.is_read === 0 && (
                  <Box
                    w="8px"
                    h="8px"
                    bg="green.400"
                    borderRadius="full"
                  />
                )}

                {/* Buttons */}
                <HStack spacing={1} flexDirection="column" display="flex">

                  {/*  MARK */}
                  {n.is_read === 0 && (
                    <Button
                      size="xs"
                      variant="ghost"
                      borderColor="green.400"
                      color="green.600"
                      _hover={{
                        bg: "green.500",
                        color: "white"
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(n.id);
                      }}
                    >
                      Mark
                    </Button>
                  )}

                  {/*  DELETE */}
                  <Button
                    size="xs"
                    variant="ghost"
                    borderColor="red.400"
                    color="red.600"
                    _hover={{
                      bg: "red.600",
                      color: "white",
                      borderColor: "red.500"
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id)
                    }}
                  >
                    Delete
                  </Button>
                </HStack>

              </Flex>
            </Box>
          ))
        )}
      </Box>
    </>
  );
};

export default NotofictionBarModel;