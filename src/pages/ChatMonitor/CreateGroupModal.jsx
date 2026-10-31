// src/pages/ChatMonitor/CreateGroupModal.jsx
// Lets admin / super_admin / users with the "chat_create_group" permission create a chat group
// from the dashboard. Members can be ANY active user (the backend enforces the same rules).
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody,
  ModalFooter, Box, Flex, HStack, Text, Input, Textarea, InputGroup, InputLeftElement,
  Avatar, Checkbox, Button, Spinner, Center, Tag, TagLabel, TagCloseButton, Wrap,
  WrapItem, FormControl, FormLabel, useToast,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const PAGE_SIZE = 30;

const CreateGroupModal = ({ isOpen, onClose, onCreated }) => {
  const toast = useToast();
  const iconInputRef = useRef(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState("");

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  // selected members live in a map so they survive searching / paging
  const [selected, setSelected] = useState({}); // id -> { id, name, job_role }
  const [submitting, setSubmitting] = useState(false);

  const selectedList = Object.values(selected);

  // reset everything each time the modal opens
  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setDescription("");
    setIconFile(null);
    setIconPreview("");
    setSearch("");
    setDebounced("");
    setSelected({});
    setUsers([]);
    setPage(1);
  }, [isOpen]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(
    async (pg) => {
      const res = await API.get(API_ENDPOINTS.chat_contacts, {
        params: { scope: "all", search: debounced || undefined, page: pg, limit: PAGE_SIZE },
      });
      return res?.data?.data || [];
    },
    [debounced]
  );

  // (re)load page 1 when opened or when the search text changes
  useEffect(() => {
    if (!isOpen) return;
    let off = false;
    (async () => {
      setLoading(true);
      try {
        const list = await fetchUsers(1);
        if (off) return;
        setUsers(list);
        setPage(1);
        setHasMore(list.length === PAGE_SIZE);
      } catch (e) {
        if (!off) {
          toast({
            title: "Could not load users",
            description: e?.response?.data?.message,
            status: "error",
            duration: 3000,
          });
        }
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => { off = true; };
  }, [isOpen, fetchUsers, toast]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const next = page + 1;
      const list = await fetchUsers(next);
      setUsers((prev) => {
        const ids = new Set(prev.map((u) => u.user_id));
        return [...prev, ...list.filter((u) => !ids.has(u.user_id))];
      });
      setPage(next);
      setHasMore(list.length === PAGE_SIZE);
    } catch (e) {
      toast({ title: "Could not load more users", status: "error", duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (u) =>
    setSelected((prev) => {
      const copy = { ...prev };
      if (copy[u.user_id]) delete copy[u.user_id];
      else copy[u.user_id] = { id: u.user_id, name: u.name, job_role: u.job_role };
      return copy;
    });

  const removeSelected = (id) =>
    setSelected((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

  const pickIcon = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/i.test(f.type)) {
      toast({ title: "Icon must be a JPG, PNG or WEBP image", status: "warning", duration: 3000 });
      return;
    }
    setIconFile(f);
    setIconPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    const groupName = name.trim();
    if (!groupName) {
      toast({ title: "Group name is required", status: "warning", duration: 3000 });
      return;
    }
    if (selectedList.length === 0) {
      toast({ title: "Select at least one member", status: "warning", duration: 3000 });
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post(API_ENDPOINTS.chat_groups, {
        name: groupName,
        description: description.trim() || undefined,
        member_ids: selectedList.map((u) => u.id),
      });
      const conversationId = res?.data?.data?.conversation_id;

      // the icon is optional - a failed upload must not undo the group
      if (iconFile && conversationId) {
        try {
          const fd = new FormData();
          fd.append("file", iconFile);
          await API.post(API_ENDPOINTS.chat_group_icon(conversationId), fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (_) {
          toast({
            title: "Group created, but the icon could not be uploaded",
            status: "warning",
            duration: 4000,
          });
        }
      }

      toast({ title: `Group "${groupName}" created`, status: "success", duration: 3000 });
      onCreated?.({ conversation_id: conversationId, title: groupName });
      onClose();
    } catch (e) {
      toast({
        title: "Could not create the group",
        description: e?.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={submitting ? () => {} : onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px">Create group</ModalHeader>
        <ModalCloseButton isDisabled={submitting} />

        <ModalBody>
          {/* icon + name */}
          <Flex gap={4} align="center" mb={4}>
            <Box textAlign="center">
              <Avatar
                size="lg"
                name={name || "G"}
                src={iconPreview || undefined}
                bg="#2f6a8a"
                color="white"
                cursor="pointer"
                onClick={() => iconInputRef.current?.click()}
              />
              <Text
                fontSize="11px"
                color="#2f6a8a"
                mt={1}
                cursor="pointer"
                onClick={() => iconInputRef.current?.click()}
              >
                {iconPreview ? "Change icon" : "Add icon"}
              </Text>
              <input
                ref={iconInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={pickIcon}
              />
            </Box>
            <FormControl isRequired>
              <FormLabel fontSize="12px" mb={1}>Group name</FormLabel>
              <Input
                size="sm"
                maxLength={150}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Zone 1 Sales Team"
              />
            </FormControl>
          </Flex>

          <FormControl mb={4}>
            <FormLabel fontSize="12px" mb={1}>Description (optional)</FormLabel>
            <Textarea
              size="sm"
              rows={2}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>

          {/* selected chips */}
          <Text fontSize="12px" fontWeight="600" mb={1}>
            Members ({selectedList.length} selected)
          </Text>
          {selectedList.length > 0 && (
            <Wrap mb={2}>
              {selectedList.map((u) => (
                <WrapItem key={u.id}>
                  <Tag size="sm" borderRadius="full" colorScheme="teal">
                    <TagLabel>{u.name}</TagLabel>
                    <TagCloseButton onClick={() => removeSelected(u.id)} />
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          )}

          {/* user picker */}
          <InputGroup size="sm" mb={2}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search employees by name or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          <Box border="1px solid #e3e8ec" borderRadius="8px" maxH="260px" overflowY="auto">
            {loading && users.length === 0 ? (
              <Center py={8}><Spinner color="#2f6a8a" /></Center>
            ) : users.length === 0 ? (
              <Text p={4} textAlign="center" fontSize="12.5px" color="gray.500">
                No users found
              </Text>
            ) : (
              users.map((u) => (
                <HStack
                  key={u.user_id}
                  px={3}
                  py={2}
                  spacing={3}
                  cursor="pointer"
                  borderBottom="1px solid #f0f2f4"
                  bg={selected[u.user_id] ? "#EFF8F6" : "white"}
                  _hover={{ bg: "#f7f9fa" }}
                  onClick={() => toggleUser(u)}
                >
                  <Checkbox
                    isChecked={!!selected[u.user_id]}
                    colorScheme="teal"
                    pointerEvents="none"
                    onChange={() => {}}
                  />
                  <Avatar size="sm" name={u.name} src={u.avatar_url || undefined} />
                  <Box minW={0}>
                    <Text fontSize="13px" fontWeight="600" noOfLines={1}>{u.name}</Text>
                    <Text fontSize="11px" color="gray.500" noOfLines={1}>
                      {u.job_role || "—"}
                    </Text>
                  </Box>
                </HStack>
              ))
            )}
            {hasMore && (
              <Center py={2}>
                <Button size="xs" variant="outline" onClick={loadMore} isLoading={loading}>
                  Load more
                </Button>
              </Center>
            )}
          </Box>
        </ModalBody>

        <ModalFooter gap={2}>
          <Button size="sm" variant="ghost" onClick={onClose} isDisabled={submitting}>
            Cancel
          </Button>
          <Button
            size="sm"
            bg="#237086"
            color="white"
            _hover={{ bg: "#1B5A6B" }}
            onClick={submit}
            isLoading={submitting}
            loadingText="Creating..."
            isDisabled={!name.trim() || selectedList.length === 0}
          >
            Create group
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateGroupModal;