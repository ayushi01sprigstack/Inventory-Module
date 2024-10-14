import React, { useState } from 'react'
import { convertToBase64, formatDate } from '../../utils/js/Common';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import ReceivePoValidationSchema from './ReceivePoValidationSchema';
import Images from '../../utils/Images';
import AlertComp from '../../components/AlertComp';
import useApiService from '../../services/ApiService';

export default function ReceivePurchaseOrder({ poDetailsById, setShowReceivePoModal, setShowAlerts, setLoading, setSelectedPoIds, setIsAllSelected, getAllPurchaseOrders, inventoryParamters }) {
    const [isEditingQuantity, setIsEditingQuantity] = useState(null);
    const { postAPI } = useApiService();
    var CDN_KEY = import.meta.env.VITE_CDN_KEY;

    const saveReceivedPO = async (values) => {
        setLoading(true);
        let base64file = null;
        if (values?.pdfAttachment) {
            base64file = await convertToBase64(values?.pdfAttachment)
        }
        var raw = JSON.stringify({
            poId: poDetailsById?.poNumber,
            note: values?.notes,
            receipt: base64file,
            orderItemDetails: poDetailsById?.purchaseOrderInventories.map((inventory) => ({
                itemId: inventory.id,
                itemQuantity: values.quantities[inventory.id] || 0
            }))
        })
        try {
            const result = await postAPI('/update-order-quantity', raw);
            if (!result || result == "") {
                throw new Error('Something went wrong');
            } else {
                const responseRs = JSON.parse(result);
                if (responseRs.status == 'success') {
                    setShowAlerts(<AlertComp show={true} variant="success" message='Received quantity updated successfully' />);
                    setTimeout(() => {
                        setLoading(false);
                        setShowReceivePoModal(false);
                        setShowAlerts(<AlertComp show={false} />);
                        setSelectedPoIds([]);
                        setIsAllSelected(false);
                        getAllPurchaseOrders(inventoryParamters?.searchkey || null, inventoryParamters?.sortKey || null, inventoryParamters?.sortByFlag)
                    }, 2500);
                }
                else {
                    setShowAlerts(<AlertComp show={true} variant="danger" message={responseRs?.message} />);
                    setTimeout(() => {
                        setLoading(false);
                        setShowAlerts(<AlertComp show={false} />);
                        setShowReceivePoModal(false);
                        setSelectedPoIds([]);
                        setIsAllSelected(false);
                    }, 2000);
                }
            }
        }
        catch (error) {
            console.error(error);
            setLoading(false);
        }
    }
    return (
        <>
            <h5 className='modalBodyHeading text-black'>Purchase Order Details :</h5>
            <div className="row">
                <div className="col-md-6">
                    <p className='commonColor fw-semibold font-14 mt-2 mb-2'>PO Number:&nbsp;&nbsp; <span className='text-black fw-normal'>{poDetailsById?.poNumber}</span></p>
                </div>
                <div className="col-md-6">
                    <p className='commonColor fw-semibold font-14 mt-2 mb-2'>Vendor Name:&nbsp;&nbsp; <span className='text-black fw-normal'>{poDetailsById?.vendorName}</span></p>
                </div>
                <div className="col-md-6">
                    <p className='commonColor fw-semibold font-14'>Total Amount:&nbsp;&nbsp; <span className='text-black fw-normal'>Rs. {poDetailsById?.totalAmount}</span></p>
                </div>
                <div className="col-md-6">
                    <p className='commonColor fw-semibold font-14'>Ordered Date:&nbsp;&nbsp; <span className='text-black fw-normal'>{formatDate(poDetailsById?.orderedDate)}</span></p>
                </div>
                <Formik
                    initialValues={{
                        notes: poDetailsById?.orderNote || '',
                        pdfAttachment: poDetailsById?.pdfAttachment || null,
                        pdfFileName: poDetailsById?.pdfAttachment ? (typeof poDetailsById?.pdfAttachment == 'string' ? poDetailsById?.pdfAttachment.split('/').pop() : poDetailsById?.pdfAttachment.name) : '',
                        quantities: poDetailsById?.purchaseOrderInventories.reduce((acc, inventory) => {
                            acc[inventory.id] = (inventory?.ordered_quantity) - (inventory?.current_received_quantity);
                            return acc;
                        }, {}),
                    }}
                    validationSchema={ReceivePoValidationSchema} enableReinitialize={true} onSubmit={saveReceivedPO} validateOnBlur={false} validateOnChange={false}
                >
                    {({ setFieldValue, values }) => {
                        const pdfUrl = poDetailsById?.pdfAttachment || null;
                        return (
                            <Form className='' onKeyDown={(e) => {
                                if (e.key == 'Enter') {
                                    e.preventDefault();
                                }
                            }}>
                                <div className='utilizationTable'>
                                    <table className='table table-responsive table-bordered'>
                                        <thead>
                                            <tr>
                                                <th scope="col" className=''>Item Name</th>
                                                <th scope="col" className=''>Ordered Qty</th>
                                                <th scope="col" className=''>Previous Received Qty</th>
                                                <th scope="col" className=''>New Received Qty</th>
                                                <th scope="col" >Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {poDetailsById?.purchaseOrderInventories.length != 0 ? (
                                                poDetailsById?.purchaseOrderInventories.map((inventory) => (
                                                    <tr key={inventory.id}>
                                                        <td>{inventory?.inventory?.name}</td>
                                                        <td>{inventory?.ordered_quantity}</td>
                                                        <td>{inventory?.current_received_quantity}</td>
                                                        <td className='position-relative'>
                                                            {isEditingQuantity == inventory.id ? (
                                                                <>
                                                                    <Field
                                                                        name={`quantities.${inventory.id}`}
                                                                        type="number"
                                                                        value={values.quantities[inventory.id] || ''}
                                                                        onChange={(e) => setFieldValue(`quantities.${inventory.id}`, e.target.value)}
                                                                        className='form-control position-absolute start-0 top-0'
                                                                        min={0}
                                                                        onBlur={() => setIsEditingQuantity(null)}
                                                                        autoFocus
                                                                    />

                                                                </>

                                                            ) : (
                                                                <span onClick={() => setIsEditingQuantity(inventory.id)}>{values.quantities[inventory.id]}</span>
                                                            )}
                                                        </td>
                                                        <td className=''>
                                                            {inventory?.current_received_quantity != inventory?.ordered_quantity ? <img src={Images.editIconBlack} className='cursor-pointer' alt="edit" style={{ height: '15px' }} title="Edit quantity" onClick={() => setIsEditingQuantity(inventory.id)} /> : '-'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center">No records found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 position-relative">
                                        <label className='font-14'>Notes: </label>
                                        <Field as="textarea" className="form-control font-14" name='notes' autoComplete='off' rows="1" />
                                    </div>
                                    <div className='col-md-6 position-relative'>
                                        <label className='font-14'>Add Attachment:</label>
                                        <input type="file" accept="application/pdf" className="form-control font-14"
                                            onChange={(event) => {
                                                setFieldValue("pdfAttachment", event.currentTarget.files[0]);
                                            }} />
                                        {values.pdfFileName && (
                                            <div className="font-14 mt-1">
                                                <span>{values.pdfFileName}</span>
                                            </div>
                                        )}
                                        {pdfUrl && (
                                            <div className="mt-1">
                                                <a href={`${CDN_KEY}${pdfUrl}`} className='font-14' target="_blank" rel="noopener noreferrer">
                                                    View Pdf
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-end mt-3">
                                    <button type='submit' className='submitBtn'>Submit</button>
                                    <button className='cancelBtn ms-3 rounded-2' type="button" onClick={() => { setShowReceivePoModal(false) }}>Cancel</button>
                                </div>
                            </Form>
                        );
                    }}
                </Formik>
            </div>
        </>
    )
}
