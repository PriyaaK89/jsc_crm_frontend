import React, { useMemo, useState } from "react";
import {
  Box, Button, Flex, Grid, GridItem, Heading, Input, Select,
  Table, Tbody, Td, Text, Th, Thead, Tr, useToast, Textarea,
  IconButton, Badge, Spinner, HStack, Tag,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const BatchFields = ({
  batchOptions,
  batchLoading,
  selectedValue,
  newValue,
  onSelectChange,
  onNewChange,
  selectSx,
  inputSx,
}) => (
  <HStack spacing={2} align="flex-start">
    {/* Existing batch dropdown */}
    <Box flex={1}>
      <Text fontSize="xs" color="gray.500" mb="2px">
        Existing Batch
      </Text>

      {batchLoading ? (
        <Flex align="center" gap={2} h="32px">
          <Spinner size="xs" />
          <Text fontSize="xs" color="gray.400">
            Loading…
          </Text>
        </Flex>
      ) : (
        <Select
          value={selectedValue}
          onChange={onSelectChange}
          sx={selectSx}
          isDisabled={batchOptions.length === 0}
          placeholder={
            batchOptions.length === 0
              ? "No batches found"
              : "Select batch"
          }
        >
          {batchOptions.map((b) => (
            <option key={b.batch_no} value={b.batch_no}>
              {b.batch_no}
            </option>
          ))}
        </Select>
      )}
    </Box>

    {/* New batch input */}
    <Box flex={1}>
      <Text fontSize="xs" color="gray.500" mb="2px">
        New Batch No
      </Text>

      <Input
        value={newValue}
        onChange={onNewChange}
        placeholder="Enter new batch no"
        sx={inputSx}
      />
    </Box>
  </HStack>
);

const SectionHeader = ({ title, onAdd }) => (
  <Flex
    justify="space-between"
    align="center"
    bg="#4f9190"
    color="white"
    px={4}
    py={2}
    borderTopRadius="md"
  >
    <Text fontWeight="500" fontSize="sm" >{title}</Text>
    {onAdd && (
      <Button size="xs" padding={3} fontWeight="500" marginRight="4px" leftIcon={<AddIcon fontSize="11px" />} onClick={onAdd}
        colorScheme="whiteAlpha" variant="solid">
        Add Row
      </Button>
    )}
  </Flex>
);

/* ─────────────────────────────────────────────────────────────
   Empty row factories  (batch fields removed from tables)
───────────────────────────────────────────────────────────── */
// const emptyComponent = () => ({
//   item_id: "", godown_id: "",
//   available_qty: 0, qty: 0,
//   unit_id: "", unit_name: "", rate: 0, amount: 0,
// });

const emptyComponent = () => ({
  item_id: "",
  godown_id: "",
  available_qty: 0,
  qty: 0,

  unit_id: "",
  unit_name: "",

  rate: 0,

  gst_applicable: 0,
  rate_of_duty: 0,

  duty_amount: 0,
  amount: 0,
});

const emptyCoproduct = () => ({
  item_id: "", godown_id: "",
  available_qty: 0, qty: 0,
  cost_allocation_percent: 0,
  unit_id: "", unit_name: "", rate: 0, amount: 0,
});

const emptyAdditionalCost = () => ({ ledger_id: "", amount: 0 });

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const MaterialManufacturing = ({
  stockItem = [],
  godown = [],
  ledger = [],
  onRefreshStockItems,
  onRefreshLedgers
}) => {
  const toast = useToast();

  /* ── header form ── */
  const [formData, setFormData] = useState({
    entry_date: "", finished_item_id: "", finished_godown_id: "",
    produced_qty: "",
    selected_batch_no: "",   // chosen from existing batch dropdown
    new_batch_no: "",        // typed manually
    mfg_date: "", expiry_date: "", remarks: "",
  });

  /* ── finished item unit (fetched from API on item select) ── */
  const [finishedItemUnit, setFinishedItemUnit] = useState("");

  /* ── header-level batch dropdown (needs BOTH item + godown) ── */
  const [headerBatchOptions, setHeaderBatchOptions] = useState([]);
  const [headerBatchLoading, setHeaderBatchLoading] = useState(false);

  /* ── table rows ── */
  const [components, setComponents] = useState([emptyComponent()]);
  const [coproducts, setCoproducts] = useState([emptyCoproduct()]);
  const [additionalCosts, setAdditionalCosts] = useState([emptyAdditionalCost()]);

  const [submitting, setSubmitting] = useState(false);

  /* ────────────────────────────────────────────────────────────
     API HELPERS
  ──────────────────────────────────────────────────────────── */
  const fetchStockItemDetails = async (itemId) => {
    if (!itemId) return null;
    try {
      const res = await API.get(`${API_ENDPOINTS.getStockItemById}/${itemId}`);
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

  /** Fetch batch list — requires BOTH item_id AND godown_id */
  const fetchBatches = async (itemId, godownId) => {
    if (!itemId || !godownId) return [];
    try {
      const res = await API.get(
        `${API_ENDPOINTS.GET_BATCH_BY_STOCK_ITEM_ID}?item_id=${itemId}&godown_id=${godownId}`
      );
      if (res?.status === 200) return res?.data?.data || [];
    } catch (err) {
      console.error("Batch fetch error", err);
    }
    return [];
  };

  /** Fetch available stock — requires item_id + godown_id */
  const fetchAvailableStock = async ({ itemId, godownId }) => {
    if (!itemId || !godownId) return 0;
    try {
      const res = await API.get(
        `${API_ENDPOINTS.GET_AVAILABLE_QTY_OF_STOCK}?item_id=${itemId}&godown_id=${godownId}`
      );
      if (res?.status === 200) return res?.data?.data?.available_stock || 0;
    } catch {
      // silently return 0
    }
    return 0;
  };

  /* ════════════════════════════════════════════════════════════
     HEADER HANDLERS
  ════════════════════════════════════════════════════════════ */
  const handleFormChange = async (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };

    const newItemId = name === "finished_item_id" ? value : formData.finished_item_id;
    const newGodownId = name === "finished_godown_id" ? value : formData.finished_godown_id;

    /* ── When finished item changes: fetch unit name from API ── */
    if (name === "finished_item_id") {
      next.selected_batch_no = "";
      next.new_batch_no = "";
      setHeaderBatchOptions([]);
      setFinishedItemUnit("");

      if (value) {
        const details = await fetchStockItemDetails(value);
        if (details) setFinishedItemUnit(details.unit_name);
      }
    }

    /* ── When item or godown changes: refresh header batch list ── */
    if (name === "finished_godown_id") {
      next.selected_batch_no = "";
      next.new_batch_no = "";
    }

    if ((name === "finished_item_id" || name === "finished_godown_id") && newItemId && newGodownId) {
      setHeaderBatchLoading(true);
      const batches = await fetchBatches(newItemId, newGodownId);
      setHeaderBatchOptions(batches);
      setHeaderBatchLoading(false);
    }

    setFormData(next);
  };

  /* ════════════════════════════════════════════════════════════
     COMPONENT (CONSUMPTION) TABLE
  ════════════════════════════════════════════════════════════ */
  const handleComponentChange = async (index, field, value) => {
    const updated = [...components];
    updated[index] = { ...updated[index], [field]: value };

    /* ── When item is selected: fetch unit + rate from API ── */
    if (field === "item_id") {
      // Reset first
      updated[index].rate = 0;
      updated[index].unit_id = "";
      updated[index].unit_name = "";
      updated[index].available_qty = 0;
      setComponents([...updated]);

      if (value) {
        const details = await fetchStockItemDetails(value);
        if (details) {
          updated[index].rate = details.rate;
          updated[index].unit_id = details.unit_id;
          updated[index].unit_name = details.unit_name;

          updated[index].gst_applicable = details.gst_applicable;
          updated[index].rate_of_duty = details.rate_of_duty;
        }
      }
    }

    const itemId = field === "item_id" ? value : updated[index].item_id;
    const godownId = field === "godown_id" ? value : updated[index].godown_id;

    /* ── When both item + godown set: fetch available qty ── */
    if ((field === "item_id" || field === "godown_id") && itemId && godownId) {
      const avail = await fetchAvailableStock({ itemId, godownId });
      updated[index].available_qty = avail;
    }

    /* ── Recalculate amount ── */
    const qty = Number(updated[index].qty || 0);
    const rate = Number(updated[index].rate || 0);

    const baseAmount = qty * rate;

    let dutyAmount = 0;
    let finalAmount = baseAmount;

    if (
      Number(updated[index].gst_applicable) === 1 &&
      Number(updated[index].rate_of_duty) > 0
    ) {
       dutyAmount =
        (baseAmount * Number(updated[index].rate_of_duty)) / 100;

      finalAmount += dutyAmount;
    }

    updated[index].duty_amount = dutyAmount;
    updated[index].amount = finalAmount;

    setComponents([...updated]);
  };

  const addComponentRow = () => setComponents([...components, emptyComponent()]);
  const removeComponentRow = (i) => {
    if (components.length === 1) return;
    setComponents(components.filter((_, idx) => idx !== i));
  };

  /* ════════════════════════════════════════════════════════════
     CO-PRODUCT TABLE
  ════════════════════════════════════════════════════════════ */
  const handleCoProductChange = async (index, field, value) => {
    const updated = [...coproducts];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    const currentRow = updated[index];

    /* ── When item selected ── */
    if (field === "item_id") {
      currentRow.unit_id = "";
      currentRow.unit_name = "";
      currentRow.available_qty = 0;
      currentRow.rate = 0;
      currentRow.amount = 0;

      if (value) {
        const details = await fetchStockItemDetails(value);

        if (details) {
          currentRow.unit_id = details.unit_id;
          currentRow.unit_name = details.unit_name;
        }
      }
    }

    const itemId =
      field === "item_id"
        ? value
        : currentRow.item_id;

    const godownId =
      field === "godown_id"
        ? value
        : currentRow.godown_id;

    /* ── Available qty ── */
    if (
      (field === "item_id" || field === "godown_id") &&
      itemId &&
      godownId
    ) {
      const avail = await fetchAvailableStock({
        itemId,
        godownId,
      });

      currentRow.available_qty = avail;
    }

    /* ── CALCULATIONS ── */

    const qty = Number(currentRow.qty || 0);

    const allocationPercent = Number(
      currentRow.cost_allocation_percent || 0
    );

    /* Rate */

    const rate =
      (qty * allocationPercent) / 100;

    /* Amount */

    const amount =
      qty * rate;

    currentRow.rate = rate;
    currentRow.amount = amount;

    setCoproducts(updated);
  };

  const addCoProductRow = () => setCoproducts([...coproducts, emptyCoproduct()]);
  const removeCoProductRow = (i) => {
    if (coproducts.length === 1) return;
    setCoproducts(coproducts.filter((_, idx) => idx !== i));
  };

  /* ════════════════════════════════════════════════════════════
     ADDITIONAL COST TABLE
  ════════════════════════════════════════════════════════════ */
  const handleAdditionalCostChange = (index, field, value) => {
    const updated = [...additionalCosts];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalCosts([...updated]);
  };

  const addAdditionalCostRow = () => setAdditionalCosts([...additionalCosts, emptyAdditionalCost()]);
  const removeAdditionalCostRow = (i) => {
    if (additionalCosts.length === 1) return;
    setAdditionalCosts(additionalCosts.filter((_, idx) => idx !== i));
  };

  /* ════════════════════════════════════════════════════════════
     CALCULATIONS
  ════════════════════════════════════════════════════════════ */
  const componentTotal = useMemo(
    () => components.reduce((acc, r) => acc + Number(r.amount || 0), 0),
    [components]
  );
  const coProductTotal = useMemo(
    () => coproducts.reduce((acc, r) => acc + Number(r.amount || 0), 0),
    [coproducts]
  );
  const additionalCostTotal = useMemo(
    () => additionalCosts.reduce((acc, r) => acc + Number(r.amount || 0), 0),
    [additionalCosts]
  );

  const effectiveCost = componentTotal;
  const allocationToPrimary = componentTotal - coProductTotal + additionalCostTotal;
  const producedQty = Number(formData.produced_qty || 0);
  const effectiveRate = producedQty > 0 ? allocationToPrimary / producedQty : 0;
  const effectiveQty = producedQty;

  /* ════════════════════════════════════════════════════════════
     RESET / SUBMIT
  ════════════════════════════════════════════════════════════ */
  const handleReset = () => {
    setFormData({
      entry_date: "", finished_item_id: "", finished_godown_id: "",
      produced_qty: "", selected_batch_no: "", new_batch_no: "",
      mfg_date: "", expiry_date: "", remarks: "",
    });
    setHeaderBatchOptions([]);
    setFinishedItemUnit("");
    setComponents([emptyComponent()]);
    setCoproducts([emptyCoproduct()]);
    setAdditionalCosts([emptyAdditionalCost()]);
  };

  const totalAllocation = coproducts.reduce(
    (acc, row) =>
      acc + Number(row.cost_allocation_percent || 0),
    0
  );

  const handleSubmit = async () => {
    if (!formData.entry_date || !formData.finished_item_id ||
      !formData.finished_godown_id || !formData.produced_qty) {
      toast({
        title: "Validation Error",
        description: "Date, Finished Item, Godown and Qty are required.",
        status: "warning", duration: 3000, isClosable: true,
      });
      return;
    }
    const invalidCoproductRow = coproducts.find(
  (item) => item.item_id && !item.godown_id
);
if (invalidCoproductRow) {
  toast({
    title: "Validation Error",
    description: "Please select a godown for every co-product/scrap item.",
    status: "warning", duration: 3000, isClosable: true,
  });
  return;
}

    if (totalAllocation > 100) {
      toast({
        title: "Validation Error",
        description: "Total cost allocation cannot exceed 100%",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });

      return;
    }
    const finalBatchNo =
      formData.new_batch_no?.trim() ||
      formData.selected_batch_no ||
      "";

    setSubmitting(true);
    try {
      const payload = {
        entry_date: formData.entry_date,
        finished_item_id: Number(formData.finished_item_id),
        finished_godown_id: Number(formData.finished_godown_id),
        produced_qty: Number(formData.produced_qty),

        batch_no: finalBatchNo,
        mfg_date: formData.mfg_date || null,
        expiry_date: formData.expiry_date || null,
        // remarks: formData.remarks || "",

        total_component_cost: Number(componentTotal),
        total_additional_cost: Number(additionalCostTotal),
        total_cost: Number(allocationToPrimary),
        effective_rate: Number(effectiveRate),

        /* COMPONENTS */
        components: components
          .filter((item) => item.item_id)
          .map((item) => ({
            item_id: Number(item.item_id),
            godown_id: Number(item.godown_id),
            available_qty: Number(item.available_qty || 0),
            qty: Number(item.qty || 0),
            unit_id: Number(item.unit_id),
            rate: Number(item.rate || 0),
            amount: Number(item.amount || 0),
          })),



        /* CO PRODUCTS */
        coproducts: coproducts
          .filter((item) => item.item_id)
          .map((item) => ({
            item_id: Number(item.item_id),
            // godown_id: Number(item.godown_id),
             godown_id: item.godown_id ? Number(item.godown_id) : null,
            qty: Number(item.qty || 0),
            cost_allocation_percent: Number(
              item.cost_allocation_percent || 0
            ),
            unit_id: Number(item.unit_id),
            rate: Number(item.rate || 0),
            amount: Number(item.amount || 0),
          })),

        /* ADDITIONAL COSTS */
        additional_costs: additionalCosts
          .filter((item) => item.ledger_id)
          .map((item) => ({
            ledger_id: Number(item.ledger_id),
            amount: Number(item.amount || 0),
          })),
      };

      const response = await API.post(API_ENDPOINTS.CREATE_MANUFACTURING_MATERIAL, payload);

      if (response?.status === 201) {
        toast({
          title: "Success", description: "Manufacturing Created Successfully",
          status: "success", duration: 3000, isClosable: true,
        });
        handleReset();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Something went wrong",
        status: "error", duration: 3000, isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ════════════════════════════════════════════════════════════
     RENDER HELPERS
  ════════════════════════════════════════════════════════════ */
  const inputSx = { fontSize: "sm", h: "32px" };
  const selectSx = { fontSize: "sm", h: "32px" };

  /**
   * Header batch fields — shown only when finished_item_id + finished_godown_id are set.
   */
  <BatchFields
    batchOptions={headerBatchOptions}
    batchLoading={headerBatchLoading}
    selectedValue={formData.selected_batch_no}
    newValue={formData.new_batch_no}
    selectSx={selectSx}
    inputSx={inputSx}
    onSelectChange={(e) =>
      setFormData((p) => ({
        ...p,
        selected_batch_no: e.target.value,
      }))
    }
    onNewChange={(e) =>
      setFormData((p) => ({
        ...p,
        new_batch_no: e.target.value,
      }))
    }
  />

  /* ════════════════════════════════════════════════════════════
     JSX
  ════════════════════════════════════════════════════════════ */
  return (
    <Box>
      <Heading size="md" mb={5} color="gray.700">
        Create Material Manufacturing
      </Heading>

      {/* ── HEADER FORM ── */}
      <Box border="1px solid #E2E8F0" p={5} borderRadius="lg" bg="white">
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2,1fr)", lg: "repeat(2,1fr)" }}
          gap={4}
        >
          {/* Date */}
          <GridItem>
            <Text mb="2px" fontSize="12px" fontWeight="medium" color="gray.600">
              Select Date
            </Text>
            <Input
              type="date" name="entry_date"
              value={formData.entry_date} onChange={handleFormChange} sx={inputSx}
            />
          </GridItem>

          {/* Finished Item */}
          <GridItem>
            <Text mb="2px" fontSize="12px" fontWeight="medium" color="gray.600">
              Name of Product
            </Text>
            <Select
              name="finished_item_id" onFocus={onRefreshStockItems}
              value={formData.finished_item_id} onChange={handleFormChange} sx={selectSx}
            >
              <option value="">Select Item</option>
              {stockItem.map((item) => (
                <option key={item.id} value={item.id}>{item.item_name}</option>
              ))}
            </Select>
          </GridItem>

          {/* Godown */}
          <GridItem>
            <Text mb="2px" fontSize="12px" fontWeight="medium" color="gray.600">
              Godown
            </Text>
            <Select
              name="finished_godown_id"
              value={formData.finished_godown_id} onChange={handleFormChange} sx={selectSx}
            >
              <option value="">Select Godown</option>
              {godown.map((item) => (
                <option key={item.id} value={item.id}>{item.godown_name}</option>
              ))}
            </Select>
          </GridItem>

          {/* Qty + Unit (unit fetched from API) */}
          <GridItem>
            <Text mb="2px" fontSize="12px" fontWeight="medium" color="gray.600">
              Qty
            </Text>
            <Flex gap={2}>
              <Input
                type="number"
                name="produced_qty"
                value={formData.produced_qty}
                onChange={handleFormChange}
                placeholder="0"
                sx={inputSx}
              />
              <Input
                value={finishedItemUnit}
                readOnly
                w="90px"
                bg="gray.50"
                sx={inputSx}
                placeholder="Unit"
                textAlign="center"
                fontWeight="medium"
                color="gray.600"
              />
            </Flex>
          </GridItem>

          {/* Dual Batch Fields (header) */}
          <GridItem colSpan={{ base: 1, md: 2 }}>
            <Text mb="2px" fontSize="12px" fontWeight="medium" color="gray.600">
              Batch No
              {(!formData.finished_item_id || !formData.finished_godown_id) && (
                <Tag size="sm" ml={2} colorScheme="orange" fontSize="10px">
                  Select item + godown first
                </Tag>
              )}
            </Text>
            <BatchFields
              batchOptions={headerBatchOptions}
              batchLoading={headerBatchLoading}
              selectedValue={formData.selected_batch_no}
              newValue={formData.new_batch_no}
              onSelectChange={(e) => setFormData((p) => ({ ...p, selected_batch_no: e.target.value }))}
              onNewChange={(e) => setFormData((p) => ({ ...p, new_batch_no: e.target.value }))}
            />
          </GridItem>

          {/* MFG Date */}
          <GridItem>
            <Text mb="2px" fontSize="12px" fontWeight="medium" color="gray.600">Mfg Date</Text>
            <Input
              type="date" name="mfg_date"
              value={formData.mfg_date} onChange={handleFormChange} sx={inputSx}
            />
          </GridItem>

          {/* Expiry Date */}
          <GridItem>
            <Text mb="2px" fontSize="12px" fontWeight="medium" color="gray.600">Exp Date</Text>
            <Input
              type="date" name="expiry_date"
              value={formData.expiry_date} onChange={handleFormChange} sx={inputSx}
            />
          </GridItem>
        </Grid>
      </Box>

      {/* ── COMPONENT CONSUMPTION ── */}
      <Box mt={7}>
        <SectionHeader title="Component (Consumption)" onAdd={addComponentRow} />
        <Box border="1px solid #E2E8F0" overflowX="auto" borderRadius="0px 0px 12px 12px">
          <Table size="sm" className="material_mfg">
            <Thead bg="gray.50">
              <Tr>
                <Th>Name of Item</Th>
                <Th>Godown</Th>
                <Th>Available Qty</Th>
                <Th>Qty</Th>
                <Th>Unit</Th>
                <Th>Rate</Th>
                <Th>Duty/GST Amt</Th>
                <Th>Amount</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {components.map((row, index) => (
                <Tr key={index}>
                  {/* Item */}
                  <Td minW="180px">
                    <Select
                      value={row.item_id} sx={selectSx} onFocus={onRefreshStockItems}
                      onChange={(e) => handleComponentChange(index, "item_id", e.target.value)}
                    >
                      <option value="">Select</option>
                      {stockItem.map((item) => (
                        <option key={item.id} value={item.id}>{item.item_name}</option>
                      ))}
                    </Select>
                  </Td>

                  {/* Godown */}
                  <Td minW="150px">
                    <Select
                      value={row.godown_id} sx={selectSx}
                      onChange={(e) => handleComponentChange(index, "godown_id", e.target.value)}
                    >
                      <option value="">Select</option>
                      {godown.map((item) => (
                        <option key={item.id} value={item.id}>{item.godown_name}</option>
                      ))}
                    </Select>
                  </Td>

                  {/* Available Qty */}
                  <Td minW="110px">
                    <Input value={parseFloat(row.available_qty)} readOnly bg="gray.50" sx={inputSx} />
                  </Td>

                  {/* Qty */}
                  <Td minW="90px">
                    <Input
                      type="number" value={row.qty} sx={inputSx}
                      onChange={(e) => handleComponentChange(index, "qty", e.target.value)}
                    />
                  </Td>

                  {/* Unit (auto-filled from API) */}
                  <Td minW="80px">
                    <Input
                      value={row.unit_name} readOnly bg="gray.50" sx={inputSx}
                      placeholder="—"
                      textAlign="center"
                    />
                  </Td>

                  {/* Rate (auto-filled from API) */}
                  <Td minW="90px">
                    {/* <Input value={row.rate}  bg="gray.50" sx={inputSx}/> */}

                    <Input
                      type="number"
                      value={row.rate}
                      sx={inputSx}
                      onChange={(e) => handleComponentChange(index, "rate", e.target.value)}
                    />

                  </Td>

                  <Td minW="100px">
                    <Input
                      value={Number(row.duty_amount || 0).toFixed(2)}
                      readOnly
                      bg="gray.50"
                      sx={inputSx}
                    />
                  </Td>

                  {/* Amount */}
                  <Td minW="90px">
                    <Input value={Number(row.amount).toFixed(2)} readOnly sx={inputSx} />
                  </Td>

                  {/* Delete */}
                  <Td>
                    <IconButton
                      icon={<DeleteIcon />} size="xs" colorScheme="red"
                      variant="ghost" aria-label="Remove"
                      isDisabled={components.length === 1}
                      onClick={() => removeComponentRow(index)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* ── CO-PRODUCT / SCRAP ── */}
      <Box mt={7}>
        <SectionHeader title="Co-Product / Scrap" onAdd={addCoProductRow} />
        <Box border="1px solid #E2E8F0" overflowX="auto">
          <Table size="sm" className="material_mfg" borderRadius="0px 0px 12px 12px">
            <Thead bg="gray.50">
              <Tr>
                <Th>Name of Item</Th>
                <Th>Godown</Th>
                <Th>Available Qty</Th>
                <Th>% Cost Alloc.</Th>
                <Th>Qty</Th>
                <Th>Unit</Th>
                <Th>Rate</Th>
                <Th>Amount</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {coproducts.map((row, index) => (
                <Tr key={index}>
                  {/* Item */}
                  <Td minW="180px">
                    <Select
                      value={row.item_id} sx={selectSx} onFocus={onRefreshStockItems}
                      onChange={(e) => handleCoProductChange(index, "item_id", e.target.value)}
                    >
                      <option value="">Select</option>
                      {stockItem.map((item) => (
                        <option key={item.id} value={item.id}>{item.item_name}</option>
                      ))}
                    </Select>
                  </Td>

                  {/* Godown */}
                  <Td minW="150px">
                    <Select
                      value={row.godown_id} sx={selectSx}
                      onChange={(e) => handleCoProductChange(index, "godown_id", e.target.value)} >
                      <option value="">Select</option>
                      {godown.map((item) => (
                        <option key={item.id} value={item.id}>{item.godown_name}</option>
                      ))}
                    </Select>
                  </Td>

                  {/* Available Qty */}
                  <Td minW="110px">
                    <Input value={parseFloat(row.available_qty)} readOnly bg="gray.50" sx={inputSx} />
                  </Td>

                  {/* % Cost Allocation */}
                  <Td minW="110px">
                    <Input type="number" value={row.cost_allocation_percent} sx={inputSx}
                      onChange={(e) => handleCoProductChange(index, "cost_allocation_percent", e.target.value)} />
                  </Td>

                  {/* Qty */}
                  <Td minW="80px">
                    <Input type="number" value={row.qty} sx={inputSx}
                      onChange={(e) => handleCoProductChange(index, "qty", e.target.value)} />
                  </Td>

                  {/* Unit (auto-filled from API) */}
                  <Td minW="80px">
                    <Input value={row.unit_name} readOnly bg="gray.50" sx={inputSx}
                      placeholder="—" textAlign="center" />
                  </Td>

                  {/* Rate (auto-filled from API) */}
                  <Td minW="90px">
                    <Input value={Number(row.rate).toFixed(2)} readOnly bg="gray.50" sx={inputSx} />
                  </Td>

                  {/* Amount */}
                  <Td minW="90px">
                    <Input value={Number(row.amount).toFixed(2)} readOnly sx={inputSx} />
                  </Td>

                  {/* Delete */}
                  <Td>
                    <IconButton
                      icon={<DeleteIcon />} size="xs" colorScheme="red"
                      variant="ghost" aria-label="Remove"
                      isDisabled={coproducts.length === 1}
                      onClick={() => removeCoProductRow(index)} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* ── COST OF COMPONENT (ADDITIONAL COSTS) ── */}
      <Box mt={7}>
        <SectionHeader title="Cost of Component" onAdd={addAdditionalCostRow} />
        <Box border="1px solid #E2E8F0" overflowX="auto" borderRadius="0px 0px 12px 12px">
          <Table size="sm" className="material_mfg">
            <Thead bg="gray.50">
              <Tr>
                <Th>Type of Additional Cost (Ledger)</Th>
                <Th>Amount</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {additionalCosts.map((row, index) => (
                <Tr key={index}>
                  <Td minW="260px">
                    <Select
                      value={row.ledger_id} sx={selectSx} onFocus={onRefreshLedgers}
                      onChange={(e) => handleAdditionalCostChange(index, "ledger_id", e.target.value)} >
                      <option value="">Please Select</option>
                      {ledger.map((item) => (
                        <option key={item.id} value={item.id}>{item.ledger_name}</option>
                      ))}
                    </Select>
                  </Td>
                  <Td minW="160px">
                    <Input
                      type="number" value={row.amount} sx={inputSx}
                      onChange={(e) => handleAdditionalCostChange(index, "amount", e.target.value)}
                    />
                  </Td>
                  <Td>
                    <IconButton
                      icon={<DeleteIcon />} size="xs" colorScheme="red"
                      variant="ghost" aria-label="Remove"
                      isDisabled={additionalCosts.length === 1}
                      onClick={() => removeAdditionalCostRow(index)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* ── SUMMARY ── */}
      <Box mt={6} border="1px solid #E2E8F0" borderRadius="md" overflow="hidden">
        <Box bg="gray.50" px={4} py={2} borderBottom="1px solid #E2E8F0">
          <Text fontWeight="bold" fontSize="sm" color="gray.600">Summary</Text>
        </Box>
        <Box p={5}>
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2,1fr)", lg: "repeat(3,1fr)" }}
            gap={4}
          >
            <GridItem>
              <Text fontSize="12px" color="gray.500" mb={1}>Total Addl. Cost</Text>
              <Input value={additionalCostTotal.toFixed(2)} readOnly bg="#f5f8f9" fontWeight="bold" sx={inputSx} />
            </GridItem>

            <GridItem>
              <Text fontSize="12px" color="gray.500" mb={1}> Total Co-Product / Scrap Cost </Text>
              <Input value={coProductTotal.toFixed(2)} readOnly bg="#f5f8f9" fontWeight="bold" sx={inputSx} />
            </GridItem>

            <GridItem>
              <Text fontSize="12px" color="gray.500" mb={1}>Effective Cost</Text>
              <Input value={effectiveCost.toFixed(2)} readOnly bg="#f5f8f9" fontWeight="bold" sx={inputSx} />
            </GridItem>

            <GridItem>
              <Text fontSize="12px" color="gray.500" mb={1}>
                Allocation to Primary Item
                <Text as="span" fontSize="xs" color="gray.400" ml={1}>(Comp − CoProd + Addl)</Text>
              </Text>
              <Input value={allocationToPrimary.toFixed(2)} readOnly bg="#f5f8f9" fontWeight="bold" sx={inputSx} />
            </GridItem>

            <GridItem>
              <Text fontSize="12px" color="gray.500" mb={1}>
                Effective Rate of Primary Item
                <Text as="span" fontSize="xs" color="gray.400" ml={1}>(Allocation ÷ Qty)</Text>
              </Text>
              <Input
                value={
                  producedQty > 0
                    ? `${effectiveRate.toFixed(2)} / ${finishedItemUnit}`
                    : "0"
                }
                readOnly bg="#f3fdf2" fontWeight="bold" sx={inputSx}
              />
            </GridItem>

            <GridItem>
              <Text fontSize="12px" color="gray.500" mb={1}>Effective Qty of Primary Item</Text>
              <Input
                value={
                  effectiveQty > 0
                    ? `${effectiveQty.toFixed(2)} ${finishedItemUnit}`
                    : "0"
                }
                readOnly bg="#f3fdf2" fontWeight="bold" sx={inputSx}
              />
            </GridItem>
          </Grid>
        </Box>
      </Box>

      {/* ── REMARKS ── */}
      {/* <Box mt={5}>
        <Text mb={1} fontSize="sm" fontWeight="medium">Remarks</Text>
        <Textarea
          placeholder="Enter remarks…" name="remarks"
          value={formData.remarks} onChange={handleFormChange}
          rows={3} fontSize="sm"
        />
      </Box> */}

      {/* ── ACTIONS ── */}
      <Flex justify="flex-end" gap={3} mt={6} alignItems="center">
        <Button variant="outline" onClick={handleReset} height="34px" fontSize="14px" border="1px solid #c8c5c5">Reset</Button>
        <Button bg="#237086" fontWeight="500"
          fontSize="14px" color="white"
          _hover={{ bg: "#1B5A6B" }}
          px={8} borderRadius="12px" onClick={handleSubmit}
          isLoading={submitting} loadingText="Saving…">
          Save Manufacturing
        </Button>
      </Flex>
    </Box>
  );
};

export default MaterialManufacturing;