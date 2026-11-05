import React, { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Checkbox,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Progress,
  SimpleGrid,
  Switch,
  Text,
} from "@chakra-ui/react";
import {
  MdAccountBalance,
  MdAddCircleOutline,
  MdApartment,
  MdAssessment,
  MdAssignment,
  MdBadge,
  MdBusiness,
  MdCategory,
  MdChat,
  MdDeleteOutline,
  MdEditNote,
  MdEvent,
  MdExtension,
  MdGroups,
  MdInventory2,
  MdLocalPrintshop,
  MdMenuBook,
  MdNotificationsNone,
  MdPayments,
  MdPeople,
  MdRoute,
  MdSearch,
  MdStorefront,
  MdSwapHoriz,
  MdTrackChanges,
  MdVisibility,
  MdWarehouse,
  MdWorkOutline,
} from "react-icons/md";

const ACTIONS = [
  { key: "view", label: "View", icon: MdVisibility, color: "blue" },
  { key: "create", label: "Create", icon: MdAddCircleOutline, color: "green" },
  { key: "edit", label: "Edit", icon: MdEditNote, color: "orange" },
  { key: "delete", label: "Delete", icon: MdDeleteOutline, color: "red" },
];

const MODULE_ICONS = [
  [/notification/, MdNotificationsNone],
  [/job.?role/, MdWorkOutline],
  [/user/, MdPeople],
  [/department/, MdApartment],
  [/report/, MdAssessment],
  [/stock.?movement/, MdSwapHoriz],
  [/stock.?group|stock.?category|unit/, MdCategory],
  [/stock|inventory/, MdInventory2],
  [/godown/, MdWarehouse],
  [/company/, MdBusiness],
  [/distributor|retailer/, MdStorefront],
  [/account|ledger|voucher/, MdAccountBalance],
  [/transaction/, MdPayments],
  [/team/, MdGroups],
  [/target/, MdTrackChanges],
  [/holiday/, MdEvent],
  [/hr/, MdBadge],
  [/demo/, MdExtension],
  [/task/, MdAssignment],
  [/chat/, MdChat],
  [/beat/, MdRoute],
  [/print/, MdLocalPrintshop],
];

export const moduleLabel = (value) =>
  String(value || "Other")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const moduleIcon = (value) => {
  const key = String(value || "").toLowerCase();
  const match = MODULE_ICONS.find(([pattern]) => pattern.test(key));
  return match ? match[1] : MdMenuBook;
};

