import { Center, Flex ,Box} from "@chakra-ui/react";
import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Createteam from "../../pages/HrMgmt/CreateTeam";
import MobileTopbar from "./MobileTopbar";
import NotificationBtn from "../NotificationBtn/NotificationBtn";

const CreateTeamLayout = ()=>{
    return(
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
                   ml={{sm: 2,  base: 2, md: "295px" }}
                   mr={{sm: 2,base:2, md:5}}
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