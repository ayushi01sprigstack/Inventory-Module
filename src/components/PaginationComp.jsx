import React from 'react'
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import '../styles/pagination.css'

export default function PaginationComp({currentPage, totalItems, pageSize, onChange}) {
    return (
        <Pagination
            current={currentPage} // The current page
            total={totalItems}    // Total number of items
            pageSize={pageSize}   // Number of items per page
            onChange={onChange}   // Callback function when page changes
        />
    )
}
