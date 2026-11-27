// Additional Discount → Discount Utilization: every approved product line with approved,
// reserved (held by sales orders waiting for approval), used and remaining quantity.
import React, { useCallback, useEffect, useState } from "react";
import { Box, Checkbox, Progress, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { AdrBadge, DataTable, ErrorBox, FilterRow, PageTitle, Pager, adrApi, apiError, fmtDate, rs } from "./adrShared";

const AdrUtilization = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ date_from: "", date_to: "" });
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ rows: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => setPage(1), [filters, onlyOpen]);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await adrApi.utilization({ ...filters, only_open: onlyOpen ? 1 : undefined, page, limit: 50 }));
    } catch (err) {
      setError(apiError(err, "Could not load utilization"));
    } finally {
      setLoading(false);
    }
  }, [filters, onlyOpen, page]);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <Box>
      <PageTitle title="Discount Utilization" subtitle="Consumption against approvals — reserved = held by sales orders still waiting for approval" />
      <FilterRow value={filters} onChange={setFilters} searchPlaceholder="Request no., party or product" extra={<Checkbox size="sm" isChecked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)}>Only lines with balance</Checkbox>} />
      {error && <ErrorBox message={error} onRetry={load} />}
      <DataTable
        rows={result.rows}
        rowKey={(r) => r.item_id}
        onRowClick={(r) => navigate(`/additional-discount/requests/${r.request_id}`)}
        emptyText={loading ? "Loading…" : "No approved lines."}
        columns={[
          { key: "request_no", label: "Request", render: (r) => <Box><Text fontWeight="700">{r.request_no}</Text><AdrBadge status={r.status} /></Box> },
          { key: "party_name", label: "Party", render: (r) => <Box><Text>{r.party_name}</Text><Text fontSize="xs" color="gray.500">{r.requested_by_name}</Text></Box> },
          { key: "item_name", label: "Product" },
          { key: "discount_per_unit", label: "₹ / unit", numeric: true, render: (r) => rs(r.discount_per_unit) },
          { key: "approved_qty", label: "Approved", numeric: true },
          { key: "reserved_qty", label: "Reserved", numeric: true, render: (r) => <Text color={r.reserved_qty > 0 ? "orange.600" : undefined}>{r.reserved_qty}</Text> },
          { key: "used_qty", label: "Used", numeric: true, render: (r) => <Box><Text>{r.used_qty}</Text><Text fontSize="xs" color="gray.500">{rs(r.used_amount)}</Text></Box> },
          { key: "balance_qty", label: "Remaining", numeric: true, render: (r) => <Box><Text fontWeight="700" color={r.balance_qty > 0 ? "green.600" : "gray.500"}>{r.balance_qty}</Text><Text fontSize="xs" color="gray.500">{rs(r.balance_amount)}</Text></Box> },
          { key: "utilization_pct", label: "Used %", render: (r) => <Box minW="90px"><Progress value={r.utilization_pct} size="sm" colorScheme="teal" borderRadius="full" /><Text fontSize="xs">{r.utilization_pct}%</Text></Box> },
          { key: "valid_till", label: "Valid till", render: (r) => fmtDate(r.valid_till) },
        ]}
      />
      <Pager pagination={result.pagination} onPage={setPage} loading={loading} what="line(s)" />
    </Box>
  );
};

export default AdrUtilization;
