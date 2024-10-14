import * as Yup from 'yup';

const GeneratePoValidationSchema = Yup.object({
    selectedVendor: Yup.string().required('Please select vendor'),
    quantity: Yup.number().required('Quantity is required').min(1, 'Quantity should be greater than 0'),
});

export default GeneratePoValidationSchema;