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
import { HiUserGroup } from "react-icons/hi";
import { MdAssignmentInd } from "react-icons/md";
import {FaUserTie} from 'react-icons/fa';
import { FaBullseye   } from "react-icons/fa";
import { MdCorporateFare } from "react-icons/md";
import { HiOfficeBuilding } from "react-icons/hi";
import { FaChartLine } from "react-icons/fa";
import { FaUser,FaUserPlus } from "react-icons/fa";
import { MdInventory, MdAddBox, MdViewList, MdDelete } from "react-icons/md";
import { MdCategory } from "react-icons/md";
import { MdAddCircleOutline } from "react-icons/md";

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
  console.log(auth, "auth");
  const role = auth?.user?.role;
  console.log(role, "role");
  console.log("SIDEBAR COMPONENT RENDERED");

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };


  const sidebarButtonStyle = {
    variant: "ghost",
    justifyContent: "flex-start",
    fontWeight: "700",
    color: "#333333",
    _hover: {
      border: "1px solid #d5d5d5",
      borderRadius: "28px",
      bg: "transparent",
    },
    height: "39px",
  };

  const activeLinkStyle = ({ isActive }) =>
    isActive
      ? { border: "1px solid #d5d5d5", borderRadius: "28px" }
      : undefined;

  return (
    <Box
      w="268px"
      bg="#f4f4f4"
      color="#333333"
      p={4}
      overflow="hidden"
      h="100vh"
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
              leftIcon={<FaUserPlus  />}
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
              to={`/hr-mgmt/upload-emp-salary`}
              
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

      {/* business department */}
         <Button {...sidebarButtonStyle} onClick={() => toggleMenu("business")} leftIcon={<FaChartLine/>}>
          
          Business Development
          <Icon as={openMenu === "business" ? ChevronDownIcon : ChevronRightIcon} />
        </Button>

        <Collapse in={openMenu === "business"} animateOpacity>
          <VStack pl={6} align="stretch" spacing={1}>
            <Button
              leftIcon={<FaUserPlus />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/Business-dev/create-team"
              style={activeLinkStyle} 
            >
             Create Team
            </Button>

            <Button
              leftIcon={<HiUserGroup />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/Business-devt/create-sub-team"
              style={activeLinkStyle}
            >
              Create Sub Team
            </Button>

            <Button
              leftIcon={<MdAssignmentInd  />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/Business-devt/assign-target-rsm"
              style={activeLinkStyle}
            >
             Assign Target RSM
            </Button>

            <Button
              leftIcon={<FaUserTie  />}
              {...sidebarButtonStyle}
              size="sm"
              as={NavLink}
              to="/Business-devt/assign-target-tsm"
              style={activeLinkStyle}
            >
             Assign Target TSM
            </Button>
             <Button
              leftIcon={<FaBullseye  />}
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


        {/* ..company master  */}
          <Button {...sidebarButtonStyle} onClick={() => toggleMenu("company-master")}  leftIcon={<MdCorporateFare />} >
         Company Master
          <Icon as={openMenu === "company-master" ? ChevronDownIcon : ChevronRightIcon} />
        </Button>

        <Collapse in={openMenu === "company-master"} animateOpacity>
          <VStack pl={6} align="stretch" spacing={1}>
            <Button
              leftIcon={<HiOfficeBuilding  />}
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
          leftIcon={<RiUser3Line />}
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
            >
              New Lead
            </Button>

            <Button
              leftIcon={<RiFileList3Line />}
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
          leftIcon={<RiBarChartLine />}
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
    >
      Inventory Master
    </Button>

    <Collapse in={openMenu === "inventory"} animateOpacity>
      <VStack pl={6} align="stretch" spacing={1}>
         <Button 
         leftIcon={<MdAddBox size={18}/>}
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

{/* order vochor */}
        {/* Settings */}
        <Button
          leftIcon={<RiSettings3Line />}
          {...sidebarButtonStyle}
          as={NavLink}
          to="/settings"
        >
          Settings
        </Button>

        {/* IP Requests for Admins */}
        {(role === "ADMIN" || role === "SUPER_ADMIN") && (
          <Button
            leftIcon={<RiUserAddLine />}
            {...sidebarButtonStyle}
            as={NavLink}
            to="/approve-ip-user-list"
          >
            IP Request
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default Sidebar;