const ModuleCard = ({ module, selected, toggle, readOnly }) => {
  const ids = module.permissions.map((p) => p.id);
  const count = ids.filter((id) => selected.has(id)).length;
  const specials = module.permissions.filter((p) => p.action === "special");
  const actions = ACTIONS.map((a) => ({
    ...a,
    permissions: module.permissions.filter((p) => p.action === a.key),
  })).filter((a) => a.permissions.length);

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor={count ? "blue.200" : "gray.200"}
      borderRadius="xl"
      p={4}
      boxShadow="sm"
      transition="box-shadow 0.15s ease, border-color 0.15s ease"
      _hover={{ boxShadow: "md" }}
    >
      <Flex align="center" gap={3}>
        <Flex w="40px" h="40px" flexShrink={0} align="center" justify="center" borderRadius="lg" bg="blue.50" color="blue.600">
          <Icon as={moduleIcon(module.module)} boxSize={5} />
        </Flex>
        <Box flex="1" minW={0}>
          <Text fontWeight="700" fontSize="sm" noOfLines={1}>
            {moduleLabel(module.module)}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {count} of {ids.length} selected
          </Text>
        </Box>
        {!readOnly && (
          <Switch
            aria-label={`Select all ${moduleLabel(module.module)} permissions`}
            colorScheme="blue"
            isChecked={count === ids.length}
            onChange={(e) => toggle(ids, e.target.checked)}
          />
        )}
      </Flex>

      <Progress value={(count / ids.length) * 100} size="xs" colorScheme="blue" borderRadius="full" mt={3} />

      {actions.length > 0 && (
        <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={2} mt={3}>
          {actions.map((a) => {
            const on = a.permissions.every((p) => selected.has(p.id));
            return (
              <Box
                key={a.key}
                as="label"
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={1}
                py={2}
                borderRadius="lg"
                border="1px solid"
                borderColor={on ? `${a.color}.300` : "gray.200"}
                bg={on ? `${a.color}.50` : "white"}
                cursor={readOnly ? "default" : "pointer"}
              >
                <Icon as={a.icon} boxSize={4} color={on ? `${a.color}.600` : "gray.400"} />
                <Text fontSize="xs" fontWeight="600" color={on ? `${a.color}.700` : "gray.600"}>
                  {a.label}
                </Text>
                <Checkbox
                  size="sm"
                  colorScheme={a.color}
                  aria-label={`${a.label} ${moduleLabel(module.module)}`}
                  isChecked={on}
                  isReadOnly={readOnly}
                  onChange={(e) => toggle(a.permissions.map((p) => p.id), e.target.checked)}
                />
              </Box>
            );
          })}
        </SimpleGrid>
      )}

      {specials.length > 0 && (
        <Box mt={3}>
          <Text fontSize="xs" fontWeight="700" color="gray.500" mb={1}>
            Special access
          </Text>
          {specials.map((p) => (
            <Box key={p.id} py={0.5}>
              <Checkbox
                size="sm"
                colorScheme="purple"
                isChecked={selected.has(p.id)}
                isReadOnly={readOnly}
                onChange={(e) => toggle([p.id], e.target.checked)}
              >
                <Text as="span" fontSize="sm">{p.name}</Text>
              </Checkbox>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

const PermissionEditor = ({ modules, selected, onChange, readOnly = false }) => {
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return modules;
    return modules.filter(
      (m) =>
        moduleLabel(m.module).toLowerCase().includes(term) ||
        m.permissions.some((p) => `${p.name} ${p.code}`.toLowerCase().includes(term)),
    );
  }, [modules, search]);

  const toggle = (ids, checked) => {
    const next = new Set(selected);
    ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
    onChange(next);
  };

  return (
    <Box>
      <InputGroup mb={4} maxW={{ base: "100%", md: "360px" }}>
        <InputLeftElement pointerEvents="none">
          <Icon as={MdSearch} color="gray.400" />
        </InputLeftElement>
        <Input
          aria-label="Search modules or permissions"
          placeholder="Search modules or permissions"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          bg="white"
        />
      </InputGroup>

      {visible.length === 0 && (
        <Text color="gray.500" textAlign="center" py={8}>No permissions match your search.</Text>
      )}

      <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={4}>
        {visible.map((m) => (
          <ModuleCard key={m.module} module={m} selected={selected} toggle={toggle} readOnly={readOnly} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

// the selected permissions, grouped by module
export const PermissionSummary = ({ modules, selected, emptyText }) => {
  const chosen = modules
    .map((m) => ({ module: m.module, items: m.permissions.filter((p) => selected.has(p.id)) }))
    .filter((m) => m.items.length);

  if (!chosen.length) return <Text color="gray.600">{emptyText}</Text>;

  return chosen.map((m) => (
    <Box key={m.module} mb={3}>
      <Flex align="center" gap={2} mb={1}>
        <Icon as={moduleIcon(m.module)} color="blue.600" />
        <Text fontWeight="700" fontSize="sm">{moduleLabel(m.module)}</Text>
        <Badge borderRadius="full">{m.items.length}</Badge>
      </Flex>
      <Flex wrap="wrap" gap={1.5}>
        {m.items.map((p) => (
          <Badge key={p.id} colorScheme="blue" variant="subtle" textTransform="none" px={2} py={0.5} borderRadius="md">
            {p.name}
          </Badge>
        ))}
      </Flex>
    </Box>
  ));
};

export default PermissionEditor;