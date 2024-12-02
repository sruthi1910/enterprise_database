import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CustomerPage = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');

    const fetchProducts = async () => {
        try {
            const response = await axios.get('/api/stock');
            setProducts(response.data.stocks);
        } catch (error) {
            alert('Failed to fetch products.');
        }
    };

    const addToCart = (product) => {
        setCart([...cart, { ...product, quantity: 1 }]);
    };

    const placeOrder = async () => {
        const total = cart.reduce((sum, item) => sum + item.quantity * 100, 0); // Assuming $100 per item

        try {
            await axios.post('/api/orders', {
                customerName,
                email,
                address,
                products: cart,
                total
            });
            alert('Order placed successfully!');
            setCart([]);
        } catch (error) {
            alert('Failed to place order.');
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div>
            <h2>Products</h2>
            <ul>
                {products.map((product) => (
                    <li key={`${product.product}-${product.condition}`}>
                        {product.product} ({product.condition}) - {product.quantity} in stock
                        <button onClick={() => addToCart(product)}>Add to Cart</button>
                    </li>
                ))}
            </ul>

            <h3>Cart</h3>
            <ul>
                {cart.map((item, index) => (
                    <li key={index}>
                        {item.product} ({item.condition}) - Quantity: {item.quantity}
                    </li>
                ))}
            </ul>

            <h3>Place Order</h3>
            <form onSubmit={(e) => e.preventDefault()}>
                <label>
                    Name:
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                </label>
                <br />
                <label>
                    Email:
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <br />
                <label>
                    Address:
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} required></textarea>
                </label>
                <br />
                <button onClick={placeOrder}>Place Order</button>
            </form>
        </div>
    );
};

export default CustomerPage;
