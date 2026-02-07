import { Flex } from "@chakra-ui/react";
import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CreateJobRole from "../../pages/SAdminMgmt/Scope/CreateJobRole";

const JobRoleLayout = ()=>{
    return(
        <>
        <Flex bgColor="#f4f4f4">
                <Sidebar />
                <Flex direction="column" minH="100vh" width="78%" margin="1rem auto" gap="1rem">
                    <Topbar />
                    <CreateJobRole/>
                </Flex>
        </Flex>
        </>
    )
}

export default JobRoleLayout