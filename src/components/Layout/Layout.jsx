import React from 'react'
import SideMenu from './SideMenu'
import { Outlet, useLocation } from 'react-router-dom'
import TopMenu from './TopMenu'
import '../../styles/sideTopMenu.css'

export default function Layout() {
    const location = useLocation();
    const getHeading = () => {
        switch (location.pathname) {
            case '/inventory':
                return 'Inventory Management';
            case '/add-update-inventory':
                return 'Add / Edit Inventory';
            case '/vendors':
                return 'Vendors';
            case '/add-update-vendor':
                return 'Add / Edit Vendor';
            default:
                return 'Inventory Management'
        }
    }
    return (
        <div className='layout-wrapper'>
            <aside className='sidemenu-wrapper'>
                <SideMenu />
            </aside>
            <div className='content-container'>
                <header className='topmenu-container'>
                    <TopMenu heading={getHeading()}/>
                </header>
                <main className='content-wrapper'>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
