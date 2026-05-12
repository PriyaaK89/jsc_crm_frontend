import React, { useEffect, useState } from "react";

import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    Card,
    CardBody,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    Grid,
    Heading,
    HStack,
    Input,
    Select,
    Spinner,
    Text,
    useToast,
    VStack,
} from "@chakra-ui/react";

import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";

import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const CreateUnitOfMeasure = () => {

    const toast = useToast();

    const [loading, setLoading] = useState(false);

    const [uqcLoading, setUqcLoading] = useState(false);

    const [unitLoading, setUnitLoading] = useState(false);

    const [unitCodes, setUnitCodes] = useState([]);

    const [simpleUnits, setSimpleUnits] = useState([]);

    const [formData, setFormData] = useState({
        type: "",

        symbol: "",

        formal_name: "",

        uqc: "",

        decimal_places: 0,

        first_unit_id: "",

        conversion_value: "",

        second_unit_id: "",
    });

    // ================= GET UQC =================

    const getUniqueQuantityCodes = async () => {

        try {

            setUqcLoading(true);

            const response = await API.get(
                API_ENDPOINTS.get_unique_quantity_codes
            );

            if (response?.data?.success) {

                setUnitCodes(response?.data?.data || []);
            }

        } catch (error) {

            console.log(error);

        } finally {

            setUqcLoading(false);
        }
    };

    // ================= GET SIMPLE UNITS =================

    const getSimpleUnits = async () => {
        try {

            setUnitLoading(true);

            const response = await API.get(
                API_ENDPOINTS.getSimpleUnitList
            );

            if (response?.data?.success) {

                setSimpleUnits(response?.data?.data || []);
            }

        } catch (error) {

            console.log(error);

        } finally {

            setUnitLoading(false);
        }
    };

    useEffect(() => {

        getUniqueQuantityCodes();

        getSimpleUnits();

    }, []);

    // ================= HANDLE CHANGE =================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "symbol"
                    ? value.toUpperCase()
                    : value,
        }));
    };

    // ================= RESET FORM =================

    const resetForm = () => {

        setFormData({
            type: "",
            symbol: "",
            formal_name: "",
            uqc: "",
            decimal_places: 0,
            first_unit_id: "",
            conversion_value: "",
            second_unit_id: "",
        });
    };

    // ================= CREATE UNIT =================

    const handleCreateUnit = async () => {

        try {

            // ===== VALIDATIONS =====

            if (!formData.type) {

                return toast({
                    title: "Please select type",
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                });
            }

            if (formData.type === "SIMPLE") {

                if (!formData.symbol) {

                    return toast({
                        title: "Please enter symbol",
                        status: "warning",
                        duration: 3000,
                        isClosable: true,
                    });
                }

                if (!formData.uqc) {

                    return toast({
                        title: "Please select UQC",
                        status: "warning",
                        duration: 3000,
                        isClosable: true,
                    });
                }
            }

            if (formData.type === "COMPOUND") {

                if (
                    formData.first_unit_id ===
                    formData.second_unit_id
                ) {
                    return toast({
                        title: "Both units cannot be same",
                        status: "warning",
                        duration: 3000,
                        isClosable: true,
                    });
                }

                if (
                    !formData.first_unit_id ||
                    !formData.conversion_value ||
                    !formData.second_unit_id
                ) {

                    return toast({
                        title: "Please fill all compound unit fields",
                        status: "warning",
                        duration: 3000,
                        isClosable: true,
                    });
                }
            }

            setLoading(true);

            const payload =
                formData.type === "SIMPLE"
                    ? {
                        type: formData.type,
                        symbol: formData.symbol,
                        formal_name: formData.formal_name,
                        uqc: formData.uqc,
                        decimal_places: formData.decimal_places,
                    }
                    : {
                        type: formData.type,
                        symbol: `${firstUnit?.symbol} OF ${secondUnit?.symbol}`,
                        first_unit_id: formData.first_unit_id,
                        conversion_value: formData.conversion_value,
                        second_unit_id: formData.second_unit_id,
                    };

            const response = await API.post(
                API_ENDPOINTS.create_unit_of_measure,
                payload
            );

            if (response?.data?.success) {

                toast({
                    title: "Unit created successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

                resetForm();

                getSimpleUnits();
            }

        } catch (error) {

            console.log(error);

            toast({
                title:
                    error?.response?.data?.message ||
                    "Something went wrong",
                status: "error",
                duration: 3000,
                isClosable: true,
            });

        } finally {

            setLoading(false);
        }
    };

    const firstUnit = simpleUnits.find(
        (item) => item.id == formData.first_unit_id
    );

    const secondUnit = simpleUnits.find(
        (item) => item.id == formData.second_unit_id
    );

    return (
        <>
            <Box
                bg="white"
                mt={{ base: 2, md: 5 }}
                px={{ base: 3, md: 6 }}
                py={{ base: 3, md: 4 }}
                borderRadius="lg"
                boxShadow="sm"
            >
                {/* ================= BREADCRUMB ================= */}

                <HStack justifyContent="space-between" mb={4}>
                    <Breadcrumb color="gray.500">

                        <BreadcrumbItem>
                            <BreadcrumbLink
                                as={Link}
                                to="/dashboard"
                            >
                                <GoHomeFill color="#5570F1" />
                            </BreadcrumbLink>
                        </BreadcrumbItem>

                        <BreadcrumbItem>
                            <BreadcrumbLink
                                isCurrentPage
                                fontSize="14px"
                            >
                                Create Unit of Measure
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                </HStack>

                {/* ================= HEADING ================= */}

                <Heading
                    size="md"
                    color="gray.700"
                    fontSize="22px"
                    mb={5}
                >
                    Create Unit of Measure
                </Heading>

                {/* ================= CARD ================= */}

                <Card border="1px solid" borderColor="gray.200">
                    <CardBody>

                        <VStack spacing={5} align="stretch">

                            {/* ================= TYPE ================= */}

                            <FormControl isRequired>

                                <FormLabel fontSize="14px">
                                    Type
                                </FormLabel>

                                <Select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    placeholder="Select Type"
                                >
                                    <option value="SIMPLE">
                                        Simple
                                    </option>

                                    <option value="COMPOUND">
                                        Compound
                                    </option>
                                </Select>

                            </FormControl>

                            {/* ================= SIMPLE UI ================= */}

                            {formData.type === "SIMPLE" && (
                                <>

                                    <Divider />

                                    <Grid
                                        templateColumns={{
                                            base: "1fr",
                                            md: "1fr 1fr",
                                        }}
                                        gap={5}
                                    >

                                        {/* SYMBOL */}

                                        <FormControl isRequired>

                                            <FormLabel fontSize="14px">
                                                Symbol
                                            </FormLabel>

                                            <Input
                                                name="symbol"
                                                value={formData.symbol}
                                                onChange={handleChange}
                                                placeholder="Enter Symbol"
                                            />

                                        </FormControl>

                                        {/* FORMAL NAME */}

                                        <FormControl>

                                            <FormLabel fontSize="14px">
                                                Formal Name
                                            </FormLabel>

                                            <Input
                                                name="formal_name"
                                                value={formData.formal_name}
                                                onChange={handleChange}
                                                placeholder="Enter Formal Name"
                                            />

                                        </FormControl>

                                        {/* UQC */}

                                        <FormControl isRequired>

                                            <FormLabel fontSize="14px">
                                                Unit Quantity Code (UQC)
                                            </FormLabel>

                                            <Select
                                                name="uqc"
                                                value={formData.uqc}
                                                onChange={handleChange}
                                                placeholder="Select UQC"
                                            >

                                                {uqcLoading ? (
                                                    <option>
                                                        Loading...
                                                    </option>
                                                ) : (
                                                    unitCodes?.map((item) => (
                                                        <option
                                                            key={item.id}
                                                            value={item.code}
                                                        >
                                                            {item.code} - {item.description}
                                                        </option>
                                                    ))
                                                )}

                                            </Select>

                                        </FormControl>

                                        {/* DECIMAL */}

                                        <FormControl>

                                            <FormLabel fontSize="14px">
                                                No of Decimal Places
                                            </FormLabel>

                                            <Input
                                                type="number"
                                                name="decimal_places"
                                                value={formData.decimal_places}
                                                onChange={handleChange}
                                                min={0}
                                            />

                                        </FormControl>

                                    </Grid>
                                </>
                            )}

                            {/* ================= COMPOUND UI ================= */}

                            {formData.type === "COMPOUND" && (
                                <>

                                    <Divider />

                                    <Box
                                        border="1px solid"
                                        borderColor="gray.200"
                                        borderRadius="md"
                                        p={5}
                                        bg="gray.50"
                                    >

                                        <Text
                                            mb={5}
                                            fontWeight="600"
                                            color="gray.700"
                                        >
                                            Compound Unit Configuration
                                        </Text>

                                        <Grid
                                            templateColumns={{
                                                base: "1fr",
                                                md: "1fr 1fr 1fr",
                                            }}
                                            gap={5}
                                            alignItems="end"
                                        >

                                            {/* FIRST UNIT */}

                                            <FormControl isRequired>

                                                <FormLabel fontSize="14px">
                                                    First Unit
                                                </FormLabel>

                                                <Select
                                                    name="first_unit_id"
                                                    value={formData.first_unit_id}
                                                    onChange={handleChange}
                                                    placeholder="Select Unit"
                                                >

                                                    {simpleUnits?.map((item) => (
                                                        <option
                                                            key={item.id}
                                                            value={item.id}
                                                        >
                                                            {/* {item.symbol} */}
                                                            {item.symbol} ({item.formal_name})
                                                        </option>
                                                    ))}

                                                </Select>

                                            </FormControl>

                                            {/* CONVERSION */}

                                            <FormControl isRequired>

                                                <FormLabel fontSize="14px">
                                                    Conversion Value
                                                </FormLabel>

                                                <Input
                                                    type="number"
                                                    name="conversion_value"
                                                    value={formData.conversion_value}
                                                    onChange={handleChange}
                                                    placeholder="Enter Conversion"
                                                />

                                            </FormControl>

                                            {/* SECOND UNIT */}

                                            <FormControl isRequired>

                                                <FormLabel fontSize="14px">
                                                    Second Unit
                                                </FormLabel>

                                                <Select
                                                    name="second_unit_id"
                                                    value={formData.second_unit_id}
                                                    onChange={handleChange}
                                                    placeholder="Select Unit"
                                                >

                                                    {simpleUnits?.map((item) => (
                                                        <option
                                                            key={item.id}
                                                            value={item.id}
                                                            disabled={
                                                                item.id ==
                                                                formData.first_unit_id
                                                            }
                                                        >
                                                            {/* {item.symbol} */}
                                                            {item.symbol} ({item.formal_name})
                                                        </option>
                                                    ))}

                                                </Select>

                                            </FormControl>

                                        </Grid>

                                        {/* PREVIEW */}

                                        {formData.first_unit_id &&
                                            formData.conversion_value &&
                                            formData.second_unit_id && (
                                                <Flex
                                                    mt={5}
                                                    justify="center"
                                                >

                                                    <Box
                                                        bg="blue.50"
                                                        px={5}
                                                        py={3}
                                                        borderRadius="md"
                                                        border="1px solid"
                                                        borderColor="blue.100"
                                                    >

                                                        <Text
                                                            fontWeight="600"
                                                            color="blue.700"
                                                        >
                                                            Example:
                                                        </Text>

                                                        <Text
                                                            color="gray.700"
                                                            mt={1}
                                                            fontWeight="600"
                                                        >
                                                            1 {firstUnit?.symbol}
                                                            {" = "}
                                                            {formData.conversion_value}
                                                            {" "}
                                                            {secondUnit?.symbol}
                                                        </Text>

                                                    </Box>

                                                </Flex>
                                            )}

                                    </Box>

                                </>
                            )}

                            {/* ================= BUTTON ================= */}

                            <Flex justify="flex-end">

                                <Button
                                     bg="#237086"
                  fontWeight="500"
                  fontSize="14px"
                  color="white"
                  _hover={{
                    bg: "#1B5A6B",
                  }}
                  px={8}
                  borderRadius="12px"
                                    onClick={handleCreateUnit}
                                    isLoading={loading}
                                    loadingText="Creating"
                                >
                                    Create Unit
                                </Button>

                            </Flex>

                        </VStack>

                    </CardBody>
                </Card>
            </Box>
        </>
    );
};

export default CreateUnitOfMeasure;