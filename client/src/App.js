import React, { useState } from "react";
import axios from "axios";

function FileUpload() {
  const [progress, setProgress] = useState(0);

  console.log({
    progress
  })
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await axios.post("http://localhost:5000/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        console.log(e)
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
