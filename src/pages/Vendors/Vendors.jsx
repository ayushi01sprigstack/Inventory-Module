import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useApiService from '../../services/ApiService';
import ShowLoader from '../../components/loader/ShowLoader';
import HideLoader from '../../components/loader/HideLoader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import AlertComp from '../../components/AlertComp';
import Swal from 'sweetalert2';

export default function Vendors() {
  const navigate = useNavigate();
  const { getAPI, postAPI } = useApiService();
  const [loading, setLoading] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    getAllVendors();
  }, [])
  const getAllVendors = async () => {
    setLoading(true);
    try {
      const result = await getAPI('/get-vendors');
      if (!result || result == '') {
        alert('Something went wrong');
      }
      else {
        const responseRs = JSON.parse(result);
        setLoading(false);
        setVendors(responseRs);
      }
    }
    catch (error) {
      console.error(error);
    }
  }
  const handleDeleteVendor = async (vendorId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const result = await postAPI(`/delete-vendor/${vendorId}`);
          if (!result || result == '') {
            alert('Something went wrong');
          }
          else {
            setShowAlerts(<AlertComp show={true} variant="success" message="Vendor deleted successfully" />);
            setTimeout(() => {
              setLoading(false);
              setShowAlerts(<AlertComp show={false} />);
              getAllVendors();
            }, 2500);
          }
        } catch (error) {
          console.error('Failed to delete product:', error);
        }
      }
    })
  }
  return (
    <>
      {showAlerts}
      {loading ? <ShowLoader /> : <HideLoader />}
      <div className='text-end p-3 mt-3'>
        <button className='productBtn' onClick={() => navigate('/add-update-vendor')}>Add Vendor</button>
      </div>
      <div>
        <table className="table table-responsive mt-2">
          <thead>
            <tr>
              <th scope="col">Vendor Name</th>
              <th scope="col">Email</th>
              <th scope="col">Company Name</th>
              <th scope="col">Contact Number</th>
              <th scope="col">Products</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor?.id}>
                <td>{vendor?.name}</td>
                <td>{vendor?.email}</td>
                <td>{vendor?.company_name}</td>
                <td>{vendor?.contact_num}</td>
                <td>
                  {vendor?.products.length > 0 ?
                    vendor?.products.map((product) => product.name).join(', ') : '-'}
                </td>
                <td>
                  <FontAwesomeIcon icon={faPenToSquare} className='cursor-pointer me-3' onClick={() => navigate('/add-update-vendor', { state: { vendorId: vendor?.id } })} />
                  <FontAwesomeIcon icon={faTrash} className='cursor-pointer' onClick={() => handleDeleteVendor(vendor?.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
