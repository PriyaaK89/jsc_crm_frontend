// Crop Management → Crop Seasons
// The one season list (Kharif / Rabi / Zaid …) used by crops, Business Plans and Advance Booking.
// Seasons are added or switched off — never renamed or deleted, because plans and bookings keep
// the season name. Admin / Super Admin (or crop_manage) only; the server checks every call.
import React, { useCallback, useEffect, useState } from "react";
import { Badge, Box, Button, Center, Flex, HStack, Input, Spinner, Switch, Table, Tbody, Td, Text, Th, Thead, Tr, useToast } from "@chakra-ui/react";
import { cropCatalogApi, catalogError } from "../../services/cropCatalogApi";
import { sectionStyle, sectionHeaderStyle, labelStyle, inputStyle, thStyle, tdStyle } from "./cropStyles";

const CropSeasonsTab = () => {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const say = (title, status = "success") => toast({ title, status, duration: status === "success" ? 2500 : 5000, isClosable: true });

  const load = useCallback(async () => {
    try {
      setRows(await cropCatalogApi.seasons(true));
    } catch (e) {
      setRows([]);
      toast({ title: catalogError(e, "Failed to load crop seasons"), status: "error", duration: 4000, isClosable: true });
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (name.trim().length < 2) return say("Enter the season name (e.g. Kharif)", "warning");
    setBusy(true);
    try {
      say((await cropCatalogApi.addSeason(name.trim())).message);
      setName("");
      load();
    } catch (e) {
      say(catalogError(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (s) => {
    try {
      say((await cropCatalogApi.setSeasonStatus(s.id, !s.is_active)).message);
      load();
    } catch (e) {
      say(catalogError(e), "error");
    }
  };

  return (
    <>
      <Box {...sectionStyle}>
        <Box {...sectionHeaderStyle}><Text fontWeight="500" fontSize="sm">Add Crop Season</Text></Box>
        <Flex gap={3} p={4} align="flex-end" direction={{ base: "column", md: "row" }}>
          <Box flex="1" w="100%">
            <Text {...labelStyle}>Season name <Text as="span" color="red.500">*</Text></Text>
            <Input {...inputStyle} value={name} maxLength={30} placeholder="e.g. Kharif, Rabi, Zaid, Summer" onChange={(e) => setName(e.target.value)} />
          </Box>
          <Button size="sm" bg="#237086" color="white" _hover={{ bg: "#1B5A6B" }} px={8} h="40px" isLoading={busy} onClick={add}>Add Season</Button>
        </Flex>
        <Text fontSize="11px" color="gray.500" px={4} pb={3}>
          This is the same season list used by Business Plans and Advance Booking. A season is never renamed or deleted (plans and bookings keep its name); switch it off instead.
        </Text>
      </Box>

      <Box {...sectionStyle}>
        <Box {...sectionHeaderStyle}><Text fontWeight="500" fontSize="sm">Crop Seasons</Text></Box>
        {!rows ? (
          <Center py={10}><Spinner color="#4f9190" /></Center>
        ) : (
          <Box overflowX="auto">
            <Table size="sm">
              <Thead bg="gray.50">
                <Tr><Th {...thStyle}>#</Th><Th {...thStyle}>Season</Th><Th {...thStyle}>Crops</Th><Th {...thStyle}>Status</Th></Tr>
              </Thead>
              <Tbody>
                {rows.length === 0 && <Tr><Td colSpan={4} textAlign="center" py={6} fontSize="12px" color="gray.500">No season yet</Td></Tr>}
                {rows.map((s, i) => (
                  <Tr key={s.id} bg={i % 2 === 0 ? "white" : "#f7faf8"}>
                    <Td {...tdStyle} fontSize="12px">{i + 1}</Td>
                    <Td {...tdStyle} fontSize="12px" fontWeight="600">{s.name}</Td>
                    <Td {...tdStyle} fontSize="12px">{s.crop_count}</Td>
                    <Td {...tdStyle}>
                      <HStack>
                        <Switch size="sm" colorScheme="teal" isChecked={s.is_active} onChange={() => toggle(s)} />
                        <Badge colorScheme={s.is_active ? "green" : "red"} fontSize="10px">{s.is_active ? "Active" : "Off"}</Badge>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
    </>
  );
};

export default CropSeasonsTab;
