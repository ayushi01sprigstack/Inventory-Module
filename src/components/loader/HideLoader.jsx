import React from 'react'
import { Spinner } from 'react-bootstrap'

export default function HideLoader() {
  return (
    <div className='d-none'>
      <Spinner animation="border" />
    </div>
  )
}
