import { useState, useMemo } from 'react';

export const usePagination = (data, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);

  // Ensure current page is valid when data changes
  const validCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));

  const currentData = useMemo(() => {
    const begin = (validCurrentPage - 1) * itemsPerPage;
    const end = begin + itemsPerPage;
    return (data || []).slice(begin, end);
  }, [validCurrentPage, itemsPerPage, data]);

  const next = () => {
    setCurrentPage(current => Math.min(current + 1, totalPages));
  };

  const prev = () => {
    setCurrentPage(current => Math.max(current - 1, 1));
  };

  const jump = (page) => {
    const pageNumber = Math.max(1, page);
    setCurrentPage(Math.min(pageNumber, totalPages));
  };

  return { next, prev, jump, currentData, currentPage: validCurrentPage, totalPages };
};
