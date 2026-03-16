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
  DrawerHeader,
  DrawerBody,
  VStack,
  Button,
  Collapse,
  Icon,
  Box,
} from "@chakra-ui/react";

import {
  HamburgerIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";

import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

import {
  RiDashboardLine,
  RiUserAddLine,
  RiUser3Line,
  RiSettings3Line,
  RiFileList3Line,
  RiBarChartLine,
} from "react-icons/ri";

import {
  FaChartLine,
  FaUserTie,
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
} from "react-icons/md";

import {
  HiUserGroup,
  HiOfficeBuilding,
  HiOutlinePrinter,
} from "react-icons/hi";

import { FiMapPin } from "react-icons/fi";
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

import { FaUser, FaUserPlus, FaWallet } from "react-icons/fa";

const MobileTopbar = () => {
  const { auth } = useContext(AuthContext);
  const role = auth?.user?.role;

  const location = useLocation();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const onOpen = () => setIsDrawerOpen(true);
  const onClose = () => setIsDrawerOpen(false);

  const toggleMenu = (key) => {
    setOpenMenu(openMenu === key ? null : key);
  };

  const sidebarButtonStyle = {
    variant: "ghost",
    justifyContent: "flex-start",
    borderRadius: "10px",
    fontWeight: "600",
    color: "#333",
    _hover: { bg: "#C084FA", color: "black" },
  };

  const activeLinkStyle = ({ isActive }) =>
    isActive ? { backgroundColor: "#C084FA", color: "black" } : undefined;

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
          label: "Upload Salary Slip",
          path: "/hr-mgmt/upload-emp-salary",
          icon: RiFileList3Line,
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
          path: "/Business-dev/create-team",
          icon: FaUserPlus,
        },
        {
          label: "Create Sub Team",
          path: "/Business-devt/create-sub-team",
          icon: HiUserGroup,
        },
        {
          label: "Assign Target RSM",
          path: "/Business-devt/assign-target-rsm",
          icon: MdAssignmentInd,
        },
        {
          label: "Assign Target TSM",
          path: "/Business-devt/assign-target-tsm",
          icon: FaUserTie,
        },
        {
          label: "Assign Target SM",
          path: "/Business-devt/assign-target-sm",
          icon: FaBullseye,
        },
        {
          label: "Assign Target FA",
          path: "/Business-devt/assign-target-fa",
          icon: UserCheck,
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
          label: "View Ledger",
          path: "/accounting-master/view-ledger",
          icon: FaFileInvoice,
        },
        {
          label: "Delete Ledger",
          path: "/accounting-master/delete-ledger",
          icon: FaTrash,
        },
        {
          label: "Create Voucher",
          path: "/accounting-master/create-voucher",
          icon: FaMoneyCheckAlt,
        },
        {
          label: "View Voucher",
          path: "/accounting-master/view-voucher",
          icon: FaFileInvoice,
        },
        {
          label: "Delete Voucher",
          path: "/accounting-master/delete-voucher",
          icon: FaTrash,
        },
        {
          label: "Edit Ledger Assignment",
          path: "/accounting-master/edit-ledger-assignment",
          icon: FaEdit,
        },
        {
          label: "Retail Assignment",
          path: "/accounting-master/retail-assignment",
          icon: FaStore,
        },
       
      ],
    },

    {
      label: "Company Master",
      key: "company-master",
      icon: MdCorporateFare,
      children: [
        {
          label: "Create Company",
          path: "/company-master/create-company",
          icon: HiOfficeBuilding,
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
          label: "Scheduling & Alert Report",
          path: "/report/scheduling-alert-report",
          icon: BellRing,
        },
        {
          label: "Party Transaction Report",
          path: "/report/party-transaction-report",
          icon: Handshake,
        },
        {
          label: "Employee Expense Report",
          path: "/report/get-emp-expense-report",
          icon: Receipt,
        },
        {
          label: "Party Ledger Report",
          path: "/report/party-ledger-report",
          icon: BookText,
        },
        {
          label: "Credit Days Reminder Report",
          path: "/report/credit-days-reminder-report",
          icon: Clock,
        },
        {
          label: "Employee Balance Sheet",
          path: "/report/emp-balance-sheet",
          icon: FileSpreadsheet,
        },
        {
          label: "Interest Report",
          path: "/report/interest-report",
          icon: BarChart3,
        },
        {
          label: "Salary Report",
          path: "/report/emp-salary-report",
          icon: DollarSign,
        },
        {
          label: "Product Report",
          path: "/report/product-report",
          icon: Package,
        },
        {
          label: "Item Stock Report",
          path: "/report/item-stock-report",
          icon: Package,
        },
      ],
    },

    {
      label: "Inventory Master",
      key: "inventory",
      icon: MdInventory,
      children: [
        {
          label: "Create Stock Group",
          path: "/inventory/create-stock-group",
          icon: MdAddBox,
        },
        {
          label: "View Stock Group",
          path: "/inventory/view-stock-group",
          icon: MdViewList,
        },
        {
          label: "Delete Stock Group",
          path: "/inventory/delete-stock-group",
          icon: MdDelete,
        },
        {
          label: "Create Stock Category",
          path: "/inventory/create-stock-category",
          icon: MdCategory,
        },
        {
          label: "View Stock Category",
          path: "/inventory/view-stock-category",
          icon: MdAddCircleOutline,
        },
      ],
    },

    {
      label: "Order Voucher",
      key: "order-voucher",
      icon: FaFileInvoice,
      children: [
        { label: "Payment", path: "/order-vochor/payment", icon: FiMapPin },
        {
          label: "Purchase",
          path: "/order-vochor/purchase",
          icon: BiPurchaseTagAlt,
        },
        { label: "Sales", path: "/order-vochor/sales", icon: FaShoppingCart },
        { label: "Receipt", path: "/order-vochor/receipt", icon: FaReceipt },
        {
          label: "Credit",
          path: "/order-vochor/credit",
          icon: BsCreditCard2Front,
        },
        { label: "Debit", path: "/order-vochor/debit", icon: FaMoneyBillWave },
      ],
    },

    {
      label: "Print Management",
      key: "print_mgmt",
      icon: HiOutlinePrinter,
      children: [
        {
          label: "Shipping Label Printer",
          path: "/print/mgmt/shipping_lable_printer",
          icon: BsUpcScan,
        },
        {
          label: "TruthFull Label Print",
          path: "/print/mgmt/truthful_labelprint",
          icon: Ticket,
        },
      ],
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
      "/accounting-master": "accounting",
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
      {/* Topbar */}

      <Flex
        w="100%"
        h="70px"
        bg="white"
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
        />

        <Text fontWeight="bold">Dashboard</Text>

        <Spacer />

        <Avatar name={auth?.user?.name || "User"} size="sm" />
      </Flex>

      {/* Drawer Sidebar */}

      <Drawer placement="left" isOpen={isDrawerOpen} onClose={onClose}>
        <DrawerOverlay />

        <DrawerContent>
          <DrawerCloseButton />

          <DrawerHeader>CRM</DrawerHeader>

          <DrawerBody>
            <VStack spacing={2} align="stretch">
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
                    >
                      {menu.label}
                    </Button>
                  );
                }

                const parentActive = menu.children.some((child) =>
                  location.pathname.startsWith(child.path),
                );

                return (
                  <Box key={index}>
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
                      style={parentActive ? { bg: "#E9D8FD" } : undefined}
                    >
                      {menu.label}
                    </Button>

                    <Collapse in={openMenu === menu.key}>
                      <VStack pl={6} mt={2} align="stretch">
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

              {/* Role Based Button */}

              {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                <Button
                  leftIcon={<RiUserAddLine />}
                  as={NavLink}
                  to="/approve-ip-user-list"
                  {...sidebarButtonStyle}
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
