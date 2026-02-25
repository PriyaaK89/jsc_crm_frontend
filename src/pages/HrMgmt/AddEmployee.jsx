import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { Box, Button, Input, Select, Text, SimpleGrid, VStack, useToast, FormControl, FormLabel, HStack, Breadcrumb,BreadcrumbItem,BreadcrumbLink  } from "@chakra-ui/react";
import CustomDatePicker from "../../components/common/CustomDatepicker";
import { GoHomeFill } from "react-icons/go";



const AddEmployee = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [jobRole, setJobRole] = useState([]);
    const navigate = useNavigate();

    const [areas, setAreas] = useState([]);

    const [formData, setFormData] = useState({
        name: "", gender: "", contact_no: "", date_of_birth: "", email: "", password: "",
        address_line1: "", address_line2: "", country: "India", state: "", city: "", district: "", pincode: "",
        father_name: "", pan_number: "", aadhar_no: "", blood_group: "",
        department_id: "", job_role_id: "", date_of_joining: "", salary: "", week_off: "",

        travelling_allowance_per_km: "", avg_travel_km_per_day: "", city_allowance_per_km: "",
        daily_allowance_with_doc: "", daily_allowance_without_doc: "", hotel_allowance: "",
        attendance_time: "",
        total_leaves: "", authentication_amount: "", headquarter: "",
        login_time: "", logout_time: "",
        pf: "", esi: "",
        approver_name: "",
    });
    const [empList, setEmpList] = useState([]);

    const fetchEmployeeList = async () => {
        try {
            setLoading(true);
            const response = await API.get(API_ENDPOINTS.GET_USERS, {
               
            });

            if (response.status === 200) {
                setEmpList(response.data.data);
                console.log(response.data, "EMPLOYEE RESPONSE");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployeeList();
    }, []);


    const handleChange = (e) => {
        if (!e || !e.target || !e.target.name) return;

        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const handleSubmit = async () => {
        try {
            setLoading(true);

            const response = await API.post(
                `${API_ENDPOINTS?.CREATE_USERS}`,
                {
                    ...formData,
                    department_id: Number(formData.department_id),
                    job_role_id: Number(formData.job_role_id),
                    salary: Number(formData.salary),

                    travelling_allowance_per_km: Number(
                        formData.travelling_allowance_per_km,
                    ),
                    avg_travel_km_per_day: Number(formData.avg_travel_km_per_day),
                    city_allowance_per_km: Number(formData.city_allowance_per_km),

                    daily_allowance_with_doc: Number(formData.daily_allowance_with_doc),
                    daily_allowance_without_doc: Number(
                        formData.daily_allowance_without_doc,
                    ),
                    hotel_allowance: Number(formData.hotel_allowance),
                    week_off: formData.week_off,
                    total_leaves: Number(formData.total_leaves),
                    authentication_amount: Number(formData.authentication_amount),
                    pf: Number(formData.pf),
                    esi: Number(formData.esi),
                },

            );
            if (response?.status === 201) {
                toast({
                    title: "User created successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });


                navigate("/upload-documents", {
                    state: {
                        userId: response?.data?.id,
                        email: response?.data?.email,
                        mustChangePassword: response?.data?.must_change_password,
                    }
                });

                setFormData({
                    name: "", gender: "", contact_no: "", date_of_birth: "", email: "", password: "",
                    address_line1: "", address_line2: "", country: "India",
                    state: "", city: "", district: "", pincode: "", area: "",
                    father_name: "", pan_number: "", aadhar_no: "", blood_group: "",
                    department_id: "", job_role_id: "", date_of_joining: "", salary: "",
                    week_off: "", total_leaves: "", approver_name: "",
                });
            }

        } catch (error) {
            toast({
                title: "Failed to create user",
                description: error.response?.data?.message || "Something went wrong",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartmentList = async () => {
        try {
            const response = await API.get(API_ENDPOINTS?.get_department)
            if (response?.status === 200) {
                setDepartments(response.data);
            }
        } catch (error) {
            console.log("Department fetch error", error);
        }
    };

    useEffect(() => {
        fetchDepartmentList();
    }, []);

    const fetchRoleList = async (deptId) => {
        try {
            const response = await API.get(
                `${API_ENDPOINTS?.get_jobRole_list}/${deptId}`,
            );
            if (response?.status === 200) {
                setJobRole(response?.data);
            }
        } catch (error) {
            console.log(error, "error");
        }
    };

    useEffect(() => {
        fetchRoleList();
    }, []);

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


    const handlePincodeChange = async (value) => {
        setFormData((prev) => ({
            ...prev,
            pincode: value
        }));

        if (value.length === 6) {
            try {
                const res = await API.get(`/getstatecity/${value}`);
                const { state, district, city } = res.data.data;

                setFormData((prev) => ({
                    ...prev,
                    state,
                    district,
                    city
                }));

                // const areaRes = await API.get(`/areas?district=${district}`);
                const areaRes = await
                    API.get(`/areas?pincode=${value}`);

                setAreas(areaRes.data.data);

            } catch (err) {
                console.error("Pincode lookup failed", err);
            }
        }
    };



    const lableStyles = {
        fontSize: "12px",
        color: "#686868",
        marginBottom: "3px"
    };

 
    return (
        <>
            <Box bg="white" borderRadius="10px" px={6} py={4} >
                <HStack justifyContent='space-between'>
                          <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
                            <BreadcrumbItem>
                              <BreadcrumbLink href='/dashboard'><GoHomeFill color="#5570F1" /> </BreadcrumbLink>
                            </BreadcrumbItem>
                
                            <BreadcrumbItem>
                              <BreadcrumbLink href='hr-mgmt/view-employee-list' color='#8B8D97' fontSize='13px'>Employee List</BreadcrumbLink>
                            </BreadcrumbItem>
                
                          </Breadcrumb>
                          {/* <Button backgroundColor='#3E60AA' color='white' fontWeight='400' height='36px' fontSize='14px' borderRadius='12px' _hover={{ backgroundColor: '#5570F1' }}><span style={{ fontSize: '18px', paddingRight: '10px' }}><FaPlus /></span> Create a New Product</Button> */}
                
                        </HStack>
                <Text fontSize="2xl" fontWeight="bold" mb={6}>
                    Create User
                </Text>

                <VStack spacing={6} align="stretch">
                    {/* BASIC DETAILS */}
                    <Text fontWeight="bold">Basic Details</Text>


                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <FormControl>
                            <FormLabel {...lableStyles} >Name</FormLabel>
                            <Input name="name" placeholder="Enter name" onChange={handleChange} />

                        </FormControl>

                        <FormControl>
                            <FormLabel {...lableStyles}>Select Gender</FormLabel>
                            <Select fontSize="13px" color="gray.400" name="gender" placeholder="Gender" onChange={handleChange}>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel {...lableStyles}>Contact No.</FormLabel>
                            <Input name="contact_no" placeholder="Enter your Contact No" onChange={handleChange} />
                        </FormControl>

                        <CustomDatePicker
                            label="Date of Birth"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            placeholder="Select date of Birth"
                        />

                        <FormControl>
                            <FormLabel {...lableStyles}>Email</FormLabel>
                            <Input name="email" placeholder="Enter Email" onChange={handleChange} />
                        </FormControl>
                    </SimpleGrid>

                    {/* ADDRESS */}
                    <Text fontWeight="bold">Address</Text>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <FormControl>
                            <FormLabel {...lableStyles}>Address</FormLabel>
                            <Input name="address_line1" placeholder="Address Line 1" onChange={handleChange} />
                        </FormControl>
                        <FormControl>
                            <FormLabel {...lableStyles}>Address</FormLabel>
                            <Input name="address_line2" placeholder="Address Line 2" onChange={handleChange} />
                        </FormControl>
                        <FormControl>
                            <FormLabel {...lableStyles}>Pincode</FormLabel>
                            <Input name="pincode" maxLength={6} value={formData.pincode || ""} onChange={(e) => handlePincodeChange(e.target.value)} />
                        </FormControl>
                        <FormControl>
                            <FormLabel {...lableStyles}>Country</FormLabel>
                            <Input name="country" value={formData.country} onChange={handleChange} />
                        </FormControl>
                        <FormControl>
                            <FormLabel {...lableStyles}>State</FormLabel>
                            <Input name="state" value={formData.state || ""} isReadOnly />
                        </FormControl>
                        <FormControl>
                            <FormLabel {...lableStyles}>City</FormLabel>
                            <Input name="city" value={formData.city || ""} isReadOnly />
                        </FormControl>
                        <FormControl>
                            <FormLabel {...lableStyles}>District</FormLabel>
                            <Input name="district" value={formData.district || ""} isReadOnly />
                        </FormControl>

                        <FormControl>
                            <FormLabel {...lableStyles}>Select Area</FormLabel>
                            <Select
                                placeholder="Select Area"
                                value={formData.area || ""}
                                isDisabled={!areas.length}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        area: e.target.value
                                    }))
                                }
                            >
                                {areas.map((a, index) => (
                                    <option key={index} value={a.officename}>
                                        {a.officename}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </SimpleGrid>

                    {/* PERSONAL INFO */}
                    <Text fontWeight="bold">Personal Info</Text>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <FormControl>
                            <FormLabel {...lableStyles}>Father's Name</FormLabel>
                            <Input name="father_name" placeholder="Father Name" onChange={handleChange} />
                        </FormControl>
                        <FormControl>
                            <FormLabel {...lableStyles}>Pan Number</FormLabel>
                            <Input name="pan_number" placeholder="PAN Number" onChange={handleChange} />
                        </FormControl>
                        <FormControl>
                            <FormLabel {...lableStyles}>Aadhar No.</FormLabel>
                            <Input name="aadhar_no" placeholder="Aadhar No" onChange={handleChange} />
                        </FormControl>
                        <FormControl>
                            <FormLabel {...lableStyles}>Blood Group</FormLabel>
                            <Input name="blood_group" placeholder="Blood Group" onChange={handleChange} />
                        </FormControl>
                    </SimpleGrid>


                    {/* JOB DETAILS */}
                    <Text fontWeight="bold">Job Details</Text>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <FormControl>
                            <FormLabel {...lableStyles}>Department Name</FormLabel>
                            <Select placeholder="Select Department" fontSize="13px" color="gray.400" value={formData.department_id} onChange={handleDepartmentChange}>
                                {departments.map((dept) => (<option key={dept.id} value={dept.id}> {dept.name} </option>))}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel {...lableStyles}>Job Role Name</FormLabel>
                            <Select placeholder="Select Job Role" fontSize="13px" color="gray.400" value={formData.job_role_id} name="job_role_id" onChange={handleChange} isDisabled={!jobRole.length}>
                                {jobRole.map((role) => (
                                    <option key={role.id} value={role.id}> {role.name} </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <CustomDatePicker
                                label="Date of Joining"
                                name="date_of_joining"
                                value={formData.date_of_joining}
                                onChange={handleChange}
                                placeholder="Select date of joining"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel {...lableStyles}>Salary</FormLabel>
                            <Input name="salary" placeholder="Salary" onChange={handleChange} />
                        </FormControl>

                        <FormControl>
                            <FormLabel {...lableStyles}>Travelling Allowance Per K.M.</FormLabel>
                            <Input name="travelling_allowance_per_km" placeholder="Travelling Allowance (per km)" onChange={handleChange} />
                        </FormControl>

                        <FormControl>
                            <FormLabel {...lableStyles}>Avg. Travelling Per Day (In K.M.)</FormLabel>
                            <Input name="avg_travel_km_per_day" placeholder="Avg Travel / Day (km)" onChange={handleChange} />
                        </FormControl>
                        <FormControl>
                            <FormLabel {...lableStyles}>City Allowance (Per K.M.)</FormLabel>
                            <Input name="city_allowance_per_km" placeholder="City Allowance (per km)" onChange={handleChange} />
                        </FormControl>
                        <FormControl>
                            <FormLabel {...lableStyles}>Daily Allowance (with DOC)</FormLabel>
                            <Input name="daily_allowance_with_doc" placeholder="Daily Allowance (with doc)" onChange={handleChange} />
                        </FormControl>
                        <FormControl>
                            <FormLabel {...lableStyles}>Daily Allowance (without DOC)</FormLabel>
                            <Input name="daily_allowance_without_doc" placeholder="Daily Allowance (without doc)" onChange={handleChange} />
                        </FormControl>
                        <FormControl>
                            <FormLabel  {...lableStyles}>Hotel Allowance</FormLabel>
                            <Input name="hotel_allowance" placeholder="Hotel Allowance" onChange={handleChange} />
                        </FormControl>
                        <FormControl>
                            <FormLabel {...lableStyles} >Select Week Off</FormLabel>
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
                            <FormLabel {...lableStyles}>Total Leaves</FormLabel>
                            <Input name="total_leaves" onChange={handleChange} />
                        </FormControl>
                        <FormControl>
                            <FormLabel  {...lableStyles}>Headquarter</FormLabel>
                            <Input name="headquarter" onChange={handleChange} />
                        </FormControl>

                        <FormControl>
                            <FormLabel {...lableStyles}>Approver Name</FormLabel>
                            <Select name="approver_name" placeholder="Select Approver" onChange={handleChange}>
                                {empList?.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </SimpleGrid>

                    <Text fontWeight="bold">Office Timing & Payroll</Text>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <FormControl>
                            <FormLabel  {...lableStyles}>Login Time</FormLabel>
                            <Input type="time" name="login_time" onChange={handleChange} />
                        </FormControl>

                        <FormControl>
                            <FormLabel  {...lableStyles}>Logout Time</FormLabel>
                            <Input type="time" name="logout_time" onChange={handleChange} />
                        </FormControl>

                        <FormControl>
                            <FormLabel  {...lableStyles}>Attendance Time</FormLabel>
                            <Input
                                name="attendance_time"
                                value={formData.attendance_time || "11 A.M."}
                                onChange={handleChange}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel  {...lableStyles}>Authentication Amount</FormLabel>
                            <Input name="authentication_amount" onChange={handleChange} />
                        </FormControl>

                        <FormControl>
                            <FormLabel  {...lableStyles}>PF Amount</FormLabel>
                            <Input name="pf" onChange={handleChange} />
                        </FormControl>

                        <FormControl>
                            <FormLabel  {...lableStyles}>ESI Amount</FormLabel>
                            <Input name="esi" onChange={handleChange} />
                        </FormControl>
                    </SimpleGrid>

                    <Button
                        colorScheme="blue"
                        alignSelf="center"
                        isLoading={loading}
                        onClick={handleSubmit}>
                        Create User
                    </Button>

                    {/* <DocumentUploadTable/> */}


                </VStack>
            </Box>
        </>
    )
}

export default AddEmployee