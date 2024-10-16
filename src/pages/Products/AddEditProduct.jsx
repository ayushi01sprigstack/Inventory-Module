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
        selectedCategory: '',
        description: '',
        quantity: '',
        minQuantity: '',
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
    }, []);
    useEffect(() => {
        getProductById();
    }, [categoriesAndVendors.vendors]);

    const getCategories = async () => {
        setLoading(true);
        try {
            const result = await getAPI('/get-categories');
            if (!result || result == '') {
                throw new Error('Something went wrong');
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
            setLoading(false);
        }
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
                setCategoriesAndVendors(prevState => ({
                    ...prevState,
                    vendors: responseRs
                }))
            }
        }
        catch (error) {
            console.error(error);
            setLoading(false);
        }
    }
    const getProductById = async () => {
        if (productId) {
            setLoading(true);
            try {
                const result = await getAPI(`/get-inventory-details/${productId}`);
                if (!result || result == '') {
                    throw new Error('Something went wrong');
                }
                else {
                    const responseRs = JSON.parse(result);
                    const vendorExists = categoriesAndVendors.vendors.length > 0 && categoriesAndVendors.vendors.some(vendor => vendor.id == responseRs.inventory_detail?.vendor_id);
                    setProductDetails(prevState => ({
                        ...prevState,
                        productName: responseRs?.name || '',
                        selectedCategory: responseRs?.category_id || '',
                        quantity: responseRs?.quantity || '',
                        minQuantity: responseRs?.reminder_quantity || '',
                        price: responseRs?.price || '',
                        description: responseRs?.description || '',
                        selectedVendor: vendorExists ? responseRs.inventory_detail?.vendor_id : ''
                    }))
                    setLoading(false);
                }
            }
            catch (error) {
                console.error(error);
                setLoading(false);
            }
        }
    }

    const submitProductDetails = async (values) => {
        setLoading(true);
        var raw = JSON.stringify({
            addUpdateFlag: productId ? 1 : 0,
            name: values?.productName,
            description: values?.description ? values?.description : null,
            quantity: values?.quantity,
            reminderQuantity: values?.minQuantity,
            price: values?.price,
            categoryId: values?.selectedCategory,
            vendorId: values?.selectedVendor,
            inventoryId: productId ? productId : 0
        })
        try {
            const result = await postAPI('/add-update-inventory', raw);
            if (!result || result == "") {
                throw new Error('Something went wrong');
            } else {
                const responseRs = JSON.parse(result);
                if (responseRs.status == 'success') {
                    setShowAlerts(<AlertComp show={true} variant="success" message={productId ? 'Inventory Updated successfully' : 'Inventory Added successfully'} />);
                    setTimeout(() => {
                        setLoading(false);
                        setShowAlerts(<AlertComp show={false} />);
                        navigate('/inventory');
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
            <div className='content-padding'>
                <div className="row">
                    <div className='col-md-6 offset-md-3'>
                        <div className='text-center'>
                            <h4 className='heading pt-2'>{productId ? 'Edit Inventory' : 'Add Inventory'}</h4>
                        </div>
                        <Formik initialValues={{ selectedCategory: productDetails?.selectedCategory, productName: productDetails?.productName, quantity: productDetails?.quantity, minQuantity: productDetails?.minQuantity, price: productDetails?.price, description: productDetails?.description, selectedVendor: productDetails?.selectedVendor }} validationSchema={ProductValidationSchema} enableReinitialize={true} onSubmit={submitProductDetails} validateOnBlur={false} validateOnChange={false}>
                            {() => (
                                <Form className='pt-4 mt-2' onKeyDown={(e) => {
                                    if (e.key == 'Enter') {
                                        e.preventDefault();
                                    }
                                }}>
                                    <div className="row">
                                        <div className="col-md-12 position-relative mb-5">
                                            <label className='fw-semibold text-white font-14'>Please Select Category for Product <span className='text-danger'>*</span></label>
                                            <Field as="select" name="selectedCategory" className="customInput mt-1">
                                                <option value="" className='text-black'>Select Category</option>
                                                {categoriesAndVendors?.categories.map((category) => (
                                                    <option key={category?.id} value={category?.id} className='text-black'>{category?.name}</option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name='selectedCategory' component="div" className="text-start errorText" />
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
                                            <label className='custom-label'>Min Stock Quantity <span className='text-danger'>*</span></label>
                                            <Field type="number" className="customInput" name='minQuantity' autoComplete='off' min={0} />
                                            <ErrorMessage name='minQuantity' component="div" className="text-start errorText" />
                                        </div>
                                        <div className='col-md-6 position-relative mb-5'>
                                            <label className='custom-label' style={{ left: '60px' }}>Price <span className='text-danger'>*</span></label>
                                            <div className="input-group flex-nowrap position-relative">
                                                <span className="input-group-text"><FontAwesomeIcon icon={faIndianRupeeSign} /></span>
                                                <Field type="number" className="customInput" name='price' autoComplete='off' min={0} step="0.01" style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }} />
                                                <ErrorMessage name='price' component="div" className="text-start errorText" style={{ top: "50px" }} />
                                            </div>
                                        </div>
                                        <div className='col-md-12 position-relative mb-4'>
                                            <label className='custom-label'>Product Description</label>
                                            <Field as="textarea" className="customInput" name='description' autoComplete='off' rows="4" />
                                        </div>
                                        <div className="col-md-12 position-relative mb-4">
                                            <label className='fw-semibold text-white font-14'>Please Select Vendor <span className='text-danger'>*</span></label>
                                            {categoriesAndVendors?.vendors.length > 0 ? (
                                                <>
                                                    <Field as="select" name="selectedVendor" className="customInput mt-1">
                                                        <option value="" className='text-black'>Select Vendor</option>
                                                        {categoriesAndVendors.vendors.map((vendor) => (
                                                            <option key={vendor?.id} value={vendor?.id} className='text-black'>{vendor?.name} ({vendor?.company_name})</option>
                                                        ))}
                                                    </Field>
                                                    <ErrorMessage name='selectedVendor' component="div" className="text-start errorText" />
                                                </>
                                            ) : (
                                                <>
                                                    <br />
                                                    <span className='text-white' style={{ fontSize: '13px' }}>Currently there are no vendors available so please add vendor first to select vendor</span>
                                                    <br />
                                                    <button type="button" className="productBtn mt-3" onClick={() => navigate('/add-update-vendor')}>
                                                        Add Vendor
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className='mt-2 text-end'>
                                        <button className='cancelBtn me-3' onClick={() => navigate('/inventory')}>Cancel</button>
                                        <button type="submit" className='saveBtn'>Save</button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </>
    )
}
