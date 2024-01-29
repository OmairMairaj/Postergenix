let products = [];

document.addEventListener('DOMContentLoaded', () => {
    window.api.receive('load-page', async (productsList) => {
        products = productsList;
        for (let i = 0; i < productsList.length; i++) {
            console.log("Generating poster for product:", i + 1);
            const product = productsList[i];
            await generatePoster(product);
            updateProgress((i + 1) / productsList.length);
        }
        // document.getElementById('progressBar').style.display = 'none';
        document.getElementById('progressMessage').textContent = "All posters generated!";
        console.log("All posters generated");
    });

    // ... other event listeners and functions ...
});

function updateProgress(progress) {
    const progressBar = document.getElementById('progressBar');
    const progressPercentage = progress * 100;
    progressBar.style.width = progressPercentage + '%';
    document.getElementById('progressMessage').textContent = `Generating posters... ${Math.round(progressPercentage)}%`;
}

function generatePoster(product) {
    return new Promise((resolve, reject) => {
        const productImage = document.getElementById('productImage');
        const node = document.getElementById('posterContainer');

        // Debug: Log the background image path to ensure it's correct
        // console.log('Background image path:', product.backgroundImagePath);

        // Ensure that node has dimensions; otherwise, the background won't show
        // node.style.width = '100%'; // Example width, adjust as needed
        // node.style.height = '500px'; // Example height, adjust as needed
        node.style.backgroundImage = `url('file:///${product.backgroundImagePath.replace(/\\/g, '/')}')`;
        // node.style.backgroundSize = 'cover'; // Ensure the image covers the container
        // node.style.backgroundPosition = 'center'; // Center the background image

        // Set product details
        document.getElementById('itemNumber').textContent = product.itemNumber;
        document.getElementById('packing').textContent = product.packing + ' Pcs';
        document.getElementById('salePrice').textContent = product.salePrice + ' SR';

        // Handle image load
        productImage.onload = async () => {
            try {
                const dataUrl = await htmlToImage.toPng(node);
                await window.api.saveImage(dataUrl,product.itemNumber); // Ensure this is also promise-based
                resolve();
            } catch (error) {
                console.error('Failed to convert to image:', error);
                reject(error);
            }
        };

        // Trigger image loading
        productImage.src = product.imagePath;
    });
}