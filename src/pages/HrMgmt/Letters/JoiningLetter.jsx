import { Box, Button, Flex, FormControl, FormLabel, Heading, Input, Select, Spinner, useDisclosure } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import EmpJoiningLetterPreview from "./EmpJoiningLetterPreview";

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
        appointer_state: ""
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
            <Button onClick={onOpen}>Generate Joining Letter</Button>
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

                        setFormData((prev) => ({
                            ...prev,
                            appoint_under: selectedId
                        }));

                        fetchEmployeeDetails(selectedId);   //  Call API here
                    }}
                >
                    {empList?.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                            {emp.name}
                        </option>
                    ))}
                </Select>
            </FormControl>
            <FormControl mt={4}>
                <FormLabel>Department Name</FormLabel>
                <Input
                    value={formData.department_name}
                    isReadOnly
                />
            </FormControl>

            <FormControl mt={4}>
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


            <EmpJoiningLetterPreview isOpen={isOpen} onClose={onClose} employee={employee} formData={formData} />
</Box>
        </>
    )
}

export default EmpJoiningLetter