// Business Plan → All Plans (GET /business-plan/plans: search, filters, sort, pagination)
import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Tab,
  TabList,
  Tabs,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { bpApi, apiError } from "../../services/businessPlanApi";
import BpPlanFormModal from "./BpPlanFormModal";
import {
  DataTable,
  EMPTY_FILTERS,
  ErrorBox,
  FilterBar,
  PageTitle,
  PerfBadge,
  StatusBadge,
  fmtDate,
  money, useOpenPlan } from "./bpShared";

const STATUSES = [
  ["", "All statuses"],
  ["DRAFT", "Draft"],
  ["SUBMITTED", "Submitted"],
  ["UNDER_REVIEW", "Under Review"],
  ["ACTIVE", "Active"],
  ["REJECTED", "Rejected"],
  ["CLOSED", "Closed"],
];

const SORTS = [
  ["created_at", "Newest"],
  ["start_date", "Start date"],
  ["sales_target", "Sales target"],
  ["name", "Name"],
  ["plan_code", "Plan code"],
  ["status", "Status"],
];

const BpPlanList = () => {
  const navigate = useNavigate();
  const openPlan = useOpenPlan(navigate);
  const [params, setParams] = useSearchParams();
  const create = useDisclosure();

  const [pendingOnly, setPendingOnly] = useState(params.get("pending") === "1");
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ?create=1 from the dashboard opens the form
  useEffect(() => {
    if (params.get("create") === "1") {
      create.onOpen();
      params.delete("create");
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [filters, query, status, sortBy, sortDir, pendingOnly]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(
        await bpApi.plans({
          ...filters,
          search: query,
          status: pendingOnly ? undefined : status,
          pending_approval: pendingOnly ? 1 : undefined,
          sort_by: sortBy,
          sort_dir: sortDir,
          page,
          limit: 20,
        }),
      );
    } catch (err) {
      setError(apiError(err, "Could not load plans"));
    } finally {
      setLoading(false);
    }
  }, [filters, query, status, sortBy, sortDir, page, pendingOnly]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Box>
      <PageTitle
        title="All Business Plans"
        subtitle="Every plan in your scope — created in the app or here"
        right={
          <Button size="sm" colorScheme="teal" onClick={create.onOpen}>
            + Create Business Plan
          </Button>
        }
      />

      <Tabs
        size="sm"
        variant="soft-rounded"
        colorScheme="teal"
        index={pendingOnly ? 1 : 0}
        onChange={(i) => setPendingOnly(i === 1)}
        mb={3}
      >
        <TabList>
          <Tab>All Plans</Tab>
          <Tab>Pending My Approval</Tab>
        </TabList>
      </Tabs>

      <FilterBar
        value={filters}
        onChange={setFilters}
        show={["financial_year", "season", "state_id", "territory_id", "product_id", "employee_id"]}
      />

      <Flex gap={2} mb={4} wrap="wrap">
        <InputGroup size="sm" maxW={{ base: "100%", md: "320px" }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search code, name, employee, territory"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            borderRadius="8px"
          />
        </InputGroup>
        {!pendingOnly && (
          <Select size="sm" maxW="180px" value={status} onChange={(e) => setStatus(e.target.value)} borderRadius="8px">
            {STATUSES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        )}
        <Select size="sm" maxW="160px" value={sortBy} onChange={(e) => setSortBy(e.target.value)} borderRadius="8px">
          {SORTS.map(([v, l]) => (
            <option key={v} value={v}>
              Sort: {l}
            </option>
          ))}
        </Select>
        <Button size="sm" variant="outline" onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}>
          {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
        </Button>
      </Flex>

      {error && <ErrorBox message={error} onRetry={load} />}

      <DataTable
        rows={result.items}
        onRowClick={openPlan}
        emptyText={loading ? "Loading…" : pendingOnly ? "No plans are waiting for your approval." : "No business plans found."}
        columns={[
          {
            key: "plan_code",
            label: "Plan",
            render: (p) => (
              <Box>
                <Text fontWeight="700">{p.plan_code}</Text>
                <Text fontSize="xs" color="gray.500" maxW="260px" noOfLines={1}>
                  {p.name}
                </Text>
              </Box>
            ),
          },
          { key: "assigned_user_name", label: "Employee", render: (p) => p.assigned_user_name || "—" },
          { key: "fy", label: "FY / Season", render: (p) => `${p.financial_year} · ${p.season}` },
          { key: "period", label: "Period", render: (p) => `${fmtDate(p.start_date)} – ${fmtDate(p.end_date)}` },
          { key: "territory", label: "State / Territory", render: (p) => `${p.state_name || "—"} / ${p.territory_name || "—"}` },
          { key: "sales_target", label: "Target", numeric: true, render: (p) => money(p.sales_target) },
          { key: "achieved", label: "Achieved", numeric: true, render: (p) => money(p.achieved) },
          { key: "pct", label: "Achv", render: (p) => <PerfBadge performance={p.performance} percent={p.achievement_percent} /> },
          { key: "status", label: "Status", render: (p) => <StatusBadge status={p.status} label={p.status_label} /> },
          {
            key: "approval",
            label: "Approval",
            render: (p) => (p.pending_level ? `L${p.pending_level} · ${p.pending_with || "—"}` : "—"),
          },
        ]}
      />

      <Flex justify="space-between" align="center" mt={3} wrap="wrap" gap={2}>
        <Text fontSize="sm" color="gray.500">
          {result.total} plan(s) · page {page} of {result.totalPages || 1}
        </Text>
        <HStack>
          <Button size="sm" onClick={() => setPage((p) => p - 1)} isDisabled={page <= 1 || loading}>
            Previous
          </Button>
          <Button size="sm" onClick={() => setPage((p) => p + 1)} isDisabled={page >= (result.totalPages || 1) || loading}>
            Next
          </Button>
        </HStack>
      </Flex>

      <BpPlanFormModal
        isOpen={create.isOpen}
        onClose={create.onClose}
        onSaved={(p) => p && openPlan(p)}
      />
    </Box>
  );
};

export default BpPlanList;
