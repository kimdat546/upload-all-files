const fs = require('fs');
const axios = require('axios');
const path = require('path');

const folderPath = '../folder-upload';
const apiEndpoint = 'https://hrd-api.onrender.com/admin/hrd-data/excel';
const uploadKey = 'file';
const finishedFolderPath = '../folder-finished';

// Function to create a delay in milliseconds
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Create the "finished" folder if it doesn't exist
if (!fs.existsSync(finishedFolderPath)) {
    fs.mkdirSync(finishedFolderPath);
}

// Function to upload a file to the API
async function uploadFile(filePath) {
    try {
        const fileData = fs.readFileSync(filePath);

        // Use FormData to send the file as form data
        const formData = new FormData();
        formData.append(uploadKey, fileData, { filename: path.basename(filePath) });

        // Make the Axios POST request to the API endpoint
        const response = await axios.post(apiEndpoint, formData, {
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            },
        });

        // Check if the upload was successful (you may need to adjust the condition based on the API response)
        if (response.status === 200) {
            console.log(`File ${path.basename(filePath)} uploaded successfully`);
            // Move the successfully uploaded file to the "finished" folder
            fs.renameSync(filePath, path.join(finishedFolderPath, path.basename(filePath)));
            // Delay for 5 seconds
            await delay(5000);
        } else {
            console.error(`Error uploading file ${path.basename(filePath)}: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error uploading file ${path.basename(filePath)}: ${error.message}`);
    }
}

// Function to upload all files in the folder
async function uploadAllFiles() {
    try {
        // Read all files in the folder
        const files = fs.readdirSync(folderPath);

        // Upload each file
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            console.log(`Uploading file ${path.basename(filePath)}...`);
            await uploadFile(filePath);
        }
    } catch (error) {
        console.error(`Error reading folder: ${error.message}`);
    }
}

// Start the file upload process
uploadAllFiles();
