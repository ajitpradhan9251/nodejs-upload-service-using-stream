# 📂 File Upload with Node.js Streams + React Progress Bar

This project demonstrates a **simple but powerful file upload system** where:

* The **server** is built with **Express + express-fileupload** and uses **Node.js streams** to save files efficiently.
* The **client** is built with **React + Axios** and shows a **live upload progress bar**.

---

## 🚀 How It Works (Step by Step)

### 1. Client (React + Axios)

When the user selects a file:

1. The file is wrapped inside a `FormData` object.
2. An HTTP POST request is sent to the server at `/upload`.
3. `axios` uses **`onUploadProgress`** to report how many bytes have been sent.
4. React updates the `<progress>` bar and shows the percentage in real time.

👉 This progress shows **browser → server upload progress** (network side).

### 2. Server (Express + express-fileupload + Node Streams)

When the server receives the upload:

1. `express-fileupload` saves the file into a **temporary folder (`./tmp/`)**.
2. Instead of reading the whole file into memory, we create a **Readable stream** from the temp file:

   ```js
   const readStream = fs.createReadStream(file.tempFilePath);
   ```
3. We also create a **Writable stream** pointing to the final location (`./uploads/filename`).

   ```js
   const writeStream = fs.createWriteStream(`./uploads/${file.name}`);
   ```
4. We connect them with `.pipe()`:

   ```js
   readStream.pipe(writeStream);
   ```

   * This moves data in **chunks** (not whole file in memory).
   * Handles **backpressure** (if disk is slow, stream automatically pauses/resumes).
5. When the stream finishes writing, the server responds:

   ```js
   res.send("file uploaded and saved with node:stream!");
   ```

👉 This part is **server-side disk copy progress** (temp → final file).
Currently, we don’t send it to the client, but we could extend it with **WebSockets** or **SSE**.

---

## 📜 Full Code

### 🖥️ Server (`server.js`)

```js
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
  const readStream = fs.createReadStream(file.tempFilePath);

  // destination stream (final save location)
  const writeStream = fs.createWriteStream(`./uploads/${file.name}`);

  // pipe using node:stream
  readStream.pipe(writeStream);

  writeStream.on("finish", () => {
    res.send("file uploaded and saved with node:stream!");
  });

  writeStream.on("error", (err) => {
    console.error("Stream error:", err);
    res.status(500).send("Error saving file.");
  });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
```

---

### 💻 Client (`FileUpload.js`)

```js
import React, { useState } from "react";
import axios from "axios";

function FileUpload() {
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await axios.post("http://localhost:5000/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        setProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      <progress value={progress} max="100"></progress>
      <p>{progress}%</p>
    </div>
  );
}

export default FileUpload;
```

---

## 📊 Progress Explained

* **React progress bar** = how much of the file is uploaded from **browser → server**.
* **Node stream copy (pipe)** = how the file is saved **temp → final** on server’s disk.

Currently only the client upload progress is shown.
If needed, you could also send **server-side progress** updates via **WebSockets** or **Server-Sent Events (SSE)**.

---

## ⚡ Benefits of Using Streams

* ✅ **Memory safe** → Handles very large files without loading into RAM.
* ✅ **Fast** → Processes data in chunks (\~64KB).
* ✅ **Backpressure support** → Avoids overwhelming slow disks.
* ✅ **Extensible** → Can add **compression, encryption, hashing** with `Transform` streams.

---

## 📂 Project Structure

```
.
├── server.js        # Express server
├── client/          # React app
│   └── FileUpload.js
├── uploads/         # Final saved files
├── tmp/             # Temporary files during upload
└── node_modules/
```

---

## 🛡️ Security Considerations

* Limit file size in `express-fileupload` (`limits` option).
* Sanitize filenames (currently using raw `file.name`, should generate safe unique names).
* Validate file types (don’t trust client MIME).
* Delete temp files after saving.

---

## 🏁 Run the Project

1. Start the **server**:

   ```bash
   node server.js
   ```
2. Start the **React client**:

   ```bash
   npm start
   ```
3. Open the React app, select a file, and watch the progress bar update! 🎉

