import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { CheckIcon, LockIcon } from "@chakra-ui/icons";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import PermissionEditor, { PermissionSummary } from "../Permissions/PermissionEditor";


const AssignPermissions = () => {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const review = useDisclosure();

  // Modal theme values (hooks must stay above any early return)
  const modalHeaderBg = useColorModeValue("blue.50", "whiteAlpha.100");
  const modalIconBg = useColorModeValue("blue.100", "blue.800");
  const modalIconColor = useColorModeValue("blue.600", "blue.200");
  const modalSubText = useColorModeValue("gray.600", "gray.400");
  const modalBodyBg = useColorModeValue("gray.50", "blackAlpha.300");
  const modalFooterBg = useColorModeValue("white", "gray.800");

  const onboarding = !!location?.state?.onboarding;
  const [modules, setModules] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const finish = () =>
    navigate(onboarding ? "/dashboard" : "/hr-mgmt/view-employee-list");

  useEffect(() => {
    let active = true;
    API.get(API_ENDPOINTS.permissions_for_user(userId))
      .then((res) => {
        if (!active) return;
        const data = res?.data?.data;
        setModules(data?.modules || []);
        setSelected(new Set(data?.permission_ids || []));
        setIsAdminUser(!!data?.is_admin);
      })
      .catch((error) => {
        toast({
          title: error?.response?.data?.message || "Could not load permissions",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId, toast]);

  const save = async () => {
    setSaving(true);
    try {
      await API.put(API_ENDPOINTS.permissions_for_user(userId), {
        permission_ids: [...selected],
      });
      toast({
        title: "Permissions saved successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      review.onClose();
      finish();
    } catch (error) {
      toast({
        title: error?.response?.data?.message || "Could not save permissions",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" py={16}>
        <Spinner />
      </Flex>
    );
  }

  return (
    <Box bg="gray.50" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={5} borderRadius="xl" boxShadow="md">
      <Flex justify="space-between" align="center" mb={5} wrap="wrap" gap={2}>
        <Box>
          <Heading size="md">Assign Permissions</Heading>
          <Text fontSize="sm" color="gray.600">
            {onboarding
              ? "Step 4 of 4: choose what this employee can access"
              : "Choose what this employee can access"}
          </Text>
        </Box>
        <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
          {selected.size} selected
        </Badge>
      </Flex>

      {isAdminUser ? (
        <Text color="gray.600" mb={4}>
          Admin and Super Admin users already have full access.
        </Text>
      ) : (
        <PermissionEditor modules={modules} selected={selected} onChange={setSelected} />
      )}

      <Flex justify="flex-end" gap={3} mt={6}>
        {(onboarding || isAdminUser) && (
          <Button variant="outline" onClick={finish}>
            {onboarding ? "Finish Without Permissions" : "Back"}
          </Button>
        )}
        {!isAdminUser && (
          <Button colorScheme="blue" onClick={review.onOpen}>
            Review & Save
          </Button>
        )}
      </Flex>

      <Modal
        isOpen={review.isOpen}
        onClose={review.onClose}
        size="xl"
        scrollBehavior="inside"
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="2xl">
          <ModalHeader bg={modalHeaderBg} px={6} py={5}>
            <Flex align="center" gap={4}>
              <Flex
                align="center"
                justify="center"
                boxSize={11}
                borderRadius="xl"
                bg={modalIconBg}
                color={modalIconColor}
                flexShrink={0}
              >
                <LockIcon boxSize={5} />
              </Flex>
              <Box>
                <Flex align="center" gap={2}>
                  <Text fontSize="lg" fontWeight="500">
                    Review Permissions
                  </Text>
                  <Badge
                    colorScheme="blue"
                    borderRadius="full"
                    px={2.5}
                    py={2.5}
                    fontSize="12px"
                  >
                    {selected.size} selected
                  </Badge>
                </Flex>
                <Text fontSize="12px" fontWeight="normal" color={modalSubText} mt={3}>
                  Confirm the access below before saving.
                </Text>
              </Box>
            </Flex>
          </ModalHeader>
          <ModalCloseButton top={5} right={5} borderRadius="full" isDisabled={saving} />

          <Divider />

          <ModalBody bg={modalBodyBg} px={6} py={5}>
            <PermissionSummary
              modules={modules}
              selected={selected}
              emptyText="No permissions are selected. This user will only have the access every logged-in employee has."
            />
          </ModalBody>

          <Divider />

          <ModalFooter bg={modalFooterBg} gap={3} px={6} py={4}>
            <Button
              variant="outline"
              borderRadius="lg" fontSize="14px"
              onClick={review.onClose}
              isDisabled={saving}
            >
              Change
            </Button>
            <Button
              colorScheme="blue"
              borderRadius="lg"
              px={6} fontSize="14px"
              leftIcon={<CheckIcon boxSize={3} />}
              isLoading={saving}
              loadingText="Saving..."
              onClick={save}
            >
              Save Permissions
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AssignPermissions;