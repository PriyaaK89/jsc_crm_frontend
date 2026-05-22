import React, { useMemo, useState } from "react";
import { Box, Button, Flex, Grid, GridItem, Heading, Input, Select, Table, Tbody, Td, Text, Th, Thead, Tr, useToast, Textarea, IconButton, Badge, Spinner, HStack, Accordion, AccordionButton, AccordionItem, AccordionPanel, AccordionIcon,} from "@chakra-ui/react";

import { AddIcon, DeleteIcon } from "@chakra-ui/icons";

import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const createSourceRow = () => ({
  item_id: "",
  godown_id: "",
  batch_no: "",
  available_qty: 0,
  qty: "",
  unit_id: "",
  rate: "",
  amount: "",
  remarks: "",
  batches: [],
  loadingBatch: false,
});

const createDestinationRow = () => ({
  item_id: "",
  godown_id: "",
  batch_no: "",
  available_qty: 0,
  qty: "",
  unit_id: "",
  rate: "",
  amount: "",
  remarks: "",
});

const createCostRow = () => ({
  ledger_id: "",
  amount: "",
});

const StockTransfer = ({ stockItem, godown, ledger }) => {

  const toast = useToast();

  // ==========================================
  // MAIN FORM
  // ==========================================

  const [formData, setFormData] = useState({
    transfer_date: "",
    voucher_no: "",
    narration: "",

    source_items: [createSourceRow()],

    destination_items: [createDestinationRow()],

    additional_costs: [createCostRow()],

    transportation: {
      dispatch_doc_no: "",
      transport_name: "",
      destination: "",
      bill_no: "",
      vehicle_no: "",
      transport_freight: "",
      local_freight: "",
      load_unload_freight: "",
    },
  });

  const [loading, setLoading] = useState(false);

  // ==========================================
  // FETCH BATCHES
  // ==========================================

  const fetchBatches = async (itemId, godownId) => {

    if (!itemId || !godownId) return [];

    try {

      const res = await API.get(
        `${API_ENDPOINTS.GET_BATCH_BY_STOCK_ITEM_ID}?item_id=${itemId}&godown_id=${godownId}`
      );

      if (res?.status === 200) {
        return res?.data?.data || [];
      }

    } catch (err) {
      console.error(err);
    }

    return [];
  };

  // ==========================================
  // FETCH AVAILABLE STOCK
  // ==========================================

  const fetchAvailableStock = async ({
    itemId,
    godownId,
    batchNo = "",
  }) => {

    if (!itemId || !godownId) return 0;

    try {

      let url =
        `${API_ENDPOINTS.GET_AVAILABLE_QTY_OF_STOCK}?item_id=${itemId}&godown_id=${godownId}`;

      if (batchNo) {
        url += `&batch_no=${batchNo}`;
      }

      const res = await API.get(url);

      if (res?.status === 200) {
        return Number(res?.data?.data?.available_stock || 0);
      }

    } catch (error) {
      console.log(error);
    }

    return 0;
  };

  // ==========================================
  // SOURCE CHANGE
  // ==========================================

  const handleSourceChange = async (index, field, value) => {

    const updated = [...formData.source_items];

    updated[index][field] = value;

    // ITEM SELECTED

    if (field === "item_id") {

      const item = stockItem.find(
        (x) => String(x.id) === String(value)
      );

      updated[index].unit_id = item?.unit_id || "";
    }

    // FETCH BATCH

    if (
      field === "item_id" ||
      field === "godown_id"
    ) {

      const itemId =
        field === "item_id"
          ? value
          : updated[index].item_id;

      const godownId =
        field === "godown_id"
          ? value
          : updated[index].godown_id;

      if (itemId && godownId) {

        updated[index].loadingBatch = true;

        setFormData((prev) => ({
          ...prev,
          source_items: updated,
        }));

        const batches = await fetchBatches(
          itemId,
          godownId
        );

        const stock = await fetchAvailableStock({
          itemId,
          godownId,
        });

        updated[index].batches = batches;
        updated[index].available_qty = stock;
        updated[index].loadingBatch = false;
      }
    }

    // BATCH SELECTED

    if (field === "batch_no") {

      const stock = await fetchAvailableStock({
        itemId: updated[index].item_id,
        godownId: updated[index].godown_id,
        batchNo: value,
      });

      updated[index].available_qty = stock;
    }

    // AUTO AMOUNT

    if (field === "qty" || field === "rate") {

      const qty =
        field === "qty"
          ? Number(value || 0)
          : Number(updated[index].qty || 0);

      const rate =
        field === "rate"
          ? Number(value || 0)
          : Number(updated[index].rate || 0);

      updated[index].amount = qty * rate;
    }

    setFormData((prev) => ({
      ...prev,
      source_items: updated,
    }));
  };

  // ==========================================
  // DESTINATION CHANGE
  // ==========================================

  const handleDestinationChange = (index, field, value) => {

    const updated = [...formData.destination_items];

    updated[index][field] = value;

    if (field === "item_id") {

      const item = stockItem.find(
        (x) => String(x.id) === String(value)
      );

      updated[index].unit_id = item?.unit_id || "";
    }

    if (field === "qty" || field === "rate") {

      const qty =
        field === "qty"
          ? Number(value || 0)
          : Number(updated[index].qty || 0);

      const rate =
        field === "rate"
          ? Number(value || 0)
          : Number(updated[index].rate || 0);

      updated[index].amount = qty * rate;
    }

    setFormData((prev) => ({
      ...prev,
      destination_items: updated,
    }));
  };

  // ==========================================
  // COST CHANGE
  // ==========================================

  const handleCostChange = (index, field, value) => {

    const updated = [...formData.additional_costs];

    updated[index][field] = value;

    setFormData((prev) => ({
      ...prev,
      additional_costs: updated,
    }));
  };

  // ==========================================
  // ADD ROWS
  // ==========================================

  const addSourceRow = () => {
    setFormData((prev) => ({
      ...prev,
      source_items: [
        ...prev.source_items,
        createSourceRow(),
      ],
    }));
  };

  const addDestinationRow = () => {
    setFormData((prev) => ({
      ...prev,
      destination_items: [
        ...prev.destination_items,
        createDestinationRow(),
      ],
    }));
  };

  const addCostRow = () => {
    setFormData((prev) => ({
      ...prev,
      additional_costs: [
        ...prev.additional_costs,
        createCostRow(),
      ],
    }));
  };

  // ==========================================
  // DELETE ROWS
  // ==========================================

  const deleteSourceRow = (index) => {

    if (formData.source_items.length === 1) return;

    const updated = formData.source_items.filter(
      (_, i) => i !== index
    );

    setFormData((prev) => ({
      ...prev,
      source_items: updated,
    }));
  };

  const deleteDestinationRow = (index) => {

    if (formData.destination_items.length === 1) return;

    const updated = formData.destination_items.filter(
      (_, i) => i !== index
    );

    setFormData((prev) => ({
      ...prev,
      destination_items: updated,
    }));
  };

  const deleteCostRow = (index) => {

    if (formData.additional_costs.length === 1) return;

    const updated = formData.additional_costs.filter(
      (_, i) => i !== index
    );

    setFormData((prev) => ({
      ...prev,
      additional_costs: updated,
    }));
  };

  // ==========================================
  // TOTALS
  // ==========================================

  const totalSourceAmount = useMemo(() => {

    return formData.source_items.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  }, [formData.source_items]);

  const totalDestinationAmount = useMemo(() => {

    return formData.destination_items.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  }, [formData.destination_items]);

  const totalAdditionalCost = useMemo(() => {

    return formData.additional_costs.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  }, [formData.additional_costs]);

  const totalTransportCost = useMemo(() => {

    return (
      Number(formData.transportation.transport_freight || 0) +
      Number(formData.transportation.local_freight || 0) +
      Number(formData.transportation.load_unload_freight || 0)
    );

  }, [formData.transportation]);

  const grandTotal =
    totalDestinationAmount +
    totalAdditionalCost +
    totalTransportCost;

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async () => {

    try {

      setLoading(true);

      const payload = {

        ...formData,

        total_source_amount: totalSourceAmount,

        total_destination_amount: totalDestinationAmount,

        total_additional_cost: totalAdditionalCost,

        total_transport_cost: totalTransportCost,

        grand_total: grandTotal,
      };

      const response = await API.post(
        API_ENDPOINTS.CREATE_STOCK_TRANSFER,
        payload
      );

      if (response?.status === 201) {

        toast({
          title: "Success",
          description: "Stock transfer created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        setFormData({
          transfer_date: "",
          voucher_no: "",
          narration: "",

          source_items: [createSourceRow()],

          destination_items: [createDestinationRow()],

          additional_costs: [createCostRow()],

          transportation: {
            dispatch_doc_no: "",
            transport_name: "",
            destination: "",
            bill_no: "",
            vehicle_no: "",
            transport_freight: "",
            local_freight: "",
            load_unload_freight: "",
          },
        });
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

  return (
    <Box>

      {/* HEADER */}

      <Flex
        justify="space-between"
        align="center"
        mb={5}
      >
        <Heading size="md">
          Stock Transfer
        </Heading>

        <Badge
          colorScheme="blue"
          p={2}
          borderRadius="md"
        >
          ERP Inventory
        </Badge>
      </Flex>

      {/* TOP FORM */}

      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(3,1fr)",
        }}
        gap={4}
        mb={6}
      >
        <GridItem>
          <Text mb={1}>
            Transfer Date
          </Text>

          <Input
            type="date"
            value={formData.transfer_date}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                transfer_date: e.target.value,
              }))
            }
          />
        </GridItem>

        <GridItem>
          <Text mb={1}>
            Voucher No
          </Text>

          <Input
            placeholder="Voucher No"
            value={formData.voucher_no}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                voucher_no: e.target.value,
              }))
            }
          />
        </GridItem>

        <GridItem>
          <Text mb={1}>
            Narration
          </Text>

          <Textarea
            placeholder="Narration"
            value={formData.narration}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                narration: e.target.value,
              }))
            }
          />
        </GridItem>
      </Grid>

      {/* SOURCE */}

      <Accordion allowToggle defaultIndex={[0]} mb={5}>
        <AccordionItem bg="white" border="1px solid #E2E8F0">

          <AccordionButton>
            <Box flex="1" textAlign="left" fontWeight="bold">
              Source (Consumption)
            </Box>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel>

            <HStack justify="flex-end" mb={3}>
              <Button
                leftIcon={<AddIcon />}
                size="sm"
                colorScheme="blue"
                onClick={addSourceRow}
              >
                Add Row
              </Button>
            </HStack>

            <Box overflowX="auto">

              <Table size="sm">

                <Thead bg="gray.100">

                  <Tr>
                    <Th>Item</Th>
                    <Th>Godown</Th>
                    <Th>Batch</Th>
                    <Th>Available</Th>
                    <Th>Qty</Th>
                    <Th>Unit</Th>
                    <Th>Rate</Th>
                    <Th>Amount</Th>
                    <Th>Action</Th>
                  </Tr>

                </Thead>

                <Tbody>

                  {formData.source_items.map((row, index) => (

                    <Tr key={index}>

                      <Td minW="220px">

                        <Select
                          value={row.item_id}
                          onChange={(e) =>
                            handleSourceChange(
                              index,
                              "item_id",
                              e.target.value
                            )
                          }
                        >
                          <option value="">
                            Select
                          </option>

                          {stockItem.map((item) => (
                            <option
                              key={item.id}
                              value={item.id}
                            >
                              {item.item_name}
                            </option>
                          ))}
                        </Select>

                      </Td>

                      <Td minW="180px">

                        <Select
                          value={row.godown_id}
                          onChange={(e) =>
                            handleSourceChange(
                              index,
                              "godown_id",
                              e.target.value
                            )
                          }
                        >
                          <option value="">
                            Select
                          </option>

                          {godown.map((g) => (
                            <option
                              key={g.id}
                              value={g.id}
                            >
                              {g.godown_name}
                            </option>
                          ))}
                        </Select>

                      </Td>

                      <Td minW="180px">

                        {row.loadingBatch ? (
                          <Spinner size="sm" />
                        ) : (

                          <Select
                            value={row.batch_no}
                            onChange={(e) =>
                              handleSourceChange(
                                index,
                                "batch_no",
                                e.target.value
                              )
                            }
                          >
                            <option value="">
                              Select
                            </option>

                            {row.batches.map((b, i) => (
                              <option
                                key={i}
                                value={b.batch_no}
                              >
                                {b.batch_no}
                              </option>
                            ))}
                          </Select>

                        )}

                      </Td>

                      <Td>
                        <Input
                          value={row.available_qty}
                          readOnly
                        />
                      </Td>

                      <Td>

                        <Input
                          type="number"
                          value={row.qty}
                          onChange={(e) =>
                            handleSourceChange(
                              index,
                              "qty",
                              e.target.value
                            )
                          }
                        />

                      </Td>

                      <Td>

                        <Input
                          value={row.unit_id}
                          readOnly
                        />

                      </Td>

                      <Td>

                        <Input
                          type="number"
                          value={row.rate}
                          onChange={(e) =>
                            handleSourceChange(
                              index,
                              "rate",
                              e.target.value
                            )
                          }
                        />

                      </Td>

                      <Td>

                        <Input
                          value={row.amount}
                          readOnly
                        />

                      </Td>

                      <Td>

                        <IconButton
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          size="sm"
                          onClick={() =>
                            deleteSourceRow(index)
                          }
                        />

                      </Td>

                    </Tr>
                  ))}

                </Tbody>

              </Table>

            </Box>

          </AccordionPanel>

        </AccordionItem>
      </Accordion>

      {/* DESTINATION */}

      <Accordion allowToggle defaultIndex={[0]} mb={5}>
        <AccordionItem bg="white" border="1px solid #E2E8F0">

          <AccordionButton>
            <Box flex="1" textAlign="left" fontWeight="bold">
              Destination (Production)
            </Box>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel>

            <HStack justify="flex-end" mb={3}>
              <Button
                leftIcon={<AddIcon />}
                size="sm"
                colorScheme="green"
                onClick={addDestinationRow}
              >
                Add Row
              </Button>
            </HStack>

            <Box overflowX="auto">

              <Table size="sm">

                <Thead bg="gray.100">
                  <Tr>
                    <Th>Item</Th>
                    <Th>Godown</Th>
                    <Th>Batch</Th>
                    <Th>Qty</Th>
                    <Th>Unit</Th>
                    <Th>Rate</Th>
                    <Th>Amount</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>

                <Tbody>

                  {formData.destination_items.map((row, index) => (

                    <Tr key={index}>

                      <Td>

                        <Select
                          value={row.item_id}
                          onChange={(e) =>
                            handleDestinationChange(
                              index,
                              "item_id",
                              e.target.value
                            )
                          }
                        >
                          <option value="">
                            Select
                          </option>

                          {stockItem.map((item) => (
                            <option
                              key={item.id}
                              value={item.id}
                            >
                              {item.item_name}
                            </option>
                          ))}
                        </Select>

                      </Td>

                      <Td>

                        <Select
                          value={row.godown_id}
                          onChange={(e) =>
                            handleDestinationChange(
                              index,
                              "godown_id",
                              e.target.value
                            )
                          }
                        >
                          <option value="">
                            Select
                          </option>

                          {godown.map((g) => (
                            <option
                              key={g.id}
                              value={g.id}
                            >
                              {g.godown_name}
                            </option>
                          ))}
                        </Select>

                      </Td>

                      <Td>

                        <Input
                          value={row.batch_no}
                          onChange={(e) =>
                            handleDestinationChange(
                              index,
                              "batch_no",
                              e.target.value
                            )
                          }
                        />

                      </Td>

                      <Td>

                        <Input
                          type="number"
                          value={row.qty}
                          onChange={(e) =>
                            handleDestinationChange(
                              index,
                              "qty",
                              e.target.value
                            )
                          }
                        />

                      </Td>

                      <Td>

                        <Input
                          value={row.unit_id}
                          readOnly
                        />

                      </Td>

                      <Td>

                        <Input
                          type="number"
                          value={row.rate}
                          onChange={(e) =>
                            handleDestinationChange(
                              index,
                              "rate",
                              e.target.value
                            )
                          }
                        />

                      </Td>

                      <Td>

                        <Input
                          value={row.amount}
                          readOnly
                        />

                      </Td>

                      <Td>

                        <IconButton
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          size="sm"
                          onClick={() =>
                            deleteDestinationRow(index)
                          }
                        />

                      </Td>

                    </Tr>

                  ))}

                </Tbody>

              </Table>

            </Box>

          </AccordionPanel>

        </AccordionItem>
      </Accordion>

      {/* COST */}

      <Accordion allowToggle defaultIndex={[0]} mb={5}>
        <AccordionItem bg="white" border="1px solid #E2E8F0">

          <AccordionButton>
            <Box flex="1" textAlign="left" fontWeight="bold">
              Additional Costs
            </Box>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel>

            <HStack justify="flex-end" mb={3}>
              <Button
                size="sm"
                leftIcon={<AddIcon />}
                onClick={addCostRow}
              >
                Add Row
              </Button>
            </HStack>

            <Table size="sm">

              <Thead bg="gray.100">
                <Tr>
                  <Th>Ledger</Th>
                  <Th>Amount</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>

              <Tbody>

                {formData.additional_costs.map((row, index) => (

                  <Tr key={index}>

                    <Td>

                      <Select
                        value={row.ledger_id}
                        onChange={(e) =>
                          handleCostChange(
                            index,
                            "ledger_id",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Select
                        </option>

                        {ledger.map((l) => (
                          <option
                            key={l.id}
                            value={l.id}
                          >
                            {l.ledger_name}
                          </option>
                        ))}

                      </Select>

                    </Td>

                    <Td>

                      <Input
                        type="number"
                        value={row.amount}
                        onChange={(e) =>
                          handleCostChange(
                            index,
                            "amount",
                            e.target.value
                          )
                        }
                      />

                    </Td>

                    <Td>

                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() =>
                          deleteCostRow(index)
                        }
                      />

                    </Td>

                  </Tr>

                ))}

              </Tbody>

            </Table>

          </AccordionPanel>

        </AccordionItem>
      </Accordion>

      {/* TRANSPORT */}

      <Box
        border="1px solid #E2E8F0"
        p={5}
        borderRadius="md"
        bg="white"
        mb={5}
      >

        <Heading size="sm" mb={5}>
          Transportation
        </Heading>

        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(3,1fr)",
          }}
          gap={4}
        >

          <GridItem>

            <Text mb={1}>
              Dispatch Doc No
            </Text>

            <Input
              value={formData.transportation.dispatch_doc_no}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  transportation: {
                    ...prev.transportation,
                    dispatch_doc_no:
                      e.target.value,
                  },
                }))
              }
            />

          </GridItem>

          <GridItem>

            <Text mb={1}>
              Transport Name
            </Text>

            <Input
              value={formData.transportation.transport_name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  transportation: {
                    ...prev.transportation,
                    transport_name:
                      e.target.value,
                  },
                }))
              }
            />

          </GridItem>

          <GridItem>

            <Text mb={1}>
              Destination
            </Text>

            <Input
              value={formData.transportation.destination}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  transportation: {
                    ...prev.transportation,
                    destination:
                      e.target.value,
                  },
                }))
              }
            />

          </GridItem>

          <GridItem>

            <Text mb={1}>
              Bill No
            </Text>

            <Input
              value={formData.transportation.bill_no}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  transportation: {
                    ...prev.transportation,
                    bill_no:
                      e.target.value,
                  },
                }))
              }
            />

          </GridItem>

          <GridItem>

            <Text mb={1}>
              Vehicle No
            </Text>

            <Input
              value={formData.transportation.vehicle_no}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  transportation: {
                    ...prev.transportation,
                    vehicle_no:
                      e.target.value,
                  },
                }))
              }
            />

          </GridItem>

          <GridItem>

            <Text mb={1}>
              Transport Freight
            </Text>

            <Input
              type="number"
              value={formData.transportation.transport_freight}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  transportation: {
                    ...prev.transportation,
                    transport_freight:
                      e.target.value,
                  },
                }))
              }
            />

          </GridItem>

          <GridItem>

            <Text mb={1}>
              Local Freight
            </Text>

            <Input
              type="number"
              value={formData.transportation.local_freight}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  transportation: {
                    ...prev.transportation,
                    local_freight:
                      e.target.value,
                  },
                }))
              }
            />

          </GridItem>

          <GridItem>

            <Text mb={1}>
              Load/Unload Freight
            </Text>

            <Input
              type="number"
              value={formData.transportation.load_unload_freight}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  transportation: {
                    ...prev.transportation,
                    load_unload_freight:
                      e.target.value,
                  },
                }))
              }
            />

          </GridItem>

        </Grid>
      </Box>

      {/* TOTAL */}

      <Flex
        justify="flex-end"
        mb={5}
      >
        <Box
          bg="white"
          p={5}
          borderRadius="md"
          border="1px solid #E2E8F0"
          minW="320px"
        >

          <Flex justify="space-between" mb={2}>
            <Text>Source Total</Text>
            <Text fontWeight="bold">
              {totalSourceAmount}
            </Text>
          </Flex>

          <Flex justify="space-between" mb={2}>
            <Text>Destination Total</Text>
            <Text fontWeight="bold">
              {totalDestinationAmount}
            </Text>
          </Flex>

          <Flex justify="space-between" mb={2}>
            <Text>Additional Cost</Text>
            <Text fontWeight="bold">
              {totalAdditionalCost}
            </Text>
          </Flex>

          <Flex justify="space-between" mb={2}>
            <Text>Transport Cost</Text>
            <Text fontWeight="bold">
              {totalTransportCost}
            </Text>
          </Flex>

          <Flex justify="space-between" mt={4} borderTop="1px solid #E2E8F0" pt={3} >
            <Text fontWeight="bold">
              Grand Total
            </Text>

            <Text fontWeight="bold">
              {grandTotal}
            </Text>
          </Flex>

        </Box>
      </Flex>

      {/* SUBMIT */}

      <Flex justify="flex-end">
        <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading} >
          Create Stock Transfer
        </Button>

      </Flex>

    </Box>
  );
};

export default StockTransfer;