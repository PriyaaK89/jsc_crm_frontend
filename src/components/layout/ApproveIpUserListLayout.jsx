import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Flex } from "@chakra-ui/react";
import ApproveIpUserList from "../../pages/ApproveIp/ApproveIpUserList";

const ApproveIpUserListLayout = () => {
  return (
    <Flex bg="#f4f4f4">
      <Sidebar />
      <Flex direction="column" minH="100vh" width="78%" m="1rem auto" gap="1rem">
        <Topbar />
        <ApproveIpUserList />
      </Flex>
    </Flex>
  );
};

export default ApproveIpUserListLayout;
