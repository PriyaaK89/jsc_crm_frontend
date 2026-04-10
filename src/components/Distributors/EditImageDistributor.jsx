import React, { useState, useEffect } from "react";
import {
  Box,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  FormControl,
  FormLabel,
  SimpleGrid,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Flex,
  Text,
  VStack
} from "@chakra-ui/react";
import { BsCloudUpload } from "react-icons/bs";

function DistributorDocuments({ onChange, onSendData, existingDocs }) {
  const shopModal = useDisclosure();
  const chequeModal = useDisclosure();

  const [docs, setDocs] = useState({
    shop_image: [],
    cheque_photo: [],
    pan_photo: null,
    aadhar_front: null,
    aadhar_back: null,
    gst_file: null,
    seed_license: null,
    fertilizer_license: null,
    pesticide_license: null,
    bank_diary: null,
    letter_head: null, 
  });

  const [shopPreview, setShopPreview] = useState([]);
  const [chequePreview, setChequePreview] = useState([]);

  //  SAFE PREVIEW FUNCTION
  const getPreview = (file) => {
    if (!file) return "";

    //  URL from API
    if (typeof file === "string") return file;

    //  File object
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }

    //  invalid object
    return "";
  };

  //  SET EXISTING DATA SAFELY
 
  useEffect(() => {
  if (existingDocs) {
    setDocs({
      shop_image: Array.isArray(existingDocs.shop_image)
        ? existingDocs.shop_image
        : [],
      cheque_photo: Array.isArray(existingDocs.cheque_photo)
        ? existingDocs.cheque_photo
        : [],

      pan_photo: existingDocs.pan_photo || null,
      aadhar_front: existingDocs.aadhar_front || null,
      aadhar_back: existingDocs.aadhar_back || null,
      gst_file: existingDocs.gst_file || null,
      letter_head: existingDocs.letter_head || null,
      seed_license: existingDocs.seed_license || null,
      fertilizer_license: existingDocs.fertilizer_license || null,
      pesticide_license: existingDocs.pesticide_license || null,
      bank_diary: existingDocs.bank_diary || null,
    });
  }
}, [existingDocs]);

useEffect(() => {
  return () => {
    shopPreview.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
  };
}, [shopPreview]);

  //  MULTI UPLOAD
  const handleMultiUpload = (e, field) => {
    const files = Array.from(e.target.files || []);

    setDocs((prev) => {
      let updatedFiles = [...(prev[field] || []), ...files];

      if (field === "shop_image") {
        updatedFiles = updatedFiles.slice(0, 4);
      }

      if (field === "cheque_photo") {
        updatedFiles = updatedFiles.slice(0, 2);
      }

      const updated = { ...prev, [field]: updatedFiles };
      onChange && onChange(updated);
      return updated;
    });
  };

  //  SINGLE UPLOAD
  const handleSingleUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const updated = { ...docs, [field]: file };
    setDocs(updated);
    onChange && onChange(updated);
  };

  //  PREVIEW EFFECTS (SAFE FILTER)
  useEffect(() => {
    const previews = (docs.shop_image || [])
      .map(getPreview)
      .filter(Boolean);

    setShopPreview(previews);
  }, [docs.shop_image]);

  useEffect(() => {
    const previews = (docs.cheque_photo || [])
      .map(getPreview)
      .filter(Boolean);

    setChequePreview(previews);
  }, [docs.cheque_photo]);

  //  SEND DATA
  useEffect(() => {
    console.log("Child sending data to Parent:", docs); 
    onSendData && onSendData(docs);
  }, [docs]);

  //  UPLOAD BOX
