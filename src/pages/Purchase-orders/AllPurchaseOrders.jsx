import React, { useEffect, useState } from 'react'
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import ShowLoader from '../../components/loader/ShowLoader';
import HideLoader from '../../components/loader/HideLoader';
import DynamicSearchComp from '../../components/DynamicSearchComp';
import Images from '../../utils/Images';
import { formatDate, typewatch } from '../../utils/js/Common';
import PaginationComp from '../../components/PaginationComp';
import useApiService from '../../services/ApiService';
import Popup from '../../components/Popup';
import ReceivePoValidationSchema from './ReceivePoValidationSchema';
import AlertComp from '../../components/AlertComp';
import { useNavigate } from 'react-router-dom';

export default function AllPurchaseOrders() {
    const [loading, setLoading] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);
    const placeholders = [
        'Search by PO number',
        'Search by Status',
        'Search by Vendor',
        'Search by Total Amount',
    ];
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const [inventoryParamters, setInventoryParamters] = useState({
        searchkey: '',
        sortKey: null,
        sortByFlag: 'desc'
    });
    const [purchaseOrderDetails, setPurchaseOrderDetails] = useState([]);
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [selectedPoIds, setSelectedPoIds] = useState([]);
    const [showReceivePoModal, setShowReceivePoModal] = useState(false);
    const [poDetailsById, setPoDetailsById] = useState({
        poNumber: '',
        vendorName: '',
        totalAmount: '',
        orderedDate: '',
        purchaseOrderInventories: [],
        orderNote:''
    })
    const [isEditingQuantity, setIsEditingQuantity] = useState(null);
    const { getAPI, postAPI } = useApiService();
    const navigate = useNavigate();
    const handlePageChange = (page) => {
        setCurrentPage(page);
    }

    useEffect(() => {
        getAllPurchaseOrders(inventoryParamters.searchkey || null, inventoryParamters.sortKey || null);
    }, [currentPage])

    const getAllPurchaseOrders = async (searchkey, sortkey) => {
        typewatch(async function () {
            setLoading(true);
            const searchKeyParam = searchkey ? searchkey : null;
            const updatedSortByFlag = sortkey ? (inventoryParamters.sortByFlag == 'desc' ? 'asc' : 'desc') : inventoryParamters.sortByFlag;
            setInventoryParamters(prev => ({
                ...prev,
                sortByFlag: updatedSortByFlag
            }));
            try {
                const result = await getAPI(`/all-purchase-orders/${searchKeyParam}&${sortkey}&${updatedSortByFlag}&${currentPage}&${itemsPerPage}`);
                if (!result || result == '') {
                    alert('Something went wrong');
                }
                else {
                    const responseRs = JSON.parse(result);
                    setLoading(false);
                    setPurchaseOrderDetails(responseRs.data);
                    setTotalItems(responseRs.total);
                }
            }
            catch (error) {
                console.error(error);
                setLoading(false);
            }
        }, searchkey != null ? 1000 : 0);
    };

    const getPurchaseOrderById = async (orderId) => {
        try {
            const result = await getAPI(`/get-purchase-order-details/${orderId}`);
            if (!result || result == '') {
                alert('Something went wrong');
            }
            else {
                const responseRs = JSON.parse(result);
                setPoDetailsById(prevState => ({
                    ...prevState,
                    poNumber: responseRs?.id,
                    vendorName: responseRs?.vendor?.name,
                    totalAmount: responseRs?.total_amount,
                    orderedDate: responseRs?.created_at,
                    purchaseOrderInventories: responseRs?.purchase_inventories,
                    orderNote:responseRs?.order_note
                }))
                setLoading(false);
            }
        }
        catch (error) {
            console.error(error);
            setLoading(false);
        }
    }
    const handleSortClick = (item) => {
        getAllPurchaseOrders(inventoryParamters.searchkey, item);
        setInventoryParamters({ ...inventoryParamters, sortKey: item });
    }
    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const allPoIds = purchaseOrderDetails.map(order => order?.id);
            setSelectedPoIds(allPoIds);
            setIsAllSelected(true);
        } else {
            setSelectedPoIds([]);
            setIsAllSelected(false);
        }
    };
    const handleSelectPO = (id) => {
        if (selectedPoIds.includes(id)) {
            setSelectedPoIds(selectedPoIds.filter(orderId => orderId !== id));
        } else {
            setSelectedPoIds([...selectedPoIds, id]);
        }
    }
    const modalBodyReceivePurchaseOrder = () => {
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
                        <p className='commonColor fw-semibold font-14'>Total Amount:&nbsp;&nbsp; <span className='text-black fw-normal'>{poDetailsById?.totalAmount}</span></p>
                    </div>
                    <div className="col-md-6">
                        <p className='commonColor fw-semibold font-14'>Ordered Date:&nbsp;&nbsp; <span className='text-black fw-normal'>{formatDate(poDetailsById?.orderedDate)}</span></p>
                    </div>
                    <Formik
                        initialValues={{
                            notes:poDetailsById?.orderNote || '',
                            quantities: poDetailsById?.purchaseOrderInventories.reduce((acc, inventory) => {
                                acc[inventory.id] = (inventory?.ordered_quantity) - (inventory?.current_received_quantity);
                                return acc;
                            }, {})
                        }}
                        validationSchema={ReceivePoValidationSchema} enableReinitialize={true} onSubmit={saveReceivedPO}
                    >
                        {({ setFieldValue, values, errors, touched, validateForm }) => (
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
                                                            {isEditingQuantity === inventory.id ? (
                                                                <>
                                                                    <Field
                                                                        name={`quantities.${inventory.id}`}
                                                                        type="number"
                                                                        value={values.quantities[inventory.id] || ''}
                                                                        onChange={(e) => setFieldValue(`quantities.${inventory.id}`, e.target.value)}
                                                                        className='form-control position-absolute start-0 top-0'
                                                                        // className={`form-control ${touched.quantities && errors.quantities?.[inventory.id] ? 'is-invalid' : ''}`}
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
                                <div className="col-md-6 position-relative">
                                <label className='font-14'>Notes: </label>
                                <Field as="textarea" className="form-control font-14" name='notes' autoComplete='off' rows="2" />
                                </div>
                                <div className="text-end mt-3">
                                    <button type='submit' className='submitBtn'>Submit</button>
                                    <button className='cancelBtn ms-3 rounded-2' type="button" onClick={() => { setShowReceivePoModal(false) }}>Cancel</button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </>
        )
    }

    const saveReceivedPO = async (values) => {
        setLoading(true);
        var raw = JSON.stringify({
            poId: poDetailsById?.poNumber,
            note:values?.notes,
            orderItemDetails: poDetailsById?.purchaseOrderInventories.map((inventory) => ({
                itemId: inventory.id,
                itemQuantity: values.quantities[inventory.id] || 0
            }))
        })
        try {
            const result = await postAPI('/update-order-quantity', raw);
            if (!result || result == "") {
                alert('Something went wrong');
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
                        getAllPurchaseOrders(inventoryParamters?.searchkey || null, inventoryParamters?.sortKey || null)
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
    return (
        <>
            {showAlerts}
            {loading ? <ShowLoader /> : <HideLoader />}
            <div className='mt-1' style={{ padding: "5px 20px" }}>
                <div className="row align-items-center ps-3">
                    <div className="col-4 p-1 position-relative">
                        <img src={Images.searchIcon} alt="search-icon" className="search-icon" />
                        <DynamicSearchComp placeholders={placeholders} onChange={(e) => { setInventoryParamters({ ...inventoryParamters, searchkey: e.target.value }); getAllPurchaseOrders(e.target.value, inventoryParamters.sortKey) }} />
                    </div>
                    <div className="col-8 text-end">

                    </div>
                </div>
            </div>
            <div className='invnetoryTable mt-2'>
                <table className="table table-responsive mt-2">
                    <thead>
                        <tr>
                            <th><input type="checkbox" className='cursor-pointer' onChange={handleSelectAll} checked={isAllSelected} /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('id')}>PO Number <img src={Images.sortIcon} alt="sort-icon" className='ms-2' title="Sort PO Number"/></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('status')}>Status<img src={Images.sortIcon} alt="sort-icon" className='ms-2' title="Sort Status"/></th>
                            <th scope="col" className=''>Vendor</th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('total_amount')}>Total Amount<img src={Images.sortIcon} alt="sort-icon" className='ms-2' title="Sort Total Amount"/></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('created_at')}>Ordered Date<img src={Images.sortIcon} alt="sort-icon" className='ms-2' title="Sort Ordered Date"/></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('delivery_date')}>Delivered Date<img src={Images.sortIcon} alt="sort-icon" className='ms-2' title="Sort Delivered Date"/></th>
                            <th scope="col" className=''>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchaseOrderDetails.length > 0 ? (
                            purchaseOrderDetails.map((order) => (
                                <tr key={order?.id}>
                                    <td>{order?.status == 1 || order?.status == 2 ? (<input type="checkbox" className='cursor-pointer' checked={selectedPoIds.includes(order?.id)} onChange={() => handleSelectPO(order?.id)} />) : null}</td>
                                    <td className='' >{order?.id}</td>
                                    <td>{order?.status == 1 ? 'Pending' : order?.status == 2 ? 'Partially Received' : 'Received'}</td>
                                    <td>{order?.vendor?.name}</td>
                                    <td>{order?.total_amount}</td>
                                    <td>{formatDate(order?.created_at)}</td>
                                    <td>{order?.delivery_date || '-'}</td>
                                    <td>{order?.status == 1 || order?.status == 2 ? (<FontAwesomeIcon icon={faCheck} className='cursor-pointer' title="Mark as received" style={{ height: '20px' }} onClick={() => { setShowReceivePoModal(true); getPurchaseOrderById(order?.id) }} />) : '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center">
                                    No Purchase Orders found
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
            <Popup show={showReceivePoModal} handleClose={() => setShowReceivePoModal(false)} size="lg" modalHeader="Receive Purchase Order" customTitle='modalTitle' modalBody={modalBodyReceivePurchaseOrder()} modalFooter={false} />
        </>
    )
}
