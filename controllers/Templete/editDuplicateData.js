const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const Files = require("../../models/TempleteModel/files");

const editDuplicateData = async (req, res, next) => {
  const { index, fileID, rowData } = req.body;

  try {
    if (!fileID) {
      return res.status(400).json({ error: "File ID not provided" });
    }

    const fileData = await Files.findByPk(fileID);

    if (!fileData || !fileData.csvFile) {
      return res.status(404).json({ error: "File not found" });
    }

    const filename = fileData.csvFile;
    const filePath = path.join(__dirname, "../../csvFile", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    let data = XLSX.utils.sheet_to_json(worksheet, {
      raw: true,
      defval: "",
    });

    // Overwriting the data at the provided index with the rowData
    if (index !== undefined && index >= 0 && index < data.length) {
      data[index] = rowData;
    } else {
      return res.status(400).json({ error: "Invalid index provided" });
    }

    // Updating the Excel file with the edited data
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
    XLSX.writeFile(newWorkbook, filePath);

    return res.status(200).json({ message: "Data Updated successfully" });
  } catch (error) {
    console.error("Error handling data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = editDuplicateData;
