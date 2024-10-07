import React from 'react'

export default function Tab({col, isActive, onClick, label}) {
  return (  
      <li className={`${col} nav-item`}>
        <a className={`nav-link ${isActive ? 'active' : ''}`}
            onClick={onClick}>
            {label}
        </a>
    </li>   
  )
}
