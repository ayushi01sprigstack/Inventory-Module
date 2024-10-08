import React from 'react'

export default function PreviewPo({poDetails, values, selectedInventoryIds, selectedItemsDetails, setPreviewPo}) {
    const today = new Date().toISOString().split('T')[0]; 
  return (
    <>
    <div className="preview-section p-3 border rounded p-4">
        <h3 className='fw-bold mb-1 mt-1 p-1 text-center'>Purchase Order</h3>
        <hr />
        <div className='text-end p-1'>
            <p><strong>Generated on:</strong> {today}</p>
        </div>
        <div className='mb-2'>
            <p><strong>Vendor Name: </strong> {poDetails?.vendorName}</p>
            <p><strong>Contact Number: </strong> {poDetails?.vendorContactNum}</p>
            <p><strong>Email: </strong> {poDetails?.vendorEmail}</p>
            <p><strong>Address:</strong> {poDetails?.address}</p>
        </div>
        <div className='previewPoTable'>
            <table className='table table-responsive'>
                <thead>
                    <tr>
                        <th scope="col" className='cursor-pointer'>Item Name</th>
                        <th scope="col" className='cursor-pointer'>Quantity</th>
                        <th scope="col" className='cursor-pointer'>Price</th>
                        <th scope="col" className='cursor-pointer'>Total Price</th>
                    </tr>
                </thead>
                {selectedInventoryIds.length > 1 ? (
                    <tbody>
                        {selectedItemsDetails.map(item => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{values.quantities[item.id] || 0}</td>
                                <td>Rs. {item.price}</td>
                                <td>Rs. {(item.price * (values.quantities[item.id] || 0)).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                ) : (
                    <tbody>
                        <tr>
                            <td>{poDetails?.inventoryName}</td>
                            <td>{values.quantity || 0}</td>
                            <td>Rs. {poDetails?.price}</td>
                            <td>Rs. {(poDetails?.price * values.quantity).toFixed(2)}</td>
                        </tr>
                    </tbody>
                )}
            </table>
        </div>
        <div className='text-end mt-4'>
            <div className='text-end'>
                <strong>Total Price: </strong> <span className='fw-normal'>Rs.  {selectedInventoryIds.length > 1 ? (
                    (() => {
                        let totalPrice = 0;
                        selectedItemsDetails.forEach(item => {
                            const quantity = values.quantities[item.id] || 0;
                            totalPrice += item.price * quantity
                        });
                        return totalPrice.toFixed(2);
                    })()
                ) : (
                    (poDetails?.price * values.quantity).toFixed(2)
                )}</span>
            </div>
        </div>
    </div>
    <div className='text-end mt-3'>
        <button type="button" className='previewPoBtn' onClick={() => setPreviewPo(false)}>
            Edit Details
        </button>
    </div>
</>
  )
}
