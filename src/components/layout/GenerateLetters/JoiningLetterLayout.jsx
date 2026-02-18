import { Flex } from "@chakra-ui/react";
import React from "react";

import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import MobileTopbar from "../MobileTopbar";
import EmpJoiningLetter from "../../../pages/HrMgmt/Letters/JoiningLetter";
import { Box } from "lucide-react";


const JoiningLetterLayout = () => {
    return (
        <>
            <Flex bgColor="#f4f4f4">
                <Box display={{base:"none",md:"block"}}>
                            <Sidebar />

                </Box>
                {/* Main Content */}

                <Flex direction="column" minH="100vh" width="78%" margin="1rem auto" gap="1rem">
                    <Box display={{base:"none",md:"block"}}>
                        <Topbar />
                    </Box>
                    <Box display={{base:"block",md:"none"}}>
                        <MobileTopbar />
                    </Box>
                    <EmpJoiningLetter/>
                </Flex>
            </Flex>
        </>
    )
}

export default JoiningLetterLayout;