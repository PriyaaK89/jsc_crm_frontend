// src/services/endpoints.js
export const API_ENDPOINTS = {
  LOGIN: "auth/login",
  CREATE_USERS: "auth/create-user",
  GET_USERS: "auth/get-users",
  update_emp_details: `auth/update-user`,
  get_jobRole_list: `get-jobRole`,
  change_password: `auth/set-password`,
  create_department: `department/create-department`,
  get_department: `department/get-deparments`,
  create_jobRole: `create-jobRole`,
  get_jobRole_list: `get-jobRole`,
  upload_img: `upload-image`,
  get_emp_docs: "get-documents",
  get_emp_details: `auth/get-employee-details`,
  update_emp_status: `/auth/user-status`,
  get_deleted_users: `/auth/get-deleted-users`,
  delete_users: `/auth/delete-user`,
  get_ip_requests: `auth/get-ip-requests`,
  approve_ip: `auth/approve-ip`,
  get_Emp_Attendance: `/attendance/daywise`,
  get_Emp_Attendance_Summary:  `attendance/monthly-summary`,
  upload_salary_slip:`upload-emp-salary`
};
