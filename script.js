// Suggestion Logic for Search Bar
const searchBar = document.getElementById('search-bar');
const suggestionsBox = document.getElementById('suggestions');

const products = [
    "Laptop - Dell XPS",
    "Laptop - MacBook Air",
    "Hardware - SSD 1TB",
    "Hardware - RAM 16GB",
    "Accessories - Mouse Wireless",
    "Accessories - Keyboard Mechanical"
];

searchBar.addEventListener('input', () => {
    const query = searchBar.value.toLowerCase();
    suggestionsBox.innerHTML = '';

    if (query) {
        const filtered = products.filter(product => product.toLowerCase().includes(query));
        filtered.forEach(product => {
            const li = document.createElement('li');
            li.textContent = product;
            suggestionsBox.appendChild(li);
        });
    }
});
