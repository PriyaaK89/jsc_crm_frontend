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

import { usePermissions } from "../../context/PermissionContext";
import { AuthContext } from "../../context/AuthContext";
import { filterMenu } from "../../routes/routePermission";

import {
  MdDashboard,
  MdPeople,
  MdPersonAdd,
  MdPersonOutline,
  MdWorkOutline,
  MdApartment,
  MdUploadFile,
  MdPauseCircleOutline,
  MdDescription,
  MdLockOutline,
  MdEvent,
  MdEventNote,
  MdGavel,
  MdTrendingUp,
  MdGroupAdd,
  MdDeviceHub,
  MdSupervisorAccount,
  MdAssignment,
  MdMap,
  MdPinDrop,
  MdTrackChanges,
  MdListAlt,
  MdPersonPin,
  MdFlag,
  MdAssignmentTurnedIn,
  MdMenuBook,
  MdStorefront,
  MdAccountBalance,
  MdCreateNewFolder,
  MdFolderOpen,
  MdNoteAdd,
  MdLibraryBooks,
  MdPostAdd,
  MdReceiptLong,
  MdEdit,
  MdAssignmentInd,
  MdBusiness,
  MdAddBusiness,
  MdDomain,
  MdInventory,
  MdGrass,
  MdLibraryAdd,
  MdViewList,
  MdCategory,
  MdViewModule,
  MdAddBox,
  MdInventory2,
  MdWarehouse,
  MdHomeWork,
  MdStraighten,
  MdSquareFoot,
  MdPrecisionManufacturing,
  MdSwapHoriz,
  MdShoppingCart,
  MdPayments,
  MdShoppingBag,
  MdPointOfSale,
  MdReceipt,
  MdCreditCard,
  MdAccountBalanceWallet,
  MdCompareArrows,
  MdRemoveCircleOutline,
  MdSyncAlt,
  MdBook,
  MdAssessment,
  MdEventAvailable,
  MdFmdGood,
  MdDateRange,
  MdMyLocation,
  MdNotificationsActive,
  MdAlarm,
  MdShowChart,
  MdSupervisedUserCircle,
  MdAttachMoney,
  MdPieChart,
  MdLocalShipping,
  MdDirectionsBus,
  MdBarChart,
  MdFactory,
  MdPendingActions,
  MdLeaderboard,
  MdApps,
  MdToggleOn,
  MdTaskAlt,
  MdFolder,
  MdPlayCircleOutline,
  MdChat,
  MdPrint,
  MdQrCodeScanner,
  MdLabel,
} from "react-icons/md";

import { FiLogOut } from "react-icons/fi";

