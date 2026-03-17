import {Box,VStack,Text,Button,Collapse,Icon, Image } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon,IconButton } from "@chakra-ui/icons";
import { AuthContext } from "../../context/AuthContext";
import { HiUserGroup } from "react-icons/hi";
import { MdAssignmentInd, MdOutlineTrackChanges } from "react-icons/md";
import { MdPeople, MdReceiptLong, MdAssessment, MdLocalShipping, MdDirectionsBus, MdFactory, MdSwapHoriz, MdPendingActions, MdTrendingUp } from "react-icons/md";
import { FaUserTie } from 'react-icons/fa';
import { FaBullseye } from "react-icons/fa";
import { MdCorporateFare, MdGroupAdd } from "react-icons/md";
import { HiOfficeBuilding ,HiOutlineDocumentReport} from "react-icons/hi";
import { FaChartLine } from "react-icons/fa";
import { FaUser, FaUserPlus } from "react-icons/fa";
import { MdInventory, MdAddBox, MdViewList, MdDelete } from "react-icons/md";
import { MdCategory } from "react-icons/md";
import { MdAddCircleOutline,MdAccountTree   } from "react-icons/md";
import { FaFileInvoice } from "react-icons/fa";
import { FiMapPin,FiKey,FiLock  } from "react-icons/fi";
import { FaClipboardList,FaCalculator,FaWallet,FaList,FaTrash,FaFileInvoiceDollar,FaBookOpen,FaMoneyCheckAlt} from "react-icons/fa";
  import { FaEdit,FaStore } from "react-icons/fa";
  import { Receipt,CalendarCheck,BellRing,Handshake,BookText,Clock,FileSpreadsheet,BarChart3 } from "lucide-react";
  import { HiOutlinePrinter } from "react-icons/hi";
  import { Printer, Barcode } from "lucide-react";
import {RiDashboardLine,RiUserAddLine,RiUser3Line,RiFileList3Line,RiBarChartLine,RiSettings3Line,} from "react-icons/ri";
import { UserCheck,DollarSign,Package } from "lucide-react";
import { BsUpcScan } from "react-icons/bs";
import { Ticket } from "lucide-react";
import { BsCreditCard2Front } from "react-icons/bs";
import { BiPurchaseTagAlt } from "react-icons/bi";
import { FaMoneyBillWave } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { FaReceipt } from "react-icons/fa";
import logo from '../../assets/images/jamidaralogo_adminpannel.jpeg'
import { useState, useContext, useEffect ,memo } from "react";
import { NavLink, useLocation } from "react-router-dom";



