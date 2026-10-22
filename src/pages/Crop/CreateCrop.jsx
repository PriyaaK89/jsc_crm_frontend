import React from "react";
import { Text } from "@chakra-ui/react";
import CropsTab from "./CropsTab";

const CreateCrop = () => (
  <>
    <Text className="action_heading" mb={4} textAlign="center">Crop Management</Text>
    <CropsTab />
  </>
);

export default CreateCrop;