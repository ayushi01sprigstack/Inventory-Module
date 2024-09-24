import React from 'react'
import Images from '../../utils/Images'

export default function TopMenu() {
  return (
    <div className='topmenu-wrapper'>
      <div className="position-relative" style={{ width: "40%" }}>
        <img src={Images.searchIcon} alt="search-icon" className="search-icon" />
        <input type="text" className="form-control searchInput" placeholder="Search" />
      </div>
      <div>
        <img src={Images.dummyProfile} alt="profile" style={{height:'50px', borderRadius:'50%'}}/>
      </div>
    </div>
  )
}
