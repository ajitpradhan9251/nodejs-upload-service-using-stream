const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const cors = require("cors");

const app = express();

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./tmp/",
  })
);

app.use(cors("*"));
app.post("/upload", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const file = req.files.file;

  // create a read stream from the temp file
  const readStrem = fs.createReadStream(file.tempFilePath);

  // destination stream (final save location)
  const writeStrem = fs.createWriteStream(`./uploads/${file.name}`);

  // pipe using node:stream
  readStrem.pipe(writeStrem);

  writeStrem.on("finish", () => {
    res.send("file uploaded and saved with node:stream!");
  });

  writeStrem.on("error", (err) => {
    console.error("Stream error:", err);
    res.status(500).send("Error saving file.");
  });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
