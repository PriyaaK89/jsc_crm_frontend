import React from "react";
import { Box, Text } from "@chakra-ui/react";

const CustomeAvater = React.forwardRef(({ name, src, size = "40px", ...props }, ref) => {
  const initials = name
    ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <Box
      ref={ref}
      w={size}
      h={size}
      borderRadius="50%"
      overflow="hidden"
      bg="gray.200"
      display="flex"
      alignItems="center"
      justifyContent="center"
      cursor="pointer"   // ✅ pointer add
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <Text fontSize="sm" fontWeight="bold" color="gray.600">
          {initials}
        </Text>
      )}
    </Box>
  );
});

export default CustomeAvater;
