import React from 'react'
import SideMenu from './SideMenu'
import { Outlet } from 'react-router-dom'
import TopMenu from './TopMenu'
import '../../styles/sideTopMenu.css'

export default function Layout() {
    return (
        <div className='layout-wrapper'>
            <aside className='sidemenu-wrapper'>
                <SideMenu />
            </aside>
            <div className='content-container'>
                <header className='topmenu-wrapper'>
                    <TopMenu/>
                </header>
                <main className='content-wrapper'>
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}
