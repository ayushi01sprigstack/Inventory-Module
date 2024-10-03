import React from 'react'
import Images from '../../utils/Images'

export default function TopMenu({ heading }) {
  return (
    <div className='topmenu-wrapper'>
      <div>
        <h2 className="mainheading">{heading}</h2>
      </div>
      <div>
        <img src={Images.calendar} alt="calendar" className='me-3 imgClass' />
        <img src={Images.message} alt="message" className='me-2 imgClass' />
        <img src={Images.notification} alt="notification" className='me-4 imgClass' />
        <span className='text-white fw-normal me-2' style={{ fontSize: '13px' }}>Henry Jr.</span>
        <span></span>
        <img src={Images.profile} alt="profile" />
      </div>
    </div>
  )
}
