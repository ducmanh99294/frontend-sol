import React, { useState } from "react";
import Web3 from "web3";
const backendURL = import.meta.env.VITE_BACKEND_URL;

function UploadFile({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [cid, setCID] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadToIPFS = async () => {
    if (!file) return alert("📂 Vui lòng chọn một tệp!");

    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);

    try {
      const response = await fetch(`${backendURL}/api/documents/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setCID(data.cid);

        // ✅ Hiển thị hash & gọi callback
        console.log("📦 Hash lưu:", data.hash);
        onUploadSuccess(file, data.cid, data.hash);

        alert("✅ Tải lên thành công!\nCID: " + data.cid);
      } else {
        alert("❌ Upload failed: " + data.error || "Unknown error");
      }
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert("❌ Có lỗi xảy ra khi tải lên.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded mt-4">
      <input type="file" onChange={handleFileChange} />
      <button
        onClick={uploadToIPFS}
        className="bg-green-500 text-white px-4 py-2 ml-2 rounded"
        disabled={isUploading}
      >
        {isUploading ? "Đang tải lên..." : "Tải lên IPFS"}
      </button>
      {cid && <p className="mt-2">✅ CID: {cid}</p>}
    </div>
  );
}

export default UploadFile;
