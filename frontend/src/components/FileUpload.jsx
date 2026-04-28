function FileUpload({ label, helperText, statusText = "Live sync enabled" }) {
  return (
    <div className="upload-card">
      <div className="upload-header">
        <p className="upload-title">{label}</p>
        <p className="upload-helper">{helperText}</p>
      </div>

      <div className="upload-button" aria-disabled="true" role="status">
        {statusText}
      </div>
    </div>
  );
}

export default FileUpload;