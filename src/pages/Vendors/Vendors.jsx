import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useApiService from '../../services/ApiService';
import ShowLoader from '../../components/loader/ShowLoader';
import HideLoader from '../../components/loader/HideLoader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faSort, faTrash } from '@fortawesome/free-solid-svg-icons';
import AlertComp from '../../components/AlertComp';
import Swal from 'sweetalert2';
import PaginationComp from '../../components/PaginationComp';
import Images from '../../utils/Images';
import { typewatch } from '../../utils/js/Common';


export default function Vendors() {
  const navigate = useNavigate();
  const { getAPI, postAPI } = useApiService();
  const [loading, setLoading] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [placeholder, setPlaceholder] = useState('Search by Vendor Name');
  const placeholders = [
    'Search by Vendor Name',
    'Search by Item Name',
    'Search by Company Name',
  ];
  const [vendorParamters, setVendorParamters] = useState({
    searchkey: '',
    sortKey: null,
    sortByFlag: 'desc'
  })

  useEffect(() => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      setPlaceholder(placeholders[currentIndex]);
      currentIndex = (currentIndex + 1) % placeholders.length;
    }, 2000);
    return () => clearInterval(intervalId);
  }, []);
  useEffect(() => {
    getAllVendors(vendorParamters.searchkey ? vendorParamters.searchkey : null, vendorParamters.sortKey || null);
  }, [])

  const getAllVendors = async (searchkey, sortkey) => {
    typewatch(async function () {
      setLoading(true);
      const searchKeyParam = searchkey ? searchkey : null;
      const updatedSortByFlag = sortkey ? (vendorParamters.sortByFlag == 'desc' ? 'asc' : 'desc'): vendorParamters.sortByFlag;
      setVendorParamters(prev => ({
          ...prev,
          sortByFlag: updatedSortByFlag
      }));
      try {
        const result = await getAPI('/get-vendors/' + searchKeyParam + "&" + sortkey + "&" + updatedSortByFlag + "&" + currentPage + "&" + itemsPerPage);
        if (!result || result == '') {
          alert('Something went wrong');
        }
        else {
          const responseRs = JSON.parse(result);
          setLoading(false);
          setVendors(responseRs?.data);
          setTotalItems(responseRs.total);
        }
      }
      catch (error) {
        console.error(error);
      }
    }, searchkey != null ? 1000 : 0);
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
              getAllVendors(vendorParamters.searchkey ? vendorParamters.searchkey : null, vendorParamters.sortKey || null);
            }, 2500);
          }
        } catch (error) {
          console.error('Failed to delete product:', error);
        }
      }
    })
  }

  const handleSortClick = (item) => {
    getAllVendors(vendorParamters.searchkey, item);
    setVendorParamters({ ...vendorParamters, sortKey: item });
  }
  return (
    <>
      {showAlerts}
      {loading ? <ShowLoader /> : <HideLoader />}
      <h4 className='pageheader p-2 m-0'>Vendors</h4>
      <hr className='horizontal-line' />
      <div className='headerWrapper mt-3'>
        <div className="row align-items-center ps-3">
          <div className="col-4 p-1 position-relative">
            <img src={Images.searchIcon} alt="search-icon" className="search-icon" style={{ left: '10px', top: '53%' }} />
            <input type="text" className="form-control" placeholder={placeholder} style={{ padding: '.375rem 1.75rem' }} onChange={(e) => { setVendorParamters({ ...vendorParamters, searchkey: e.target.value }); getAllVendors(e.target.value, vendorParamters.sortKey) }} />
          </div>
          <div className="col-8 text-end">
            <button className='productBtn' onClick={() => navigate('/add-update-vendor')}> <img src={Images.addIcon} alt="addIcon" className='me-2' />Add Vendor</button>
          </div>
        </div>
      </div>
      <div className='p-4'>
        <table className="table table-responsive mt-2">
          <thead>
            <tr>
              <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('name')}>Vendor Name<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
              <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('email')}>Email<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
              <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('company_name')}>Company Name<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
              <th scope="col">Contact Number</th>
              <th scope="col">Item Name</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length > 0 ? (
              vendors.map((vendor) => (
                <tr key={vendor?.id}>
                  <td>{vendor?.name}</td>
                  <td>{vendor?.email}</td>
                  <td>{vendor?.company_name}</td>
                  <td>{vendor?.contact_num}</td>
                  <td>
                    {vendor?.inventories.length > 0 ?
                      vendor?.inventories.map((inventory) => inventory?.name).join(', ') : '-'}
                  </td>
                  <td>
                    <FontAwesomeIcon icon={faPenToSquare} className='cursor-pointer me-3' onClick={() => navigate('/add-update-vendor', { state: { vendorId: vendor?.id } })} />
                    <FontAwesomeIcon icon={faTrash} className='cursor-pointer' onClick={() => handleDeleteVendor(vendor?.id)} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No vendors found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className='d-flex justify-content-center'>
        <PaginationComp
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  )
}
