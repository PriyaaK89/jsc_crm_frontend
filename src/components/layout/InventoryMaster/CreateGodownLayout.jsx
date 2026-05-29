import { Box } from "@chakra-ui/react";
import React from "react";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import MobileTopbar from "../MobileTopbar";
import NotificationBtn from "../../NotificationBtn/NotificationBtn";
import CreateGodown from "../../../pages/InventoryMaster/CreateGodown";

const CreateGodownLayout = ()=>{
    return(
        <>
         <Box bg="#f2f1f1" minH="100vh" >
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
                   <CreateGodown/>
                 </Box>
               </Box>
        </>
    )
}

export default CreateGodownLayout