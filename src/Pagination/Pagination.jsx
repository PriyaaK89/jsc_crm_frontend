import React from "react";
import { Button, Flex, Select, Text } from "@chakra-ui/react";

const Pagination = ({
  page,
  setPage,
  limit,
  setLimit,
  totalItems,
  totalPages,
}) => {
    console.log( "pg data",  page,
  setPage,
  limit,
  setLimit,
  totalItems,
  totalPages);
  return (
    <Flex justify="space-between" align="center" mt={3}>

      {/* LEFT SIDE */}
      <Flex align="center" gap="4px">
        <Select
          w="69px"
          h="25px"
          size="sm"
          value={limit}
          border="none"
          bg="#5e63661a"
          color="#8B8D97"
          borderRadius="10px"
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </Select>

        <Flex gap="18px" ml={2}>
          <Text fontSize="14px" color="#A6A8B1">Items per page</Text>
          <Text fontSize="14px" color="#666">
            {(page - 1) * limit + 1}–
            {Math.min(page * limit, totalItems)} of {totalItems}
          </Text>
        </Flex>
      </Flex>

      {/* RIGHT SIDE */}
      <Flex align="center" gap={2}>

        {/* Prev */}
        <Button
          size="sm"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          isDisabled={page === 1}
        >
          ‹
        </Button>

        {/* Pages */}
        {Array.from({ length: totalPages }, (_, i) => {
          const pageNumber = i + 1;
          return (
            <Button
              key={pageNumber}
              size="sm"
              variant={page === pageNumber ? "solid" : "outline"}
              colorScheme={page === pageNumber ? "blue" : "gray"}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </Button>
          );
        })}

        {/* Next */}
        <Button
          size="sm"
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          isDisabled={page === totalPages}
        >
          ›
        </Button>

      </Flex>
    </Flex>
  );
};

export default Pagination;