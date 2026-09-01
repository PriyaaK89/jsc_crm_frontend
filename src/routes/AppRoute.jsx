import { BrowserRouter as Router, Routes, Route, Navigate, } from "react-router-dom";
import Dashboard from "../pages/Dashboard/Dashboard";
import UserLogin from "../pages/Login/UserLogin";
import AddEmpLayout from "../components/layout/AddEmpLayout";
import ChangePasswordLayout from "../components/layout/ChangePasswordLayout";
import DepartmentLayout from "../components/layout/AddDepartmentLayout";
import JobRoleLayout from "../components/layout/AddJobRoleLayout";
import EmployeeListLayout from "../components/layout/EmployeeList";
import UploadEmpDocumentsLayout from "../components/layout/UploadEmpDocumentsLayout";
import EditEmployeePage from "../components/layout/EditEmployee";
import ViewEmpDetailsLayout from '../components/layout/ViewEmpDetailsLayout'
import OfferLetterLayout from "../components/layout/GenerateLetters/OfferLetterLayout";
import JoiningLetterLayout from "../components/layout/GenerateLetters/JoiningLetterLayout";
import AgreementLetterLayout from '../components/layout/GenerateLetters/AgreementLetterLayout';
import ProfileLayout from "../components/layout/ProfileLayout";
import CreateTeamLayout from "../components/layout/CreateteamLayout";
import CreateSubTeamLayout from "../components/layout/CreateSubTeamLayout";
import AssignTargetRSMLayout from "../components/layout/AssignTargetRSMLayout";
import CreateCompanyLayout from "../components/layout/CompanyMaster/CreateCompanyLayout";
import CompanyListLayout from '../components/layout/CompanyMaster/CompanyListLayout'
import ApproveIpUserListLayout from "../components/layout/ApproveIpUserListLayout";
import CreateGroupLayout from '../components/layout/AccountingMasterLayout/CreateGroupLayout';
import ViewGroupLayout from '../components/layout/AccountingMasterLayout/ViewGroupLayout';
import CreateLedgerLayout from '../components/layout/AccountingMasterLayout/CreateLedgerLayout';
import ONBordingdistributoragreement from '../components/layout/AccountingMasterLayout/ONBordingdistributoragreement';
import ViewLedgerLayout from "../components/layout/AccountingMasterLayout/ViewLedgerLayout";
import CreateVoucherLayout from '../components/layout/AccountingMasterLayout/CreateVoucherLayout';
import ViewVoucherLayout from '../components/layout/AccountingMasterLayout/ViewVoucherLayout';
import EditLedgerAssignmentLayout from '../components/layout/AccountingMasterLayout/EditLedgerAssignmentLayout';
import RetailerAssignmentLayout from '../components/layout/AccountingMasterLayout/RetailerAssignmentLayout';
import CreateStockGroupLayout from "../components/layout/CreateStockGroupLayout";
import ViewStockGroupLayout from "../components/layout/ViewStockGroupLayout";
import CreateStockCategoryLayout from "../components/layout/CreateStockCategoryLayout";
import ViewStockCategoryLayout from "../components/layout/ViewStockCategoryLayout";
import UploadSalarySlipLayout from "../components/layout/UploadSalarySlipLayout";
import PaymentLayout from "../components/layout/PaymentLayout";
import PrintShippingLablePrinterLayout from '../components/layout/Print MGMT/PrintShippingLablePrinterLayout';
import PrintTruthfulLablePrintLayout from '../components/layout/Print MGMT/PrintTruthfulLablePrintLayout';
import PurchaseLayout from "../components/layout/PurchaseLayout";
import ReceiptLayout from "../components/layout/ReceiptLayout";
import SalesLayout from "../components/layout/SalesLayout";
import CreditLayout from "../components/layout/CreditLayout";
import DebitLayout from "../components/layout/DebitLayout";
import ESignSuccess from "../components/redirection-pages/esign-success";
import ESignError from "../components/redirection-pages/esign-error";
import EmpAttendanceLayout from "../components/layout/Reports/EmpAttendaneLayout";
import ViewDistributorLayout from "../components/layout/Reports/ViewDistributorLayout";

