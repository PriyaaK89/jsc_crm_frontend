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
    Input,
    SimpleGrid,
    Image,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalCloseButton,
    useDisclosure
} from "@chakra-ui/react";

function DistributorDocuments({ onChange ,formData,onSendData }) {

 
   
  

    const { isOpen, onOpen, onClose } = useDisclosure();
    const shopModal = useDisclosure();
    const chequeModal = useDisclosure();

    // ✅ ALL DATA IN ONE STATE
    const [docs, setDocs] = useState({
        shop_images: [],
        partnership_deed: null,
        mai_letter: null,
        pan_photo: null,
        aadhar_photo: null,
        gst_file: null,
        seed_license: null,
        fertilizer_license: null,
        pesticide_license: null,
        bank_diary: null,
        cheque_photos: [],
        letter_head: null,
        authority_letter: null
    });

    const [shopPreview, setShopPreview] = useState([]);
    const [chequePreview, setChequePreview] = useState([]);

    // ✅ HANDLE MULTIPLE IMAGES (shop + cheque)
    const handleMultiUpload = (e, field) => {
        const files = Array.from(e.target.files);

        setDocs((prev) => {
            const updated = {
                ...prev,
                [field]: [...(prev[field] || []), ...files]
            };

            onChange && onChange(updated); // send to parent
            return updated;
        });

        onOpen();
    };

    // ✅ HANDLE SINGLE FILE
    const handleSingleUpload = (e, field) => {
        const file = e.target.files[0];

        setDocs((prev) => {
            const updated = {
                ...prev,
                [field]: file
            };

            onChange && onChange(updated); // send to parent
            return updated;
        });
    };

    useEffect(() => {
        const urls = docs.shop_images.map(file => URL.createObjectURL(file));
        setShopPreview(urls);

        return () => urls.forEach(url => URL.revokeObjectURL(url));
    }, [docs.shop_images]);

    useEffect(() => {
        const urls = docs.cheque_photos.map(file => URL.createObjectURL(file));
        setChequePreview(urls);

        return () => urls.forEach(url => URL.revokeObjectURL(url));
    }, [docs.cheque_photos]);


     onSendData(docs); //  send to parent

    return (
        <Box border="1px solid #313131" mt={5} borderRadius="lg">

            {/* Header */}
            <HStack
                justifyContent="space-between"
                bg="#e9f2ff"
                borderBottom="1px solid #d9e5f8"
                borderTopRadius="lg"
                pt={1}
                pl={6}
            >
                <Breadcrumb padding="4px 0px 1rem 0px">
                    <BreadcrumbItem>
                        <BreadcrumbLink color="#000000">
                            UPLOAD DOCUMENTS :
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>
            </HStack>

            {/* Form */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} p={5}>

                {/*  SHOP IMAGES */}
                <FormControl>
                    <FormLabel>Shop Images</FormLabel>
                    <Input type="file" multiple onChange={(e) => handleMultiUpload(e, "shop_images")} />
                     {docs.shop_images.length > 0 && (
                    <Button mt={2} onClick={shopModal.onOpen} colorScheme="blue" size={{base:"sm",md:"md"}}>
                        Preview Shop photos ({docs.shop_images.length})
                    </Button>
                     )}
                </FormControl>

                {/* CHEQUE IMAGES */}
                <FormControl>
                    <FormLabel>Cheque Photos (2)</FormLabel>

                    <Input
                        type="file"
                        multiple
                        onChange={(e) => handleMultiUpload(e, "cheque_photos")}
                    />

                    {docs.cheque_photos.length > 0 && (
                        <Button mt={2} colorScheme="blue" onClick={chequeModal.onOpen} size={{base:"sm",md:"md"}}>
                            Preview Cheques photos ({docs.cheque_photos.length})
                        </Button>
                    )}
                </FormControl>

                {/*  ALL SINGLE FILE INPUTS */}
                {formData?.firm_type==="partnership" &&(
                    <FormControl>

                 <FormControl>
                    <FormLabel>Partnership Deed</FormLabel>
                    <Input type="file" onChange={(e) => handleSingleUpload(e, "partnership_deed")} />
                </FormControl>

                  <FormControl mt={3}>
                    <FormLabel>Authority Letter</FormLabel>
                    <Input type="file" onChange={(e) => handleSingleUpload(e, "authority_letter")} />
                </FormControl>
                </FormControl>
                )}

         {formData?.firm_type==="private_limited" &&(
                <FormControl>
                 <FormControl>
                    <FormLabel>MAI Letter</FormLabel>
                    <Input type="file" onChange={(e) => handleSingleUpload(e, "mai_letter")} />
                </FormControl>

                  <FormControl mt={3}>
                    <FormLabel>Authority Letter</FormLabel>
                    <Input type="file" onChange={(e) => handleSingleUpload(e, "authority_letter")} />
                </FormControl>
                </FormControl>
 
                )}

               

                <FormControl>
                    <FormLabel>PAN Photo</FormLabel>
                    <Input type="file" onChange={(e) => handleSingleUpload(e, "pan_photo")} />
                </FormControl>

                <FormControl>
                    <FormLabel>Aadhar Photo</FormLabel>
                    <Input type="file" onChange={(e) => handleSingleUpload(e, "aadhar_photo")} />
                </FormControl>

                <FormControl>
                    <FormLabel>Firm GST File</FormLabel>
                    <Input type="file" onChange={(e) => handleSingleUpload(e, "gst_file")} />
                </FormControl>

                <FormControl>
                    <FormLabel>Seed License (PDF)</FormLabel>
                    <Input type="file" onChange={(e) => handleSingleUpload(e, "seed_license")} />
                </FormControl>

                <FormControl>
                    <FormLabel>Fertilizer License (PDF)</FormLabel>
                    <Input type="file" onChange={(e) => handleSingleUpload(e, "fertilizer_license")} />
                </FormControl>

                <FormControl>
                    <FormLabel>Pesticide License (PDF)</FormLabel>
                    <Input type="file" onChange={(e) => handleSingleUpload(e, "pesticide_license")} />
                </FormControl>

                <FormControl>
                    <FormLabel>Bank Diary Photo</FormLabel>
                    <Input type="file" onChange={(e) => handleSingleUpload(e, "bank_diary")} />
                </FormControl>

                <FormControl>
                    <FormLabel>Letter Head</FormLabel>
                    <Input type="file" onChange={(e) => handleSingleUpload(e, "letter_head")} />
                </FormControl>

              

            </SimpleGrid>

            {/*  Modal Preview */}
            <Modal isOpen={shopModal.isOpen} onClose={shopModal.onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalCloseButton />

                    <ModalBody p={9}>
                        <SimpleGrid columns={{base:2,md:3}} spacing={4}>
                            {shopPreview.map((url, i) => (
                                <Image
                                    key={i}
                                    src={url}
                                    h="250px"
                                    width="200px"
                                    objectFit="cover"
                                    borderRadius="md"
                                />
                            ))}
                        </SimpleGrid>
                    </ModalBody>
                </ModalContent>
            </Modal>
            {/* cheque model  */}
            <Modal isOpen={chequeModal.isOpen} onClose={chequeModal.onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalCloseButton />

                    <ModalBody p={9}>
                        <SimpleGrid columns={{base:2,md:3}} spacing={4}>
                            {chequePreview.map((url, i) => (
                                <Image
                                    key={i}
                                    src={url}
                                     h="250px"
                                    width="200px"
                                    objectFit="cover"
                                    borderRadius="md"
                                />
                            ))}
                        </SimpleGrid>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default DistributorDocuments;