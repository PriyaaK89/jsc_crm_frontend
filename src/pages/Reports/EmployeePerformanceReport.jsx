import React, { useState } from "react";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,Select,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  HStack,
  SimpleGrid,
  List,
  ListItem
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import useUsersapi from "../../Apis/GetUsersapi";
import { Link } from "react-router-dom";

function EmployeePerformanceReport() {

  const { users  } = useUsersapi();

  const [search, setSearch] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    const result = users.filter((emp) =>
      emp.name.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredEmployees(result);
  };

  const handleSelect = (name) => {
    setSearch(name);
    setFilteredEmployees([]);
  };

  return (
     <Box
         bg="white"
         mt={{base:2, md:5}}
         px={{base:3, md:6}}
         py={{base:3, md:4}}
        borderRadius="lg"
        boxShadow="md"
     >
      <Breadcrumb mb={6} fontSize="sm">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/dashboard">
            <GoHomeFill color="#5570F1" size={20} />
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Employee Performance Report</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Heading size="md" mb={6}>
        View Performance Report
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>

        <FormControl>
          <FormLabel>Select Employee</FormLabel>

          <Input
            placeholder="Search employee..."
            value={search}
            onChange={handleSearch}
          />

          {filteredEmployees.length > 0 && (
            <Select border="1px solid #ddd" mt={1}>
              {filteredEmployees?.map((emp) => (
                <option
                  key={emp.id}
                  p={2}
                  cursor="pointer"
                  _hover={{ bg: "gray.100" }}
                  onClick={() => handleSelect(emp.name)}
                >
                  {emp.name}
                </option>
              ))}
            </Select>
          )}
        </FormControl>

        <HStack>
          <FormControl>
            <FormLabel>Start Date</FormLabel>
            <Input type="date" />
          </FormControl>

          <FormControl>
            <FormLabel>To Date</FormLabel>
            <Input type="date" />
          </FormControl>
        </HStack>

      </SimpleGrid>

      <Box textAlign="right" mt={6}>
        <Button colorScheme="blue">
          Show
        </Button>
      </Box>
    </Box>
  );
}

export default EmployeePerformanceReport;