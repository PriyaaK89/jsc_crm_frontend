import { Box, VStack, Text, Button, Collapse, Icon,} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const sidebarButtonStyle = {
  variant: "ghost",
  justifyContent: "flex-start",
  color: "white",
  _hover: {
    bg: "white",
    color: "black",
  },
};

  return (
    <Box
      w="268px"
      bg="#114d72"
      color="white"
      minH="100vh"
      p={5}
      display={{ base: "none", md: "block" }}
    >
      <Text fontSize="2xl" fontWeight="bold" mb={10}>
        CRM
      </Text>

      <VStack spacing={2} align="stretch" borderRadius="34px">
        {/* Dashboard */}
        <Button {...sidebarButtonStyle} as={NavLink} to='/dashboard'>
          Dashboard
        </Button>

        {/* Users Menu */}
        <Button {...sidebarButtonStyle} onClick={() => toggleMenu("users")} >
          HR Management
          <Icon as={openMenu === "users" ? ChevronDownIcon : ChevronRightIcon} />
        </Button>

        <Collapse in={openMenu === "users"} animateOpacity>
          <VStack pl={6} align="stretch" spacing={1}>
            
            <Button {...sidebarButtonStyle} size="sm" as={NavLink} to="/hr-mgmt/add-employee" > Add Employee </Button>
            <Button {...sidebarButtonStyle} size="sm" as={NavLink} to="/hr-mgmt/view-employee-list" > Employee List </Button>
            <Button {...sidebarButtonStyle} size="sm" as={NavLink} to="/hr-mgmt/upload-emp-salary">Upload Employee Salary</Button>
            <Button {...sidebarButtonStyle} size="sm" as={NavLink} to="/dept/add-department" > Add Department </Button>
            <Button {...sidebarButtonStyle} size="sm" as={NavLink} to="/roles/add-job-role" > Add Job Role </Button>
          </VStack>
        </Collapse>

        {/* Leads Menu */}
        <Button {...sidebarButtonStyle} onClick={() => toggleMenu("leads")}>
          Leads
          <Icon as={openMenu === "leads" ? ChevronDownIcon : ChevronRightIcon} />
        </Button>

        <Collapse in={openMenu === "leads"} animateOpacity>
          <VStack pl={6} align="stretch" spacing={1}>
            <Button {...sidebarButtonStyle} size="sm"> New Lead </Button>
            <Button {...sidebarButtonStyle} size="sm"> Lead List </Button>
          </VStack>
        </Collapse>

        <Button {...sidebarButtonStyle}> Reports </Button>
        <Button {...sidebarButtonStyle}> Settings </Button>
      </VStack>
    </Box>
  );
};

export default Sidebar;
