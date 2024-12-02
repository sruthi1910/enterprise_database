import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RepairManagement = ({ token }) => {
    const [stocks, setStocks] = useState([]);
    const [category, setCategory] = useState('');
    const [condition, setCondition] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchStocks = async () => {
        const params = new URLSearchParams({ page, limit: 10 });
        if (category) params.append('category', category);
        if (condition) params.append('condition', condition);

        try {
            const response = await axios.get(`/api/stock?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStocks(response.data.stocks);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            alert('Failed to fetch stock.');
        }
    };

    useEffect(() => {
        fetchStocks();
    }, [category, condition, page]);

    return (
        <div>
            <h2>Stock Management</h2>

            <div>
                <label>
                    Category:
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">All</option>
                        <option value="pc">PC</option>
                        <option value="laptop">Laptop</option>
                        <option value="accessory">Accessory</option>
                    </select>
                </label>

                <label>
                    Condition:
                    <select value={condition} onChange={(e) => setCondition(e.target.value)}>
                        <option value="">All</option>
                        <option value="new">New</option>
                        <option value="refurbished">Refurbished</option>
                    </select>
                </label>
            </div>

            <ul>
                {stocks.map((stock) => (
                    <li key={`${stock.product}-${stock.condition}`}>
                        {stock.product} ({stock.condition}) - {stock.quantity} in stock [{stock.category}]
                    </li>
                ))}
            </ul>

            <button onClick={() => setPage(page - 1)} disabled={page === 1}>
                Previous
            </button>
            <span> Page {page} of {totalPages} </span>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                Next
            </button>
        </div>
    );
};

export default RepairManagement;
