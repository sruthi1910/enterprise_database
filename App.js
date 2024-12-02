import React, { useState } from 'react';
import AdminLogin from './components/AdminLogin';
import RepairManagement from './components/RepairManagement';

function App() {
    const [token, setToken] = useState(null);

    return (
        <div>
            {!token ? (
                <AdminLogin setToken={setToken} />
            ) : (
                <RepairManagement token={token} />
            )}
        </div>
    );
}

export default App;
