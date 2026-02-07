import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard/Dashboard";
import UserLogin from "../pages/Login/UserLogin";
import AddEmpLayout from "../components/layout/AddEmpLayout";
import ChangePasswordLayout from "../components/layout/ChangePasswordLayout";
import DepartmentLayout from "../components/layout/AddDepartmentLayout";
import JobRoleLayout from "../components/layout/AddJobRoleLayout";
import EmployeeListLayout from "../components/layout/EmployeeList";

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
      </Routes>
    </Router>
  );
}

export default App;
