import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "../pages/Dashboard/Dashboard";
import UserLogin from "../pages/Login/UserLogin";
import AddEmpLayout from "../components/layout/AddEmpLayout";
import ChangePasswordLayout from "../components/layout/ChangePasswordLayout";
import DepartmentLayout from "../components/layout/AddDepartmentLayout";
import JobRoleLayout from "../components/layout/AddJobRoleLayout";
import EmployeeListLayout from "../components/layout/EmployeeList";
import UploadEmpDocumentsLayout from "../components/layout/UploadEmpDocumentsLayout";
import EditEmployeePage from "../components/layout/EditEmployee";
import OfferLetterLayout from "../components/layout/GenerateLetters/OfferLetterLayout";
import JoiningLetterLayout from "../components/layout/GenerateLetters/JoiningLetterLayout";
import ProfileLayout from "../components/layout/ProfileLayout";
import CreateTeamLayout from "../components/layout/CreateteamLayout";
import CreateSubTeamLayout from "../components/layout/CreateSubTeamLayout";
import AssignTargetRSMLayout from "../components/layout/AssignTargetRSMLayout";
import AssignTargetTSMLayout from "../components/layout/AssignTargetTSMLayout";
import AssignTargetSMLayout from "../components/layout/AssignTargetSMLayout";
import AssignTargetFALayout from "../components/layout/AssignTargetFALayout";
import CreateCompanyLayout from "../components/layout/CreateCompanyLayout";
import ApproveIpUserListLayout from "../components/layout/ApproveIpUserListLayout";
import EmpAttendaneLayout from "../components/layout/EmpAttendaneLayout";
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
import EmployeeSalaryReportLayout from "../components/layout/EmployeeSalaryReportLayout";
import CreateStockGroupLayout from "../components/layout/CreateStockGroupLayout";
import ViewStockGroupLayout from "../components/layout/ViewStockGroupLayout";
import DeleteStockGroupLayout from "../components/layout/DeleteStockGroupLayout";
import CreateStockCategoryLayout from "../components/layout/CreateStockCategoryLayout";
import ViewStockCategoryLayout from "../components/layout/ViewStockCategoryLayout";
import UploadSalarySlipLayout from "../components/layout/UploadSalarySlipLayout";
import TrackEmpLayout from "../components/layout/TrackEmpLayout";
import UploadEmpDocuments from '../pages/HrMgmt/DocUpload/UploadEmpDocuments';
import PaymentLayout from "../components/layout/PaymentLayout";
import PrintShippingLablePrinterLayout from '../components/layout/Print MGMT/PrintShippingLablePrinterLayout';
import PrintTruthfulLablePrintLayout from '../components/layout/Print MGMT/PrintTruthfulLablePrintLayout';
import AgreementLetterLayout from "../components/layout/GenerateLetters/AgreementLetterLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/hr-mgmt/add-employee" element={<AddEmpLayout />} />
        <Route path="/change-password" element={<ChangePasswordLayout />} />
        <Route path="/dept/add-department" element={<DepartmentLayout />} />
        <Route path="/roles/add-job-role" element={<JobRoleLayout />} />
        <Route
          path="/hr-mgmt/view-employee-list"
          element={<EmployeeListLayout />}
        />
        <Route
          path="/hr-mgmt/upload-emp-salary"
          element={<UploadSalarySlipLayout />}
        />
        <Route path="/upload-documents" element={<UploadEmpDocuments />} />
         <Route path='/emp-salary-report' element={<EmployeeSalaryReportLayout/>}/>
        <Route
          path="/edit-employee-details/:empId"
          element={<EditEmployeePage />}
        />
        <Route
          path="/generate-offer-letter/:id"
          element={<OfferLetterLayout />}
        />
        <Route
          path="/generate-joining-letter/:id"
          element={<JoiningLetterLayout />}
        />
        <Route path="/generate-agreement/:id" element={<AgreementLetterLayout/>}/>
        <Route path="/dashboard/profile/:empId" element={<ProfileLayout />} />
        <Route path="/approve-ip-user-list" element={<ApproveIpUserListLayout />}/>
        <Route path="/emp-attendance-report" element={<EmpAttendaneLayout/>}/>
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
          path="company-master/create-company"
          element={<CreateCompanyLayout />}
        />
        <Route path="/hr-mgmt/track-employee" element={<TrackEmpLayout />} />

        <Route
          path="/approve-ip-user-list"
          element={<ApproveIpUserListLayout />}
        />
        <Route path="/emp-attendance-report" element={<EmpAttendaneLayout />} />
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
      </Routes>
    </Router>
  );
}

export default App;
