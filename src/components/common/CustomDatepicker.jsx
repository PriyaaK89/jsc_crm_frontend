import {
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement
} from "@chakra-ui/react";
import { useRef } from "react";
import { LuCalendar } from "react-icons/lu";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("en-GB");
};

const CustomDatePicker = ({
  label,
  name,
  value,
  onChange,
  placeholder = "Select date",
}) => {

  const hiddenDateRef = useRef(null);

  return (
    <FormControl>
      {label && (
        <FormLabel fontSize="12px" color="#686868">
          {label}
        </FormLabel>
      )}

      <Popover placement="bottom-start">
        <PopoverTrigger>
          <InputGroup>
            <Input
              readOnly
              value={formatDate(value)}
              placeholder={placeholder}
              fontSize="12px"
              cursor="pointer"
              _placeholder={{ fontSize: "12px", color: "gray.400" }}
              onClick={() => hiddenDateRef.current?.showPicker()}
            />

            <InputRightElement pointerEvents="none">
              <LuCalendar />
            </InputRightElement>
          </InputGroup>
        </PopoverTrigger>

        <PopoverContent w="auto">
          <PopoverBody p={2}>
            <Input
              ref={hiddenDateRef}
              type="date"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
            />
          </PopoverBody>
        </PopoverContent>
      </Popover>

    </FormControl>
  );
};

export default CustomDatePicker;