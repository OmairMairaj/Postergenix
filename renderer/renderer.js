let excelFilePath = '';
let imagesDirectoryPath = '';
let Products = [];

document.addEventListener('DOMContentLoaded', () => {
    // Handle navigation to inputs.html
    const createButton = document.getElementById('create');
    if (createButton) {
        createButton.addEventListener('click', () => {
            window.electron.navigate('renderer/inputs.html');
        });
    }

    // Handle Excel file selection
    document.getElementById('excel-upload').addEventListener('click', () => {
        window.api.selectExcelFile().then(selectedPath => {
            excelFilePath = selectedPath;

            if (excelFilePath) {
                console.log(excelFilePath)
                // Excel file path is returned, parse it...
                window.api.parseExcelFile(excelFilePath).then(data => {
                    console.log(data);
                    // Extract item numbers and store in itemNumbers array
                    // data.map((row) => {
                    //     console.log(row);
                    //     itemNumbers.push(row.ITEM_NO);
                    // }); 
                    // Adjust the field name based on your Excel file
                    // Update the UI to show that the file has been processed
                    document.getElementById('excel-file-path').textContent = `Excel File Processed: ${excelFilePath}`;
                }).catch(error => {
                    console.error('Error parsing Excel file:', error);
                });
            }
        });
    });

    // Handle Image directory selection
    document.getElementById('image-directory').addEventListener('click', () => {
        window.api.selectImageDirectory().then(selectedPath => {
            imagesDirectoryPath = selectedPath;
            if (imagesDirectoryPath) {
                // Update the UI to show the selected directory path
                console.log(imagesDirectoryPath);
                document.getElementById('image-directory-path').textContent = `Image Directory Selected: ${imagesDirectoryPath}`;
            }
        });
    });

    // Handle Submit button click event
    document.getElementById('submit-button').addEventListener('click', () => {

        if (!excelFilePath || !imagesDirectoryPath) {
            alert('Please select both an Excel file and an image directory.');
            return;
        }
        // window.electron.navigate('renderer/template.html');
        // Clear previous data

        // Parse the Excel file and process each row
        window.api.parseExcelFile(excelFilePath).then(data => {
            const imageFindingPromises = data.map(row => {
                return window.api.findImageForItem(row["ITEM_NO"], imagesDirectoryPath).then(imagePath => {
                    if (imagePath) {
                        console.log(`Image for item ${row["ITEM_NO"]}:`, imagePath);
                        // Update the UI with the image path
                        let product = {
                            itemNumber: row["ITEM_NO"],
                            imagePath: imagePath,
                            packing: row["PACKING"],
                            salePrice: row["SALE_PRICE"]
                        };
                        Products.push(product);
                        // const imageElement = document.createElement('div');
                        // imageElement.textContent = `Item ${row["ITEM_NO"]}: ${imagePath}`;
                        // imageInfoDiv.appendChild(imageElement);
                    } else {
                        console.log(`No image found for item ${row["ITEM_NO"]}`);
                        return row["ITEM_NO"];
                        // Update the UI when no image is found
                        // const noImageElement = document.createElement('div');
                        // noImageElement.textContent = `No image found for item ${row["ITEM_NO"]}`;
                        // imageInfoDiv.appendChild(noImageElement);
                    }
                });
            });
            Promise.all(imageFindingPromises).then(results => {
                const missingImages = results.filter(itemNumber => itemNumber !== undefined);
                if (missingImages.length > 0) {
                    // Show an alert with the missing item numbers
                    alert('Images not found for item numbers: ' + missingImages.join(', '));
                    // Or update the UI to show the missing images
                    // document.getElementById('missingImages').textContent = 'Missing images for item numbers: ' + missingImages.join(', ');
                }
                console.log("Final Products:", Products);
                window.api.send('navigate-to-listing', Products);
            });
        }).catch(error => {
            console.error('Error parsing Excel file:', error);
        });

    });


});
