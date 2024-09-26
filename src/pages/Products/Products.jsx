import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useApiService from '../../services/ApiService';
import ShowLoader from '../../components/loader/ShowLoader';
import HideLoader from '../../components/loader/HideLoader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import AlertComp from '../../components/AlertComp';

export default function Products() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);
    const [products, setProducts] = useState([]);
    const { getAPI, postAPI } = useApiService();
    useEffect(() => {
        getAllProducts();
    }, [])
    const getAllProducts = async () => {
        setLoading(true);
        try {
            const result = await getAPI('/get-products');
            if (!result || result == '') {
                alert('Something went wrong');
            }
            else {
                const responseRs = JSON.parse(result);
                setLoading(false);
                setProducts(responseRs);
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
                    const result = await postAPI(`/delete-product/${productId}`);
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
    return (
        <>
            {showAlerts}
            {loading ? <ShowLoader /> : <HideLoader />}
            <div className='text-end px-2 py-1 mt-2'>
                <button className='productBtn' onClick={() => navigate('/add-update-product')}>Add Product</button>
                <br />
                <span className='redText'>*Current stock quantity is below the minimum stock quantity required.</span>
            </div>
            <div>
                <table className="table table-responsive mt-2">
                    <thead>
                        <tr>
                            <th scope="col">Sku</th>
                            <th scope="col">Product Name</th>
                            <th scope="col">Quantity</th>
                            <th scope="col">Min Stock Quantity</th>
                            <th scope="col">Price</th>
                            <th scope="col">Vendor Name</th>
                            <th scope="col">Action</th>
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
                                        <FontAwesomeIcon icon={faPenToSquare} className='cursor-pointer text-white me-3' onClick={() => navigate('/add-update-product', { state: { productId: product?.id } })} />
                                        <FontAwesomeIcon icon={faTrash} className='cursor-pointer text-white' onClick={() => handleDeleteProduct(product?.id)} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">
                                    No products found
                                </td>
                            </tr>
                        )
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}
