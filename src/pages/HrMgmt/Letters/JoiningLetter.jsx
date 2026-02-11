import { Box, Button, Flex, FormControl, FormLabel, Heading, Input, Select, SimpleGrid, Spinner, useDisclosure, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import EmpJoiningLetterPreview from "./EmpJoiningLetterPreview";
import CustomDatePicker from "../../../components/common/CustomDatepicker";

const EmpJoiningLetter = () => {
    const { id } = useParams();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectEmpId, setSelectedEmpId] = useState('')

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
         petrol_per_km: "",
  max_km: "",
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
  <FormLabel>Basic (Monthly)</FormLabel>
  <Input
    type="number"
    value={formData.basic}
    onChange={(e) =>
      setFormData({ ...formData, basic: e.target.value })
    }
  />
</FormControl>

<FormControl>
  <FormLabel>House Rent (Monthly)</FormLabel>
  <Input
    type="number"
    value={formData.house_rent}
    onChange={(e) =>
      setFormData({ ...formData, house_rent: e.target.value })
    }
  />
</FormControl>

<FormControl>
  <FormLabel>Medical Reimbursement (Monthly)</FormLabel>
  <Input
    type="number"
    value={formData.medical}
    onChange={(e) =>
      setFormData({ ...formData, medical: e.target.value })
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



                    </SimpleGrid>
                </VStack>
                <VStack>
                    <Button onClick={onOpen} colorScheme="blue" mt="1rem">Generate Joining Letter</Button>
                </VStack>

                <EmpJoiningLetterPreview isOpen={isOpen} onClose={onClose} employee={employee} formData={formData} />
            </Box>
        </>
    )
}

export default EmpJoiningLetter