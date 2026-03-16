import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  SimpleGrid,
  VStack,
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import useUsersapi from "../../Apis/GetUsersapi";

function PartyTransactionReport() {
  const {users}=useUsersapi();

  return (
   <Box p={6}>

      {/* Breadcrumb */}
      <Breadcrumb mb={6} fontSize="sm">
       <BreadcrumbItem>
                     <BreadcrumbLink href="/dashboard">
                       <GoHomeFill color="#5570F1"  size={20}/>
                     </BreadcrumbLink>
                   </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbLink href="#">Reports</BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Party Transaction Report</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Page Heading */}
      <Heading size="md" mb={6}>
        Party Transaction Report
      </Heading>

      {/* Form Card */}
      <Box
        bg="white"
        p={6}
        borderRadius="md"
        border="1px solid"
        borderColor="gray.200"
      >

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>

          <FormControl>
            <FormLabel>Select Transaction</FormLabel>
            <Select placeholder="--Please Select--">
              <option>Sale</option>
              <option>Purchase</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Select Bills Under Employee</FormLabel>
            <Select placeholder="--Please Select--" >
              {users?.map((emp)=>(
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Select Party</FormLabel>
            <Select placeholder="--Please Select--" />
          </FormControl>

          <FormControl>
            <FormLabel>Enter Voucher No</FormLabel>
            <Input placeholder="Voucher Number" />
          </FormControl>

          <FormControl>
            <FormLabel>Choose Bill</FormLabel>
            <Select placeholder="--Please Select--" />
          </FormControl>

          <FormControl>
            <FormLabel>Select Date</FormLabel>
            <SimpleGrid columns={2} spacing={4}>
              <Input type="date" />
              <Input type="date" />
            </SimpleGrid>
          </FormControl>

        </SimpleGrid>

        {/* Search Button */}
        <Box textAlign="right" mt={6}>
          <Button colorScheme="blue">
            SEARCH
          </Button>
        </Box>

      </Box>
    </Box>
  );
}
 

export default PartyTransactionReport
