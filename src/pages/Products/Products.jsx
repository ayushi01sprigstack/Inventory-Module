import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useApiService from '../../services/ApiService';
import ShowLoader from '../../components/loader/ShowLoader';
import HideLoader from '../../components/loader/HideLoader';
import Swal from 'sweetalert2';
import AlertComp from '../../components/AlertComp';
import Images from '../../utils/Images';
import PaginationComp from '../../components/PaginationComp';
import { debounce } from '../../utils/js/Common';
import Popup from '../../components/Popup';
import DynamicSearchComp from '../../components/DynamicSearchComp';
import UtilizationPopupBody from '../../components/UtilizationPopupBody';
import PurchaseOrderPopupBody from '../../components/PurchaseOrderPopupBody';
import { faBoxOpen, faCircleInfo, faReceipt, faSort } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UtilizationAndPoHistory from '../../components/UtilizationAndPoHistory';

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
    const [itemsPerPage, setItemsPerPage] = useState(10);
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
        totalQuantity: '',
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
    const [usageHistoryDetails, setUsageHistoryDetails] = useState([]);
    const [purchaseOrderHistory, setPurchaseOrderHistory] = useState([]);
    const [showInfoPopup, setShowInfoPopup] = useState(false);
    const [allvendors, setAllVendors] = useState([]);
    const [selectedItemsDetails, setSelectedItemsDetails] = useState([]);

    useEffect(() => {
        getAllProducts(inventoryParamters.searchkey || null, inventoryParamters.sortKey || null, inventoryParamters?.sortByFlag);
    }, [currentPage, itemsPerPage])

    const getAllProducts = debounce(async (searchkey, sortkey, sortFlag) => {
        setLoading(true);
        const searchKeyParam = searchkey ? searchkey : null;
        try {
            const result = await getAPI(`/all-inventories/${searchKeyParam}&${sortkey}&${sortFlag}&${currentPage}&${itemsPerPage}`);
            if (!result || result == '') {
                throw new Error('Something went wrong');
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
    }, 50);
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
                        throw new Error('Something went wrong');
                    }
                    else {
                        setShowAlerts(<AlertComp show={true} variant="success" message="Product deleted successfully" />);
                        setTimeout(() => {
                            setLoading(false);
                            setShowAlerts(<AlertComp show={false} />);
                            getAllProducts(inventoryParamters.searchkey ? inventoryParamters.searchkey : null, inventoryParamters.sortKey || null, inventoryParamters?.sortByFlag);
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
        const newSortByFlag = inventoryParamters.sortKey ? (inventoryParamters.sortByFlag == 'desc' ? 'asc' : 'desc')
            : 'desc';
        setInventoryParamters({ ...inventoryParamters, sortKey: item, sortByFlag: newSortByFlag });
        getAllProducts(inventoryParamters.searchkey, item, newSortByFlag);
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
    const getInventoryDataById = async (productId) => {
        setLoading(true);
        try {
            const result = await getAPI(`/get-inventory-details/${productId}`);
            if (!result || result == '') {
                throw new Error('Something went wrong');
            }
            else {
                const responseRs = JSON.parse(result);
                setPoDetails(prevState => ({
                    ...prevState,
                    inventoryId: responseRs?.id || '',
                    inventoryName: responseRs?.name || '',
                    totalQuantity: responseRs?.inventory_detail?.quantity,
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

    const modalBodyAddUtilization = () => {
        return (
            <UtilizationPopupBody inventoryId={inventoryId} setShowAlerts={setShowAlerts} setLoading={setLoading} setShowUtlizationPopup={setShowUtlizationPopup} getAllProducts={getAllProducts} searchKey={inventoryParamters?.searchkey} sortKey={inventoryParamters?.sortKey} sortFlag={inventoryParamters?.sortByFlag} />
        )
    }
    const modalBodyPurchaseOrder = () => {
        return (
            <PurchaseOrderPopupBody previewPo={previewPo} setPreviewPo={setPreviewPo} selectedInventoryIds={selectedInventoryIds} poDetails={poDetails} setPoDetails={setPoDetails} selectedItemsDetails={selectedItemsDetails} setShowAlerts={setShowAlerts} setLoading={setLoading} setSelectedInventoryIds={setSelectedInventoryIds} setIsAllSelected={setIsAllSelected} setPreviewErrorMsg={setPreviewErrorMsg} allvendors={allvendors} previewErrorMsg={previewErrorMsg} products={products} setShowPoModal={setShowPoModal} getAllProducts={getAllProducts} searchKey={inventoryParamters?.searchkey} sortKey={inventoryParamters?.sortKey} sortFlag={inventoryParamters?.sortByFlag} />
        )
    }
    const modalBodyInfoPopup = () => {
        return (
            <UtilizationAndPoHistory poDetails={poDetails} purchaseOrderHistory={purchaseOrderHistory} usageHistoryDetails={usageHistoryDetails} setShowInfoPopup={setShowInfoPopup} />
        )
    }

    const getVendors = async () => {
        setLoading(true);
        try {
            const result = await getAPI('/get-vendors-data');
            if (!result || result == '') {
                throw new Error('Something went wrong');
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

    return (
        <>
            {showAlerts}
            {loading ? <ShowLoader /> : <HideLoader />}
            <div className='mt-1' style={{ padding: "5px 20px" }}>
                <div className="row align-items-center ps-3">
                    <div className="col-4 p-1 position-relative">
                        <img src={Images.searchIcon} alt="search-icon" className="search-icon" />
                        <DynamicSearchComp placeholders={placeholders} onChange={(e) => { setInventoryParamters({ ...inventoryParamters, searchkey: e.target.value }); getAllProducts(e.target.value, inventoryParamters.sortKey, inventoryParamters?.sortByFlag) }} />
                    </div>
                    <div className="col-8 text-end">
                        <button className='productBtn' onClick={() => navigate('/add-update-inventory')}> <img src={Images.addIcon} alt="addIcon" className='me-1' />Add Inventory</button>
                        {selectedInventoryIds.length > 1 &&
                            <button className='productBtn' onClick={handleGenerateMultiplePo}> <img src={Images.poIcon} alt="po-icon" className='me-1 ms-3' style={{ height: '20px' }} />Generate PO</button>
                        }
                        <div className='redText mt-2'>*Low stock quantity. Please reorder</div>
                        <div className='font-14 mt-1' style={{ color: '#79E07D' }}><img src={Images.greenCircle} alt="active" className='me-2' style={{ height: '14px' }} />Purchase order is active on this inventory</div>
                    </div>
                    <div className='col-md-9 text-white font-14'>
                        Total Selected Inventories : <span className='fw-bold'>{selectedInventoryIds?.length}</span>
                    </div>
                    <div className="col-md-3 row mt-1">
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
                </div>
            </div>
            <div className='invnetoryTable mt-2'>
                <table className="table table-responsive mt-2">
                    <thead>
                        <tr>
                            <th><input type="checkbox" className='cursor-pointer' onChange={handleSelectAll} checked={isAllSelected} /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('name')} title="Sort Inventory" >Inventory <FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('quantity')} title="Sort Quantity" >Current Qty<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('reminder_quantity')} title="Sort Min Stock Qty">Min Stock Qty<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('price')} title="Sort Price">Price<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('vendorName')} title="Sort Vendor">Vendor<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className=''>PO</th>
                            <th scope="col" className=''>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map((product) => (
                                <tr key={product?.id} className={product?.needsPurchaseOrderFlag == 1 ? 'redText' : ''}>
                                    <td><input type="checkbox" className='cursor-pointer' checked={selectedInventoryIds.includes(product?.id)} onChange={() => handleSelectInventory(product?.id)} /></td>
                                    <td className='' onClick={() => { setShowUsageHistory(true); getInventoryDataById(product?.id) }}>{product?.name}</td>
                                    <td>{product?.quantity}</td>
                                    <td>{product?.reminder_quantity}</td>
                                    <td>Rs. {product?.price}</td>
                                    <td>{product?.inventory_detail?.vendor?.name}</td>
                                    <td>
                                        <div className='d-flex align-items-center'>
                                            <img src={Images.poIcon} alt="po-icon" className='cursor-pointer' title="Generate PO" style={{ height: '20px' }} onClick={() => { setShowPoModal(true); getInventoryDataById(product?.id); getVendors(); setPreviewPo(false); setPreviewErrorMsg('') }} />
                                            {product?.hasActivePurchaseOrderFlag == 1 &&
                                                <img src={Images.greenCircle} alt="active" className='ms-2' style={{ height: '14px' }} title="Active po" />
                                            }
                                        </div>
                                    </td>
                                    <td>
                                        <div className='d-flex align-items-center'>
                                            <img src={Images.editIcon} className='cursor-pointer text-white me-2' alt="edit" style={{ height: '15px' }} title="Edit item" onClick={() => navigate('/add-update-inventory', { state: { productId: product?.id } })} />
                                            <img src={Images.deleteIcon} className='cursor-pointer text-white me-2' alt="delete" style={{ height: '15px' }} title="Delete item" onClick={() => handleDeleteProduct(product?.id)} />
                                            <img src={Images.utilization} alt="utilization" className='cursor-pointer text-white me-2' style={{ height: '22px' }} title='Add utilization quantity' onClick={() => { setShowUtlizationPopup(true); setInventoryId(product?.id) }} />
                                            <FontAwesomeIcon icon={faCircleInfo} className='cursor-pointer' title="Show Utillzation and PO History" onClick={() => { setShowInfoPopup(true); getInventoryDataById(product?.id) }} />
                                        </div>
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
            <Popup show={showUtlizationPopup} handleClose={() => setShowUtlizationPopup(false)} size="md" modalHeader="Add Utilization Quantity" modalBody={modalBodyAddUtilization()} customTitle='modalTitle' modalFooter={false} />
            <Popup show={showPoModal} handleClose={() => { setShowPoModal(false); setPreviewErrorMsg(''); setSelectedInventoryIds([]); setIsAllSelected(false); setPreviewPo(false) }} size="lg" modalHeader="Generate Purchase Order" modalBody={modalBodyPurchaseOrder()} customTitle='modalTitle' modalFooter={false} />
            <Popup show={showInfoPopup} handleClose={() => setShowInfoPopup(false)} size="lg" modalHeader="Inventory Utilization and Purchase Order History" customTitle='customTitle modalTitle' modalBody={modalBodyInfoPopup()} modalFooter={false} />
        </>
    )
}
