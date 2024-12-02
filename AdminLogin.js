const AdminLogin = ({ setToken }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [product, setProduct] = useState('');
    const [quantity, setQuantity] = useState('');
    const [condition, setCondition] = useState('new');
    const [category, setCategory] = useState('pc');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/admin/login', { username, password });
            setToken(response.data.token);
            alert('Login successful!');
        } catch (error) {
            alert('Invalid credentials.');
        }
    };

    const addStock = async () => {
        try {
            await axios.post(
                '/api/stock',
                { product, quantity: Number(quantity), condition, category },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Stock added successfully!');
        } catch (error) {
            alert('Failed to add stock.');
        }
    };

    return (
        <div>
            <h2>Admin Login</h2>
            <form onSubmit={handleLogin}>
                <label>
                    Username:
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </label>
                <br />
                <label>
                    Password:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <br />
                <button type="submit">Login</button>
            </form>

            <h3>Add Stock</h3>
            <form onSubmit={(e) => e.preventDefault()}>
                <label>
                    Product:
                    <input type="text" value={product} onChange={(e) => setProduct(e.target.value)} required />
                </label>
                <br />
                <label>
                    Quantity:
                    <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                </label>
                <br />
                <label>
                    Condition:
                    <select value={condition} onChange={(e) => setCondition(e.target.value)}>
                        <option value="new">New</option>
                        <option value="refurbished">Refurbished</option>
                    </select>
                </label>
                <br />
                <label>
                    Category:
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="pc">PC</option>
                        <option value="laptop">Laptop</option>
                        <option value="accessory">Accessory</option>
                    </select>
                </label>
                <br />
                <button onClick={addStock}>Add Stock</button>
            </form>
        </div>
    );
};
