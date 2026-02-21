import { Box, Button, Checkbox, Flex, FormControl, FormLabel, Heading, Image, Input, Select, SimpleGrid, Spinner, Text, useDisclosure, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import EmpJoiningLetterPreview from "./EmpJoiningLetterPreview";
import CustomDatePicker from "../../../components/common/CustomDatepicker";
import jsc_stamp from "../../../assets/images/stamp_jsc.png"

const EmpJoiningLetter = () => {
    const { id } = useParams();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectEmpId, setSelectedEmpId] = useState('')
    const yearly_salary = employee?.salary;
    console.log(yearly_salary, "yearly_salary")
    const monthly_salary = yearly_salary / 12;
    console.log(monthly_salary, "monthly_salary")

    const [formData, setFormData] = useState({
        area: "",
        appoint_under: "",
        job_role_name: "",
        department_name: "",
        appointer_role: "",
        appointer_state: "",
        appoint_under_name: "",
        date_of_issue: "",
        basic: "",
        house_rent: "",
        medical: "",
        dearness_allowance: "",
        other_allowance: "",
        petrol_per_km: "",
        max_km: "",
        min_km: "",
        show_stamp: false,
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

    /* ===== Fetch Employee ===== */
    useEffect(() => {
        const fetchEmployee = async () => {
            const res = await API.get(
                `${API_ENDPOINTS.get_emp_details}/${id}`
            );
            setEmployee(res.data.data);
            console.log(res?.data?.data, "empDetails")
            setLoading(false);
        };

        fetchEmployee();
    }, [id]);
    useEffect(() => {
        if (employee?.salary) {
            const yearly = Number(employee.salary);
            const monthly = yearly / 12;

            setFormData((prev) => ({
                ...prev,
                basic: (monthly * 0.5).toFixed(0),
                house_rent: (monthly * 0.2).toFixed(0),
                medical: (monthly * 0.1).toFixed(0),
                dearness_allowance: (monthly * 0.1).toFixed(0),
                other_allowance: (monthly * 0.1).toFixed(0),
            }));
        }
    }, [employee]);

    const fetchEmployeeDetails = async (empId) => {
        try {
            const res = await API.get(
                `${API_ENDPOINTS.get_emp_details}/${empId}`
            );

            if (res.status === 200) {
                const data = res.data.data;

                setFormData((prev) => ({
                    ...prev,
                    appoint_under: data.id,
                    job_role_name: data.job_role_name,
                    department_name: data.department_name,
                    appointer_state: data.state
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };


    if (loading) {
        return (
            <Flex h="60vh" justify="center" align="center">
                <Spinner size="lg" />
            </Flex>
        );
    }


    return (
        <>
            <Box bg="white" p={6} borderRadius="12px">
                <Heading size="md" mb={4}>
                    Generate Offer Letter
                </Heading>

                <Box
                    p={5}
                    bg="gray.50"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    mb={8}
                >
                    <Heading size="sm" mb={4} color="gray.600">
                        Employee Information
                    </Heading>

                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <Text><b>Name:</b> {employee.name}</Text>
                        <Text><b>Email:</b> {employee.email}</Text>
                        <Text><b>Contact:</b> {employee.contact_no}</Text>

                        <Text><b>Department:</b> {employee.department_name}</Text>
                        <Text><b>Role:</b> {employee.job_role_name}</Text>
                        <Text>
                            <b>DOJ:</b>{" "}
                            {new Date(employee.date_of_joining).toLocaleDateString()}
                        </Text>

                        <Text gridColumn="span 3">
                            <b>Address:</b> {employee?.address_line1} {employee?.address_line2}{employee?.address_line2 ? "," : " "}
                            {employee?.area}, {employee?.city}, {employee?.state} -{" "}
                            {employee?.pincode}
                        </Text>
                        <Text><b>Salary:</b>{" "}
                            ₹{Number(employee?.salary).toLocaleString("en-IN", {
                                maximumFractionDigits: 0,
                            })}
                        </Text>

                    </SimpleGrid>
                </Box>
                <VStack spacing={6} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <FormControl>
                            <FormLabel>Enter Area</FormLabel>
                            <Input placeholder="Enter Area's" value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })} />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Select Appointer Name</FormLabel>
                            <Select
                                placeholder="Select Appointer"
                                value={formData.appoint_under}
                                onChange={(e) => {
                                    const selectedId = e.target.value;

                                    const selectedEmp = empList.find(
                                        (emp) => emp.id === Number(selectedId)
                                    );

                                    setFormData((prev) => ({
                                        ...prev,
                                        appoint_under: selectedId,        // id for backend
                                        appoint_under_name: selectedEmp?.name || "",  // name for display
                                    }));

                                    fetchEmployeeDetails(selectedId);
                                }}
                            >
                                {empList?.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl >
                            <FormLabel>Department Name</FormLabel>
                            <Input
                                value={formData.department_name}
                                isReadOnly
                            />
                        </FormControl>

                        <FormControl >
                            <FormLabel>Job Role Name</FormLabel>
                            <Input
                                value={formData.job_role_name}
                                isReadOnly
                            /></FormControl>

                        <FormControl>
                            <FormLabel>State</FormLabel>
                            <Input
                                value={formData.appointer_state}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        appointer_state: e.target.value
                                    }))
                                }
                            />
                        </FormControl>

                        <CustomDatePicker
                            label="Date of Issue"
                            value={formData.date_of_issue}
                            onChange={(e) => setFormData({ ...formData, date_of_issue: e.target.value })}
                            placeholder="Select date of issue"
                        />
                        <FormControl>
                            <FormLabel>Monthly Gross Salary</FormLabel>
                            <Input
                                value={
                                    employee?.salary
                                        ? (employee.salary / 12).toFixed(0)
                                        : ""
                                }
                                isReadOnly
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Basic (Monthly) (50%)</FormLabel>
                            <Input
                                type="number"
                                value={formData.basic}
                                onChange={(e) =>
                                    setFormData({ ...formData, basic: e.target.value })
                                }
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>House Rent (Monthly) (20%)</FormLabel>
                            <Input
                                type="number"
                                value={formData.house_rent}
                                onChange={(e) =>
                                    setFormData({ ...formData, house_rent: e.target.value })
                                }
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Medical Reimbursement (Monthly)(10%)</FormLabel>
                            <Input
                                type="number"
                                value={formData.medical}
                                onChange={(e) =>
                                    setFormData({ ...formData, medical: e.target.value })
                                }
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Dearness Allowance (Monthly) (10%)</FormLabel>
                            <Input
                                type="number"
                                value={formData.dearness_allowance}
                                onChange={(e) =>
                                    setFormData({ ...formData, dearness_allowance: e.target.value })
                                }
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Other Allowance (Monthly) (10%)</FormLabel>
                            <Input
                                type="number"
                                value={formData.other_allowance}
                                onChange={(e) =>
                                    setFormData({ ...formData, other_allowance: e.target.value })
                                }
                            />
                        </FormControl>


                        <FormControl>
                            <FormLabel>Petrol Per KM (₹)</FormLabel>
                            <Input
                                type="number"
                                value={formData.petrol_per_km}
                                onChange={(e) =>
                                    setFormData({ ...formData, petrol_per_km: e.target.value })
                                }
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Max KM</FormLabel>
                            <Input
                                type="number"
                                value={formData.max_km}
                                onChange={(e) =>
                                    setFormData({ ...formData, max_km: e.target.value })
                                }
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Min KM</FormLabel>
                            <Input type="number" value={formData.min_km}
                                onChange={(e) => setFormData({ ...formData, min_km: e.target.value })} />
                        </FormControl>

                        <FormControl>
                            <Checkbox isChecked={formData.show_stamp} onChange={(e) => setFormData({ ...formData, show_stamp: e.target.checked })} >
                                <Text fontSize="14px"> Show Company Stamp </Text> <Image src={jsc_stamp} width="97px" />
                            </Checkbox>
                        </FormControl>
                    </SimpleGrid>
                </VStack>
                <VStack>
                    <Button onClick={onOpen} colorScheme="blue" mt="1rem">Show Preview</Button>
                </VStack>

                <EmpJoiningLetterPreview isOpen={isOpen} onClose={onClose} employee={employee} formData={formData} />
            </Box>
        </>
    )
}

export default EmpJoiningLetter