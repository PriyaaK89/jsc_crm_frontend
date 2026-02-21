import React, { useState, useContext } from "react";
import {
  Flex,
  IconButton,
  Text,
  Avatar,
  Spacer,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  VStack,
  Button,
  Collapse,
  Icon,
} from "@chakra-ui/react";
import { HamburgerIcon, ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { NavLink } from "react-router-dom";
import { FaUser, FaUserPlus } from "react-icons/fa";
import {
  RiDashboardLine,
  RiUserAddLine,
  RiUser3Line,
  RiFileList3Line,
  RiBarChartLine,
  RiSettings3Line,
} from "react-icons/ri";
import { UserCheck } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const MobileTopbar = () => {
  const { auth } = useContext(AuthContext);
  const role = auth?.user?.role;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const onOpen = () => setIsDrawerOpen(true);
  const onClose = () => setIsDrawerOpen(false);

  const toggleMenu = (menu) => setOpenMenu(openMenu === menu ? null : menu);

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
    <>
      {/* 🔹 Topbar */}
      <Flex
        w="100%"
        h="60px"
        bg="#F5F0FA"
        align="center"
        px={4}
        boxShadow="sm"
        position="fixed"
        top="0"
        zIndex={20}
        display={{ base: "flex", md: "none" }}
      >
        <IconButton
          icon={<HamburgerIcon />}
          aria-label="Open Menu"
          onClick={onOpen}
          mr={2}
          bg="transparent"
        />
        <Text fontWeight="bold" fontSize="lg">Dashboard</Text>
        <Spacer />
        <Avatar name={auth?.user?.name || "User"} size="sm" />
      </Flex>

      {/* 🔹 Drawer */}
      <Drawer placement="left" isOpen={isDrawerOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>CRM</DrawerHeader>
          <DrawerBody p={0}>
            <VStack spacing={2} align="stretch" p={4}>
              {/* Dashboard */}
              <Button
                leftIcon={<RiDashboardLine />}
                as={NavLink}
                to="/dashboard"
                {...sidebarButtonStyle}
                style={activeLinkStyle}
                onClick={onClose}
              >
                Dashboard
              </Button>

              {/* HR Management */}
              <Button
                leftIcon={<FaUser />}
                rightIcon={<Icon as={openMenu === "users" ? ChevronDownIcon : ChevronRightIcon} />}
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
                    onClick={onClose}
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
                    onClick={onClose}
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
                    onClick={onClose}
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
                    onClick={onClose}
                  >
                    Attend Report
                  </Button>
                </VStack>
              </Collapse>

              {/* Leads */}
              <Button
                leftIcon={<RiUser3Line />}
                rightIcon={<Icon as={openMenu === "leads" ? ChevronDownIcon : ChevronRightIcon} />}
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
                    onClick={onClose}
                  >
                    New Lead
                  </Button>
                  <Button
                    leftIcon={<RiFileList3Line />}
                    {...sidebarButtonStyle}
                    size="sm"
                    as={NavLink}
                    to="/leads/list"
                    onClick={onClose}
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
                onClick={onClose}
              >
                Reports
              </Button>

              {/* Settings */}
              <Button
                leftIcon={<RiSettings3Line />}
                {...sidebarButtonStyle}
                as={NavLink}
                to="/settings"
                onClick={onClose}
              >
                Settings
              </Button>

              {/* IP Request for Admin */}
              {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                <Button
                  leftIcon={<RiUserAddLine />}
                  {...sidebarButtonStyle}
                  as={NavLink}
                  to="/approve-ip-user-list"
                  onClick={onClose}
                >
                  IP Request
                </Button>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MobileTopbar;