const Newsidebar = () => {
  const location = useLocation();
  const { auth } = useContext(AuthContext);
  const role = auth?.user?.role;

  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const sidebarButtonStyle = {
    variant: "ghost",
    justifyContent: "flex-start",
    fontWeight: "700",
    color: "#333333",
    _hover: {
      bg: "gray.100",
      borderRadius: "28px",
    },
    height: "39px",
  };

  const activeStyle = {
    background: "#f3f4f6",
    borderRadius: "28px" ,
    fontWeight: "bold",
  };

  const activeLinkStyle = ({ isActive }) =>
    isActive ? activeStyle : undefined;

  const menuSections = [
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
        {label: "Add Employee", path: "/hr-mgmt/add-employee",icon: FaUserPlus},
        {label:"Change Password",path:"/hr-mgmt/change-password",icon:FiLock },
        {label: "Employee List", path: "/hr-mgmt/view-employee-list",icon: RiUser3Line,},
        {label: "Create Job Role", path: "/hr-mgmt/roles/add-job-role",icon: HiUserGroup,},
        {label: "Create Department",path: "/hr-mgmt/dept/add-department",icon: MdAccountTree,},
        {label:"Upload Salary Slip",path:'/hr-mgmt/upload-emp-salary',icon: RiFileList3Line,},
       

      ],},

    {
      label: "Business Development",
      key: "business",
      icon: FaChartLine,
      children: [
        {label: "Create Team",path: "/Business-dev/create-team",icon: FaUserPlus, },
        {label: "Create Sub Team",path: "/Business-devt/create-sub-team",icon: HiUserGroup,},
        { label: "Assign Target RSM", path: "/Business-devt/assign-target-rsm",  icon: MdAssignmentInd,},
        {label:"Assign Target TSM", path:"/Business-devt/assign-target-tsm",icon:FaUserTie,},
        {label:"Assign Target SM",path:"/Business-devt/assign-target-sm",icon:FaBullseye,},
        {label:"Assign Target FA", path:"/Business-devt/assign-target-fa",icon:UserCheck ,}
      ],
    },
    {
      label: "Accounting  Master",
      key: "accounting-master",
      icon: FaWallet,
      children: [
        {label:"Create Group", path:"/accounting-master/create-group",icon:MdGroupAdd},
        {label:"View Group",path:"/accounting-master/view-group",icon:FaList},
        {label:"Delete Group",path:"/accounting-master/delete-group",icon:FaTrash},
        {label:"Create Ledger",path:"/accounting-master/create-ledger", icon:FaFileInvoiceDollar},
        {label:"View Ledger",path:"/accounting-master/view-ledger", icon:FaFileInvoice},
        {label:"Delete Ledger",path:"/accounting-master/delete-ledger", icon:FaTrash},
        {label:"Create Voucher",path:"/accounting-master/create-voucher", icon:FaMoneyCheckAlt},
        {label:"View Voucher", path:"/accounting-master/view-voucher", icon:FaFileInvoice },
        {label:"Delete Voucher",path:"/accounting-master/delete-voucher", icon:FaTrash},
        {label:"Edit Ledger Assignment",path:"/accounting-master/edit-ledger-assignment",  icon:FaEdit },
        {label:"Retail Assignment" ,path:"/accounting-master/retail-assignment", icon:FaStore },
      ] },
      {
          label: "Comapny Master",
      key: "company-master",
      icon: MdCorporateFare,
      children: [
        {label:"Create Company",path:"/company-master/create-company",icon:HiOfficeBuilding},
         

      ]
      },
      
      {
          label:"Reports",key:"Reports",icon:RiBarChartLine,path:"/report",
          children:[
            {label:"Attendance Report",path:"/report/emp-attendance-report",icon:CalendarCheck},
            {label:"Scheduling & Alert Report",path:"/report/scheduling-alert-report",icon:BellRing },
            {label:"Party Transaction Report",path:"/report/party-transaction-report",icon:Handshake},
            {label:"Get Employee Expense Report",path:"/report/get-emp-expense-report",icon:Receipt},
            {label:"Party Ledger Report",path:"/report/party-ledger-report",icon:BookText},
            {label:"Credit Days Reminder Report",path:"/report/credit-days-reminder-report",icon:Clock},
            {label:"Employee Balance Sheet",path:"/report/emp-balance-sheet",icon:FileSpreadsheet},
            {label:"Interest Report",path:"/report/interest-report",icon:BarChart3},
            {label:"Salary Report",path:"/report/emp-salary-report",icon:DollarSign},
            {label:"Product Report",path:"/report/product-report",icon:Package},
            {label:"Item Stock Report",path:"/report/item-stock-report",icon:Package},
            {label:"Track Employee",path:"/report/track-employee",icon:FiMapPin},
            {label:"Employee Visit Report",path:"/report/emp-visit-report",icon:HiOutlineDocumentReport},
            {label:"Employee Distributor Details",path:"/report/emp-distributor-details",icon:MdPeople},
            {label:"Super Cash Bill Report",path:"/report/supercash-bill-report",icon:MdReceiptLong},
            {label:"P & L Report",path:"/report/psl-report",icon:MdAssessment},
            {label:"Fright Report",path:"/report/fright-report",icon:MdLocalShipping},
            {label:"Transport Fright Report",path:"/report/transport-fright-report",icon:MdDirectionsBus},
            {label:"Item P & L Report",path:"/report/item-psl-report",icon:MdInventory},
            {label:"manufacturing Report",path:"/report/manufacturing-report",icon:MdFactory},
            {label:"Stock Transfer Report",path:"/report/stock-transfer-report",icon:MdSwapHoriz},
            {label:"Pending Collection Report",path:"/report/pending-collection-report",icon:MdPendingActions},
            {label:"Employee Performance Report",path:"/report/emp-performance-report",icon:MdTrendingUp},
          ]
      },{
        label:"Inventory Master",key:"inventory",icon:MdInventory,
        children:[
          {label:"Create Stock Group",path:"/inventory/create-stock-group",icon:MdAddBox},
          {label:"View Stock Group",path:"/inventory/view-stock-group",icon:MdViewList},
          {label:"Delete Stock Group",path:"/inventory/delete-stock-group",icon:MdDelete},
          {label:"Create Stock Category",path:"/inventory/create-stock-category",icon:MdCategory},
          {label:"View Stock Category",path:"/inventory/view-stock-category",icon:MdAddCircleOutline},
         
        ]
      },{
        label:"Order Vochor",key:"order-vochor",icon:FaFileInvoice,
         children:[
          {label:"Payment",path:"/order-vochor/payment",icon:FiMapPin},
          {label:"Purchase",path:"/order-vochor/purchase",icon:BiPurchaseTagAlt},
          {label:"Sales",path:"/order-vochor/sales",icon:FaShoppingCart},
          {label:"Receipt",path:"/order-vochor/receipt",icon:FaReceipt},
          {label:"Credit",path:"/order-vochor/credit",icon:BsCreditCard2Front},
          {label:"Debit",path:"/order-vochor/debit",icon:FaMoneyBillWave},
         ]
      },{
        label:"Print MGMT",key:"print_mgmt",icon:HiOutlinePrinter,
        children:[
          {label:"Shipping label printer",path:"/print/mgmt/shipping_lable_printer",icon:BsUpcScan},
          {label:"TruthFull Label Print",path:"/print/mgmt/truthful_labelprint",icon:Ticket}
        ]},{
          label:"Settings",path:"/settings",icon:RiSettings3Line,
        },
  ];

