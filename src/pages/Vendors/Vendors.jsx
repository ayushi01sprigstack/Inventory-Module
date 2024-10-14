import React, { useCallback, useEffect, useState } from 'react'
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
import { debounce } from '../../utils/js/Common';
import DynamicSearchComp from '../../components/DynamicSearchComp';

export default function Vendors() {
  const navigate = useNavigate();
  const { getAPI, postAPI } = useApiService();
  const [loading, setLoading] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const placeholders = [
    'Search by Vendor',
    'Search by Inventory',
    'Search by Company',
  ];
  const [vendorParamters, setVendorParamters] = useState({
    searchkey: '',
    sortKey: null,
    sortByFlag: 'desc'
  })
  useEffect(() => {
    getAllVendors(vendorParamters.searchkey ? vendorParamters.searchkey : null, vendorParamters.sortKey || null, vendorParamters?.sortByFlag);
  }, [currentPage, itemsPerPage])

  const getAllVendors = debounce(async (searchkey, sortkey, sortFlag) => {
    setLoading(true);
    const searchKeyParam = searchkey ? searchkey : null;
    try {
      const result = await getAPI(`/get-vendors/${searchKeyParam}&${sortkey}&${sortFlag}&${currentPage}&${itemsPerPage}`);
      if (!result || result == '') {
        throw new Error('Something went wrong');
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
      setLoading(false);
    }
  }, 50);
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
            throw new Error('Something went wrong');
          }
          else {
            setShowAlerts(<AlertComp show={true} variant="success" message="Vendor deleted successfully" />);
            setTimeout(() => {
              setLoading(false);
              setShowAlerts(<AlertComp show={false} />);
              getAllVendors(vendorParamters.searchkey ? vendorParamters.searchkey : null, vendorParamters.sortKey || null, vendorParamters?.sortByFlag);
            }, 2500);
          }
        }
        catch (error) {
          console.error('Failed to delete product:', error);
          setLoading(false);
        }
      }
    })
  }
  const handleSortClick = (item) => {
    const newSortByFlag = vendorParamters.sortKey ? (vendorParamters.sortByFlag == 'desc' ? 'asc' : 'desc')
      : 'desc';
    setVendorParamters({ ...vendorParamters, sortKey: item, sortByFlag: newSortByFlag });
    getAllVendors(vendorParamters.searchkey, item, newSortByFlag);
  }
  const handlePageChange = (page) => {
    setCurrentPage(page);
  }
  return (
    <>
      {showAlerts}
      {loading ? <ShowLoader /> : <HideLoader />}
      <div className='mt-1' style={{ padding: "5px 20px" }}>
        <div className="row align-items-center ps-3">
          <div className="col-4 p-1 position-relative">
            <img src={Images.searchIcon} alt="search-icon" className="search-icon" />
            <DynamicSearchComp placeholders={placeholders} onChange={(e) => { setVendorParamters({ ...vendorParamters, searchkey: e.target.value }); getAllVendors(e.target.value, vendorParamters.sortKey, vendorParamters?.sortByFlag) }} />
          </div>
          <div className="col-8 text-end">
            <button className='productBtn' onClick={() => navigate('/add-update-vendor')}> <img src={Images.addIcon} alt="addIcon" className='me-2' />Add Vendor</button>
            <div className='deletedVendor mt-2'>*This Vendor is deleted</div>
          </div>
          <div className="col-md-9"></div>
          <div className="col-md-3 row mt-2">
            <div className="col-md-6 p-0 text-white font-14">Items per page:</div>
            <div className='col-md-6 p-0'>
              <select className="w-100" value={itemsPerPage} onChange={(e) => {
                setItemsPerPage(e.target.value);
                setCurrentPage(1);
              }}>
                {[10, 20, 30].map(value => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className='invnetoryTable mt-2'>
        <table className="table table-responsive mt-2">
          <thead>
            <tr>
              <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('name')} title="Sort Vendor" >Vendor<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
              <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('email')} title="Sort Email" >Email<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
              <th scope="col" className='cursor-pointer' onClick={() => handleSortClick('company_name')} title='Sort Company' >Company<FontAwesomeIcon icon={faSort} className='ms-2' /></th>
              <th scope="col">Contact</th>
              <th scope="col">Inventory</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length > 0 ? (
              vendors.map((vendor) => (
                <tr key={vendor?.id} className={vendor?.status == 2 ? 'deletedVendor' : ''}>
                  <td>{vendor?.name}</td>
                  <td>{vendor?.email}</td>
                  <td>{vendor?.company_name}</td>
                  <td>{vendor?.contact_num}</td>
                  <td>
                    {vendor?.inventory_details.length > 0 ?
                      vendor?.inventory_details.map((inventory) => inventory?.inventory?.name).join(', ') : '-'}
                  </td>
                  <td>
                    {vendor?.status == 1 ? (
                      <>
                        <FontAwesomeIcon icon={faPenToSquare} className='cursor-pointer me-3' onClick={() => navigate('/add-update-vendor', { state: { vendorId: vendor?.id } })} />
                        <FontAwesomeIcon icon={faTrash} className='cursor-pointer' onClick={() => handleDeleteVendor(vendor?.id)} />
                      </>
                    ) : (
                      '-'
                    )}

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
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={itemsPerPage}
          onChange={handlePageChange}
        />
      </div>
    </>
  )
}
