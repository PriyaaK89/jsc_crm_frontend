import React, { useEffect, useState } from "react";
import {
  Alert, AlertIcon, Badge, Box, Button, Checkbox, Flex, FormLabel, SimpleGrid, Spinner, Text,
} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

// value    = array of selected assigned-area row ids
// onChange = (ids) => void
// onLoaded = (areas) => void   (parent uses it to know whether this employee has any areas)
const CollectionAreaSelector = ({ employeeId, value, onChange, onLoaded }) => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!employeeId) {
      setAreas([]);
      return;
    }

    let ignore = false; // ignore a slow response if the employee was changed meanwhile

    const load = async () => {
      try {
        setLoading(true);
        setFailed(false);
        const res = await API.get(API_ENDPOINTS.EMPLOYEE_COLLECTION_AREAS(employeeId));
        const list = res?.data?.data || [];
        if (!ignore) {
          setAreas(list);
          onLoaded?.(list);
        }
      } catch (error) {
        console.log(error);
        if (!ignore) {
          setAreas([]);
          setFailed(true);
          onLoaded?.([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  if (!employeeId) return null;

  const allSelected = areas.length > 0 && value.length === areas.length;

  const toggle = (id) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  const toggleAll = () => onChange(allSelected ? [] : areas.map((a) => a.id));

  return (
    <Box border="1px solid" borderColor="gray.200" borderRadius="12px" p={4} bg="white">
      <Flex justify="space-between" align="center" mb={3}>
        <FormLabel m={0}>Collection areas for this target</FormLabel>
        {!loading && !failed && areas.length > 0 && (
          <Flex align="center" gap={3}>
            <Badge colorScheme="blue">
              {value.length} of {areas.length} selected
            </Badge>
            <Button size="xs" variant="outline" onClick={toggleAll}>
              {allSelected ? "Clear all" : "Select all"}
            </Button>
          </Flex>
        )}
      </Flex>

      {loading ? (
        <Spinner size="sm" />
      ) : failed ? (
        <Alert status="error" borderRadius="8px">
          <AlertIcon />
          Could not load the assigned areas.
        </Alert>
      ) : areas.length === 0 ? (
        <Alert status="info" borderRadius="8px">
          <AlertIcon />
          No areas are assigned to this employee, so all of their collection will be counted
          against this target. Areas can be assigned from the Assign Area page.
        </Alert>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacingY={2} spacingX={4}>
            {areas.map((a) => (
              <Checkbox
                key={a.id}
                isChecked={value.includes(a.id)}
                onChange={() => toggle(a.id)}
              >
                {a.label}
              </Checkbox>
            ))}
          </SimpleGrid>
          <Text fontSize="xs" color="gray.500" mt={3}>
            Only collection from customers inside the selected areas counts against this target.
            The selection is saved with the target, so changing the employee's areas later does
            not change it.
          </Text>
        </>
      )}
    </Box>
  );
};

export default CollectionAreaSelector;