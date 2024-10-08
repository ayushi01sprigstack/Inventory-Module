import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useApiService from '../../services/ApiService';
import ShowLoader from '../../components/loader/ShowLoader';
import HideLoader from '../../components/loader/HideLoader';
import Swal from 'sweetalert2';
import AlertComp from '../../components/AlertComp';
import Images from '../../utils/Images';
import PaginationComp from '../../components/PaginationComp';
import { typewatch } from '../../utils/js/Common';
import Popup from '../../components/Popup';
import DynamicSearchComp from '../../components/DynamicSearchComp';
import UtilizationPopupBody from '../../components/UtilizationPopupBody';
import PurchaseOrderPopupBody from '../../components/PurchaseOrderPopupBody';
import { faBoxOpen, faReceipt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UtliizationHistory from '../../components/UtliizationHistory';
import PoHistory from '../../components/PoHistory';

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
    const [usageHistoryDetails, setUsageHistoryDetails] = useState([]);
    const [purchaseOrderHistory, setPurchaseOrderHistory] = useState([]);
    const [showUtilizationHistory, setShowUtilizationHistory] = useState(false);
    const [showPoHistory, setShowPoHistory] = useState(false);
    const [allvendors, setAllVendors] = useState([]);
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
            <UtilizationPopupBody inventoryId={inventoryId} setShowAlerts={setShowAlerts} setLoading={setLoading} setShowUtlizationPopup={setShowUtlizationPopup} getAllProducts={getAllProducts} searchKey={inventoryParamters?.searchkey} sortKey={inventoryParamters?.sortKey}/>
        )
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
    const modalBodyPurchaseOrder = () => {
        return (
           <PurchaseOrderPopupBody previewPo={previewPo} setPreviewPo={setPreviewPo} selectedInventoryIds={selectedInventoryIds} poDetails={poDetails} setPoDetails={setPoDetails} selectedItemsDetails={selectedItemsDetails} setShowAlerts={setShowAlerts} setLoading={setLoading} setSelectedInventoryIds={setSelectedInventoryIds} setIsAllSelected={setIsAllSelected} setPreviewErrorMsg={setPreviewErrorMsg} allvendors={allvendors} previewErrorMsg={previewErrorMsg} products={products} setShowPoModal={setShowPoModal} getAllProducts={getAllProducts} searchKey={inventoryParamters?.searchkey} sortKey={inventoryParamters?.sortKey}/>
        )
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
                        <br />
                        <span className='font-14' style={{color:'#79E07D'}}><img src={Images.greenCircle} alt="active" className='me-2' style={{ height: '14px' }}  />Purchase order is active on this inventory</span>
                    </div>
                </div>
            </div>
            <div className='invnetoryTable mt-2'>
                <table className="table table-responsive mt-2">
                    <thead>
                        <tr>
                            <th><input type="checkbox" className='cursor-pointer' onChange={handleSelectAll} checked={isAllSelected} /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('name')}>Inventory <img src={Images.sortIcon} alt="sort-icon" className='ms-2' title="Sort Inventory"/></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('quantity')}>Qty<img src={Images.sortIcon} alt="sort-icon" className='ms-2' title="Sort Quantity"/></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('reminder_quantity')}>Min Stock Qty<img src={Images.sortIcon} alt="sort-icon" className='ms-2' title="Sort Min Stock Qty"/></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('price')}>Price<img src={Images.sortIcon} alt="sort-icon" className='ms-2' title="Sort Price"/></th>
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
                                    <td className='' onClick={() => { setShowUsageHistory(true); getInventoryDataById(product?.id) }}>{product?.name}</td>
                                    <td>{product?.quantity}</td>
                                    <td>{product?.reminder_quantity}</td>
                                    <td>Rs. {product?.price}</td>
                                    <td>{product?.inventory_detail?.vendor?.name}</td>
                                    <td>
                                        <div className='d-flex align-items-center'>
                                        <img src={Images.editIcon} className='cursor-pointer text-white me-2' alt="edit" style={{ height: '15px' }} title="Edit item" onClick={() => navigate('/add-update-inventory', { state: { productId: product?.id } })} />
                                        <img src={Images.deleteIcon} className='cursor-pointer text-white me-2' alt="delete" style={{ height: '15px' }} title="Delete item" onClick={() => handleDeleteProduct(product?.id)} />
                                        <img src={Images.utilization} alt="utilization" className='cursor-pointer text-white me-2' style={{ height: '22px' }} title='Add utilization quantity' onClick={() => { setShowUtlizationPopup(true); setInventoryId(product?.id) }} />
                                        <FontAwesomeIcon icon={faBoxOpen} className='cursor-pointer' title="Show Utilization History" style={{ height: '16px' }} onClick={()=> {setShowUtilizationHistory(true); getInventoryDataById(product?.id)}}/>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='d-flex align-items-center'>
                                        <img src={Images.poIcon} alt="po-icon" className='cursor-pointer' title="Generate PO" style={{ height: '20px' }} onClick={() => { setShowPoModal(true); getInventoryDataById(product?.id); getVendors(); setPreviewPo(false); setPreviewErrorMsg('') }}/>
                                        <FontAwesomeIcon icon={faReceipt} className='cursor-pointer ms-2' title="Show PO History" style={{ height: '18px' }} onClick={()=> {setShowPoHistory(true); getInventoryDataById(product?.id)}}/>
                                        {product?.hasActivePurchaseOrderFlag == 1 &&
                                            <img src={Images.greenCircle} alt="active" className='ms-2' style={{ height: '14px' }} title="Active po" />
                                        }
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
            <Popup show={showUtlizationPopup} handleClose={() => setShowUtlizationPopup(false)} size="md" modalHeader="Add Utilization Quantity" modalBody={modalBody()} customTitle='modalTitle' modalFooter={false} />
            <Popup show={showPoModal} handleClose={() => { setShowPoModal(false); setPreviewErrorMsg(''); setSelectedInventoryIds([]); setIsAllSelected(false);setPreviewPo(false) }} size="lg" modalHeader="Generate Purchase Order" modalBody={modalBodyPurchaseOrder()} customTitle='modalTitle' modalFooter={false} />
            <Popup show={showUtilizationHistory} handleClose={() => setShowUtilizationHistory(false)} size="lg" modalHeader="Inventory Utilization History" customTitle='customTitle modalTitle' modalBody={<UtliizationHistory usageHistoryDetails={usageHistoryDetails} poDetails={poDetails} setShowUtilizationHistory={setShowUtilizationHistory}/>} modalFooter={false} />
            <Popup show={showPoHistory} handleClose={() => setShowPoHistory(false)} size="lg" modalHeader="Purchase Order History" customTitle='customTitle modalTitle' modalBody={<PoHistory purchaseOrderHistory={purchaseOrderHistory} poDetails={poDetails} setShowPoHistory={setShowPoHistory}/>} modalFooter={false} />
        </>
    )
}
