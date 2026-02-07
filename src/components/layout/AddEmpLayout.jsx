import React from "react";
import AddEmployee from "../../pages/HrMgmt/AddEmployee";
import { Flex } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AddEmpLayout = ()=>{
    return(
        <>
         <Flex bgColor="#f4f4f4">
         <Sidebar />
        <Flex direction="column" minH="100vh" width="78%" margin="1rem auto" gap="1rem">
         <Topbar />
         <AddEmployee/>
         </Flex>
        </Flex>
        </>
    )
}

export default AddEmpLayout