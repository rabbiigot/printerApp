const {authenticate} = require('../middleware/auth');
const { listFilesInDrive, downloadFile } = require('../middleware/googleDrive');
const getLocalFiles = require('../middleware/checkLocal');
const path = require('path');
const fs = require('fs');

exports.syncFiles = async (req, res) => {
    const localFolder = 'C:/Users/Administrator/filesToPrint'; // Local folder path
    const folderId = '1NBuL0EqpnWwX79odq5X6JOWHDMzvYEZT'; // Google Drive Folder ID

    try {
        // Step 1: Authenticate with Google Drive
        const auth = await authenticate();

        // Step 2: List files on Google Drive
        const driveFiles = await listFilesInDrive(auth, folderId);

        // Step 3: Get local files in the specified local folder
        const localFiles = getLocalFiles(localFolder); // Assuming this returns an array of file names

        // Step 4: Compare and download missing files
        for (let file of driveFiles) {
            const fileName = file.name;

            // If the file doesn't exist locally, download it
            if (!localFiles.includes(fileName)) {
                console.log(`Downloading missing file: ${fileName}`);
                await downloadFile(auth, file.id, fileName, localFolder);
            } else {
                console.log(`${fileName} already exists locally.`);
            }
        }

        res.send('File sync complete!');
    } catch (error) {
        console.error('Error syncing files:', error);
        res.status(500).send('Error syncing files');
    }
};
