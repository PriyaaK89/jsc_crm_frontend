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
import UploadEmpDocuments from "../pages/HrMgmt/DocUpload/UploadEmpDocuments";
import EditEmployeePage from "../components/layout/EditEmployee";
import OfferLetterLayout from "../components/layout/GenerateLetters/OfferLetterLayout";
import JoiningLetterLayout from "../components/layout/GenerateLetters/JoiningLetterLayout";
import ApproveIpUserListLayout from "../components/layout/ApproveIpUserListLayout";
import EmpAttendaneLayout from "../components/layout/EmpAttendaneLayout";
import CreateStockGroupLayout from "../components/layout/CreateStockGroupLayout";
import ViewStockGroupLayout from "../components/layout/ViewStockGroupLayout";
import DeleteStockGroupLayout from "../components/layout/DeleteStockGroupLayout";
import  CreateStockCategoryLayout from "../components/layout/CreateStockCategoryLayout";
import ViewStockCategoryLayout from "../components/layout/ViewStockCategoryLayout";

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
        
        <Route path="/upload-documents" element={<UploadEmpDocuments />} />
        <Route
          path="/edit-employee-details/:empId"
          element={<EditEmployeePage />}
        />
        <Route
          path="/hr-mgmt/view-employee-list"
          element={<EmployeeListLayout />}
        />
        <Route
          path="/generate-offer-letter/:id"
          element={<OfferLetterLayout />}
        />
        <Route
          path="/generate-joining-letter/:id"
          element={<JoiningLetterLayout />}
        />
        <Route
          path="/approve-ip-user-list"
          element={<ApproveIpUserListLayout />}
        />
        <Route
          path="/emp-attendance-report"
          element={<EmpAttendaneLayout/>}
        />
        <Route
          path="/inventory/create-stock-group"
          element={<CreateStockGroupLayout/>}
      />
<Route
          path="/inventory/view-stock-group"
          element={<ViewStockGroupLayout/>}
      />
      <Route
          path="/inventory/delete-stock-group"
          element={<DeleteStockGroupLayout/>}
      />
      <Route
          path="/inventory/create-stock-category"
          element={<CreateStockCategoryLayout/>}
      />
      <Route
          path="/inventory/view-stock-category"
          element={<ViewStockCategoryLayout/>}
      />
             </Routes>

    </Router>
  );
}

export default App;
