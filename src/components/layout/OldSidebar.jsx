import {Box,VStack,Text,Button,Collapse,Icon, Image } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { AuthContext } from "../../context/AuthContext";
import { HiUserGroup } from "react-icons/hi";
import { MdAssignmentInd } from "react-icons/md";
import { FaUserTie } from 'react-icons/fa';
import { FaBullseye } from "react-icons/fa";
import { MdCorporateFare,MdGroupAdd } from "react-icons/md";
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
import { useState, useContext, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
// main component function

const Sidebar = () => {
  
  const [openMenu, setOpenMenu] = useState(null);
  const { auth } = useContext(AuthContext);
  console.log(auth, "auth");
  const role = auth?.user?.role;
  console.log(role, "role");
  console.log("SIDEBAR COMPONENT RENDERED");

 const toggleMenu = (menu) => {
  setOpenMenu((prev) => (prev === menu ? null : menu));
};
  const location = useLocation();

useEffect(() => {
  const path = location.pathname;

  if (path.startsWith("/hr-mgmt")) {
    setOpenMenu("users");
  } 
  else if (path.startsWith("/Business-dev") || path.startsWith("/Business-devt")) {
    setOpenMenu("business");
  } 
  else if (path.startsWith("/accounting-master")) {
    setOpenMenu("accounting-master");
  } 
  else if (path.startsWith("/inventory")) {
    setOpenMenu("inventory");
  } 
  else if (path.startsWith("/print")) {
    setOpenMenu("print_mgmt");
  } 
  else if (path.startsWith("/company-master")) {
    setOpenMenu("company-master");
  } 
  else if (path.startsWith("/leads")) {
    setOpenMenu("leads");
  } 
  else if (path.startsWith("/order-vochor")) {
    setOpenMenu("order-vochor");
  }
}, [location.pathname]);


  const sidebarButtonStyle = {
    variant: "ghost",
    justifyContent: "flex-start",
    fontWeight: "700",
    color: "#333333",
   _hover: {
  bg: "gray.100",
  borderRadius: "28px"
},
    height: "39px",
  };

 const activeLinkStyle = ({ isActive }) =>
  isActive
    ? {
        background: "#f3f4f6",
        borderRadius: "28px",
        fontWeight: "bold"
      }
    : undefined;
    // parent active 
    const isParentActive = (paths) => {
  return paths.some((path) => location.pathname.startsWith(path));
};

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
      {/* logo */}
    <Box borderBottom="1px solid #e5e7eb" pb={3} pl={6} mb={5}>
  <Image
    src={logo}
    alt="Company Logo"
    h="45px"
  />
</Box>

      <VStack spacing={2} align="stretch" bg="#FFFFFF" borderRadius="2xl" >
        {/* Dashboard */}
        <Button
          leftIcon={<RiDashboardLine size={20} />}
          as={NavLink}
          to="/dashboard"
          {...sidebarButtonStyle}
          style={activeLinkStyle}
        >
          Dashboard
        </Button>

        {/* HR Management */}
        <Button
          leftIcon={<FaUser size={20} />}
          rightIcon={
            <Icon
              as={openMenu === "users" ? ChevronDownIcon : ChevronRightIcon} 
            />
          }
          {...sidebarButtonStyle}
          onClick={() => toggleMenu("users")}
       

   bg={
    location.pathname.startsWith("/hr-mgmt")
      ? "#f3f4f6"
      : "transparent"
  }
  borderRadius="28px"
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
              leftIcon={<RiUser3Line  size={18}/>}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/hr-mgmt/view-employee-list"
              style={activeLinkStyle}
            >
              Employee List
            </Button>

          <Button
              leftIcon={<HiUserGroup   size={18}/>}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to={`/hr-mgmt/roles/add-job-role`}

              style={activeLinkStyle}
            >
              Create Job Role
            </Button>

            <Button
              leftIcon={<MdAccountTree  size={18}/>}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to={`/hr-mgmt/dept/add-department`}

              style={activeLinkStyle}
            >
              Create  Department
            </Button>


            <Button
              leftIcon={<RiFileList3Line  size={18}/>}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to={`/hr-mgmt/upload-emp-salary`}

              style={activeLinkStyle}
            >
              Upload Salary Slip
            </Button>

            <Button
              leftIcon={<FaClipboardList />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/hr-mgmt/emp-attendance-report"
              style={activeLinkStyle}
            >
              Attendace Report
            </Button>
            <Button
              leftIcon={<Receipt size={18}/>}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/hr-mgmt/emp-salary-report"
              style={activeLinkStyle}
            >
              Salary Report
            </Button>



            <Button
              leftIcon={<FiMapPin />}
              {...sidebarButtonStyle} size="sm"
              as={NavLink} to="/hr-mgmt/track-employee" style={activeLinkStyle}>
              Track Employee
            </Button>
          </VStack>

        </Collapse>

        {/* business department */}
        <Button {...sidebarButtonStyle} onClick={() => toggleMenu("business")} leftIcon={<FaChartLine />}
          rightIcon={
            <Icon
              as={openMenu === "business" ? ChevronDownIcon : ChevronRightIcon} 
            />
          }
          bg={  isParentActive([
      "/business","/Business-dev/create-team","/Business-devt/create-sub-team","/Business-devt/assign-target-rsm"
   ,"/Business-devt/assign-target-tsm","/Business-devt/assign-target-sm","/Business-devt/assign-target-fa"
    ])
      ? "#f3f4f6"
      : "transparent"
  } 
   borderRadius="28px"
        >

          Business Development
         

        </Button>

        <Collapse in={openMenu === "business"} animateOpacity>
          <VStack pl={6} align="stretch" spacing={1}>
            <Button
              leftIcon={<FaUserPlus size={18}/>}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/Business-dev/create-team"
              style={activeLinkStyle}
            >
              Create Team
            </Button>

            <Button
              leftIcon={<HiUserGroup size={18}/>}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/Business-devt/create-sub-team"
              style={activeLinkStyle}
            >
              Create Sub Team
            </Button>

            <Button
              leftIcon={<MdAssignmentInd />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/Business-devt/assign-target-rsm"
              style={activeLinkStyle}
            >
              Assign Target RSM
            </Button>

            <Button
              leftIcon={<FaUserTie />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/Business-devt/assign-target-tsm"
              style={activeLinkStyle}
            >
              Assign Target TSM
            </Button>
            <Button
              leftIcon={<FaBullseye />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/Business-devt/assign-target-sm"
              style={activeLinkStyle}
            >
              Assign Target SM
            </Button>
            <Button
              leftIcon={<UserCheck />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/Business-devt/assign-target-fa"
              style={activeLinkStyle}
            >
              Assign Target FA
            </Button>
          </VStack>
        </Collapse>

{/* acounting master  */}

        <Button {...sidebarButtonStyle} onClick={() => toggleMenu("accounting-master")} leftIcon={<FaWallet size={20}/>}
     bg={
    location.pathname.startsWith("/accounting-master")
      ? "#f3f4f6"
      : "transparent"
  }
  borderRadius="28px" 
 >
          
          Accounting  Master
          <Icon as={openMenu === "accounting-master" ? ChevronDownIcon : ChevronRightIcon} />
          
        </Button>

        <Collapse in={openMenu === "accounting-master"} animateOpacity>
          <VStack pl={6} align="stretch" spacing={1}>
            <Button
              leftIcon={<MdGroupAdd size={18} />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/accounting-master/create-group"
              style={activeLinkStyle} 
            >
             Create Group 
            </Button>

            <Button
              leftIcon={<FaList size={18} />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/accounting-master/view-group"
              style={activeLinkStyle}
            >
              View Group
            </Button>

            <Button
              leftIcon={<FaTrash  size={18} />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/accounting-master/delete-group"
              style={activeLinkStyle}
            >
           Delete Group 
            </Button>

            <Button
              leftIcon={<FaFileInvoiceDollar size={18}/>}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/accounting-master/create-ledger"
              style={activeLinkStyle}
            >
            Create Ledger
            </Button>
             <Button
              leftIcon={<FaFileInvoice size={18}  />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/accounting-master/view-ledger"
              style={activeLinkStyle}
            >
            View Ledger
            </Button>
            <Button
              leftIcon={<FaTrash  size={18}/>}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/accounting-master/delete-ledger"
              style={activeLinkStyle}
            >
            Delete Ledger
            </Button>


             <Button
              leftIcon={<FaMoneyCheckAlt size={18}/>}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/accounting-master/create-voucher"
              style={activeLinkStyle}
            >
            Create Voucher 
            </Button>
            <Button
              leftIcon={<FaFileInvoice size={18}  />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/accounting-master/view-voucher"
              style={activeLinkStyle}
            >
           View Voucher
            </Button>
            <Button
              leftIcon={< FaTrash size={18}/>}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/accounting-master/delete-voucher"
              style={activeLinkStyle}
            >
         Delete Voucher
            </Button>
            <Button
              leftIcon={<FaEdit size={18}/>}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/accounting-master/edit-ledger-assignment"
              style={activeLinkStyle}
            >
            Edit Ledger Assignment
            </Button>
            <Button
              leftIcon={<FaStore  size={18}/>}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/accounting-master/retail-assignment"
              style={activeLinkStyle}
            >
            Retail Assignment
            </Button>
          </VStack>
        </Collapse>
 
        {/* ..company master  */}
        <Button {...sidebarButtonStyle} onClick={() => toggleMenu("company-master")} leftIcon={<MdCorporateFare />}
         bg={
    location.pathname.startsWith("/company-master")
      ? "#f3f4f6"
      : "transparent"
  }
  borderRadius="28px" >
          Company Master
          <Icon as={openMenu === "company-master" ? ChevronDownIcon : ChevronRightIcon} />
        </Button>

        <Collapse in={openMenu === "company-master"} animateOpacity>
          <VStack pl={6} align="stretch" spacing={1}>
            <Button
              leftIcon={<HiOfficeBuilding />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/company-master/create-company"
              style={activeLinkStyle}
            >
              Create Company
            </Button>




          </VStack>
        </Collapse>



        {/* Leads */}
        <Button
          leftIcon={<RiUser3Line size={20} />}
          {...sidebarButtonStyle}
          onClick={() => toggleMenu("leads")}
            bg={
    location.pathname.startsWith("/leads")
      ? "#f3f4f6"
      : "transparent"
  }
  borderRadius="28px" 
          
        >
          Leads
        </Button>

        <Collapse in={openMenu === "leads"} animateOpacity>
          <VStack pl={6} align="stretch" spacing={1}>
            <Button
              leftIcon={<RiUserAddLine size={18} />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/leads/new"
            >
              New Lead
            </Button>

            <Button
              leftIcon={<RiFileList3Line size={18} />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/leads/list"
            >
              Lead List
            </Button>
          </VStack>
        </Collapse>

        {/* Reports */}
        <Button
          leftIcon={<RiBarChartLine size={18} />}
          {...sidebarButtonStyle}
          as={NavLink}
          to="/reports"
        >
          Reports
        </Button>

        {/* Inventory Master */}
        {(role === "ADMIN" || role === "SUPER_ADMIN") && (
          <>
            <Button
              leftIcon={<MdInventory size={20} />}
              rightIcon={
                <Icon
                  as={openMenu === "inventory" ? ChevronDownIcon : ChevronRightIcon}
                />
              }
              {...sidebarButtonStyle}
              onClick={() => toggleMenu("inventory")}
                bg={
    location.pathname.startsWith("/inventory")
      ? "#f3f4f6"
      : "transparent"
  }
  borderRadius="28px" 
            >
              Inventory Master
            </Button>

            <Collapse in={openMenu === "inventory"} animateOpacity>
              <VStack pl={6} align="stretch" spacing={1}>
                <Button
                  leftIcon={<MdAddBox size={18} />}
                  {...sidebarButtonStyle}
                  size="sm"
                  as={NavLink}
                  to="/inventory/create-stock-group"
                  style={activeLinkStyle}
                >

                  Create Stock Group
                </Button>
                <Button
                  leftIcon={<MdViewList size={18} />}
                  {...sidebarButtonStyle}
                  size="sm"
                  as={NavLink}
                  to="/inventory/view-stock-group"
                  style={activeLinkStyle}
                >
                  View Stock Group
                </Button>
                <Button
                  leftIcon={<MdDelete size={18} />}
                  {...sidebarButtonStyle}
                  size="sm"
                  as={NavLink}
                  to="/inventory/delete-stock-group"
                  style={activeLinkStyle}
                >
                  Delete Stock Group
                </Button>
                <Button
                  leftIcon={<MdCategory size={18} />}
                  {...sidebarButtonStyle}
                  size="sm"
                  as={NavLink}
                  to="/inventory/create-stock-category"
                  style={activeLinkStyle}
                >
                  Create Stock Category
                </Button>
                <Button
                  leftIcon={<MdAddCircleOutline size={18} />}
                  {...sidebarButtonStyle}
                  size="sm"
                  as={NavLink}
                  to="/inventory/view-stock-category"
                  style={activeLinkStyle}
                >
                  View Stock Category
                </Button>
              </VStack>
            </Collapse>
          </>
        )}

        {/* Order Vochor */}
        <Button
          leftIcon={<FaFileInvoice />}
          rightIcon={
            <Icon
              as={
                openMenu === "order-vochor"
                  ? ChevronDownIcon
                  : ChevronRightIcon
              }
            />
          }
          {...sidebarButtonStyle}
          onClick={() => toggleMenu("order-vochor")}
          bg={
    location.pathname.startsWith("/order-vochor")
      ? "#f3f4f6"
      : "transparent"
  }
  borderRadius="28px" 
        >
          Order Vochor
        </Button>

        <Collapse in={openMenu === "order-vochor"} animateOpacity>
          <VStack pl={6} align="stretch" spacing={1}>
            <Button
              leftIcon={<FiMapPin />}
              size="sm"
              as={NavLink}
              to="/order-vochor/payment"
              {...sidebarButtonStyle}
              style={activeLinkStyle}
            >
              Payment
            </Button>
          </VStack>
        </Collapse>

        {/* print  */}
        {/* print mgmt */}
 <Button
      leftIcon={<HiOutlinePrinter size={20} />}
      rightIcon={
        <Icon
          as={openMenu === "print_mgmt" ? ChevronDownIcon : ChevronRightIcon}
        />
      }
      {...sidebarButtonStyle}
      onClick={() => toggleMenu("print_mgmt")}
       bg={
    location.pathname.startsWith("print_mgmt")
      ? "#f3f4f6"
      : "transparent"
  }
  borderRadius="28px" 
    >
      Print MGMT 
    </Button>

    <Collapse in={openMenu === "print_mgmt"} animateOpacity>
      <VStack pl={6} align="stretch" spacing={1}>
         <Button 
         leftIcon={<BsUpcScan size={18}/>}
         {...sidebarButtonStyle}
         size="sm"
         as={NavLink}
                       to="/print/mgmt/shipping_lable_printer"
                       style={activeLinkStyle}
         > Shipping lable printer
         </Button>
           <Button
              leftIcon={<Ticket size={18} />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/print/mgmt/truthful_labelprint"
              style={activeLinkStyle}
            >
             TruthFull Label Print
            </Button>   
      </VStack>
    </Collapse>


        {/* Settings */}
        <Button
          leftIcon={<RiSettings3Line size={18}/>}
          {...sidebarButtonStyle}
          as={NavLink}
          to="/settings"
           bg={
    location.pathname.startsWith("/settings")
      ? "#f3f4f6"
      : "transparent"
  }
  borderRadius="28px"
        >
          Settings
        </Button>

        {/* IP Requests for Admins */}
        {(role === "ADMIN" || role === "SUPER_ADMIN") && (
          <Button   bg={
    location.pathname.startsWith("/approve-ip-user-list")
      ? "#f3f4f6"
      : "transparent"
  }
  borderRadius="28px"
            leftIcon={<RiUserAddLine />}
            {...sidebarButtonStyle}
            as={NavLink}
            
            to="/approve-ip-user-list"
            
          >
            IP Request
          </Button>
     
      </VStack>
    </Box>
  );
};

export default Sidebar;