import React from 'react'
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Createteam from "../../pages/HrMgmt/CreateTeam";
import DesktopTopbar from "./Topbar";
import MobileTopbar from "./MobileTopbar";
import CreateSubTeam from '../../pages/HrMgmt/CreateSubTeam';
import { Flex,Box } from '@chakra-ui/react';

function CreateSubTeamLayout() {
  return (
    <>
             <Flex minH="100vh" bg="#f4f4f4">
       
             {/* Fixed Sidebar */}
             <Box
               position="fixed"
               top="0"
               left="0"
               w="268px"
               h="100vh"
               display={{ base: "none", md: "block" }}
             >
               <Sidebar />
             </Box>
       
             {/* Main Content Area */}
             <Flex
               direction="column"
               flex="1"
               ml={{ base: 0, md: "268px" }}
               
             >
       
               {/* Desktop Topbar */}
               <Box
                 display={{ base: "none", md: "block" }}
                 px={{ base: 4, md: 6 }}
                 pt={4}
                 mx={3}
               >
                 <DesktopTopbar />
               </Box>
       
               {/* Mobile Topbar */}
               <Box
                 display={{ base: "block", md: "none" }}
                 px={4}
                 py={4}
               >
                 <MobileTopbar />
               </Box>
       
               {/* Page Content */}
               <Box
                 flex="1"
                 px={{ base: 0, md: 6 }}
                 py={6}
                 overflow="auto"
                 mx={3}
               >
                 <Box
                   bg="white"
                   p={6}
                   borderRadius="21px"
                   boxShadow="sm"
                 >
                  <CreateSubTeam/>
                 </Box>
               </Box>
       
             </Flex>
           </Flex>
          
           </>
  )
}

export default CreateSubTeamLayout
