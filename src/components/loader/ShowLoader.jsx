import React from 'react'
import { Spinner } from 'react-bootstrap'
import '../../styles/loader.css'

export default function ShowLoader() {
    return (
        <div className='loader-container'>
            <Spinner animation="border" style={{ height: '50px', width: '50px' }} />
        </div>
    )
}
