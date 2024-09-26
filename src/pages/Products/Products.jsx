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
        sortByFlag: 'asc'
    })
    const { getAPI, postAPI } = useApiService();

    useEffect(() => {
        let currentIndex = 0;
        const intervalId = setInterval(() => {
            setPlaceholder(placeholders[currentIndex]);
            currentIndex = (currentIndex + 1) % placeholders.length;
        }, 2000);
        return () => clearInterval(intervalId);
    }, []);
    useEffect(() => {
        getAllProducts();
    }, [currentPage])

    const getAllProducts = async () => {
        setLoading(true);
        const searchKeyParam = inventoryParamters.searchkey ? inventoryParamters.searchkey : null
        const updatedSortByFlag = inventoryParamters?.sortByFlag
        if(inventoryParamters?.sortKey){
            updatedSortByFlag = inventoryParamters.sortByFlag == 'asc'?'desc':'asc'
        }
        try {
            const result = await getAPI('/all-inventories/' + searchKeyParam + "&" + inventoryParamters?.sortKey + "&" + updatedSortByFlag + "&" + currentPage + "&" + itemsPerPage);
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
                            getAllProducts();
                        }, 2500);
                    }
                } catch (error) {
                    console.error('Failed to delete product:', error);
                    // Swal.fire(
                    //     'Error!',
                    //     'There was a problem deleting the product.',
                    //     'error'
                    // );
                }
            }
        })
    }
    const handleSortClick = (item) => {
        setInventoryParamters({ ...inventoryParamters, sortKey: item });
        getAllProducts();
    }

    return (
        <>
            {showAlerts}
            {loading ? <ShowLoader /> : <HideLoader />}
            <div className='px-3 py-2'>
                <div className="row align-items-center ps-3">
                    <div className="col-4 p-1 position-relative">
                        <img src={Images.searchIcon} alt="search-icon" className="search-icon" style={{ left: '10px', top: '53%' }} />
                        <input type="text" className="form-control" placeholder={placeholder} style={{ padding: '.375rem 1.75rem' }} onChange={(e) => { setInventoryParamters({ ...inventoryParamters, searchkey: e.target.value }); getAllProducts() }} />
                    </div>
                    <div className="col-8 text-end">
                        <button className='productBtn' onClick={() => navigate('/add-update-inventory')}>Add Item</button>
                        <br />
                        <span className='redText'>*Current stock quantity is below the minimum stock quantity required.</span>
                    </div>
                </div>
            </div>
            <div>
                <table className="table table-responsive">
                    <thead>
                        <tr>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('sku')}>Sku<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('name')}>Item Name<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('quantity')}>Quantity<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('reminder_quantity')}>Min Stock Quantity<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('price')}>Price<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer'>Vendor Name<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
                            <th scope="col" className='cursor-pointer'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map((product) => (
                                <tr key={product?.id} className={product?.purchaseOrderFlag == 1 ? 'redText' : ''}>
                                    <td>{product?.sku}</td>
                                    <td>{product?.name}</td>
                                    <td>{product?.quantity}</td>
                                    <td>{product?.reminder_quantity}</td>
                                    <td>{product?.price}</td>
                                    <td>{product?.vendor?.name}</td>
                                    <td>
                                        <FontAwesomeIcon icon={faPenToSquare} className='cursor-pointer text-white me-3' onClick={() => navigate('/add-update-inventory', { state: { productId: product?.id } })} />
                                        <FontAwesomeIcon icon={faTrash} className='cursor-pointer text-white' onClick={() => handleDeleteProduct(product?.id)} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">
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
        </>
    )
}
