import { Flex } from "@chakra-ui/react";
import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CreateDepartment from "../../pages/SAdminMgmt/Scope/CreateDepartment";

const DepartmentLayout = () => {
    return (
        <>
            <Flex bgColor="#f4f4f4">
                <Sidebar />
                <Flex direction="column" minH="100vh" width="78%" margin="1rem auto" gap="1rem">
                    <Topbar />
                    <CreateDepartment/>
                </Flex>
            </Flex>
        </>
    )
}

export default DepartmentLayout