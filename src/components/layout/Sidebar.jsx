import {Box,VStack,Text,Button,Collapse,Icon, Image, useToast } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { AuthContext } from "../../context/AuthContext";
import { HiUserGroup } from "react-icons/hi";
import { MdAssignmentInd, MdAttractions, MdOutlineAssignmentReturn, MdOutlineInventory2, MdOutlineTrackChanges, MdPayment } from "react-icons/md";
import { MdPeople, MdReceiptLong, MdAssessment, MdLocalShipping, MdDirectionsBus, MdFactory, MdSwapHoriz, MdPendingActions, MdTrendingUp } from "react-icons/md";
import { FaExchangeAlt, FaListAlt, FaMoneyBill, FaTable, FaUserAlt, FaUserCheck, FaUserTie, FaWarehouse } from 'react-icons/fa';
import { FaBullseye } from "react-icons/fa";
import { MdCorporateFare, MdGroupAdd } from "react-icons/md";
import { HiOfficeBuilding ,HiOutlineDocumentReport} from "react-icons/hi";
import { FaChartLine } from "react-icons/fa";
import { FaUser, FaUserPlus } from "react-icons/fa";
import { MdInventory, MdAddBox, MdViewList, MdDelete } from "react-icons/md";
import { MdCategory } from "react-icons/md";
import { MdAddCircleOutline,MdAccountTree   } from "react-icons/md";
import { FaFileInvoice } from "react-icons/fa";
import { FiMapPin, FiTarget } from "react-icons/fi";
import { FaProjectDiagram } from "react-icons/fa";
import { FaClipboardList,FaCalculator,FaWallet,FaList,FaTrash,FaFileInvoiceDollar,FaBookOpen,FaMoneyCheckAlt} from "react-icons/fa";
  import { FaEdit,FaStore } from "react-icons/fa";
  import { Receipt,CalendarCheck,BellRing,Handshake,BookText,Clock,FileSpreadsheet,BarChart3, User2 } from "lucide-react";
  import { HiOutlinePrinter } from "react-icons/hi";
  import { Printer, Barcode } from "lucide-react";
import {RiDashboardLine,RiUserAddLine,RiUser3Line,RiFileList3Line,RiBarChartLine,RiSettings3Line, RiTeamFill,} from "react-icons/ri";
import { UserCheck,DollarSign,Package } from "lucide-react";
import { BsBank, BsJournalBookmarkFill, BsUpcScan } from "react-icons/bs";
import { Ticket } from "lucide-react";
import { BsCreditCard2Front } from "react-icons/bs";
import { BiPurchaseTagAlt, BiSolidPurchaseTag, BiSolidReport } from "react-icons/bi";
import { FaMoneyBillWave } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { FaReceipt } from "react-icons/fa";
import { FaCity } from "react-icons/fa";
import logo from '../../assets/images/jamidaralogo_adminpannel.jpeg'
import { useState, useContext, useEffect ,memo } from "react";
import { NavLink, useLocation,useNavigate} from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { MdUploadFile } from "react-icons/md";
import { FaKey } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { RxComponent1 } from "react-icons/rx";
import { IoBarChart, IoCreate, IoReceipt } from "react-icons/io5";
import { IoMdPersonAdd } from "react-icons/io";
import { LuPanelRightClose, LuPanelRightOpen } from "react-icons/lu";


