import React from 'react'
import { Flex, Box, HStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Text } from "@chakra-ui/react";
import { Link, useParams } from 'react-router-dom';
import { GoHomeFill } from 'react-icons/go';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import MobileTopbar from '../../components/layout/MobileTopbar';
import NotificationBtn from '../../components/NotificationBtn/NotificationBtn';
import ViewDemoRequestDetail from './ViewDemoRequestDetail';

const ViewDemoRequestLayout = () => {

    const {id} = useParams();
    console.log(id, "request id")

    return (
        <Box bg="#f2f1f1" minH="100vh" >
            <Box display={{ base: "none", md: "block" }}> <Sidebar /> </Box>
            <Box display={{ base: "none", md: "block" }}> <Topbar /> </Box>
            <Box display={{ base: "block", md: "none" }}> <MobileTopbar /> </Box>
            <Box ml={{ base: 5, md: "295px" }} mr={{ base: 5, md: 5 }} pt="5rem" pb={6} >
                <NotificationBtn />
                <Box bg="white"
                    mt={{ base: 2, md: 5 }}
                    px={{ base: 3, md: 6 }}
                    py={{ base: 3, md: 4 }}
                    borderRadius="lg" boxShadow="md">
                    <HStack justifyContent="space-between" >
                        <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
                            <BreadcrumbItem>
                                <BreadcrumbLink as={Link} to="/dashboard">
                                    <GoHomeFill color="#5570F1" />
                                </BreadcrumbLink>
                            </BreadcrumbItem>

                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink fontSize="13px">
                                   Demo Request
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </HStack>
                 <ViewDemoRequestDetail/>
                </Box>
            </Box>
        </Box>
    )
}

export default ViewDemoRequestLayout;