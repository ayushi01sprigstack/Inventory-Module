import * as Yup from 'yup';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const VendorValidationSchema = Yup.object({
    vendorName: Yup.string().required('Vendor Name is required'),
    email: Yup.string().matches(emailRegex, 'Invalid email address.').required('Email is required.'),
    companyName: Yup.string().required('Company Name is required'),
    contactNum: Yup.string().matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits.').required('Phone number is required.'),
    address:Yup.string().required('Address is required'),
})
export default VendorValidationSchema;