const Files = require("../../models/TempleteModel/files");
const XLSX = require("xlsx");
const fs = require("fs").promises;
const path = require("path");

const duplicateFinder = async (req, res, next) => {
  const { colName, fileID, imageColumnName } = req.body;

  try {
    // Check if file ID is provided
    if (!fileID) {
      return res.status(400).json({ error: "File ID not provided" });
    }

    // Find the file data by ID
    const fileData = await Files.findByPk(fileID);
    if (!fileData || !fileData.csvFile) {
      return res.status(404).json({ error: "File not found" });
    }

    // Get the file path
    const filename = fileData.csvFile;
    const filePath = path.join(__dirname, "../../csvFile", filename);

    // Check if file exists
    try {
      await fs.access(filePath); // Check if file exists
    } catch (err) {
      return res.status(404).json({ error: "CSV file not found" });
    }

    // Read the workbook
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert worksheet to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, {
      raw: true,
      defval: "",
    });

    // Find duplicates
    const duplicates = {};
    for (const [index, row] of data.entries()) {
      const value = row[colName];
      const imagePath = row[imageColumnName];
      const sourceFilePath = path.join(__dirname, "..", "..", "extractedFiles", imagePath);
      
      try {
        await fs.access(sourceFilePath); // Check if image file exists
        const image = await fs.readFile(sourceFilePath);
        const base64Image = image.toString("base64");

        if (value) {
          if (duplicates[value]) {
            duplicates[value].push({ index, row, base64Image });
          } else {
            duplicates[value] = [{ index, row, base64Image }];
          }
        }
      } catch (err) {
        console.error("Error reading image file:", err);
      }
    }

    // Filter out non-duplicate values
    const duplicateValues = Object.keys(duplicates).filter(
      (value) => duplicates[value].length > 1
    );

    if (duplicateValues.length === 0) {
      return res.status(404).json({ message: "No Duplicates Found" });
    }

    // Create an array of duplicate rows with their original data and index
    const duplicateRows = duplicateValues.flatMap((value) => duplicates[value]);

    return res.status(200).json({ duplicates: duplicateRows });
  } catch (error) {
    console.error("Error finding duplicates:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = duplicateFinder;
