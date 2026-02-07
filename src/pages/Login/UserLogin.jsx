import React, { useState, useContext } from "react";
import {
  Box,
  Flex,
  Image,
  Text,
  Input,
  Button,
  Link,
  useToast,

} from "@chakra-ui/react";
import { Eye, EyeOff } from "lucide-react";
import login_img from "../../assets/crm_login.png";
import API from "../../services/api"; // Axios instance
import { API_ENDPOINTS } from "../../services/endpoints";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function UserLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);
  const toast = useToast()

  const handleLogin = async () => {
    try {
      const response = await API.post(API_ENDPOINTS.LOGIN, { email, password });
      console.log(response.data);
      if(response?.status === 200){
        loginUser(response.data);
        toast({
          description: 'You have Logged in Successfully.',
          status: 'success',
          isClosable: true,
          duration: 2000
        })
        navigate("/dashboard"); 

      }


    } catch (error) {
       console.log(error)
    }
  };

  return (
    <Flex minH="100vh">
      {/* LEFT SIDE IMAGE */}
      <Box flex="1" bg="#ffffff" display={{ base: "none", md: "flex" }} alignItems="center" justifyContent="flex-start">
        <Image src={login_img} alt="CRM Illustration" maxW="93%" />
      </Box>

      {/* RIGHT SIDE LOGIN FORM */}
      <Flex flex="1" alignItems="center" justifyContent="center" px={10}>
        <Box w="100%" maxW="420px">
          <Text fontSize="3xl" fontWeight="bold" color="blue.500" mb={6}>CRM</Text>
          <Text fontSize="sm" color="blue.500" mb={1}>Welcome Back!</Text>
          <Text fontSize="md" mb={6} color="gray.600">Sign in to continue to CRM.</Text>

          {/* EMAIL */}
          <Box mb={4}>
            <Text fontSize="sm" mb={1}>E-mail</Text>
            <Input
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>

          {/* PASSWORD */}
          <Box mb={2}>
            <Flex justify="space-between">
              <Text fontSize="sm">Password</Text>
              <Link fontSize="sm" color="blue.500">Forgot password?</Link>
            </Flex>

            <Box position="relative" mt={1}>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                pr="40px"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Box
                position="absolute"
                top="50%"
                right="12px"
                transform="translateY(-50%)"
                cursor="pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Box>
            </Box>
          </Box>

          {/* LOGIN BUTTON */}
          <Button mt={6} colorScheme="blue" w="100%" size="md" onClick={handleLogin}>
            Login
          </Button>

          <Text mt={10} fontSize="xs" textAlign="center" color="gray.500">
            © CRM. Crafted by Jamidara Seeds Corporation
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
}

export default UserLogin;
