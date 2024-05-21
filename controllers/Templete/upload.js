const multer = require("multer");
const XLSX = require("xlsx");
const Files = require("../../models/TempleteModel/files");
const path = require("path");
const fs = require("fs");
const unzipper = require("unzipper");
const AdmZip = require("adm-zip");
const getAllDirectories = require("../../services/directoryFinder");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const ext = ["zip", "zipx", "jar", "apk", "ipa", "cbz", "7z"];
    // Determine the destination folder based on file type
    const destinationFolder = ext.includes(file.originalname.split(".").pop())
      ? "zipFile/"
      : "csvFile/";
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder);
    }
    cb(null, destinationFolder);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now() / 1000;
    cb(null, `${timestamp}_${file.originalname}`);
  },
});

// Accept both "csvFile" and "zipFile" fields
const upload = multer({ storage: storage }).fields([
  { name: "csvFile" },
  { name: "zipFile" },
]);

// const uploadPromise = (req, res, next, id, imageColName) => {
//   // console.log(imageColName);
//   return new Promise((resolve, reject) => {
//     upload(req, res, async function (err) {
//       if (err) {
//         console.error("Error uploading files:", err);
//         return reject("Error uploading files");
//       }
//       try {
//         // Update database with file names
//         const createdFile = await Files.create({
//           csvFile: req.files.csvFile[0].filename,
//           zipFile: req.files.zipFile[0].filename,
//           templeteId: id,
//         });

//         const filePath = path.join(
//           __dirname,
//           "../../csvFile",
//           req.files.csvFile[0].filename
//         );

//         const zipFilePath = path.join(
//           __dirname,
//           "../../zipFile",
//           req.files.zipFile[0].filename
//         );

//         if (fs.existsSync(zipFilePath)) {
//           const extractedFilesFolderPath = path.join(
//             __dirname,
//             "../../extractedFiles"
//           );
//           if (!fs.existsSync(extractedFilesFolderPath)) {
//             fs.mkdirSync(extractedFilesFolderPath);
//           }
//           const destinationFolderPath = path.join(
//             __dirname,
//             "../../extractedFiles",
//             req.files.zipFile[0].filename.replace(".zip", "")
//           );

//           // Create a folder for zip file
//           fs.mkdirSync(destinationFolderPath); //Blocking operation // sync task

//           // Extract contents of the zip file
//           const zip = new AdmZip(zipFilePath);
//           zip.extractAllTo(destinationFolderPath, true);

//           const allDirectories = getAllDirectories(destinationFolderPath);
//           // console.log("All directories:", allDirectories);
//           const pathDir =
//             req.files.zipFile[0].filename.replace(".zip", "") +
//             "/" +
//             allDirectories.join("/");

//           // Process CSV file
//           if (fs.existsSync(filePath)) {
//             const workbook = XLSX.readFile(filePath); //Non Blocking operation // async task
//             const sheetName = workbook.SheetNames[0];
//             const worksheet = workbook.Sheets[sheetName];
//             const data = XLSX.utils.sheet_to_json(worksheet, {
//               raw: true,
//             });

//             const updatedJson = data.map((obj) => {
//               return obj;
//             });

//             const image = imageColName.replaceAll('"', "");
//             updatedJson.forEach((obj) => {
//               const imagePath = obj[image];
//               const filename = path.basename(imagePath);
//               obj[image] = `${pathDir}/` + `${filename}`;
//             });

//             // console.log(updatedJson)

//             const csvData = XLSX.utils.json_to_sheet(updatedJson);

//             fs.unlinkSync(filePath);
//             XLSX.writeFile(
//               { SheetNames: [sheetName], Sheets: { [sheetName]: csvData } },
//               filePath
//             );
//             res.status(200).json({ fileId: createdFile.id });
//             console.log("File Uploaded Successfully");
//             resolve("File Uploaded Successfully");
//           } else {
//             res.status(404).json({ error: "CSV File not found" });
//           }
//         } else {
//           res.status(404).json({ error: "Zip file not found" });
//         }
//       } catch (error) {
//         console.error("Error updating database:", error);
//         reject("Error updating database");
//       }
//     });
//   });
// };

console.log("object");

// const uploadPromise = async (req, res, next, id, imageColName) => {
//   try {
//     await new Promise((resolve, reject) => {
//       upload(req, res, async function (err) {
//         if (err) {
//           console.error("Error uploading files:", err);
//           return reject("Error uploading files");
//         }

//         try {
//           const { csvFile, zipFile } = req.files;

//           // Update database with file names
//           const createdFile = await Files.create({
//             csvFile: csvFile[0].filename,
//             zipFile: zipFile[0].filename,
//             templeteId: id,
//           });

//           const filePath = path.join(
//             __dirname,
//             "../../csvFile",
//             csvFile[0].filename
//           );
//           const zipFilePath = path.join(
//             __dirname,
//             "../../zipFile",
//             zipFile[0].filename
//           );
//           const destinationFolderPath = path.join(
//             __dirname,
//             "../../extractedFiles",
//             zipFile[0].filename.replace(".zip", "")
//           );

//           // Ensure destination folder exists
//           if (!fs.existsSync(destinationFolderPath)) {
//             try {
//               fs.mkdirSync(destinationFolderPath, { recursive: true });
//             } catch (error) {
//               console.error("Error creating destination folder:", error);
//               throw error;
//             }
//           }

//           fs.createReadStream(zipFilePath)
//             .pipe(unzipper.Extract({ path: destinationFolderPath }))
//             .on("error", (err) => {
//               console.error("Error unzipping file:", err);
//               reject(err);
//             })
//             .on("finish", async () => {
//               console.log("File unzipped successfully");
//             });

