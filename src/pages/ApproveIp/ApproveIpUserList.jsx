import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Flex,
  HStack,
  Text,
  Button,
  useDisclosure,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink
} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import ApproveIpRequestModal from "./ApproveIpRequestModal";
import { GoHomeFill } from "react-icons/go";

const ApproveIpUserList = () => {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const { onOpen, onClose, isOpen } = useDisclosure();

  const fetchUserList = async () => {
    try {
      setLoading(true);
      const response = await API.get(API_ENDPOINTS.get_ip_requests);

      if (response.status === 200) {
        setUserList(response.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserList();
  }, []);

  const handleIpRequest = (id) => {
    setUserId(id);
    onOpen();
  };

  return (
    <>
      <ApproveIpRequestModal
        isOpen={isOpen}
        onClose={onClose}
        userId={userId}
        refreshData={fetchUserList}
      />

      <Box bg="white" mt="1rem" p="3" borderRadius="md">
        <HStack justifyContent="space-between" flexWrap="wrap">
          <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">
                <GoHomeFill color="#5570F1" />
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink fontSize="13px">
              
                Request Table
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </HStack>

        <Text fontSize="lg" fontWeight="bold" mb={6}>
          Request Table
        </Text>

        {loading ? (
          <Flex justify="center" align="center" py={8}>
            <Spinner size="md" />
          </Flex>
        ) : (
          <Table
          className="productsTable"

            border="1px solid #cdcdcd"
          >
            <Thead bg="gray.100">
              <Tr>
                <Th>Id</Th>
                <Th>Serial No</Th>
                <Th>Name</Th>
                <Th>IP Address</Th>
                <Th>Is Allowed</Th>
                <Th>Approved At</Th>
                <Th>Created At</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>

            <Tbody>
              {userList.length === 0 ? (
                <Tr>
                  <Td colSpan={8} textAlign="center" py={6} fontWeight="500" >
                    No Data Found
                  </Td>
                </Tr>
              ) : (
                userList.map((user, index) => (
                  <Tr key={index}>
                    <Td py={1}>{user.user_id}</Td>
                    <Td py={1}>{index + 1}</Td>
                    <Td>{user.user_name}</Td>
                    <Td>{user.ip_address}</Td>
                    <Td>{user.is_allowed ? "Yes" : "No"}</Td>
                    <Td>{user.approved_at}</Td>
                    <Td>{user.created_at}</Td>
                    <Td>
                      <Button
                        size="xs"
                        height="22px"
                        fontSize="11px"
                        borderRadius="4px"
                        colorScheme="blue"
                        onClick={() => handleIpRequest(user?.id)}
                      >
                        Approve
                      </Button>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        )}
      </Box>
    </>
  );
};

export default ApproveIpUserList;