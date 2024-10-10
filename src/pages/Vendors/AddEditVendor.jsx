import React, { useEffect, useState } from 'react'
import VendorValidationSchema from './VendorValidationSchema';
import { Field, Formik, Form, ErrorMessage } from 'formik'
import AlertComp from '../../components/AlertComp';
import ShowLoader from '../../components/loader/ShowLoader';
import HideLoader from '../../components/loader/HideLoader';
import { useLocation, useNavigate } from 'react-router-dom';
import useApiService from '../../services/ApiService';
export default function AddEditVendor() {
    const [vendorDetails, setVendorDetails] = useState({
        vendorName: '',
        email: '',
        companyName: '',
        contactNum: '',
        address: '',
        inventories:[]
    });
    const [loading, setLoading] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);
    const location = useLocation();
    const vendorId = location.state?.vendorId;
    const { getAPI, postAPI } = useApiService();
    const navigate = useNavigate();

    useEffect(() => {
        getVendorById();
    }, [])
    const getVendorById = async () => {
        if (vendorId) {
            setLoading(true);
            try {
                const result = await getAPI(`/get-vendor-details/${vendorId}`);
                if (!result || result == '') {
                    alert('Something went wrong');
                }
                else {
                    const responseRs = JSON.parse(result);
                    setVendorDetails(prevState => ({
                        ...prevState,
                        vendorName: responseRs?.name || '',
                        email: responseRs?.email || '',
                        companyName: responseRs?.company_name || '',
                        contactNum: responseRs?.contact_num || '',
                        address: responseRs?.address || '',
                        inventories:responseRs?.inventory_details
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

    const submitVendorDetails = async (values) => {
        setLoading(true);
        var raw = JSON.stringify({
            addUpdateFlag: vendorId ? 1 : 0,
            name: values?.vendorName,
            email: values?.email,
            contactNum: values?.contactNum,
            address: values?.address,
            companyName: values?.companyName,
            vendorId: vendorId ? vendorId : 0,
        })
        try {
            const result = await postAPI('/add-update-vendor', raw);
            if (!result || result == "") {
                alert('Something went wrong');
            } else {
                const responseRs = JSON.parse(result);
                if (responseRs.status == 'success') {
                    setShowAlerts(<AlertComp show={true} variant="success" message={vendorId ? 'Vendor Updated successfully' : 'Vendor Added successfully'} />);
                    setTimeout(() => {
                        setLoading(false);
                        setShowAlerts(<AlertComp show={false} />);
                        navigate('/vendors');
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
                            <h4 className='heading pt-2'>{vendorId ? 'Edit Vendor' : 'Add Vendor'}</h4>
                        </div>
                        <Formik initialValues={{ vendorName: vendorDetails?.vendorName, email: vendorDetails?.email, companyName: vendorDetails?.companyName, contactNum: vendorDetails?.contactNum, address: vendorDetails?.address }} validationSchema={VendorValidationSchema} enableReinitialize={true} onSubmit={submitVendorDetails} validateOnBlur={false} validateOnChange={false}>
                            {() => (
                                <Form className='pt-4 mt-2' onKeyDown={(e) => {
                                    if (e.key == 'Enter') {
                                        e.preventDefault();
                                    }
                                }}>
                                    <div className="row">
                                        <div className='col-md-6 position-relative mb-5'>
                                            <label className='custom-label'>Name <span className='text-danger'>*</span></label>
                                            <Field type="text" className="customInput" name='vendorName' autoComplete='off' />
                                            <ErrorMessage name='vendorName' component="div" className="text-start errorText" />
                                        </div>
                                        <div className='col-md-6 position-relative mb-5'>
                                            <label className='custom-label'>Email <span className='text-danger'>*</span></label>
                                            <Field type="email" className="customInput" name='email' autoComplete='off' />
                                            <ErrorMessage name='email' component="div" className="text-start errorText" />
                                        </div>
                                        <div className='col-md-6 position-relative mb-5'>
                                            <label className='custom-label'>Company Name <span className='text-danger'>*</span></label>
                                            <Field type="text" className="customInput" name='companyName' autoComplete='off' />
                                            <ErrorMessage name='companyName' component="div" className="text-start errorText" />
                                        </div>
                                        <div className='col-md-6 position-relative mb-5'>
                                            <label className='custom-label' style={{ left: '70px' }}>Contact Number <span className='text-danger'>*</span></label>
                                            <div className="input-group flex-nowrap position-relative">
                                                <span className="input-group-text">+91</span>
                                                <Field type="text" className="customInput" name='contactNum' autoComplete='off' style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }} />
                                                <ErrorMessage name='contactNum' component="div" className="text-start errorText" style={{ top: "50px" }} />
                                            </div>
                                        </div>
                                        <div className='col-md-12 position-relative mb-4'>
                                            <label className='custom-label'>Address <span className='text-danger'>*</span></label>
                                            <Field as="textarea" className="customInput" name='address' autoComplete='off' rows="4" />
                                            <ErrorMessage name='address' component="div" className="text-start errorText" />
                                        </div>
                                        {vendorId && 
                                        <div className='text-white fw-semibold'>Inventories: &nbsp;<span className='fw-normal'>{vendorDetails?.inventories.length > 0 ?
                                            vendorDetails?.inventories.map((inventory) => inventory?.inventory?.name).join(', ') : '-'}</span>
                                        </div>
                                        }
                                    </div>
                                    <div className='mt-2 text-end'>
                                        <button className='cancelBtn me-3' onClick={() => navigate('/vendors')}>Cancel</button>
                                        <button type="submit" className='saveBtn'>{vendorId ? 'Update' : 'Save'}</button>
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
