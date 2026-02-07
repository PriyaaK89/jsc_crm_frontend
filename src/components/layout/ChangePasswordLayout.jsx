import { Flex } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ChangePassword from "../../pages/ChangePassword/ChangeUserPassword";


const ChangePasswordLayout = ()=>{
    return(
        <>
         <Flex bgColor="#f4f4f4">
                <Sidebar />
                <Flex direction="column" minH="100vh" width="78%" margin="1rem auto" gap="1rem">
                    <Topbar />
                    <ChangePassword/>
                </Flex>
            </Flex>
        </>
    )
}

export default ChangePasswordLayout