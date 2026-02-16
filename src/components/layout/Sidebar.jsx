import { Box, VStack, Text, Button, Collapse, Icon } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { FaUserLarge } from "react-icons/fa6";
import { FaUserPlus } from "react-icons/fa";
// import { UserCheck } from "lucide-react";

import {
  RiDashboardLine,
  RiTeamLine,
  RiUserAddLine,
  RiUser3Line,
  RiFileList3Line,
  RiBarChartLine,
  RiSettings3Line,
} from "react-icons/ri";
import { UserCheck } from "lucide-react";

const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const { auth } = useContext(AuthContext);
  const role = auth?.user?.role;

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const sidebarButtonStyle = {
    variant: "ghost",
    justifyContent: "flex-start",
    borderRadius: "12px",
    fontWeight: "700",
    color: "#333333",
    _hover: {
      bg: "#C084FA",
      color: "black",
    },
  };

  const activeLinkStyle = ({ isActive }) =>
    isActive ? { backgroundColor: "#C084FA", color: "black" } : undefined;

  return (
    <Box
      w="268px"
      bg="#F5F0FA"
      color="#333333"
      minH="100vh"
      p={4}
      display={{ base: "none", md: "block" }}
    >
      <Text fontSize="2xl" fontWeight="bold" mb={8}>
        CRM
      </Text>

      <VStack spacing={2} align="stretch">
        {/* Dashboard */}
        <Button
          leftIcon={<RiDashboardLine />}
          as={NavLink}
          to="/dashboard"
          {...sidebarButtonStyle}
          style={activeLinkStyle}
        >
          Dashboard
        </Button>

        {/* HR Management */}
        <Button
          leftIcon={<FaUserLarge />}
          rightIcon={
            <Icon
              as={openMenu === "users" ? ChevronDownIcon : ChevronRightIcon}
            />
          }
          {...sidebarButtonStyle}
          onClick={() => toggleMenu("users")}
        >
          HR Management
        </Button>

        <Collapse in={openMenu === "users"} animateOpacity>
          <VStack pl={6} align="stretch" spacing={1}>
            <Button
              leftIcon={<FaUserPlus />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/hr-mgmt/add-employee"
              style={activeLinkStyle}
            >
              Add Employee
            </Button>

            <Button
              leftIcon={<RiUser3Line />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/hr-mgmt/view-employee-list"
              style={activeLinkStyle}
            >
              Employee List
            </Button>

            <Button
              leftIcon={<RiFileList3Line />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/hr-mgmt/upload-emp-salary"
              style={activeLinkStyle}
            >
              Upload Salary
            </Button>
            <Button
              leftIcon={<UserCheck />}
              to="/emp-attendance-report"
              {...sidebarButtonStyle}
              as={NavLink}
              size="sm"
              style={activeLinkStyle}
            >
              Attend Report
            </Button>
          </VStack>
        </Collapse>

        {/* Leads */}
        <Button
          leftIcon={<RiUser3Line />}
          rightIcon={
            <Icon
              as={openMenu === "leads" ? ChevronDownIcon : ChevronRightIcon}
            />
          }
          {...sidebarButtonStyle}
          onClick={() => toggleMenu("leads")}
        >
          Leads
        </Button>

        <Collapse in={openMenu === "leads"} animateOpacity>
          <VStack pl={6} align="stretch" spacing={1}>
            <Button
              leftIcon={<RiUserAddLine />}
              {...sidebarButtonStyle}
              size="sm"
            >
              New Lead
            </Button>
            <Button
              leftIcon={<RiFileList3Line />}
              {...sidebarButtonStyle}
              size="sm"
            >
              Lead List
            </Button>
          </VStack>
        </Collapse>

        {/* Reports */}
        <Button leftIcon={<RiBarChartLine />} {...sidebarButtonStyle}>
          Reports
        </Button>

        {/* Settings */}
        <Button leftIcon={<RiSettings3Line />} {...sidebarButtonStyle}>
          Settings
        </Button>

        {(role === "ADMIN" || role === "SUPER_ADMIN") && (
          <Button
            leftIcon={<RiUserAddLine />}
            {...sidebarButtonStyle}
            as={NavLink}
            to="/approve-ip-user-list"
            style={activeLinkStyle}
          >
            IP Request
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default Sidebar;
