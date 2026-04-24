import { Center, Flex ,Box} from "@chakra-ui/react";
import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Createteam from "../../pages/HrMgmt/CreateTeam";
import MobileTopbar from "./MobileTopbar";
import NotificationBtn from "../NotificationBtn/NotificationBtn";

const CreateTeamLayout = ()=>{
    return(
        <Box bg="#F4F4F4" minH="100vh" >
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
                   <Createteam />
                 </Box>
               </Box>
    )
}

export default CreateTeamLayout