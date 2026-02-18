import {
  Flex,
  Box,
  useDisclosure,
} from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import DesktopTopbar from "./Topbar";
import MobileTopbar from "./MobileTopbar";
import RightSidebar from "./RightSidebar";

const DashboardLayout = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex minH="100vh">
      {/* Desktop Sidebar */}
      <Box display={{ base: "none", md: "block" }}>
        <Sidebar />
      </Box>

      

      {/* Main Content */}
      <Flex direction="column" flex="1">
        {/* Desktop Topbar */}
        <Box display={{ base: "none", md: "block" }}>
          <DesktopTopbar />
        </Box>

        {/* Mobile Topbar */}
        <Box display={{ base: "block", md: "none" }}>
          <MobileTopbar />
        </Box>

        <Flex flex="1">
          <Box flex="1" p={6}>
            {children}
          </Box>

          {/* Right Sidebar only for large screens */}
          <Box display={{ base: "none", lg: "block" }}>
            <RightSidebar />
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default DashboardLayout;