//           const allDirectories = getAllDirectories(destinationFolderPath);
//           const pathDir = `${zipFile[0].filename.replace(
//             ".zip",
//             ""
//           )}/${allDirectories.join("/")}`;

//           if (fs.existsSync(filePath)) {
//             const workbook = XLSX.readFile(filePath);
//             const sheetName = workbook.SheetNames[0];
//             const worksheet = workbook.Sheets[sheetName];
//             const data = XLSX.utils.sheet_to_json(worksheet, {
//               raw: true,
//               defval: "",
//             });

//             const updatedJson = data.map((obj) => obj);

//             const image = imageColName.replaceAll('"', "");
//             updatedJson.forEach((obj) => {
//               const imagePath = obj[image];
//               const filename = path.basename(imagePath);
//               obj[image] = `${pathDir}/${filename}`;
//             });

//             const csvData = XLSX.utils.json_to_sheet(updatedJson);

//             fs.unlinkSync(filePath);
//             XLSX.writeFile(
//               { SheetNames: [sheetName], Sheets: { [sheetName]: csvData } },
//               filePath
//             );

//             res.status(200).json({ fileId: createdFile.id });
//             console.log("File Uploaded Successfully");
//             resolve("File Uploaded Successfully");
//           } else {
//             res.status(404).json({ error: "CSV File not found" });
//           }
//         } catch (error) {
//           console.error("Error updating database:", error);
//           return res.status(500).send(error);
//         }
//       });
//     });
//   } catch (error) {
//     console.error("Error handling upload:", error);
//     return res.status(500).send(error);
//   }
// };

console.log("object");

const uploadPromise = async (req, res, next, id, imageColName) => {
  try {
    await new Promise((resolve, reject) => {
      upload(req, res, async function (err) {
        if (err) {
          console.error("Error uploading files:", err);
          return reject("Error uploading files");
        }

        try {
          const { csvFile, zipFile } = req.files;

          // Update database with file names
          const createdFile = await Files.create({
            csvFile: csvFile[0].filename,
            zipFile: zipFile[0].filename,
            templeteId: id,
          });

          const filePath = path.join(
            __dirname,
            "../../csvFile",
            csvFile[0].filename
          );
          const zipFilePath = path.join(
            __dirname,
            "../../zipFile",
            zipFile[0].filename
          );
          const destinationFolderPath = path.join(
            __dirname,
            "../../extractedFiles",
            zipFile[0].filename.replace(".zip", "")
          );

          // Ensure destination folder exists
          if (!fs.existsSync(destinationFolderPath)) {
            try {
              fs.mkdirSync(destinationFolderPath, { recursive: true });
            } catch (error) {
              console.error("Error creating destination folder:", error);
              throw error;
            }
          }

          const extractStream = unzipper.Parse();
          extractStream.on("entry", (entry) => {
            const fileName = entry.path;
            const destinationPath = path.join(destinationFolderPath, fileName);

            // Ensure parent directories exist before writing files
            const parentDir = path.dirname(destinationPath);
            if (!fs.existsSync(parentDir)) {
              fs.mkdirSync(parentDir, { recursive: true });
            }

            if (fileName.endsWith("/")) {
              // Create directories
              fs.mkdirSync(destinationPath, { recursive: true });
            } else {
              // Extract files
              entry.pipe(fs.createWriteStream(destinationPath));
            }
          });

          extractStream.on("error", (err) => {
            console.error("Error unzipping file:", err);
            reject(err);
          });

          extractStream.on("finish", async () => {
            console.log("File unzipped successfully");

            const allDirectories = getAllDirectories(destinationFolderPath);
            const pathDir = `${zipFile[0].filename.replace(
              ".zip",
              ""
            )}/${allDirectories.join("/")}`;

            if (fs.existsSync(filePath)) {
              const workbook = XLSX.readFile(filePath);
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const data = XLSX.utils.sheet_to_json(worksheet, {
                raw: true,
                defval: "",
              });

              const updatedJson = data.map((obj) => obj);

              // Check if imageColName exists in the JSON data
              if (!updatedJson[0].hasOwnProperty(imageColName)) {
                return res
                  .status(400)
                  .json({ error: "Image column name not found" });
              }

              const image = imageColName.replaceAll('"', "");
              updatedJson.forEach((obj) => {
                const imagePath = obj[image];
                const filename = path.basename(imagePath);
                obj[image] = `${pathDir}/${filename}`;
              });

              // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>",updatedJson)

              const csvData = XLSX.utils.json_to_sheet(updatedJson);

              fs.unlinkSync(filePath);
              XLSX.writeFile(
                { SheetNames: [sheetName], Sheets: { [sheetName]: csvData } },
                filePath
              );

              res.status(200).json({ fileId: createdFile.id });
              console.log("File Uploaded Successfully");
              resolve("File Uploaded Successfully");
            } else {
              res.status(404).json({ error: "CSV File not found" });
            }
          });

          fs.createReadStream(zipFilePath).pipe(extractStream);
        } catch (error) {
          console.error("Error updating database:", error);
          return res.status(500).send(error);
        }
      });
    });
  } catch (error) {
    console.error("Error handling upload:", error);
    return res.status(500).send(error);
  }
};

const handleUpload = async (req, res, next) => {
  const userRole = req.role;
  // console.log(userRole, "-----------");
  if (userRole != "Admin") {
    return res
      .status(500)
      .json({ message: "You don't have access for performing this action" });
  }
  try {
    await uploadPromise(req, res, next, req.params.id, req.query.imageColName);
    console.log("Files Uploaded successfully");
  } catch (error) {
    console.error("Error handling upload:", error);
    return res.status(500).send(error);
  }
};

module.exports = handleUpload;
