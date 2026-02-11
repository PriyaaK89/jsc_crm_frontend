import { Flex, Text, Avatar, Spacer, IconButton } from "@chakra-ui/react";
import { Bell } from "lucide-react";

const Topbar = () => {
  return (
    <Flex
      w="100%"
      h="60px"
      bg="white"
      align="center"
      px={6}
      borderBottom="1px solid"
      borderColor="gray.200" borderRadius="34px"
    >
      <Text fontWeight="bold" fontSize="lg">Dashboard</Text>

      <Spacer />

      <IconButton
        aria-label="Notifications"
        variant="ghost"
        mr={4}
      >
        <Bell size={20} />
      </IconButton>
      <Avatar name="Rahul Sharma" size="sm"/>
    </Flex>
  );
};

export default Topbar;
