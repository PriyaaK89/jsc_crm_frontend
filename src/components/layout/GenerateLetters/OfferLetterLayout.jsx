import { Flex, Box } from "@chakra-ui/react";
import OfferLetterPage from "../../../pages/HrMgmt/Letters/OfferLetter";
import Sidebar from "../Sidebar";
import DesktopTopbar from "../Topbar";
import MobileTopbar from "../MobileTopbar";

const OfferLetterLayout = () => {
  return (
    <Flex bgColor="#f4f4f4" minH="100vh">
      <Box display={{ base: "none", md: "block" }}>
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Flex direction="column" flex="1">
        {/* Desktop Topbar */}
        <Box display={{ base: "none", md: "block" }}>
          <DesktopTopbar />
        </Box>

        {/* Mobile Topbar */}
        <Box display={{ base: "block", md: "none" }}>
          <MobileTopbar />
        </Box>

        <Flex
          direction="column"
          minH="100vh"
          width="78%"
          margin="1rem auto"
          gap="1rem"
        >
          <OfferLetterPage />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default OfferLetterLayout;
