let productsList = [];

document.addEventListener('DOMContentLoaded', () => {
    window.api.send('get-products-list');
    window.api.receive('send-products-list', (products) => {
        if (products && products.length > 0) {
            productsList = products;
            // Re-render your listing table with productsList
            const tableBody = document.getElementById('productsTable').querySelector('tbody');
            // Clear previous table rows
            tableBody.innerHTML = '';
            let count = 1;
            // Insert each product into the table
            products.forEach(product => {
                const row = tableBody.insertRow();
                row.insertCell().textContent = count;
                const imgCell = row.insertCell();
                const img = document.createElement('img');
                img.src = product.imagePath;
                img.style.width = '100px';
                img.style.height = '100px'; // Set the image size as required
                imgCell.appendChild(img);
                row.insertCell().textContent = product.itemNumber;
                row.insertCell().textContent = product.packing;
                row.insertCell().textContent = `${product.salePrice}`; // Format as currency


                // Add a button to generate the poster
                const posterButtonCell = row.insertCell();
                const posterButton = document.createElement('button');
                posterButton.textContent = 'Generate Poster';
                posterButton.addEventListener('click', () => {
                    generatePoster(product);
                });
                posterButtonCell.appendChild(posterButton);
                count = count + 1;
            });
            document.getElementById('bulkGenerateButton').addEventListener('click', () => {
                console.log("A")
                generateAllPosters(productsList);
            });
        }
    });
    
});

function generatePoster(product) {
    console.log('Generating poster for product:', product);
    // Here you would use your poster generation logic
    // This might involve using the Handlebars template you created earlier
    // For this example, I'll just log the product data
    window.api.send('save-products-list', productsList);
    window.api.send('generate-poster', product);
    // You can display the poster in a new window or as a download
    // This would be similar to the poster generation code shown in previous examples
}




function generateAllPosters(productsList) {
    console.log('Generating All posters');
    // Here you would use your poster generation logic
    // This might involve using the Handlebars template you created earlier
    // For this example, I'll just log the product data
    // window.api.send('save-products-list', productsList);
    window.api.send('generate-bulk-posters', productsList);
    // You can display the poster in a new window or as a download
    // This would be similar to the poster generation code shown in previous examples
}