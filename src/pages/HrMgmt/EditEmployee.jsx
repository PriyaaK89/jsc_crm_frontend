import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Input, Select, Text, SimpleGrid, VStack, useToast, FormControl, FormLabel } from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import CustomDatePicker from "../../components/common/CustomDatepicker";

const EditEmployee = () => {
    const { empId } = useParams();
    const toast = useToast();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [jobRole, setJobRole] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        gender: "",
        contact_no: "",
        date_of_birth: "",

        address_line1: "",
        address_line2: "",
        country: "India",
        state: "",
        city: "",
        district: "",
        area: "",
        pincode: "",

        father_name: "",
        pan_number: "",
        aadhar_no: "",
        blood_group: "",

        department_id: "",
        job_role_id: "",
        date_of_joining: "",
        salary: "",

        week_off: "",
        travelling_allowance_per_km: "",
        avg_travel_km_per_day: "",
        city_allowance_per_km: "",
        daily_allowance_with_doc: "",
        daily_allowance_without_doc: "",
        hotel_allowance: "",

        total_leaves: "",
        authentication_amount: "",
        headquarter: "",

        login_time: "",
        logout_time: "",
        pf: "",
        esi: "",
        approver_name: "",
        role_id: 2,
    });

    const labelStyles = {
        fontSize: "12px",
        color: "#686868",
        marginBottom: "3px",
    };

    const formatDateForApi = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    /* ---------------- FETCH EMPLOYEE DETAILS ---------------- */
    const fetchEmployeeDetails = async () => {
        try {
            const res = await API.get(
                `${API_ENDPOINTS?.get_emp_details}/${empId}`
            );
            if (res.status === 200) {
                const data = res.data.data;

                setFormData({
                    ...data,
                    date_of_birth: formatDateForApi(data.date_of_birth),
                    date_of_joining: formatDateForApi(data.date_of_joining),
                });

            }
        } catch (err) {
            toast({
                title: "Failed to load employee data",
                status: "error",
                duration: 3000,
            });
        }
    };

    /* ---------------- FETCH DEPARTMENTS ---------------- */
    const fetchDepartments = async () => {
        const res = await API.get(API_ENDPOINTS.get_department);
        setDepartments(res.data);
    };

    /* ---------------- FETCH ROLES ---------------- */
    const fetchRoleList = async (deptId) => {
        const res = await API.get(
            `${API_ENDPOINTS.get_jobRole_list}/${deptId}`
        );
        setJobRole(res.data);
    };

    useEffect(() => {
        fetchEmployeeDetails();
        fetchDepartments();
    }, []);

    /* ---------------- HANDLE CHANGE ---------------- */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /* ---------------- DEPARTMENT CHANGE ---------------- */
    const handleDepartmentChange = (e) => {
        const deptId = e.target.value;

        setFormData(prev => ({
            ...prev,
            department_id: deptId,
            job_role_id: "",
        }));

        if (deptId) {
            fetchRoleList(deptId);
        }
    };

    /* ---------------- UPDATE API ---------------- */
    const handleUpdateEmpDetails = async () => {
        try {
            setLoading(true);

            const payload = {
                ...formData,
                department_id: Number(formData.department_id),
                job_role_id: Number(formData.job_role_id),
                date_of_birth: formatDateForApi(formData.date_of_birth),
                date_of_joining: formatDateForApi(formData.date_of_joining),
                salary: Number(formData.salary),
                travelling_allowance_per_km: Number(formData.travelling_allowance_per_km),
                avg_travel_km_per_day: Number(formData.avg_travel_km_per_day),
                city_allowance_per_km: Number(formData.city_allowance_per_km),
                daily_allowance_with_doc: Number(formData.daily_allowance_with_doc),
                daily_allowance_without_doc: Number(formData.daily_allowance_without_doc),
                hotel_allowance: Number(formData.hotel_allowance),
                total_leaves: Number(formData.total_leaves),
                authentication_amount: Number(formData.authentication_amount),
                pf: Number(formData.pf),
                esi: Number(formData.esi),
            };

            const res = await API.put(
                `${API_ENDPOINTS.update_emp_details}/${empId}`,
                payload
            );

            if (res.status === 200) {
                toast({
                    title: "Employee updated successfully",
                    status: "success",
                    duration: 3000,
                });
                navigate(-1);
            }
        } catch (error) {
            toast({
                title: "Update failed",
                description: error.response?.data?.message,
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- UI ---------------- */
    return (
        <Box p={6} bg="white" borderRadius="10px">
            <Text fontSize="2xl" fontWeight="bold" mb={6}>
                Edit Employee
            </Text>

            <VStack spacing={6} align="stretch">
                <Text fontWeight="bold">Basic Details</Text>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl>
                        <FormLabel {...labelStyles}>Name</FormLabel>
                        <Input name="name" value={formData.name} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>Gender</FormLabel>
                        <Select name="gender" value={formData.gender} onChange={handleChange}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </Select>
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>Contact</FormLabel>
                        <Input name="contact_no" value={formData.contact_no} onChange={handleChange} />
                    </FormControl>

                    <CustomDatePicker label="Date of Birth" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
                    <FormControl>
                        <FormLabel {...labelStyles}>Email</FormLabel>
                        <Input name="email" value={formData.email} onChange={handleChange} />
                    </FormControl>
                </SimpleGrid>

                <Text fontWeight="bold">Address Details</Text>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl>
                        <FormLabel {...labelStyles}>Address Line 1</FormLabel>
                        <Input name="address_line1" value={formData.address_line1} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>Address Line 2</FormLabel>
                        <Input name="address_line2" value={formData.address_line2} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>Pincode</FormLabel>
                        <Input name="pincode" value={formData.pincode} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>Country</FormLabel>
                        <Input name="country" value={formData.country} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>State</FormLabel>
                        <Input name="state" value={formData.state} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>City</FormLabel>
                        <Input name="city" value={formData.city} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>District</FormLabel>
                        <Input name="district" value={formData.district} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>Area</FormLabel>
                        <Input name="area" value={formData.area} onChange={handleChange} />
                    </FormControl>

                </SimpleGrid>

                <Text fontWeight="bold">Personal Details</Text>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl>
                        <FormLabel {...labelStyles}>Father Name</FormLabel>
                        <Input name="father_name" value={formData.father_name} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>PAN Number</FormLabel>
                        <Input name="pan_number" value={formData.pan_number} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>Aadhar Number</FormLabel>
                        <Input name="aadhar_no" value={formData.aadhar_no} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>Blood Group</FormLabel>
                        <Input name="blood_group" value={formData.blood_group} onChange={handleChange} />
                    </FormControl>
                </SimpleGrid>

                <Text fontWeight="bold">Job Details</Text>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>


                    <FormControl>
                        <FormLabel {...labelStyles}>Department</FormLabel>
                        <Select
                            value={formData.department_id}
                            onChange={handleDepartmentChange}
                        >
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>Job Role</FormLabel>
                        <Select
                            name="job_role_id"
                            value={formData.job_role_id}
                            onChange={handleChange}
                        >
                            {jobRole.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </Select>
                    </FormControl>

                    <CustomDatePicker
                        label="Date of Joining"
                        name="date_of_joining"
                        value={formData.date_of_joining}
                        onChange={handleChange}
                    />

                    <FormControl>
                        <FormLabel {...labelStyles}>Salary</FormLabel>
                        <Input name="salary" value={formData.salary} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>Travelling Allowance Per K.M.</FormLabel>
                        <Input name="travelling_allowance_per_km" value={formData.travelling_allowance_per_km} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>Avg. Travelling Per Day (In K.M.)</FormLabel>
                        <Input name="avg_travel_km_per_day" value={formData.avg_travel_km_per_day} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>City Allowance (Per K.M.)</FormLabel>
                        <Input name="city_allowance_per_km" value={formData.city_allowance_per_km} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>Daily Allowance (with DOC)</FormLabel>
                        <Input name="daily_allowance_with_doc" value={formData.daily_allowance_with_doc} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>Daily Allowance (without DOC)</FormLabel>
                        <Input name="daily_allowance_without_doc" value={formData.daily_allowance_without_doc} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>Hotel Allowance</FormLabel>
                        <Input name="hotel_allowance" value={formData.hotel_allowance} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>Week Off</FormLabel>
                        <Select name="week_off" fontSize="13px" color="gray.400" placeholder="Select Week Off" value={formData.week_off} onChange={handleChange} >
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                            <option value="Saturday">Saturday</option>
                            <option value="Sunday">Sunday</option>
                        </Select>
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>Headquarter</FormLabel>
                        <Input name="headquarter" value={formData.headquarter} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>Total Leaves</FormLabel>
                        <Input name="total_leaves" value={formData.total_leaves} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>Approver Name</FormLabel>
                        <Input name="approver_name" value={formData.approver_name} onChange={handleChange} />
                    </FormControl>



                </SimpleGrid>

                <Text fontWeight="bold">Office Time & Payroll</Text>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>

                    <FormControl>
                        <FormLabel>Login Time</FormLabel>
                        <Input type="time" name="login_time" value={formData?.login_time} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Logout Time</FormLabel>
                        <Input type="time" name="logout_time" value={formData?.logout_time} onChange={handleChange} />
                    </FormControl>
                    <FormControl>
                        <FormLabel {...labelStyles}>Authentication Amount</FormLabel>
                        <Input name="authentication_amount" value={formData.authentication_amount} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>PF</FormLabel>
                        <Input name="pf" value={formData.pf} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel {...labelStyles}>ESI</FormLabel>
                        <Input name="esi" value={formData.esi} onChange={handleChange} />
                    </FormControl>
                </SimpleGrid>


                <Button
                    colorScheme="blue"
                    alignSelf="center"
                    isLoading={loading}
                    onClick={handleUpdateEmpDetails}
                >
                    Update Employee
                </Button>
            </VStack>
        </Box>
    );
};

export default EditEmployee;
