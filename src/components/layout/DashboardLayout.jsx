import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import DesktopTopbar from "./Topbar";
import MobileTopbar from "./MobileTopbar";
import RightSidebar from "./RightSidebar";


const DashboardLayout = ({ children }) => {

  return (
    <Flex bg="#f4f4f4" height="100vh" overflow="hidden">
      
      {/* Desktop Sidebar */}
      <Box
        w="268px"
        position="fixed"
        display={{ base: "none", md: "block" }}
      >
        <Sidebar />
      </Box>

      {/* Main Area */}
      <Flex
        direction="column"
        flex="1"
        ml={{ base: 0, md: "268px" }}
      >
        {/* Desktop Topbar */}
        <Box
          display={{ base: "none", md: "block" }}
          p={4}
        >
          <DesktopTopbar />
        </Box>

        {/* Mobile Topbar */}
        <Box
          display={{ base: "block", md: "none" }}
          position="fixed"
          top="0"
          w="100%"
          zIndex="10"
        >
          <MobileTopbar />
        </Box>

        {/* Content */}
        <Box
          flex="1"
          p={4}
          pt={{ base: "70px", md: 4 }}
        >
          <Flex gap={4} direction={{ base: "column", lg: "row" }}>
            
            {/* Main Content */}
            <Box
              flex="1"
              bg="white"
              borderRadius="20px"
              p={4}
              boxShadow="sm"
            >
              {children}
            </Box>

            {/* Right Sidebar */}
            <Box
              w={{ base: "100%", lg: "300px" }}
              display={{ base: "none", lg: "block" }}
              bg="white"
              borderRadius="20px"
              p={4}
              boxShadow="sm"
            >
              <RightSidebar />
            </Box>

          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};
export default DashboardLayout;