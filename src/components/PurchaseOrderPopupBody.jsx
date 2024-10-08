import { ErrorMessage, Field, Formik, Form } from 'formik';
import React from 'react'
import GeneratePoValidationSchema from '../pages/Products/GeneratePoValidationSchema';
import AlertComp from './AlertComp';
import useApiService from '../services/ApiService';
import GeneratePurchaseOrder from './GeneratePurchaseOrder';
import PreviewPo from './PreviewPo';

export default function PurchaseOrderPopupBody({ previewPo, setPreviewPo, selectedInventoryIds, poDetails, setPoDetails, selectedItemsDetails, setShowAlerts, setLoading, setSelectedInventoryIds, setIsAllSelected, previewErrorMsg, setPreviewErrorMsg, allvendors, products,setShowPoModal, getAllProducts, searchKey, sortKey }) {
    const { postAPI } = useApiService();
    const getCommonVendorId = () => {
        const vendorIds = selectedInventoryIds.map(id => {
            const inventory = products.find(inv => inv.id == id);
            return inventory?.inventory_detail?.vendor_id;
        });
        const uniqueVendorIds = [...new Set(vendorIds)];
        return uniqueVendorIds.length == 1 ? uniqueVendorIds[0] : '';
    };
    const saveGeneratePO = async (values) => {
        setLoading(true);
        const inventoryDetailsArray = [];
        if (selectedInventoryIds.length > 1) {
            selectedItemsDetails.forEach(item => {
                const quantity = values.quantities[item.id] || 0;
                inventoryDetailsArray.push({
                    inventoryId: item.id,
                    reminderQuantity: quantity
                })
            })
        }
        else {
            inventoryDetailsArray.push({
                inventoryId: poDetails?.inventoryId,
                reminderQuantity: values?.quantity
            })
        }
        var raw = JSON.stringify({
            vendorId: values.selectedVendor,
            inventoryDetails: inventoryDetailsArray
        })
        try {
            const result = await postAPI('/generate-purchase-order', raw);
            if (!result || result == "") {
                alert('Something went wrong');
            } else {
                const responseRs = JSON.parse(result);
                if (responseRs.status == 'success') {
                    setShowAlerts(<AlertComp show={true} variant="success" message='Purchase Order generated successfully' />);
                    setTimeout(() => {
                        setLoading(false);
                        setShowAlerts(<AlertComp show={false} />);
                        setShowPoModal(false);
                        getAllProducts(searchKey || null, sortKey || null);
                        setSelectedInventoryIds([]);
                        setIsAllSelected(false);
                        setPreviewErrorMsg('');
                        setPreviewPo(false);
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
            {!previewPo && <h5 className='modalBodyHeading'>Vendor Information :</h5>}
            <Formik initialValues={{
                // selectedVendor: poDetails?.vendorID || '',
                selectedVendor: selectedInventoryIds.length > 1 ? getCommonVendorId() : poDetails?.vendorID || '',
                quantity: '',
                quantities: {}
            }} validationSchema={GeneratePoValidationSchema} enableReinitialize={true} onSubmit={saveGeneratePO} >
                {({ setFieldValue, values, validateForm }) => (
                    <Form className='' onKeyDown={(e) => {
                        if (e.key == 'Enter') {
                            e.preventDefault();
                        }
                    }}>
                        {!previewPo && (
                            <GeneratePurchaseOrder values={values} setFieldValue={setFieldValue} poDetails={poDetails} allvendors={allvendors} setPoDetails={setPoDetails} selectedItemsDetails={selectedItemsDetails} selectedInventoryIds={selectedInventoryIds} validateForm={validateForm} previewErrorMsg={previewErrorMsg} setPreviewErrorMsg={setPreviewErrorMsg} setPreviewPo={setPreviewPo} previewPo={previewPo}/>
                        )}
                        {previewPo && (
                           <PreviewPo poDetails={poDetails} values={values} selectedInventoryIds={selectedInventoryIds} selectedItemsDetails={selectedItemsDetails} setPreviewPo={setPreviewPo}/>
                        )}
                        <div className='text-center mt-2'>
                            <button type='submit' className='submitBtn'>Submit</button>
                            <button className='cancelBtn ms-3 rounded-2' type="button" onClick={() => { setShowPoModal(false); setPreviewPo(false); setPreviewErrorMsg(''); setFieldValue("selectedVendor", '') }}>Cancel</button>
                        </div>
                    </Form>
                )}
            </Formik>
        </>
    )
}
