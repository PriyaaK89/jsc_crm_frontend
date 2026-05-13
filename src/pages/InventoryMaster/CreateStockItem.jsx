import React, { useEffect, useState } from "react";
import {
    Box, Button, Flex, FormControl, FormLabel, Grid, GridItem, Heading,
    Input, Select, Text, useToast, VStack, Divider, Table, Thead, Tbody, Tr, Th, Td, Checkbox, Spinner,
    HStack,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink
} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { Link } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";

const CreateStockItem = () => {
    const toast = useToast();

    const [loading, setLoading] = useState(false);

    const [stockGroups, setStockGroups] = useState([]);
    const [stockCategories, setStockCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [godowns, setGodowns] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState([]);

    const [formData, setFormData] = useState({
        item_name: "",
        stock_group_id: "",
        stock_category_id: "",
        unit_id: "",

        gst_applicable: "",
set_gst_details: "",

        type_of_supply: "Goods",
        rate_of_duty: "",

        description: "",

        gst_details: {
            gst_description: "",
            hsn_sac: "",
            is_non_gst_goods: false,
            calculation_type: "On Value",
            taxability: "",

            integrated_tax: "",
            central_tax: "",
            state_tax: "",
            cess: "",
        },

        opening_stock: {
            godown_id: "",
            batch_no: "",
            mfg_date: "",
            expiry_date: "",
            quantity: "",
            rate: "",
            per_unit_id: "",
            amount: "",
        },
    });

    // =========================
    // HANDLE CHANGE
    // =========================

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // =========================
    // GST CHANGE
    // =========================

    const handleGSTChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            gst_details: {
                ...prev.gst_details,
                [name]: type === "checkbox" ? checked : value,
            },
        }));
    };

    // =========================
    // OPENING STOCK CHANGE
    // =========================

    const handleOpeningStockChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            opening_stock: {
                ...prev.opening_stock,
                [name]: value,
            },
        }));
    };

    // =========================
    // GET DROPDOWN DATA
    // =========================

    const getStockGroups = async () => {
        try {
            const response = await API.get(
                API_ENDPOINTS.stock_group_list
            );

            setStockGroups(response?.data?.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    const getStockCategories = async () => {
        try {
            const response = await API.get(
                API_ENDPOINTS.get_categories_by_stock_group
            );

            setStockCategories(response?.data?.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    const getUnits = async () => {
        try {
            const response = await API.get(
                API_ENDPOINTS.getUnitList
            );

            setUnits(response?.data?.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    const getGodowns = async () => {
        try {
            const response = await API.get(
                API_ENDPOINTS.godown_list
            );

            setGodowns(response?.data?.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    // =========================
    // CREATE STOCK ITEM
    // =========================

    const handleCreateStockItem = async () => {
        try {
            setLoading(true);

            const payload = {
                ...formData,

                gst_applicable: Number(formData.gst_applicable),
set_gst_details: Number(formData.set_gst_details),

                gst_details: {
                    ...formData.gst_details,
                    is_non_gst_goods:
                        formData.gst_details.is_non_gst_goods ? 1 : 0,
                },
            };

            const response = await API.post(
                API_ENDPOINTS.create_stock_item,
                payload
            );

            toast({
                title: "Success",
                description: response?.data?.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            console.log(response?.data);

        } catch (error) {
            console.log(error);

            toast({
                title: "Error",
                description:
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

    // =========================
    // USE EFFECT
    // =========================

    useEffect(() => {
        getStockGroups();
        getStockCategories();
        getUnits();
        getGodowns();
    }, []);

    return (
        <Box bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="md">

            <HStack justifyContent="space-between">
                <Breadcrumb
                    color="#8B8D97"
                    padding="10px 0px 1rem 0px"
                >
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
                            color="#8B8D97"
                            fontSize="13px"
                        >
                            View Assigned Target List
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>
            </HStack>
            <Heading size="lg" mb={6}>
                Create Stock Item
            </Heading>

                <VStack spacing={6} align="stretch">

                    {/* BASIC INFO */}

                    <Box>
                        <Text
                            fontSize="18px"
                            fontWeight="600"
                            mb={5}
                        >
                            Basic Information
                        </Text>

                        <Grid
                            templateColumns="repeat(2, 1fr)"
                            gap={5}
                        >

                            <GridItem>
                                <FormControl isRequired>
                                    <FormLabel>Item Name</FormLabel>

                                    <Input
                                        name="item_name"
                                        value={formData.item_name}
                                        onChange={handleChange}
                                        placeholder="Enter Item Name"
                                    />
                                </FormControl>
                            </GridItem>

                            <GridItem>
                                <FormControl isRequired>
                                    <FormLabel>Stock Group</FormLabel>

                                    <Select
                                        placeholder="Select Stock Group"
                                        name="stock_group_id"
                                        value={formData.stock_group_id}
                                        onChange={handleChange}
                                    >
                                        {stockGroups?.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.name}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                            </GridItem>

                            <GridItem>
                                <FormControl>
                                    <FormLabel>Category</FormLabel>

                                    <Select
                                        placeholder="Select Category"
                                        name="stock_category_id"
                                        value={formData.stock_category_id}
                                        onChange={handleChange}
                                    >
                                        {stockCategories?.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.name}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                            </GridItem>

                            <GridItem>
                                <FormControl isRequired>
                                    <FormLabel>Unit</FormLabel>

                                    <Select
                                        placeholder="Select Unit"
                                        name="unit_id"
                                        value={formData.unit_id}
                                        onChange={handleChange}
                                    >
                                        {units?.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.symbol}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                            </GridItem>

                            <GridItem>
                                <FormControl>
                                    <FormLabel>Type Of Supply</FormLabel>

                                    <Select
                                        name="type_of_supply"
                                        value={formData.type_of_supply}
                                        onChange={handleChange}
                                    >
                                        <option value="Goods">
                                            Goods
                                        </option>

                                        <option value="Services">
                                            Services
                                        </option>
                                    </Select>
                                </FormControl>
                            </GridItem>

                            <GridItem>
                                <FormControl>
                                    <FormLabel>Rate Of Duty</FormLabel>

                                    <Input
                                        type="number"
                                        name="rate_of_duty"
                                        value={formData.rate_of_duty}
                                        onChange={handleChange}
                                        placeholder="Enter Rate"
                                    />
                                </FormControl>
                            </GridItem>

                        </Grid>

                      <Grid
  templateColumns="repeat(2, 1fr)"
  gap={5}
  mt={5}
>

  {/* GST APPLICABLE */}

  <GridItem>
    <FormControl>
      <FormLabel>GST Applicable</FormLabel>

      <Select
        placeholder="Select Option"
        name="gst_applicable"
        value={formData.gst_applicable}
        onChange={handleChange}
      >
        <option value="1">
          Applicable
        </option>

        <option value="0">
          Not Applicable
        </option>
      </Select>
    </FormControl>
  </GridItem>

  {/* SET GST DETAILS */}

  <GridItem>
    <FormControl>
      <FormLabel>
        Set / Alter GST Details
      </FormLabel>

      <Select
        placeholder="Select Option"
        name="set_gst_details"
        value={formData.set_gst_details}
        onChange={handleChange}
      >
        <option value="1">
          Yes
        </option>

        <option value="0">
          No
        </option>
      </Select>
    </FormControl>
  </GridItem>

</Grid>

                    </Box>

                    {/* GST DETAILS */}

                    {formData.set_gst_details === "1" && (
                        <Box
                            border="1px solid #E2E8F0"
                            borderRadius="10px"
                            p={5}
                        >

                            <Text
                                fontSize="18px"
                                fontWeight="600"
                                mb={5}
                            >
                                GST Details
                            </Text>

                            <Grid
                                templateColumns="repeat(2, 1fr)"
                                gap={5}
                            >

                                <GridItem>
                                    <FormControl>
                                        <FormLabel>Description</FormLabel>

                                        <Input
                                            name="gst_description"
                                            value={
                                                formData.gst_details.gst_description
                                            }
                                            onChange={handleGSTChange}
                                        />
                                    </FormControl>
                                </GridItem>

                                <GridItem>
                                    <FormControl>
                                        <FormLabel>HSN/SAC</FormLabel>

                                        <Input
                                            name="hsn_sac"
                                            value={
                                                formData.gst_details.hsn_sac
                                            }
                                            onChange={handleGSTChange}
                                        />
                                    </FormControl>
                                </GridItem>

                                <GridItem>
                                    <FormControl>
                                        <FormLabel>Taxability</FormLabel>

                                        <Select
                                            name="taxability"
                                            value={
                                                formData.gst_details.taxability
                                            }
                                            onChange={handleGSTChange}
                                        >
                                            <option value="">
                                                Select
                                            </option>

                                            <option value="Taxable">
                                                Taxable
                                            </option>

                                            <option value="Exempt">
                                                Exempt
                                            </option>
                                        </Select>
                                    </FormControl>
                                </GridItem>

                            </Grid>

                            <Divider my={6} />

                            <Table variant="simple">

                                <Thead>
                                    <Tr>
                                        <Th>Tax Type</Th>
                                        <Th>Rate (%)</Th>
                                    </Tr>
                                </Thead>

                                <Tbody>

                                    <Tr>
                                        <Td>Integrated Tax</Td>

                                        <Td>
                                            <Input
                                                type="number"
                                                name="integrated_tax"
                                                value={
                                                    formData.gst_details
                                                        .integrated_tax
                                                }
                                                onChange={handleGSTChange}
                                            />
                                        </Td>
                                    </Tr>

                                    <Tr>
                                        <Td>Central Tax</Td>

                                        <Td>
                                            <Input
                                                type="number"
                                                name="central_tax"
                                                value={
                                                    formData.gst_details.central_tax
                                                }
                                                onChange={handleGSTChange}
                                            />
                                        </Td>
                                    </Tr>

                                    <Tr>
                                        <Td>State Tax</Td>

                                        <Td>
                                            <Input
                                                type="number"
                                                name="state_tax"
                                                value={
                                                    formData.gst_details.state_tax
                                                }
                                                onChange={handleGSTChange}
                                            />
                                        </Td>
                                    </Tr>

                                    <Tr>
                                        <Td>Cess</Td>

                                        <Td>
                                            <Input type="number" name="cess" value={formData.gst_details.cess} onChange={handleGSTChange} />
                                        </Td>
                                    </Tr>

                                </Tbody>

                            </Table>

                        </Box>
                    )}

                    {/* OPENING STOCK */}

                    <Box
                        border="1px solid #E2E8F0"
                        borderRadius="10px"
                        p={5}
                    >

                        <Text
                            fontSize="18px"
                            fontWeight="600"
                            mb={5}
                        >
                            Opening Stock
                        </Text>

                        <Grid
                            templateColumns="repeat(3, 1fr)"
                            gap={5}
                        >

                            <GridItem>
                                <FormControl>
                                    <FormLabel>Godown</FormLabel>

                                    <Select
                                        placeholder="Select Godown"
                                        name="godown_id"
                                        value={
                                            formData.opening_stock.godown_id
                                        }
                                        onChange={handleOpeningStockChange}
                                    >
                                        {godowns?.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.godown_name}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                            </GridItem>

                            <GridItem>
                                <FormControl>
                                    <FormLabel>Batch No</FormLabel>

                                    <Input
                                        name="batch_no"
                                        value={
                                            formData.opening_stock.batch_no
                                        }
                                        onChange={handleOpeningStockChange}
                                    />
                                </FormControl>
                            </GridItem>

                            <GridItem>
                                <FormControl>
                                    <FormLabel>MFG Date</FormLabel>

                                    <Input
                                        type="date"
                                        name="mfg_date"
                                        value={
                                            formData.opening_stock.mfg_date
                                        }
                                        onChange={handleOpeningStockChange}
                                    />
                                </FormControl>
                            </GridItem>

                            <GridItem>
                                <FormControl>
                                    <FormLabel>Expiry Date</FormLabel>

                                    <Input
                                        type="date"
                                        name="expiry_date"
                                        value={
                                            formData.opening_stock.expiry_date
                                        }
                                        onChange={handleOpeningStockChange}
                                    />
                                </FormControl>
                            </GridItem>

                            <GridItem>
                                <FormControl>
                                    <FormLabel>Quantity</FormLabel>

                                    <Input
                                        type="number"
                                        name="quantity"
                                        value={
                                            formData.opening_stock.quantity
                                        }
                                        onChange={handleOpeningStockChange}
                                    />
                                </FormControl>
                            </GridItem>

                            <GridItem>
                                <FormControl>
                                    <FormLabel>Rate</FormLabel>

                                    <Input
                                        type="number"
                                        name="rate"
                                        value={
                                            formData.opening_stock.rate
                                        }
                                        onChange={handleOpeningStockChange}
                                    />
                                </FormControl>
                            </GridItem>

                        </Grid>

                    </Box>

                    {/* BUTTON */}

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
                            onClick={handleCreateStockItem}
                            isDisabled={loading}
                        >
                            {loading ? (
                                <Spinner size="sm" />
                            ) : (
                                "Create Stock Item"
                            )}
                        </Button>

                    </Flex>

                </VStack>

        </Box>
    );
};

export default CreateStockItem;