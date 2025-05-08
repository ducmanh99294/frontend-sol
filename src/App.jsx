import React, { useState, useEffect  } from "react";
import ConnectWallet from "./components/ConnectWallet";
import UploadFile from "./components/UploadFile";
import VerifyDocument from "./components/VerifyDocument";
import Web3 from 'web3';
const backendURL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [account, setAccount] = useState("");
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [userDocs, setUserDocs] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null); // cho modal

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`${backendURL}/api/documents`);
        const docs = await response.json();
        setAllDocs(docs);
        // Khởi tạo Web3 instance
        const web3 = new Web3(Web3.givenProvider || "http://localhost:8545"); // hoặc một endpoint RPC khác
  
        // Lọc những tài liệu mà người dùng đã upload
        const userRelated = docs.filter(
          doc => doc.uploader && doc.uploader.toLowerCase() === account.toLowerCase()
        );
  
        setUserDocs(userRelated.map((doc, index) => ({
          name: `File #${index + 1}`,
          cid: doc.cid,
          hash: web3.utils.keccak256(doc.cid),
        })));
      } catch (err) {
        console.error("❌ Lỗi khi tải tài liệu:", err);
      }
    };
  
    if (account) {
      fetchDocuments();
    }
  }, [account]);
  
  

  const handleUploadSuccess = (file, cid, hash) => {
    console.log("File uploaded:", file.name);
    console.log("IPFS CID:", cid);
    console.log("Keccak256 Hash:", hash);
    // Call smart contract or backend to store CID here

    const docInfo = { name: file.name, cid, hash };
    setUploadedDocs(prev => [...prev, docInfo]);

  // Nếu là tài liệu của người dùng hiện tại
  setUserDocs((prev) => [...prev, docInfo]);

  // TODO: Gọi smart contract hoặc backend để lưu
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4"
      style={{
        width: "900px",
        margin: "auto",
        padding: "20px",
        backgroundColor: "#BEE4D0",
        borderRadius: "10px",
        boxShadow: "0 10px 10px rgba(244, 20, 20, 0.1)"
      }}
    >
      <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: "#4A90E2" }}>
        HỆ THỐNG QUẢN LÝ TÀI LIỆU & XÁC THỰC HỢP ĐỒNG THÔNG MINH
      </h2>
  
      <div className="connect-wallet" style={{ textAlign: "center", paddingBottom: "10px" }}>
        <ConnectWallet onAccountConnected={setAccount} />
      </div>
  
      {account && (
        <>
          <div>
            <p className="text-center mt-4" style={{ textAlign: "center", color: "#7F8C8D", padding: "20px 0" }}>
              Địa chỉ ví của bạn: {account}
            </p>
          </div>
  
          {/* 🔗 CHUỖI KHỐI TÀI LIỆU */}
          <div style={{ display: "flex", alignItems: "center", overflowX: "auto", padding: "20px 30px", gap: "10px" }}>
  {allDocs.map((doc, index) => (
    <React.Fragment key={index}>
      {/* Khối hình vuông */}
      <div
        onClick={() => setSelectedDoc(doc)}
        style={{
          width: "60px",
          height: "60px",
          backgroundColor: "white",
          border: "2px solid black",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        {index + 1}
      </div>

      {/* Mũi tên */}
      {index < allDocs.length - 1 && (
        <div style={{ fontSize: "24px", color: "black" }}>➝</div>
      )}
    </React.Fragment>
  ))}
</div>

  
          <hr />
  
          {/* 📤 TẢI LÊN */}
          <div className="box1" style={{ paddingLeft: "40px" }}>
            <h2 className="text-xl font-bold mb-4 text-center" style={{ color: "#4A90E2" }}>
              TẢI LÊN TÀI LIỆU
            </h2>
            <UploadFile onUploadSuccess={handleUploadSuccess} />
          </div>
  
          <hr />
  
          {/* ✅ XÁC THỰC */}
          <div className="box2" style={{ paddingLeft: "40px" }}>
            <h2 className="text-xl font-bold mb-4 text-center" style={{ color: "#4A90E2" }}>
              XÁC THỰC TÀI LIỆU
            </h2>
            <VerifyDocument account={account} userDocs={userDocs} />
  
            {/* 📚 Danh sách tài liệu của bạn */}
            <div style={{ marginTop: "20px", paddingLeft: "40px" }}>
              <h3 style={{ color: "#4A90E2", fontWeight: "bold" }}>TÀI LIỆU CỦA BẠN</h3>
              <ul style={{ color: "#2c3e50", paddingLeft: "20px" }}>
                {userDocs.length === 0 ? (
                  <li>Chưa có tài liệu nào</li>
                ) : (
                  userDocs.map((doc, index) => (
                    <li key={index}>
                      <a
                        href={`https://ipfs.io/ipfs/${doc.cid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {doc.name}
                      </a>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
  
          {/* 💬 MODAL thông tin chi tiết */}
          {selectedDoc && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
                <h3 className="text-xl font-bold text-blue-600 mb-4">Chi tiết tài liệu</h3>
                <p><strong>CID:</strong> {selectedDoc.cid}</p>
                <p><strong>Uploader:</strong> {selectedDoc.uploader}</p>
                <p><strong>Thời gian:</strong> {new Date(Number(selectedDoc.timestamp) * 1000).toLocaleString()}</p>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );  
}
export default App;