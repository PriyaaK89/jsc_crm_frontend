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
import { Bell } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

// import { toast } from "react-toastify";

const Topbar = () => {
  const toast = useToast();
  const { auth } = useContext(AuthContext);

  const logout = () => {
    // Remove token
    localStorage.removeItem("token");

    // Show toast
    toast({
      title: "Logged out",
      description: "You are logged out successfully 👋",
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
      w="100%"
      h="60px"
      bg="white"
      color="#333333"
      align="center"
      boxShadow="sm"
      borderRadius="34px"
      px={{ base: 4, md: 6 }}
    >
      <Text fontWeight="bold" fontSize="lg">
        Dashboard
      </Text>

      <Spacer />

      <IconButton aria-label="Notifications" variant="ghost" mr={4}>
        <Bell size={20} />
      </IconButton>
      {/* profile  */}
      <Popover
        placement="bottom-end"
        backdropFilter="blur(10px)"
        bg="rgba(255, 255, 255, 0.8)"
      >
        <PopoverTrigger>
          <Avatar name="" size="sm" cursor="pointer" />
        </PopoverTrigger>

        <PopoverContent w="170px">
          <PopoverArrow />

          <PopoverBody p={2}>
            {/* User Name */}
            <Text fontSize="sm" fontWeight="bold" color="#747A80" px={2} py={1}>
              Rahul Sharma !
            </Text>

            {/* My Account */}
            <Button
              size="sm"
              fontSize="xs"
              color="#747A80"
              variant="ghost"
              w="100%"
              justifyContent="flex-start"
              onClick={() =>
                (window.location.href = `/dashboard/profile/${auth?.user?.id}`)
              }
            >
              My Account
            </Button>
            {/* divider */}
            <Divider my={2} borderWidth="1px" color="gray.200" />

            {/* Logout */}
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
      </Popover>
    </Flex>
  );
};

export default Topbar;
