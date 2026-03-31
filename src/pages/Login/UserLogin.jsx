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
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { Eye, EyeOff } from "lucide-react";
import login_img from "../../assets/crm_login.png"; 
import logoRemovebgPreview from "../../assets/images/logo-removebg-preview.png"; 
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function UserLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);
  const toast = useToast();

  const handleLogin = async () => {
    try {
      const response = await API.post(API_ENDPOINTS.LOGIN, { email, password });
      if (response?.status === 200) {
        loginUser(response.data);
        toast({
          description: "Logged in Successfully.",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        description: error?.response?.data?.message || "Login failed.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex direction={{ base: "column", md: "row" }} minH="100vh" w="100%" bg="white" overflow="hidden">
      
      {/* --- MOBILE VIEW (base) --- */}
      <Box 
        display={{ base: "block", md: "none" }} 
        position="relative" 
        w="100vw" 
        h="100vh"
        bg="gray.100" 
      >
        {/* Full Background Image - No Cutting */}
        <Image 
          src={login_img} 
          w="100%" 
          h="100%" 
          objectFit="fit" 
        />
        <Box textAlign="center">
            <Text fontSize="xs" color="white" fontWeight="bold" mb={2} textShadow="1px 1px 2px black">
              Welcome Back!
            </Text>
        
        {/* Form Overlay - Positioned exactly over the computer screen area */}
        <Box 
          position="absolute" 
          top="82%"   // Adjust this percentage (70% - 75%) to align with the computer screen
          left="50%" 
          transform="translate(-50%, -50%)" 
          w="100%"     // Width adjusted to fit inside the computer frame
          maxW="400px"
          zIndex={10}
        >
          
            
            <Input 
              placeholder="Enter email" 
              size="xs" 
              h="32px"
              bg="white" 
              borderRadius="4px"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              width={{base:"70%", md:"100%"}}

            />

            <InputGroup size="xs" mt={2} w={{base:"70%", md:"100%"}} left="50px" top="20px">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                size="xs"
                h="32px"
                bg="white"
                borderRadius="4px"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement h="32px" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </InputRightElement>
            </InputGroup>

            <Button
            marginY={10}
            w={{base:"70%", md:"100%"}}
              colorScheme="blue"
              h="32px"
              fontSize="xs"
              onClick={handleLogin}
            >
              Login
            </Button>
            
            <Text color={{base:"white", md:"blue.600"}} textShadow="1px 1px 2px black" fontSize={{base:"10px", md:"xs"}} fontWeight="bold">
               © Jamidara Seeds Corporation
            </Text>
          </Box>
        </Box>
      </Box>

      {/* --- DESKTOP VIEW (md) --- */} 
      {/* Left side Image */}
      <Flex display={{ base: "none", md: "flex" }} flex="1.2">
        <Image src={login_img} w="100%" h="100vh" objectFit="cover" />
      </Flex>

      {/* Right side Form */}
      <Flex 
        display={{ base: "none", md: "flex" }} 
        flex="1" 
        align="center" 
        justify="center" 
        p={10}
        bg="white"
      >
        <Box w="100%" maxW="400px">
          {/* Logo only on Desktop Form for professional look */}
          <Image src={logoRemovebgPreview} maxW="150px" mx="auto" mb={10} />
          
          <Text fontSize="2xl" fontWeight="bold" color="blue.600" mb={1}>Welcome Back!</Text>
          <Text fontSize="md" color="gray.500" mb={8}>Sign in to continue to CRM.</Text>
          
          <Box textAlign="left">
            <Text mb={1} fontWeight="500" fontSize="sm">E-mail</Text>
            <Input mb={4} placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
            
            <Flex justify="space-between" mb={1}>
              <Text fontWeight="500" fontSize="sm">Password</Text>
              <Link fontSize="xs" color="blue.500">Forgot password?</Link>
            </Flex>
            <InputGroup mb={6}>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement h="100%" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </InputRightElement>
            </InputGroup>
            
            <Button colorScheme="blue" w="100%" h="48px" onClick={handleLogin}>
              Login
            </Button>
          </Box>

          <Text mt={12} fontSize="xs" color="gray.400" textAlign="center">
            © CRM. Crafted by Jamidara Seeds Corporation
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
}

export default UserLogin;