import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Select,
  Textarea,
  useToast,
  VStack,
  Text,
  HStack,
} from "@chakra-ui/react";

import { useNavigate, useParams } from "react-router-dom";

import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const EditStockItem = () => {

  const { id } = useParams();

  const toast = useToast();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [stockGroups, setStockGroups] = useState([]);
  const [stockCategories, setStockCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [godowns, setGodowns] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState("");

  const [formData, setFormData] = useState({

    item_name: "",

    stock_group_id: "",
    stock_category_id: "",

    unit_id: "",

    alternative_unit_id: "",
    alternative_unit_value: "",
    base_unit_value: "",

    bulk_unit_id: "",
    bulk_unit_value: "",
    bulk_base_value: "",

    maintain_in_batches: 0,
    track_mfg_date: 0,
    use_expiry_dates: 0,

    set_standard_rates: 0,
    enable_cost_tracking: 0,

    gst_applicable: 0,
    set_gst_details: 0,

    type_of_supply: "Goods",
    rate_of_duty: "",

    description: "",

    gst_details: {
      gst_description: "",
      hsn_sac: "",
      is_non_gst_goods: 0,
      calculation_type: "On Value",
      taxability: "Taxable",
      integrated_tax: "",
      central_tax: "",
      state_tax: "",
      // cess: "",
    },

    opening_stock: {
      godown_id: "",
      batch_no: "",
      mfg_date: "",
      expiry_date: "",
      quantity: "",
      rate: "",
      supercash_price: "",
      per_unit_id: "",
      amount: "",
    },
  });

  // ========================= GET STOCK ITEM DETAILS =========================

  const getStockDetailsById = async () => {

    try {

      setLoading(true);

      const response = await API.get(
        `${API_ENDPOINTS.getStockItemById}/${id}`
      );

      if (response?.status === 200) {

        const data = response?.data?.data;

        setSelectedGroup(data?.stock_group_id);

        setFormData({

          item_name: data?.item_name || "",

          stock_group_id: data?.stock_group_id || "",
          stock_category_id: data?.stock_category_id || "",

          unit_id: data?.unit_id || "",

          alternative_unit_id: data?.alternative_unit_id || "",
          alternative_unit_value: data?.alternative_unit_value || "",
          base_unit_value: data?.base_unit_value || "",

          bulk_unit_id: data?.bulk_unit_id || "",
          bulk_unit_value: data?.bulk_unit_value || "",
          bulk_base_value: data?.bulk_base_value || "",

          maintain_in_batches: data?.maintain_in_batches || 0,
          track_mfg_date: data?.track_mfg_date || 0,
          use_expiry_dates: data?.use_expiry_dates || 0,

          set_standard_rates: data?.set_standard_rates || 0,
          enable_cost_tracking: data?.enable_cost_tracking || 0,

          gst_applicable: data?.gst_applicable || 0,
          set_gst_details: data?.set_gst_details || 0,

          type_of_supply: data?.type_of_supply || "Goods",

          rate_of_duty: data?.rate_of_duty || "",

          description: data?.description || "",

          gst_details: {

            gst_description:
              data?.gst_details?.description || "",

            hsn_sac:
              data?.gst_details?.hsn_sac || "",

            is_non_gst_goods:
              data?.gst_details?.is_non_gst_goods || 0,

            calculation_type:
              data?.gst_details?.calculation_type || "On Value",

            taxability:
              data?.gst_details?.taxability || "Taxable",

            integrated_tax:
              data?.gst_details?.integrated_tax || "",

            central_tax:
              data?.gst_details?.central_tax || "",

            state_tax:
              data?.gst_details?.state_tax || "",

            // cess:
            //   data?.gst_details?.cess || "",
          },

          opening_stock: {
            godown_id: data?.opening_stock?.godown_id || "",
            batch_no: data?.opening_stock?.batch_no || "",
            mfg_date: data?.opening_stock?.mfg_date ? data?.opening_stock?.mfg_date.split("T")[0] : "",
            expiry_date: data?.opening_stock?.expiry_date ? data?.opening_stock?.expiry_date.split("T")[0] : "",
            quantity: data?.opening_stock?.quantity || "",
            rate: data?.opening_stock?.rate || "",
            supercash_price: data?.opening_stock?.supercash_price || "",
            per_unit_id: data?.opening_stock?.per_unit_id || "",
            amount: data?.opening_stock?.amount || "",
          },
        });
      }

    } catch (error) {

      console.log(error);

      toast({
        title: "Error",
        description: "Failed to fetch stock item details",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

    } finally {

      setLoading(false);
    }
  };

  // ========================= GET DROPDOWN DATA =========================

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

  // ========================= HANDLE CHANGE =========================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const handleNestedChange = (section, e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [section]: {
  //       ...prev[section],
  //       [name]: value,
  //     },
  //   }));
  // };

  const handleNestedChange = (section, e) => {

  const { name, value } = e.target;

  setFormData((prev) => {

    const updatedSection = {
      ...prev[section],
      [name]: value,
    };

    // Auto calculate amount
    if (
      section === "opening_stock" &&
      (name === "quantity" || name === "rate")
    ) {

      const quantity =
        Number(
          name === "quantity"
            ? value
            : updatedSection.quantity
        ) || 0;

      const rate =
        Number(
          name === "rate"
            ? value
            : updatedSection.rate
        ) || 0;

      updatedSection.amount = quantity * rate;
    }

    return {
      ...prev,
      [section]: updatedSection,
    };
  });
};

  // ========================= UPDATE STOCK ITEM =========================

  const handleEditStockItem = async () => {

    try {

      setLoading(true);

      const payload = {

        ...formData,

        maintain_in_batches:
          Number(formData.maintain_in_batches),

        track_mfg_date:
          Number(formData.track_mfg_date),

        use_expiry_dates:
          Number(formData.use_expiry_dates),

        set_standard_rates:
          Number(formData.set_standard_rates),

        enable_cost_tracking:
          Number(formData.enable_cost_tracking),

        gst_applicable:
          Number(formData.gst_applicable),

        set_gst_details:
          Number(formData.set_gst_details),

        gst_details: {

          ...formData.gst_details,

          is_non_gst_goods:
            Number(formData.gst_details.is_non_gst_goods),
        },
      };

      const response = await API.put(
        `${API_ENDPOINTS.updateStockItem}/${id}`,
        payload
      );

      if (response?.status === 200) {

        toast({
          title: "Success",
          description: "Stock item updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        navigate("/inventory/view-stock-item");
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
        isClosable: true,
      });

    } finally {

      setLoading(false);
    }
  };

  // ========================= USE EFFECT =========================

  useEffect(() => {

    getStockDetailsById();

    getStockGroups();

    getUnits();

    getGodowns();

  }, []);

  useEffect(() => {

    if (selectedGroup) {
      getStockCategories();
    }

  }, [selectedGroup]);

  return (

    <Box
      p={6}
      bg="white"
      borderRadius="14px"
      boxShadow="sm"
    >


      <VStack spacing={8} align="stretch">

        {/* ================= BASIC DETAILS ================= */}

        <Box>
          <Grid
            templateColumns="repeat(3,1fr)"
            gap={5}
          >

            <GridItem>

              <FormControl isRequired>

                <FormLabel>
                  Item Name
                </FormLabel>

                <Input
                  placeholder="Enter item name"
                  name="item_name"
                  value={formData.item_name}
                  onChange={handleChange}
                />

              </FormControl>

            </GridItem>

            <GridItem>

              <FormControl isRequired>

                <FormLabel>
                  Stock Group
                </FormLabel>

                <Select
                  name="stock_group_id"
                  value={formData.stock_group_id}
                  onChange={(e) => {
                    handleChange(e);
                    setSelectedGroup(e.target.value);
                  }}
                >

                  <option value="">
                    Select Stock Group
                  </option>

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

                <FormLabel>
                  Stock Category
                </FormLabel>

                <Select
                  name="stock_category_id"
                  value={formData.stock_category_id}
                  onChange={handleChange}
                >

                  <option value="">
                    Select Stock Category
                  </option>

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

                <FormLabel>
                  Base Unit
                </FormLabel>

                <Select
                  name="unit_id"
                  value={formData.unit_id}
                  onChange={handleChange}
                >

                  <option value="">
                    Select Base Unit
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

          </Grid>

        </Box>

        <Divider />

        {/* ================= ALTERNATIVE UNIT ================= */}

        <Box>

          <Grid
            templateColumns="repeat(3,1fr)"
            gap={5}
          >

            <FormControl>

              <FormLabel>
                Alternative Unit
              </FormLabel>

              <Select
                name="alternative_unit_id"
                value={formData.alternative_unit_id}
                onChange={handleChange}
              >

                <option value="">
                  Select Alternative Unit
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
            <HStack>

            <Text fontSize="14px" color="gray.700" marginTop="20px">Where</Text>

            <FormControl>

              <FormLabel>
                Alternative Unit Value
              </FormLabel>

              <Input
                type="number"
                placeholder="Enter alternative unit value"
                name="alternative_unit_value"
                value={formData.alternative_unit_value}
                onChange={handleChange}
              />

            </FormControl>
            <Text fontSize="14px" color="gray.700" marginTop="20px">=</Text>
         </HStack>

            <FormControl>

              <FormLabel>
                Base Unit Value
              </FormLabel>

              <Input
                type="number"
                placeholder="Enter base unit value"
                name="base_unit_value"
                value={formData.base_unit_value}
                onChange={handleChange}
              />

            </FormControl>

          </Grid>

        </Box>



        {/* ================= BULK UNIT ================= */}

        <Box>


          <Grid
            templateColumns="repeat(3,1fr)"
            gap={5}
          >

            <FormControl>

              <FormLabel>
                Bulk Unit
              </FormLabel>

              <Select
                name="bulk_unit_id"
                value={formData.bulk_unit_id}
                onChange={handleChange}
              >

                <option value="">
                  Select Bulk Unit
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

<HStack>
    <Text fontSize="14px" color="gray.700" marginTop="20px">Where</Text>
     <FormControl>

              <FormLabel>
                Bulk Unit Value
              </FormLabel>

              <Input
                type="number"
                placeholder="Enter bulk unit value"
                name="bulk_unit_value"
                value={formData.bulk_unit_value}
                onChange={handleChange}
              />

            </FormControl>
    <Text fontSize="14px" color="gray.700" marginTop="20px">=</Text>

</HStack>
           

            <FormControl>

              <FormLabel>
                Bulk Base Value
              </FormLabel>

              <Input
                type="number"
                placeholder="Enter bulk base value"
                name="bulk_base_value"
                value={formData.bulk_base_value}
                onChange={handleChange}
              />

            </FormControl>

          </Grid>

        </Box>

        <Divider />

        {/* ================= CONFIGURATION ================= */}

        <Box>

          <Text
            fontSize="16px" fontWeight="600" mb={5} color="gray.600"

          >
            Configuration
          </Text>

          <Grid
            templateColumns="repeat(3,1fr)"
            gap={5}
          >

            <FormControl>

              <FormLabel>
                Maintain In Batches
              </FormLabel>

              <Select
                name="maintain_in_batches"
                value={formData.maintain_in_batches}
                onChange={(e) => {

                  handleChange(e);

                  if (Number(e.target.value) === 0) {

                    setFormData((prev) => ({
                      ...prev,
                      track_mfg_date: 0,
                      use_expiry_dates: 0,
                    }));
                  }
                }}
              >

                <option value={1}>
                  Yes
                </option>

                <option value={0}>
                  No
                </option>

              </Select>

            </FormControl>

            {Number(formData.maintain_in_batches) === 1 && (

              <>
                <FormControl>

                  <FormLabel>
                    Track Date Of Manufacturing
                  </FormLabel>

                  <Select
                    name="track_mfg_date"
                    value={formData.track_mfg_date}
                    onChange={handleChange}
                  >

                    <option value={1}>
                      Yes
                    </option>

                    <option value={0}>
                      No
                    </option>

                  </Select>

                </FormControl>

                <FormControl>

                  <FormLabel>
                    Use Expiry Dates
                  </FormLabel>

                  <Select
                    name="use_expiry_dates"
                    value={formData.use_expiry_dates}
                    onChange={handleChange}
                  >

                    <option value={1}>
                      Yes
                    </option>

                    <option value={0}>
                      No
                    </option>

                  </Select>

                </FormControl>
              </>
            )}

            <FormControl>

              <FormLabel>
                Set Standard Rates
              </FormLabel>

              <Select
                name="set_standard_rates"
                value={formData.set_standard_rates}
                onChange={handleChange}
              >

                <option value={1}>
                  Yes
                </option>

                <option value={0}>
                  No
                </option>

              </Select>

            </FormControl>

            <FormControl>

              <FormLabel>
                Enable Cost Tracking
              </FormLabel>

              <Select
                name="enable_cost_tracking"
                value={formData.enable_cost_tracking}
                onChange={handleChange}
              >

                <option value={1}>
                  Yes
                </option>

                <option value={0}>
                  No
                </option>

              </Select>

            </FormControl>

            <FormControl>

              <FormLabel>
                GST Applicable
              </FormLabel>

              <Select
                name="gst_applicable"
                value={formData.gst_applicable}
                onChange={handleChange}
              >

                <option value={1}>
                  Yes
                </option>

                <option value={0}>
                  No
                </option>

              </Select>

            </FormControl>

            <FormControl>

              <FormLabel>
                Set GST Details
              </FormLabel>

              <Select
                name="set_gst_details"
                value={formData.set_gst_details}
                onChange={handleChange}
              >

                <option value={1}>
                  Yes
                </option>

                <option value={0}>
                  No
                </option>

              </Select>

            </FormControl>

          </Grid>

        </Box>

        <Divider />

        {/* ================= GST DETAILS ================= */}

        {Number(formData.set_gst_details) === 1 && (

          <Box>

            <Text fontSize="16px" fontWeight="600" mb={5} color="gray.600">
              GST Details
            </Text>

            <Grid
              templateColumns="repeat(3,1fr)"
              gap={5}
            >

              <FormControl>

                <FormLabel>
                  GST Description
                </FormLabel>

                <Input
                  placeholder="Enter GST description"
                  name="gst_description"
                  value={formData.gst_details.gst_description}
                  onChange={(e) =>
                    handleNestedChange("gst_details", e)
                  }
                />

              </FormControl>

              <FormControl>

                <FormLabel>
                  HSN / SAC
                </FormLabel>

                <Input
                  placeholder="Enter HSN/SAC"
                  name="hsn_sac"
                  value={formData.gst_details.hsn_sac}
                  onChange={(e) =>
                    handleNestedChange("gst_details", e)
                  }
                />

              </FormControl>

              <FormControl>

                <FormLabel>
                  Calculation Type
                </FormLabel>

                <Select
                  name="calculation_type"
                  value={formData.gst_details.calculation_type}
                  onChange={(e) =>
                    handleNestedChange("gst_details", e)
                  }
                >

                  <option value="On Value">
                    On Value
                  </option>

                </Select>

              </FormControl>

              <FormControl>

                <FormLabel>
                  Taxability
                </FormLabel>

                <Select
                  name="taxability"
                  value={formData.gst_details.taxability}
                  onChange={(e) =>
                    handleNestedChange("gst_details", e)
                  }
                >

                  <option value="Taxable">
                    Taxable
                  </option>

                  <option value="Exempt">
                    Exempt
                  </option>

                </Select>

              </FormControl>

              <FormControl>

                <FormLabel>
                  Integrated Tax
                </FormLabel>

                <Input
                  type="number"
                  placeholder="Enter integrated tax"
                  name="integrated_tax"
                  value={formData.gst_details.integrated_tax}
                  onChange={(e) =>
                    handleNestedChange("gst_details", e)
                  }
                />

              </FormControl>

              <FormControl>

                <FormLabel>
                  Central Tax
                </FormLabel>

                <Input
                  type="number"
                  placeholder="Enter central tax"
                  name="central_tax"
                  value={formData.gst_details.central_tax}
                  onChange={(e) =>
                    handleNestedChange("gst_details", e)
                  }
                />

              </FormControl>

              <FormControl>

                <FormLabel>
                  State Tax
                </FormLabel>

                <Input
                  type="number"
                  placeholder="Enter state tax"
                  name="state_tax"
                  value={formData.gst_details.state_tax}
                  onChange={(e) =>
                    handleNestedChange("gst_details", e)
                  }
                />

              </FormControl>

              {/* <FormControl>
                <FormLabel> Cess </FormLabel>
                <Input type="number" placeholder="Enter cess" name="cess"
                  value={formData.gst_details.cess} onChange={(e) => handleNestedChange("gst_details", e) } />
              </FormControl> */}

            </Grid>

          </Box>
        )}

        <Divider />

        {/* ================= OPENING STOCK ================= */}

        <Box>

          {/* <Text
           fontSize="16px" fontWeight="600" mb={5} color="gray.600"
          >
            Opening Stock Details
          </Text> */}

          <Grid
            templateColumns="repeat(4,1fr)"
            gap={5}
          >

            <FormControl>

              <FormLabel>
                Godown
              </FormLabel>

              <Select
                name="godown_id"
                value={formData.opening_stock.godown_id}
                onChange={(e) =>
                  handleNestedChange("opening_stock", e)
                }
              >

                <option value="">
                  Select Godown
                </option>

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

            <FormControl>

              <FormLabel>
                Batch Number
              </FormLabel>

              <Input
                placeholder="Enter batch number"
                name="batch_no"
                value={formData.opening_stock.batch_no}
                onChange={(e) =>
                  handleNestedChange("opening_stock", e)
                }
              />

            </FormControl>

            {Number(formData.track_mfg_date) === 1 && (

              <FormControl>

                <FormLabel>
                  Manufacturing Date
                </FormLabel>

                <Input
                  type="date"
                  name="mfg_date"
                  value={formData.opening_stock.mfg_date}
                  onChange={(e) =>
                    handleNestedChange("opening_stock", e)
                  }
                />

              </FormControl>
            )}

            {Number(formData.use_expiry_dates) === 1 && (

              <FormControl>

                <FormLabel>
                  Expiry Date
                </FormLabel>

                <Input
                  type="date"
                  name="expiry_date"
                  value={formData.opening_stock.expiry_date}
                  onChange={(e) =>
                    handleNestedChange("opening_stock", e)
                  }
                />

              </FormControl>
            )}

            <FormControl>

              <FormLabel>
                Quantity
              </FormLabel>

              <Input
                type="number"
                placeholder="Enter quantity"
                name="quantity"
                value={formData.opening_stock.quantity}
                onChange={(e) =>
                  handleNestedChange("opening_stock", e)
                }
              />

            </FormControl>

            <FormControl>
              <FormLabel> Rate </FormLabel>
              <Input
                type="number"
                placeholder="Enter rate"
                name="rate"
                value={formData.opening_stock.rate}
                onChange={(e) =>
                  handleNestedChange("opening_stock", e)
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel> Supercash Price </FormLabel>
              <Input
                type="number"
                placeholder="Enter Supercash Price"
                name="supercash_price"
                value={formData.opening_stock.supercash_price}
                onChange={(e) =>
                  handleNestedChange("opening_stock", e)
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>Amount</FormLabel>
              <Input 
              type="number"
              name="amount"
              value={formData.opening_stock.amount}
              readOnly
              />
            </FormControl>

          </Grid>

        </Box>

        <Divider />

        {/* ================= DESCRIPTION ================= */}

        {/* <Box>
          <FormControl>
            <FormLabel> Description</FormLabel>
            <Textarea placeholder="Enter description" name="description" value={formData.description} onChange={handleChange} />
          </FormControl>
        </Box> */}

        {/* ================= BUTTON ================= */}

        <Flex justify="flex-end">

          <Button
            colorScheme="blue"
            onClick={handleEditStockItem}
            isLoading={loading}
             bg="#237086"
                        fontWeight="500"
                        fontSize="14px"
                        color="white"
                        _hover={{ bg: "#1B5A6B", }}
                        px={8}
                        borderRadius="12px"
          >
            Update Stock Item
          </Button>

        </Flex>

      </VStack>

    </Box>
  );
};

export default EditStockItem;