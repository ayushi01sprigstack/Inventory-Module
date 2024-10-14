import React, { act, useEffect, useState } from 'react'
import { faCheck, faCircleInfo, faFilePdf, faSort, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import ShowLoader from '../../components/loader/ShowLoader';
import HideLoader from '../../components/loader/HideLoader';
import DynamicSearchComp from '../../components/DynamicSearchComp';
import Images from '../../utils/Images';
import { convertToBase64, formatDate, typewatch } from '../../utils/js/Common';
import PaginationComp from '../../components/PaginationComp';
import useApiService from '../../services/ApiService';
import Popup from '../../components/Popup';
import ReceivePoValidationSchema from './ReceivePoValidationSchema';
import AlertComp from '../../components/AlertComp';
import Tab from '../../components/Tab';
import ReceivePoHistory from './ReceivePoHistory';

export default function AllPurchaseOrders() {
    const [loading, setLoading] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);
    const placeholders = [
        'Search by PO number',
        'Search by Vendor',
        'Search by Total Amount',
    ];
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
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
        orderNote: '',
        pdfAttachment: null
    })
    const [isEditingQuantity, setIsEditingQuantity] = useState(null);
    const [activeTab, setActiveTab] = useState(1); //1->Pending 2->Received
    const [showReceivePoHistory, setShowReceivePoHistory] = useState(false);
    const [purchaseOrderReceiveHistory, setPurchaseOrderReceiveHistory] = useState([]);
    const { getAPI, postAPI } = useApiService();
    var CDN_KEY = import.meta.env.VITE_CDN_KEY;
    const handlePageChange = (page) => {
        setCurrentPage(page);
    }

    useEffect(() => {
        getAllPurchaseOrders(inventoryParamters.searchkey || null, inventoryParamters.sortKey || null, inventoryParamters?.sortByFlag);
    }, [currentPage, itemsPerPage, activeTab])

    const getAllPurchaseOrders = async (searchkey, sortkey, sortFlag) => {
        typewatch(async function () {
            setLoading(true);
            const searchKeyParam = searchkey ? searchkey : null;
            // const updatedSortByFlag = sortkey ? (inventoryParamters.sortByFlag == 'desc' ? 'asc' : 'desc') : inventoryParamters.sortByFlag;
            // setInventoryParamters(prev => ({
            //     ...prev,
            //     sortByFlag: updatedSortByFlag
            // }));
            try {
                const result = await getAPI(`/all-purchase-orders/${activeTab}&${searchKeyParam}&${sortkey}&${sortFlag}&${currentPage}&${itemsPerPage}`);
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
                    orderNote: responseRs?.order_note,
                    pdfAttachment: responseRs?.receipt,
                }))
                setLoading(false);
            }
        }
        catch (error) {
            console.error(error);
            setLoading(false);
        }
    }
    const getPoReceiveHistoryById = async (orderId) => {
        try {
            const result = await getAPI(`/received-purchase-order-details/${orderId}`);
            if (!result || result == '') {
                alert('Something went wrong');
            }
            else {
                const responseRs = JSON.parse(result);
                setPurchaseOrderReceiveHistory(responseRs);
                setLoading(false);
            }
        }
        catch (error) {
            console.error(error);
            setLoading(false);
        }
    }

    const handleSortClick = (item) => {
        const newSortByFlag = inventoryParamters.sortKey ? (inventoryParamters.sortByFlag == 'desc' ? 'asc' : 'desc')
            : 'desc';
        setInventoryParamters({ ...inventoryParamters, sortKey: item, sortByFlag: newSortByFlag });
        getAllPurchaseOrders(inventoryParamters.searchkey, item, newSortByFlag);
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

    const modalBodyReceivePoHistory = () => {
        return (
            <ReceivePoHistory purchaseOrderReceiveHistory={purchaseOrderReceiveHistory} setShowReceivePoHistory={setShowReceivePoHistory} />
        )
    }
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
    const downloadPdf = (poPdf) => {
        const link = document.createElement('a');
        link.href = `${CDN_KEY}${poPdf}`;
        window.open(link.href, '_blank');
    }
    return (
        <>
            {showAlerts}
            {loading ? <ShowLoader /> : <HideLoader />}
            <div className='mt-1' style={{ padding: "5px 20px" }}>
                <div className="row align-items-center ps-3">
                    <div className="col-4 p-1 position-relative">
                        <img src={Images.searchIcon} alt="search-icon" className="search-icon" />
                        <DynamicSearchComp placeholders={placeholders} onChange={(e) => { setInventoryParamters({ ...inventoryParamters, searchkey: e.target.value }); getAllPurchaseOrders(e.target.value, inventoryParamters.sortKey, inventoryParamters?.sortByFlag) }} />
                    </div>
                    <div className="col-md-3 row mt-1 text-end">
                        <div className="col-md-6 text-white font-14">Items per page:</div>
                        <div className='col-md-6'>
                            <select className="w-100" value={itemsPerPage} onChange={(e) => {
                                setItemsPerPage(e.target.value);
                                setCurrentPage(1);
                            }}>
                                {[10, 20, 30].map(value => (
                                    <option key={value} value={value}>{value}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className='purchaseOrderLists p-0'>
                        <ul className="nav nav-tabs mt-3 custom-nav-tab">
                            <Tab isActive={activeTab == 1} label="Pending" onClick={() => setActiveTab(1)} col={'col-md-2'} />
                            <Tab isActive={activeTab == 2} label="Received" onClick={() => setActiveTab(2)} col={'col-md-2'} />
                        </ul>
                    </div>
                    {/* <div className='text-white font-14 mt-2'>Total Selected Purchase Orders : <span className='fw-bold'>{selectedPoIds?.length}</span></div> */}
                </div>
            </div>
            <div className='invnetoryTable mt-2'>
                <table className="table table-responsive mt-2">
                    <thead>
                        <tr>
                            {/* <th>{purchaseOrderDetails?.some(order => order?.status == 1) && (<input type="checkbox" className='cursor-pointer' onChange={handleSelectAll} checked={isAllSelected} />)}</th> */}
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('id')} title="Sort PO Number" >PO Number <FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className=''>Status</th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('vendorName')} title="Sort Vendor">Vendor<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('total_amount')} title="Sort Total Amount">Total Amount<FontAwesomeIcon icon={faSort} className='ms-2'/></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('created_at')} title="Sort Ordered Date">Ordered Date<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('delivery_date')} title="Sort Delivered Date">Delivered Date<FontAwesomeIcon icon={faSort} className='ms-2'/></th>
                            <th scope="col" className=''>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchaseOrderDetails.length > 0 ? (
                            purchaseOrderDetails.map((order) => (
                                <tr key={order?.id}>
                                    {/* <td>{order?.status == 1 ? (<input type="checkbox" className='cursor-pointer' checked={selectedPoIds.includes(order?.id)} onChange={() => handleSelectPO(order?.id)} />) : null}</td> */}
                                    <td className='' >{order?.id}</td>
                                    <td>{order?.status == 1 ? 'Pending' : 'Received'}</td>
                                    <td>{order?.vendor?.name}</td>
                                    <td>Rs. {order?.total_amount}</td>
                                    <td>{formatDate(order?.created_at)}</td>
                                    <td>{order?.delivery_date || '-'}</td>
                                    <td>
                                        <FontAwesomeIcon icon={faFilePdf} className='cursor-pointer me-2' style={{ height: '18px' }} title="Download pdf" onClick={() => downloadPdf(order?.po_pdf)} />
                                        {order?.status == 1 ? (<FontAwesomeIcon icon={faCheck} className='cursor-pointer' title="Receive Purchase Order" style={{ height: '18px' }} onClick={() => { setShowReceivePoModal(true); getPurchaseOrderById(order?.id) }} />) : <FontAwesomeIcon icon={faCircleInfo} className='cursor-pointer' title="Show purchase order receive history" style={{ height: '18px' }} onClick={() => { setShowReceivePoHistory(true); getPoReceiveHistoryById(order?.id) }} />}
                                    </td>
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
            <Popup show={showReceivePoHistory} handleClose={() => setShowReceivePoHistory(false)} size="lg" modalHeader="Received Purchase Order History" customTitle='modalTitle' modalBody={modalBodyReceivePoHistory()} modalFooter={false} />
        </>
    )
}
