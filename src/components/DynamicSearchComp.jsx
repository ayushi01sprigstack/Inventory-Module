import React, { useEffect, useState } from 'react'

export default function DynamicSearchComp({ placeholders, onChange, ...rest }) {
    const [placeholder, setPlaceholder] = useState(placeholders[0] || '');
    useEffect(() => {
        let currentIndex = 0;
        const intervalId = setInterval(() => {
            setPlaceholder(placeholders[currentIndex]);
            currentIndex = (currentIndex + 1) % placeholders.length;
        }, 2000);
        return () => clearInterval(intervalId);
    }, [placeholders]);

    return (
        <input
            type="text"
            className="searchInput"
            placeholder={placeholder}
            onChange={onChange}
            {...rest}
        />
    )
}
