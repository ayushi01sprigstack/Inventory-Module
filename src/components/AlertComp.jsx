import React from 'react'
import { Alert } from 'react-bootstrap'
import '../styles/alert.css'

export default function AlertComp({ show, variant, message }) {
    return (
        <div>
            <Alert show={show} variant={variant} className="alertClass">
                {message}
            </Alert>
        </div>
    )
}