useEffect(() => {
  const path = location.pathname;

  const menuMap = {
    "/hr-mgmt": "users",
    "/Business-dev": "business",
    "/Business-devt": "business",
    "/accounting-master": "accounting-master",
    "/company-master": "company-master",
    "/leads": "leads",
    "/report":"Reports",
    "/inventory": "inventory",
    "/order-vochor": "order-vochor",
    "/print/mgmt": "print_mgmt"
  };

  for (const route in menuMap) {
    if (path.startsWith(route)) {
      setOpenMenu(menuMap[route]);
      break;
    }
  }

}, [location.pathname]);

  return (
    <Box
      w="280px"
      bg="#FFFFFF"
      color="#333333"
     
  borderRight="1px solid #e5e7eb"
    borderColor="gray.200"
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
      <Box borderBottom="1px solid #e5e7eb" bg="#FFFF" position="fixed" zIndex="9999" w="100%" >
        <Image src={logo} alt="Company Logo" h="74px" w="224px" pl='2.5rem'/>
      </Box>

      <VStack spacing={2} align="stretch" mt="75px"  p={4}>
        {menuSections.map((menu, index) => {
          const IconComponent = menu.icon;

          // NORMAL MENU
          if (!menu.children) {
            return (
              <Button
                key={index}
                leftIcon={<IconComponent />}
                as={NavLink}
                to={menu.path}
                {...sidebarButtonStyle}
                style={activeLinkStyle}
              >
                {menu.label}
              </Button>
            );
          }

          //  CHECK IF ANY CHILD ROUTE IS ACTIVE
          const parentActive = menu.children.some((child) =>
            location.pathname.startsWith(child.path)
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
                {...sidebarButtonStyle}
                onClick={() => toggleMenu(menu.key)}
                style={parentActive ? activeStyle : undefined} // ⭐ APPLY STYLE
              >
                {menu.label}
              </Button>

              <Collapse in={openMenu === menu.key}>
                <VStack pl={6} align="stretch" spacing={1} mt={3}>
                  {menu.children.map((item, i) => {
                    const ChildIcon = item.icon;
                    return (
                      <Button
                        key={i}
                        leftIcon={<ChildIcon size={17}/>}
                        size="sm"
                        as={NavLink}
                        to={item.path}
                        {...sidebarButtonStyle}
                        style={activeLinkStyle}
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

       
{/* ip request  */}
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

export default memo(Newsidebar);



