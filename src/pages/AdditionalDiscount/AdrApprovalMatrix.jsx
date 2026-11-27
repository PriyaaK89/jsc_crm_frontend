// Additional Discount → Approval Matrix: the approval route (RSM recommendation → final
// approval), which job roles count as RSM, who the final approvers are, and a routing
// preview for an employee. Changed only through Settings (RSM job roles) and the existing
// permission screen (FINAL_APPROVE_ADDITIONAL_DISCOUNT).
import React, { useState } from "react";
import { Badge, Box, Button, Flex, Input, List, ListIcon, ListItem, SimpleGrid, Text } from "@chakra-ui/react";
import { MdCheckCircle } from "react-icons/md";
import { DataTable, ErrorBox, Loading, PageTitle, Section, adrApi, useAdrToast, useLoad } from "./adrShared";

const AdrApprovalMatrix = () => {
  const notify = useAdrToast();
  const { data, loading, error, reload } = useLoad(() => adrApi.approvalMatrix(), []);
  const [userId, setUserId] = useState("");
  const [preview, setPreview] = useState(null);

  const check = async () => {
    try {
      setPreview(await adrApi.routingPreview(userId ? Number(userId) : undefined));
    } catch (err) {
      notify.fail(err, "Could not preview the route");
    }
  };

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  return (
    <Box>
      <PageTitle title="Approval Matrix" subtitle="Discount authority configuration" />
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
        {data.stages.map((s) => (
          <Box key={s.stage} border="1px solid" borderColor={s.activates_discount ? "green.200" : "orange.200"} bg={s.activates_discount ? "green.50" : "orange.50"} borderRadius="12px" p={4}>
            <Text fontWeight="800">Stage {s.stage}: {s.name}</Text>
            <Text fontSize="sm" mt={1}>{s.who}</Text>
            {s.skipped_when && <Text fontSize="xs" color="gray.600" mt={1}>Skipped when: {s.skipped_when}</Text>}
            <Badge mt={2} colorScheme={s.activates_discount ? "green" : "orange"}>{s.activates_discount ? "Activates the discount" : "Recommendation only"}</Badge>
          </Box>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
        <Section title={`Job roles (RSM rule: "${data.rsm_job_roles_setting}")`}>
          <DataTable
            rows={data.job_roles}
            columns={[
              { key: "name", label: "Job role" },
              { key: "level", label: "Level", render: (r) => (r.level === null ? "—" : r.level) },
              { key: "active_users", label: "Active users", numeric: true },
              { key: "counts_as_rsm", label: "RSM?", render: (r) => (r.counts_as_rsm ? <Badge colorScheme="orange">RSM</Badge> : "—") },
            ]}
          />
        </Section>
        <Section title="Final approvers (first decision wins)">
          <DataTable
            rows={data.final_approvers}
            emptyText="No final approvers."
            columns={[
              { key: "name", label: "Name" },
              { key: "role", label: "Role" },
              { key: "job_role", label: "Job role" },
              { key: "source", label: "Why", render: (r) => (r.source === "ROLE" ? "Admin / Super Admin" : "Permission FINAL_APPROVE_ADDITIONAL_DISCOUNT") },
            ]}
          />
        </Section>
      </SimpleGrid>

      <Section title="Rules">
        <List spacing={1}>
          {data.rules.map((r) => (
            <ListItem key={r} fontSize="sm"><ListIcon as={MdCheckCircle} color="teal.500" />{r}</ListItem>
          ))}
          <ListItem fontSize="sm"><ListIcon as={MdCheckCircle} color="teal.500" />Approvals are valid for {data.validity_days} days from the final decision.</ListItem>
        </List>
      </Section>

      <Section title="Routing preview">
        <Flex gap={2} wrap="wrap" align="center">
          <Input size="sm" maxW="200px" type="number" placeholder="Employee id (blank = me)" value={userId} onChange={(e) => setUserId(e.target.value)} />
          <Button size="sm" onClick={check}>Show route</Button>
        </Flex>
        {preview && (
          <Box mt={3} p={3} bg="gray.50" borderRadius="10px">
            <Text fontWeight="800">{preview.route === "RSM_THEN_FINAL" ? `RSM ${preview.rsm.name} → Final approval` : "Directly to final approval"}</Text>
            <Text fontSize="sm" color="gray.600">{preview.reason}</Text>
            <Text fontSize="sm" mt={1}>Reporting line: {preview.chain.length ? preview.chain.map((c) => `${c.name}${c.job_role ? ` (${c.job_role})` : ""}${c.active ? "" : " [inactive]"}`).join(" → ") : "none"}</Text>
          </Box>
        )}
      </Section>
    </Box>
  );
};

export default AdrApprovalMatrix;
