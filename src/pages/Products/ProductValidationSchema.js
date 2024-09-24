import * as Yup from 'yup';

const ProductValidationSchema = Yup.object({
    selectedCategory: Yup.string().required('Please select a category'),
    sku: Yup.string().required('Stock Keeping Unit is required'),
    productName: Yup.string().required('Product Name is required'),
    quantity: Yup.number().required('Quantity is required').positive('Quantity must be greater than 0').integer('Quantity must be an integer'),
    price: Yup.number().required('Price is required').positive('Price must be greater than 0'),
    selectedVendor: Yup.string().required('Please select vendor'),
})

export default ProductValidationSchema;