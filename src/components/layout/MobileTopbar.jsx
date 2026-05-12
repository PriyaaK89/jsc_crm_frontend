import React, { useState, useContext, useEffect } from "react";

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
  DrawerBody,
  VStack,
  Button,
  Collapse,
  Icon,
  Box,
  Divider,
  Image,
  useToast,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Popover,
  Portal,
} from "@chakra-ui/react";

import {
  HamburgerIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";

import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

import {
  RiDashboardLine,
  RiUser3Line,
  RiSettings3Line,
  RiFileList3Line,
  RiBarChartLine,
  RiTeamFill,
} from "react-icons/ri";

import { FaBookOpen, FaListAlt, FaTable, FaWarehouse } from "react-icons/fa";

import {
  FaChartLine,
  FaBullseye,
  FaList,
  FaTrash,
  FaFileInvoiceDollar,
  FaFileInvoice,
  FaMoneyCheckAlt,
  FaEdit,
  FaStore,
  FaShoppingCart,
  FaReceipt,
  FaMoneyBillWave,
  FaUser,
  FaUserPlus,
  FaWallet,
  FaKey,
} from "react-icons/fa";

import {
  MdAccountTree,
  MdAssignmentInd,
  MdGroupAdd,
  MdCorporateFare,
  MdInventory,
  MdAddBox,
  MdViewList,
  MdDelete,
  MdCategory,
  MdAddCircleOutline,
  MdPeople,
  MdReceiptLong,
  MdAssessment,
  MdLocalShipping,
  MdDirectionsBus,
  MdFactory,
  MdSwapHoriz,
  MdPendingActions,
  MdTrendingUp,
  MdUploadFile,
} from "react-icons/md";

import {
  HiUserGroup,
  HiOfficeBuilding,
  HiOutlinePrinter,
  HiOutlineDocumentReport,
} from "react-icons/hi";

import { FiMapPin, FiTarget, FiLogOut } from "react-icons/fi";

import { BiPurchaseTagAlt } from "react-icons/bi";

import { BsCreditCard2Front, BsUpcScan } from "react-icons/bs";

import {
  UserCheck,
  Receipt,
  CalendarCheck,
  BellRing,
  Handshake,
  BookText,
  Clock,
  FileSpreadsheet,
  BarChart3,
  DollarSign,
  Package,
  Ticket,
} from "lucide-react";

import logo from "../../assets/images/jamidaralogo_adminpannel.jpeg";
import { RxComponent1 } from "react-icons/rx";

const MobileTopbar = () => {
  const { auth, logoutUser } = useContext(AuthContext);

  const role = auth?.user?.role;

  const location = useLocation();

  const navigate = useNavigate();

  const toast = useToast();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [openMenu, setOpenMenu] = useState(null);

  const onOpen = () => setIsDrawerOpen(true);

  const onClose = () => setIsDrawerOpen(false);

  const toggleMenu = (key) => {
    setOpenMenu(openMenu === key ? null : key);
  };

  const logout = () => {
    logoutUser();

    toast({
      title: "Logged out",
      description: "You are logged out successfully.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });

    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  };

  const sidebarButtonStyle = {
    variant: "ghost",
    justifyContent: "flex-start",
    borderRadius: "10px",
    fontWeight: "600",
    color: "#333",
    w: "100%",
    minH: "44px",
    whiteSpace: "normal",
    textAlign: "left",
    px: 3,
    _hover: {
      bg: "#C084FA",
      color: "black",
    },
  };

  const activeLinkStyle = ({ isActive }) =>
    isActive
      ? {
        backgroundColor: "#C084FA",
        color: "black",
      }
      : undefined;

  const menuSection = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: RiDashboardLine,
    },

    {
      label: "HR Management",
      key: "users",
      icon: FaUser,
      children: [
        {
          label: "Add Employee",
          path: "/hr-mgmt/add-employee",
          icon: FaUserPlus,
        },
        {
          label: "Employee List",
          path: "/hr-mgmt/view-employee-list",
          icon: RiUser3Line,
        },
        {
          label: "Create Job Role",
          path: "/hr-mgmt/roles/add-job-role",
          icon: HiUserGroup,
        },
        {
          label: "Create Department",
          path: "/hr-mgmt/dept/add-department",
          icon: MdAccountTree,
        },
        {
          label: "Upload Employee Expenses",
          path: "/upload-employee-expenses",
          icon: MdUploadFile,
        },
        {
          label: "Upload Salary Slip",
          path: "/hr-mgmt/upload-emp-salary",
          icon: RiFileList3Line,
        },
        {
          label: "Change Password",
          path: "/hr-mgmt/change-password",
          icon: FaKey,
        },
      ],
    },

    {
      label: "Business Development",
      key: "business",
      icon: FaChartLine,
      children: [
        {
          label: "Create Team",
          path: "/business-development/create-team",
          icon: FaUserPlus,
        },
        {
          label: "Create Sub Team",
          path: "/business-development/create-sub-team",
          icon: HiUserGroup,
        },
        {
          label: "Assign Target",
          path: "/business-development/assign-target",
          icon: MdAssignmentInd,
        },
        {
          label: "View Teams",
          path: "/business-development/view-teams",
          icon: RiTeamFill,
        },
        {
          label: "View Assigned Targets",
          path: "/business-development/view-assigned-targets",
          icon: FiTarget,
        },
      ],
    },

    {
      label: "Accounting Master",
      key: "accounting-master",
      icon: FaWallet,
      children: [
        {
          label: "Create Group",
          path: "/accounting-master/create-group",
          icon: MdGroupAdd,
        },
        {
          label: "View Group",
          path: "/accounting-master/view-group",
          icon: FaList,
        },
        {
          label: "Delete Group",
          path: "/accounting-master/delete-group",
          icon: FaTrash,
        },
        {
          label: "Create Ledger",
          path: "/accounting-master/create-ledger",
          icon: FaFileInvoiceDollar,
        },
        {
          label: "ON Boarding Ledger",
          path: "/accounting-master/onboarding-ledger",
          icon: FaBookOpen,
        },
      ],
    },

    {
      label: "Reports",
      key: "reports",
      icon: RiBarChartLine,
      children: [
        {
          label: "Attendance Report",
          path: "/report/emp-attendance-report",
          icon: CalendarCheck,
        },
        {
          label: "Employee Expense Report",
          path: "/report/get-emp-expense-report",
          icon: Receipt,
        },
        {
          label: "Track Employee",
          path: "/report/track-employee",
          icon: FiMapPin,
        },
      ],
    },
    {
      label: "Inventory Master", key: "inventory", icon: MdInventory,
      children: [
        { label: "Create Stock Group", path: "/inventory/create-stock-group", icon: MdAddBox },
        { label: "View Stock Group", path: "/inventory/view-stock-group", icon: MdViewList },
        { label: "Create Stock Category", path: "/inventory/create-stock-category", icon: MdCategory },
        { label: "View Stock Category", path: "/inventory/view-stock-category", icon: MdAddCircleOutline },
        { label: "Create Godown", path: "/inventory/create-godown", icon: FaWarehouse },
        { label: "View Godown", path: "/inventory/view-godown-list", icon: FaListAlt },
              {label:"Create Unit of Measure",path:"/inventory/create-unitOfMeasure",icon:RxComponent1  },
                  {label:"View Unit of Measure ",path:"/inventory/unit-list",icon:FaTable   },
      ]
    },

    {
      label: "Settings",
      path: "/settings",
      icon: RiSettings3Line,
    },
  ];

  useEffect(() => {
    const path = location.pathname;

    const menuMap = {
      "/hr-mgmt": "users",
      "/accounting-master": "accounting-master",
      "/business-development": "business",
      "/report": "reports",
    };

    for (const route in menuMap) {
      if (path.startsWith(route)) {
        setOpenMenu(menuMap[route]);
        break;
      }
    }
  }, [location.pathname]);

  return (
    <>
      {/* TOPBAR */}

      <Flex
        w="100%"
        h="70px"
        bg="white"
        align="center"
        px={4}
        boxShadow="sm"
        position="fixed"
        top="0"
        left="0"
        zIndex="1400"
      >
        <IconButton
          icon={<HamburgerIcon />}
          aria-label="Open Menu"
          onClick={onOpen}
          mr={2}
          variant="ghost"
        />

        <Text fontWeight="bold" fontSize="lg">
          Dashboard
        </Text>

        <Spacer />

        <Popover placement="bottom-end">
          <PopoverTrigger>
            <Avatar
              name={auth?.user?.name}
              size="sm"
              cursor="pointer"
            />
          </PopoverTrigger>

          <Portal>
            <PopoverContent w="170px" boxShadow="lg">
              <PopoverArrow bg="white" borderColor="gray.300" />

              <PopoverBody p={2}>
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color="#747A80"
                  px={2}
                  py={1}
                >
                  {auth?.user?.name}
                </Text>

                <Button
                  size="sm"
                  fontSize="xs"
                  variant="ghost"
                  w="100%"
                  justifyContent="flex-start"
                  onClick={() =>
                    navigate(`/dashboard/profile/${auth?.user?.id}`)
                  }
                >
                  My Account
                </Button>

                <Divider my={2} />

                <Button
                  size="sm"
                  rightIcon={<FiLogOut />}
                  fontSize="xs"
                  variant="ghost"
                  w="100%"
                  border="1px solid gray"
                  justifyContent="center"
                  onClick={logout}
                  _hover={{
                    bgColor: "#f4bfbf",
                    border: "1px solid #e48f8f",
                    color: "#971345",
                  }}
                >
                  Logout
                </Button>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover>
      </Flex>

      {/* DRAWER */}

      <Drawer
        placement="left"
        isOpen={isDrawerOpen}
        onClose={onClose}
        size="xs"
      >
        <DrawerOverlay />

        <DrawerContent
          maxH="100vh"
          overflow="hidden"
        >
          {/* HEADER */}

          <Flex
            align="center"
            justify="space-between"
            p={4}
            borderBottom="1px solid #eee"
            flexShrink={0}
          >
            <Image
              src={logo}
              alt="logo"
              w="115px"
              h="54px"
              objectFit="contain"
            />

            <DrawerCloseButton position="static" />
          </Flex>

          {/* BODY */}

          <DrawerBody
            overflowY="auto"
            overflowX="hidden"
            py={4}
            px={2}
            css={{
              scrollbarWidth: "thin",
            }}
          >
            <VStack
              spacing={2}
              align="stretch"
              w="100%"
              pb={6}
            >
              {menuSection.map((menu, index) => {
                const IconComponent = menu.icon;

                if (!menu.children) {
                  return (
                    <Button
                      key={index}
                      leftIcon={<IconComponent />}
                      as={NavLink}
                      to={menu.path}
                      style={activeLinkStyle}
                      {...sidebarButtonStyle}
                      onClick={onClose}
                    >
                      {menu.label}
                    </Button>
                  );
                }

                const parentActive = menu.children.some((child) =>
                  location.pathname.startsWith(child.path)
                );

                return (
                  <Box key={index} w="100%">
                    <Button
                      leftIcon={<IconComponent />}
                      rightIcon={
                        <Icon
                          as={
                            openMenu === menu.key
                              ? ChevronDownIcon
                              : ChevronRightIcon
                          }
                        />
                      }
                      onClick={() => toggleMenu(menu.key)}
                      {...sidebarButtonStyle}
                      bg={parentActive ? "#E9D8FD" : "transparent"}
                    >
                      {menu.label}
                    </Button>

                    <Collapse in={openMenu === menu.key}>
                      <VStack
                        pl={4}
                        pt={2}
                        spacing={2}
                        align="stretch"
                        w="100%"
                      >
                        {menu.children.map((child, i) => {
                          const ChildIcon = child.icon;

                          return (
                            <Button
                              key={i}
                              size="sm"
                              leftIcon={<ChildIcon />}
                              as={NavLink}
                              to={child.path}
                              style={activeLinkStyle}
                              {...sidebarButtonStyle}
                              fontSize="13px"
                              onClick={onClose}
                            >
                              {child.label}
                            </Button>
                          );
                        })}
                      </VStack>
                    </Collapse>
                  </Box>
                );
              })}

              {/* LOGOUT BUTTON */}

              <Button
                mt={3}
                size="sm"
                rightIcon={<FiLogOut />}
                fontSize="xs"
                variant="ghost"
                w="100%"
                border="1px solid gray"
                justifyContent="center"
                onClick={logout}
                _hover={{
                  bgColor: "#f4bfbf",
                  border: "1px solid #e48f8f",
                  color: "#971345",
                }}
              >
                Logout
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MobileTopbar;