import SchedulingAlertsReportLayout from "../components/layout/Reports/Scheduling&AlertReportLayout";
import PartyTransactionReportLayout from '../components/layout/Reports/PartyTransactionReportLayout';
import GetEmployeeExpenseReportLayout from '../components/layout/Reports/GetEmployeeExpenseReportLayout';
import PartyLedgerReportLayout from "../components/layout/Reports/PartyLedgerReportLayout";
import CreditDaysReminderReportLayout from '../components/layout/Reports/CreditDaysReminderReportLayout';
import EmployeeBalanceSheetLayout from '../components/layout/Reports/EmployeeBalanceSheetLayout';
import InterestReportLayout from '../components/layout/Reports/InterestReportLayout';
import EmployeeSalaryReportLayout from "../components/layout/Reports/EmployeeSalaryReportLayout";
import ProductReportLayout from '../components/layout/Reports/ProductReportLayout';
import ItemStockReportLayout from '../components/layout/Reports/ItemStockReportLayout';
import EmployeeVisitReportLayout from '../components/layout/Reports/EmployeeVisitReportLayout';
import EmployeeDistributorLayout from '../components/layout/Reports/EmployeeDistributorLayout';
import SupercashBillReportLayout from '../components/layout/Reports/SupercashBillReportLayout';
import PsLReportLayout from "../components/layout/Reports/P&LReportLayout";
import FrightReportLayout from '../components/layout/Reports/FrightReportLayout';
import TransportFrightReportLayout from '../components/layout/Reports/TransportFrightReportLayout';
import ItemPsLReportLayout from '../components/layout/Reports/ItemP&LReportLayout';
import ManufacturingReportLayout from "../components/layout/Reports/ManufacturingReportLayout";
import StockTransferReportLayout from "../components/layout/Reports/StockTransferReportLayout";
import PendingCollectionReportLayout from "../components/layout/Reports/PendingCollectionReportLayout";
import EmpPerformanceReportLayout from "../components/layout/Reports/EmpPerformanceReportLayout";
import TrackEmpLayout from "../components/layout/Reports/TrackEmpLayout";
import UploadEmployeeExpenses from "../components/layout/UploadEmployeeExpensesLayout";
import Distributors from "../components/layout/Distributors";
import EditDistributorLayout from "../components/layout/EditDistributeLayout"
import KYCReport from "../components/layout/Reports/KYCReport";
import EditComapnyLayout from "../components/layout/CompanyMaster/EditComapnyLayout";
import ViewComapnyLayout from "../components/layout/CompanyMaster/ViewComapnyLayout";
import EditStockGroupLayout from '../components/layout/EditStockGroupLayout';
import EditStockCategaryLayout from "../components/layout/EditStockCategaryLayout";
import AssignTargetLayout from "../components/layout/BusinessDevelopment/AssignTargetLayout";
import TeamLayout from "../components/layout/BusinessDevelopment/TeamLayout";
import ViewSubTeamLayout from "../components/layout/BusinessDevelopment/ViewSubteamLayout";
import ViewAssignedTargets from "../pages/BusinessDevelopment/ViewAssignedTargets";
import CreateGodownLayout from "../components/layout/InventoryMaster/CreateGodownLayout";
import ViewGodownLayout from "../components/layout/InventoryMaster/ViewGodownList";
import CreateUnitLayout from "../components/layout/InventoryMaster/CreateUnitOfMeasureLayout";
import UnitLayout from "../components/layout/InventoryMaster/UnitOfMeasureList";
import ViewEmployeeTargets from "../pages/BusinessDevelopment/ViewEmployeeTargets";
import CreateStockItemLayout from "../components/layout/InventoryMaster/CreateStockItemLayout";
import ViewStockItemListLayout from "../components/layout/InventoryMaster/ViewStockItemListLayout";
import EditStockItemListLayout from "../components/layout/InventoryMaster/EditStockItemListLayout";
import EditVoucherLayout from "../components/layout/AccountingMasterLayout/EditVoucherLayout";
import ActivateVoucherLayout from "../components/layout/MiscActions/ActivateVoucherLayout";
import MaterialManufacturingLayout from "../components/layout/InventoryMaster/MatrialManufacturingLayout";
import StockTransferLayout from "../components/layout/InventoryMaster/StockTransferLayout";
import EmpMonthlySalaryLayout from "../components/layout/Reports/EmpMonthlySalaryLayout";
import CreateRetailerLayout from "../components/layout/MiscActions/CreateRetailerLayout";
import ViewRetailerLayout from "../components/layout/MiscActions/ViewRetailersLayout";
import PurchaseTxnMasterLayout from "../components/layout/TransactionMasterLayout/PurchaseLayout";
import EditLedgerLayout from "../components/layout/AccountingMasterLayout/EditLedgerLayout";
import PaymentTxnMasterLayout from "../components/layout/TransactionMasterLayout/PaymentLayout";
import PurchaseInvoice from "../pages/Reports/Invoice/PurchaseInvoice";
import PaymentInvoice from "../pages/Reports/Invoice/PaymentInvoice";
import SalesTxnMasterLayout from "../components/layout/TransactionMasterLayout/SalesLayout";
import ReceiptTxnMasterLayout from "../components/layout/TransactionMasterLayout/ReceiptLayout";
import CreditNoteTxnMasterLayout from "../components/layout/TransactionMasterLayout/CreditNoteLayout";
import DebitNoteTxnMasterLayout from "../components/layout/TransactionMasterLayout/DebitNoteLayout";
import ContraTxnMasterLayout from "../components/layout/TransactionMasterLayout/ContraLayout";
import JournalTxnMasterLayout from "../components/layout/TransactionMasterLayout/JournalLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TransactionApprovalLayout from "../components/layout/MiscActions/TransactionApprovalLayout";
import CreateSalesLayout from "../components/layout/TransactionMasterLayout/CreateSalesLayout";
import DashboardLayout from "../components/layout/DashboardLayout";
import VisitTargetAssignmentLayout from "../components/layout/BusinessDevelopment/AssignVisitTargetLayout";
import ProgressHistory from "../pages/BusinessDevelopment/VisitProgressHistory";
import OrderVoucherReceiptLayout from "../components/layout/ReceiptLayout";
import Receipt from "../components/layout/OrderVoucher/Receipt";
import CreditNoteApprovalLayout from "../components/layout/OrderVoucher/CreditNoteApprovalLayout";
import EmPaymentHoldLayout from "../components/layout/HRMaster/EmPaymentHoldLayout";
import TransactionDocuments from "../components/layout/MiscActions/TransactionDocuments";
import PurchaseApprovalLayout from "../components/layout/OrderVoucher/PurchaseApprovalLayout";
import PenaltyLayout from "../components/layout/MiscActions/PenalityLayout";