import logo from "../../assets/images/jamidaralogo_adminpannel.jpeg";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const MobileTopbar = () => {

  const { auth, logoutUser } = useContext(AuthContext);
  const { can } = usePermissions();
  const role = auth?.user?.role;
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const onOpen = () => setIsDrawerOpen(true);
  const onClose = () => setIsDrawerOpen(false);

  // Team Chat visibility (same capability check as the desktop sidebar)
  const [canViewChat, setCanViewChat] = useState(false);
  useEffect(() => {
    let off = false;
    API.get(API_ENDPOINTS.chat_capabilities)
      .then((r) => { if (!off) setCanViewChat(!!r?.data?.data?.can_view_all); })
      .catch(() => {});
    return () => { off = true; };
  }, []);

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
    fontWeight: "700",
    color: "#333",
    w: "100%",
    minH: "36px",
    whiteSpace: "normal",
    textAlign: "left",
    px: 3,
    _hover: {
      bg: "#d5d9da",
      color: "black",
    },
  };

  const activeLinkStyle = ({ isActive }) =>
    isActive
      ? {
        backgroundColor: "#d5e4e6",
        color: "black",
      }
      : undefined;

  const menuSection = filterMenu([
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: MdDashboard,
    },

    {
      label: "HR Management",
      key: "users",
      icon: MdPeople,
      children: [
        { label: "Add Employee", path: "/hr-mgmt/add-employee", icon: MdPersonAdd },
        { label: "Employee List", path: "/hr-mgmt/view-employee-list", icon: MdPersonOutline, },
        { label: "Create Job Role", path: "/hr-mgmt/roles/add-job-role", icon: MdWorkOutline, },
        { label: "Create Department", path: "/hr-mgmt/dept/add-department", icon: MdApartment, },
        { label: "Upload Employee Expenses", path: "/hr-mgmt/upload-employee-expenses", icon: MdUploadFile },
        { label: "Employee Payment Hold", path: "/hr-mgmt/emp-payment-hold", icon: MdPauseCircleOutline },
        { label: "Upload Salary Slip", path: '/hr-mgmt/upload-emp-salary', icon: MdDescription, },
        { label: "Change Password", path: "/hr-mgmt/change-password", icon: MdLockOutline },
        { label: "Permission Management", path: "/hr-mgmt/permission-management", icon: MdLockOutline },
        { label: "Holiday Calendar", path: "/hr-mgmt/holiday-calendar", icon: MdEvent },
        { label: "Calendar List", path: "/hr-mgmt/yearly-holiday-calendar-list", icon: MdEventNote },
        { label: "Employee Penalty", path: "/misc/emp-penalty", icon: MdGavel },

      ],
    },

    {
      label: "Business Development",
      key: "business",
      icon: MdTrendingUp,
      children: [
        { label: "Create Team", path: "/business-development/create-team", icon: MdGroupAdd, },
        { label: "Create Sub Team", path: "/business-development/create-sub-team", icon: MdDeviceHub, },
        { label: "View Teams", path: "/business-development/view-teams", icon: MdSupervisorAccount, },
        { label: "Assign Task", path: "/misc/assign-task-to-employee", icon: MdAssignment },
        { label: "Assign Area", path: "/misc/assign-areas-to-employee", icon: MdMap },
        { label: "Assign Visit Target", path: "/business-development/view-visit-target", icon: MdPinDrop, },
        { label: "Assign Team Target", path: "/business-development/assign-target", icon: MdTrackChanges, },
        { label: "View Assigned Targets", path: "/business-development/view-assigned-targets", icon: MdListAlt, },
        { label: "View Individual Targets List", path: "/business-development/view-individual-target-list", icon: MdPersonPin, },
        { label: "View Employee Targets", path: "/business-development/view-employee-targets", icon: MdFlag, },

      ],
    },
    {
      label: "Distributor Argeement",
      key: "distributor",
      icon: MdAssignmentTurnedIn,
      children: [
        { label: "ON Boarding Ledger", path: "/distributor/onboarding-ledger", icon: MdMenuBook },
        { label: "Distributor List", path: "/distributor/distributorlist", icon: MdStorefront },
      ],

    },
    {
      label: "Accounting  Master",
      key: "accounting-master",
      icon: MdAccountBalance,
      children: [
        { label: "Create Group", path: "/accounting-master/create-group", icon: MdCreateNewFolder },
        { label: "View Group", path: "/accounting-master/view-group", icon: MdFolderOpen },
        { label: "Create Ledger", path: "/accounting-master/create-ledger", icon: MdNoteAdd },
        { label: "View Ledger", path: "/accounting-master/view-ledger", icon: MdLibraryBooks },
        { label: "Create Voucher", path: "/accounting-master/create-voucher", icon: MdPostAdd },
        { label: "View Voucher", path: "/accounting-master/view-voucher", icon: MdReceiptLong },
        { label: "Edit Ledger Assignment", path: "/accounting-master/edit-ledger-assignment", icon: MdEdit },
        { label: "Retail Assignment", path: "/accounting-master/retail-assignment", icon: MdAssignmentInd },
      ]
    },
    {
      label: "Comapny Master",
      key: "company-master",
      icon: MdBusiness,
      children: [
        { label: "Create Company", path: "/company-master/create-company", icon: MdAddBusiness },
        { label: "Company List", path: "/company-master/comapny-list", icon: MdDomain },
      ]
    },
    {
      label: "Inventory Master", key: "inventory", icon: MdInventory,
      children: [
        { label: "Add Crop", path: "/product-demo/crop/create-crop", icon: MdGrass },
        { label: "Create Stock Group", path: "/inventory/create-stock-group", icon: MdLibraryAdd },
        { label: "View Stock Group", path: "/inventory/view-stock-group", icon: MdViewList },
        { label: "Create Stock Category", path: "/inventory/create-stock-category", icon: MdCategory },
        { label: "View Stock Category", path: "/inventory/view-stock-category", icon: MdViewModule },
        { label: "Create Stock Item", path: "/inventory/create-stock-item", icon: MdAddBox },
        { label: "View Stock Item", path: "/inventory/view-stock-item", icon: MdInventory2 },
        { label: "Create Godown", path: "/inventory/create-godown", icon: MdWarehouse },
        { label: "View Godown", path: "/inventory/view-godown-list", icon: MdHomeWork },
        { label: "Create Unit of Measure", path: "/inventory/create-unitOfMeasure", icon: MdStraighten },
        { label: "View Unit of Measure ", path: "/inventory/unit-list", icon: MdSquareFoot },
        { label: "Material Manufacturing", path: "/inventory/material-manufacturing", icon: MdPrecisionManufacturing },
        { label: "Stock Transfer", path: "/inventory/stock-transfer", icon: MdSwapHoriz },
      ]
    },

    {
      label: "Order Vochor", key: "order-vochor", icon: MdShoppingCart,
      children: [
        { label: "Payment", path: "/order-vochor/payment", icon: MdPayments },
        { label: "Purchase", path: "/order-vochor/purchase", icon: MdShoppingBag },
        { label: "Sales", path: "/order-voucher/create-sales", icon: MdPointOfSale },
        { label: "Receipt", path: "/order-voucher/receipt-request", icon: MdReceipt },
        { label: "Credit", path: "/order-vochor/credit", icon: MdCreditCard },
        { label: "Debit", path: "/order-vochor/debit", icon: MdAccountBalanceWallet },
      ]
    },
    {
      label: "Transaction Master", key: "transaction-master", icon: MdCompareArrows,
      children: [
        { label: "Purchase", path: "/transaction-master/purchase", icon: MdShoppingBag },
        { label: "Payment", path: "/transaction-master/payment", icon: MdPayments },
        { label: "Sale", path: "/transaction-master/sale", icon: MdPointOfSale },
        { label: "Receipt", path: "/transaction-master/receipt", icon: MdReceipt },
        { label: "Credit Note", path: "/transaction-master/credit-note", icon: MdNoteAdd },
        { label: "Debit Note", path: "/transaction-master/debit-note", icon: MdRemoveCircleOutline },
        { label: "Contra", path: "/transaction-master/contra", icon: MdSyncAlt },
        { label: "Journal", path: "/transaction-master/journal", icon: MdBook },
      ]
    },

    {
      label: "Reports", key: "Reports", icon: MdAssessment, path: "/report",
      children: [
        { label: "Attendance Report", path: "/report/emp-attendance-report", icon: MdEventAvailable },
        { label: "Employee Visit Report", path: "/report/emp-visit-report", icon: MdFmdGood },
        { label: " Employee Expense Report", path: "/report/get-emp-expense-report", icon: MdReceiptLong },
        { label: "Daily Salary Report", path: "/report/emp-salary-report", icon: MdPayments },
        { label: "Monthly Salary Report", path: "/report/emp-monthly-salary-report", icon: MdDateRange },
        { label: "Track Employee", path: "/report/track-employee", icon: MdMyLocation },
        { label: "Party Ledger Report", path: "/report/party-ledger-report", icon: MdMenuBook },
        { label: "Party Transaction Report", path: "/report/party-transaction-report", icon: MdSyncAlt },
        { label: "Scheduling & Alert Report", path: "/report/scheduling-alert-report", icon: MdNotificationsActive },
        { label: "Credit Days Reminder Report", path: "/report/credit-days-reminder-report", icon: MdAlarm },
        { label: "Employee Balance Sheet", path: "/report/emp-balance-sheet", icon: MdAccountBalanceWallet },
        { label: "Interest Report", path: "/report/interest-report", icon: MdShowChart },
        { label: "Product Report", path: "/report/product-report", icon: MdCategory },
        { label: "Item Stock Report", path: "/report/item-stock-report", icon: MdInventory2 },
        { label: "Employee Distributor Details", path: "/report/emp-distributor-details", icon: MdSupervisedUserCircle },
        { label: "Super Cash Bill Report", path: "/report/supercash-bill-report", icon: MdAttachMoney },
        { label: "P & L Report", path: "/report/psl-report", icon: MdPieChart },
        { label: "Fright Report", path: "/report/fright-report", icon: MdLocalShipping },
        { label: "Transport Fright Report", path: "/report/transport-fright-report", icon: MdDirectionsBus },
        { label: "Item P & L Report", path: "/report/item-psl-report", icon: MdBarChart },
        { label: "Manufacturing Report", path: "/report/manufacturing-report", icon: MdFactory },
        { label: "Stock Transfer Report", path: "/report/stock-transfer-report", icon: MdSwapHoriz },
        { label: "Pending Collection Report", path: "/report/pending-collection-report", icon: MdPendingActions },
        { label: "Emp. Performance Report", path: "/report/emp-performance-report", icon: MdLeaderboard },
        // {label:"Digio KYC Report",path:"/report/emp-kyc-report",icon:MdTrendingUp},
      ]
    },
    {
      label: "Misc", key: "misc", icon: MdApps,
      children: [
        { label: "Activate/Deactivate Voucher", path: "/misc/voucher-action", icon: MdToggleOn },
        { label: "Define Retailer", path: "/misc/create-retailer", icon: MdAddBusiness },
        { label: "View Retailer", path: "/misc/view-retailers", icon: MdStorefront },
        { label: "Transaction Approval", path: "/misc/transaction-approval", icon: MdTaskAlt },
        { label: "Transaction Documents", path: "/misc/transaction-documents", icon: MdFolder },
        { label: "Product Demo", path: "/product-demo/demo-results", icon: MdPlayCircleOutline, },
        ...(canViewChat ? [{ label: "Team Chat", path: "/chat/monitor", icon: MdChat }] : []),
      ]
    },
    {
      label: "Print MGMT", key: "print_mgmt", icon: MdPrint,
      children: [
        { label: "Shipping label printer", path: "/print/mgmt/shipping_lable_printer", icon: MdQrCodeScanner },
        { label: "TruthFull Label Print", path: "/print/mgmt/truthful_labelprint", icon: MdLabel }
      ]
    },
    // {
    //   label:"Settings",path:"/settings",icon:RiSettings3Line,
    // },
  ], can);

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
            px={3} py={1}
            borderBottom="1px solid #eee"
            flexShrink={0}
          >
            <Image
              src={logo}
              alt="logo"
              w="140px"
              h="58px"
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
                      {...sidebarButtonStyle} fontWeight="700 !important"
                      onClick={onClose} fontSize="13px"
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
                      {...sidebarButtonStyle} fontSize="13px" fontWeight="700 !important"
                      bg={parentActive ? "#d7d8db" : "transparent"}
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
                              fontSize="12px"
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