import { Box, flattenTokens, Flex } from "@chakra-ui/react";
import Topbar from "./Topbar";
import { AuthContext } from "../../context/AuthContext";
import MobileTopbar from "./MobileTopbar";
import {useContext} from  "react";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar"
import NotificationBtn from "../NotificationBtn/NotificationBtn";
import PieChart from "../../pages/Dashboard/PieChart";

const DashboardLayout = () => {
   const { auth} = useContext(AuthContext);
    const role = auth?.user?.role;

  return (
    <Box bg="#f2f1f1" minH="100vh" >
          <Box display={{ base: "none", md: "block" }}>
            <Sidebar />
    
          </Box>
          <Box display={{ base: "none", md: "block" }}>
            <Topbar />
          </Box>
          <Box display={{ base: "block", md: "none" }}>
            <MobileTopbar />
          </Box>
          <Box
 ml={{ base: 5, md: "295px" }}
 mr={{base:5, md:5}}
 pt="5rem"
 pb={6}>
            <NotificationBtn/>
             {(role === "ADMIN" || role === "SUPER_ADMIN") && (
            <PieChart />
             )}
          </Box>
        </Box>
  );
};
export default DashboardLayout;