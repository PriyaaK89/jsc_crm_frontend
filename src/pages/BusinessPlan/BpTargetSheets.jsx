// Business Plan → Employee Target Sheets (submitted from the app; approved here)
import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Flex, HStack, Input, Select, Tab, TabList, Tabs, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { bpApi, apiError, toRecordId } from "../../services/businessPlanApi";
import { usePermissions } from "../../context/PermissionContext";
import { DataTable, ErrorBox, PageTitle, StatusBadge, fmtDate, fmtDateTime, money, useBpToast } from "./bpShared";

const STATUSES = [
  ["", "All statuses"],
  ["SUBMITTED", "Submitted (level 1 — reporting manager)"],
  ["MANAGER_APPROVED", "In approval (next levels)"],
  ["APPROVED", "Approved"],
  ["RETURNED", "Returned"],
  ["DRAFT", "Draft"],
];

const BpTargetSheets = () => {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canSeeAll = can(["APPROVE_BUSINESS_PLAN"]);
  const notify = useBpToast();
  // pending = waiting for MY approval level (admin: every pending sheet)
  const scopes = [
    ["pending", "Pending My Approval"],
    ["team", "My Team"],
    ...(canSeeAll ? [["all", "All Employees"]] : []),
    ["mine", "My Sheets"],
    ["requests", "Target Revision Requests"],
  ];

  const [scope, setScope] = useState("pending");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [requestScope, setRequestScope] = useState("pending");

  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => setPage(1), [scope, status, query]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (scope === "requests") setRequests((await bpApi.revisionRequests(requestScope)) || []);
      else setResult(await bpApi.sheets({ scope, status, search: query, page, limit: 20 }));
    } catch (err) {
      setError(apiError(err, scope === "requests" ? "Could not load revision requests" : "Could not load target sheets"));
    } finally {
      setLoading(false);
    }
  }, [scope, status, query, page, requestScope]);

  const openSheet = (sheetId) => {
    const sid = toRecordId(sheetId);
    if (sid) navigate(`/business-plan/target-sheets/${sid}`);
    else notify.fail(new Error("This row has no target sheet to open"));
  };

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Box>
      <PageTitle
        title="Employee Target Sheets"
        subtitle="Quarterly commitments submitted from the app. Targets come from the approved Business Plan; approval: reporting manager → RSM."
      />
      <Tabs size="sm" variant="soft-rounded" colorScheme="teal" index={scopes.findIndex(([s]) => s === scope)} onChange={(i) => setScope(scopes[i][0])} mb={3}>
        <TabList>
          {scopes.map(([s, l]) => (
            <Tab key={s}>{l}</Tab>
          ))}
        </TabList>
      </Tabs>
      {scope === "requests" ? (
        <>
          <Flex gap={2} mb={4} wrap="wrap" align="center">
            <Select size="sm" maxW="280px" value={requestScope} onChange={(e) => setRequestScope(e.target.value)} borderRadius="8px">
              <option value="pending">Waiting for my decision</option>
              <option value="all">All requests of my team</option>
            </Select>
            <Text fontSize="xs" color="gray.500">
              An employee who disagrees with a Business Plan target raises a request from his Target Sheet. Open the sheet to accept or decline it.
            </Text>
          </Flex>
          {error && <ErrorBox message={error} onRetry={load} />}
          <DataTable
            rows={requests}
            onRowClick={(r) => openSheet(r.sheet_id)}
            emptyText={loading ? "Loading…" : "No revision requests."}
            columns={[
              { key: "created_at", label: "Raised", render: (r) => fmtDateTime(r.created_at) },
              { key: "employee_name", label: "Employee" },
              { key: "sheet_code", label: "Sheet", render: (r) => `${r.sheet_code} · Q${r.quarter} ${r.financial_year || ""}` },
              { key: "plan_code", label: "Plan" },
              { key: "remark", label: "Reason", wrap: true },
              { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} label={r.status_label} /> },
            ]}
          />
        </>
      ) : (
      <>
      <Flex gap={2} mb={4} wrap="wrap">
        <Select size="sm" maxW="280px" value={status} onChange={(e) => setStatus(e.target.value)} borderRadius="8px">
          {STATUSES.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>
        <Input size="sm" maxW="280px" placeholder="Search employee or sheet code" value={search} onChange={(e) => setSearch(e.target.value)} borderRadius="8px" />
      </Flex>
      {error && <ErrorBox message={error} onRetry={load} />}
      <DataTable
        rows={result.items}
        onRowClick={(s) => openSheet(s.id)}
        emptyText={loading ? "Loading…" : "No target sheets found."}
        columns={[
          { key: "sheet_code", label: "Sheet", render: (s) => <Text fontWeight="700">{s.sheet_code}</Text> },
          { key: "employee_name", label: "Employee", render: (s) => (<Box><Text>{s.employee_name}</Text><Text fontSize="xs" color="gray.500">{s.designation}</Text></Box>) },
          { key: "quarter", label: "Quarter", render: (s) => (s.quarter ? `${s.quarter_label || `Q${s.quarter}`} · FY ${s.financial_year}` : "—") },
          { key: "period", label: "Period", render: (s) => `${fmtDate(s.period_from)} – ${fmtDate(s.period_to)}` },
          { key: "state", label: "State / Territory", render: (s) => `${s.state || "—"} · ${s.territory_type}` },
          { key: "total_sales", label: "Quarter Sales Target", numeric: true, render: (s) => money(s.total_sales) },
          {
            key: "source",
            label: "Targets",
            render: (s) => (
              <Box>
                <StatusBadge status={s.is_legacy ? "LEGACY" : "PLAN"} label={s.is_legacy ? "Legacy" : `Plan · v${s.version_no || 1}`} />
                {s.targets_outdated ? <Box><StatusBadge status="RETURNED" label="New targets" /></Box> : null}
              </Box>
            ),
          },
          { key: "submitted_at", label: "Submitted", render: (s) => (s.submitted_at ? fmtDateTime(s.submitted_at) : "—") },
          { key: "status", label: "Status", render: (s) => <StatusBadge status={s.status} label={s.status_label} /> },
          { key: "approval", label: "Approval", render: (s) => (s.pending_level ? `L${s.pending_level} · ${s.pending_with || "—"}` : "—") },
        ]}
      />
      <Flex justify="space-between" align="center" mt={3}>
        <Text fontSize="sm" color="gray.500">{result.total} sheet(s) · page {page} of {result.totalPages || 1}</Text>
        <HStack>
          <Button size="sm" onClick={() => setPage((p) => p - 1)} isDisabled={page <= 1 || loading}>Previous</Button>
          <Button size="sm" onClick={() => setPage((p) => p + 1)} isDisabled={page >= (result.totalPages || 1) || loading}>Next</Button>
        </HStack>
      </Flex>
      </>
      )}
    </Box>
  );
};

export default BpTargetSheets;
