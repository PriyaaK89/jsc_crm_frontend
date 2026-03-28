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
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logoRemovebgPreview from "../../assets/images/logo-removebg-preview.png";


function UserLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);
  const toast = useToast();

  const handleLogin = async () => {
    try {
      const response = await API.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });

      if (response?.status === 200) {
        loginUser(response.data);
        toast({
          description: "You have Logged in Successfully.",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        navigate("/dashboard");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";

      toast({
        description: message,
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (

    <Flex direction={{ base: "column", md: "row" }} minH="100vh" bgGradient={{ base: "linear(to-b, #e0f2fe, #f8fafc)", md: "transpart" }} >

      {/* LEFT IMAGE (Desktop only) */}
      <Flex
        display={{ base: "none", md: "flex" }}
        flex="1"
        align="center"
        justify="center"
        // px={{ base: 4, md: 10 }}
        // py={{ base: 2, md: 6 }}
      >
        <Image src={login_img} alt="CRM" maxW="100%" minH="100%" />
      </Flex>

      {/* MOBILE HEADER ( Center Logo) */}
      <Flex
        w="100%"
        h="220px"
        display={{ base: "flex", md: "none" }}
        justify="center"
        align="center"

      >
        <Image
          src={logoRemovebgPreview}
          alt="Logo"
          maxW="150px"
          objectFit="contain"
        />
      </Flex>

      {/* RIGHT LOGIN FORM */}
      <Flex
        flex="1"
        align="center"
        justify="center"
        px={{ base: 4, md: 10 }}
        py={6}
      >
        <Box w="100%" maxW="420px">

          {/* Logo instead of CRM text */}

          <Text fontSize="sm" color="blue.500" mb={1}>
            Welcome Back!
          </Text>

          <Text fontSize="md" mb={6} color="gray.600">
            Sign in to continue to CRM.
          </Text>

          {/* EMAIL */}
          <Box mb={5}>
            <Text fontSize="sm" mb={1}>E-mail</Text>
            <Input
              placeholder="Enter email"
              size="md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>

          {/* PASSWORD */}
          <Box mb={3}>
            <Flex justify="space-between">
              <Text fontSize="sm">Password</Text>
              <Link fontSize="sm" color="blue.500">
                Forgot password?
              </Link>
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
                cursor="pointer" zIndex={11}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Box>
            </Box>
          </Box>

          {/* LOGIN BUTTON */}
          <Button
            mt={6}
            colorScheme="blue"
            w="100%"
            h="45px"
            onClick={handleLogin}
          >
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