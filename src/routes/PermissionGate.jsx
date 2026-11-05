import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button, Center, Spinner, Text, VStack } from "@chakra-ui/react";
import { usePermissions } from "../context/PermissionContext";
import { getRoutePermissions, PUBLIC_PATHS } from "./routePermission";


const PermissionGate = ({ children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { loading, can } = usePermissions();

  if (PUBLIC_PATHS.includes(pathname)) return children;

  const token = JSON.parse(localStorage.getItem("auth") || "null")?.token;
  if (!token) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner />
      </Center>
    );
  }

  const required = getRoutePermissions(pathname);
  if (required === null || !can(required)) {
    return (
      <Center minH="100vh" bg="#f2f1f1" px={5}>
        <VStack spacing={3} textAlign="center">
          <Text fontSize="xl" fontWeight="700">Access denied</Text>
          <Text color="gray.600">You do not have permission to open this page.</Text>
          <Button colorScheme="blue" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </VStack>
      </Center>
    );
  }

  return children;
};

export default PermissionGate;