import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, FormControl, FormLabel, Input, Textarea, Button, SimpleGrid, Box, useToast, Select, VStack, Text,} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const EditRetailerModal = ({ isOpen, onClose, selectedId, getRetailerList,}) => {

  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState([]);
  const [data, setData] = useState({
    name: "",
    firm_name: "",
    contact_number: "",
    address: "",
    firm_address: "",
    area: "",
    district: "",
    pincode: "",
  });

  const getRetailerById = async () => {
    try {
      const response = await API.get( `${API_ENDPOINTS.GET_RETAILER_BY_ID}/${selectedId}` );

      if (response?.data?.success) {
        const retailer = response?.data?.data;
        setData({
          name: retailer?.name || "",
          firm_name: retailer?.firm_name || "",
          contact_number: retailer?.contact_number || "",
          district: retailer?.district || "",
          address: retailer?.address || "",
          firm_address: retailer?.firm_address || "",
          area: retailer?.area || "",
          pincode: retailer?.pincode || "",
        });

        if (retailer?.pincode) {
          const areaRes = await API.get(
            `/areas?pincode=${retailer?.pincode}`
          );
          setAreas(
            areaRes?.data?.data || []
          );
        }
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description:
          "Failed to fetch retailer details",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

    }

  };

  useEffect(() => {
    if (isOpen && selectedId) {
      getRetailerById();
    }
  }, [isOpen, selectedId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handlePincodeChange = async (value) => {
    setData((prev) => ({
      ...prev,
      pincode: value,
    }));

    if (value.length === 6) {
      try {
        const res = await API.get( `/getstatecity/${value}` );
        const { district } = res.data.data;

        setData((prev) => ({
          ...prev,
          district,
        }));

        const areaRes = await API.get( `/areas?pincode=${value}` );
        setAreas( areaRes?.data?.data || [] );
      } catch (err) {
        console.error(
          "Pincode lookup failed",
          err
        );
      }
    }
  };

  const handleEditRetailer = async () => {
    try {
      if (!data?.name) {
        toast({
          title: "Validation Error",
          description:
            "Retailer name is required",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });

        return;
      }

      if (!data?.contact_number) {

        toast({
          title: "Validation Error",
          description:
            "Contact number is required",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });

        return;
      }

      setLoading(true);

      const payload = {

        name: data?.name,

        firm_name: data?.firm_name,

        contact_number:
          data?.contact_number,

        address: data?.address,

        firm_address:
          data?.firm_address,

        area: data?.area,

        district: data?.district,

        pincode: data?.pincode,

      };

      const response = await API.put(
        `${API_ENDPOINTS.UPDATE_RETAILER}/${selectedId}`,
        payload
      );

      if (response?.data?.success) {

        toast({
          title: "Success",
          description:
            response?.data?.message ||
            "Retailer updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // refresh parent list
        getRetailerList();

        // close modal
        onClose();

      }

    } catch (error) {

      console.log(error);

      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to update retailer",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

    } finally {

      setLoading(false);

    }

  };

  return (

    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
    >

       <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(3px)" />
           <ModalContent borderRadius="20px" overflow="hidden" >

        <Box bg="#c3dae0" px={6} py={6} borderBottom="1px solid" borderColor="gray.100" >
                 <ModalHeader p={0}>
                   <VStack spacing={2} align="start" >
                     <Box>
                       <Text fontSize="15px" fontWeight="600" color="gray.700"> Edit Retailer</Text>
                     </Box>
                   </VStack>
                 </ModalHeader>
                 <ModalCloseButton top="10px" right="10px" />
               </Box>

        <ModalBody py={6} px={6}>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
            <FormControl>
              <FormLabel> Retailer Name </FormLabel>
              <Input name="name" value={data.name} onChange={handleChange} placeholder="Retailer name" />
            </FormControl>

            <FormControl>
              <FormLabel> Firm Name </FormLabel>
              <Input name="firm_name" value={data.firm_name} onChange={handleChange} placeholder="Firm name"/>
            </FormControl>

            <FormControl>
              <FormLabel> Contact Number </FormLabel>
              <Input name="contact_number" value={data.contact_number} onChange={handleChange} placeholder="Contact number" />
            </FormControl>

            {/* Pincode */}

            <FormControl>

              <FormLabel>
                Pincode
              </FormLabel>

              <Input
                value={data.pincode}
                onChange={(e) =>
                  handlePincodeChange(
                    e.target.value
                  )
                }
                placeholder="Pincode"
              />

            </FormControl>


            {/* District */}

            <FormControl>

              <FormLabel>
                District
              </FormLabel>

              <Input
              name="district"
                value={data.district}
                isReadOnly
              />

            </FormControl>


            {/* Area */}

            <FormControl>

              <FormLabel>
                Area
              </FormLabel>

              <Select
                name="area"
                value={data.area}
                onChange={handleChange}
                placeholder="Select area"
              >

                {areas?.map(
                  (item, index) => (

                    <option
                      key={index}
                      value={item.officename}
                    >
                      {item.officename}
                    </option>

                  )
                )}

              </Select>

            </FormControl>

          </SimpleGrid>

          {/* =====================================================
                ADDRESS
          ===================================================== */}

          <FormControl mt={5}>

            <FormLabel>
              Address
            </FormLabel>

            <Textarea
              name="address"
              value={data.address}
              onChange={handleChange}
              placeholder="Address"
            />

          </FormControl>

          {/* =====================================================
                FIRM ADDRESS
          ===================================================== */}

          <FormControl mt={5}>

            <FormLabel>
              Firm Address
            </FormLabel>

            <Textarea
              name="firm_address"
              value={data.firm_address}
              onChange={handleChange}
              placeholder="Firm address"
            />

          </FormControl>

          {/* =====================================================
                BUTTON
          ===================================================== */}

          <Box
            textAlign="center"
            mt={8}
          >

            <Button
              bg="#237086"
            color="white"
            _hover={{
              bg: "#1B5A6B"
            }} fontWeight="500"
            borderRadius="12px"
            minW="160px"
              onClick={handleEditRetailer}
              isLoading={loading}
              loadingText="Updating"
            >
              Update Retailer
            </Button>

          </Box>

        </ModalBody>

      </ModalContent>

    </Modal>

  );

};

export default EditRetailerModal;