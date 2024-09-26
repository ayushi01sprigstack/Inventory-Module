import React from 'react'
import { Pagination } from 'react-bootstrap';

export default function PaginationComp({ totalItems, itemsPerPage, currentPage, onPageChange }) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalItems <= itemsPerPage) {
        return null;  
    }

    const handlePageChange = (pageNumber) => {
        if (pageNumber !== currentPage) {
            onPageChange(pageNumber);
        }
    };

    const paginationItems = [];
    for (let number = 1; number <= totalPages; number++) {
        paginationItems.push(
            <Pagination.Item
                key={number}
                active={number == currentPage}
                onClick={() => handlePageChange(number)}
            >
                {number}
            </Pagination.Item>,
        );
    }
    return (
        <Pagination>
            <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage == 1}
            />
            {paginationItems}
            <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage == totalPages}
            />
        </Pagination>

    )
}
