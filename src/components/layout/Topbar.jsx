import {
  Flex,
  Text,
  Avatar,
  Spacer,
  IconButton,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Button,
  Popover,
  Portal,
  useToast,
  Divider,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import {  HStack } from "@chakra-ui/react";
import { Bell } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

// import { toast } from "react-toastify";

const Topbar = () => {
  // full screen function 
  const [full, setFull] = useState(false);
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFull(true);
    } else {
      document.exitFullscreen();
      setFull(false);
    }
  };


  const toast = useToast();
  const { auth,logoutUser } = useContext(AuthContext);

  const logout = () => {

    logoutUser();
    // Show toast
    toast({
      title: "Logged out",
      description: "You are logged out successfully.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });

    // Redirect after delay
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  };

  return (
    
    <Flex
   position="fixed"
  top="0"
  left="280px"
  w="calc(100% - 280px)"
  boxSizing="border-box"
  overflow="hidden"
  h="75px"
  bg="white"
  align="center"
  boxShadow="sm"
  px={6}
  zIndex="1000"
  border="1px solid #e5e7eb"
 
>
      <Text fontWeight="bold" fontSize="lg">
        Dashboard
      </Text>

      <Spacer />
       <Button mr={2}
      leftIcon={full ? <MdFullscreen size={20} /> : <MdFullscreenExit size={20} />}
      onClick={toggleFullScreen}
      
      borderRadius="30px"
      pl={1}
      p={2}
  bg="transparent"
  _hover={{ bg: "gray.100" }}
  _active={{ bg: "gray.200" }}
      
    >
      
    </Button>

      <IconButton aria-label="Notifications" variant="ghost" mr={4} icon={<Bell size={20} />}>
       
      </IconButton>
      {/* profile  */}
    <Popover placement="bottom-end">
  <PopoverTrigger>
    <Avatar name={auth?.user?.name} size="sm" cursor="pointer" />
  </PopoverTrigger>

  <Portal>
    <PopoverContent w="170px" boxShadow="lg">
      <PopoverArrow  bg="white" borderColor="gray.200" />

      <PopoverBody p={2}>
        <Text fontSize="sm" fontWeight="bold" color="#747A80" px={2} py={1}>
          {auth?.user?.name}
        </Text>

        <Button
          size="sm"
          fontSize="xs"
          variant="ghost"
          w="100%"
          justifyContent="flex-start"
          onClick={() =>
            (window.location.href = `/dashboard/profile/${auth?.user?.id}`)
          }
        >
          My Account
        </Button>

        <Divider my={2} />

        <Button
          size="sm"
          fontSize="xs"
          variant="ghost"
          w="100%"
          justifyContent="flex-start"
          colorScheme="red"
          onClick={logout}
        >
          Logout
        </Button>
      </PopoverBody>
    </PopoverContent>
  </Portal>
</Popover>
    </Flex>
  );
};

export default Topbar;
