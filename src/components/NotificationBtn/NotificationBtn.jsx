import React from 'react'
import { Box, Button } from "@chakra-ui/react"

const NotificationBtn = () => {

    const buttons = [
        { label: "Open MailBox" },
        { label: "Receipt" },
        { label: "Payment" },
        { label: "Debit Note", count: 0 },
        { label: "Credit Note", count:  0 },
        { label: "Sale Order", count: 0 },
        { label: "Purchase Order", count: 0 },
        { label: "Alert", count: 0 },
        { label: "E-Way Bill",count: 0 },
        { label: "Whatsapp", count:0 }
    ];

    return (
        <Box display="flex" justifyContent="end" gap="10px"  flexWrap="wrap" mt={5} margin={5}>

            {buttons.map((btn, i) => (
                <Box key={i} position="relative">

                    {/* Button */}
                    <Button
                      bgGradient="linear(45deg, #325180, #8993b3)"
color="white"
                        transition="all 0.3s ease"
                        _hover={{ bg: "#2e48a0", transform: "scale(1.05)", color:"white" }}
                        variant="outline"
                        borderRadius="lg"
                        fontSize="12px"
                        fontWeight="500"

                    >
                        {btn.label}
                    </Button>

                    {/* Notification Badge */}
                    {btn.count !== undefined && (
                        <Box
                            position="absolute"
                            top="-6px"
                            right="-6px"
                            bg="red.500"
                            color="white"
                            borderRadius="full"
                            fontSize="10px"
                            fontWeight="bold"
                            minW="18px"
                            h="18px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            {btn.count}
                        </Box>
                    )}

                </Box>
            ))}

        </Box>
    )
}

export default NotificationBtn;