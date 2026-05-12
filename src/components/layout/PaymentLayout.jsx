import { Center, Flex ,Box} from "@chakra-ui/react";
import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileTopbar from "./MobileTopbar";
import Payment from "../../pages/Order Vochar/Payment";
import NotificationBtn from "../NotificationBtn/NotificationBtn";

const PaymentLayout = ()=>{
    return(
       <Box bg="#f2f1f1" minH="100%" >
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
              <Payment />
            </Box>
          </Box>
    )   
}

export default PaymentLayout