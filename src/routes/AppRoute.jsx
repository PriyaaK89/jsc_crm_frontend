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
import ProfileLayout from "../components/layout/ProfileLayout";
import CreateTeamLayout from "../components/layout/CreateteamLayout";
import CreateSubTeamLayout from "../components/layout/CreateSubTeamLayout";
import AssignTargetRSMLayout from "../components/layout/AssignTargetRSMLayout";
import AssignTargetTSMLayout from "../components/layout/AssignTargetTSMLayout";
import AssignTargetSMLayout from "../components/layout/AssignTargetSMLayout";
import AssignTargetFALayout from "../components/layout/AssignTargetFALayout";
import CreateCompanyLayout from "../components/layout/CreateCompanyLayout";


function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<UserLogin/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/hr-mgmt/add-employee" element={<AddEmpLayout/>}/>
        <Route path="/change-password" element={<ChangePasswordLayout/>}/>
        <Route path="/dept/add-department" element={<DepartmentLayout/>}/>
        <Route path="/roles/add-job-role" element={<JobRoleLayout/>}/>
        <Route path="/hr-mgmt/view-employee-list" element={<EmployeeListLayout/>}/>
        <Route path="/upload-documents" element={  <UploadEmpDocuments/>}/>
        <Route path="/edit-employee-details/:empId" element={<EditEmployeePage/>}/>
        <Route path="/generate-offer-letter/:id" element={<OfferLetterLayout/>}/>
        <Route path="/generate-joining-letter/:id" element={<JoiningLetterLayout/>}/>
        <Route path="/dashboard/profile/:empId" element={<ProfileLayout/>}/>
        <Route path='/Business-dev/create-team' element={<CreateTeamLayout/>}/>
        <Route path='/Business-devt/create-sub-team' element={<CreateSubTeamLayout/>}/>
        <Route path='/Business-devt/assign-target-rsm' element={<AssignTargetRSMLayout/>}/>
        <Route path='/Business-devt/assign-target-tsm' element={<AssignTargetTSMLayout/>}/>
       <Route path='/Business-devt/assign-target-sm' element={<AssignTargetSMLayout/>}/>
       <Route path='/Business-devt/assign-target-fa' element={<AssignTargetFALayout/>}/>
       <Route path='company-master/create-company' element={<CreateCompanyLayout/>}/>
       <Route path='company-master/view-company' element={<CreateCompanyLayout/>}/>
       <Route path='company-master/delete-company' element={<CreateCompanyLayout/>}/>
      
      </Routes> 
    </Router>
  );
}

export default App;
