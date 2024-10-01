import React from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from '../components/Layout/Layout';
import Products from '../pages/Products/Products';
import Vendors from '../pages/Vendors/Vendors';
import AddEditProduct from '../pages/Products/AddEditProduct';
import AddEditVendor from '../pages/Vendors/AddEditVendor';
import GeneratePurchaseOrder from '../pages/Products/GeneratePurchaseOrder';

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route element={<Layout />}>
                    <Route path='/' element={<Products/>} />
                    <Route path='/inventory' element={<Products />} />
                    <Route path='/add-update-inventory' element={<AddEditProduct />} />
                    <Route path='/generate-purchase-order' element={<GeneratePurchaseOrder/>} />
                    <Route path='/vendors' element={<Vendors />} />
                    <Route path='/add-update-vendor' element={<AddEditVendor />} />                   
                </Route>
            </Routes>
        </Router>
    )
}
