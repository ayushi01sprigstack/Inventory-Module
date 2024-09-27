import React from 'react'
import { Button, Modal } from 'react-bootstrap'

export default function Popup({ show, handleClose, size, modalHeader, modalBody, handleSave, modalFooter }) {
    return (
        <Modal show={show} onHide={handleClose} size={size}>
            <Modal.Header closeButton>
                <Modal.Title>{modalHeader}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{modalBody}</Modal.Body>
            <Modal.Footer>
                {modalFooter ? 
                <>
                    <button className='cancelBtn' onClick={handleClose}> Close</button>
                    <button className='saveBtn text-white' onclick={handleSave} style={{ background: '#303260' }}>Save</button>
                </> : null}

            </Modal.Footer>
        </Modal>
    )
}
