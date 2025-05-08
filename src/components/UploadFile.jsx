import React, { useState } from "react";
import Web3 from "web3";
import contractABI from "../abi/Contract.json";

const backendURL = import.meta.env.VITE_BACKEND_URL;
const contractAddress = "0x64095674d65a4ec44ec3f1f1dee02e35bd2f6db7";
const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(contractABI, contractAddress);

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
      // 📤 Gửi file đến backend (chỉ upload IPFS)
      const res = await fetch(`${backendURL}/api/documents/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.cid) {
        throw new Error(data.error || "Không nhận được CID");
      }

      const cid = data.cid;
      const hash = Web3.utils.keccak256(cid);
      setCID(cid);

      console.log("📦 CID:", cid);
      console.log("🔑 Hash:", hash);

      // 🧠 Kiểm tra nếu CID đã tồn tại
      const exists = await contract.methods.verifyDocument(hash).call();
      if (exists) {
        alert("⚠️ CID đã tồn tại trên blockchain. Không cần lưu lại.");
        return;
      }

      // 👛 Kết nối MetaMask và gọi storeCID
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      await contract.methods.storeCID(cid).send({ from: accounts[0] });

      // ✅ Thành công
      onUploadSuccess(file, cid, hash);
      alert("✅ CID đã được lưu lên blockchain!");
    } catch (err) {
      console.error("❌ Upload hoặc lưu lỗi:", err);
      alert("❌ Lỗi khi tải lên hoặc lưu CID. Kiểm tra console.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded mt-4">
      <input type="file" onChange={handleFileChange} />
      <button
        onClick={uploadToIPFS}
        className="bg-blue-600 text-white px-4 py-2 ml-2 rounded"
        disabled={isUploading}
      >
        {isUploading ? "Đang xử lý..." : "Tải lên & xác nhận"}
      </button>
      {cid && <p className="mt-2">✅ CID: {cid}</p>}
    </div>
  );
}

export default UploadFile;
