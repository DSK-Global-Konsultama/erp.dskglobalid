import { useState, useEffect } from 'react';

interface UseProjectPaginationProps<T> {
  items: T[];
  initialItemsPerPage?: number;
}

export function useProjectPagination<T>({ 
  items, 
  initialItemsPerPage = 10 
}: UseProjectPaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Reset to page 1 when itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Calculate pagination
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  // Ensure currentPage doesn't exceed totalPages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [items.length, currentPage, itemsPerPage, totalPages]);

  return {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedItems,
    paginatedItemsCount: paginatedItems.length,
    startIndex: startIndex + 1, // 1-based for display
    endIndex: Math.min(endIndex, items.length),
    totalItems: items.length,
  };
}

