import { Box } from "@chakra-ui/react";
import { useContext } from "react";
import Topbar from "./Topbar";
import MobileTopbar from "./MobileTopbar";
import Sidebar from "./Sidebar";
import NotificationBtn from "../NotificationBtn/NotificationBtn";
import { AuthContext } from "../../context/AuthContext";
import DashboardAnalytics from "../../pages/Dashboard/analytics/DashboardAnalytics";

const DashboardLayout = () => {
  const { auth } = useContext(AuthContext);
  const role = auth?.user?.role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  return (
    <Box bg="#f2f1f1" minH="100vh">
      <Box display={{ base: "none", md: "block" }}>
        <Sidebar />
      </Box>
      <Box display={{ base: "none", md: "block" }}>
        <Topbar />
      </Box>
      <Box display={{ base: "block", md: "none" }}>
        <MobileTopbar />
      </Box>
      <Box ml={{ base: 5, md: "295px" }} mr={5} pt="5rem" pb={6}>
        <NotificationBtn />
        {/* The attendance card now lives inside the dashboard's Overview tab. */}
        <DashboardAnalytics isAdmin={isAdmin} />
      </Box>
    </Box>
  );
};

export default DashboardLayout;