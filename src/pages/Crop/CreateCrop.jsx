import React from "react";
import { Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import CropsTab from "./CropsTab";
import CropSeasonsTab from "./CropSeasonsTab";

// Crop Management: crops with their season(s), and the season list (Kharif / Rabi / Zaid …).
// Products (stock items) are linked to a crop on the stock item form.
const CreateCrop = () => (
  <>
    <Text className="action_heading" mb={4} textAlign="center">Crop Management</Text>
    <Tabs size="sm" colorScheme="teal" variant="enclosed" isLazy>
      <TabList>
        <Tab fontSize="13px">Crops</Tab>
        <Tab fontSize="13px">Crop Seasons</Tab>
      </TabList>
      <TabPanels>
        <TabPanel px={0}><CropsTab /></TabPanel>
        <TabPanel px={0}><CropSeasonsTab /></TabPanel>
      </TabPanels>
    </Tabs>
  </>
);

export default CreateCrop;
