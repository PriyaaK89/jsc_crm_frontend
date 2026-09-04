import React, { useMemo, useState } from "react";
import {
  Box, Button, Flex, Grid, GridItem, Heading, Input, Select, Table, Tbody, Td, Text, Th, Thead, Tr, useToast,
  Textarea, IconButton, Badge, Spinner, HStack, Accordion, AccordionButton, AccordionItem, AccordionPanel, AccordionIcon,
} from "@chakra-ui/react";
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
  unit_name: "",   // <-- display name
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
  unit_name: "",   // <-- display name
  rate: "",
  amount: "",
  remarks: "",
  batches: [],          // <-- destination also needs batches
  loadingBatch: false,  // <-- and loading flag
});

const createCostRow = () => ({
  ledger_id: "",
  amount: "",
});

// ==========================================
// COMPONENT
// ==========================================

const StockTransfer = ({ stockItem, godown, ledger }) => {
  const toast = useToast();

  const inputStyle = {
    size: "sm",
    borderRadius: "6px",
    borderColor: "#c8d0d8",
    bg: "white",
    fontSize: "12px",
    height: "38px",
    padding: "0px 6px",
    _focus: { borderColor: "#3d7a52", boxShadow: "0 0 0 1px #3d7a52" },
  };

  const [formData, setFormData] = useState({
    transfer_date: "",
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
  // FETCH STOCK ITEM DETAILS (unit + rate)
  // Returns { unit_id, unit_name, rate, gst_applicable, rate_of_duty }
  // ==========================================

  const fetchStockItemDetails = async (itemId) => {
    if (!itemId) return null;
    try {
      const res = await API.get(
        `${API_ENDPOINTS.getStockItemById}/${itemId}`
      );
      if (res?.status === 200) {
        const d = res?.data?.data;
        return {
          unit_name: d?.base_unit_name || "",
          unit_id: d?.unit_id || "",
          rate: Number(d?.opening_stock?.rate || 0),
          gst_applicable: Number(d?.gst_applicable || 0),
          rate_of_duty: Number(d?.rate_of_duty || 0),
        };
      }
    } catch (err) {
      console.error("Stock item details fetch error", err);
    }
    return null;
  };

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

  const fetchAvailableStock = async ({ itemId, godownId, batchNo = "" }) => {
    if (!itemId || !godownId) return 0;
    try {
      let url = `${API_ENDPOINTS.GET_AVAILABLE_QTY_OF_STOCK}?item_id=${itemId}&godown_id=${godownId}`;
      if (batchNo) url += `&batch_no=${batchNo}`;
      const res = await API.get(url);
      if (res?.status === 200) {
        return Number(res?.data?.data?.available_stock || 0);
      }
    } catch (error) {
      console.log(error);
    }
    return 0;
  };

  const getSourceBatchesForItem = (sourceItems, itemId) => {
  return sourceItems
    .filter((s) => s.item_id === itemId && s.batch_no)
    .map((s) => ({
      batch_no: s.batch_no,
      qty: s.qty,
      rate: s.rate,
    }));
};


  const handleSourceChange = async (index, field, value) => {
    // Work on a fresh copy each time to avoid stale closure issues
    setFormData((prev) => {
      const updated = prev.source_items.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      );
      return { ...prev, source_items: updated };
    });

    // ── ITEM SELECTED ──────────────────────────────────────────────────────
    if (field === "item_id") {
      // Optimistically mark loading while we fetch details
      setFormData((prev) => {
        const updated = prev.source_items.map((row, i) =>
          i === index ? { ...row, loadingBatch: true } : row
        );
        return { ...prev, source_items: updated };
      });

      const details = await fetchStockItemDetails(value);

      setFormData((prev) => {
        const updated = prev.source_items.map((row, i) => {
          if (i !== index) return row;
          return {
            ...row,
            unit_id: details?.unit_id || "",
            unit_name: details?.unit_name || "",
            // Keep existing rate if already set, otherwise prefill from item
            rate: row.rate || "",
            loadingBatch: false,
          };
        });
        return { ...prev, source_items: updated };
      });

      // If godown already selected, also fetch batches now
      setFormData((prev) => {
        const row = prev.source_items[index];
        if (row.godown_id) {
          // Kick off async batch fetch without blocking
          (async () => {
            const batches = await fetchBatches(value, row.godown_id);
            const stock = await fetchAvailableStock({
              itemId: value,
              godownId: row.godown_id,
            });
            setFormData((p) => {
              const u = p.source_items.map((r, i) =>
                i === index
                  ? { ...r, batches, available_qty: stock, batch_no: "", loadingBatch: false }
                  : r
              );
              return { ...p, source_items: u };
            });
          })();
          return {
            ...prev,
            source_items: prev.source_items.map((r, i) =>
              i === index ? { ...r, loadingBatch: true } : r
            ),
          };
        }
        return prev;
      });
    }

    // ── GODOWN SELECTED ────────────────────────────────────────────────────
    if (field === "godown_id") {
      setFormData((prev) => {
        const row = prev.source_items[index];
        if (row.item_id && value) {
          (async () => {
            const batches = await fetchBatches(row.item_id, value);
            const stock = await fetchAvailableStock({
              itemId: row.item_id,
              godownId: value,
            });
            setFormData((p) => {
              const u = p.source_items.map((r, i) =>
                i === index
                  ? { ...r, batches, available_qty: stock, batch_no: "", loadingBatch: false }
                  : r
              );
              return { ...p, source_items: u };
            });
          })();
          return {
            ...prev,
            source_items: prev.source_items.map((r, i) =>
              i === index
                ? { ...r, godown_id: value, loadingBatch: true }
                : r
            ),
          };
        }
        return prev;
      });
    }

    // ── BATCH SELECTED ─────────────────────────────────────────────────────
    if (field === "batch_no") {
      const row = formData.source_items[index];
      const stock = await fetchAvailableStock({
        itemId: row.item_id,
        godownId: row.godown_id,
        batchNo: value,
      });
      setFormData((prev) => {
        const updated = prev.source_items.map((r, i) =>
          i === index ? { ...r, available_qty: stock } : r
        );
        return { ...prev, source_items: updated };
      });
    }


  };

  const handleDestinationChange = async (index, field, value) => {
    // Update the changed field first
    setFormData((prev) => {
      const updated = prev.destination_items.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      );
      return { ...prev, destination_items: updated };
    });

    // ── ITEM SELECTED ──────────────────────────────────────────────────────
    // if (field === "item_id") {
    //   setFormData((prev) => {
    //     const updated = prev.destination_items.map((row, i) =>
    //       i === index ? { ...row, loadingBatch: true } : row
    //     );
    //     return { ...prev, destination_items: updated };
    //   });

    //   const details = await fetchStockItemDetails(value);

    //   setFormData((prev) => {
    //     const updated = prev.destination_items.map((r, i) => {
    //       if (i !== index) return r;
    //       return {
    //         ...r,
    //         unit_id: details?.unit_id || "",
    //         unit_name: details?.unit_name || "",
    //         rate: r.rate || "",
    //         loadingBatch: false,
    //       };
    //     });
    //     return { ...prev, destination_items: updated };
    //   });

    //   // If godown already selected, fetch batches now
    //   setFormData((prev) => {
    //     const row = prev.destination_items[index];
    //     if (row.godown_id) {
    //       (async () => {
    //         const batches = await fetchBatches(value, row.godown_id);
    //         const stock = await fetchAvailableStock({
    //           itemId: value,
    //           godownId: row.godown_id,
    //         });
    //         setFormData((p) => {
    //           const u = p.destination_items.map((r, i) =>
    //             i === index
    //               ? { ...r, batches, available_qty: stock, batch_no: "", loadingBatch: false }
    //               : r
    //           );
    //           return { ...p, destination_items: u };
    //         });
    //       })();
    //       return {
    //         ...prev,
    //         destination_items: prev.destination_items.map((r, i) =>
    //           i === index ? { ...r, loadingBatch: true } : r
    //         ),
    //       };
    //     }
    //     return prev;
    //   });
    // }

    // ── ITEM SELECTED ──────────────────────────────────────────────────────
if (field === "item_id") {
  setFormData((prev) => {
    const updated = prev.destination_items.map((row, i) =>
      i === index ? { ...row, loadingBatch: true } : row
    );
    return { ...prev, destination_items: updated };
  });

  const details = await fetchStockItemDetails(value);

  setFormData((prev) => {
    const sourceBatches = getSourceBatchesForItem(prev.source_items, value);

    const updated = prev.destination_items.map((r, i) => {
      if (i !== index) return r;
      return {
        ...r,
        unit_id: details?.unit_id || "",
        unit_name: details?.unit_name || "",
        rate: r.rate || "",
        batches: sourceBatches,
        batch_no: sourceBatches.length === 1 ? sourceBatches[0].batch_no : "",
        available_qty: sourceBatches.length === 1 ? sourceBatches[0].qty : 0,
        loadingBatch: false,
      };
    });
    return { ...prev, destination_items: updated };
  });
}

    // ── GODOWN SELECTED ────────────────────────────────────────────────────
    // if (field === "godown_id") {
    //   setFormData((prev) => {
    //     const row = prev.destination_items[index];
    //     if (row.item_id && value) {
    //       (async () => {
    //         const batches = await fetchBatches(row.item_id, value);
    //         const stock = await fetchAvailableStock({
    //           itemId: row.item_id,
    //           godownId: value,
    //         });
    //         setFormData((p) => {
    //           const u = p.destination_items.map((r, i) =>
    //             i === index
    //               ? { ...r, batches, available_qty: stock, batch_no: "", loadingBatch: false }
    //               : r
    //           );
    //           return { ...p, destination_items: u };
    //         });
    //       })();
    //       return {
    //         ...prev,
    //         destination_items: prev.destination_items.map((r, i) =>
    //           i === index
    //             ? { ...r, godown_id: value, loadingBatch: true }
    //             : r
    //         ),
    //       };
    //     }
    //     return prev;
    //   });
    // }

    // ── BATCH SELECTED ─────────────────────────────────────────────────────
    // if (field === "batch_no") {
    //   const row = formData.destination_items[index];
    //   const stock = await fetchAvailableStock({
    //     itemId: row.item_id,
    //     godownId: row.godown_id,
    //     batchNo: value,
    //   });
    //   setFormData((prev) => {
    //     const updated = prev.destination_items.map((r, i) =>
    //       i === index ? { ...r, available_qty: stock } : r
    //     );
    //     return { ...prev, destination_items: updated };
    //   });
    // }
// ── BATCH SELECTED ─────────────────────────────────────────────────────
if (field === "batch_no") {
  setFormData((prev) => {
    const row = prev.destination_items[index];
    const match = prev.source_items.find(
      (s) => s.item_id === row.item_id && s.batch_no === value
    );
    const updated = prev.destination_items.map((r, i) =>
      i === index ? { ...r, available_qty: match?.qty || 0 } : r
    );
    return { ...prev, destination_items: updated };
  });
}

  };

  const handleCostChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = prev.additional_costs.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      );
      return { ...prev, additional_costs: updated };
    });
  };


  const addSourceRow = () =>
    setFormData((prev) => ({
      ...prev,
      source_items: [...prev.source_items, createSourceRow()],
    }));

  const addDestinationRow = () =>
    setFormData((prev) => ({
      ...prev,
      destination_items: [...prev.destination_items, createDestinationRow()],
    }));

  const addCostRow = () =>
    setFormData((prev) => ({
      ...prev,
      additional_costs: [...prev.additional_costs, createCostRow()],
    }));

  const deleteSourceRow = (index) => {
    if (formData.source_items.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      source_items: prev.source_items.filter((_, i) => i !== index),
    }));
  };

  const deleteDestinationRow = (index) => {
    if (formData.destination_items.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      destination_items: prev.destination_items.filter((_, i) => i !== index),
    }));
  };

  const deleteCostRow = (index) => {
    if (formData.additional_costs.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      additional_costs: prev.additional_costs.filter((_, i) => i !== index),
    }));
  };

  // ── ADD THIS: sync handler for qty/rate (no async needed) ──
  const handleSourceNumericChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = prev.source_items.map((r, i) => {
        if (i !== index) return r;
        const updatedRow = { ...r, [field]: value };
        updatedRow.amount = Number(updatedRow.qty || 0) * Number(updatedRow.rate || 0);
        return updatedRow;
      });
      return { ...prev, source_items: updated };
    });
  };

  const handleDestinationNumericChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = prev.destination_items.map((r, i) => {
        if (i !== index) return r;
        const updatedRow = { ...r, [field]: value };
        updatedRow.amount = Number(updatedRow.qty || 0) * Number(updatedRow.rate || 0);
        return updatedRow;
      });
      return { ...prev, destination_items: updated };
    });
  };

  const totalSourceAmount = useMemo(
    () =>
      formData.source_items.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      ),
    [formData.source_items]
  );

  const totalDestinationAmount = useMemo(
    () =>
      formData.destination_items.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      ),
    [formData.destination_items]
  );

  const totalAdditionalCost = useMemo(
    () =>
      formData.additional_costs.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      ),
    [formData.additional_costs]
  );

  const totalTransportCost = useMemo(
    () =>
      Number(formData.transportation.transport_freight || 0) +
      Number(formData.transportation.local_freight || 0) +
      Number(formData.transportation.load_unload_freight || 0),
    [formData.transportation]
  );

  const grandTotal =
    totalDestinationAmount + totalAdditionalCost + totalTransportCost;


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
          error?.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box mt={4} padding={0}>

      {/* HEADER */}
      <Flex justify="space-between" align="end" mb={5}>
        <Heading size="md" fontFamily="Poppins">Stock Transfer</Heading>
      </Flex>

      {/* TOP FORM */}
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(3,1fr)" }}
        gap={4}
        mb={6}
      >
        <GridItem>
          <Text mb={1} fontSize="12px">Transfer Date</Text>
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
      </Grid>

      {/* ── SOURCE ─────────────────────────────────────────────────────── */}
      <Accordion allowToggle defaultIndex={[0]} mb={8} >
        <AccordionItem bg="white" border="1px solid #E2E8F0" borderRadius="12px">
          <AccordionButton bg="#4f9190" borderRadius="12px 12px 0px 0px" _hover={{ bg: "#699b99" }}>
            <Box flex="1" textAlign="left" fontWeight="500" color="white">
              Source (Consumption)
            </Box>
           
            <AccordionIcon color="white" />
          </AccordionButton>

          <AccordionPanel padding={0}>
 <HStack justify="flex-end" m={2}>
              <Button leftIcon={<AddIcon />}
                size="sm" fontWeight="500" background="#cf6b16" color="white" onClick={addSourceRow}>
                Add Row
              </Button>
            </HStack>
            <Box overflowX="auto" >
              <Table size="sm" className="stock_transfer_table">
                <Thead bg="#e7e8e8">
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

                      {/* Item */}
                      <Td minW="190px">
                        <Select p={0}
                          value={row.item_id} {...inputStyle}
                          onChange={(e) =>
                            handleSourceChange(index, "item_id", e.target.value)
                          }
                        >
                          <option value="">Select</option>
                          {stockItem.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.item_name}
                            </option>
                          ))}
                        </Select>
                      </Td>

                      {/* Godown */}
                      <Td minW="140px">
                        <Select
                          value={row.godown_id} {...inputStyle}
                          onChange={(e) =>
                            handleSourceChange(
                              index,
                              "godown_id",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select</option>
                          {godown.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.godown_name}
                            </option>
                          ))}
                        </Select>
                      </Td>

                      {/* Batch — dropdown from fetched list */}
                      <Td minW="170px">
                        {row.loadingBatch ? (
                          <Spinner size="sm" />
                        ) : (
                          <Select
                            value={row.batch_no} {...inputStyle}
                            onChange={(e) =>
                              handleSourceChange(
                                index,
                                "batch_no",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select</option>
                            {row.batches.map((b, i) => (
                              <option key={i} value={b.batch_no}>
                                {b.batch_no}
                              </option>
                            ))}
                          </Select>
                        )}
                      </Td>

                      {/* Available Qty */}
                      <Td>
                        <Input value={row.available_qty} {...inputStyle} readOnly />
                      </Td>

                      {/* Qty */}
                      <Td>
                        <Input
                          type="number" {...inputStyle}
                          value={row.qty}
                          onChange={(e) => handleSourceNumericChange(index, "qty", e.target.value)}
                        />
                      </Td>

                      {/* Unit — now shows unit_name */}
                      <Td minW="50px">
                        <Input value={row.unit_name} readOnly {...inputStyle} />
                      </Td>

                      {/* Rate */}
                      <Td>
                        <Input
                          type="number"
                          value={row.rate} {...inputStyle}
                          onChange={(e) => handleSourceNumericChange(index, "rate", e.target.value)}
                        />
                      </Td>

                      {/* Amount */}
                      <Td>
                        <Input value={row.amount} readOnly {...inputStyle} />
                      </Td>

                      {/* Delete */}
                      <Td>
                        <IconButton
                          icon={<DeleteIcon />}
                          color="white"
                          bg="grey" _hover={{ bg: "#4d4d4d" }}
                          size="sm"
                          onClick={() => deleteSourceRow(index)}
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

      {/* ── DESTINATION ────────────────────────────────────────────────── */}
      <Accordion allowToggle defaultIndex={[0]} mb={8}>
        <AccordionItem bg="white" border="1px solid #E2E8F0" borderRadius="12px">
          <AccordionButton bg="#4f9190" borderRadius="12px 12px 0px 0px" _hover={{ bg: "#699b99" }}>
            <Box flex="1" textAlign="left" fontWeight="500" color="white">
              Destination (Production)
            </Box>
            <AccordionIcon color="white" />
          </AccordionButton>


          <AccordionPanel padding={0}>

            <HStack justify="flex-end" m={2}>
              <Button
                leftIcon={<AddIcon />}
                size="sm" fontWeight="500"
                background="#cf6b16" color="white"
                onClick={addDestinationRow}
              >
                Add Row
              </Button>
            </HStack>
            <Box overflowX="auto">
              <Table size="sm" className="stock_transfer_table">
                <Thead bg="#e7e8e8">
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
                  {formData.destination_items.map((row, index) => (
                    <Tr key={index}>

                      {/* Item */}
                      <Td minW="190px">
                        <Select {...inputStyle}
                          value={row.item_id}
                          onChange={(e) =>
                            handleDestinationChange(
                              index,
                              "item_id",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select</option>
                          {stockItem.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.item_name}
                            </option>
                          ))}
                        </Select>
                      </Td>

                      {/* Godown */}
                      <Td minW="140px">
                        <Select {...inputStyle}
                          value={row.godown_id}
                          onChange={(e) =>
                            handleDestinationChange(
                              index,
                              "godown_id",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select</option>
                          {godown.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.godown_name}
                            </option>
                          ))}
                        </Select>
                      </Td>

                      {/* Batch — dropdown (same pattern as source) */}
                      <Td minW="170px">
                        {row.loadingBatch ? (
                          <Spinner size="sm" />
                        ) : (
                          <Select {...inputStyle}
                            value={row.batch_no}
                            onChange={(e) =>
                              handleDestinationChange(
                                index,
                                "batch_no",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select</option>
                            {row.batches.map((b, i) => (
                              <option key={i} value={b.batch_no}>
                                {b.batch_no}
                              </option>
                            ))}
                          </Select>
                        )}
                      </Td>

                      {/* Available Qty */}
                      <Td>
                        <Input value={row.available_qty} readOnly />
                      </Td>

                      {/* Qty */}
                      <Td>
                        <Input {...inputStyle}
                          type="number"
                          value={row.qty}
                          onChange={(e) =>
                            handleDestinationNumericChange(index, "qty", e.target.value)
                          }
                        />
                      </Td>

                      {/* Unit — shows unit_name */}
                      <Td minW="60px">
                        <Input value={row.unit_name} readOnly {...inputStyle} />
                      </Td>

                      {/* Rate */}
                      <Td>
                        <Input
                          type="number" {...inputStyle}
                          value={row.rate}
                          onChange={(e) => handleDestinationNumericChange(index, "rate", e.target.value)}
                        //   onChange={(e) =>
                        //     handleDestinationChange(
                        //       index,
                        //       "rate",
                        //       e.target.value
                        //     )
                        //   }
                        />
                      </Td>

                      {/* Amount */}
                      <Td>
                        <Input value={row.amount} readOnly {...inputStyle} />
                      </Td>

                      {/* Delete */}
                      <Td>
                        <IconButton
                          icon={<DeleteIcon />}
                          color="white"
                          bg="grey" _hover={{ bg: "#4d4d4d" }}
                          size="sm"
                          onClick={() => deleteDestinationRow(index)}
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

      {/* ── ADDITIONAL COSTS ───────────────────────────────────────────── */}
      <Accordion allowToggle defaultIndex={[0]} mb={8}>
        <AccordionItem bg="white" border="1px solid #E2E8F0" borderRadius="12px">
          <AccordionButton bg="#4f9190" borderRadius="12px 12px 0px 0px" _hover={{ bg: "#699b99" }}>
            <Box flex="1" textAlign="left" fontWeight="500" color="white">
              Additional Costs
            </Box>
            <AccordionIcon color="white" />
          </AccordionButton>

          <AccordionPanel padding={0}>
            <HStack justify="flex-end" m={2}>
              <Button size="sm" leftIcon={<AddIcon />} onClick={addCostRow}
                fontWeight="500" background="#cf6b16" color="white">
                Add Row
              </Button>
            </HStack>

            <Table size="sm" className="stock_transfer_table">
              <Thead bg="#e7e8e8">
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
                          handleCostChange(index, "ledger_id", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        {ledger.map((l) => (
                          <option key={l.id} value={l.id}>
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
                          handleCostChange(index, "amount", e.target.value)
                        }
                      />
                    </Td>

                    <Td>
                      <IconButton
                        icon={<DeleteIcon />}
                        color="white"
                        bg="grey" _hover={{ bg: "#4d4d4d" }}
                        size="sm"
                        onClick={() => deleteCostRow(index)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      {/* ── TRANSPORTATION ─────────────────────────────────────────────── */}
      <Box
        border="1px solid"
        borderColor="gray.200"
        p={6}
        borderRadius="2xl"
        bg="white"
        mb={6}
        boxShadow="sm"
      >
        <Flex
          justify="space-between"
          align="center"
          mb={6}
          flexWrap="wrap"
          gap={3}
        >
          <Heading size="md" color="blue.600">
            Transportation Details
          </Heading>

          <Badge
            colorScheme="blue"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="0.8rem"
          >
            Freight Information
          </Badge>
        </Flex>

        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2,1fr)",
            lg: "repeat(3,1fr)",
          }}
          gap={5}
        >
          {[
            {
              label: "Dispatch Doc No",
              key: "dispatch_doc_no",
              type: "text",
              placeholder: "Enter dispatch document no",
            },
            {
              label: "Transport Name",
              key: "transport_name",
              type: "text",
              placeholder: "Enter transport name",
            },
            {
              label: "Destination",
              key: "destination",
              type: "text",
              placeholder: "Enter destination",
            },
            {
              label: "Bill No",
              key: "bill_no",
              type: "text",
              placeholder: "Enter bill number",
            },
            {
              label: "Vehicle No",
              key: "vehicle_no",
              type: "text",
              placeholder: "Enter vehicle number",
            },
            {
              label: "Transport Freight",
              key: "transport_freight",
              type: "number",
              placeholder: "0.00",
            },
            {
              label: "Local Freight",
              key: "local_freight",
              type: "number",
              placeholder: "0.00",
            },
            {
              label: "Load/Unload Freight",
              key: "load_unload_freight",
              type: "number",
              placeholder: "0.00",
            },
          ].map(({ label, key, type, placeholder }) => (
            <GridItem key={key}>
              <Box>
                <Text
                  mb="2px"
                  fontSize="13px"
                  fontWeight="500"
                  color="gray.600"
                >
                  {label}
                </Text>

                <Input
                  type={type}
                  placeholder={placeholder}
                  value={formData.transportation[key]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      transportation: {
                        ...prev.transportation,
                        [key]: e.target.value,
                      },
                    }))
                  }
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  _hover={{
                    borderColor: "blue.300",
                  }}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px #3182CE",
                    bg: "white",
                  }}
                  borderRadius="lg"
                  size="md"
                />
              </Box>
            </GridItem>
          ))}
        </Grid>
      </Box>

      <HStack flexDirection="column" alignItems="flex-start" gap={0}>
        <Text ml={1} fontSize="12px">Narration</Text>
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
      </HStack>

      {/* ── TOTALS ─────────────────────────────────────────────────────── */}
      <Flex justify="flex-end" mb={6} mt={4}>
        <Box
          bg="white"
          p={3}
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.200"
          minW={{ base: "100%", md: "380px" }}
          boxShadow="sm"
        >
          <Flex justify="space-between" align="center" mb={3}>
            <Heading size="sm" color="blue.600">
              Transfer Summary
            </Heading>
          </Flex>

          {[
            {
              label: "Source Total",
              value: totalSourceAmount,
            },
            {
              label: "Destination Total",
              value: totalDestinationAmount,
            },
            {
              label: "Additional Cost",
              value: totalAdditionalCost,
            },
            {
              label: "Transport Cost",
              value: totalTransportCost,
            },
          ].map(({ label, value }) => (
            <Flex key={label} justify="space-between" align="center" >
              <Text
                fontSize="sm"
                fontWeight="500"
                color="gray.600" mb="2px"
              >
                {label}
              </Text>

              <Text
                fontWeight="700"
                color="gray.800"
                fontSize="md"
              >
                ₹ {Number(value || 0).toFixed(2)}
              </Text>
            </Flex>
          ))}

          <Flex
            justify="space-between"
            align="center"
            mt={3}
            pt={3}
            borderTop="2px dashed"
            borderColor="gray.300"
          >
            <Text
              fontWeight="700"
              fontSize="18px"
              color="gray.800"
            >
              Grand Total
            </Text>

            <Text
              fontWeight="800"
              fontSize="xl"
              color="blue.600"
            >
              ₹ {Number(grandTotal || 0).toFixed(2)}
            </Text>
          </Flex>
        </Box>
      </Flex>

      {/* ── SUBMIT ─────────────────────────────────────────────────────── */}
      <Flex justify="flex-end">
        <Button
          bg="#237086" fontWeight="500"
          fontSize="14px" color="white"

          px={8} borderRadius="12px"
          onClick={handleSubmit}
          isLoading={loading}

          boxShadow="md"
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "lg", bg: "#1B5A6B"
          }}
          transition="0.2s"
        >
          Create Stock Transfer
        </Button>
      </Flex>

    </Box>
  );
};

export default StockTransfer;