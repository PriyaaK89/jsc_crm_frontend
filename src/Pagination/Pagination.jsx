import React from "react";
import { Button, Flex, Select, Text } from "@chakra-ui/react";

const Pagination = ({
  page,
  limit,
  totalItems,
  totalPages,
  onPageChange,
  onLimitChange,
}) => {
  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];

    // If pages are few, show all
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page
    pages.push(1);

    // Show left ellipsis
    if (page > 4) {
      pages.push("left-ellipsis");
    }

    // Show pages around current page
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Show right ellipsis
    if (page < totalPages - 3) {
      pages.push("right-ellipsis");
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  return (
    <Flex justify="space-between" align="center" mt={3} flexWrap="wrap" gap={3}>
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
          onChange={(e) => onLimitChange(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </Select>

        <Flex gap="18px" ml={2}>
          <Text fontSize="14px" color="#A6A8B1">
            Items per page
          </Text>

          <Text fontSize="14px" color="#666">
            {totalItems === 0
              ? "0 of 0"
              : `${(page - 1) * limit + 1}–${Math.min(
                  page * limit,
                  totalItems
                )} of ${totalItems}`}
          </Text>
        </Flex>
      </Flex>

      {/* RIGHT SIDE */}
      <Flex align="center" gap={2}>
        {/* Previous Button */}
        <Button
          size="sm"
          onClick={() => onPageChange(page - 1)}
          isDisabled={page === 1}
        >
          ‹
        </Button>

        {/* Page Numbers */}
        {getPageNumbers().map((item, index) => {
          if (
            item === "left-ellipsis" ||
            item === "right-ellipsis"
          ) {
            return (
              <Text key={index} px={2} fontWeight="bold">
                ...
              </Text>
            );
          }

          return (
            <Button
              key={item}
              fontSize="11px"
              h="29px"
              minW="29px"
              p="4px"
              borderRadius="6px"
              variant={page === item ? "solid" : "outline"}
              colorScheme={page === item ? "blue" : "gray"}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          );
        })}

        {/* Next Button */}
        <Button
          size="sm"
          onClick={() => onPageChange(page + 1)}
          isDisabled={page === totalPages || totalPages === 0}
        >
          ›
        </Button>
      </Flex>
    </Flex>
  );
};

export default Pagination;