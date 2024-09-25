import * as Yup from 'yup';

const ProductValidationSchema = Yup.object({
    selectedCategory: Yup.string().required('Please select a category'),
    sku: Yup.string().required('Stock Keeping Unit is required'),
    productName: Yup.string().required('Product Name is required'),
    quantity: Yup.number().required('Quantity is required').positive('Quantity must be greater than 0').integer('Quantity must be an integer'),
    minQuantity: Yup.number().required('Min Stock Quantity is required').positive('Min Stock Quantity must be greater than 0').integer('Min Quantity must be an integer').test('is-less-than-quantity', 'Min Stock Quantity should be less than Total Quantity', 
        function(value) {
            const { quantity } = this.parent; // Access other field's value
            return value < quantity; // Return true if minQuantity is less than total quantity
        }
    ),
    price: Yup.number().required('Price is required').positive('Price must be greater than 0'),
    selectedVendor: Yup.string().required('Please select vendor')
    // .notOneOf([''], 'Please select a vendor.')
})

export default ProductValidationSchema;