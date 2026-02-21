import { Flex } from "@chakra-ui/react";
import React from "react";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import AgreementLetter from "../../../pages/HrMgmt/Letters/AgreementLetter";

const AgreementLetterLayout = ()=>{
    return(
        <>
        <Flex bgColor="#f4f4f4">
                        <Sidebar />
                        <Flex direction="column" minH="100vh" width="78%" margin="1rem auto" gap="1rem">
                            <Topbar />
                            <AgreementLetter/>
                        </Flex>
        </Flex>
        </>
    )
}

export default AgreementLetterLayout