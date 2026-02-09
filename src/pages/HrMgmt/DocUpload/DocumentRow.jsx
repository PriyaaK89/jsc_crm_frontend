import React, { useState } from "react";
import { HStack, Text, Button } from "@chakra-ui/react";
import UploadDocumentModal from "./UploadDocumentModel";

const DocumentRow = ({ label, documentType, userId }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <HStack justify="space-between">
        <Text>{label}</Text>

        <Button
          size="sm"
          colorScheme="blue"
          onClick={() => setOpen(true)}
        >
          Upload
        </Button>
      </HStack>

      <UploadDocumentModal
        isOpen={open}
        onClose={() => setOpen(false)}
        userId={userId}
        documentType={documentType}

      />
    </>
  );
};

export default DocumentRow;
