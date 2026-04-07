import React from 'react'
// import  { useState, useEffect,useRef } from "react";
import {
  Box,
  Button, Text,
  FormControl,
  FormLabel,
  Input,  InputGroup, Tooltip,
  InputRightElement, IconButton,
  InputLeftElement,
  Flex,
  SimpleGrid, Badge,
  Select,
} from "@chakra-ui/react";
;


function DisBussinessAddressForm({
  formData,
  handleChange,
  errors,
  handlePincodeChange
})   
{
   
  return (
      <Box border="1px" borderColor="gray.900" gridColumn={{ base: "span 1", md: "span 2" }} p={4} borderRadius="lg">
    
                <FormControl mt={3} isInvalid={errors.business_address}>
                  <FormLabel>Business Address</FormLabel>
                  <Input
                    name="business_address"
                    value={formData.business_address || ""}
                    onChange={handleChange}
    
                  />
                  {errors.business_address && (
                    <Text color="red.500" fontSize="sm">
                      {errors.business_address}
                    </Text>
                  )}
    
                </FormControl>
                <FormControl mt={3} isInvalid={errors.business_territory}>
                  <FormLabel>Business Territory</FormLabel>
                  <Input
                    name="business_territory"
                    value={formData.business_territory || ""}
                    onChange={handleChange}
    
                  />
                  {errors.business_territory && (
                    <Text color="red.500" fontSize="sm">
                      {errors.business_territory}
                    </Text>
                  )}
    
                </FormControl>
    
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={5}>
                  <FormControl isInvalid={errors.state}>
                    <FormLabel>State</FormLabel>
                    <Input name="state" value={formData.state || ""} onChange={handleChange} />
                    {errors.state && (
                      <Text color="red.500" fontSize="sm">
                        {errors.state}
                      </Text>
                    )}
                  </FormControl>
    
                  <FormControl isInvalid={errors.district}>
                    <FormLabel>District</FormLabel>
                    <Input name="district" value={formData.district || ""} onChange={handleChange} />
                    {errors.district && (
                      <Text color="red.500" fontSize="sm">
                        {errors.district}
                      </Text>
                    )}
                  </FormControl>
    
                  <FormControl isInvalid={errors.tehsil}>
                    <FormLabel>Tehsil</FormLabel>
                    <Input name="tehsil" value={formData.tehsil || ""} onChange={handleChange} />
                    {errors.tehsil && (
                      <Text color="red.500" fontSize="sm">
                        {errors.tehsil}
                      </Text>
                    )}
                  </FormControl>
                  <FormControl isInvalid={errors.landmark}>
                    <FormLabel>Landmark</FormLabel>
                    <Input name="landmark" value={formData.landmark || ""} onChange={handleChange} />
                    {errors.landmark && (
                      <Text color="red.500" fontSize="sm">
                        {errors.landmark}
                      </Text>
                    )}
                  </FormControl>
    
                  <FormControl isInvalid={errors.pincode}>
                    <FormLabel>Pincode</FormLabel>
                    <Input type="number" name="pincode" value={formData.pincode || ""} onChange={(e) => handlePincodeChange(e.target.value)} />
                    {errors.pincode && (
                      <Text color="red.500" fontSize="sm">
                        {errors.pincode}
                      </Text>
                    )}
                  </FormControl>
                  <FormControl isInvalid={errors.contact_number}>
                    <FormLabel>Contact No(without +91)</FormLabel>
                    <Input
                      type="number"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleChange}
                    // placeholder="Enter Contact No (without +91)"
                    />
                    {errors.contact_number && (
                      <Text color="red.500" fontSize="sm">
                        {errors.contact_number}
                      </Text>
                    )}
                  </FormControl>
                  <FormControl isInvalid={errors.alt_contact_number}>
                    <FormLabel> Alt. Contact No</FormLabel>
                    <Input type="number"
                      name="alt_contact_number"
                      value={formData.alt_contact_number}
                      onChange={handleChange}
                    // placeholder="Enter Alternative Contact No (without +91)"
                    />
                    {errors.alt_contact_number && (
                      <Text color="red.500" fontSize="sm">
                        {errors.alt_contact_number}
                      </Text>
                    )}
                  </FormControl>
                </SimpleGrid>
              </Box>
  )
}

export default DisBussinessAddressForm
