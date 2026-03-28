import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import MobileTopbar from "../MobileTopbar";
// import EmpAttendance from "../../../pages/Employee/EmpAttendance";
import EmpSalaryReport from "../../../pages/Employee/EmpSalaryReport";
import EmployeeBalanceSheet from "../../../pages/Reports/EmployeeBalanceSheet";
import NotificationBtn from "../../NotificationBtn/NotificationBtn";

const EmployeeSalaryReportLayout = () => {
  return (
    <Box bg="#F3F3F3" h="100vh" >
             <Box display={{ base: "none", md: "block" }}>
               <Sidebar />
       
             </Box>
             <Box display={{ base: "none", md: "block" }}>
               <Topbar />
             </Box>
             <Box display={{ base: "block", md: "none" }}>
               <MobileTopbar />
             </Box>
             <Box
               ml={{ base: 5, md: "295px" }}
               mr={{base:5, md:5}}
               pt="5rem"
               pb={6}
             >
               <NotificationBtn/>
               <EmpSalaryReport />
             </Box>
           </Box>
  );
};

export default EmployeeSalaryReportLayout;