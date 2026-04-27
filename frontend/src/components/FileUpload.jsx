import { useState } from "react";
import * as XLSX from "xlsx";

function FileUpload({ label, helperText, setData }) {
  const [fileName, setFileName] = useState("No file selected");

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFileName("No file selected");
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      console.log(jsonData); // inspect THIS carefully
      setData(jsonData);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="upload-card">
      <div className="upload-header">
        <p className="upload-title">{label}</p>
        <p className="upload-helper">{helperText}</p>
      </div>

      <label className="upload-button" htmlFor={label}>
        Choose Excel
      </label>
      <input
        id={label}
        className="upload-input"
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFile}
      />
      <p className="upload-filename">{fileName}</p>
    </div>
  );
}

export default FileUpload;