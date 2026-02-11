import { Flex } from "@chakra-ui/react";
import React from "react";

import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import EmpJoiningLetter from "../../../pages/HrMgmt/Letters/JoiningLetter";


const JoiningLetterLayout = () => {
    return (
        <>
            <Flex bgColor="#f4f4f4">
                <Sidebar />
                <Flex direction="column" minH="100vh" width="78%" margin="1rem auto" gap="1rem">
                    <Topbar />
                    <EmpJoiningLetter/>
                </Flex>
            </Flex>
        </>
    )
}

export default JoiningLetterLayout