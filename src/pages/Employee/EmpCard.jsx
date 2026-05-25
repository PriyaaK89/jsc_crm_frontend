import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  FormControl,
  FormLabel,
  Select,
  Card,
  CardHeader,
  CardBody,
  Text,
  Spinner,
  Flex
} from "@chakra-ui/react";
import useUsersapi from "../../Apis/GetUsersapi";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const EmpCard = () => {
  const { users } = useUsersapi();

  const [loading, setLoading] = useState(false);

  const [attendanceSummary, setAttendanceSummary] = useState({
    full_days: 0,
    half_days: 0,
    absent_days: 0,
    leave_days: 0,
    total_working_days: 0,
  });

  // ✅ Default month & year set
  const [summaryFilter, setSummaryFilter] = useState({
    userId: "",
    month: 1,
    year: new Date().getFullYear(),
  });

  const months = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  const years = useMemo(() => {
    const arr = [];
    for (let y = 2026; y <= 2080; y++) {
      arr.push(y);
    }
    return arr;
  }, []);

  // ✅ API CALL
  const FetchEmpAttendanceSummary = async () => {
    if (!summaryFilter.userId) return;

    setLoading(true);
    try {
      const res = await API.get(
        `${API_ENDPOINTS.get_Emp_Attendance_Summary}/${summaryFilter.userId}`,
        {
          params: {
            month: summaryFilter.month,
            year: summaryFilter.year,
          },
        }
      );

      if (res.status === 200) {
        setAttendanceSummary({
          full_days: res.data.summary?.full_days ?? 0,
          half_days: res.data.summary?.half_days ?? 0,
          absent_days: res.data.summary?.absent_days ?? 0,
          leave_days: res.data.summary?.leave_days ?? 0,
          total_working_days: res.data.summary?.total_working_days ?? 0,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Trigger API when all selected
  useEffect(() => {
    if (
      summaryFilter.userId !== "" &&
      summaryFilter.month !== "" &&
      summaryFilter.year !== ""
    ) {
      FetchEmpAttendanceSummary();
    }
  }, [summaryFilter]);

  return (
    <Box bg="white" >
      <Heading size="md" mb={2}>
        Employee Attendance Summary Report
      </Heading>

      {/* Filters */}
      <SimpleGrid columns={{ base: 1, md: 3,}} spacing={4} mb={6}>
        {/* Employee */}
        <FormControl>
          <FormLabel>Employee List</FormLabel>
          <Select
            placeholder="Select Employee"
            value={summaryFilter.userId}
            onChange={(e) =>
              setSummaryFilter({
                ...summaryFilter,
                userId: e.target.value,
              })
            }
          >
            {users?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* Month */}
        <FormControl>
          <FormLabel>Month</FormLabel>
          <Select
            value={summaryFilter.month}
            onChange={(e) =>
              setSummaryFilter({
                ...summaryFilter,
                month: Number(e.target.value),
              })
            }
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* Year */}
        <FormControl>
          <FormLabel>Year</FormLabel>
          <Select
            value={summaryFilter.year}
            onChange={(e) =>
              setSummaryFilter({
                ...summaryFilter,
                year: Number(e.target.value),
              })
            }
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </FormControl>
      </SimpleGrid>

      {/* Loader */}
      {loading ? (
        <Flex justify="center" py={10}>
          <Spinner />
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 3, lg:5 }} spacing={4}>
          <Card><CardHeader bg="green.100" py={1}><Heading size="sm">Full Days</Heading></CardHeader><CardBody><Text fontSize="sm">{attendanceSummary.full_days}</Text></CardBody></Card>
          <Card><CardHeader bg="blue.100" py={1}><Heading size="sm">Half Days</Heading></CardHeader><CardBody><Text fontSize="sm">{attendanceSummary.half_days}</Text></CardBody></Card>
          <Card><CardHeader bg="orange.100" py={1}><Heading size="sm" >Absent</Heading></CardHeader><CardBody><Text fontSize="sm">{attendanceSummary.absent_days}</Text></CardBody></Card>
          <Card><CardHeader bg="purple.100" py={1}><Heading size="sm" >Leave Days</Heading></CardHeader><CardBody><Text fontSize="sm">{attendanceSummary.leave_days}</Text></CardBody></Card>
          <Card><CardHeader bg="yellow.100" py={1}><Heading size="sm" >Total Working Days</Heading></CardHeader><CardBody><Text fontSize="sm">{attendanceSummary.total_working_days}</Text></CardBody></Card>
        </SimpleGrid>
      )}
    </Box>
  );
};

export default EmpCard;