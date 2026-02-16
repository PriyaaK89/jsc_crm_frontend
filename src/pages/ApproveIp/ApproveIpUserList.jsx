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
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import ApproveIpRequestModal from "./ApproveIpRequestModal";

const ApproveIpUserList = () => {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const {onOpen, onClose, isOpen} = useDisclosure()

  const fetchUserList = async () => {
    try {
      setLoading(true);
      const response = await API.get(API_ENDPOINTS.get_ip_requests);
      console.log("response", response);

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

  const handleIpRequest = (id) =>{
      onOpen();
      setUserId(id)
  }

  return (
    <>
    <ApproveIpRequestModal isOpen={isOpen} onClose={onClose} userId={userId}  />
    <Box bg="white" mt="1rem" p="4" borderRadius="md">
      {loading ? (
        <Flex justify="center" align="center" py={10}>
          <Spinner size="lg" />
        </Flex>
      ) : (
        <Table variant="striped" colorScheme="gray" size="sm">
          <Thead>
            <Tr>
              <Th>Id</Th>
              <Th>Name</Th>
              <Th>IP Address</Th>
              <Th>Is Allowed</Th>
              <Th>Approved By</Th>
              <Th>Approved At</Th>
              <Th>Created At</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {userList.map((user, index) => (
              <Tr key={index}>
                <Td>{user.user_id}</Td>
                <Td>{user.user_name}</Td>
                <Td>{user.ip_address}</Td>
                <Td>{user.is_allowed ? "Yes" : "No"}</Td>
                <Td>{user.approved_at}</Td>
                <Td>{user.approved_at}</Td>
                <Td>{user.created_at}</Td>
                <Td>
                  <Button fontSize="12px" borderRadius="4px" colorScheme="blue" onClick={()=>
                  {
                    handleIpRequest(user?.id)
                  }}>Approve Ip</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
        </>

  );
};

export default ApproveIpUserList;
