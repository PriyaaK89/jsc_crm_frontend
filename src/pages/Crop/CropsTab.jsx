import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Grid, GridItem, Input, Textarea, Text, Button, Table, Thead, Tbody, Tr, Th, Td,
  Switch, Badge, Spinner, Center, Flex, HStack, useToast,
} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import CropFieldsDrawer from "./CropFieldsDrawer";
import { sectionStyle, sectionHeaderStyle, labelStyle, inputStyle, thStyle, tdStyle, errMsg } from "./cropStyles";

const emptyForm = { crop_name: "", description: "" };

const CropsTab = () => {
  const toast = useToast();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);

  const loadCrops = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`${API_ENDPOINTS.get_crops_list}?include_inactive=1`);
      setCrops(res?.data?.data || []);
    } catch (e) {
      toast({ title: errMsg(e, "Failed to load crops"), status: "error", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadCrops(); }, [loadCrops]);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const handleSave = async () => {
    if (!form.crop_name.trim()) {
      return toast({ title: "Crop name is required", status: "warning", duration: 3000, isClosable: true });
    }
    const payload = { crop_name: form.crop_name.trim(), description: form.description.trim() };
    setSaving(true);
    try {
      if (editingId) {
        await API.put(`${API_ENDPOINTS.update_crop}/${editingId}`, payload);
        toast({ title: "Crop updated", status: "success", duration: 2500, isClosable: true });
      } else {
        await API.post(API_ENDPOINTS.create_crops, payload);
        toast({ title: "Crop created", status: "success", duration: 2500, isClosable: true });
      }
      resetForm();
      loadCrops();
    } catch (e) {
      toast({ title: errMsg(e, "Failed to save crop"), status: "error", duration: 3000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({ crop_name: c.crop_name || "", description: c.description || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleActive = async (c) => {
    try {
      await API.patch(`${API_ENDPOINTS.set_crop_active}/${c.id}`, { is_active: !c.is_active });
      loadCrops();
    } catch (e) {
      toast({ title: errMsg(e, "Failed to update status"), status: "error", duration: 3000, isClosable: true });
    }
  };

  return (
    <>
      {/* Create / edit form */}
      <Box {...sectionStyle}>
        <Box {...sectionHeaderStyle}>
          <Text fontWeight="500" fontSize="sm">{editingId ? "Edit Crop" : "Create Crop"}</Text>
        </Box>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={4} p={4}>
          <GridItem>
            <Text {...labelStyle}>Crop Name <Text as="span" color="red.500">*</Text></Text>
            <Input {...inputStyle} value={form.crop_name} placeholder="e.g. Wheat"
              onChange={(e) => setForm((p) => ({ ...p, crop_name: e.target.value }))} />
          </GridItem>
          <GridItem>
            <Text {...labelStyle}>Description</Text>
            <Textarea rows={2} fontSize="12px" borderColor="#c8d0d8" bg="white" value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </GridItem>
        </Grid>
        <Flex justify="flex-end" gap={2} px={4} pb={4}>
          {editingId && <Button size="sm" variant="ghost" onClick={resetForm}>Cancel</Button>}
          <Button size="sm" bg="#237086" color="white" _hover={{ bg: "#1B5A6B" }} px={8}
            isLoading={saving} onClick={handleSave}>
            {editingId ? "Update Crop" : "Create Crop"}
          </Button>
        </Flex>
      </Box>

      {/* Crops list */}
      <Box {...sectionStyle}>
        <Box {...sectionHeaderStyle}><Text fontWeight="500" fontSize="sm">Crops</Text></Box>
        {loading ? (
          <Center py={10}><Spinner color="#4f9190" /></Center>
        ) : (
          <Box overflowX="auto">
            <Table size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th {...thStyle}>#</Th>
                  <Th {...thStyle}>Crop Name</Th>
                  <Th {...thStyle}>Description</Th>
                  <Th {...thStyle}>Status</Th>
                  <Th {...thStyle}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {crops.length === 0 && (
                  <Tr><Td colSpan={5} textAlign="center" py={6} fontSize="12px" color="gray.500">No crops yet</Td></Tr>
                )}
                {crops.map((c, i) => (
                  <Tr key={c.id} bg={i % 2 === 0 ? "white" : "#f7faf8"}>
                    <Td {...tdStyle} fontSize="12px">{i + 1}</Td>
                    <Td {...tdStyle} fontSize="12px" fontWeight="600">{c.crop_name}</Td>
                    <Td {...tdStyle} fontSize="12px">{c.description || "-"}</Td>
                    <Td {...tdStyle}>
                      <HStack>
                        <Switch size="sm" colorScheme="teal" isChecked={!!c.is_active} onChange={() => toggleActive(c)} />
                        <Badge colorScheme={c.is_active ? "green" : "red"} fontSize="10px">
                          {c.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </HStack>
                    </Td>
                    <Td {...tdStyle}>
                      <HStack spacing={1}>
                        <Button size="xs" variant="outline" colorScheme="teal" onClick={() => startEdit(c)}>Edit</Button>
                        <Button size="xs" bg="#237086" color="white" _hover={{ bg: "#1B5A6B" }}
                          isDisabled={!c.is_active} onClick={() => setSelectedCrop(c)}>
                          Configure Fields
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      <CropFieldsDrawer crop={selectedCrop} isOpen={!!selectedCrop} onClose={() => setSelectedCrop(null)} />
    </>
  );
};

export default CropsTab;