// src/components/layout/DashboardLayout.jsx
import { Flex, Box } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import RightSidebar from "./RightSidebar";


const DashboardLayout = ({ children }) => {
  return (
    <Flex>
      <Sidebar />

      <Flex direction="column" flex="1" minH="100vh">

        <Topbar />
        <Flex flex="1">
          <Box flex="1" p={6}>
            {children}
          </Box>

          <RightSidebar/>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default DashboardLayout;
