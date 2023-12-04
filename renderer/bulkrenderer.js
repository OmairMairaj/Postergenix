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

        // Set product details
        document.getElementById('itemNumber').textContent = product.itemNumber;
        document.getElementById('packing').textContent = product.packing + ' Pcs';
        document.getElementById('salePrice').textContent = product.salePrice + ' SR';

        // Handle image load
        productImage.onload = async () => {
            try {
                const dataUrl = await htmlToImage.toPng(node);
                await window.api.saveImage(dataUrl); // Ensure this is also promise-based
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