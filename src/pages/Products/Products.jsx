import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useApiService from '../../services/ApiService';
import ShowLoader from '../../components/loader/ShowLoader';
import HideLoader from '../../components/loader/HideLoader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faSort, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import AlertComp from '../../components/AlertComp';
import Images from '../../utils/Images';
import PaginationComp from '../../components/PaginationComp';
import { typewatch } from '../../utils/js/Common';
import Popup from '../../components/Popup';
import { Field, Formik, Form, ErrorMessage, } from 'formik';
import * as Yup from 'yup';

export default function Products() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);
    const [products, setProducts] = useState([]);
    const [placeholder, setPlaceholder] = useState('Search by SKU');
    const placeholders = [
        'Search by SKU',
        'Search by Item Name',
        'Search by Vendor Name',
    ];
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const [inventoryParamters, setInventoryParamters] = useState({
        searchkey: '',
        sortKey: null,
        sortByFlag: 'desc'
    });
    const [showUtlizationPopup, setShowUtlizationPopup] = useState(false);
    const [inventoryId, setInventoryId] = useState(null);
    const { getAPI, postAPI } = useApiService();
    const [selectedInventoryIds, setSelectedInventoryIds] = useState([]);
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [showPoModal, setShowPoModal] = useState(false);
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
    const [previewPo, setPreviewPo] = useState(false);
    const [previewErrorMsg, setPreviewErrorMsg] = useState('');
    const today = new Date().toISOString().split('T')[0];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedIdsQueue, setSelectedIdsQueue] = useState([]);
    const [isMultipleGenerationPO, setIsMultipleGenarationPO] = useState(false);
    const [reOrderQuantities, setReOrderQuantities] = useState([]);
    const [usageHistoryDetails, setUsageHistoryDetails] = useState([]);
    const [showUsageHistory, setShowUsageHistory] = useState(false);

    useEffect(() => {
        let currentIndex = 0;
        const intervalId = setInterval(() => {
            setPlaceholder(placeholders[currentIndex]);
            currentIndex = (currentIndex + 1) % placeholders.length;
        }, 2000);
        return () => clearInterval(intervalId);
    }, []);
    useEffect(() => {
        getAllProducts(inventoryParamters.searchkey ? inventoryParamters.searchkey : null, inventoryParamters.sortKey || null);
    }, [currentPage])

    const getAllProducts = async (searchkey, sortkey) => {
        typewatch(async function () {
            setLoading(true);
            const searchKeyParam = searchkey ? searchkey : null;
            const updatedSortByFlag = sortkey ? (inventoryParamters.sortByFlag == 'desc' ? 'asc' : 'desc') : inventoryParamters.sortByFlag;
            setInventoryParamters(prev => ({
                ...prev,
                sortByFlag: updatedSortByFlag
            }));
            try {
                const result = await getAPI('/all-inventories/' + searchKeyParam + "&" + sortkey + "&" + updatedSortByFlag + "&" + currentPage + "&" + itemsPerPage);
                if (!result || result == '') {
                    alert('Something went wrong');
                }
                else {
                    const responseRs = JSON.parse(result);
                    setLoading(false);
                    setProducts(responseRs.data);
                    setTotalItems(responseRs.total);
                }
            }
            catch (error) {
                console.error(error);
            }
        }, searchkey != null ? 1000 : 0);
    }

    const handleDeleteProduct = async (productId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(true);
                try {
                    const result = await postAPI(`/delete-inventory/${productId}`);
                    if (!result || result == '') {
                        alert('Something went wrong');
                    }
                    else {
                        setShowAlerts(<AlertComp show={true} variant="success" message="Product deleted successfully" />);
                        setTimeout(() => {
                            setLoading(false);
                            setShowAlerts(<AlertComp show={false} />);
                            getAllProducts(inventoryParamters.searchkey ? inventoryParamters.searchkey : null, inventoryParamters.sortKey || null);
                        }, 2500);
                    }
                } catch (error) {
                    console.error('Failed to delete product:', error);
                }
            }
        })
    }
    const handleSortClick = (item) => {
        getAllProducts(inventoryParamters.searchkey, item);
        setInventoryParamters({ ...inventoryParamters, sortKey: item });
    }
    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const allProductIds = products.map(product => product?.id);
            setSelectedInventoryIds(allProductIds);
            setIsAllSelected(true);
        } else {
            setSelectedInventoryIds([]);
            setIsAllSelected(false);
        }
    };
    const handleSelectInventory = (id) => {
        if (selectedInventoryIds.includes(id)) {
            setSelectedInventoryIds(selectedInventoryIds.filter(productId => productId !== id));
        } else {
            setSelectedInventoryIds([...selectedInventoryIds, id]);
        }
    }
    const UtilizationValidationSchema = Yup.object().shape({
        utilizationQty: Yup.number().required('Utilization quantity is required').positive('Quantity must be greater than 0').integer('Quantity must be an integer'),
        date: Yup.date().required('Date is required').nullable()
    });
    const modalBody = () => {
        return (
            <>
                <Formik initialValues={{ utilizationQty: '', date: today, purpose: '' }} validationSchema={UtilizationValidationSchema} onSubmit={saveUtilizationQuantity} >
                    {() => (
                        <Form className='pt-4 mt-2' onKeyDown={(e) => {
                            if (e.key == 'Enter') {
                                e.preventDefault();
                            }
                        }}>
                            <div className="row">
                                <div className="col-md-6 position-relative mb-3">
                                    <label>Enter Utilization Quantity <span className='text-danger'>*</span></label>
                                    <Field type="number" name="utilizationQty" className="form-control mt-2" min={0} />
                                    <ErrorMessage name="utilizationQty" component="div" className="text-start errorText" />
                                </div>
                                <div className="col-md-6 position-relative mb-3">
                                    <label>Select Date <span className='text-danger'>*</span></label>
                                    <Field type="date" name="date" className="form-control mt-2" />
                                    <ErrorMessage name="date" component="div" className="text-start errorText" />
                                </div>
                                <div className="col-md-12 position-relative mb-3">
                                    <label>Purpose</label>
                                    <Field as="textarea" className="form-control mt-2" name='purpose' autoComplete='off' rows="2" />
                                </div>
                            </div>
                            <div className='text-end'>
                                <button className='cancelBtn' onClick={() => setShowUtlizationPopup(false)}> Close</button>
                                <button className='saveBtn text-white ms-2' type="submit" style={{ background: '#303260' }}>Save</button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </>
        )
    }
    const saveUtilizationQuantity = async (values) => {
        setShowUtlizationPopup(false);
        setLoading(true);
        var raw = JSON.stringify({
            inventoryId: inventoryId,
            quantity: values?.utilizationQty,
            usedDate: values?.date,
            usagePurpose: values?.purpose
        })
        try {
            const result = await postAPI('/add-inventory-utilization', raw);
            if (!result || result == "") {
                alert('Something went wrong');
            } else {
                const responseRs = JSON.parse(result);
                if (responseRs.status == 'success') {
                    setShowAlerts(<AlertComp show={true} variant="success" message='Utilization data added successfully' />);
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

    const getInventoryDataById = async (productId) => {
        setLoading(true);
        try {
            const result = await getAPI(`/get-inventory-details/${productId}`);
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
                }));
                setUsageHistoryDetails(responseRs?.usage_history)
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

    const handlePreviewPo = async (validateForm) => {
        const formErrors = await validateForm();
        if (Object.keys(formErrors).length == 0) {
            setPreviewPo(!previewPo);
            setPreviewErrorMsg('');
        } else {
            setPreviewErrorMsg('Please enter quanity.')
        }
    }
    const modalBodyPurchaseOrder = () => {
        return (
            <>
                {!previewPo && (
                    <>
                        <div className="row">
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
                        <h5 className='text-center fw-bold text-decoration-underline'>Generate PO</h5>
                    </>
                )}
                <Formik initialValues={{ reOrderQuantity: '' }} validationSchema={GeneratePoValidationSchema}
                    onSubmit={(values, { resetForm }) => {
                        const updatedReOrderQuantities = [...reOrderQuantities];
                        updatedReOrderQuantities[currentIndex] = values.reOrderQuantity;
                        if (isMultipleGenerationPO) {
                            if (currentIndex + 1 == selectedIdsQueue.length) {
                                setReOrderQuantities(updatedReOrderQuantities);
                                saveGeneratePO(updatedReOrderQuantities, values);
                            }
                            else {
                                handleNext(resetForm, values);
                            }
                        }
                        else {
                            saveGeneratePO(updatedReOrderQuantities, values);
                        }
                    }}
                >
                    {({ values, validateForm }) => (
                        <Form className={`${previewPo ? '' : 'pt-3 mt-2'}`} onKeyDown={(e) => {
                            if (e.key == 'Enter') {
                                e.preventDefault();
                            }
                        }}>
                            {!previewPo && (
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
                            )}

                            {previewPo && (
                                <>
                                    <div className="preview-section p-3 mb-3 border rounded p-4">
                                        <h3 className='fw-bold mb-3 mt-3 p-1 text-center'>Purchase Order</h3>
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
                                                        <td>₹{(poDetails?.price * values?.reOrderQuantity || 0)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className='text-end mt-4'>
                                            <p><strong>Total Price: </strong>&nbsp;₹{(poDetails?.price * values?.reOrderQuantity || 0)}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className='text-danger'>{previewErrorMsg}</div>
                            {/* <div className="text-end mt-5">
                                {!previewPo ? (
                                    <button type="button" className='saveBtn text-white' style={{ background: '#303260' }} onClick={() => handlePreviewPo(validateForm)}>
                                        {previewPo ? 'Hide Preview' : 'Preview PO'}
                                    </button>
                                ) : (
                                    <div>
                                        <button className='cancelBtn' type="button" onClick={() => { setShowPoModal(false); setPreviewPo(false) }}>Cancel</button>
                                        <button className='saveBtn text-white ms-2' type="submit" style={{ background: '#303260' }}>
                                            {currentIndex + 1 === selectedIdsQueue.length || selectedInventoryIds.length === 0 ? 'Save' : 'Save and Next'}
                                        </button>
                                    </div>
                                )}
                            </div> */}
                            <div className="text-end mt-4">
                                <button type="button" className='saveBtn text-white' style={{ background: '#303260',padding:'10px 15px' }} onClick={() => handlePreviewPo(validateForm)}> {previewPo ? 'Edit quantity' : 'Preview PO'}</button>
                            </div>
                            <div className='text-end mt-4'>
                                <button className='cancelBtn' type="button" onClick={() => setShowPoModal(false)}> Close</button>
                                <button className='saveBtn text-white ms-2' type="submit" style={{ background: '#303260' }}> {currentIndex + 1 == selectedIdsQueue.length || selectedInventoryIds.length == 0 ? 'Save' : 'Save and Next'}</button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </>
        )
    }
    const saveGeneratePO = async (updatedReOrderQuantities, values) => {
        setLoading(true);
        const inventoryToVendorMap = products.reduce((acc, product) => {
            acc[product.id] = product.vendor_id;
            return acc;
        }, {});
        let raw;
        if (isMultipleGenerationPO) {
            raw = JSON.stringify({
                vendorInventoryDetails: selectedIdsQueue.map((inventoryId, index) => ({
                    vendor_id: inventoryToVendorMap[inventoryId] || null,
                    inventory_id: inventoryId,
                    reminder_quantity: updatedReOrderQuantities[index] || 0,
                })),
            })
        }
        else {
            raw = JSON.stringify({
                vendorInventoryDetails: [
                    {
                        vendor_id: poDetails?.vendorID,
                        inventory_id: poDetails?.inventoryId,
                        reminder_quantity: values?.reOrderQuantity
                    }
                ]
            })
        }
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
                        setSelectedInventoryIds([]);
                        setSelectedIdsQueue([]);
                        setCurrentIndex(0);
                        if (isMultipleGenerationPO && currentIndex + 1 == selectedIdsQueue.length) {
                            setIsMultipleGenarationPO(false);
                        }
                        setShowPoModal(false);
                        setPreviewPo(false);
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
    const handleNext = (resetForm, values) => {
        setReOrderQuantities(prev => {
            const newQuantities = [...prev];
            newQuantities[currentIndex] = values.reOrderQuantity;
            return newQuantities;
        });
        if (currentIndex + 1 < selectedIdsQueue.length) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            getInventoryDataById(selectedIdsQueue[nextIndex]);
            resetForm({ reOrderQuantity: '' });
            setPreviewPo(false);
        }
    };

    const handleGenerateMultiplePo = () => {
        setIsMultipleGenarationPO(true);
        setPreviewErrorMsg('')
        if (selectedInventoryIds.length > 1) {
            setSelectedIdsQueue(selectedInventoryIds);
            setCurrentIndex(0);
            getInventoryDataById(selectedInventoryIds[0]);
            setShowPoModal(true);
        }
    }

    const modalBodyUsageHistory = () => {
        return (
            <>
                <p className='commonColor fw-medium'>Item name:&nbsp;&nbsp; <span className='text-black fw-normal'>{poDetails?.inventoryName}</span></p>
                <p className='commonColor fw-medium mb-2'>Usage History</p>
                <div className='utilizationTable'>
                <table className='table table-responsive table-bordered'>
                    <thead>
                        <tr>
                            <th scope="col" className='cursor-pointer'>Date</th>
                            <th scope="col" className='cursor-pointer'>Quantity used</th>
                            <th scope="col" className='cursor-pointer'>Purpose</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usageHistoryDetails.map((usage) => (
                            <tr key={usage.id}>
                                <td>{usage?.used_date}</td>
                                <td>{usage?.quantity }</td>
                                <td>{usage?.usage_purpose?usage?.usage_purpose:'-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </>
        )
    }
    return (
        <>
            {showAlerts}
            {loading ? <ShowLoader /> : <HideLoader />}
            <h4 className='pageheader p-2 m-0'>Inventory Management</h4>
            <hr className='horizontal-line' />
            <div className='headerWrapper mt-3'>
                <div className="row align-items-center ps-3">
                    <div className="col-4 p-1 position-relative">
                        <img src={Images.searchIcon} alt="search-icon" className="search-icon" style={{ left: '10px', top: '53%' }} />
                        <input type="text" className="form-control" placeholder={placeholder} style={{ padding: '.375rem 1.75rem' }} onChange={(e) => { setInventoryParamters({ ...inventoryParamters, searchkey: e.target.value }); getAllProducts(e.target.value, inventoryParamters.sortKey) }} />
                    </div>
                    <div className="col-8 text-end">
                        <button className='productBtn' onClick={() => navigate('/add-update-inventory')}> <img src={Images.addIcon} alt="addIcon" className='me-1' />Add Item</button>
                        {selectedInventoryIds.length > 1 &&
                            <button className='productBtn' onClick={handleGenerateMultiplePo}> <img src={Images.poIcon} alt="po-icon" className='me-1 ms-3' style={{ height: '20px' }} />Generate PO</button>
                        }
                    </div>
                </div>
            </div>
            <div className='invnetoryTable p-4'>
                <span className='redText'>*Current stock quantity is below the minimum stock quantity required.</span>
                <table className="table table-responsive mt-2">
                    <thead>
                        <tr>
                            <th><input type="checkbox" className='cursor-pointer' onChange={handleSelectAll} checked={isAllSelected} /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('sku')}>Sku<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('name')}>Item Name<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('quantity')}>Quantity<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('reminder_quantity')}>Min Stock Quantity<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('price')}>Price<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('vendor_name')}>Vendor Name<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className=''>Action</th>
                            <th scope="col" className=''>PO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map((product) => (
                                <tr key={product?.id} className={product?.purchaseOrderFlag == 1 ? 'redText' : ''}>
                                    <td><input type="checkbox" className='cursor-pointer' checked={selectedInventoryIds.includes(product?.id)} onChange={() => handleSelectInventory(product?.id)} /></td>
                                    <td>{product?.sku}</td>
                                    <td className='text-decoration-underline cursor-pointer' onClick={() => { setShowUsageHistory(true); getInventoryDataById(product?.id) }}>{product?.name}</td>
                                    <td>{product?.quantity}</td>
                                    <td>{product?.reminder_quantity}</td>
                                    <td>{product?.price}</td>
                                    <td>{product?.vendor_name}</td>
                                    <td>
                                        <FontAwesomeIcon icon={faPenToSquare} className='cursor-pointer text-white me-3' title="Edit item" onClick={() => navigate('/add-update-inventory', { state: { productId: product?.id } })} />
                                        <FontAwesomeIcon icon={faTrash} className='cursor-pointer text-white me-3' title="Delete item" onClick={() => handleDeleteProduct(product?.id)} />
                                        <img src={Images.utilization} alt="utilization" className='cursor-pointer text-white' style={{ height: '25px' }} title='Add utilization quantity' onClick={() => { setShowUtlizationPopup(true); setInventoryId(product?.id) }} />
                                    </td>
                                    <td><img src={Images.poIcon} alt="po-icon" className='cursor-pointer' title="Generate PO" style={{ height: '20px' }}
                                        onClick={() => { setShowPoModal(true); getInventoryDataById(product?.id); setPreviewPo(false); setPreviewErrorMsg('') }}
                                    /></td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center">
                                    No Items found
                                </td>
                            </tr>
                        )
                        }
                    </tbody>
                </table>
            </div>
            <div className='position-fixed bottom-0 start-50'>
                <PaginationComp
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            </div>
            <Popup show={showUtlizationPopup} handleClose={() => setShowUtlizationPopup(false)} size="md" modalHeader="Add Utilization Quantity" modalBody={modalBody()} modalFooter={false} />
            <Popup show={showPoModal} handleClose={() => setShowPoModal(false)} size="lg" modalHeader="Generate Purchase Order" modalBody={modalBodyPurchaseOrder()} modalFooter={false} />
            <Popup show={showUsageHistory} handleClose={() => setShowUsageHistory(false)} size="md" modalHeader="Utilization Overview" customTitle='customTitle' modalBody={modalBodyUsageHistory()} modalFooter={false} />
        </>
    )
}
