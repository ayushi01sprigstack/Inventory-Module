import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useApiService from '../../services/ApiService';
import ShowLoader from '../../components/loader/ShowLoader';
import HideLoader from '../../components/loader/HideLoader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import AlertComp from '../../components/AlertComp';
import Images from '../../utils/Images';
import PaginationComp from '../../components/PaginationComp';
import { formatDate, typewatch } from '../../utils/js/Common';
import Popup from '../../components/Popup';
import { Field, Formik, Form, ErrorMessage, } from 'formik';
import GeneratePoValidationSchema from './GeneratePoValidationSchema';
import UtilizationValidationSchema from './UtilizationValidationSchema';
import DynamicSearchComp from '../../components/DynamicSearchComp';
import Tab from '../../components/Tab';

export default function Products() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);
    const [products, setProducts] = useState([]);
    const placeholders = [
        'Search by Inventory',
        'Search by Vendor',
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
    const [usageHistoryDetails, setUsageHistoryDetails] = useState([]);
    const [purchaseOrderHistory, setPurchaseOrderHistory] = useState([]);
    const [showUsageHistory, setShowUsageHistory] = useState(false);
    const [allvendors, setAllVendors] = useState([]);
    const [isEditingQuantity, setIsEditingQuantity] = useState(false);
    const [selectedItemsDetails, setSelectedItemsDetails] = useState([]);

    useEffect(() => {
        getAllProducts(inventoryParamters.searchkey || null, inventoryParamters.sortKey || null);
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
                const result = await getAPI(`/all-inventories/${searchKeyParam}&${sortkey}&${updatedSortByFlag}&${currentPage}&${itemsPerPage}`);
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
                setLoading(false);
            }
        }, searchkey != null ? 1000 : 0);
    }

    const handlePageChange = (page) => {
        setCurrentPage(page);
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
                }
                catch (error) {
                    console.error('Failed to delete product:', error);
                    setLoading(false);
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

    const modalBody = () => {
        return (
            <Formik initialValues={{ utilizationQty: '', date: today, purpose: '' }} validationSchema={UtilizationValidationSchema} onSubmit={saveUtilizationQuantity} >
                {() => (
                    <Form className='' onKeyDown={(e) => {
                        if (e.key == 'Enter') {
                            e.preventDefault();
                        }
                    }}>
                        <div className="row">
                            <div className="col-md-6 position-relative mb-3">
                                <label className='font-14 fw-medium'>Enter Utilization Quantity <span className='text-danger'>*</span></label>
                                <Field type="number" name="utilizationQty" className="form-control" min={0} />
                                <ErrorMessage name="utilizationQty" component="div" className="text-start errorText" />
                            </div>
                            <div className="col-md-6 position-relative mb-2">
                                <label className='font-14 fw-medium'>Select Date <span className='text-danger'>*</span></label>
                                <Field type="date" name="date" className="form-control" />
                                <ErrorMessage name="date" component="div" className="text-start errorText" />
                            </div>
                            <div className="col-md-12 position-relative mb-2">
                                <label className='font-14 fw-medium'>Purpose</label>
                                <Field as="textarea" className="form-control" name='purpose' autoComplete='off' rows="2" />
                            </div>
                        </div>
                        <div className='text-end'>
                            <button className='cancelBtn' onClick={() => setShowUtlizationPopup(false)}> Close</button>
                            <button className='saveBtn text-white ms-2' type="submit" style={{ background: '#303260' }}>Save</button>
                        </div>
                    </Form>
                )}
            </Formik>
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
            setLoading(false);
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
                    currentStock: responseRs?.quantity || '',
                    description: responseRs?.description || null,
                    categoryName: responseRs?.category?.name,
                    price: responseRs?.price || '',
                    vendorID: responseRs?.inventory_detail?.vendor_id || '',
                    vendorName: responseRs?.inventory_detail?.vendor?.name || '',
                    vendorEmail: responseRs?.inventory_detail?.vendor?.email || '',
                    vendorContactNum: responseRs?.inventory_detail?.vendor?.contact_num,
                    address: responseRs?.inventory_detail?.vendor?.address,
                    companyName: responseRs?.inventory_detail?.vendor?.company_name
                }));
                setUsageHistoryDetails(responseRs?.usage_history);
                setPurchaseOrderHistory(responseRs?.purchase_logs);
                setLoading(false);
            }
        }
        catch (error) {
            console.error(error);
            setLoading(false);
        }
    }


    const handlePreviewPo = async (validateForm) => {
        const formErrors = await validateForm();
        if (Object.keys(formErrors).length == 0) {
            setPreviewPo(!previewPo);
            setPreviewErrorMsg('');
        } else {
            setPreviewErrorMsg('Please select vendor.')
        }
    }
    const modalBodyPurchaseOrder = () => {
        const getCommonVendorId = () => {
            const vendorIds = selectedInventoryIds.map(id => {
                const inventory = products.find(inv => inv.id === id);
                return inventory?.inventory_detail?.vendor_id; 
            });
            const uniqueVendorIds = [...new Set(vendorIds)];
            return uniqueVendorIds.length === 1 ? uniqueVendorIds[0] : ''; 
        };
        return (
            <>
                {!previewPo && <h5 className='modalBodyHeading'>Vendor Information :</h5>}
                <Formik initialValues={{
                    // selectedVendor: poDetails?.vendorID || '',
                    selectedVendor: selectedInventoryIds.length > 1 ? getCommonVendorId() : poDetails?.vendorID || '',
                    quantity: 0,
                    quantities: {}
                }} validationSchema={GeneratePoValidationSchema} enableReinitialize={true} onSubmit={saveGeneratePO} >
                    {({ setFieldValue, values, validateForm }) => (
                        <Form className='' onKeyDown={(e) => {
                            if (e.key == 'Enter') {
                                e.preventDefault();
                            }
                        }}>
                            {!previewPo && (
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
                                            <label className='font-14 fw-medium'>Phone Number: </label>
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
                                    <h5 className='modalBodyHeading mt-3'>Item List Details :</h5>
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
                            )}
                            {previewPo && (
                                <>
                                    <div className="preview-section p-3 mb-3 border rounded p-4">
                                        <h3 className='fw-bold mb-3 mt-3 p-1 text-center'>Purchase Order</h3>
                                        <hr />
                                        <div className='text-end p-2'>
                                            <p><strong>Generated on:</strong> {today}</p>
                                        </div>
                                        <div className=''>
                                            <p><strong>Vendor Name: </strong> {poDetails?.vendorName}</p>
                                            <p><strong>Contact Number: </strong> {poDetails?.vendorContactNum}</p>
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
                                                            <td>{poDetails?.price}</td>
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
                            )}
                            <div className='text-center mt-2'>
                                <button type='submit' className='submitBtn'>Submit</button>
                                <button className='cancelBtn ms-3 rounded-2' type="button" onClick={() => { setShowPoModal(false); setPreviewPo(false); setPreviewErrorMsg('');setFieldValue("selectedVendor",'') }}>Cancel</button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </>
        )
    }
    const saveGeneratePO = async (values) => {
        setLoading(true);
        const inventoryDetailsArray = [];
        if (selectedInventoryIds.length > 1) {
            selectedItemsDetails.forEach(item => {
                const quantity = values.quantities[item.id] || 0;
                inventoryDetailsArray.push({
                    inventoryId: item.id,
                    reminderQuantity: quantity
                })
            })
        }
        else {
            inventoryDetailsArray.push({
                inventoryId: poDetails?.inventoryId,
                reminderQuantity: values?.quantity
            })
        }
        var raw = JSON.stringify({
            vendorId: values.selectedVendor,
            inventoryDetails: inventoryDetailsArray
        })
        setShowPoModal(false);
        setPreviewPo(false);
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
                        setIsAllSelected(false);
                        setPreviewErrorMsg('');
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
            setLoading(false);
        }
    }

    const getVendors = async () => {
        setLoading(true);
        try {
            const result = await getAPI('/get-vendors-data');
            if (!result || result == '') {
                alert('Something went wrong');
            }
            else {
                const responseRs = JSON.parse(result);
                setLoading(false);
                setAllVendors(responseRs);
            }
        }
        catch (error) {
            console.error(error);
            setLoading(false);
        }
    }
    const handleGenerateMultiplePo = () => {
        const selectedItems = products.filter(product => selectedInventoryIds.includes(product.id));
        setSelectedItemsDetails(selectedItems);
        setShowPoModal(true);
        getVendors();
    };

    const modalBodyUsageHistory = () => {
        const [activeTab, setActiveTab] = useState('utilization');
        const handleTabClick = (tabName) => {
            setActiveTab(tabName);
        }
        return (
            <div className='inventoryDetailsPopupWrapper'>
                <ul className="nav nav-tabs">
                    <Tab isActive={activeTab == 'utilization'} label="Utilization history" onClick={() => handleTabClick('utilization')} col={'col-md-6'} />
                    <Tab isActive={activeTab == 'poHistory'} label="Po history" onClick={() => handleTabClick('poHistory')} col={'col-md-6'} />
                </ul>
                {activeTab == 'utilization' ? (
                    <>
                        <p className='commonColor fw-semibold mt-4'>Item name:&nbsp;&nbsp; <span className='text-black fw-normal'>{poDetails?.inventoryName}</span></p>
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
                    </>
                ) : activeTab == 'poHistory' ? (
                    <>
                        <p className='commonColor fw-semibold mt-4'>Item name:&nbsp;&nbsp; <span className='text-black fw-normal'>{poDetails?.inventoryName}</span></p>
                        <p className='commonColor fw-semibold mb-2'>Purchase Order History</p>
                        <div className='utilizationTable'>
                            <table className='table table-responsive table-bordered'>
                                <thead>
                                    <tr>
                                        <th scope="col" className=''>PO Number</th>
                                        <th scope="col" className=''>Quantity</th>
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
                                                <td>{formatDate(po?.purchase_order?.created_at)}</td>
                                                <td>{po?.purchase_order?.delivery_date || '-'}</td>
                                                <td>{po?.purchase_order?.status == 1 ? 'Pending' : po?.purchase_order?.status == 2 ? 'Partially Received' : 'Received'}</td>
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
                ) : null}
                <div className='text-end mt-3'>
                    <button className='cancelBtn' onClick={() => setShowUsageHistory(false)}> Close</button>
                </div>
            </div>
        )
    }
    return (
        <>
            {showAlerts}
            {loading ? <ShowLoader /> : <HideLoader />}
            <div className='mt-1' style={{ padding: "5px 20px" }}>
                <div className="row align-items-center ps-3">
                    <div className="col-4 p-1 position-relative">
                        <img src={Images.searchIcon} alt="search-icon" className="search-icon" />
                        <DynamicSearchComp placeholders={placeholders} onChange={(e) => { setInventoryParamters({ ...inventoryParamters, searchkey: e.target.value }); getAllProducts(e.target.value, inventoryParamters.sortKey) }} />
                    </div>
                    <div className="col-8 text-end">
                        <button className='productBtn' onClick={() => navigate('/add-update-inventory')}> <img src={Images.addIcon} alt="addIcon" className='me-1' />Add Inventory</button>
                        {selectedInventoryIds.length > 1 &&
                            <button className='productBtn' onClick={handleGenerateMultiplePo}> <img src={Images.poIcon} alt="po-icon" className='me-1 ms-3' style={{ height: '20px' }} />Generate PO</button>
                        }
                        <br />
                        <span className='redText'>*Low stock quantity. Please reorder</span>
                    </div>
                </div>
            </div>
            <div className='invnetoryTable mt-2'>
                <table className="table table-responsive mt-2">
                    <thead>
                        <tr>
                            <th><input type="checkbox" className='cursor-pointer' onChange={handleSelectAll} checked={isAllSelected} /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('name')}>Inventory <img src={Images.sortIcon} alt="sort-icon" className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('quantity')}>Qty<img src={Images.sortIcon} alt="sort-icon" className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('reminder_quantity')}>Min Stock Qty<img src={Images.sortIcon} alt="sort-icon" className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('price')}>Price<img src={Images.sortIcon} alt="sort-icon" className='ms-2' /></th>
                            <th scope="col" className=''>Vendor</th>
                            <th scope="col" className=''>Action</th>
                            <th scope="col" className=''>PO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map((product) => (
                                <tr key={product?.id} className={product?.needsPurchaseOrderFlag == 1 ? 'redText' : ''}>
                                    <td><input type="checkbox" className='cursor-pointer' checked={selectedInventoryIds.includes(product?.id)} onChange={() => handleSelectInventory(product?.id)} /></td>
                                    <td className='text-decoration-underline cursor-pointer' onClick={() => { setShowUsageHistory(true); getInventoryDataById(product?.id) }}>{product?.name}</td>
                                    <td>{product?.quantity}</td>
                                    <td>{product?.reminder_quantity}</td>
                                    <td>{product?.price}</td>
                                    <td>{product?.inventory_detail?.vendor?.name}</td>
                                    <td>
                                        <img src={Images.editIcon} className='cursor-pointer text-white me-3' alt="edit" style={{ height: '15px' }} title="Edit item" onClick={() => navigate('/add-update-inventory', { state: { productId: product?.id } })} />
                                        <img src={Images.deleteIcon} className='cursor-pointer text-white me-3' alt="delete" style={{ height: '15px' }} title="Delete item" onClick={() => handleDeleteProduct(product?.id)} />
                                        <img src={Images.utilization} alt="utilization" className='cursor-pointer text-white' style={{ height: '22px' }} title='Add utilization quantity' onClick={() => { setShowUtlizationPopup(true); setInventoryId(product?.id) }} />
                                    </td>
                                    <td>
                                        <img src={Images.poIcon} alt="po-icon" className='cursor-pointer' title="Generate PO" style={{ height: '20px' }}
                                            onClick={() => { setShowPoModal(true); getInventoryDataById(product?.id); getVendors(); setPreviewPo(false); setPreviewErrorMsg('') }}
                                        />
                                        {/* <button className='poButton'  onClick={() => { setShowPoModal(true); getInventoryDataById(product?.id); setPreviewPo(false); setPreviewErrorMsg('') }}>Generate PO</button> */}
                                    </td>
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
            <div className='d-flex justify-content-center'>
                <PaginationComp
                    currentPage={currentPage}
                    totalItems={totalItems}
                    pageSize={itemsPerPage}
                    onChange={handlePageChange}
                />
            </div>
            <Popup show={showUtlizationPopup} handleClose={() => setShowUtlizationPopup(false)} size="md" modalHeader="Add Utilization Quantity" modalBody={modalBody()} customTitle='modalTitle' modalFooter={false} />
            <Popup show={showPoModal} handleClose={() => { setShowPoModal(false); setPreviewErrorMsg('');setSelectedInventoryIds([]);setIsAllSelected(false) }} size="lg" modalHeader="Generate Purchase Order" modalBody={modalBodyPurchaseOrder()} customTitle='modalTitle' modalFooter={false} />
            <Popup show={showUsageHistory} handleClose={() => setShowUsageHistory(false)} size="lg" modalHeader="Inventory Utilization and Purchase Order" customTitle='customTitle modalTitle' modalBody={modalBodyUsageHistory()} modalFooter={false} />
        </>
    )
}
