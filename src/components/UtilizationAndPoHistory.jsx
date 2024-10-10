import React, { useState } from 'react'
import Tab from './Tab';
import UtliizationHistory from './UtliizationHistory';
import PoHistory from './PoHistory';

export default function UtilizationAndPoHistory({ poDetails, purchaseOrderHistory, usageHistoryDetails,setShowInfoPopup }) {
    const [activeTab, setActiveTab] = useState('utilization');
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    }
    return (
        <div className='inventoryDetailsPopupWrapper'>
            <ul className="nav nav-tabs custom-nav-tab">
                <Tab isActive={activeTab == 'utilization'} label="Utilization History" onClick={() => handleTabClick('utilization')} col={'col-md-4'} />
                <Tab isActive={activeTab == 'poHistory'} label="Purchase Order History" onClick={() => handleTabClick('poHistory')} col={'col-md-4'} />
            </ul>
            {activeTab == 'utilization' ? (
                <UtliizationHistory usageHistoryDetails={usageHistoryDetails} poDetails={poDetails} />
            ) : activeTab == 'poHistory' ? (
                <PoHistory purchaseOrderHistory={purchaseOrderHistory} poDetails={poDetails} />
            ) : null}
            <div className='text-end mt-3'>
                <button className='cancelBtn' onClick={() => setShowInfoPopup(false)}> Close</button>
            </div>
        </div>
    )
}
