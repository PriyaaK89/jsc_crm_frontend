import { Flex } from "@chakra-ui/react";
import React from "react";
import OfferLetterPage from "../../../pages/HrMgmt/Letters/OfferLetter";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";


const OfferLetterLayout = () => {
    return (
        <>
            <Flex bgColor="#f4f4f4">
                <Sidebar />
                <Flex direction="column" minH="100vh" width="78%" margin="1rem auto" gap="1rem">
                    <Topbar />
                    <OfferLetterPage/>
                </Flex>
            </Flex>
        </>
    )
}

export default OfferLetterLayout