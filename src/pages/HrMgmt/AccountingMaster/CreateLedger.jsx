import { Flex, FormControl,FormLabel,Input } from "@chakra-ui/react";
import { Select } from '@chakra-ui/react'
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack,VStack,Heading,Button,SimpleGrid} from "@chakra-ui/react";
import React, { useState } from "react";
import { GoHomeFill } from "react-icons/go";
import CreateLedgerBankAccount from "../../../components/Accountingmastercomponents/CreateLedgercomponents/CreateLedgerBankAccount";
import CreateLedgerActivationIntersetcalcuation from "../../../components/Accountingmastercomponents/CreateLedgercomponents/CreateLedgerActivationIntersetcalcuation";
import CreateLedgerMillingDetails from "../../../components/Accountingmastercomponents/CreateLedgercomponents/CreateLedgerMillingDetails";
import CreateLedgerbankconfi from '../../../components/Accountingmastercomponents/CreateLedgercomponents/CreateLedgerbankconfi';
import CreateLedgerGst from "../../../components/Accountingmastercomponents/CreateLedgercomponents/CreateLedgerGst";
import CreateLedgerSundrydr_cr from "../../../components/Accountingmastercomponents/CreateLedgerSundrydr_cr";




const CreateLedger = () => {


        const [SelectGroup, setSelectGroup] = useState("");

    //  checks  where these fields open   
        const Actvationintersetcal = ["Bank_Account", "Capital_account","Bank_occ_a_c","Bank_od_a_c"
        ,"Branch_Division","Cash_in_hand","Current_assets","Current_liabilities","Deposit_assets","Investment"
        ,"Loans_liabilities","Misc_expense_assets","Provision","Reserve_surplus","Retained_earning","Loans_advances_assets"
        ,"Secured_loans","stock_in_hand","Sundry_creditors","Sundry_debtors","Suspense_account","Unsecured_Loans"].includes(SelectGroup);
        const bankacountdetails =["Bank_Account","Bank_occ_a_c","Bank_od_a_c"].includes(SelectGroup);
        const bankconfegration=["Bank_Account", "Capital_account","Bank_occ_a_c","Bank_od_a_c"
        ,"Branch_Division","Cash_in_hand"].includes(SelectGroup);
         const Gst_un_Panno=[ "Capital_account"
        ,"Branch_Division","Cash_in_hand","Current_assets","Current_liabilities","Deposit_assets","Investment"
        ,"Loans_liabilities","Misc_expense_assets","Provision","Reserve_surplus","Retained_earning","Loans_advances_assets"
        ,"Secured_loans","stock_in_hand","Sundry_creditors","Sundry_debtors","Suspense_account","Unsecured_Loans"].includes(SelectGroup);
        const OnlyGst=["Bank_Account","Bank_occ_a_c","Bank_od_a_c"].includes(SelectGroup);
        const InventryValuesEffect=["Branch_Division","Capital_account","Current_assets","Current_liabilities",
         "Deposit_assets","Investment","Loans_advances_assets","Loans_liabilities","Misc_expense_assets","Provision"
         ,"Reserve_surplus","Retained_earning","Secured_loans","stock_in_hand","Suspense_account","Unsecured_Loans"
        ].includes(SelectGroup);
          const UseforPayroll=["Current_assets","Current_liabilities","Provision","Loans_advances_assets"].includes(SelectGroup);
         const Sundrycr_dr=["Sundry_debtors","Sundry_creditors"].includes(SelectGroup);
         const SetOdLimit=["Bank_occ_a_c","Bank_od_a_c"].includes(SelectGroup);
//    ..................custom style .............
       const labelStyles = {
        fontSize: "12px",
        color: "#686868",
        marginBottom: "3px",
        };


    return (
    <Box w="100%" bg="white" p={6} borderRadius="lg" >
                <HStack justifyContent='space-between'>
                      <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
                        <BreadcrumbItem>
                          <BreadcrumbLink href='/dashboard'><GoHomeFill color="#5570F1" /> </BreadcrumbLink>
                        </BreadcrumbItem>
            
                        <BreadcrumbItem>
                          <BreadcrumbLink href='/accounting-master/create-ledger' color='#8B8D97' fontSize='13px'>Create Ledger</BreadcrumbLink>
                        </BreadcrumbItem>
                      </Breadcrumb>
                    </HStack>
                
       
                <Heading size="lg" textAlign="center" mb={6} lineHeight="1.5">  Create Ledger</Heading>
                <Box as="form" >
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                    
                <FormControl>
               <FormLabel>Ledger Name </FormLabel>
              <Input type='ledger name' placeholder=" Name Ledger Name" />
              </FormControl>

      <FormControl isRequired>
     <FormLabel {...labelStyles} >Select Group</FormLabel>
    <Select placeholder='Select Any One' fontSize="14px" onChange={(e) => setSelectGroup(e.target.value)}>
     <option  value='Bank_Account' >Bank Account</option>
    <option  value="Bank_occ_a_c" >Bank occ a/c</option>
    <option  value="Bank_od_a_c" >Bank od a/c </option>
    <option  value="Branch_Division" >Branch/Division</option>
    <option  value="Capital_account" >Capital account</option>
    <option  value="Cash_in_hand" >Cash in hand</option>
    <option  value="Current_assets" >Current assets</option>
    <option  value="Current_liabilities" >Current liabilities</option>
    <option  value="Deposit_assets" >Deposit(assets)</option>
    <option  value="Duties_taxes" >Duties &amp; taxes</option>
    <option  value="Expense_indirect" >Expense(indirect)</option>
    <option  value="Expense_direct" >Expense(direct)</option>
    <option  value="Fixed_assets" >Fixed assets</option>
    <option  value="Income_indirect" >Income(indirect)</option>
    <option  value="Income_direct" >Income(direct)</option>
    <option  value="Investment" >Investment</option>
    <option  value="Loans_advances_assets" >Loans &amp; advances(assets)</option>
    <option  value="Loans_liabilities" >Loans(liabilities)</option>
    <option  value="Misc_expense_assets" >Misc. expense(assets)</option>
    <option  value="Provision" >Provision</option>
    <option  value="Purchase_account" >Purchase account</option>
    <option  value="Sales_account" >Sales account</option>
    <option  value="Reserve_surplus" >Reserves &amp; surplus</option>
    <option  value="Retained_earning" >Retained earning</option> 
    <option  value="Secured_loans" >Secured loans</option>      
    <option  value="stock_in_hand" >stock in hand</option>         
    <option  value="Sundry_creditors" >Sundry creditors</option> 
    <option  value="Sundry_debtors" >Sundry debtors</option>
    <option  value="Suspense_account" >Suspense account</option>
    <option  value="Unsecured_Loans" >Unsecured Loans</option>
    <option  value="employess" >Employees</option>
    <option  value="salary" >Salary</option>
    </Select>
    </FormControl>
    </SimpleGrid>
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
    <FormControl isRequired mt={5}> 
    <FormLabel {...labelStyles}>Employee Under</FormLabel>
    <Select name="employeeUnder" fontSize="14px">
    <option value="-1">Select Employee Name</option>
    <option value="VIKASKUMAR">VIKASKUMAR</option>
    <option value="RAJDEEPSINGH">RAJDEEPSINGH</option>
    <option value="VIKASSINGH">VIKASSINGH</option>
   </Select>
   </FormControl>

  {/* activation interset calculation  */}
  {Actvationintersetcal && (
  <CreateLedgerActivationIntersetcalcuation/>
  )}
  </SimpleGrid>
  {/* invertory values are affectd  */}
  {InventryValuesEffect &&(
  <FormControl isRequired mt={5}> 
  <FormLabel {...labelStyles}>Inventory values are affected</FormLabel>
  <Select name="inventryvalues" fontSize="14px">
  <option value="yes">Yes</option>
  <option value="no">No</option>
  </Select>
 </FormControl>
    
)}
{/* use for payroll  */}
{UseforPayroll && (
   <FormControl isRequired mt={5}> 
                <FormLabel {...labelStyles}>Use for payroll</FormLabel>
               <Select name="usepayroll" fontSize="14px">
              <option value="yes">Yes</option>
            <option value="no">No</option>
            </Select>
 </FormControl>

)}
{/* set od limit  */}
{SetOdLimit && (
   <FormControl isRequired mt={5}> 
                <FormLabel {...labelStyles}>Set OD limit</FormLabel>
               <Input placeholder="set od limit"/>
 </FormControl>

)}

{/* sundry cr/dr  */}
{Sundrycr_dr &&(
  <CreateLedgerSundrydr_cr/>
)}
  
{/* if bank acount details */}
{bankacountdetails && (
   <CreateLedgerBankAccount/>
 )}
 {/* bank confre */}
 {bankconfegration &&(
    <CreateLedgerbankconfi/>
 )}
{/* milling details */}
<CreateLedgerMillingDetails/>

{/* gstin un no  */}
   {Gst_un_Panno  && ( <CreateLedgerGst/>)}
   {OnlyGst && (
  <Box w="100%"   borderRadius="lg" mt={5}  border="1px" >
  <HStack justifyContent='space-between'  bg="#e9f2ff" borderBottom="1px solid #d9e5f8" p={1} pl={6}>
  <Breadcrumb  padding='10px 0px 1rem 0px' >
  <BreadcrumbItem>
  <BreadcrumbLink  color='#000000' size="lg" >Tax Registration Details :</BreadcrumbLink>
  </BreadcrumbItem>
  </Breadcrumb>
  </HStack>
    
    <FormControl isRequired p={5} >
     <FormLabel {...labelStyles}>GSTIN/UN</FormLabel>
      <Input/>
      </FormControl>
      </Box>
     
)}
  {/* date  current blancr and cr/dr  */}
   <Box w="100%" bg="#fffdfd"  borderRadius="lg" border="1px" mt={5}>
             <FormControl isRequired mt={5} p={3}>
              
         <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
                  <FormControl isRequired >
                      <FormLabel {...labelStyles} >Select Month</FormLabel>
                                   <Input type="date" name="month"  />
                    </FormControl>   

                   
                   <FormControl isRequired >
                       <FormLabel {...labelStyles} >
                       Current Balance
                      </FormLabel>
                      <Input placeholder="Enter current Balance" />
                      </FormControl>  

                  <FormControl isRequired >
                    <FormLabel {...labelStyles} >CR/DR
                    <Select name="cr_dr" fontSize="14px">
                         <option value="cr">Cr</option>
                          <option value="dr">DR</option>
                    </Select>
                    </FormLabel>
                    </FormControl>              
      </SimpleGrid>
     </FormControl>
   </Box>

           <Box textAlign="center" mt={8}>
            <Button w={{ base: "100%", md: "200px" }} colorScheme="blue"> Create Ledger </Button>
          </Box>
                  
</Box>
</Box>

    );
}   
export default CreateLedger;