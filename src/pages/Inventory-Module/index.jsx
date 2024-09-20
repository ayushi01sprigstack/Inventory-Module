import React, { useEffect } from 'react'
import useApiService from '../../services/ApiService';

export default function InventoryMangement() {
    const { getAPI } = useApiService();

    useEffect(() => {
        testCall();
    }, [])
    const testCall = async () => {
        try {
            const result = await getAPI('/test');
            console.log(result);
        }
        catch {
            console.error(error);
        }
    }
    return (
        <div className='text-center text-white'>
            Inventory mangement
        </div>
    )
}
