import React from 'react'
import Images from '../../utils/Images'
import { faBoxesStacked, faStore } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { NavLink, useLocation } from 'react-router-dom'

export default function SideMenu() {
  const location = useLocation();
  return (
    <div className='side-menu'>
      <div className='px-4 pt-3 pb-4 text-center side-menu-logo'>
        <img src={Images.realEstateLogo} alt="logo" style={{ height: '70px' }} />
      </div>
      <ul className="nav nav-pills flex-column p-2 pt-4 mt-4">
        <li className="nav-item d-flex align-items-center pb-2">
          <NavLink to='/inventory' className={({ isActive }) => isActive || location.pathname == '/' ? 'nav-link active text-white fw-bold' : 'nav-link text-white fw-light'} style={{ fontSize: '16px' }}><FontAwesomeIcon icon={faBoxesStacked} className='me-3 side-menu-icon' />Inventory</NavLink>
        </li>
        <li className="nav-item d-flex align-items-center pb-2">
          <NavLink to='/vendors' className={({ isActive }) => isActive ? 'nav-link active text-white fw-bold' : 'nav-link text-white fw-light'} style={{ fontSize: '16px' }}> <FontAwesomeIcon icon={faStore} className='me-3 side-menu-icon' />Vendors</NavLink>
        </li>
      </ul>
    </div>
  )
}
