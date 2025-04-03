const fs = require('fs');
const path = require('path');
const folderPath = 'G:\\My Drive\\FilesUploaded';

const DRIVES = ['D:', 'E:', 'F:']; // Example drives to scan
const PDF_EXTENSION = '.pdf'; 

var driveFound = ""

function scanForPdfFiles(driveLetter) {
  return new Promise((resolve, reject) => {
      const drivePath = `${driveLetter}\\`; 
      fs.readdir(drivePath, { withFileTypes: true }, (err, files) => {
          if (err) return reject(`Error reading drive ${driveLetter}: ${err}`);
          
          const pdfFiles = files
              .filter(file => file.isFile() && file.name.endsWith(PDF_EXTENSION))
              .map(file => file.name);
          
          resolve(pdfFiles); 
      });
  });
}

const scanPdfFiles = (directoryPath) => {
    const pdfFiles = [];
    const files = fs.readdirSync(directoryPath);

    files.forEach((file) => {
        const fullPath = path.join(directoryPath, file);
        const fileStat = fs.statSync(fullPath);

        if (fileStat.isFile() && file.endsWith('.pdf')) {
        pdfFiles.push(file);  
        }
    });

    return pdfFiles;
};

exports.getFile = (req, res) => {
    try {
        const pdfFiles = scanPdfFiles(folderPath);  
        res.json(pdfFiles);
    } 
    catch (err) {
        console.error('Error scanning folder:', err);
        res.status(500).send('Error scanning folder');
    }
}

exports.uploadFile = async (req, res) => {
    const file = req.file;
    try{
    if (!file) {
      return res.status(400).send('No file uploaded.');
    }
  
    const targetPath = path.join('C:', 'Users', 'Administrator', 'filesToPrint', file.originalname);
    
    fs.renameSync(file.path, targetPath); 
  
    return res.status(200).send('File uploaded successfully.');
    }
    catch(err){
        console.log(err)
    }
  };

  exports.deleteFile = (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(folderPath, filename); 
  
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return res.status(500).json({ error: 'Failed to delete file' });
      }
  
      res.status(200).json({ message: 'File deleted successfully' });
    });
  };

  exports.deleteFileFlash = (req, res) => {
    const { filename } = req.params;
    var folderFlashPath = `${driveFound}\\`
    const filePath = path.join(folderFlashPath, filename); 
  
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return res.status(500).json({ error: 'Failed to delete file' });
      }
  
      res.status(200).json({ message: 'File deleted successfully' });
    });
  };

  exports.scanFlashDrive = async (req, res) => {
    let allPdfFiles = [];
    const timeout = 10000; 

    const timeoutId = setTimeout(() => {
        res.status(500).send('Scanning took too long, try again later.');
    }, timeout);

    try {
        for (const drive of DRIVES) {
            if (allPdfFiles.length > 0) {
                console.log(`Skipping drive ${drive} as PDF files were already found.`);
                continue; 
            }

            const pdfFiles = await scanForPdfFiles(drive);
            if (pdfFiles.length > 0) {
                driveFound = drive
                console.log(`Found PDF files on drive ${drive}:`, pdfFiles);
                allPdfFiles = allPdfFiles.concat(pdfFiles);
            } else {
                console.log(`No PDF files found on drive ${drive}.`);
            }
        }

        clearTimeout(timeoutId); 
        res.json({ pdfs: allPdfFiles });

    } catch (error) {
        clearTimeout(timeoutId); 
        console.error('Error scanning drives:', error);
        res.status(500).send('Error scanning drives');
    }
};

exports.getFileflashDrive = (req, res) => {
  const { fileName } = req.params;
    let filePath = null;

    // Loop through drives to find the requested file
    for (const drive of DRIVES) {
        const potentialPath = path.join(drive, fileName);
        if (fs.existsSync(potentialPath)) {
            filePath = potentialPath;
            break;
        }
    }

    if (filePath) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
};