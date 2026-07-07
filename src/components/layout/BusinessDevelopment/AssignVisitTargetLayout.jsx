import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import MobileTopbar from "../MobileTopbar";
import NotificationBtn from "../../NotificationBtn/NotificationBtn";
import AssignVisitTarget from "../../../pages/BusinessDevelopment/AssignVisitTarget";
import TemplateList from "../../../pages/BusinessDevelopment/TemplateList";
import ProgressHistory from "../../../pages/BusinessDevelopment/VisitProgressHistory";

const VisitTargetAssignmentLayout = () => {
  return (
          <Box bg="#f2f1f1" minH="100vh" >
                        <Box display={{ base: "none", md: "block" }}> <Sidebar /> </Box>
                        <Box display={{ base: "none", md: "block" }}> <Topbar /> </Box>
                        <Box display={{ base: "block", md: "none" }}> <MobileTopbar /> </Box>
                        <Box ml={{ base: 5, md: "295px" }} mr={{ base: 5, md: 5 }} pt="5rem" pb={6} > <NotificationBtn /> 
    <Box>
      <Tabs colorScheme="blue" isLazy>
        <TabList>
          <Tab>Dashboard</Tab>
          <Tab>Templates</Tab>
          <Tab>History</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <AssignVisitTarget />
          </TabPanel>

          <TabPanel px={0}>
            <TemplateList />
          </TabPanel>

          <TabPanel px={0}>
            <ProgressHistory />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
    </Box></Box>
  );
}

export default VisitTargetAssignmentLayout;