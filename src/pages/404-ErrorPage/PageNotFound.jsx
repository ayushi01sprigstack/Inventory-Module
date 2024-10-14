import React from 'react'
import { useNavigate } from 'react-router-dom';

export default function PageNotFound() {
    const navigate = useNavigate();
    return (
        <div className='p-3 text-center'>
            <h5 className='text-white'>Oops! Sorry the page you are trying to visit does not exist. You can go back to inventory page from button given below. </h5>
            <button className='saveBtn mt-3' onClick={() => navigate('/')}>Inventory</button>
        </div>
    )
}
