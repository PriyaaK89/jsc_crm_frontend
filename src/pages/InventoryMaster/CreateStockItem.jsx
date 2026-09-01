import React, { useEffect, useState } from "react";
import { Box, Button, Flex, FormControl, FormLabel, Grid, GridItem, Heading, Input, Select, Text, useToast, VStack, Divider, Table, Thead, Tbody, Tr, Th, Td, Checkbox, Spinner, HStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";
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
    const [selectedGroup, setSelectedGroup] = useState();

    const initialFormData = {
        item_name: "",
        stock_group_id: "",
        stock_category_id: "",
        unit_id: "",

        gst_applicable: "",
        set_gst_details: "",

        type_of_supply: "Goods",
        rate_of_duty: "",
        description: "",

        alternative_unit_id: "",
        alternative_unit_value: "",
        base_unit_value: "",

        bulk_unit_id: "",
        bulk_unit_value: "",
        bulk_base_value: "",

        is_returnable: "0",
        returnable_percentage: "",

        maintain_in_batches: "",
        track_mfg_date: "",
        use_expiry_dates: "",

        set_standard_rates: "",
        enable_cost_tracking: "",

        gst_details: {
            gst_description: "",
            hsn_sac: "",
            is_non_gst_goods: false,
            calculation_type: "On Value",
            taxability: "",
            integrated_tax: "",
            central_tax: "",
            state_tax: "",
        },

        opening_stock: {
            godown_id: null,
            batch_no: "",
            mfg_date: "",
            expiry_date: "",
            quantity: "",
            rate: "",
            supercash_price: "",
            per_unit_id: "",
            amount: "",
        },
    };

    const [formData, setFormData] = useState(initialFormData);

    const handleSelectGroup = (id) => {
        setSelectedGroup(id);
    }
    const selectedBaseUnit = units.find(
        (unit) => String(unit.id) === String(formData.unit_id)
    );

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData((prev) => ({
    //         ...prev,
    //         [name]: value,
    //         ...(name === "maintain_in_batches" &&
    //             value === "0" && {
    //             track_mfg_date: "",
    //             use_expiry_dates: "",
    //         }),
    //     }));  
    // };

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => {

            const updatedData = {
                ...prev,
                [name]: value,

                ...(name === "maintain_in_batches" &&
                    value === "0" && {
                    track_mfg_date: "",
                    use_expiry_dates: "",
                }),

                ...(name === "is_returnable" &&
                    value === "0" && {
                    returnable_percentage: "",
                }),
            };

            // AUTO SET OPENING STOCK PER UNIT
            if (name === "unit_id") {
                updatedData.opening_stock = {
                    ...prev.opening_stock,
                    per_unit_id: value,
                };
            }

            if (name === "rate_of_duty") {

                const dutyRate = parseFloat(value) || 0;

                // divide equally
                const halfTax = dutyRate / 2;

                updatedData.gst_details = {
                    ...prev.gst_details,

                    // user can still edit/remove later manually
                    central_tax: value === "" ? "" : halfTax,
                    state_tax: value === "" ? "" : halfTax,

                    // optional
                    // integrated_tax: value === "" ? "" : dutyRate,
                };
            }

            return updatedData;
        });
    };


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

    const handleOpeningStockChange = (e) => {

        const { name, value } = e.target;

        const updatedOpeningStock = {
            ...formData.opening_stock,
            [name]: value,
        };

        const quantity =
            parseFloat(updatedOpeningStock.quantity) || 0;

        const rate =
            parseFloat(updatedOpeningStock.rate) || 0;

        updatedOpeningStock.amount =
            quantity * rate;

        setFormData((prev) => ({
            ...prev,
            opening_stock: updatedOpeningStock,
        }));
    };


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
                `${API_ENDPOINTS.get_categories_by_stock_group}/${selectedGroup}`
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

        if (!formData.stock_category_id) {
            toast({
                title: "Required Field",
                description: "Please select a category.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            return;
        }

        if (!formData.alternative_unit_id) {
            toast({
                title: "Required Field",
                description: "Please select an alternative unit.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            return;
        }

        if (!formData.bulk_unit_id) {
            toast({
                title: "Required Field",
                description: "Please select a bulk unit.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            return;
        }

        if (!formData.maintain_in_batches) {
            toast({
                title: "Required Field",
                description: "Please select whether to maintain stock in batches.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            return;
        }

        if (!formData.set_standard_rates) {
            toast({
                title: "Required Field",
                description: "Please select whether to set standard rates.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            return;
        }
        if (!formData.enable_cost_tracking) {
            toast({
                title: "Required Field",
                description: "Please select whether to enable cost tracking.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            return;
        }

        if (!formData.gst_applicable) {
            toast({
                title: "Required Field",
                description: "Please select GST applicability.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            return;
        }
        if (!formData.set_gst_details) {
            toast({
                title: "Required Field",
                description: "Please select whether to set/alter GST details.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            return;
        }

        if (!formData.type_of_supply) {
            toast({
                title: "Required Field",
                description: "Please select type of supply.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            return;
        }


        if (!formData.opening_stock.godown_id) {
            toast({
                title: "Godown Required",
                description: "Select a godown for creating stock.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
            return;
        }
        if (
            Number(formData.is_returnable) === 1 &&
            !formData.returnable_percentage
        ) {
            toast({
                title: "Error",
                description: "Please enter returnable percentage",
                status: "error",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                gst_applicable: Number(formData.gst_applicable),
                set_gst_details: Number(formData.set_gst_details),
                maintain_in_batches: Number(formData.maintain_in_batches),
                track_mfg_date: Number(formData.track_mfg_date),
                use_expiry_dates: Number(formData.use_expiry_dates),
                set_standard_rates: Number(formData.set_standard_rates),
                enable_cost_tracking: Number(formData.enable_cost_tracking),
                is_returnable: Number(formData.is_returnable),

                returnable_percentage: formData.returnable_percentage === "" ? null : Number(formData.returnable_percentage),
                gst_details: {
                    ...formData.gst_details,
                    is_non_gst_goods: formData.gst_details.is_non_gst_goods ? 1 : 0,
                },
            };

            const response = await API.post(API_ENDPOINTS.create_stock_item, payload);

            toast({
                title: "Success",
                description: response?.data?.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            setFormData(initialFormData);
            setSelectedGroup("");

            console.log(response?.data);

        } catch (error) {
            console.log(error);

            toast({
                title: "Error",
                description: error?.response?.data?.message || "Something went wrong",
                status: "error",
                duration: 3000,
                isClosable: true,
            });

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        getStockGroups();
        getUnits();
        getGodowns();
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            getStockCategories()
        }
    }, [selectedGroup])

    return (
        <Box bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="md">

            <HStack justifyContent="space-between">
                <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px" >
                    <BreadcrumbItem>
                        <BreadcrumbLink as={Link} to="/dashboard" >
                            <GoHomeFill color="#5570F1" />
                        </BreadcrumbLink>
                    </BreadcrumbItem>

                    <BreadcrumbItem>
                        <BreadcrumbLink isCurrentPage color="#8B8D97" fontSize="13px"> Create Stock Item </BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>
            </HStack>
            <Heading size="md" color="gray.600" fontSize="18px" mb={6}> Create Stock Item </Heading>

            <VStack spacing={6} align="stretch">
                <Box>
                    <Grid templateColumns="repeat(2, 1fr)" gap={5} >
                        <GridItem>
                            <FormControl isRequired>
                                <FormLabel>Item Name</FormLabel>
                                <Input name="item_name"
                                    value={formData.item_name}
                                    onChange={handleChange} placeholder="Enter Item Name" />
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl isRequired>
                                <FormLabel>Stock Group</FormLabel>

                                <Select
                                    placeholder="Select Stock Group"
                                    name="stock_group_id"
                                    value={formData.stock_group_id}
                                    onChange={(e) => {
                                        handleChange(e); // updates formData
                                        handleSelectGroup(e.target.value); // sets selected group id
                                    }}
                                >
                                    {stockGroups?.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl isRequired>
                                <FormLabel>Category</FormLabel>

                                <Select
                                    placeholder="Select Category"
                                    name="stock_category_id"
                                    value={formData.stock_category_id}
                                    onChange={handleChange}
                                >
                                    {stockCategories?.map((item) => (
                                        <option key={item.id} value={item.id}>
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
                                    onChange={handleChange} >
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
                        {
                            formData.unit_id && (

                                <GridItem colSpan={2}>

                                    <Box
                                        border="1px solid #E2E8F0"
                                        borderRadius="10px"
                                        p={5}
                                    >

                                        <Text fontSize="16px" fontWeight="600" mb={5} color="gray.600" >
                                            Unit Configuration
                                        </Text>

                                        {/* ALTERNATIVE UNIT */}

                                        <Grid
                                            templateColumns="220px 1fr"
                                            gap={5}
                                            alignItems="center"
                                            mb={5}
                                        >

                                            <GridItem>

                                                <FormControl isRequired>
                                                    <FormLabel>
                                                        Alternative Unit
                                                    </FormLabel>

                                                    <Select
                                                        name="alternative_unit_id"
                                                        value={formData.alternative_unit_id}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">
                                                            Select Unit
                                                        </option>

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

                                                <Flex align="center" gap={3} marginTop="16px">
                                                    <Text fontSize="11px">Where:</Text>

                                                    <Input
                                                        placeholder="1"
                                                        name="alternative_unit_value"
                                                        value={
                                                            formData.alternative_unit_value
                                                        }
                                                        onChange={handleChange}
                                                    />
                                                    <Text
                                                        minW="60px"
                                                        fontWeight="600"
                                                        color="gray.600" fontSize="11px"
                                                    >
                                                        {
                                                            units.find(
                                                                (u) =>
                                                                    String(u.id) ===
                                                                    String(formData.alternative_unit_id)
                                                            )?.symbol || ""
                                                        }
                                                    </Text>

                                                    <Text fontWeight="600" fontSize="13px">
                                                        =
                                                    </Text>


                                                    <Input
                                                        placeholder="2"
                                                        name="base_unit_value"
                                                        value={
                                                            formData.base_unit_value
                                                        }
                                                        onChange={handleChange}
                                                    />
                                                    <Text
                                                        minW="80px" fontSize="11px"
                                                        fontWeight="600"
                                                        color="gray.600"
                                                    >
                                                        {selectedBaseUnit?.symbol || ""}
                                                    </Text>

                                                </Flex>

                                            </GridItem>

                                        </Grid>

                                        {/* BULK UNIT */}

                                        <Grid
                                            templateColumns="220px 1fr"
                                            gap={5}
                                            alignItems="center"
                                        >

                                            <GridItem>

                                                <FormControl isRequired>

                                                    <FormLabel>
                                                        Bulk Unit
                                                    </FormLabel>

                                                    <Select
                                                        name="bulk_unit_id"
                                                        value={formData.bulk_unit_id}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">
                                                            Select Unit
                                                        </option>

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

                                                <Flex align="center" gap={3} marginTop="16px">
                                                    <Text fontSize="11px">Where:</Text>

                                                    <Input
                                                        placeholder="1"
                                                        name="bulk_unit_value"
                                                        value={formData.bulk_unit_value}
                                                        onChange={handleChange} />

                                                    <Text
                                                        minW="60px"
                                                        fontWeight="600"
                                                        color="gray.600" fontSize="11px"
                                                    >
                                                        {
                                                            units.find(
                                                                (u) =>
                                                                    String(u.id) ===
                                                                    String(formData.bulk_unit_id)
                                                            )?.symbol || ""
                                                        }
                                                    </Text>

                                                    <Text fontWeight="600" fontSize="13px">
                                                        =
                                                    </Text>


                                                    <Input
                                                        placeholder="10"
                                                        name="bulk_base_value"
                                                        value={
                                                            formData.bulk_base_value
                                                        }
                                                        onChange={handleChange}
                                                    />
                                                    <Text
                                                        minW="80px"
                                                        fontWeight="600"
                                                        color="gray.600" fontSize="11px">
                                                        {selectedBaseUnit?.symbol || ""}
                                                    </Text>

                                                </Flex>

                                            </GridItem>

                                        </Grid>

                                    </Box>

                                </GridItem>
                            )
                        }

                        <GridItem colSpan={2}>

                            <Box border="1px solid #E2E8F0" borderRadius="10px" p={5} >

                                <Text fontSize="16px" fontWeight="600" mb={5} color="gray.600"> Inventory Settings </Text>

                                <Grid templateColumns="repeat(2, 1fr)" gap={5} >
                                    <GridItem>
                                        <FormControl isRequired>

                                            <FormLabel> Maintain In Batches </FormLabel>

                                            <Select
                                                name="maintain_in_batches"
                                                value={formData.maintain_in_batches}
                                                onChange={handleChange}
                                            >
                                                <option value=""> Select </option>
                                                <option value="1"> Yes </option>
                                                <option value="0"> No </option>
                                            </Select>

                                        </FormControl>

                                    </GridItem>

                                    <GridItem>

                                        <FormControl isRequired>

                                            <FormLabel>
                                                Set Standard Rates
                                            </FormLabel>

                                            <Select
                                                name="set_standard_rates"
                                                value={formData.set_standard_rates}
                                                onChange={handleChange}
                                            >
                                                <option value="">
                                                    Select
                                                </option>

                                                <option value="1">
                                                    Yes
                                                </option>

                                                <option value="0">
                                                    No
                                                </option>

                                            </Select>

                                        </FormControl>

                                    </GridItem>

                                    <GridItem>

                                        <FormControl isRequired>

                                            <FormLabel>
                                                Enable Cost Tracking
                                            </FormLabel>

                                            <Select
                                                name="enable_cost_tracking"
                                                value={formData.enable_cost_tracking}
                                                onChange={handleChange}
                                            >
                                                <option value="">
                                                    Select
                                                </option>

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

                                {
                                    formData.maintain_in_batches === "1" && (

                                        <Grid
                                            templateColumns="repeat(2, 1fr)"
                                            gap={5}
                                            mt={5}
                                        >

                                            <GridItem>

                                                <FormControl>

                                                    <FormLabel>
                                                        Track Manufacturing Date
                                                    </FormLabel>

                                                    <Select
                                                        name="track_mfg_date"
                                                        value={formData.track_mfg_date}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">
                                                            Select
                                                        </option>

                                                        <option value="1">
                                                            Yes
                                                        </option>

                                                        <option value="0">
                                                            No
                                                        </option>

                                                    </Select>

                                                </FormControl>

                                            </GridItem>

                                            <GridItem>

                                                <FormControl>

                                                    <FormLabel>
                                                        Use Expiry Dates
                                                    </FormLabel>

                                                    <Select
                                                        name="use_expiry_dates"
                                                        value={formData.use_expiry_dates}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">
                                                            Select
                                                        </option>

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
                                    )
                                }

                            </Box>

                        </GridItem>

                        <GridItem>
                            <FormControl isRequired>
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

                    <Grid templateColumns="repeat(2, 1fr)" gap={5} mt={5} >

                        <GridItem>
                            <FormControl isRequired>
                                <FormLabel>GST Applicable</FormLabel>

                                <Select placeholder="Select Option" name="gst_applicable" value={formData.gst_applicable} onChange={handleChange} >
                                    <option value="1"> Applicable</option>
                                    <option value="0"> Not Applicable</option>
                                </Select>
                            </FormControl>
                        </GridItem>

                        {/* SET GST DETAILS */}

                        <GridItem>
                            <FormControl isRequired>
                                <FormLabel> Set / Alter GST Details </FormLabel>
                                <Select placeholder="Select Option" name="set_gst_details" value={formData.set_gst_details} onChange={handleChange}>
                                    <option value="1"> Yes </option>
                                    <option value="0"> No </option>
                                </Select>
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel>Item is Returnable</FormLabel>

                                <Select
                                    placeholder="Select Option"
                                    name="is_returnable"
                                    value={formData.is_returnable}
                                    onChange={handleChange}
                                >
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </Select>
                            </FormControl>
                            {Number(formData.is_returnable) === 1 && (
                                <FormControl mt={4}>
                                    <FormLabel>Returnable Percentage</FormLabel>

                                    <Input
                                        type="number"
                                        name="returnable_percentage"
                                        value={formData.returnable_percentage}
                                        onChange={handleChange}
                                        placeholder="Enter Number"
                                        min={0}
                                        max={100}
                                    />
                                </FormControl>
                            )}
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

                        <Text fontSize="15px" fontWeight="600" mb={5} color="gray.600" >
                            GST Details
                        </Text>

                        <Grid templateColumns="repeat(2, 1fr)" gap={5}>

                            <GridItem>
                                <FormControl>
                                    <FormLabel>Description</FormLabel>
                                    <Input name="gst_description" value={formData.gst_details.gst_description} onChange={handleGSTChange} />
                                </FormControl>
                            </GridItem>

                            <GridItem>
                                <FormControl>
                                    <FormLabel>HSN/SAC</FormLabel>
                                    <Input name="hsn_sac" value={formData.gst_details.hsn_sac} onChange={handleGSTChange} />
                                </FormControl>
                            </GridItem>

                            <GridItem>
                                <FormControl>
                                    <FormLabel>Taxability</FormLabel>
                                    <Select name="taxability" value={formData.gst_details.taxability} onChange={handleGSTChange}>
                                        <option value=""> Select </option>
                                        <option value="Taxable"> Taxable </option>
                                        <option value="Exempt"> Exempt </option>
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
                                    <Td fontSize="12px" color="gray.600">Integrated Tax</Td>
                                    <Td>
                                        <Input type="number" name="integrated_tax"
                                            value={formData.gst_details.integrated_tax}
                                            onChange={handleGSTChange} />
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td fontSize="12px" color="gray.600">Central Tax</Td>
                                    <Td>
                                        <Input type="number" name="central_tax"
                                            value={formData.gst_details.central_tax} onChange={handleGSTChange} />
                                    </Td>
                                </Tr>

                                <Tr>
                                    <Td fontSize="12px" color="gray.600">State Tax</Td>
                                    <Td>
                                        <Input
                                            type="number"
                                            name="state_tax"
                                            value={formData.gst_details.state_tax}
                                            onChange={handleGSTChange}
                                        />
                                    </Td>
                                </Tr>
                                {/* <Tr>
                                    <Td fontSize="12px" color="gray.600">Cess</Td>
                                    <Td> <Input type="number" name="cess" value={formData.gst_details.cess} onChange={handleGSTChange} /></Td>
                                </Tr> */}
                            </Tbody>
                        </Table>
                    </Box>
                )}

                {/* OPENING STOCK */}

                <Box border="1px solid #E2E8F0" borderRadius="10px" p={5}>
                    {/* <Text fontSize="15px" fontWeight="600" mb={5} color="gray.600" > Opening Stock </Text> */}
                    <Grid templateColumns="repeat(4, 1fr)" gap={5} >

                        <GridItem>
                            <FormControl isRequired>
                                <FormLabel>Godown</FormLabel>
                                <Select
                                    placeholder="Select Godown"
                                    name="godown_id"
                                    value={formData.opening_stock.godown_id}
                                    onChange={handleOpeningStockChange}>
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

                        {
                            formData.maintain_in_batches === "1"
                            &&
                            formData.track_mfg_date === "1"
                            && (

                                <GridItem>

                                    <FormControl>

                                        <FormLabel>
                                            MFG Date
                                        </FormLabel>

                                        <Input
                                            type="date"
                                            name="mfg_date"
                                            value={formData.opening_stock.mfg_date}
                                            onChange={handleOpeningStockChange}
                                        />
                                    </FormControl>
                                </GridItem>
                            )
                        }

                        {
                            formData.maintain_in_batches === "1"
                            && formData.use_expiry_dates === "1" && (
                                <GridItem>
                                    <FormControl>
                                        <FormLabel> Expiry Date </FormLabel>
                                        <Input
                                            type="date"
                                            name="expiry_date"
                                            value={formData.opening_stock.expiry_date}
                                            onChange={handleOpeningStockChange} />
                                    </FormControl>
                                </GridItem>
                            )
                        }

                        <GridItem>
                            <FormControl>
                                <FormLabel>Quantity</FormLabel>
                                <Input type="number" name="quantity"
                                    value={formData.opening_stock.quantity}
                                    onChange={handleOpeningStockChange} />
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel>Rate</FormLabel>
                                <Input type="number" name="rate"
                                    value={formData.opening_stock.rate}
                                    onChange={handleOpeningStockChange} />
                            </FormControl>
                        </GridItem>
                        <GridItem>
                            <FormControl>
                                <FormLabel>SuperCash Price</FormLabel>
                                <Input type="number" name="supercash_price"
                                    value={formData.opening_stock.supercash_price}
                                    onChange={handleOpeningStockChange} />
                            </FormControl>
                        </GridItem>
                        <GridItem>

                            <FormControl>
                                <FormLabel> Per </FormLabel>
                                <Select
                                    name="per_unit_id"
                                    value={formData.opening_stock.per_unit_id}
                                    onChange={handleOpeningStockChange} >

                                    <option value=""> Select Unit </option>
                                    {units?.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.symbol}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        </GridItem>
                        <GridItem>
                            <FormControl>
                                <FormLabel> Amount </FormLabel>
                                <Input
                                    value={formData.opening_stock.amount}
                                    isReadOnly
                                    bg="#F5F5F5" />
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
                        _hover={{ bg: "#1B5A6B", }}
                        px={8}
                        borderRadius="12px"
                        onClick={handleCreateStockItem}
                        isDisabled={loading} >
                        {loading ? (<Spinner size="sm" />) : ("Create Stock Item")}
                    </Button>
                </Flex>
            </VStack>
        </Box>
    );
};

export default CreateStockItem;