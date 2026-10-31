
import React, {
  useCallback, useEffect, useLayoutEffect, useRef, useState,
} from "react";
import {
  Box, Flex, HStack, Text, Input, InputGroup, InputLeftElement, Select, Avatar,
  Badge, Button, Spinner, Center, Image, Modal, ModalOverlay, ModalContent,
  ModalCloseButton, ModalBody, useDisclosure, useToast, Icon, IconButton, Tooltip,
} from "@chakra-ui/react";
import { SearchIcon, RepeatIcon, AddIcon } from "@chakra-ui/icons";
import { MdInsertDriveFile, MdBadge } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import CreateGroupModal from "./CreateGroupModal";

const POLL_MS = 15000;
const IMAGE_EXT = ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"];

// ---------------------------------------------------------------- helpers
const asDate = (v) => (v ? new Date(v) : null);

const timeOf = (v) => {
  const d = asDate(v);
  return d ? d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";
};

const sameDay = (a, b) =>
  a && b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const dayLabel = (v) => {
  const d = asDate(v);
  if (!d) return "";
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, now)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const listTime = (v) => {
  const d = asDate(v);
  if (!d) return "";
  return sameDay(d, new Date())
    ? timeOf(v)
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const sizeLabel = (n) => {
  if (!n && n !== 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

const isImageMsg = (m) => {
  if (m.is_deleted || !m.file) return false;
  if (m.type === "IMAGE") return true;
  if (m.type !== "DOCUMENT" && m.type !== "KYC") return false;
  if ((m.file.mime || "").toLowerCase().startsWith("image/")) return true;
  const name = (m.file.name || "").toLowerCase();
  const dot = name.lastIndexOf(".");
  return dot >= 0 && IMAGE_EXT.includes(name.slice(dot + 1));
};

// merge fresh messages into the list (by id), keep ascending order
const mergeMessages = (prev, fresh) => {
  const map = new Map(prev.map((m) => [m.id, m]));
  fresh.forEach((m) => map.set(m.id, m));
  return [...map.values()].sort((a, b) => a.id - b.id);
};

const NAME_COLORS = ["#1b7f5c", "#2f6a8a", "#a8552b", "#7a4fb0", "#b0324f", "#4f7a1f", "#9a6b00"];
const colorFor = (id) => NAME_COLORS[Math.abs(Number(id) || 0) % NAME_COLORS.length];

// ---------------------------------------------------------------- component
const ChatMonitor = () => {
  const toast = useToast();
  const imgModal = useDisclosure();
  const groupModal = useDisclosure();
  const [canCreateGroup, setCanCreateGroup] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);

  // left: conversation list
  const [convs, setConvs] = useState([]);
  const [convPage, setConvPage] = useState(1);
  const [convHasMore, setConvHasMore] = useState(false);
  const [convLoading, setConvLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // right: open conversation
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [msgsHasMore, setMsgsHasMore] = useState(false);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [olderLoading, setOlderLoading] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const scrollRef = useRef(null);
  const scrollMode = useRef(null); // "bottom" | "keep" | null
  const keepInfo = useRef({ height: 0, top: 0 });
  const selectedIdRef = useRef(null);

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  // who may create groups (admin / super_admin / chat_create_group permission)
  useEffect(() => {
    let off = false;
    API.get(API_ENDPOINTS.chat_capabilities)
      .then((r) => { if (!off) setCanCreateGroup(!!r?.data?.data?.can_create_group); })
      .catch(() => {});
    return () => { off = true; };
  }, []);

  const showError = useCallback(
    (e, fallback) =>
      toast({
        title: "Error",
        description: e?.response?.data?.message || fallback,
        status: "error",
        duration: 3500,
        isClosable: true,
      }),
    [toast]
  );

  // ------------------------------------------------------ conversation list
  const fetchConvs = useCallback(
    async (page) => {
      const res = await API.get(API_ENDPOINTS.chat_admin_conversations, {
        params: {
          search: debouncedSearch || undefined,
          type: typeFilter || undefined,
          page,
          limit: 20,
        },
      });
      return res?.data?.data || { items: [], has_more: false };
    },
    [debouncedSearch, typeFilter]
  );

  // reload from page 1 whenever the filters change
  useEffect(() => {
    let off = false;
    (async () => {
      setConvLoading(true);
      try {
        const { items, has_more } = await fetchConvs(1);
        if (off) return;
        setConvs(items);
        setConvPage(1);
        setConvHasMore(!!has_more);
      } catch (e) {
        if (!off) showError(e, "Could not load conversations");
      } finally {
        if (!off) setConvLoading(false);
      }
    })();
    return () => { off = true; };
  }, [fetchConvs, showError]);

  const loadMoreConvs = async () => {
    setConvLoading(true);
    try {
      const next = convPage + 1;
      const { items, has_more } = await fetchConvs(next);
      setConvs((prev) => {
        const ids = new Set(prev.map((c) => c.conversation_id));
        return [...prev, ...items.filter((c) => !ids.has(c.conversation_id))];
      });
      setConvPage(next);
      setConvHasMore(!!has_more);
    } catch (e) {
      showError(e, "Could not load more conversations");
    } finally {
      setConvLoading(false);
    }
  };

  // ------------------------------------------------------------- messages
  const fetchMessages = async (id, beforeId) => {
    const res = await API.get(API_ENDPOINTS.chat_admin_messages(id), {
      params: { limit: 50, before_id: beforeId || undefined },
    });
    const d = res?.data?.data || {};
    return { messages: d.messages || [], hasMore: !!d.has_more };
  };

  const openConversation = async (conv) => {
    if (selectedIdRef.current === conv.conversation_id) return;
    selectedIdRef.current = conv.conversation_id;
    setSelected(conv);
    setDetail(null);
    setMsgs([]);
    setMsgsHasMore(false);
    setShowMembers(false);
    setMsgsLoading(true);
    try {
      const [d, m] = await Promise.all([
        API.get(API_ENDPOINTS.chat_admin_conversation(conv.conversation_id)),
        fetchMessages(conv.conversation_id),
      ]);
      if (selectedIdRef.current !== conv.conversation_id) return; // user clicked another one
      setDetail(d?.data?.data || null);
      scrollMode.current = "bottom";
      setMsgs(m.messages);
      setMsgsHasMore(m.hasMore);
    } catch (e) {
      showError(e, "Could not load this conversation");
    } finally {
      if (selectedIdRef.current === conv.conversation_id) setMsgsLoading(false);
    }
  };

  const loadOlder = async () => {
    if (!selected || !msgs.length || olderLoading) return;
    const el = scrollRef.current;
    setOlderLoading(true);
    try {
      const m = await fetchMessages(selected.conversation_id, msgs[0].id);
      if (el) keepInfo.current = { height: el.scrollHeight, top: el.scrollTop };
      scrollMode.current = "keep";
      setMsgs((prev) => mergeMessages(prev, m.messages));
      setMsgsHasMore(m.hasMore);
    } catch (e) {
      showError(e, "Could not load older messages");
    } finally {
      setOlderLoading(false);
    }
  };

  // after messages change: jump to bottom, or keep the reading position
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (scrollMode.current === "bottom") {
      el.scrollTop = el.scrollHeight;
    } else if (scrollMode.current === "keep") {
      el.scrollTop = el.scrollHeight - keepInfo.current.height + keepInfo.current.top;
    }
    scrollMode.current = null;
  }, [msgs]);

  // ------------------------------------------------------------- refresh
  const refreshNow = useCallback(async () => {
    try {
      const { items } = await fetchConvs(1);
      setConvs((prev) => {
        const ids = new Set(items.map((c) => c.conversation_id));
        return [...items, ...prev.filter((c) => !ids.has(c.conversation_id))];
      });
      const id = selectedIdRef.current;
      if (id) {
        const m = await fetchMessages(id);
        if (selectedIdRef.current !== id) return;
        const el = scrollRef.current;
        const nearBottom = !el || el.scrollHeight - el.scrollTop - el.clientHeight < 120;
        if (nearBottom) scrollMode.current = "bottom";
        setMsgs((prev) => mergeMessages(prev, m.messages));
      }
    } catch (_) {
      /* silent: the next poll will try again */
    }
  }, [fetchConvs]);

  useEffect(() => {
    const t = setInterval(() => {
      if (!document.hidden) refreshNow();
    }, POLL_MS);
    return () => clearInterval(t);
  }, [refreshNow]);

  // a group was just created: refresh the list and open it
  const handleGroupCreated = async ({ conversation_id, title }) => {
    await refreshNow();
    if (conversation_id) {
      selectedIdRef.current = null; // force a reload even if it was already open
      openConversation({ conversation_id, type: "GROUP", title, icon_url: null });
    }
  };

  // ------------------------------------------------------------- rendering
  const openImage = (url) => {
    setPreviewImg(url);
    imgModal.onOpen();
  };

  // 1:1 chats: first member on the left, second on the right (like a real chat)
  const rightSenderId =
    detail && detail.type === "DIRECT" && detail.members?.length > 1
      ? detail.members[1].user_id
      : null;
  const isGroup = selected?.type === "GROUP";

  const renderBody = (m, onRight) => {
    if (m.is_deleted) {
      return (
        <Text fontSize="13px" fontStyle="italic" color="gray.500">
          🚫 This message was deleted
        </Text>
      );
    }
    return (
      <>
        {isImageMsg(m) ? (
          <Image
            src={m.file.url}
            alt={m.file.name || "image"}
            maxW="260px"
            maxH="300px"
            objectFit="cover"
            borderRadius="10px"
            cursor="pointer"
            onClick={() => openImage(m.file.url)}
            fallback={
              <Center w="200px" h="120px" bg="gray.100" borderRadius="10px">
                <Spinner size="sm" />
              </Center>
            }
          />
        ) : m.file ? (
          <Flex
            as="a"
            href={m.file.url}
            target="_blank"
            rel="noreferrer"
            align="center"
            gap={3}
            p={2}
            minW="210px"
            bg={onRight ? "#d3ebe0" : "#f1f4f6"}
            borderRadius="10px"
            _hover={{ textDecoration: "none", opacity: 0.9 }}
          >
            <Flex
              w="38px"
              h="38px"
              borderRadius="10px"
              align="center"
              justify="center"
              bg={m.type === "KYC" ? "#c9971c" : "#2f6a8a"}
              color="white"
            >
              <Icon as={m.type === "KYC" ? MdBadge : MdInsertDriveFile} boxSize={5} />
            </Flex>
            <Box overflow="hidden">
              <Text fontSize="12.5px" fontWeight="700" noOfLines={1}>
                {m.file.name || "File"}
              </Text>
              <Text fontSize="10.5px" color="gray.600">
                {m.type === "KYC" ? "KYC / License" : "Document"}
                {m.file.size ? ` · ${sizeLabel(m.file.size)}` : ""}
              </Text>
            </Box>
          </Flex>
        ) : null}
        {m.body ? (
          <Text
            fontSize="13.5px"
            mt={m.file ? 1.5 : 0}
            whiteSpace="pre-wrap"
            wordBreak="break-word"
          >
            {m.body}
          </Text>
        ) : null}
      </>
    );
  };

  const renderMessage = (m, i) => {
    const prev = msgs[i - 1];
    const showDay = !prev || !sameDay(asDate(prev.created_at), asDate(m.created_at));
    const dayChip = showDay ? (
      <Flex justify="center" my={3} key={`d-${m.id}`}>
        <Text fontSize="11px" fontWeight="600" bg="#e6ebee" color="gray.600" px={3} py={0.5} borderRadius="full">
          {dayLabel(m.created_at)}
        </Text>
      </Flex>
    ) : null;

    if (m.type === "SYSTEM") {
      return (
        <React.Fragment key={m.id}>
          {dayChip}
          <Flex justify="center" mb={2}>
            <Text fontSize="11px" bg="#e8f3ee" color="gray.600" px={3} py={1} borderRadius="10px" textAlign="center">
              {m.body}
            </Text>
          </Flex>
        </React.Fragment>
      );
    }

    const onRight = rightSenderId != null && m.sender_id === rightSenderId;
    return (
      <React.Fragment key={m.id}>
        {dayChip}
        <Flex justify={onRight ? "flex-end" : "flex-start"} mb={2}>
          <Box
            maxW="72%"
            bg={onRight ? "#e1f4ea" : "white"}
            border="1px solid #e3e8ec"
            borderRadius="12px"
            borderTopLeftRadius={onRight ? "12px" : "4px"}
            borderTopRightRadius={onRight ? "4px" : "12px"}
            px={3}
            py={2}
            boxShadow="0 1px 1px rgba(0,0,0,0.04)"
          >
            <Text fontSize="11.5px" fontWeight="800" color={colorFor(m.sender_id)} mb={0.5}>
              {m.sender_name || `User ${m.sender_id}`}
            </Text>

            {m.reply_to && !m.is_deleted && (
              <Box
                mb={1.5}
                px={2}
                py={1}
                bg="rgba(0,0,0,0.05)"
                borderLeft="3px solid"
                borderLeftColor={colorFor(m.reply_to.sender_id)}
                borderRadius="6px"
              >
                <Text fontSize="10.5px" fontWeight="800" color={colorFor(m.reply_to.sender_id)}>
                  {m.reply_to.sender_name}
                </Text>
                <Text fontSize="11.5px" color="gray.600" noOfLines={2}>
                  {m.reply_to.preview}
                </Text>
              </Box>
            )}

            {renderBody(m, onRight)}

            <Text fontSize="9.5px" color="gray.500" textAlign="right" mt={1}>
              {timeOf(m.created_at)}
            </Text>
          </Box>
        </Flex>
      </React.Fragment>
    );
  };

  const memberLine = () => {
    if (!detail) return "";
    if (detail.type === "GROUP") return `${detail.members.length} members`;
    return detail.members.map((u) => u.job_role).filter(Boolean).join(" ↔ ");
  };

  return (
    <Flex
      border="1px solid #d9dfe4"
      borderRadius="10px"
      overflow="hidden"
      h={{ base: "75vh", md: "calc(100vh - 290px)" }}
      minH="520px"
      bg="white"
    >
      {/* ---------------- left: conversation list ---------------- */}
      <Flex
        direction="column"
        w={{ base: selected ? "0" : "100%", md: "340px" }}
        display={{ base: selected ? "none" : "flex", md: "flex" }}
        borderRight="1px solid #e3e8ec"
        flexShrink={0}
      >
        <Box p={3} borderBottom="1px solid #e3e8ec" bg="#f7f9fa">
          <InputGroup size="sm" mb={2}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              bg="white"
              borderRadius="8px"
              placeholder="Search by name or group"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          <HStack>
            <Select
              size="sm"
              bg="white"
              borderRadius="8px"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All chats</option>
              <option value="DIRECT">1:1 chats</option>
              <option value="GROUP">Groups</option>
            </Select>
            {canCreateGroup && (
              <Button
                size="sm"
                leftIcon={<AddIcon boxSize={2.5} />}
                bg="#237086"
                color="white"
                _hover={{ bg: "#1B5A6B" }}
                flexShrink={0}
                onClick={groupModal.onOpen}
              >
                Group
              </Button>
            )}
            <Tooltip label="Refresh now">
              <IconButton
                size="sm"
                variant="outline"
                aria-label="Refresh"
                icon={<RepeatIcon />}
                onClick={refreshNow}
              />
            </Tooltip>
          </HStack>
        </Box>

        <Box flex="1" overflowY="auto">
          {convLoading && convs.length === 0 ? (
            <Center py={10}><Spinner color="#2f6a8a" /></Center>
          ) : convs.length === 0 ? (
            <Text p={6} textAlign="center" fontSize="13px" color="gray.500">
              No conversations found
            </Text>
          ) : (
            convs.map((c) => {
              const active = selected?.conversation_id === c.conversation_id;
              return (
                <Flex
                  key={c.conversation_id}
                  px={3}
                  py={2.5}
                  gap={3}
                  align="center"
                  cursor="pointer"
                  bg={active ? "#EFF4FF" : "white"}
                  borderBottom="1px solid #f0f2f4"
                  boxShadow={active ? "inset 3px 0 0 0 #2f6a8a" : "none"}
                  _hover={{ bg: active ? "#EFF4FF" : "#f7f9fa" }}
                  onClick={() => openConversation(c)}
                >
                  <Avatar
                    size="sm"
                    name={c.title}
                    src={c.icon_url || undefined}
                    icon={c.type === "GROUP" ? <FaUsers /> : undefined}
                    bg={c.type === "GROUP" ? "#2f6a8a" : undefined}
                    color="white"
                  />
                  <Box flex="1" minW={0}>
                    <Flex justify="space-between" gap={2}>
                      <Text fontSize="13px" fontWeight="700" noOfLines={1}>{c.title}</Text>
                      <Text fontSize="10.5px" color="gray.500" flexShrink={0}>
                        {listTime(c.last_message_at)}
                      </Text>
                    </Flex>
                    <Flex justify="space-between" gap={2} align="center">
                      <Text fontSize="12px" color="gray.600" noOfLines={1}>
                        {c.last_message
                          ? `${c.type === "GROUP" ? `${c.last_message.sender_name}: ` : ""}${c.last_message.preview}`
                          : "No messages yet"}
                      </Text>
                      {c.type === "GROUP" && (
                        <Badge colorScheme="blue" fontSize="9px" flexShrink={0}>
                          {c.member_count}
                        </Badge>
                      )}
                    </Flex>
                  </Box>
                </Flex>
              );
            })
          )}

          {convHasMore && (
            <Center py={3}>
              <Button size="xs" variant="outline" onClick={loadMoreConvs} isLoading={convLoading}>
                Load more
              </Button>
            </Center>
          )}
        </Box>
      </Flex>

      {/* ---------------- right: messages ---------------- */}
      <Flex
        direction="column"
        flex="1"
        minW={0}
        bg="#eef1f3"
        display={{ base: selected ? "flex" : "none", md: "flex" }}
      >
        {!selected ? (
          <Center flex="1" flexDirection="column" color="gray.500">
            <Text fontSize="15px" fontWeight="700">Team Chat Monitor</Text>
            <Text fontSize="12.5px" mt={1}>Select a conversation to read it (read-only)</Text>
          </Center>
        ) : (
          <>
            {/* header */}
            <Box bg="white" borderBottom="1px solid #e3e8ec">
              <Flex px={4} py={2.5} align="center" gap={3}>
                <Button
                  display={{ base: "inline-flex", md: "none" }}
                  size="xs"
                  variant="outline"
                  onClick={() => { selectedIdRef.current = null; setSelected(null); }}
                >
                  Back
                </Button>
                <Avatar
                  size="sm"
                  name={selected.title}
                  src={selected.icon_url || undefined}
                  icon={isGroup ? <FaUsers /> : undefined}
                  bg={isGroup ? "#2f6a8a" : undefined}
                  color="white"
                />
                <Box flex="1" minW={0}>
                  <Text fontSize="14px" fontWeight="800" noOfLines={1}>
                    {detail?.name || selected.title}
                  </Text>
                  <Text fontSize="11.5px" color="gray.500" noOfLines={1}>{memberLine()}</Text>
                </Box>
                <Badge colorScheme="orange" fontSize="10px">READ ONLY</Badge>
                {isGroup && (
                  <Button size="xs" variant="outline" onClick={() => setShowMembers((v) => !v)}>
                    {showMembers ? "Hide members" : "Members"}
                  </Button>
                )}
              </Flex>

              {showMembers && detail && (
                <Flex px={4} pb={3} gap={2} wrap="wrap">
                  {detail.members.map((u) => (
                    <HStack key={u.user_id} bg="#f1f4f6" borderRadius="full" pl={1} pr={3} py={1}>
                      <Avatar size="xs" name={u.name} src={u.avatar_url || undefined} />
                      <Text fontSize="11.5px" fontWeight="600">
                        {u.name}
                        {u.job_role ? ` · ${u.job_role}` : ""}
                        {u.role === "ADMIN" ? " (admin)" : ""}
                      </Text>
                    </HStack>
                  ))}
                </Flex>
              )}
            </Box>

            {/* messages */}
            <Box ref={scrollRef} flex="1" overflowY="auto" px={{ base: 3, md: 5 }} py={3}>
              {msgsLoading ? (
                <Center h="100%"><Spinner size="lg" color="#2f6a8a" /></Center>
              ) : (
                <>
                  {msgsHasMore && (
                    <Center mb={3}>
                      <Button size="xs" variant="outline" bg="white" onClick={loadOlder} isLoading={olderLoading}>
                        Load older messages
                      </Button>
                    </Center>
                  )}
                  {msgs.length === 0 ? (
                    <Center py={10}>
                      <Text fontSize="13px" color="gray.500">No messages in this conversation</Text>
                    </Center>
                  ) : (
                    msgs.map((m, i) => renderMessage(m, i))
                  )}
                </>
              )}
            </Box>

            <Box bg="white" borderTop="1px solid #e3e8ec" px={4} py={1.5}>
              <Text fontSize="10.5px" color="gray.500">
                Viewing as admin · updates every {POLL_MS / 1000}s · reading here does not mark anything as read
              </Text>
            </Box>
          </>
        )}
      </Flex>

      <CreateGroupModal
        isOpen={groupModal.isOpen}
        onClose={groupModal.onClose}
        onCreated={handleGroupCreated}
      />

      {/* ---------------- full-size image ---------------- */}
      <Modal isOpen={imgModal.isOpen} onClose={imgModal.onClose} size="4xl" isCentered>
        <ModalOverlay />
        <ModalContent bg="black">
          <ModalCloseButton color="white" zIndex={2} />
          <ModalBody p={2}>
            {previewImg && (
              <Image src={previewImg} alt="preview" maxH="82vh" mx="auto" objectFit="contain" />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default ChatMonitor;