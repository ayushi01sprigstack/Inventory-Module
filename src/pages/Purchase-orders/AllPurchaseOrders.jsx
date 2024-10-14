import React, { act, useCallback, useEffect, useState } from 'react'
import { faCheck, faCircleInfo, faFilePdf, faSort, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ShowLoader from '../../components/loader/ShowLoader';
import HideLoader from '../../components/loader/HideLoader';
import DynamicSearchComp from '../../components/DynamicSearchComp';
import Images from '../../utils/Images';
import { debounce, formatDate } from '../../utils/js/Common';
import PaginationComp from '../../components/PaginationComp';
import useApiService from '../../services/ApiService';
import Popup from '../../components/Popup';
import Tab from '../../components/Tab';
import ReceivePoHistory from './ReceivePoHistory';
import ReceivePurchaseOrder from './ReceivePurchaseOrder';

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

    const getAllPurchaseOrders = debounce(async (searchkey, sortkey, sortFlag) => {
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
                throw new Error('Something went wrong');
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
    }, 50);

    const getPurchaseOrderById = async (orderId) => {
        try {
            const result = await getAPI(`/get-purchase-order-details/${orderId}`);
            if (!result || result == '') {
                throw new Error('Something went wrong');
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
                throw new Error('Something went wrong');
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
            <ReceivePurchaseOrder poDetailsById={poDetailsById} setShowReceivePoModal={setShowReceivePoModal} setShowAlerts={setShowAlerts} setLoading={setLoading} setSelectedPoIds={setSelectedPoIds} setIsAllSelected={setIsAllSelected} getAllPurchaseOrders={getAllPurchaseOrders} inventoryParamters={inventoryParamters} />
        )
    }

    const modalBodyReceivePoHistory = () => {
        return (
            <ReceivePoHistory purchaseOrderReceiveHistory={purchaseOrderReceiveHistory} setShowReceivePoHistory={setShowReceivePoHistory} />
        )
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
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('total_amount')} title="Sort Total Amount">Total Amount<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('created_at')} title="Sort Ordered Date">Ordered Date<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('delivery_date')} title="Sort Delivered Date">Delivered Date<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
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
