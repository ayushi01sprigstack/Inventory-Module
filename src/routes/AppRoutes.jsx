import React from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from '../components/Layout/Layout';
import Products from '../pages/Products/Products';
import Vendors from '../pages/Vendors/Vendors';
import AddEditProduct from '../pages/Products/AddEditProduct';
import AddEditVendor from '../pages/Vendors/AddEditVendor';
import AllPurchaseOrders from '../pages/Purchase-orders/AllPurchaseOrders';
import PageNotFound from '../pages/404-ErrorPage/PageNotFound.JSX';

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route element={<Layout />}>
                    <Route path='/' element={<Products/>} />
                    <Route path='/inventory' element={<Products />} />
                    <Route path='/add-update-inventory' element={<AddEditProduct />} />
                    <Route path='/vendors' element={<Vendors />} />
                    <Route path='/add-update-vendor' element={<AddEditVendor />} />
                    <Route path='/purchase-orders' element={<AllPurchaseOrders />} />      
                    <Route path="*" element={<PageNotFound />} />             
                </Route>
            </Routes>
        </Router>
    )
}
