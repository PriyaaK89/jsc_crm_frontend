import {BrowserRouter as Router,Routes,Route,Navigate,} from "react-router-dom";
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
import AssignTargetTSMLayout from "../components/layout/AssignTargetTSMLayout";
import AssignTargetSMLayout from "../components/layout/AssignTargetSMLayout";
import AssignTargetFALayout from "../components/layout/AssignTargetFALayout";
import CreateCompanyLayout from "../components/layout/CreateCompanyLayout";
import ApproveIpUserListLayout from "../components/layout/ApproveIpUserListLayout";
import CreateGroupLayout from '../components/layout/AccountingMasterLayout/CreateGroupLayout';
import ViewGroupLayout from '../components/layout/AccountingMasterLayout/ViewGroupLayout';
import DeleteGroupLayout from '../components/layout/AccountingMasterLayout/DeleteGroupLayout';
import CreateLedgerLayout from '../components/layout/AccountingMasterLayout/CreateLedgerLayout';
import ViewLedgerLayout from "../components/layout/AccountingMasterLayout/ViewLedgerLayout";
import DeleteLedgerLayout from '../components/layout/AccountingMasterLayout/DeleteLedgerLayout';
import CreateVoucherLayout from '../components/layout/AccountingMasterLayout/CreateVoucherLayout';
import ViewVoucherLayout from '../components/layout/AccountingMasterLayout/ViewVoucherLayout';
import DeleteVoucherLayout from '../components/layout/AccountingMasterLayout/DeleteVoucherLayout';
import EditLedgerAssignmentLayout from '../components/layout/AccountingMasterLayout/EditLedgerAssignmentLayout';
import RetailerAssignmentLayout from '../components/layout/AccountingMasterLayout/RetailerAssignmentLayout';
import CreateStockGroupLayout from "../components/layout/CreateStockGroupLayout";
import ViewStockGroupLayout from "../components/layout/ViewStockGroupLayout";
import DeleteStockGroupLayout from "../components/layout/DeleteStockGroupLayout";
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
import EmpAttendanceLayout from "../components/layout/EmpAttendanceLayout";
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
import  ManufacturingReportLayout from "../components/layout/Reports/ManufacturingReportLayout";
import StockTransferReportLayout from "../components/layout/Reports/StockTransferReportLayout";
import PendingCollectionReportLayout from "../components/layout/Reports/PendingCollectionReportLayout";
import EmpPerformanceReportLayout from "../components/layout/Reports/EmpPerformanceReportLayout";
import TrackEmpLayout from "../components/layout/Reports/TrackEmpLayout";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/hr-mgmt/add-employee" element={<AddEmpLayout />} />
        <Route path="/hr-mgmt/change-password" element={<ChangePasswordLayout />} />
        <Route path="/hr-mgmt/dept/add-department" element={<DepartmentLayout />} />
        <Route path="/hr-mgmt/roles/add-job-role" element={<JobRoleLayout />} />
        <Route
          path="/hr-mgmt/view-employee-list"
          element={<EmployeeListLayout />}
        />
        <Route
          path="/hr-mgmt/upload-emp-salary"
          element={<UploadSalarySlipLayout />}
        />
        <Route path="/upload-documents" element={<UploadEmpDocumentsLayout />} />
         <Route path='/hr-mgmt/emp-salary-report' element={<EmployeeSalaryReportLayout/>}/>
        <Route
          path="/edit-employee-details/:empId"
          element={<EditEmployeePage />}
        />
        <Route path="/view-employee-details/:id" element={<ViewEmpDetailsLayout/>}/>
        <Route
          path="/generate-offer-letter/:id"
          element={<OfferLetterLayout />}
        />
        <Route path="/generate-agreement/:id" element={<AgreementLetterLayout/>}/>
        <Route
          path="/generate-joining-letter/:id"
          element={<JoiningLetterLayout />}
        />
      
        <Route path="/generate-agreement/:id" element={<AgreementLetterLayout/>}/>
        <Route path="/dashboard/profile/:empId" element={<ProfileLayout />} />
        <Route path="/approve-ip-user-list" element={<ApproveIpUserListLayout />}/>

        <Route path='/accounting-master/create-group' element={<CreateGroupLayout/>}/>
        <Route path='/accounting-master/view-group' element={<ViewGroupLayout/>}/>
        <Route path='/accounting-master/delete-group'   element={<DeleteGroupLayout/>}/>
        <Route path='/accounting-master/create-ledger' element={<CreateLedgerLayout/>}/>
        <Route path='/accounting-master/view-ledger' element={<ViewLedgerLayout/>}/>
        <Route path='/accounting-master/delete-ledger' element={<DeleteLedgerLayout/>}/>
        <Route path='/accounting-master/create-voucher' element={<CreateVoucherLayout/>}/>
        <Route path='/accounting-master/view-voucher' element={<ViewVoucherLayout/>}/>
        <Route path='/accounting-master/delete-voucher' element={<DeleteVoucherLayout/>}/>
        <Route path='/accounting-master/edit-ledger-assignment' element={<EditLedgerAssignmentLayout/>}/>
        <Route path='/accounting-master/retail-assignment' element={<RetailerAssignmentLayout/>}/>
        {/* print mgmt */}
        <Route path='/print/mgmt/shipping_lable_printer' element={<PrintShippingLablePrinterLayout/>}/>
        <Route path='/print/mgmt/truthful_labelprint' element={<PrintTruthfulLablePrintLayout/>}/>
        {/*  */}
        <Route
          path="/Business-dev/create-team"
          element={<CreateTeamLayout />}
        />
        <Route
          path="/Business-devt/create-sub-team"
          element={<CreateSubTeamLayout />}
        />
        <Route
          path="/Business-devt/assign-target-rsm"
          element={<AssignTargetRSMLayout />}
        />
        <Route
          path="/Business-devt/assign-target-tsm"
          element={<AssignTargetTSMLayout />}
        />
        <Route
          path="/Business-devt/assign-target-sm"
          element={<AssignTargetSMLayout />}
        />
        <Route
          path="/Business-devt/assign-target-fa"
          element={<AssignTargetFALayout />}
        />
        <Route
          path="/company-master/create-company"
          element={<CreateCompanyLayout />}
        />
   

        <Route
          path="/approve-ip-user-list"
          element={<ApproveIpUserListLayout />}
        />
   
        <Route
          path="/inventory/create-stock-group"
          element={<CreateStockGroupLayout />}
        />
        <Route
          path="/inventory/view-stock-group"
          element={<ViewStockGroupLayout />}
        />
        <Route
          path="/inventory/delete-stock-group"
          element={<DeleteStockGroupLayout />}
        />
        <Route
          path="/inventory/create-stock-category"
          element={<CreateStockCategoryLayout />}
        />
        <Route
          path="/inventory/view-stock-category"
          element={<ViewStockCategoryLayout />}
        />
        <Route path="/order-vochor/payment" element={<PaymentLayout />} />
        <Route path="/order-vochor/purchase" element={<PurchaseLayout />} />
        <Route path="/order-vochor/sales" element={<SalesLayout />} />
        <Route path="/order-vochor/receipt" element={<ReceiptLayout />} />
        <Route path="/order-vochor/credit" element={<CreditLayout />} />
        <Route path="/order-vochor/debit" element={<DebitLayout />} />
        <Route path="/esign-success" element={<ESignSuccess/>} />
        <Route path="/esign-error" element={<ESignError />} />  
        


        {/* reports */}
         <Route path="/report/emp-attendance-report" element={<EmpAttendanceLayout/>}/>
         <Route path="/report/scheduling-alert-report" element={<SchedulingAlertsReportLayout/>}/>
         <Route path="/report/party-transaction-report" element={<PartyTransactionReportLayout/>}/>
         <Route path="/report/get-emp-expense-report" element={<GetEmployeeExpenseReportLayout/>}/>
         <Route path="/report/party-ledger-report" element={<PartyLedgerReportLayout/>}/>
         <Route path="/report/credit-days-reminder-report" element={<CreditDaysReminderReportLayout/>}/>
         <Route path="/report/emp-balance-sheet" element={<EmployeeBalanceSheetLayout/>}/>
         <Route path="/report/interest-report" element={<InterestReportLayout/>}/>
         <Route path='/report/emp-salary-report' element={<EmployeeSalaryReportLayout/>}/>
         <Route path="/report/product-report" element={<ProductReportLayout/>}/>
         <Route path="/report/item-stock-report" element={<ItemStockReportLayout/>}/>
         <Route path="/report/emp-visit-report" element={<EmployeeVisitReportLayout/>}/>
         <Route path="/report/emp-distributor-details" element={<EmployeeDistributorLayout/>}/>
         <Route path="/report/supercash-bill-report" element={<SupercashBillReportLayout/>}/>
         <Route path="/report/psl-report" element={<PsLReportLayout/>}/>
         <Route path="/report/fright-report" element={<FrightReportLayout/>}/>
         <Route path="/report/transport-fright-report" element={<TransportFrightReportLayout/>}/>
         <Route path="/report/item-psl-report" element={<ItemPsLReportLayout/>}/>
         <Route path="/report/manufacturing-report" element={<ManufacturingReportLayout/>}/>
         <Route path="/report/stock-transfer-report" element={<StockTransferReportLayout/>}/>
         <Route path="/report/pending-collection-report" element={<PendingCollectionReportLayout/>}/>
         <Route path="/report/emp-performance-report" element={<EmpPerformanceReportLayout/>}/>
           <Route path="/report/track-employee" element={<TrackEmpLayout />} />
      
      </Routes>
    </Router>
  );
}

export default App;
