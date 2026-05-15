import React, { useEffect, useState } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, VStack, FormControl, FormLabel, Input, Text, useToast, Spinner, Box, Divider, Grid, Select, HStack, Badge} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const initialState = {
    type: "SIMPLE",
    symbol: "",
    formal_name: "",
    uqc: "",
    decimal_places: 0,
    first_unit_id: "",
    conversion_value: "",
    second_unit_id: ""
};

const EditUnitOfMeasureModal = ({ isEditModelOpen, onEditModelClose, selectedId, getUnitList }) => {

    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [unitDetails, setUnitDetails] = useState(initialState);
    const [unitList, setUnitList] = useState([]);

    // ================= RESET FORM =================

    const resetForm = () => {
        setUnitDetails(initialState);
    };

    // ================= GET ALL UNITS =================

    const getAllUnits = async () => {

        try {

            const response = await API.get(
                `${API_ENDPOINTS.getUnitList}?page=1&limit=100`
            );

            if (response?.data?.success) {

                const simpleUnits = response?.data?.data?.filter(
                    (item) => item?.type === "SIMPLE"
                );

                setUnitList(simpleUnits || []);
            }

        } catch (error) {

            console.log(error);
        }
    };

    // ================= GET UNIT BY ID =================

    const getUnitById = async () => {
        try {
            setFetchLoading(true);
            const response = await API.get(
                `${API_ENDPOINTS.get_unit_by_id}/${selectedId}`
            );

            if (response?.status === 200) {
                const data = response?.data?.data;
                setUnitDetails({
                    type: data?.type || "SIMPLE",
                    symbol: data?.symbol || "",
                    formal_name: data?.formal_name || "",
                    uqc: data?.uqc || "",
                    decimal_places: data?.decimal_places || 0,
                    first_unit_id: data?.first_unit_id || "",
                    conversion_value: data?.conversion_value || "",
                    second_unit_id: data?.second_unit_id || ""
                });
            }

        } catch (error) {
            console.log(error);
            toast({
                title: "Error",
                description: "Failed to fetch unit details",
                status: "error",
                duration: 3000,
                isClosable: true
            });

        } finally {
            setFetchLoading(false);
        }
    };

    // ================= HANDLE CHANGE =================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setUnitDetails((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // ================= UPDATE UNIT =================

    const handleEditUnitOfMeasure = async () => {

        try {

            setLoading(true);

            // SIMPLE VALIDATION

            if (unitDetails?.type === "SIMPLE") {

                if (!unitDetails?.symbol) {

                    toast({
                        title: "Validation Error",
                        description: "Symbol is required",
                        status: "warning",
                        duration: 3000,
                        isClosable: true
                    });

                    return;
                }
            }

            // COMPOUND VALIDATION

            if (unitDetails?.type === "COMPOUND") {

                if (
                    !unitDetails?.first_unit_id ||
                    !unitDetails?.conversion_value ||
                    !unitDetails?.second_unit_id
                ) {

                    toast({
                        title: "Validation Error",
                        description: "All compound fields are required",
                        status: "warning",
                        duration: 3000,
                        isClosable: true
                    });

                    return;
                }
            }

            const payload = {
                type: unitDetails?.type,
                symbol: unitDetails?.symbol,
                formal_name: unitDetails?.formal_name,
                uqc: unitDetails?.uqc,
                decimal_places: Number(unitDetails?.decimal_places),
                first_unit_id:
                    unitDetails?.first_unit_id || null,
                conversion_value:
                    unitDetails?.conversion_value || null,
                second_unit_id:
                    unitDetails?.second_unit_id || null
            };

            const response = await API.put( `${API_ENDPOINTS.edit_unitOfMeasure}/${selectedId}`, payload );

            if (response?.data?.success) {
                toast({
                    title: "Success",
                    description: response?.data?.message,
                    status: "success",
                    duration: 3000,
                    isClosable: true
                });
                getUnitList();
                resetForm();
                setTimeout(()=>{
                    onEditModelClose();
                },500)
            }

        } catch (error) {

            console.log(error);

            toast({
                title: "Error",
                description:
                    error?.response?.data?.message ||
                    "Something went wrong",
                status: "error",
                duration: 3000,
                isClosable: true
            });

        } finally {
            setLoading(false);
        }
    };

    // ================= USE EFFECT =================

    useEffect(() => {
        if (isEditModelOpen && selectedId) {
            getUnitById();
            getAllUnits();
        }
    }, [isEditModelOpen, selectedId]);

    // ================= CLOSE MODAL =================

    const handleClose = () => {
        resetForm();
        onEditModelClose();
    };

    return (

        <Modal isOpen={isEditModelOpen} onClose={handleClose} isCentered size="lg" >

            <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(3px)" />
            <ModalContent borderRadius="20px" overflow="hidden">

                {/* ================= HEADER ================= */}

                <Box bg="#c3dae0" px={6} py={5} borderBottom="1px solid" borderColor="gray.100" >
                    <ModalHeader p={0}>
                        <VStack spacing={2} align="start" >
                            <HStack gap={2}>
                                <Text fontSize="16px" fontWeight="600" color="gray.700" > Edit Unit of Measure </Text>
                                <Badge colorScheme={unitDetails?.type === "SIMPLE" ? "green" : "purple"} fontSize="14px" fontWeight="500" textTransform="capitalize"> ({unitDetails?.type}) </Badge>
                            </HStack>
                        </VStack>
                    </ModalHeader>
                    <ModalCloseButton top="10px" right="10px" />
                </Box>

                <ModalBody py={6} px={6}>
                    { fetchLoading ? 
                        ( <Box py={10} textAlign="center"> <Spinner size="lg" color="#237086" /> </Box> ) :
                        (
                            <VStack spacing={5}>
                                <FormControl>
                                    <FormLabel fontWeight="600"> Unit Type </FormLabel>
                                    <Select name="type" value={unitDetails?.type} onChange={handleChange} h="40px" borderRadius="12px" borderColor="gray.300" fontSize="14px"
                                      _focus={{ borderColor: "#237086", boxShadow: "0 0 0 1px #237086" }}>
                                        <option value="SIMPLE"> SIMPLE </option>
                                        <option value="COMPOUND"> COMPOUND </option>
                                    </Select>
                                </FormControl>

                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} w="100%" >
                                    <FormControl>
                                        <FormLabel fontWeight="600"> Symbol </FormLabel>
                                        <Input name="symbol" value={unitDetails?.symbol} onChange={handleChange} placeholder="Enter symbol"  h="40px" borderRadius="12px" borderColor="gray.300" fontSize="14px"
                                         _focus={{ borderColor: "#237086", boxShadow: "0 0 0 1px #237086" }} />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontWeight="600"> Formal Name </FormLabel>
                                        <Input name="formal_name" value={unitDetails?.formal_name} onChange={handleChange} placeholder="Enter formal name"  h="40px" borderRadius="12px" borderColor="gray.300" fontSize="14px"
                                          _focus={{ borderColor: "#237086", boxShadow: "0 0 0 1px #237086" }} />
                                    </FormControl>

                                </Grid>

                                {/* UQC + DECIMAL */}

                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                                    gap={4}
                                    w="100%" >

                                    <FormControl>
                                        <FormLabel fontWeight="600"> UQC </FormLabel>
                                        <Input name="uqc" value={unitDetails?.uqc} onChange={handleChange} placeholder="Enter UQC" h="40px" borderRadius="12px" borderColor="gray.300" fontSize="14px"
                                      _focus={{ borderColor: "#237086", boxShadow: "0 0 0 1px #237086" }} />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontWeight="600"> Decimal Places </FormLabel>
                                        <Input type="number" name="decimal_places" value={unitDetails?.decimal_places} onChange={handleChange} placeholder="Enter decimal places" h="40px" borderRadius="12px" borderColor="gray.300" fontSize="14px"
                                      _focus={{ borderColor: "#237086", boxShadow: "0 0 0 1px #237086" }} />
                                    </FormControl>

                                </Grid>

                                {/* COMPOUND FIELDS */}

                                { unitDetails?.type === "COMPOUND" && (

                                        <>

                                            <Divider />
                                            <Text alignSelf="start" fontWeight="600" color="gray.700" fontSize="12px"> Compound Unit Details </Text>

                                            <Grid
                                                templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                                                gap={4}
                                                w="100%" >

                                                {/* FIRST UNIT */}

                                                <FormControl>

                                                    <FormLabel fontWeight="600">
                                                        First Unit
                                                    </FormLabel>

                                                    <Select
                                                        name="first_unit_id"
                                                        value={unitDetails?.first_unit_id}
                                                        onChange={handleChange}
                                                       h="40px" borderRadius="12px" borderColor="gray.300" fontSize="14px"
                                      _focus={{ borderColor: "#237086", boxShadow: "0 0 0 1px #237086" }}
                                                    >

                                                        <option value="">
                                                            Select
                                                        </option>

                                                        {
                                                            unitList?.map((item) => (
                                                                <option key={item?.id} value={item?.id} >
                                                                    {item?.symbol}
                                                                </option>
                                                            ))
                                                        }

                                                    </Select>

                                                </FormControl>

                                                {/* CONVERSION */}

                                                <FormControl>

                                                    <FormLabel fontWeight="600">
                                                        Conversion Value
                                                    </FormLabel>

                                                    <Input
                                                        type="number"
                                                        name="conversion_value"
                                                        value={unitDetails?.conversion_value}
                                                        onChange={handleChange}
                                                        placeholder="Enter conversion value"
                                                       h="40px" borderRadius="12px" borderColor="gray.300" fontSize="14px"
                                      _focus={{ borderColor: "#237086", boxShadow: "0 0 0 1px #237086" }} />

                                                </FormControl>

                                            </Grid>

                                            {/* SECOND UNIT */}

                                            <FormControl>

                                                <FormLabel fontWeight="600">
                                                    Second Unit
                                                </FormLabel>

                                                <Select
                                                    name="second_unit_id"
                                                    value={unitDetails?.second_unit_id}
                                                    onChange={handleChange}
                                                    h="40px" borderRadius="12px" borderColor="gray.300" fontSize="14px"
                                      _focus={{ borderColor: "#237086", boxShadow: "0 0 0 1px #237086" }}
                                                >

                                                    <option value="">
                                                        Select
                                                    </option>

                                                    {
                                                        unitList?.map((item) => (

                                                            <option key={item?.id} value={item?.id} >
                                                                {item?.symbol}
                                                            </option>

                                                        ))
                                                    }

                                                </Select>

                                            </FormControl>

                                            {/* PREVIEW */}

                                            {
                                                unitDetails?.first_unit_id &&
                                                unitDetails?.conversion_value &&
                                                unitDetails?.second_unit_id && (

                                                    <Box w="100%" bg="gray.50" p={4}
                                                        borderRadius="12px" border="1px solid" borderColor="gray.200">

                                                        <Text fontWeight="600" color="gray.700" fontSize="12px" >

                                                            1 {

                                                                unitList?.find(
                                                                    (u) =>
                                                                        Number(u?.id) ===
                                                                        Number(unitDetails?.first_unit_id)
                                                                )?.symbol
                                                            }

                                                            {" = "}

                                                            {unitDetails?.conversion_value}

                                                            {" "}

                                                            {
                                                                unitList?.find(
                                                                    (u) =>
                                                                        Number(u?.id) ===
                                                                        Number(unitDetails?.second_unit_id)
                                                                )?.symbol
                                                            }

                                                        </Text>

                                                    </Box>

                                                )
                                            }

                                        </>
                                    )
                                }

                            </VStack>

                        )
                    }

                </ModalBody>

                <Divider />

                {/* ================= FOOTER ================= */}

                <ModalFooter gap={3} py={4}>

                    <Button
                        variant="outline"
                        borderRadius="12px"
                        fontWeight="500" fontSize="14px"
                        onClick={handleClose} >
                        Cancel
                    </Button>

                    <Button
                        bg="#237086"
                        color="white"
                        _hover={{ bg: "#1B5A6B" }} fontWeight="500"
                        borderRadius="12px"
                        minW="160px" fontSize="14px"
                        onClick={handleEditUnitOfMeasure}
                        isLoading={loading}
                        loadingText="Updating..."
                      >
                        Update Unit
                    </Button>
                </ModalFooter>
            </ModalContent>

        </Modal>
    );
};

export default EditUnitOfMeasureModal;