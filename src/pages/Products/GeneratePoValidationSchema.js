import * as Yup from 'yup';

const GeneratePoValidationSchema = Yup.object({
    selectedVendor: Yup.string().required('Please select vendor')
});

export default GeneratePoValidationSchema;