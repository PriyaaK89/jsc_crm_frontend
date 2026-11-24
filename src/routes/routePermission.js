import { matchPath } from "react-router-dom";

export const ADMIN_ONLY = "__admin_only__";
export const SUPER_ADMIN_ONLY = "__super_admin_only__";

// set from /permissions/me: TASK_ASSIGN_ANY, or a manager who has a team
export const TASK_ASSIGNER = "__task_assigner__";

const FIN = "VIEW_FINANCIAL_REPORT";
const INV = "VIEW_INVENTORY_REPORT";
const EMP = "VIEW_EMPLOYEE_REPORT";
const TXN = ["CREATE_TRANSACTION", "VIEW_TRANSACTION"];
const PRINT = ["VIEW_PRINT_MANAGEMENT"];
const DEMO = ["VIEW_DEMO", "demo_approve"];
// Business Plan pages: any logged-in user. The server scopes every record to the user,
// his reporting team and the items he approves (admins: everything). Settings keeps its code.
const BP = [];
// Advance Booking pages: any logged-in user (field staff book for their parties; the server
// scopes bookings to the user and his team). Office desks keep their codes.
const ABS = [];

// Pages that do not need a login
export const PUBLIC_PATHS = ["/", "/login", "/esign-success", "/esign-error"];

