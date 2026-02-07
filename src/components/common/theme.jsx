import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  components: {
    Input: {
      baseStyle: {
        field: {
          _placeholder: {
            fontSize: "13px",
            color: "gray.400",
          },
        },
      },
    },
    Select: {
      baseStyle: {
        field: {
          _placeholder: {
            fontSize: "13px",
            color: "gray.400",
          },
        },
      },
    },
  },
});

export default theme;
