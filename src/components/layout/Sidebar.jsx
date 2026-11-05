import { Box, VStack, Text, Button, Collapse, Icon, Image, useToast } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  MdDashboard,
  MdPeople,
  MdPersonAdd,
  MdPersonOutline,
  MdWorkOutline,
  MdApartment,
  MdAccountTree,
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
import logo from '../../assets/images/jamidaralogo_adminpannel.jpeg'
import { useState, useContext, useEffect, memo } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { FaRoute } from "react-icons/fa";
import { usePermissions } from "../../context/PermissionContext";
import { AuthContext } from "../../context/AuthContext";
import { filterMenu } from "../../routes/routePermission";
import { BsPass } from "react-icons/bs";


const Newsidebar = () => {
  const location = useLocation();
  const { auth, logoutUser } = useContext(AuthContext);
  const { can } = usePermissions();
  const role = auth?.user?.role;

  // const [openMenu, setOpenMenu] = useState(null);



  const toast = useToast();
  const navigate = useNavigate();

  const logout = () => {
    logoutUser();

    //  show toast
    toast({
      title: "Logged out",
      description: "You are logged out successfully",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    // Redirect after delay
    setTimeout(() => {
      navigate("/login")
    }, 1500)

  }

      const [canViewChat, setCanViewChat] = useState(false);
  useEffect(() => {
    let off = false;
    API.get(API_ENDPOINTS.chat_capabilities)
      .then((r) => { if (!off) setCanViewChat(!!r?.data?.data?.can_view_all); })
      .catch(() => {});
    return () => { off = true; };
  }, []);

  // ── UI: top-level, non-collapsible items (e.g. Dashboard) ──
  const labelBtnStyle = {
    variant: "ghost",
    justifyContent: "flex-start",
    fontWeight: "600",
    fontSize: "13.5px",
    color: "#334155",
    borderRadius: "10px",
    height: "40px",
    transition: "background 0.15s ease, color 0.15s ease",
    _hover: {
      bg: "#F1F5F9",
    },
  };

  // ── UI: parent section buttons + collapsible children ──
  const sidebarButtonStyle = {
    variant: "ghost",
    justifyContent: "flex-start",
    fontWeight: "500",
    color: "#334155",
    fontSize: "13.5px",
    borderRadius: "10px",
    transition: "background 0.15s ease, color 0.15s ease",
    _hover: {
      bg: "#F1F5F9",
    },
    marginTop: "1px",
    marginBottom: "1px",
    height: "38px",
  };

  // ── UI: active state — soft tint + left accent bar instead of bold text ──
  const ACCENT = "#2f6a8a";

  const activeStyle = {
    background: "#EFF4FF",
    color: ACCENT,
    fontWeight: "600",
    borderRadius: "10px",
    boxShadow: `inset 3px 0 0 0 ${ACCENT}`,
  };

  const activeLinkStyle = ({ isActive }) =>
    isActive ? activeStyle : undefined;

  const menuSections = filterMenu([
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
        { label: "Permission Management", path: "/hr-mgmt/permission-management", icon: BsPass },
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
        {label: "Assign Task", path: "/misc/assign-task-to-employee", icon: MdAssignment},
        {label: "Assign Area", path: "/misc/assign-areas-to-employee", icon: MdMap},
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
      
        { label: "Product Demo", path: "/product-demo/demo-results", icon: MdPlayCircleOutline,},
        { label: "Beat Plan", path: "/misc/beatPlan", icon: FaRoute,},
       
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

  const [openMenu, setOpenMenu] = useState(() => {
    // Lazy initializer — runs once, synchronously, on mount/remount,
    // so the correct section is already open on the very first paint.
    // No flash of "closed" before the effect corrects it.
    const activeParent = menuSections.find(
      (menu) =>
        menu.children &&
        menu.children.some((child) => location.pathname.startsWith(child.path))
    );
    return activeParent ? activeParent.key : null;
  });

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  useEffect(() => {
    // Derive the active parent directly from menuSections' own child paths
    // instead of a separately maintained map. This can never drift out of
    // sync, and it works even where route spellings are inconsistent
    // (e.g. "/order-vochor" vs "/order-voucher").
    const activeParent = menuSections.find(
      (menu) =>
        menu.children &&
        menu.children.some((child) => location.pathname.startsWith(child.path))
    );

    if (activeParent) {
      setOpenMenu(activeParent.key);
    }
    // If nothing matches (e.g. Dashboard), leave openMenu as-is so a
    // manually opened section doesn't get force-closed.
  }, [location.pathname]);

  return (
    <Box
      top="0"
      left="0"
      w="280px"
      bg="#FFFFFF"
      color="#334155"
      position="fixed"
      borderRight="1px solid #EDF0F3"
      overflowY="auto"
      h="100vh"
      sx={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      {/* Logo */}
      <Box
        borderBottom="1px solid #EDF0F3"
        bg="#FFFFFF"
        position="fixed"
        zIndex="9999"
        w="280px"
        h="72px"
        display="flex"
        alignItems="center"
      >
        <Link to="/dashboard">  <Image src={logo} alt="Company Logo" h="68px" pl="2rem" loading="eager" fetchpriority="high" /></Link>
      </Box>

      <VStack spacing={0} align="stretch" mt="72px" pt={3} px={3} pb={4}>
        {menuSections.map((menu, index) => {
          const IconComponent = menu.icon;

          // NORMAL MENU
          if (!menu.children) {
            return (
              <Button
                key={index}
                leftIcon={<IconComponent size={18} />}
                as={NavLink}
                to={menu.path}
                {...labelBtnStyle}
                style={activeLinkStyle}
                mb={2}
              >
                {menu.label}
              </Button>
            );
          }

          //  CHECK IF ANY CHILD ROUTE IS ACTIVE
          const parentActive = menu.children.some((child) =>
            location.pathname.startsWith(child.path)
          );

          const isOpen = openMenu === menu.key;

          return (
            <Box key={index} mb="1px">
              <Button
                w="100%"
                leftIcon={
                  <IconComponent
                    size={17}
                    color={parentActive ? ACCENT : "#64748B"}
                  />
                }
                rightIcon={
                  <Icon
                    as={isOpen ? ChevronDownIcon : ChevronRightIcon}
                    color={parentActive ? ACCENT : "#94A3B8"}
                    boxSize={4}
                  />
                }
                {...sidebarButtonStyle}
                onClick={() => toggleMenu(menu.key)}
                style={parentActive ? activeStyle : undefined}
              >
                {menu.label}
              </Button>

              <Collapse in={isOpen}>
                <VStack
                  align="stretch"
                  spacing="1px"
                  mt={1}
                  mb={1}
                  pl={4}
                  ml="17px"
                  borderLeft="1px solid #E7EAEE"
                >
                  {menu.children.map((item, i) => {
                    const ChildIcon = item.icon;
                    return (
                      <Button
                        key={i}
                        leftIcon={<ChildIcon size={15} />}
                        size="sm"
                        as={NavLink}
                        to={item.path}
                        {...sidebarButtonStyle}
                        style={activeLinkStyle}
                        height="34px"
                        fontSize="12.5px"
                        fontWeight="500"
                        color="#64748B"
                        overflowX="auto"
                        sx={{
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                          "&::-webkit-scrollbar": {
                            display: "none",
                          },
                        }}
                      >
                        {item.label}
                      </Button>
                    );
                  })}
                </VStack>
              </Collapse>
            </Box>
          );
        })}

        <Button
          rightIcon={<FiLogOut size={16} />}
          variant="ghost"
          justifyContent="flex-start"
          fontWeight="600"
          fontSize="13.5px"
          height="40px"
          borderRadius="10px"
          color="#B91C1C"
          mt={3}
          className="logout_btn"
          onClick={logout}
          _hover={{ bg: "#FEF2F2" }}
        >
          Logout
        </Button>
      </VStack>

    </Box>
  );
};

export default memo(Newsidebar);