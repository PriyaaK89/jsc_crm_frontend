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
        const profileRes = await API.get(API_ENDPOINTS.auth_my_profile);
        console.log("Profile Data:", profileRes.data);

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
    <Flex
      direction={{ base: "column", md: "row" }}
      minH="100dvh"
      w="100%"
      bg="white"
      overflow="hidden"
    >
      {/* --- MOBILE VIEW --- */}
      <Box
        display={{ base: "block", md: "none" }}
        position="relative"
        w="100vw"
        h="100dvh"   //  FIXED
        bg="gray.100"
        overflow="hidden"
      >
        {/* Background Image */}
        <Image src={login_img} w="100%" h="100%" objectFit="fit" />

        {/* Title */}
        <Text
          position="absolute"
          top="20px"
          left="20px"
          fontSize="sm"
          color="white"
          fontWeight="bold"
          textShadow="1px 1px 2px black"
        >
          Welcome Back!
        </Text>

        {/* Overlay Form */}
        <Box
          position="absolute"
          bottom="30px"   //  FIXED
          left="50%"
          transform="translateX(-50%)"
          w="100%"
          maxW="400px"
          px={4}
          zIndex={10}
        >
          <Box textAlign="center">
            {/* Email */}
            <Input
              placeholder="Enter email"
              size="sm"
              h="40px"
              bg="white"
              borderRadius="6px"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              mb={4}
            />

            {/* Password */}
            <InputGroup size="sm" mb={4}>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                h="40px"
                bg="white"
                borderRadius="6px"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement
                h="40px"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </InputRightElement>
            </InputGroup>

            {/* Button */}
            <Button
              w="100%"
              colorScheme="blue"
              h="40px"
              fontSize="sm"
              onClick={handleLogin}
              mb={3}
            >
              Login
            </Button>

            {/* Footer */}
            <Text
              color="white"
              textShadow="1px 1px 2px black"
              fontSize="10px"
              fontWeight="bold"
            >
              © Jamidara Seeds Corporation
            </Text>
          </Box>
        </Box>
      </Box>

      {/* --- DESKTOP VIEW --- */}
      <Flex display={{ base: "none", md: "flex" }} flex="1" bg="#ffff" align="center" justify="flex-start">
        <Image src={login_img} alt="CRM Illustration" maxW="93%" />
      </Flex>

      <Flex
        display={{ base: "none", md: "flex" }}
        flex="1"
        align="center"
        justify="center"
        p={10}
        bg="white" onKeyDown={(e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  }}
      >
        <Box w="100%" maxW="400px">
          <Image
            src={logoRemovebgPreview}
            maxW="150px"
            mx="auto"
            mb={10}
          />

          <Text fontSize="2xl" fontWeight="bold" color="blue.600" mb={1}>
            Welcome Back!
          </Text>
          <Text fontSize="md" color="gray.500" mb={8}>
            Sign in to continue to CRM.
          </Text>

          <Box textAlign="left">
            <Text mb={1} fontWeight="500" fontSize="sm">
              E-mail
            </Text>
            <Input
              mb={4}
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Flex justify="space-between" mb={1}>
              <Text fontWeight="500" fontSize="sm">
                Password
              </Text>
              <Link fontSize="xs" color="blue.500">
                Forgot password?
              </Link>
            </Flex>

            <InputGroup mb={6}>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement
                h="100%"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </InputRightElement>
            </InputGroup>

            <Button
              colorScheme="blue"
              w="100%"
              h="48px"
              onClick={handleLogin} onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            >
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