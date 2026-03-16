import React, { useContext, useState,useEffect} from "react";
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
  Select, InputGroup,
  InputRightElement,
  IconButton
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import useUserapi    from '../../Apis/GetUsersapi'


const ChangePassword = () => {
  const {users,fetchUsers}=useUserapi();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
const [selectedUserId, setSelectedUserId] = useState("");
// const [users, setUsers] = useState([]);

  const location = useLocation();
  const toast = useToast();
  const nav = useNavigate()

  const userId = location?.state?.userId;
  const mail = location?.state?.email;
   
// if gmail doesnot recive form probes  
//  const fetchEmployeeList = async () => {
//     try {
//       const response = await API.get(API_ENDPOINTS.GET_USERS);
//       if (response?.status === 200) {
//         setUsers(response.data.data || []);
//       }
//     } catch (error) {
//       toast({
//         title: "Failed to load employees",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     }
//   };

  useEffect(() => {
  if (!mail) {
   fetchUsers();
  }
}, [mail]);

  // handle passwoerd view 

  const togglePassword = () => {
  setShowPassword(!showPassword);
};
// hande password change function
  const handleChangePassword = async () => {

  // const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[1-9])/;
  // const passwordRegex= password;

  if (!password) {
    toast({
      title: "Password is required",
      status: "warning",
      duration: 2000,
      isClosable: true,
    });
    return;
  }

  // if (!passwordRegex.test(password)) {
  // if(!)
  //   toast({
  //     title: "Password must contain one uppercase letter and one special character  eg ",
  //     status: "warning",
  //     duration: 3000,
  //     isClosable: true,
  //   });
  //   return;
  // }

    try{   
      const finalUserId = userId || selectedUserId;
           const response = await API.post(`${API_ENDPOINTS?.change_password}/${finalUserId}`,{
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
          {mail ? (
  <FormControl>
    <FormLabel>Email</FormLabel>
    <Input
      type="email"
      value={mail}
      isReadOnly
      bg="gray.50"
    />
  </FormControl>
) : (
  <FormControl isRequired>
    <FormLabel>Select User</FormLabel>
    <Select
      placeholder="Select User"
      value={selectedUserId}
      onChange={(e) => setSelectedUserId(e.target.value)}
    >
      {users?.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name}
        </option>
      ))}
    </Select>
  </FormControl>
)}

          {/* <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl> */}
          <FormControl isRequired>
  <FormLabel>Password</FormLabel>

  <InputGroup>
    <Input
      type={showPassword ? "text" : "password"}
      placeholder="Enter new password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />

    <InputRightElement>
      <IconButton
        variant="ghost"
        aria-label="Toggle Password"
        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
        onClick={togglePassword}
      />
    </InputRightElement>
  </InputGroup>

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
