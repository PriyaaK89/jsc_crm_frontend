import { Flex, Text, Avatar, Spacer, IconButton } from "@chakra-ui/react";
import { Bell } from "lucide-react";

const DesktopTopbar = () => {
  return (
    <Flex
      w="100%"
      h="60px"
      bg="#F5F0FA"
      color="#333333"
      align="center"
      px={6}
      boxShadow="sm"
    >
      <Text fontWeight="bold" fontSize="lg">
        Dashboard
      </Text>

      <Spacer />

      <IconButton
        aria-label="Notifications"
        variant="ghost"
        mr={4}
        icon={<Bell size={20} />}
      />

      <Avatar name="Rahul Sharma" size="sm" />
    </Flex>
  );
};

export default DesktopTopbar;
