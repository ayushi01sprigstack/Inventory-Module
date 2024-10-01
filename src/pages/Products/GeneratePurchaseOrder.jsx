import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ShowLoader from '../../components/loader/ShowLoader';
import HideLoader from '../../components/loader/HideLoader';
import useApiService from '../../services/ApiService';
import { Field, Formik, Form, ErrorMessage, } from 'formik';
import * as Yup from 'yup';
export default function GeneratePurchaseOrder() {
    const location = useLocation();
    const inventoryID = location?.state?.inventoryID;
    console.log(inventoryID);
    const [loading, setLoading] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);
    const [poDetails, setPoDetails] = useState({
        inventoryId: '',
        inventoryName: '',
        sku: '',
        price: '',
        currentStock: '',
        description: '',
        categoryName: '',
        vendorID: '',
        vendorName: '',
        vendorEmail: '',
        vendorContactNum: '',
        address: '',
        companyName: ''
    })
    const { getAPI, postAPI } = useApiService();
    const today = new Date().toISOString().split('T')[0];
    const [previewErrorMsg, setPreviewErrorMsg] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedIdsQueue, setSelectedIdsQueue] = useState([]);
    const selectedInventoryIds = location?.state?.multipleInventoryIds;
    console.log(selectedInventoryIds);

    useEffect(() => {
        getInventoryDataById();
    }, []);
    const getInventoryDataById = async () => {
        setLoading(true);
        try {
            const result = await getAPI(`/get-inventory-details/${inventoryID}`);
            if (!result || result == '') {
                alert('Something went wrong');
            }
            else {
                const responseRs = JSON.parse(result);
                setPoDetails(prevState => ({
                    ...prevState,
                    inventoryId: responseRs?.id || '',
                    inventoryName: responseRs?.name || '',
                    sku: responseRs?.sku || '',
                    currentStock: responseRs?.quantity || '',
                    description: responseRs?.description || null,
                    categoryName: responseRs?.category?.name,
                    price: responseRs?.price || '',
                    vendorID: responseRs?.vendor?.id || '',
                    vendorName: responseRs?.vendor?.name || '',
                    vendorEmail: responseRs?.vendor?.email || '',
                    vendorContactNum: responseRs?.vendor?.contact_num,
                    address: responseRs?.vendor?.address,
                    companyName: responseRs?.vendor?.company_name
                }))
                setLoading(false);
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    const GeneratePoValidationSchema = Yup.object().shape({
        reOrderQuantity: Yup.number().required('Quantity is required').positive('Quantity must be greater than 0').integer('Quantity must be an integer'),
    });

    const saveGeneratePO = async (values) => {
        console.log(values)
        setLoading(true);
        var raw = JSON.stringify({
            vendorInventoryDetails: [
                {
                    vendor_id: poDetails?.vendorID,
                    inventoryDetails: [
                        {
                            inventory_id: poDetails?.inventoryId,
                            reminder_quantity: values?.reOrderQuantity,
                        }
                    ]
                }
            ]
        })
        try {
            const result = await postAPI('/generate-purchase-order', raw);
            if (!result || result == "") {
                alert('Something went wrong');
            } else {
                const responseRs = JSON.parse(result);
                if (responseRs.status == 'success') {
                    setShowAlerts(<AlertComp show={true} variant="success" message='Purchase Order generated successfully' />);
                    setTimeout(() => {
                        setLoading(false);
                        setShowAlerts(<AlertComp show={false} />);
                        getAllProducts(inventoryParamters.searchkey ? inventoryParamters.searchkey : null, inventoryParamters.sortKey || null);
                    }, 2500);
                }
                else {
                    setShowAlerts(<AlertComp show={true} variant="danger" message={responseRs?.message} />);
                    setTimeout(() => {
                        setLoading(false);
                        setShowAlerts(<AlertComp show={false} />);
                    }, 2000);
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    }
   
    return (
        <>
            {showAlerts}
            {loading ? <ShowLoader /> : <HideLoader />}
            <div style={{ padding: '20px' }}>
            <div className="row text-white p-3 ">
                <div className="col-md-6">
                    <h5 className='fw-bold mb-4 text-decoration-underline'>Inventory Details</h5>
                    <p><strong>Category:</strong> {poDetails?.categoryName}</p>
                    <p><strong>Inventory Name:</strong> {poDetails?.inventoryName}</p>
                    <p><strong>SKU:</strong> {poDetails?.sku}</p>
                    <p><strong>Current Stock:</strong> {poDetails?.currentStock}</p>
                    <p><strong>Price:</strong> {poDetails?.price}</p>
                    <p><strong>Description:</strong> {poDetails?.description ? poDetails?.description : '-'}</p>
                </div>
                <div className="col-md-6">
                    <h5 className='fw-bold mb-4 text-decoration-underline'>Vendor Details</h5>
                    <p><strong>Name:</strong> {poDetails?.vendorName}</p>
                    <p><strong>Email:</strong> {poDetails?.vendorEmail}</p>
                    <p><strong>Contact Number:</strong> {poDetails?.vendorContactNum}</p>
                    <p><strong>Address:</strong> {poDetails?.address}</p>
                    <p><strong>Company Name:</strong> {poDetails?.companyName}</p>
                </div>
            </div>
            <hr />
            <h5 className='text-center fw-bold text-decoration-underline'>Generate PO</h5>
            <Formik initialValues={{ reOrderQuantity: '' }} validationSchema={GeneratePoValidationSchema}
                    onSubmit={saveGeneratePO}
                // onSubmit={(values, { resetForm }) => {
                //     if (currentIndex + 1 == selectedIdsQueue.length) {
                //         saveGeneratePO(values);
                //     }
                //     else {
                //         handleNext(resetForm);
                //     }
                // }}
                >
                    {({ values, validateForm }) => (
                        <Form className='pt-4 mt-2' onKeyDown={(e) => {
                            if (e.key == 'Enter') {
                                e.preventDefault();
                            }
                        }}>
                            
                                <div className="row mb-3">
                                    <div className="col-md-6 position-relative">
                                        <label>Enter Quantity to reoder <span className='text-danger'>*</span></label>
                                        <Field type="number" name="reOrderQuantity" className="form-control mt-2" min={0} />
                                        <ErrorMessage name="reOrderQuantity" component="div" className="text-start errorText" />
                                    </div>
                                    <div className="col-md-6 position-relative">
                                        <label>Price</label>
                                        <Field type="number" value={poDetails?.price} className="form-control mt-2" min={0} step="0.01" disabled />
                                    </div>
                                </div>
                          
                            
                              
                                    {/* <h4 className='fw-bold text-center'>Preview PO Details</h4> */}
                                    <div className="preview-section p-3 mb-3 border rounded p-3">
                                        <h3 className='fw-bold mb-3 text-center'>Purchase Order</h3>
                                        <hr />
                                        <div className='text-end p-2'>
                                            <p><strong>Generated on:</strong> {today}</p>
                                        </div>
                                        <div className='mt-1 p-2'>
                                            <p><strong>Vendor Name: </strong> {poDetails?.vendorName}</p>
                                            <p><strong>Address:</strong> {poDetails?.address}</p>
                                        </div>
                                        <div className='purchaseOrderTable'>
                                            <table className='table table-responsive table-bordered'>
                                                <thead>
                                                    <tr>
                                                        <th scope="col" className='cursor-pointer'>Item Name</th>
                                                        <th scope="col" className='cursor-pointer'>Quantity</th>
                                                        <th scope="col" className='cursor-pointer'>Price</th>
                                                        <th scope="col" className='cursor-pointer'>Total Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>{poDetails?.inventoryName}</td>
                                                        <td>{values?.reOrderQuantity}</td>
                                                        <td>{poDetails?.price}</td>
                                                        <td>{(poDetails?.price * values?.reOrderQuantity || 0).toFixed(2)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>                         
                            <div className='text-danger text-center'>{previewErrorMsg}</div>
                            <div className="text-end mt-4">
                                <button type="button" className='saveBtn text-white' style={{ background: '#303260' }}>Preview PO</button>
                            </div>
                            <div className='text-end mt-4'>
                                <button className='cancelBtn' type="button" onClick={() => setShowPoModal(false)}> Close</button>
                                <button className='saveBtn text-white ms-2' type="submit" style={{ background: '#303260' }}>Save</button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </>
    )
}