const Newsidebar = () => {
  const location = useLocation();
  const { auth, logoutUser } = useContext(AuthContext);
  const role = auth?.user?.role;

  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const toast = useToast();
  const navigate = useNavigate();
  
  const logout = () =>{
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
     setTimeout(()=>{
       navigate("/login")
     },1500)
 
  }

  const sidebarButtonStyle = {
    variant: "ghost",
    justifyContent: "flex-start",
    fontWeight: "600",
    color: "#29404a",
    fontSize: "13.5px",
    transition: "all 0.3s ease", 
    paddingLeft: "21px !important",
    

    _hover: {
      bg: "gray.100",
      borderRadius: "28px",
      transform: "translateX(5px)"

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
        {label: "Employee List", path: "/hr-mgmt/view-employee-list",icon: RiUser3Line,},
        {label: "Create Job Role", path: "/hr-mgmt/roles/add-job-role",icon: HiUserGroup,},
        {label: "Create Department",path: "/hr-mgmt/dept/add-department",icon: MdAccountTree,},
        {label: "Upload Employee Expenses", path: "/hr-mgmt/upload-employee-expenses", icon: MdUploadFile },
        {label:"Upload Salary Slip",path:'/hr-mgmt/upload-emp-salary',icon: RiFileList3Line,},
       {label:"Change Password", path:"/hr-mgmt/change-password", icon:FaKey}

      ],},

    {
      label: "Business Development",
      key: "business",
      icon: FaChartLine,
      children: [
        {label: "Create Team",path: "/business-development/create-team",icon: FaUserPlus, },
        {label: "Create Sub Team",path: "/business-development/create-sub-team",icon: HiUserGroup,},
        { label: "Assign Team Target", path: "/business-development/assign-target",  icon: MdAssignmentInd,},
        { label: "Assign Visit Target", path: "/business-development/view-visit-target",  icon: MdAssignmentInd,},
        { label: "View Teams", path: "/business-development/view-teams",  icon: RiTeamFill ,},
        { label: "View Assigned Targets", path: "/business-development/view-assigned-targets",  icon: FiTarget  ,},
        { label: "View Employee Targets", path: "/business-development/view-employee-targets",  icon: FaUserAlt   ,},

      ],
    },
    {   label: "Distributor Argeement",
      key: "distributor",
      icon: FaProjectDiagram,
       children: [
              {label:"ON Boarding Ledger",path:"/distributor/onboarding-ledger", icon:FaBookOpen},
              {label: "Distributor List", path: "/distributor/distributorlist", icon: FaUsers },
      ],
      
    },
    {
      label: "Accounting  Master",
      key: "accounting-master",
      icon: FaWallet,
      children: [
        {label:"Create Group", path:"/accounting-master/create-group",icon:MdGroupAdd},
        {label:"View Group",path:"/accounting-master/view-group",icon:FaList},
        {label:"Create Ledger",path:"/accounting-master/create-ledger", icon:FaFileInvoiceDollar},
        {label:"View Ledger",path:"/accounting-master/view-ledger", icon:FaFileInvoice},
        {label:"Create Voucher",path:"/accounting-master/create-voucher", icon:FaMoneyCheckAlt},
        {label:"View Voucher", path:"/accounting-master/view-voucher", icon:FaFileInvoice },
        {label:"Edit Ledger Assignment",path:"/accounting-master/edit-ledger-assignment",  icon:FaEdit },
        {label:"Retail Assignment" ,path:"/accounting-master/retail-assignment", icon:FaStore },
      ] },
      {
          label: "Comapny Master",
      key: "company-master",
      icon: MdCorporateFare,
      children: [
        {label:"Create Company",path:"/company-master/create-company",icon:HiOfficeBuilding},
        {label:"Company List",path:"/company-master/comapny-list",icon:FaCity},        
      ]
      },
            {
        label:"Inventory Master",key:"inventory",icon:MdInventory,
        children:[
          {label:"Create Stock Group",path:"/inventory/create-stock-group",icon:MdAddBox},
          {label:"View Stock Group",path:"/inventory/view-stock-group",icon:MdViewList},
          {label:"Create Stock Category",path:"/inventory/create-stock-category",icon:MdCategory},
          {label:"View Stock Category",path:"/inventory/view-stock-category",icon:MdAddCircleOutline},
          {label:"Create Stock Item",path:"/inventory/create-stock-item",icon:MdOutlineInventory2  },
          {label:"View Stock Item",path:"/inventory/view-stock-item",icon:MdOutlineInventory2  },
          {label:"Create Godown",path:"/inventory/create-godown",icon:FaWarehouse},
          {label:"View Godown",path:"/inventory/view-godown-list",icon:FaListAlt  },
          {label:"Create Unit of Measure",path:"/inventory/create-unitOfMeasure",icon:RxComponent1  },
          {label:"View Unit of Measure ",path:"/inventory/unit-list",icon:FaTable   },
          {label:"Material Manufacturing",path:"/inventory/material-manufacturing",icon:MdAddCircleOutline   },
          {label:"Stock Transfer",path:"/inventory/stock-transfer",icon:FaCity   },
        ]
      },
      
    {
        label:"Order Vochor",key:"order-vochor",icon:FaFileInvoice,
         children:[
          {label:"Payment",path:"/order-vochor/payment",icon:FiMapPin},
          {label:"Purchase",path:"/order-vochor/purchase",icon:BiPurchaseTagAlt},
          {label:"Sales",path:"/order-voucher/create-sales",icon:FaShoppingCart},
          {label:"Receipt",path:"/order-vochor/receipt",icon:FaReceipt},
          {label:"Credit",path:"/order-vochor/credit",icon:BsCreditCard2Front},
          {label:"Debit",path:"/order-vochor/debit",icon:FaMoneyBillWave},
         ]
      },
      {
        label: "Transaction Master", key: "transaction-master", icon: FaExchangeAlt,
        children: [
          {label: "Purchase", path: "/transaction-master/purchase" , icon: BiSolidPurchaseTag},
          {label: "Payment", path: "/transaction-master/payment" , icon: MdPayment},
          {label: "Sale", path: "/transaction-master/sale" , icon: IoBarChart },
          {label: "Receipt", path: "/transaction-master/receipt" , icon: IoReceipt },
          {label: "Credit Note", path: "/transaction-master/credit-note" , icon: LuPanelRightOpen   },
          {label: "Debit Note", path: "/transaction-master/debit-note" , icon: LuPanelRightClose   },
          {label: "Contra", path: "/transaction-master/contra" , icon: BsBank  },
          {label: "Journal", path: "/transaction-master/journal" , icon: BsJournalBookmarkFill  },
        ]
      },
     
         {
          label:"Reports",key:"Reports",icon:BiSolidReport ,path:"/report",
          children:[
            {label:"Attendance Report",path:"/report/emp-attendance-report",icon:CalendarCheck},
            {label:"Employee Visit Report",path:"/report/emp-visit-report",icon:HiOutlineDocumentReport},
            {label:" Employee Expense Report",path:"/report/get-emp-expense-report",icon:Receipt},
            {label:"Daily Salary Report",path:"/report/emp-salary-report",icon:DollarSign},
            {label:"Monthly Salary Report",path:"/report/emp-monthly-salary-report",icon:DollarSign},
            {label:"Track Employee",path:"/report/track-employee",icon:FiMapPin},
            {label:"Party Ledger Report",path:"/report/party-ledger-report",icon:BookText},
            {label:"Party Transaction Report",path:"/report/party-transaction-report",icon:Handshake},
            {label:"Scheduling & Alert Report",path:"/report/scheduling-alert-report",icon:BellRing },
            {label:"Credit Days Reminder Report",path:"/report/credit-days-reminder-report",icon:Clock},
            {label:"Employee Balance Sheet",path:"/report/emp-balance-sheet",icon:FileSpreadsheet},
            {label:"Interest Report",path:"/report/interest-report",icon:BarChart3},
            {label:"Product Report",path:"/report/product-report",icon:Package},
            {label:"Item Stock Report",path:"/report/item-stock-report",icon:Package},
            {label:"Employee Distributor Details",path:"/report/emp-distributor-details",icon:MdPeople},
            {label:"Super Cash Bill Report",path:"/report/supercash-bill-report",icon:MdReceiptLong},
            {label:"P & L Report",path:"/report/psl-report",icon:MdAssessment},
            {label:"Fright Report",path:"/report/fright-report",icon:MdLocalShipping},
            {label:"Transport Fright Report",path:"/report/transport-fright-report",icon:MdDirectionsBus},
            {label:"Item P & L Report",path:"/report/item-psl-report",icon:MdInventory},
            {label:"Manufacturing Report",path:"/report/manufacturing-report",icon:MdFactory},
            {label:"Stock Transfer Report",path:"/report/stock-transfer-report",icon:MdSwapHoriz},
            {label:"Pending Collection Report",path:"/report/pending-collection-report",icon:MdPendingActions},
            {label:"Emp. Performance Report",path:"/report/emp-performance-report",icon:MdTrendingUp},
            // {label:"Digio KYC Report",path:"/report/emp-kyc-report",icon:MdTrendingUp},
          ]
      },
      {
        label:"Misc",key:"misc",icon:MdAttractions ,
         children:[
          {label:"Activate/Deactivate Voucher",path:"/misc/voucher-action",icon:FaMoneyBill  },      
          {label:"Define Retailer",path:"/misc/create-retailer",icon:IoMdPersonAdd   },      
          {label:"View Retailer",path:"/misc/view-retailers",icon:IoCreate  },      
          {label:"Transaction Approval",path:"/misc/transaction-approval",icon:FaUserCheck  },      
         ]
      },
      {
        label:"Print MGMT",key:"print_mgmt",icon:HiOutlinePrinter,
        children:[
          {label:"Shipping label printer",path:"/print/mgmt/shipping_lable_printer",icon:BsUpcScan},
          {label:"TruthFull Label Print",path:"/print/mgmt/truthful_labelprint",icon:Ticket}
        ]},
        // {
        //   label:"Settings",path:"/settings",icon:RiSettings3Line,
        // },
  ];

