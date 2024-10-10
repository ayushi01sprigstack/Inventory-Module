import React from 'react'
import { ErrorMessage, Field, Formik, Form } from 'formik';
import UtilizationValidationSchema from '../pages/Products/UtilizationValidationSchema';
import AlertComp from './AlertComp';
import useApiService from '../services/ApiService';

export default function UtilizationPopupBody({ inventoryId, setShowAlerts, setLoading, setShowUtlizationPopup, getAllProducts, searchkey, sortKey }) {
    const today = new Date().toISOString().split('T')[0];
    const { postAPI } = useApiService();
    const saveUtilizationQuantity = async (values) => {
        setShowUtlizationPopup(false);
        setLoading(true);
        var raw = JSON.stringify({
            inventoryId: inventoryId,
            quantity: values?.utilizationQty,
            usedDate: values?.date,
            usagePurpose: values?.purpose
        })
        try {
            const result = await postAPI('/add-inventory-utilization', raw);
            if (!result || result == "") {
                alert('Something went wrong');
            } else {
                const responseRs = JSON.parse(result);
                if (responseRs.status == 'success') {
                    setShowAlerts(<AlertComp show={true} variant="success" message='Utilization data added successfully' />);
                    setTimeout(() => {
                        setLoading(false);
                        setShowAlerts(<AlertComp show={false} />);
                        getAllProducts(searchkey || null, sortKey || null);
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
            <Formik initialValues={{ utilizationQty: '', date: today, purpose: '' }} validationSchema={UtilizationValidationSchema} onSubmit={saveUtilizationQuantity} validateOnBlur={false} validateOnChange={false}>
                {() => (
                    <Form className='' onKeyDown={(e) => {
                        if (e.key == 'Enter') {
                            e.preventDefault();
                        }
                    }}>
                        <div className="row">
                            <div className="col-md-6 position-relative mb-3">
                                <label className='font-14 fw-medium'>Enter Utilization Quantity <span className='text-danger'>*</span></label>
                                <Field type="number" name="utilizationQty" className="form-control" min={0} />
                                <ErrorMessage name="utilizationQty" component="div" className="text-start errorText" />
                            </div>
                            <div className="col-md-6 position-relative mb-2">
                                <label className='font-14 fw-medium'>Select Date <span className='text-danger'>*</span></label>
                                <Field type="date" name="date" className="form-control" />
                                <ErrorMessage name="date" component="div" className="text-start errorText" />
                            </div>
                            <div className="col-md-12 position-relative mb-2">
                                <label className='font-14 fw-medium'>Purpose</label>
                                <Field as="textarea" className="form-control" name='purpose' autoComplete='off' rows="2" />
                            </div>
                        </div>
                        <div className='text-end mt-2'>
                            <button className='cancelBtn' onClick={() => setShowUtlizationPopup(false)}> Close</button>
                            <button className='saveBtn text-white ms-2' type="submit" style={{ background: '#303260' }}>Save</button>
                        </div>
                    </Form>
                )}
            </Formik>
        </>
    )
}
