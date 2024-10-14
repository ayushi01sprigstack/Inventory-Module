import React from 'react'
import { formatDate } from '../utils/js/Common'

export default function PoHistory({purchaseOrderHistory, poDetails}) {
    return (
        <>
            <p className='commonColor fw-semibold mb-1 mt-3'>Item name:&nbsp;&nbsp; <span className='text-black fw-normal'>{poDetails?.inventoryName}</span></p>
            <p className='commonColor fw-semibold mb-1'>Purchase Order History:</p>
            <div className='utilizationTable'>
                <table className='table table-responsive table-bordered'>
                    <thead>
                        <tr>
                            <th scope="col" className=''>PO No.</th>
                            <th scope="col" className=''>Ordered Qty</th>
                            <th scope="col" className=''>Received Qty</th>
                            <th scope="col" className=''>Ordered Date</th>
                            <th scope="col" className=''>Delivered Date</th>
                            <th scope="col" className=''>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchaseOrderHistory.length != 0 ? (
                            purchaseOrderHistory.map((po) => (
                                <tr key={po.id}>
                                    <td>{po?.purchase_order_id}</td>
                                    <td>{po?.ordered_quantity}</td>
                                    <td>{po?.current_received_quantity}</td>
                                    <td>{formatDate(po?.purchase_order?.created_at)}</td>
                                    <td>{po?.purchase_order?.delivery_date || '-'}</td>
                                    <td>{po?.purchase_order?.status == 1 ? 'Pending' : 'Received'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">No records found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    )
}