useEffect(() => {
  const path = location.pathname;

  const menuMap = {
    "/hr-mgmt": "users",
    "/business-development": "business",
    "/business-developmentelopment": "business",
    "/distributor":"distributor",
    "/accounting-master": "accounting-master",
    "/company-master": "company-master",
    "/leads": "leads",
    "/inventory": "inventory",
    "/order-vochor": "order-vochor",
    "/report":"Reports",
    "/misc": "misc",
    "/print/mgmt": "print_mgmt",
    
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

  top="0"
  left="0"

      w="280px"
      bg="#FFFFFF"
      color="#333333"
     position="fixed"

     

  borderRight="1px solid #e5e7eb"
    borderColor="gray.300"
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
        <Image src={logo} alt="Company Logo" h="74px" w="224px" pl='2.5rem'  loading="eager" fetchpriority="high"/>
      </Box> 

      <VStack spacing={2} align="stretch" mt="75px" pt={4}>
        {menuSections.map((menu, index) => {
          const IconComponent = menu.icon;

          // NORMAL MENU
          if (!menu.children) {
            return (
              <Button
              w="92%"
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
              w="92%"
                leftIcon={<IconComponent color="#526869" />}
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
                style={parentActive ? activeStyle : undefined} //  APPLY STYLE
              >
                {menu.label}
              </Button>

              <Collapse in={openMenu === menu.key}>
                <VStack pl={6} align="stretch" spacing={1} mt={3}>
                  {menu.children.map((item, i) => {
                    const ChildIcon = item.icon;
                    return (
                      <Button
                      w="92%"
                        key={i}
                       
                        leftIcon={<ChildIcon size={17} color="#526869"/>}
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
        {/* {(role === "ADMIN" || role === "SUPER_ADMIN") && (
          <Button
          w="100%"
            leftIcon={<RiUserAddLine />}
            {...sidebarButtonStyle}
            as={NavLink}
            to="/approve-ip-user-list"
            style={activeLinkStyle}
          >
            IP Request
          </Button>
        )} */}
      <Button
         rightIcon={<FiLogOut/>}
         variant="ghost"
         size="md"   className="logout_btn"
         onClick={logout}
        
         _hover={{bgColor:"#f4bfbf", border:"1px solid #e48f8f", color:"#971345"}}
      >
        Logout
      </Button>
          </VStack>

    </Box>
  );
};

export default memo(Newsidebar);