const UploadBox = ({ label, field, multiple = false }) => {
  const file = docs[field];
  const preview = getPreview(file);

   const isPDF = (file) => {
  if (!file) return false;

  // string URL
  if (typeof file === "string") {
    return file.toLowerCase().includes(".pdf");
  }

  // file object
  if (file instanceof File) {
    return (
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf")
    );
  }

  return false;
};

  // get file name
  const getFileName = (file) => {
    if (!file) return "";

    if (typeof file === "string") {
      return file.split("/").pop();
    }

    if (file instanceof File) {
      return file.name;
    }

    return "";
  };

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>

      <Box
        border="2px dashed #ccc"
        borderRadius="md"
        p={4}
        textAlign="center"
        cursor="pointer"
        position="relative"
      >
        <VStack spacing={2}>
          <BsCloudUpload size={24} />
          <Text fontSize="sm">Click to upload</Text>
        </VStack>

        <input
          type="file"
            accept="image/*,application/pdf"
          multiple={multiple}
          onChange={(e) =>
            multiple
              ? handleMultiUpload(e, field)
              : handleSingleUpload(e, field)
          }
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            opacity: 0,
            cursor: "pointer"
          }}
        />
      </Box>

      {/* ✅ SINGLE FILE PREVIEW */}
      {!multiple && file && preview && (
        <>
          {isPDF(file) ? (

           <a
  href={preview}
  target="_blank"
  rel="noopener noreferrer"
  style={{ textDecoration: "none" }}
>
  <Text
    mt={2}
    color="blue.500"
    cursor="pointer"
    textDecoration="underline"
  >
    📄 {label}
  </Text>
</a>
          ) : (
            <Image
              src={preview}
              boxSize="100px"
              mt={2}
              borderRadius="md"
            />
          )}
        </>
      )}
    </FormControl>
  );
};

  return (
    <Box border="1px solid #313131" mt={5} borderRadius="lg">
      <HStack bg="#e9f2ff" borderBottom="1px solid #d9e5f8" borderTopRadius="lg" pl={6}>
        <Breadcrumb py={3}>
          <BreadcrumbItem>
            <BreadcrumbLink>UPLOAD DOCUMENTS :</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} p={5}>
        <UploadBox label="Shop Images (Max 4)" field="shop_image" multiple />
        {shopPreview.length > 0 && (
          <Button onClick={shopModal.onOpen}>
            Preview ({shopPreview.length})
          </Button>
        )}

        <UploadBox label="Cheque Photos (Max 2)" field="cheque_photo" multiple />
        {chequePreview.length > 0 && (
          <Button onClick={chequeModal.onOpen}>
            Preview ({chequePreview.length})
          </Button>
        )}

        <UploadBox label="PAN Photo" field="pan_photo" />
        <UploadBox label="Aadhar Front" field="aadhar_front" />
        <UploadBox label="Aadhar Back" field="aadhar_back" />
        <UploadBox label="GST File" field="gst_file" />
      </SimpleGrid>

      {/* SHOP MODAL */}
      <Modal isOpen={shopModal.isOpen} onClose={shopModal.onClose} isCentered  size="sm"> 
        <ModalOverlay />
        
              <ModalContent borderRadius="12px" mx="12px" overflow="hidden">
                {/* Header */}
                <Flex
                  bg="blue.500"
                  color="white"
                  px={4}
                  py={3}
                  justifyContent="space-between"
                  alignItems="center"
                  borderTopRadius="12px"
                >
                  <Text fontWeight="bold">Image Preview</Text>
        
                  <ModalCloseButton position="static" color="white" />
                </Flex>
          <ModalBody p={5}>
            <SimpleGrid columns={2} spacing={3} pt={5}>
              {shopPreview.map((url, i) => (
                <Image key={i} src={url} h="200px" />
              ))}
            </SimpleGrid>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* CHEQUE MODAL */}
      <Modal isOpen={chequeModal.isOpen} onClose={chequeModal.onClose}>
        <ModalOverlay />
        <ModalContent>

          <ModalCloseButton />
          <ModalBody p={5}>
            <SimpleGrid columns={2} spacing={3} pt={5}>
              {chequePreview.map((url, i) => (
                <Image key={i} src={url} h="200px" />
              ))}
            </SimpleGrid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default DistributorDocuments;