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
 Flex,
  Input,
  SimpleGrid,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text
} from "@chakra-ui/react";

function DistributorDocuments({ onChange, formData, onSendData }) {
  const shopModal = useDisclosure();
  const chequeModal = useDisclosure();

  const [docs, setDocs] = useState({
    shop_image: [],
    cheque_photo: [],
    partnership_deed: null,
    mai_letter: null,
    pan_photo: null,
    aadhar_front: null,
    aadhar_back: null,
    gst_file: null,
    seed_license: null,
    fertilizer_license: null,
    pesticide_license: null,
    bank_diary: null,
    letter_head: null,
    authority_letter: null
  });

  const [shopPreview, setShopPreview] = useState([]);
  const [chequePreview, setChequePreview] = useState([]);

  // ✅ MULTI FILE UPLOAD WITH LIMIT
  const handleMultiUpload = (e, field) => {
    const files = Array.from(e.target.files);

    setDocs((prev) => {
      let updatedFiles = [...(prev[field] || []), ...files];

      // 🚀 LIMIT LOGIC
      if (field === "shop_image") {
        if (updatedFiles.length > 4) {
          alert("Maximum 4 shop images allowed");
          updatedFiles = updatedFiles.slice(0, 4);
        }
      }

      if (field === "cheque_photo") {
        if (updatedFiles.length > 2) {
          alert("Only 2 cheque photos allowed");
          updatedFiles = updatedFiles.slice(0, 2);
        }
      }

      const updated = {
        ...prev,
        [field]: updatedFiles
      };

      onChange && onChange(updated);
      return updated;
    });
  };

  // ✅ SINGLE FILE
  const handleSingleUpload = (e, field) => {
    const file = e.target.files[0];

    const updated = {
      ...docs,
      [field]: file
    };

    setDocs(updated);
    onChange && onChange(updated);
  };

  // ✅ PREVIEW SHOP
  useEffect(() => {
    const urls = docs.shop_image.map(file => URL.createObjectURL(file));
    setShopPreview(urls);

    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [docs.shop_image]);

  // ✅ PREVIEW CHEQUE
  useEffect(() => {
    const urls = docs.cheque_photo.map(file => URL.createObjectURL(file));
    setChequePreview(urls);

    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [docs.cheque_photo]);

  // ✅ SEND DATA TO PARENT
  useEffect(() => {
    onSendData && onSendData(docs);
  }, [docs]);

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

        {/* SHOP IMAGES */}
        <FormControl>
          <FormLabel>Shop Images (Max 4)</FormLabel>
          <Input type="file" multiple onChange={(e) => handleMultiUpload(e, "shop_image")} />
          {docs.shop_image.length > 0 && (
            <Button mt={2} onClick={shopModal.onOpen}>
              Preview ({docs.shop_image.length})
            </Button>
          )}
        </FormControl>

        {/* CHEQUE */}
        <FormControl>
          <FormLabel>Cheque Photos (Max 2)</FormLabel>
          <Input type="file" multiple onChange={(e) => handleMultiUpload(e, "cheque_photo")} />
          {docs.cheque_photo?.length > 0 && (
            <Button mt={2} onClick={chequeModal.onOpen}>
              Preview ({docs.cheque_photo.length})
            </Button>
          )}
        </FormControl>

        {/* CONDITIONAL */}
        {formData?.firm_type === "partnership" && (
          <>
            <FormControl>
              <FormLabel>Partnership Deed</FormLabel>
              <Input type="file" onChange={(e) => handleSingleUpload(e, "partnership_deed")} />
            </FormControl>

            <FormControl>
              <FormLabel>Authority Letter</FormLabel>
              <Input type="file" onChange={(e) => handleSingleUpload(e, "authority_letter")} />
            </FormControl>
          </>
        )}

        {formData?.firm_type === "private_limited" && (
          <>
            <FormControl>
              <FormLabel>MAI Letter</FormLabel>
              <Input type="file" onChange={(e) => handleSingleUpload(e, "mai_letter")} />
            </FormControl>

            <FormControl>
              <FormLabel>Authority Letter</FormLabel>
              <Input type="file" onChange={(e) => handleSingleUpload(e, "authority_letter")} />
            </FormControl>
          </>
        )}

        {/* OTHERS */}
        <FormControl>
          <FormLabel>PAN Photo</FormLabel>
          <Input type="file" onChange={(e) => handleSingleUpload(e, "pan_photo")} />
        </FormControl>

        <FormControl>
          <FormLabel>Aadhar Front</FormLabel>
          <Input type="file" onChange={(e) => handleSingleUpload(e, "aadhar_front")} />
        </FormControl>

        <FormControl>
          <FormLabel>Aadhar Back</FormLabel>
          <Input type="file" onChange={(e) => handleSingleUpload(e, "aadhar_back")} />
        </FormControl>

        <FormControl>
          <FormLabel>GST File</FormLabel>
          <Input type="file" onChange={(e) => handleSingleUpload(e, "gst_file")} />
        </FormControl>

        <FormControl>
          <FormLabel>Seed License</FormLabel>
          <Input type="file" onChange={(e) => handleSingleUpload(e, "seed_license")} />
        </FormControl>

        <FormControl>
          <FormLabel>Fertilizer License</FormLabel>
          <Input type="file" onChange={(e) => handleSingleUpload(e, "fertilizer_license")} />
        </FormControl>

        <FormControl>
          <FormLabel>Pesticide License</FormLabel>
          <Input type="file" onChange={(e) => handleSingleUpload(e, "pesticide_license")} />
        </FormControl>

        <FormControl>
          <FormLabel>Bank Diary</FormLabel>
          <Input type="file" onChange={(e) => handleSingleUpload(e, "bank_diary")} />
        </FormControl>

        <FormControl>
          <FormLabel>Letter Head</FormLabel>
          <Input type="file" onChange={(e) => handleSingleUpload(e, "letter_head")} />
        </FormControl>

      </SimpleGrid>

      {/* SHOP MODAL */}
      <Modal isOpen={shopModal.isOpen} onClose={shopModal.onClose}>
        <ModalOverlay borderRadius="12px" overflow="hidden" mx="12px" />
        <ModalContent >
           {/* HEADER */}
                          <Flex
                            bg="blue.500"
                            color="white"
                            px={4}
                            py={3}
                            justifyContent="space-between"
                            align="center"
                                        borderRadius="12px 12px 0px 0px"

                          >
                            <Text fontWeight="bold">Preview  Documents</Text>
                            <ModalCloseButton position="static" color="white" />
                          </Flex>
                
          <ModalBody p={5}>
            <SimpleGrid columns={2} spacing={3} pt={5}   >
              {shopPreview.map((url, i) => (
                <Image key={i} src={url} h="220px" />
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
            <SimpleGrid columns={2} spacing={3} pt={5}   >
              {chequePreview.map((url, i) => (
                <Image key={i} src={url} h="220px" />
              ))}
            </SimpleGrid>
          </ModalBody>
        </ModalContent>
      </Modal>

    </Box>
  );
}

export default DistributorDocuments;