// Every page and the permissions that open it (any one of them is enough).
// [] means any logged-in user: the dashboard, a user's own profile, and pages
// opened from a notification, where the server decides access to that record.
// A page missing from this list is blocked.
export const ROUTE_PERMISSIONS = [
  ["/dashboard", []],
  ["/dashboard/profile/:empId", []],

  ["/hr-mgmt/add-employee", ["CREATE_USER"]],
  ["/hr-mgmt/change-password", ["UPDATE_USER", "CREATE_USER"]],
  ["/hr-mgmt/assign-permissions/:userId", ["MANAGE_USER_PERMISSIONS"]],
  ["/hr-mgmt/permission-management", [SUPER_ADMIN_ONLY]],
  ["/hr-mgmt/dept/add-department", ["CREATE_DEPARTMENT"]],
  ["/hr-mgmt/roles/add-job-role", ["CREATE_JOB_ROLE"]],
  ["/hr-mgmt/view-employee-list", ["VIEW_USER"]],
  ["/hr-mgmt/upload-emp-salary", ["salary_upload"]],
  ["/hr-mgmt/emp-payment-hold", ["payment_hold_manage"]],
  ["/hr-mgmt/emp-salary-report", ["VIEW_SALARY_REPORT"]],
  ["/hr-mgmt/holiday-calendar", ["CREATE_HOLIDAY", "UPDATE_HOLIDAY", "DELETE_HOLIDAY"]],
  ["/hr-mgmt/yearly-holiday-calendar-list", ["VIEW_HOLIDAY", "CREATE_HOLIDAY", "UPDATE_HOLIDAY", "DELETE_HOLIDAY"]],
  ["/hr-mgmt/upload-employee-expenses", ["expense_manage"]],
  ["/upload-documents", ["CREATE_USER", "UPDATE_USER"]],
  ["/edit-employee-details/:empId", ["UPDATE_USER"]],
  ["/view-employee-details/:id", ["VIEW_USER"]],
  ["/generate-offer-letter/:id", ["hr_letter_manage"]],
  ["/generate-agreement/:id", ["hr_letter_manage"]],
  ["/generate-joining-letter/:id", ["hr_letter_manage"]],
  ["/approve-ip-user-list", [ADMIN_ONLY]],

  ["/accounting-master/create-group", ["CREATE_ACCOUNT_GROUP"]],
  ["/accounting-master/view-group", ["VIEW_ACCOUNT_GROUP"]],
  ["/accounting-master/edit-group/:id", ["UPDATE_ACCOUNT_GROUP"]],
  ["/accounting-master/create-ledger", ["CREATE_LEDGER"]],
  ["/accounting-master/view-ledger", ["VIEW_LEDGER"]],
  ["/accounting-master/edit-ledger/:id", ["UPDATE_LEDGER"]],
  ["/accounting-master/edit-ledger-assignment", ["UPDATE_LEDGER"]],
  ["/accounting-master/create-voucher", ["CREATE_VOUCHER"]],
  ["/accounting-master/view-voucher", ["VIEW_VOUCHER"]],
  ["/accounting-master/edit-voucher/:id", ["UPDATE_VOUCHER"]],
  ["/accounting-master/retail-assignment", ["UPDATE_RETAILER"]],

  ["/distributor/distributorlist", ["VIEW_DISTRIBUTOR"]],
  ["/distributor/distributorlist/edit-distributor/:id", ["UPDATE_DISTRIBUTOR"]],
  ["/distributor/distributorlist/view-distributor/:id", ["VIEW_DISTRIBUTOR"]],
  ["/distributor/onboarding-ledger", ["CREATE_DISTRIBUTOR", "CREATE_LEDGER"]],

  ["/print/mgmt/shipping_lable_printer", PRINT],
  ["/print/mgmt/truthful_labelprint", PRINT],
  ["/print/purchase/:id", TXN],
  ["/print/payment/:id", TXN],

  ["/business-development/create-team", ["CREATE_TEAM"]],
  ["/business-development/edit-team/:id", ["UPDATE_TEAM"]],
  ["/business-development/view-teams", ["VIEW_TEAM"]],
  ["/business-development/view-subteams/:id", ["VIEW_TEAM"]],
  ["/business-development/create-sub-team", ["CREATE_TEAM"]],
  ["/business-development/assign-target", ["CREATE_TARGET"]],
  ["/business-development/assign-target-rsm", ["CREATE_TARGET"]],
  ["/business-development/view-assigned-targets", ["VIEW_TARGET"]],
  ["/business-development/view-employee-targets", ["VIEW_TARGET"]],
  ["/business-development/view-visit-target", ["VIEW_TARGET", "CREATE_TARGET"]],
  ["/business-development/visit-progress-history", ["VIEW_TARGET"]],
  ["/business-development/view-individual-target-list", ["VIEW_TARGET"]],

  ["/company-master/create-company", ["CREATE_COMPANY"]],
  ["/company-master/comapny-list", ["VIEW_COMPANY"]],
  ["/company-master/comapny-list/edit/:id", ["UPDATE_COMPANY"]],
  ["/company-master/comapny-list/view_comapny/:id", ["VIEW_COMPANY"]],

  ["/inventory/create-stock-group", ["CREATE_STOCK_GROUP"]],
  ["/inventory/view-stock-group", ["VIEW_STOCK_GROUP"]],
  ["/inventory/view-stock-group/edit/:id", ["UPDATE_STOCK_GROUP"]],
  ["/inventory/create-stock-category", ["CREATE_STOCK_CATEGORY"]],
  ["/inventory/view-stock-category", ["VIEW_STOCK_CATEGORY"]],
  ["/inventory/view-stock-category/edit/:id", ["UPDATE_STOCK_CATEGORY"]],
  ["/inventory/create-godown", ["CREATE_GODOWN"]],
  ["/inventory/edit-godown/:id", ["UPDATE_GODOWN"]],
  ["/inventory/view-godown-list", ["VIEW_GODOWN"]],
  ["/inventory/create-unitOfMeasure", ["CREATE_UNIT"]],
  ["/inventory/unit-list", ["VIEW_UNIT"]],
  ["/inventory/create-stock-item", ["CREATE_STOCK_ITEM"]],
  ["/inventory/view-stock-item", ["VIEW_STOCK_ITEM"]],
  ["/inventory/edit-stock-item/:id", ["UPDATE_STOCK_ITEM"]],
  ["/inventory/material-manufacturing", ["CREATE_MANUFACTURING"]],
  ["/inventory/stock-transfer", ["CREATE_STOCK_TRANSFER"]],

  ["/order-vochor/payment", ["CREATE_TRANSACTION"]],
  ["/order-vochor/purchase", ["CREATE_TRANSACTION"]],
  ["/order-vochor/credit", ["CREATE_TRANSACTION"]],
  ["/order-vochor/debit", ["CREATE_TRANSACTION"]],
  ["/order-voucher/create-sales", ["CREATE_TRANSACTION"]],
  ["/order-voucher/receipt-request", ["CREATE_TRANSACTION"]],
  ["/order-voucher/sales/:approvalId", []],
  ["/order-voucher/receipt/:approvalId", []],
  ["/order-voucher/credit-note/:approvalId", []],
  ["/order-voucher/purchase/:approvalId", []],

  ["/transaction-master/purchase", TXN],
  ["/transaction-master/payment", TXN],
  ["/transaction-master/sale", TXN],
  ["/transaction-master/receipt", TXN],
  ["/transaction-master/credit-note", TXN],
  ["/transaction-master/debit-note", TXN],
  ["/transaction-master/contra", TXN],
  ["/transaction-master/journal", TXN],

  ["/report/emp-attendance-report", ["VIEW_ATTENDANCE_REPORT"]],
  ["/report/emp-visit-report", ["VIEW_VISIT_REPORT"]],
  ["/report/emp-salary-report", ["VIEW_SALARY_REPORT"]],
  ["/report/emp-monthly-salary-report", ["VIEW_SALARY_REPORT"]],
  ["/report/scheduling-alert-report", [FIN]],
  ["/report/party-transaction-report", [FIN]],
  ["/report/party-ledger-report", [FIN]],
  ["/report/credit-days-reminder-report", [FIN]],
  ["/report/interest-report", [FIN]],
  ["/report/supercash-bill-report", [FIN]],
  ["/report/psl-report", [FIN]],
  ["/report/fright-report", [FIN]],
  ["/report/transport-fright-report", [FIN]],
  ["/report/item-psl-report", [FIN]],
  ["/report/pending-collection-report", [FIN]],
  ["/report/product-report", [INV]],
  ["/report/item-stock-report", [INV]],
  ["/report/manufacturing-report", [INV]],
  ["/report/stock-transfer-report", [INV]],
  ["/report/get-emp-expense-report", [EMP, "expense_manage"]],
  ["/report/emp-balance-sheet", [EMP]],
  ["/report/emp-distributor-details", [EMP]],
  ["/report/emp-performance-report", [EMP]],
  ["/report/track-employee", [EMP]],
  ["/report/emp-kyc-report", [EMP]],

  ["/misc/voucher-action", ["UPDATE_VOUCHER"]],
  ["/misc/create-retailer", ["CREATE_RETAILER"]],
  ["/misc/view-retailers", ["VIEW_RETAILER"]],
  ["/misc/transaction-approval", ["transaction_approval_config"]],
  ["/misc/transaction-documents", [FIN]],
  ["/misc/emp-penalty", ["penalty_send"]],
  ["/misc/assign-task-to-employee", ["TASK_ASSIGN_ANY", TASK_ASSIGNER]],
  ["/misc/assign-areas-to-employee", [ADMIN_ONLY]],
  ["/misc/beatPlan", ["VIEW_BEAT_PLAN"]],
  ["/chat/monitor", ["chat_view_all"]],

  ["/business-plan", BP],
  ["/business-plan/overview", BP],
  ["/business-plan/plans", BP],
  ["/business-plan/plans/:id", BP],
  ["/business-plan/analysis", BP],
  ["/business-plan/reports", BP],
  ["/business-plan/settings", ["MANAGE_BUSINESS_PLAN_SETTINGS"]],
  ["/business-plan/target-sheets", BP],
  ["/business-plan/target-sheets/:id", BP],

  ["/advance-booking", ABS],
  ["/advance-booking/overview", ABS],
  ["/advance-booking/bookings", ABS],
  ["/advance-booking/bookings/:id", ABS],
  ["/advance-booking/bookings/:id/print", ABS],
  ["/advance-booking/allocation", ["ALLOCATE_ABS_STOCK", "VIEW_ALL_ABS"]],
  ["/advance-booking/payments", ABS],
  ["/advance-booking/dispatches", ["DISPATCH_ABS", "VIEW_ALL_ABS"]],
  ["/advance-booking/settings", ["MANAGE_ABS_SETTINGS"]],

  ["/product-demo/view-demo-request/:id", []],
  ["/product-demo/crop/create-crop", ["crop_manage"]],
  ["/product-demo/demo-results", DEMO],
  ["/product-demo/demo-results/:id", DEMO],
];

// null = this path is not a known page
export const getRoutePermissions = (pathname) => {
  const route = ROUTE_PERMISSIONS.find(([path]) => matchPath({ path, end: true }, pathname));
  return route ? route[1] : null;
};

// removes the menu items this user cannot open, then any empty section
export const filterMenu = (sections, can) =>
  sections
    .map((section) => {
      if (!section.children) return section;
      const children = section.children.filter((child) => {
        const required = getRoutePermissions(child.path);
        return required !== null && can(required);
      });
      return { ...section, children };
    })
    .filter((section) => !section.children || section.children.length > 0);