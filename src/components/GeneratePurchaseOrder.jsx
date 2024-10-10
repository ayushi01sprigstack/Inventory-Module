import { ErrorMessage, Field } from 'formik';
import React, { useState } from 'react'
import Images from '../utils/Images';

export default function GeneratePurchaseOrder({ values, setFieldValue, poDetails, allvendors, setPoDetails, selectedItemsDetails, selectedInventoryIds, validateForm, previewErrorMsg, setPreviewPo, setPreviewErrorMsg, previewPo }) {
    const [isEditingQuantity, setIsEditingQuantity] = useState(false);
    const handlePreviewPo = async (validateForm) => {
        const formErrors = await validateForm();
        if (Object.keys(formErrors).length == 0) {
            setPreviewPo(!previewPo);
            setPreviewErrorMsg('');
        } else {
            setPreviewErrorMsg('Please select vendor.')
        }
    }
    return (
        <>
            <div className="row">
                <div className="col-md-6 position-relative mb-3">
                    <label className='font-14 fw-medium'>Vendor Name<span className='text-danger'>*</span></label>
                    <Field as="select" name="selectedVendor" className="customSelect" onChange={(e) => {
                        const selectedId = e.target.value;
                        setFieldValue("selectedVendor", selectedId);
                        const selectedVendor = allvendors.find(vendor => vendor.id == selectedId);
                        if (selectedVendor) {
                            setPoDetails(prevState => ({
                                ...prevState,
                                vendorName: selectedVendor.name,
                                vendorContactNum: selectedVendor.contact_num || '',
                                vendorEmail: selectedVendor.email || '',
                                address: selectedVendor.address || '',
                                companyName: selectedVendor.company_name || ''
                            }));
                        }
                    }}>
                        <option value="">Select Vendor</option>
                        {allvendors.map((vendor) => (
                            <option key={vendor?.id} value={vendor?.id} className=''>{vendor?.name}</option>
                        ))}
                    </Field>
                    <ErrorMessage name='selectedVendor' component="div" className="text-start errorText" />
                </div>
                <div className="col-md-6 position-relative mb-2">
                    <label className='font-14 fw-medium'>Contact Number : </label>
                    <input type="text" className='form-control font-14' value={poDetails?.vendorContactNum} disabled />
                </div>
                <div className="col-md-6 position-relative mb-2">
                    <label className='font-14 fw-medium'>Email Id :</label>
                    <input type="text" className='form-control font-14' value={poDetails?.vendorEmail} disabled />
                </div>
                <div className="col-md-6 position-relative mb-2">
                    <label className='font-14 fw-medium'>Company Name :</label>
                    <input type="text" className='form-control font-14' value={poDetails?.companyName} disabled />
                </div>
                <div className="col-md-12 position-relative mb-3">
                    <label className='font-14 fw-medium'>Address:</label>
                    <textarea className='form-control font-14' rows={1} value={poDetails?.address} disabled />
                </div>
            </div>
            <h5 className='modalBodyHeading mt-3'>Item Details :</h5>
            <div className='purchaseOrderTable'>
                <table className='table table-responsive table-bordered'>
                    <thead>
                        <tr>
                            <th scope="col" className='cursor-pointer'>Item Name</th>
                            <th scope="col" className='cursor-pointer'>Quantity</th>
                            <th scope="col" className='cursor-pointer'>Price per qty</th>
                            <th scope="col" className='cursor-pointer'>Total Price</th>
                            <th scope="col" className='cursor-pointer'>Action</th>
                        </tr>
                    </thead>
                    {selectedInventoryIds.length > 1 ? (
                        <tbody>
                            {selectedItemsDetails.map(item => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td className='position-relative'>
                                        {isEditingQuantity == item.id ? (
                                            <input
                                                type="number"
                                                value={values.quantities[item?.id]}
                                                onChange={(e) => {
                                                    setFieldValue(`quantities.${item?.id}`, e.target.value);
                                                }}
                                                onBlur={() => setIsEditingQuantity(false)}
                                                autoFocus
                                                className="form-control position-absolute start-0 top-0"
                                                min={0}
                                            />
                                         ) : (
                                            <span onClick={() => setIsEditingQuantity(item.id)}>{values.quantities[item.id] || 0}</span>
                                        )} 
                                    </td>
                                    <td>Rs. {item.price}</td>
                                    <td>Rs. {(item.price * (values.quantities[item.id] || 0)).toFixed(2)}</td>
                                    <td className='text-center'>
                                        <img src={Images.editIconBlack} className='cursor-pointer' alt="edit" style={{ height: '15px' }} title="Edit quantity" onClick={() => setIsEditingQuantity(item.id)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    ) : (
                        <tbody>
                            <tr>
                                <td>{poDetails?.inventoryName}</td>
                                <td className='position-relative'>
                                    {isEditingQuantity ? (
                                        <input
                                            type="number"
                                            value={values.quantity}
                                            onChange={(e) => {
                                                setFieldValue('quantity', e.target.value);
                                            }}
                                            onBlur={() => setIsEditingQuantity(false)}
                                            autoFocus
                                            className="form-control position-absolute start-0 top-0"
                                            min={0}
                                        />
                                     ) : (
                                        <span onClick={() => setIsEditingQuantity(true)}> {values.quantity || 0}</span>
                                    )} 
                                </td>
                                <td>Rs. {poDetails?.price}</td>
                                <td>Rs. {(poDetails?.price * values.quantity).toFixed(2)}</td>
                                <td className='text-center'> <img src={Images.editIconBlack} className='cursor-pointer text-white' alt="edit" style={{ height: '15px' }} title="Edit quantity" onClick={() => setIsEditingQuantity(true)} /></td>
                            </tr>
                        </tbody>
                    )}
                </table>
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
            <div className='text-center text-danger'>{previewErrorMsg}</div>
            <div className='text-end mt-3'>
                <button type="button" className='previewPoBtn' onClick={() => handlePreviewPo(validateForm)}>
                    Preview PO
                </button>
            </div>
        </>
    )
}
