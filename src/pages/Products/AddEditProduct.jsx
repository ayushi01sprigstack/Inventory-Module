import React, { useEffect, useState } from 'react'
import { Field, Formik, Form, ErrorMessage } from 'formik'
import ProductValidationSchema from './ProductValidationSchema'
import ShowLoader from '../../components/loader/ShowLoader';
import HideLoader from '../../components/loader/HideLoader';
import useApiService from '../../services/ApiService';
import { faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AlertComp from '../../components/AlertComp';
export default function AddEditProduct() {
    const [productDetails, setProductDetails] = useState({
        productName: '',
        sku: '',
        selectedCategory: '',
        description: '',
        quantity: '',
        price: '',
        selectedVendor: ''
    });
    const [categoriesAndVendors, setCategoriesAndVendors] = useState({
        categories: [],
        vendors: []
    });
    const [loading, setLoading] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);
    const { getAPI, postAPI } = useApiService();
    const navigate = useNavigate();
    const location = useLocation();
    const productId = location.state?.productId;
    useEffect(() => {
        getCategories();
        getVendors();
        getProductById();
    }, [])
    const getCategories = async () => {
        setLoading(true);
        try {
            const result = await getAPI('/get-categories');
            if (!result || result == '') {
                alert('Something went wrong');
            }
            else {
                const responseRs = JSON.parse(result);
                setLoading(false);
                setCategoriesAndVendors(prevState => ({
                    ...prevState,
                    categories: responseRs
                }))
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    const getVendors = async () => {
        setLoading(true);
        try {
            const result = await getAPI('/get-vendors');
            if (!result || result == '') {
                alert('Something went wrong');
            }
            else {
                const responseRs = JSON.parse(result);
                setLoading(false);
                setCategoriesAndVendors(prevState => ({
                    ...prevState,
                    vendors: responseRs
                }))
            }
        }
        catch (error){
            console.error(error);
        }
    }
    const getProductById = async () => {
        if (productId) {
            setLoading(true);
            try {
                const result = await getAPI(`/get-product-details/${productId}`);
                if (!result || result == '') {
                    alert('Something went wrong');
                }
                else {
                    const responseRs = JSON.parse(result);
                    setProductDetails(prevState => ({
                        ...prevState,
                        productName: responseRs?.name || '',
                        sku: responseRs?.sku || '',
                        selectedCategory: responseRs?.category_id || '',
                        quantity: responseRs?.quantity || '',
                        price: responseRs?.price || '',
                        description: responseRs?.description || '',
                        selectedVendor: responseRs?.vendor_id || ''
                    }))
                    setLoading(false);
                }
            }
            catch (error) {
                console.error(error);
            }
        }
    }
    const submitProductDetails = async (values) => {
        setLoading(true);
        var raw = JSON.stringify({
            addUpdateFlag: productId ? 1 : 0,
            sku: values?.sku,
            name: values?.productName,
            description: values?.description ? values?.description : null,
            quantity: values?.quantity,
            price: values?.price,
            categoryId: values?.selectedCategory,
            vendorId: values?.selectedVendor,
            productId: productId ? productId : 0
        })
        try {
            const result = await postAPI('/add-update-product', raw);
            if (!result || result == "") {
                alert('Something went wrong');
            } else {
                const responseRs = JSON.parse(result);
                if (responseRs.status == 'success') {
                    setShowAlerts(<AlertComp show={true} variant="success" message={productId ? 'Product Updated successfully' : 'Product Added successfully'} />);
                    setTimeout(() => {
                        setLoading(false);
                        setShowAlerts(<AlertComp show={false} />);
                        navigate('/products');
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
            <div className="row p-4">
                <div className='col-md-6 offset-md-3'>
                    <div className='text-center'>
                        <h4 className='heading pt-2'>{productId ? 'Edit Product' : 'Add Product'}</h4>
                    </div>
                    <Formik initialValues={{ selectedCategory: productDetails?.selectedCategory, sku: productDetails?.sku, productName: productDetails?.productName, quantity: productDetails?.quantity, price: productDetails?.price, description: productDetails?.description, selectedVendor: productDetails?.selectedVendor }} validationSchema={ProductValidationSchema} enableReinitialize={true} onSubmit={submitProductDetails} >
                        {() => (
                            <Form className='pt-4 mt-2' onKeyDown={(e) => {
                                if (e.key == 'Enter') {
                                    e.preventDefault();
                                }
                            }}>
                                <div className="row">
                                    <div className="col-md-12 position-relative mb-5">
                                        <label className='fw-semibold text-white' style={{ fontSize: '14px' }}>Please Select Category for Product <span className='text-danger'>*</span></label>
                                        <Field as="select" name="selectedCategory" className="customInput mt-1">
                                            <option value="" className='text-black'>Select Category</option>
                                            {categoriesAndVendors?.categories.map((category) => (
                                                <option key={category?.id} value={category?.id} className='text-black'>{category?.name}</option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name='selectedCategory' component="div" className="text-start errorText" />
                                    </div>
                                    <div className='col-md-6 position-relative mb-5'>
                                        <label className='custom-label'>SKU <span className='text-danger'>*</span></label>
                                        <Field type="text" className="customInput" name='sku' autoComplete='off' />
                                        <ErrorMessage name='sku' component="div" className="text-start errorText" />
                                    </div>
                                    <div className='col-md-6 position-relative mb-5'>
                                        <label className='custom-label'>Name <span className='text-danger'>*</span></label>
                                        <Field type="text" className="customInput" name='productName' autoComplete='off' />
                                        <ErrorMessage name='productName' component="div" className="text-start errorText" />
                                    </div>
                                    <div className='col-md-6 position-relative mb-5'>
                                        <label className='custom-label'>Quantity <span className='text-danger'>*</span></label>
                                        <Field type="number" className="customInput" name='quantity' autoComplete='off' min={0} />
                                        <ErrorMessage name='quantity' component="div" className="text-start errorText" />
                                    </div>
                                    <div className='col-md-6 position-relative mb-5'>
                                        <label className='custom-label' style={{ left: '50px' }}>Price <span className='text-danger'>*</span></label>
                                        <div className="input-group flex-nowrap position-relative">
                                            <span className="input-group-text"><FontAwesomeIcon icon={faIndianRupeeSign} /></span>
                                            <Field type="number" className="customInput" name='price' autoComplete='off' min={0} style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }} />
                                            <ErrorMessage name='price' component="div" className="text-start errorText" style={{ top: "50px" }} />
                                        </div>
                                    </div>
                                    <div className='col-md-12 position-relative mb-4'>
                                        <label className='custom-label'>Product Description</label>
                                        <Field as="textarea" className="customInput" name='description' autoComplete='off' rows="4" />
                                    </div>
                                    <div className="col-md-12 position-relative mb-4">
                                        <label className='fw-semibold text-white' style={{ fontSize: '14px' }}>Please Select Vendor <span className='text-danger'>*</span></label>
                                        <Field as="select" name="selectedVendor" className="customInput mt-1">
                                            <option value="" className='text-black'>Select Vendor</option>
                                            {categoriesAndVendors?.vendors.map((vendor) => (
                                                <option key={vendor?.id} value={vendor?.id} className='text-black'>{vendor?.name} ({vendor?.company_name})</option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name='selectedVendor' component="div" className="text-start errorText" />
                                    </div>
                                </div>
                                <div className='mt-2 text-end'>
                                    <button type="submit" className='saveBtn'>Save</button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </>
    )
}
