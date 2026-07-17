import { version } from "react";

// src/services/endpoints.js
export const API_ENDPOINTS = {
  LOGIN: "auth/login",
  CREATE_USERS: "auth/create-user",
  GET_USERS: "auth/get-users",
  get_user_list: "auth/user-dropdown",
  update_emp_details: `auth/update-user`,
  get_jobRole_list: `get-jobRole`,
  change_password: `auth/set-password`,
  create_department: `department/create-department`,
  get_department: `department/get-deparments`,
  create_jobRole: `create-jobRole`,
  get_jobRole_list: `get-jobRole`,
  // upload_img: `upload-image`,
  update_profile_image: `/auth/upload-profile-image`,
  auth_my_profile: `/auth/my-profile`,
  upload_img: `upload-document`,
  // notifiction 
  Get_notification: `auth/get-notifications`,
  Mark_single_notificaction: `auth/mark-notification-as-read`,
  Mark_all_asread_notifiction: `auth/mark-allAsRead`,
  Delete_all_notifiction: `auth/deleteAllNotifications`,
  Delete_single_one_notification: `auth/delete-notification`,
  // get user/emp
  get_user_docs: "get-documents",
  get_emp_details: `auth/get-employee-details`,
  update_emp_status: `/auth/user-status`,
  get_deleted_users: `/auth/get-deleted-users`,
  delete_users: `/auth/delete-user`,
  get_ip_requests: `auth/get-ip-requests`,
  approve_ip: `auth/approve-ip`,
  get_Emp_Attendance: `/attendance/daywise`,
  get_Emp_Attendance_Summary: `attendance/monthly-summary`,
  get_Emp_Attendance_filter_search: `get-emp-attendance`,
  get_emp_visit_report: `get-emp-visit`,
  get_city: `get-districts`,
  upload_salary_slip: `upload-emp-salary`,
  get_attendance_images: `get-attendance-images`,
  get_daily_salary_report: `daily-salary-range`,
  get_emp_route: `get-route`,
  upload_emp_letters: `employee-letter`,
  get_emp_docs: `get-employee-documents`,
  document_status: `document-status`,
  send_esign: "documents/send-esign",
  digio_send_eSign: "letters/send-esign",
  verify_pan: "/verify-pan",
  verify_mobile_no: "/digilocker-kyc",
  // get_aadhar_pan_kid:`/kyc-status/response`,
  get_aadhar_pan_kid: (kycId) => `/kyc-status/${kycId}/response`,
  check_digio_Status: `letters/document-status`,
  download_Signed_Letter_digio: `download-signed-pdf`,
  Gst_verify: `verify-gst`,
  set_expense_allocation: `set-expense-allocation`,
  get_uploaded_exp: `admin-expense-summary`,
  emp_daily_summary: `daily-summary`,
  get_distributors: `get-distributorsList`,
  distributor_onbording_form: `/create-distributor`,
  update_distributor: `update-distributor`,
  get_distributor: `get-distributor`,
  delete_distributor: `delete-distributor`,
  uplaod_distributor_agreement_pdf: `/upload-agreement`,
  get_distributor_agreement_pdf: `get-distributor-agreement`,
  get_distributor_send_esign: `distributor/send-esign`,
  get_distributor_esign_status: `/distributor/status`,
  download_distributor_signed_agreement: `distributor/download`,
  create_company: `create-company`,
  Get_comapnies: `get-companies`,
  Get_comapany_by_id: `get-company`,
  Update_comapany: `update-company`,
  Delete_company: `delete-company`,
  //  stock group
  create_stock_group: `create-stockGroup`,
  stock_group_list: `get-stockGroup`,
  Get_stock_group_by_id: `get-stockGroup`,
  Update_stock_group: `update-stockGroup`,
  Delete_stock_group: `delete-stockGroup`,
  get_categories_by_stock_group: 'get-categories-by-stock-group',

  // stock category
  Create_stock_category: `create-stock-category`,
  View_stock_category: `get-stock-categories`,
  View_stock_category_by_id: `/get-stock-category`,
  Update_stock_category_by_id: `update-stock-category`,
  Delete_Stock_category_by_id: `delete-stock-category`,

  //set-team-target
  create_team: `create-team`,
  create_sub_team: `create-subteam`,
  get_subTeam_by_team: 'get-subteams',
  get_team_list: `get-teams`,
  get_team_by_id: `getTeam`,
  get_users_by_role: `users-by-level`,
  assign_target: 'assign-target',
  get_assigned_targets: 'get-assigned-targets',
  get_assigned_targets_by_id: "get-assigned-target",
  edit_assigned_targets: "edit-assigned-target",
  delete_assigned_targets: "delete-assigned-target",

  assign_individual_targets: 'assign-employee-target',
  get_individual_targets: 'get-employee-targets',
  get_individual_targets_by_id: 'get-employee-targets-by-id',
  edit_individual_target: 'update-employee-targets',
  delete_individual_target: 'delete-employee-targets',

  get_team_by_id: 'getTeam',
  edit_team: 'update-team',
  delete_team: "delete-team",
  edit_suTeam: "update-subteam",
  delete_subTeam: "delete-subteam",

  create_godown: "create-godown",
  godown_list: "getGodownList",
  view_godown_by_id: "getGodownDetails",
  update_godown: "update-godown",
  delete_godown: "delete-godown",

  get_unique_quantity_codes: "get-unitOfMeasure-list",
  create_unit_of_measure: "create-unitOfMeasure",
  getUnitList: "getAllUnits",
  getSimpleUnitList: "get-simple-units",
  get_unit_by_id: "getUnitById",
  edit_unitOfMeasure: "editUnitOfMeasure",
  delete_unitOfMeasure: "deleteUnit",

  create_stock_item: "create-stock-item",
  getStockItemsList: "get-stock-items",
  getStockItemById: "getstockItemByID",
  updateStockItem: "update-stock-item",
  deleteStockItem: "delete-stock-item",

  create_account_group: "create-accounting-group",
  get_account_group_list: "account-group-list",
  get_account_by_id: "account-group-details",
  edit_account_group: "update-account-group",
  delete_account_group: "delete-account-group",

  create_ledger: "create-ledger",
  get_ledger: "get-ledgers",
  get_ledger_by_id: "getLedgerDetailsById",
  update_ledger: "update_ledger",
  delete_ledger: "delete_ledger",

  CREATE_VOUCHER: "create_voucher",
  GET_VOUCHER_LIST: "get_voucher_list",
  GET_VOUCHER_DETAILS_BY_ID: "get_voucher_details",
  UPDATE_VOUCHER: "update_voucher",
  DELETE_VOUCHER: "delete_voucher",

  GET_VOUCHER_TYPE_DROPDOWN: "voucher-type-dropdown",
  GET_VOUCHER_LIST_BY_TYPE: "voucher-by-type",
  UPDATE_VOUCHER_STATUS: "activate-voucher",

  GET_STOCK_ITEM_DROPDOWN: "get-stock-items/dropdown",
  CREATE_MANUFACTURING_MATERIAL: "create-material-mfg",
  GET_LEDGER_DROPDOWN: "ledger-dropdown",
  GET_BATCH_BY_STOCK_ITEM_ID: "/get-stock-item/batches",
  GET_AVAILABLE_QTY_OF_STOCK: "get-available-stock",
  GET_MATERIAL_MFG_REPORT: "get-manufacturing-report",

  CREATE_STOCK_TRANSFER: "create-stock-transfer",
  GET_STOCK_TRANSFER_REPORT: "get-stock-transfer-report",
  GET_EMPLOYEE_VISIT_REPORT_SUMMARY: "get-visit-report-summary",

  GET_MONTHLY_SALARY_REPORT: "get-monthly-salary",
  GET_SALARY_MONTHS: "salary-months",
  REASSIGN_LEDGER: "reassign-ledger",

  GET_ASSIGNED_RETAILER_LIST: "getRetailerlist",
  CREATE_RETAILER: "create-retailer",
  GET_RETAILER_LIST: "get-retailer-list",
  GET_RETAILER_BY_ID: "getRetailerdetails",
  UPDATE_RETAILER: "update-retailer",
  ASSIGN_RETAILER_TO_EMPLOYEE: "assign-retailer",

  GET_NEXTVOUCHER_NO: "next-voucher-no",
  CREATE_PURCHASE: "create-purchase-order",
  GET_PURCHASE_LEDGER_DROPDOWN: "purchase-ledger-dropdown",
  GET_PARTY_LEDGER_REPORT: "get-party-ledger-report",

  GET_BANK_ACCOUNT_LEDGER_DROPDOWN: "bank-ledger-dropdown",
  GET_BILL_REFERENCE: "bill-references",
  CREATE_PAYMENT: "create-payment",

  GENERATE_PURCHASE_INVOICE: "purchase-invoice/print",
  GENERATE_PAYMENT_INVOICE: "payment-invoice/print",
  PURCHASE_INVOIVE: "purchase/pdf",

  GET_SALES_LEDGER_DROPDOWN: "sales-ledger-dropdown",
  CREATE_SALE: "create-sales-order",

  CREATE_RECEIPT: "createReceipt",
  GET_PENDING_BILLS: "getPendingBills",

  CREATE_CREDIT_NOTE: "create-credit-note",
  GET_SALES_BY_CUSTOMER: "get-sales-by-customer",
  GET_SALE_ITEMS_BY_ID: "get-sales-item",
  GET_SALES_BILL_REFERENCES: "sales-bill-references",

  CREATE_DEBIT_NOTE: "create-debit-note",
  GET_PURCHASE_BY_SUPPLIER: "get-purchase-by-supplier",
  GET_PURCHASE_ITEMS_BY_ID: "get-purchase-items",

  CREATE_CONTRA: "create-contra-entry",

  CREATE_JOURNAL_ENTRY: "create-journal",
  GET_JOURNAL_BILL_REFERENCE: "get-journal-bill-references",

  GET_SALES_INVOICE: "get-sales-invoice",
  GET_CREDIT_NOTE_INVOICE: "get-credit-note-invoice",
  GET_RECEIPT_INVOICE: "get-receipt-invoice",
  GET_DEBIT_NOTE_INVOICE: "get-debitNote-invoice",
  GET_JOURNAL_INVOICE: "get-journal-invoice",
  GET_CONTRA_INVOICE: "get-contra-invoice",

  GET_PARTYTRANSACTION_BILLS: "get-partyTransactionBills",
  GET_PARTY_TRANSACTION_REPORT: "get-party-transaction-report",
  DELETE_PARTY_TRANSACTION: "cancel-party-transaction",

  CREATE_TRANSACTION_APPROVAL: "create-transaction-approval-config",
  GET_TRANSACTION_APPROVAL: "get-transaction-approval-config",
  GET_TRANSACTION_APPROVAL_BY_ID: "get-approvalConfig-employee",
  UPDATE_TRANSACTION_APPROVAL: "update-transaction-approval",

  GET_ORDER_NOTIFICATIONS: "get-notifications",
  GET_ORDER_NOTIFICATION_COUNT: "get-notification-counts",
  GET_PENDING_APPROVALS: "get-pending-approvals",
  GET_PENDING_APPROVALS_BY_ID: "get-order-approval",
  CREATE_SALE_REQUEST_AS_JUNIOR_ACCOUNTANT: "create-sales-approval-request",

  REJECT_SALES_ORDER: "reject-sale-order",
  RETURN_SALES_ORDER: "return-sale-order",
  RESUBMIT_SALES_ORDER: "/resubmit-sale-order",

  CREATE_REQUEST_APPROVE: "approve-sale-order",
  GENERATE_NEXT_ORDER_NO: "next-order-number",

  CREATE_VISIT_TARGET_TEMPLATE: "visit-targets/templates",
  GET_TEMPLATES: "visit-targets/templates",
  GET_TEMPLATES_DROPDOWN: "visit-targets/templates/dropdown",
  GET_ADMIN_PROGRESS: "visit-targets/progress/admin",
  GET_PROGRESS_HISTORY: "visit-targets/progress/history",

  CREATE_RECEIPT_APPROVAL_REQUEST: "create-receipt-approval-request",
  GET_NEXT_ORDER_NUMBER: "next-order-number", // matches router.get("/next-order-number", ...)


  GET_RECEIPT_ORDER_BY_ID: "get-order-approval",
  APPROVE_RECEIPT_REQUEST: "approve-receipt-order",

  RETURN_RECEIPT_REQUEST: "return-receipt-order",
  REJECT_RECEIPT_REQUEST: "reject-receipt-order",
  RESUBMIT_RECEIPT_REQUEST: "resubmit-receipt-order",
  GET_ASSIGNED_LEDGERS_LIST: "get-my-assigned-ledgers",

  CREATE_CREDIT_NOTE_APPROVAL_REQUEST: "create-credit-note-approval-request",
  APPROVE_CREDIT_NOTE_REQUEST: "approve-credit-note-order",
  RETURN_CREDIT_NOTE_REQUEST: "return-credit-note-order",
  REJECT_CREDIT_NOTE_REQUEST: "reject-credit-note-order",
  RESUBMIT_CREDIT_NOTE_REQUEST: "resubmit-credit-note-order",

  GET_TEMPLATE_BY_ID: (id) => `visit-targets/templates/${id}`,
  UPDATE_TEMPLATE_BY_ID: (id) => `visit-targets/templates/${id}`,
  DELETE_TEMPLATE: (id) => `visit-targets/templates/${id}`,

  GET_ASSIGNMENT: (id) => `visit-targets/assignments/${id}`,
  GET_ASSIGNMENT_PROGRESS: (id) =>
    `visit-targets/assignments/${id}/progress`,
  COMPLETE_ASSIGNMENT: (id) =>
    `visit-targets/assignments/${id}/complete`,
  EXPIRE_ASSIGNMENT: (id) =>
    `visit-targets/assignments/${id}/expire`,
  REACTIVATE_TEMPLATE: (id) => `visit-targets/templates/${id}/reactivate`,



};
// 