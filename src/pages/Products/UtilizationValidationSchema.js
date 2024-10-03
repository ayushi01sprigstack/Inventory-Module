import * as Yup from 'yup';

const UtilizationValidationSchema = Yup.object().shape({
    utilizationQty: Yup.number().required('Utilization quantity is required').positive('Quantity must be greater than 0').integer('Quantity must be an integer'),
    date: Yup.date().required('Date is required').nullable()
});

export default UtilizationValidationSchema;