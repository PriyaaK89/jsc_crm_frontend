import { Flex } from "@chakra-ui/react";
import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import EmployeeList from "../../pages/HrMgmt/EmployeeList";

const EmployeeListLayout = ()=>{
    return(
        <>
        <Flex bgColor="#f4f4f4">
                <Sidebar />
                <Flex direction="column" minH="100vh" width="78%" margin="1rem auto" gap="1rem">
                    <Topbar />
                    <EmployeeList/>
                </Flex>
        </Flex>
        </>
    )
}

export default EmployeeListLayout