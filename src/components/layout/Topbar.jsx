import {
  Flex,
  Text,
  Avatar,
  Spacer,
  Button,
  Box,
  Portal,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Divider,
  useToast,
  useDisclosure,
  Image
} from "@chakra-ui/react";
import React, { useState, useContext } from "react";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { BellIcon } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import NotofictionBarModel from './NotofictionBarModel'
import CustomeAvater from "./CustomeAvater";

const Topbar = ({ profileImage }) => {
  const [full, setFull] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { auth, logoutUser } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const profile = auth?.user?.profile_image_url;
  console.log(profile, "profile from")

  // Modal control
  const { isOpen, onOpen, onClose } = useDisclosure();

  console.log("profile imahge url", profileImage);
  // -----------------auth ------------


  // ---------------- Full Screen ----------------
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFull(true);
    } else {
      document.exitFullscreen();
      setFull(false);
    }
  };

  // ---------------- Logout ----------------
  const logout = () => {
    logoutUser();

    toast({
      title: "Logged out",
      description: "You are logged out successfully.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });

    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <>
      <Flex
        position="fixed"
        top="0"
        left="280px"
        w="calc(100% - 280px)"
        h="75px"
        bg="white"
        align="center"
        px={6}
        zIndex="1000"
        border="1px solid #e5e7eb"
        boxShadow="sm"
      >
   

        <Spacer />

        {/* Fullscreen Button */}
        <Button
          mr={2}
          onClick={toggleFullScreen}
          borderRadius="30px"
          p={2}
          bg="transparent"
          _hover={{ bg: "gray.100" }}
        >
          {full ? <MdFullscreen size={20} /> : <MdFullscreenExit size={20} />}
        </Button>

        {/*  Notification Bell */}
        <Box
          mr={6}
          position="relative"
          cursor="pointer"
          onClick={onOpen}
        >
          <Popover placement="bottom-end" gutter={10}>
            <PopoverTrigger>
              <Box position="relative">
                <BellIcon size={20} />

                {unreadCount > 0 && (
                  <Box
                    position="absolute"
                    top="-5px"
                    right="-5px"
                    bg="red.500"
                    color="white"
                    fontSize="10px"
                    px="5px"
                    borderRadius="full"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Box>
                )}
              </Box>
            </PopoverTrigger>

            <Portal>
              <PopoverContent
  w={{ base: "95vw", md: "380px" }}
  maxW="380px"
  borderRadius="16px"
  overflow="hidden"
  boxShadow="xl"
              >
                <PopoverArrow />        
                <NotofictionBarModel setUnreadCount={setUnreadCount} />

              </PopoverContent>
            </Portal>
          </Popover>

        </Box>

        {/*  Profile */}
        <Popover placement="bottom-end">
          <PopoverTrigger>

           <Box cursor="pointer">
            <CustomeAvater
             name={auth?.user?.name}
              src={auth?.user?.profile_image_url}  cursor="pointer"
              />
              </Box>
          </PopoverTrigger>

          <Portal>
            <PopoverContent w="170px" boxShadow="lg">
              <PopoverArrow />

              <PopoverBody p={2}>
                <Text fontSize="sm" fontWeight="bold" px={2} py={1}>
                  {auth?.user?.name}
                </Text>

                <Button
                  size="sm"
                  fontSize="xs"
                  variant="ghost"
                  w="100%"
                  justifyContent="flex-start"
                  onClick={() =>
                    navigate(`/dashboard/profile/${auth?.user?.id}`)
                  }
                >
                  My Account
                </Button>

                <Divider my={2} />

                <Button
                  size="sm"
                  rightIcon={<FiLogOut />}
                  fontSize="xs"
                  variant="ghost"
                  w="100%"
                  border="1px solid gray"
                  onClick={logout}
                  _hover={{
                    bgColor: "#f4bfbf",
                    border: "1px solid #e48f8f",
                    color: "#971345"
                  }}
                >
                  Logout
                </Button>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover>
      </Flex>
    </>
  );
};

export default Topbar;