function App() {
  return (
    <Router>
        <ToastContainer />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/dashboard" element={<DashboardLayout />} />
        <Route path="/hr-mgmt/add-employee" element={<AddEmpLayout />} />
        <Route path="/hr-mgmt/change-password" element={<ChangePasswordLayout />} />
        <Route path="/hr-mgmt/dept/add-department" element={<DepartmentLayout />} />
        <Route path="/hr-mgmt/roles/add-job-role" element={<JobRoleLayout />} />
        <Route path="/hr-mgmt/view-employee-list" element={<EmployeeListLayout />} />
        <Route path="/hr-mgmt/upload-emp-salary" element={<UploadSalarySlipLayout />} />
        <Route path="/hr-mgmt/emp-payment-hold" element={<EmPaymentHoldLayout/>}/>
        <Route path="/upload-documents" element={<UploadEmpDocumentsLayout />} />
        <Route path='/hr-mgmt/emp-salary-report' element={<EmployeeSalaryReportLayout />} />

        <Route path="/edit-employee-details/:empId" element={<EditEmployeePage />} />
        <Route path="/view-employee-details/:id" element={<ViewEmpDetailsLayout />} />
        <Route path="/generate-offer-letter/:id" element={<OfferLetterLayout />} />
        <Route path="/generate-agreement/:id" element={<AgreementLetterLayout />} />
        <Route path="/generate-joining-letter/:id" element={<JoiningLetterLayout />} />

        <Route path="/generate-agreement/:id" element={<AgreementLetterLayout />} />
        <Route path="/dashboard/profile/:empId" element={<ProfileLayout />} />
        <Route path="/approve-ip-user-list" element={<ApproveIpUserListLayout />} />

        <Route path='/accounting-master/create-group' element={<CreateGroupLayout />} />
        <Route path='/accounting-master/view-group' element={<ViewGroupLayout />} />
        <Route path='/accounting-master/edit-group/:id' element={<CreateGroupLayout />} />
        <Route path='/accounting-master/create-ledger' element={<CreateLedgerLayout />} />
        <Route path='/distributor/distributorlist' element={<Distributors />} />
        <Route path='/distributor/distributorlist/edit-distributor/:id' element={<EditDistributorLayout />} />
        <Route path='/distributor/distributorlist/view-distributor/:id' element={<ViewDistributorLayout />} />
        <Route path='/distributor/onboarding-ledger' element={<ONBordingdistributoragreement />} />
        <Route path='/accounting-master/view-ledger' element={<ViewLedgerLayout />} />
        <Route path='/accounting-master/create-voucher' element={<CreateVoucherLayout />} />
        <Route path='/accounting-master/view-voucher' element={<ViewVoucherLayout />} />
        <Route path='/accounting-master/retail-assignment' element={<RetailerAssignmentLayout />} />
        <Route path="/accounting-master/edit-ledger-assignment" element={<EditLedgerAssignmentLayout />} />
        <Route path="/accounting-master/edit-voucher/:id" element={<EditVoucherLayout />} />
        <Route path="/accounting-master/edit-ledger/:id" element={<EditLedgerLayout />} />

        {/* print mgmt */}
        <Route path='/print/mgmt/shipping_lable_printer' element={<PrintShippingLablePrinterLayout />} />
        <Route path='/print/mgmt/truthful_labelprint' element={<PrintTruthfulLablePrintLayout />} />
        {/*  */}
        <Route path="/business-development/create-team" element={<CreateTeamLayout />} />
        <Route path="/business-development/edit-team/:id" element={<CreateTeamLayout />} />

        <Route path="/business-development/view-teams" element={<TeamLayout />} />
        <Route path="/business-development/view-subteams/:id" element={<ViewSubTeamLayout />} />

        <Route path="/business-development/create-sub-team" element={<CreateSubTeamLayout />} />
        <Route path="/business-development/assign-target" element={<AssignTargetLayout />} />
        <Route path="/business-development/assign-target-rsm" element={<AssignTargetRSMLayout />} />
        <Route path="/business-development/view-assigned-targets" element={<ViewAssignedTargets />} />
        <Route path="/business-development/view-employee-targets" element={<ViewEmployeeTargets />} />
        <Route path="/business-development/view-visit-target" element={<VisitTargetAssignmentLayout/>}/>
        <Route path="/business-development/visit-progress-history" element={<ProgressHistory/>}/>

        <Route path="/company-master/create-company" element={<CreateCompanyLayout />} />
        <Route path="/company-master/comapny-list" element={<CompanyListLayout />} />
        <Route path="/company-master/comapny-list/edit/:id" element={<EditComapnyLayout />} />
        <Route path="/company-master/comapny-list/view_comapny/:id" element={<ViewComapnyLayout />} />

        <Route path="/approve-ip-user-list" element={<ApproveIpUserListLayout />} />

        <Route path="/inventory/create-stock-group" element={<CreateStockGroupLayout />} />
        <Route path="/inventory/view-stock-group" element={<ViewStockGroupLayout />} />
        <Route path="/inventory/view-stock-group/edit/:id" element={<EditStockGroupLayout />} />
        <Route path="/inventory/create-stock-category" element={<CreateStockCategoryLayout />} />
        <Route path="/inventory/view-stock-category/edit/:id" element={<EditStockCategaryLayout />} />
        <Route path="/inventory/create-godown" element={<CreateGodownLayout />} />
        <Route path="/inventory/edit-godown/:id" element={<CreateGodownLayout />} />
        <Route path="/inventory/view-godown-list" element={<ViewGodownLayout />} />
        <Route path="/inventory/create-unitOfMeasure" element={<CreateUnitLayout />} />
        <Route path="/inventory/unit-list" element={<UnitLayout />} />
        <Route path="/inventory/create-stock-item" element={<CreateStockItemLayout />} />
        <Route path="/inventory/view-stock-item" element={<ViewStockItemListLayout />} />
        <Route path="/inventory/edit-stock-item/:id" element={<EditStockItemListLayout />} />
        <Route path="/inventory/material-manufacturing" element={<MaterialManufacturingLayout />} />
        <Route path="/inventory/stock-transfer" element={<StockTransferLayout />} />
        <Route path="/inventory/view-stock-category" element={<ViewStockCategoryLayout />} />

        <Route path="/order-vochor/payment" element={<PaymentLayout />} />
        <Route path="/order-vochor/purchase" element={<PurchaseLayout />} />
        <Route path="/order-voucher/sales/:approvalId" element={<SalesLayout />} />
        <Route path="/order-voucher/receipt/:approvalId" element={<OrderVoucherReceiptLayout/>} />
        <Route path="/order-voucher/credit-note/:approvalId" element={<CreditNoteApprovalLayout/>} />
        <Route path="/order-voucher/purchase/:approvalId" element={<PurchaseApprovalLayout/>} />

        <Route path="/order-voucher/receipt-request" element={<Receipt/>} />
        <Route path="/order-vochor/credit" element={<CreditLayout />} />
        <Route path="/order-vochor/debit" element={<DebitLayout />} />
        <Route path="/esign-success" element={<ESignSuccess />} />
        <Route path="/esign-error" element={<ESignError />} />

        <Route path="/order-voucher/create-sales" element={<CreateSalesLayout/>}/>

        {/* reports */}
        <Route path="/report/emp-attendance-report" element={<EmpAttendanceLayout />} />
        <Route path="/report/scheduling-alert-report" element={<SchedulingAlertsReportLayout />} />
        <Route path="/report/party-transaction-report" element={<PartyTransactionReportLayout />} />
        <Route path="/report/get-emp-expense-report" element={<GetEmployeeExpenseReportLayout />} />
        <Route path="/report/party-ledger-report" element={<PartyLedgerReportLayout />} />
        <Route path="/report/credit-days-reminder-report" element={<CreditDaysReminderReportLayout />} />
        <Route path="/report/emp-balance-sheet" element={<EmployeeBalanceSheetLayout />} />
        <Route path="/report/interest-report" element={<InterestReportLayout />} />
        <Route path='/report/emp-salary-report' element={<EmployeeSalaryReportLayout />} />
        <Route path="/report/emp-monthly-salary-report" element={<EmpMonthlySalaryLayout />} />
        <Route path="/report/product-report" element={<ProductReportLayout />} />
        <Route path="/report/item-stock-report" element={<ItemStockReportLayout />} />
        <Route path="/report/emp-visit-report" element={<EmployeeVisitReportLayout />} />
        <Route path="/report/emp-distributor-details" element={<EmployeeDistributorLayout />} />
        <Route path="/report/supercash-bill-report" element={<SupercashBillReportLayout />} />
        <Route path="/report/psl-report" element={<PsLReportLayout />} />
        <Route path="/report/fright-report" element={<FrightReportLayout />} />
        <Route path="/report/transport-fright-report" element={<TransportFrightReportLayout />} />
        <Route path="/report/item-psl-report" element={<ItemPsLReportLayout />} />
        <Route path="/report/manufacturing-report" element={<ManufacturingReportLayout />} />
        <Route path="/report/stock-transfer-report" element={<StockTransferReportLayout />} />
        <Route path="/report/pending-collection-report" element={<PendingCollectionReportLayout />} />
        <Route path="/report/emp-performance-report" element={<EmpPerformanceReportLayout />} />
        <Route path="/report/track-employee" element={<TrackEmpLayout />} />
        <Route path="/hr-mgmt/upload-employee-expenses" element={<UploadEmployeeExpenses />} />
        <Route path="/report/emp-kyc-report" element={<KYCReport />} />

        <Route path="/misc/voucher-action" element={<ActivateVoucherLayout />} />
        <Route path="/misc/create-retailer" element={<CreateRetailerLayout />} />
        <Route path="/misc/view-retailers" element={<ViewRetailerLayout />} />
        <Route path="/misc/transaction-approval" element={<TransactionApprovalLayout/>}/>
        <Route path="/misc/transaction-documents" element={<TransactionDocuments/>}/>
        <Route path="/misc/emp-penalty" element={<PenaltyLayout/>}/>

        <Route path="/transaction-master/purchase" element={<PurchaseTxnMasterLayout />} />
        <Route path="/transaction-master/payment" element={<PaymentTxnMasterLayout />} />
        <Route path="/transaction-master/sale" element={<SalesTxnMasterLayout />} />
        <Route path="/transaction-master/receipt" element={<ReceiptTxnMasterLayout/>}/>
        <Route path="/transaction-master/credit-note" element={<CreditNoteTxnMasterLayout/>}/>
        <Route path="/transaction-master/debit-note" element={<DebitNoteTxnMasterLayout/>}/>
        <Route path="/transaction-master/contra" element={<ContraTxnMasterLayout/>}/>
        <Route path="/transaction-master/journal" element={<JournalTxnMasterLayout/>}/>

        <Route path="/print/purchase/:id" element={<PurchaseInvoice />} />
        <Route path="/print/payment/:id" element={<PaymentInvoice />} />

      </Routes>
    </Router>
  );
}

export default App;
