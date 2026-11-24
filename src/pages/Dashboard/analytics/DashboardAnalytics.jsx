import { useState } from "react";
import { Box, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { usePermissions } from "../../../context/PermissionContext";
import { API_ENDPOINTS } from "../../../services/endpoints";
import useAnalytics from "./useAnalytics";
import DashboardFilters, { useDashboardFilters } from "./DashboardFilters";
import OverviewSection from "./OverviewSection";
import AttendanceCard from "../PieChart";
import {
  ApprovalsSection,
  BusinessSection,
  CollectionsSection,
  KpiRow,
  OrdersSection,
  SalesSection,
  VisitsSection,
} from "./AnalyticsSections";

const TABS = ["Overview", "Orders", "Visits", "Sales", "Collections", "Approvals", "Business"];
const BUSINESS_TAB = TABS.indexOf("Business");

const AnalyticsBody = ({ isAdmin }) => {
  const [tab, setTab] = useState(0);
  const { filters, setFilters, range, params } = useDashboardFilters();

  const { data: scope } = useAnalytics(API_ENDPOINTS.dashboard_filters);
  const employees = scope?.employees || [];

  // The KPI row needs these five on every tab. Business is only loaded when opened.
  const sections = {
    orders: useAnalytics(API_ENDPOINTS.dashboard_orders, params),
    approvals: useAnalytics(API_ENDPOINTS.dashboard_approvals, params),
    visits: useAnalytics(API_ENDPOINTS.dashboard_visits, params),
    sales: useAnalytics(API_ENDPOINTS.dashboard_sales, params),
    collections: useAnalytics(API_ENDPOINTS.dashboard_collections, params),
    business: useAnalytics(API_ENDPOINTS.dashboard_business, params, { enabled: tab === BUSINESS_TAB }),
  };

  const selected = employees.find((employee) => String(employee.id) === String(filters.employeeId));
  const viewName = selected ? selected.name : scope?.scope === "TEAM" ? "You and your reporting team" : "Company overview";

  return (
    <Box mt={6} minW={0}>
      <Text fontSize="lg" fontWeight="800" color="gray.800">
        Business Dashboard
      </Text>
      <Text fontSize="xs" color="gray.500" mb={3}>
        {viewName} · {range.from} to {range.to}
      </Text>

      <Box position={{ base: "static", md: "sticky" }} top="72px" zIndex={5} bg="#f2f1f1" py={2} mb={3}>
        <DashboardFilters filters={filters} setFilters={setFilters} range={range} employees={employees} />
      </Box>

      <KpiRow sections={sections} />

      <Tabs index={tab} onChange={setTab} isLazy variant="unstyled" mt={5}>
        <TabList
          bg="white"
          p={1.5}
          gap={1}
          borderRadius="12px"
          border="1px solid"
          borderColor="gray.100"
          overflowX="auto"
          whiteSpace="nowrap"
        >
          {TABS.map((label) => (
            <Tab
              key={label}
              flexShrink={0}
              px={4}
              py={1.5}
              fontSize="sm"
              fontWeight="600"
              color="gray.600"
              borderRadius="8px"
              _selected={{ bg: "blue.500", color: "white" }}
              _hover={{ bg: "gray.50" }}
              _focusVisible={{ boxShadow: "outline" }}
            >
              {label}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <OverviewSection sections={sections} attendance={isAdmin ? <AttendanceCard /> : null} />
          </TabPanel>
          <TabPanel px={0}><OrdersSection section={sections.orders} /></TabPanel>
          <TabPanel px={0}><VisitsSection section={sections.visits} /></TabPanel>
          <TabPanel px={0}><SalesSection section={sections.sales} /></TabPanel>
          <TabPanel px={0}><CollectionsSection section={sections.collections} /></TabPanel>
          <TabPanel px={0}><ApprovalsSection section={sections.approvals} /></TabPanel>
          <TabPanel px={0}><BusinessSection section={sections.business} /></TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

// Hidden unless the user has the permission; the API enforces the same rule.
const DashboardAnalytics = ({ isAdmin = false }) => {
  const { can, loading } = usePermissions();
  if (loading) return null;
  if (!can("VIEW_DASHBOARD_ANALYTICS")) {
    // Admins without the analytics permission still get the attendance card.
    return isAdmin ? (
      <Box mt={6} maxW="420px">
        <AttendanceCard />
      </Box>
    ) : null;
  }
  return <AnalyticsBody isAdmin={isAdmin} />;
};

export default DashboardAnalytics;