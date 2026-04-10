import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Text,
  Box,
  Flex,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Image,
  SimpleGrid,
} from "@chakra-ui/react";

const ViewPartnersModal = ({ isOpen, onClose, partners }) => {
  
  const businessPartners = Array.isArray(partners)
    ? partners
    : partners
    ? [partners]
    : [];


  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="12px" overflow="hidden" mx={4}>

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
          <Text fontWeight="bold">View Partners</Text>
          <ModalCloseButton position="static" color="white" />
        </Flex>

        <ModalBody>
          {businessPartners.length === 0 ? (
            <Text>No Partners Found</Text>
          ) : (
            businessPartners.map((partner, index) => (
              <Box
                key={index}
                border="1px solid #E2E8F0"
                borderRadius="10px"
                p={4}
                mb={4}
              >
                {/* IMAGE */}
                <Flex justify="center" mb={3}>
                  <Image
                    src={partner?.photo || ""}
                    alt="partner"
                    boxSize="80px"
                    borderRadius="full"
                  />
                </Flex>

                {/* DETAILS */}
                <SimpleGrid columns={[1, 2]} spacing={3}>
                  <Text><b>Name:</b> {partner?.name || "-"}</Text>
                  <Text><b>Father Name:</b> {partner?.father_name || "-"}</Text>
                  <Text><b>PAN No:</b> {partner?.pan_no || "-"}</Text>
                  <Text><b>Aadhar No:</b> {partner?.aadhar_no || "-"}</Text>
                  <Text><b>State:</b> {partner?.state || "-"}</Text>
                  <Text><b>District:</b> {partner?.district || "-"}</Text>
                  <Text><b>Tehsil:</b> {partner?.tehsil || "-"}</Text>
                  <Text><b>Pincode:</b> {partner?.pincode || "-"}</Text>
                  <Text><b>Mobile No:</b> {partner?.mobile_no || "-"}</Text>
                  <Text><b>Alt Mobile:</b> {partner?.alt_mobile_no || "-"}</Text>
                  <Text><b>Role:</b> {partner?.role || "-"}</Text>
                </SimpleGrid>
              </Box>
            ))
          )}
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>

      </ModalContent>
    </Modal>
  );
};

export default ViewPartnersModal;