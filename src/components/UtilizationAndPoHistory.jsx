import React, { useState } from 'react'
import Tab from './Tab';
import UtliizationHistory from './UtliizationHistory';
import PoHistory from './PoHistory';

export default function UtilizationAndPoHistory({ poDetails, purchaseOrderHistory, usageHistoryDetails,setShowUsageHistory }) {
    const [activeTab, setActiveTab] = useState('utilization');
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    }
    return (
        <div className='inventoryDetailsPopupWrapper'>
            <ul className="nav nav-tabs">
                <Tab isActive={activeTab == 'utilization'} label="Utilization history" onClick={() => handleTabClick('utilization')} col={'col-md-6'} />
                <Tab isActive={activeTab == 'poHistory'} label="Po history" onClick={() => handleTabClick('poHistory')} col={'col-md-6'} />
            </ul>
            {activeTab == 'utilization' ? (
                <UtliizationHistory usageHistoryDetails={usageHistoryDetails} poDetails={poDetails} />
            ) : activeTab == 'poHistory' ? (
                <PoHistory purchaseOrderHistory={purchaseOrderHistory} poDetails={poDetails} />
            ) : null}
            <div className='text-end mt-3'>
                <button className='cancelBtn' onClick={() => setShowUsageHistory(false)}> Close</button>
            </div>
        </div>
    )
}
