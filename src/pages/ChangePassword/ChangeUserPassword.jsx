import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  SimpleGrid,
  useToast,
} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";


const ChangePassword = () => {
  const location = useLocation();
  const toast = useToast();
  const nav = useNavigate()

  const userId = location?.state?.userId;
  const mail = location?.state?.email;

  const [password, setPassword] = useState("");

  const handleChangePassword = async()=>{
    if (!password ) {
      toast({
        title: "All fields are required",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try{
           const response = await API.post(`${API_ENDPOINTS?.change_password}/${userId}`,{
            password: password
           },{
           })
           if(response?.status === 200){
                toast({
                    description: "Password Set successfully.",
                    duration: 2000,
                    status: "success",
                    isClosable: true
                })
                setTimeout(()=>{

                  nav("/hr-mgmt/view-employee-list")
                },1500)
           }
    }catch(error){
        toast({
        description: "Something went wrong, Please try again!",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
        console.log(error, "Error")
    }
  }



  return (
    <Box

      display="flex"
      alignItems="flex-start"
      justifyContent="center" >
      <Box
        bg="white"
        p={8}
        rounded="md"
        w="100%"
      >
        <Heading size="md" textAlign="center" mb={6}  lineHeight="1.4">
          Change Password
        </Heading>

       <SimpleGrid columns={{ base: 1, md: 1 }} spacing={5}>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={mail || ""}
              isReadOnly
              bg="gray.50"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
           </SimpleGrid>



 <Box textAlign="center" mt={8}>
            <Button w={{ base: "100%", md: "200px" }} colorScheme="blue"  onClick={handleChangePassword}> Change Password</Button>
          </Box>
      

       
      </Box>
    </Box>
  );
};

export default ChangePassword;
