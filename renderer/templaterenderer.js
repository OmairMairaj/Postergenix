let currentProduct = null;

document.addEventListener('DOMContentLoaded', () => {
    const downloadButton = document.getElementById('downloadButton');

    if (downloadButton) {
        downloadButton.addEventListener('click', downloadAsImage);
    }

    window.api.receive('load-product', (product) => {
        const productImage = document.getElementById('productImage');
        const node = document.getElementById('posterContainer');
        
        document.getElementById('itemNumber').textContent = product.itemNumber;
        document.getElementById('packing').textContent = product.packing + ' Pcs';
        document.getElementById('salePrice').textContent = product.salePrice + ' SR';

        productImage.onload = () => {
            // Image is loaded, now convert to PNG
            htmlToImage.toPng(node)
                .then(function (dataUrl) {
                    window.api.saveImage(dataUrl);
                })
                .catch(function (error) {
                    console.error('Failed to convert to image:', error);
                });
        };
    
        // Set the image src last
        productImage.src = product.imagePath;
        currentProduct = product;
    });

    // ... other event listeners and functions ...
});


function downloadAsImage() {
    const node = document.getElementById('posterContainer');

    htmlToImage.toPng(node)
        .then(function (dataUrl) {
            window.api.saveImage(dataUrl, 'path/to/save/image.png');
        })
        .catch(function (error) {
            console.error('Failed to convert to image:', error);
        });
}