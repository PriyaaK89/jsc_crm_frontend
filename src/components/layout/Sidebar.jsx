import { useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import {
  Box,
  VStack,
  Text,
  Button,
  Collapse,
  Icon,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { AuthContext } from "../../context/AuthContext";
import { FaUser } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa";
import {
  RiDashboardLine,
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
    _hover: { bg: "#C084FA", color: "black" },
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
      // allow display in drawer for mobile
      display="block"
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
          leftIcon={<FaUser />}

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
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/emp-attendance-report"
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
              // as={openMenu === "leads" ? ChevronDownIcon : ChevronRightIcon}
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
              as={NavLink}
              to="/leads/new"
              // onClick={onClose}
            >
              New Lead
            </Button>

            <Button
              leftIcon={<RiFileList3Line />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/leads/list"
              // onClick={onClose}
            >
              Lead List
            </Button>
          </VStack>
        </Collapse>

        {/* Reports */}
        <Button
          leftIcon={<RiBarChartLine />}
          {...sidebarButtonStyle}
          as={NavLink}
          to="/reports"
          // onClick={onClose}
        >
          Reports
        </Button>

        {/* Settings */}
        <Button
          leftIcon={<RiSettings3Line />}
          {...sidebarButtonStyle}
          as={NavLink}
          to="/settings"
          // onClick={onClose}
        >
          Settings
        </Button>

        {(role === "ADMIN" || role === "SUPER_ADMIN") && (
          <Button
            leftIcon={<RiUserAddLine />}
            {...sidebarButtonStyle}
            as={NavLink}
            to="/approve-ip-user-list"
            // onClick={onClose}
          >
            IP Request
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default Sidebar;
