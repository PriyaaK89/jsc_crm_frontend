import { Flex } from "@chakra-ui/react";
import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import EditEmployee from "../../pages/HrMgmt/EditEmployee";

const EditEmployeePage = ()=>{
    return(
        <>
        <Flex bg="#f4f4f4">
            <Sidebar />
                <Flex direction="column" minH="100vh" width="78%" margin="1rem auto" gap="1rem">
                    <Topbar />
                    <EditEmployee/>
                </Flex>
        </Flex>
        </>
    )
}

export default EditEmployeePage