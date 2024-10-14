import React from 'react'
import { formatDate } from '../../utils/js/Common'

export default function ReceivePoHistory({ purchaseOrderReceiveHistory, setShowReceivePoHistory }) {
    return (
        <div className='purchaseOrderTable'>
            <table className='table table-responsive table-bordered'>
                <thead>
                    <tr>
                        <th scope="col" className='cursor-pointer'>Item Name</th>
                        <th scope="col" className='cursor-pointer'>Remaining Ordered Qty</th>
                        <th scope="col" className='cursor-pointer'>Received Qty</th>
                        <th scope="col" className='cursor-pointer'>Extra Qty</th>
                        <th scope="col" className='cursor-pointer'>Received Date</th>
                    </tr>
                </thead>
                <tbody>
                    {purchaseOrderReceiveHistory.length != 0 ? (
                        purchaseOrderReceiveHistory.map((po) => (
                            <tr key={po?.id}>
                                <td>{po?.purchase_order_item?.inventory?.name}</td>
                                <td>{po?.remaining_ordered_quantity}</td>
                                <td>{po?.received_quantity}</td>
                                <td>{po?.extra_quantity}</td>
                                <td>{formatDate(po?.created_at)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center">No records found</td>
                        </tr>
                    )
                    }



                </tbody>
            </table>
            <div className='text-end mt-3'>
                <button className='cancelBtn' onClick={() => setShowReceivePoHistory(false)}> Close</button>
            </div>
        </div>
    )
}
