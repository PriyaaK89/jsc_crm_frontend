import {Box,VStack,Text,Button,Collapse,Icon, Image } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { AuthContext } from "../../context/AuthContext";
import { HiUserGroup } from "react-icons/hi";
import { MdAssignmentInd } from "react-icons/md";
import { FaUserTie } from 'react-icons/fa';
import { FaBullseye } from "react-icons/fa";
import { MdCorporateFare, MdGroupAdd } from "react-icons/md";
import { HiOfficeBuilding } from "react-icons/hi";
import { FaChartLine } from "react-icons/fa";
import { FaUser, FaUserPlus } from "react-icons/fa";
import { MdInventory, MdAddBox, MdViewList, MdDelete } from "react-icons/md";
import { MdCategory } from "react-icons/md";
import { MdAddCircleOutline,MdAccountTree   } from "react-icons/md";
import { FaFileInvoice } from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";
import { FaClipboardList,FaCalculator,FaWallet,FaList,FaTrash,FaFileInvoiceDollar,FaBookOpen,FaMoneyCheckAlt} from "react-icons/fa";
  import { FaEdit,FaStore } from "react-icons/fa";
  import { Receipt,CalendarCheck  } from "lucide-react";
  import { HiOutlinePrinter } from "react-icons/hi";
  import { Printer, Barcode } from "lucide-react";
import {RiDashboardLine,RiUserAddLine,RiUser3Line,RiFileList3Line,RiBarChartLine,RiSettings3Line,} from "react-icons/ri";
import { UserCheck } from "lucide-react";
import { BsUpcScan } from "react-icons/bs";
import { Ticket } from "lucide-react";
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
        {label: "Employee List", path: "/hr-mgmt/view-employee-list",icon: RiUser3Line,},
        {label: "Create Job Role", path: "/hr-mgmt/roles/add-job-role",icon: HiUserGroup,},
        {label: "Create Department",path: "/hr-mgmt/dept/add-department",icon: MdAccountTree,},
        {label:"Upload Salary Slip",path:'/hr-mgmt/upload-emp-salary',icon: RiFileList3Line,}
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
        {label:"Create Voucher",path:"/accounting-master/create-vouche", icon:FaMoneyCheckAlt},
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
        label:"Leads",key:"leads",icon:RiUser3Line,
        children:[
          {label:"New Lead",path:"/leads/new",icon:RiUserAddLine},
          {label:"Lead List",path:"/leads/list",icon:RiFileList3Line}
        ]
      },{
          label:"Reports",key:"Reports",icon:RiBarChartLine,path:"/reports"
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
              
          {label:"Payment",path:"/order-vochor/paymen",icon:FiMapPin}
         ]
      },{
        label:"Print MGMT",key:"print_mgmt",icon:HiOutlinePrinter,
        children:[
          {label:"Shipping label printer",path:"/print/mgmt/shipping_lable_printer",icon:BsUpcScan},
          {label:"TruthFull Label Print",path:"/print/mgmt/truthful_labelprint",icon:Ticket}
        ]},{
          label:"Settings",path:"/settings",icon:RiSettings3Line,
        },{label:"IP Request",path:"/approve-ip-user-list",icon:RiUserAddLine}
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
      w="268px"
      bg="#FFFFFF"
      color="#333333"
      p={4}
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
      <Box borderBottom="1px solid #e5e7eb" pb={3} pl={6} mb={5}>
        <Image src={logo} alt="Company Logo" h="45px" />
      </Box>

      <VStack spacing={2} align="stretch">
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

          // ⭐ CHECK IF ANY CHILD ROUTE IS ACTIVE
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
                        leftIcon={<ChildIcon />}
                        size="sm"
                        as={NavLink}
                        to={item.path}
                        {...sidebarButtonStyle}
                        style={activeLinkStyle}
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

        {/* Settings */}
        <Button
          leftIcon={<RiSettings3Line />}
          {...sidebarButtonStyle}
          as={NavLink}
          to="/settings"
          style={activeLinkStyle}
        >
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

export default memo(Newsidebar);



