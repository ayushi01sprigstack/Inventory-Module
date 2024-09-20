import React from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import InventoryMangement from '../pages/Inventory-Module';
import Layout from '../components/Layout/Layout';

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route element={<Layout />}>
                    <Route path='/' element={<InventoryMangement />} />
                    <Route path='/inventory-manamgement' element={<InventoryMangement />} />
                </Route>
            </Routes>
        </Router>
    )
}
