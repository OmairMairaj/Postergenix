let currentProduct = null;

document.addEventListener('DOMContentLoaded', () => {

    // window.api.receive('load-product', (product) => {
    //     const productImage = document.getElementById('productImage');
    //     const node = document.getElementById('posterContainer');

    //     node.style.backgroundImage = `url(${product.backgroundImagePath})`;
        
    //     document.getElementById('itemNumber').textContent = product.itemNumber;
    //     document.getElementById('packing').textContent = product.packing + ' Pcs';
    //     document.getElementById('salePrice').textContent = product.salePrice + ' SR';

    //     productImage.onload = () => {
    //         // Image is loaded, now convert to PNG
    //         htmlToImage.toPng(node)
    //             .then(function (dataUrl) {
    //                 console.log('uccessfully to:');
    //                 window.api.saveImage(dataUrl, product.itemNumber);
    //             })
    //             .catch(function (error) {
    //                 console.error('Failed to convert to image:', error);
    //             });
    //     };
    
    //     // Set the image src last
    //     productImage.src = product.imagePath;
    //     currentProduct = product;
    // });



    window.api.receive('load-product', (product) => {
        console.log('Product received:');
        const productImage = document.getElementById('productImage');
        const node = document.getElementById('posterContainer');

        
        // Ensure that node has dimensions; otherwise, the background won't show
        // node.style.width = '100%'; // Example width, adjust as needed
        // node.style.height = '500px'; // Example height, adjust as needed
        node.style.backgroundImage = `url('file:///${product.backgroundImagePath.replace(/\\/g, '/')}')`;
        // node.style.backgroundSize = 'cover'; // Ensure the image covers the container
        // node.style.backgroundPosition = 'center'; // Center the background image

        document.getElementById('itemNumber').textContent = product.itemNumber;
        document.getElementById('packing').textContent = product.packing + ' Pcs';
        document.getElementById('salePrice').textContent = product.salePrice + ' SR';


        // Debug: Log the background image path to ensure it's correct
        console.log('Background image path:', product.backgroundImagePath);
        console.log(product.itemNumber);


        productImage.onload = () => {
            // Image is loaded, now convert to PNG
            htmlToImage.toPng(node)
                .then(function (dataUrl) {
                    console.log('Image converted successfully');
                    window.api.saveImage(dataUrl, product.itemNumber);
                })
                .catch(function (error) {
                    console.error('Failed to convert to image:', error);
                });
        };

        // Set the image src last to trigger the load event
        productImage.src = product.imagePath;
        currentProduct = product;
    });

    // ... other event listeners and functions ...
});