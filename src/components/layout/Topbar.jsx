import { Flex, Text, Avatar, Spacer, IconButton } from "@chakra-ui/react";
import { Bell } from "lucide-react";

const DesktopTopbar = () => {
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