import React from 'react'

export default function UtliizationHistory({ usageHistoryDetails, poDetails, setShowUtilizationHistory }) {
    return (
        <>
            <p className='commonColor fw-semibold'>Item name:&nbsp;&nbsp; <span className='text-black fw-normal'>{poDetails?.inventoryName}</span></p>
            <p className='commonColor fw-semibold mb-2'>Usage History</p>
            <div className='utilizationTable'>
                <table className='table table-responsive table-bordered'>
                    <thead>
                        <tr>
                            <th scope="col" className=''>Date</th>
                            <th scope="col" className=''>Quantity used</th>
                            <th scope="col" className=''>Purpose</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usageHistoryDetails.length != 0 ? (
                            usageHistoryDetails.map((usage) => (
                                <tr key={usage.id}>
                                    <td>{usage?.used_date}</td>
                                    <td>{usage?.quantity}</td>
                                    <td>{usage?.usage_purpose ? usage?.usage_purpose : '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center">No records found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className='text-end mt-3'>
                <button className='cancelBtn' onClick={() => setShowUtilizationHistory(false)}> Close</button>
            </div>
        </>
    )
}
