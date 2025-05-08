import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractABI from "../abi/Contract.json";

const contractAddress = "0x84ab68a9113286e4fe5835006344862bae379e19";

function VerifyDocument({ userDocs }) {
  const [selectedInput, setSelectedInput] = useState(""); // CID hoặc Hash
  const [isValid, setIsValid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Kiểm tra contract khi trang tải
  useEffect(() => {
    const testContract = async () => {
      try {
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const total = await contract.methods.getTotalContracts().call();
        console.log("✅ Số lượng tài liệu đã lưu:", total);
      } catch (err) {
        console.error("❌ Lỗi gọi contract:", err.message);
      }
    };

    testContract();
  }, []);

  const handleVerify = async () => {
    if (!selectedInput || selectedInput.length < 5) {
      setError("Giá trị hash hoặc CID không hợp lệ");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error("Vui lòng cài đặt MetaMask!");
      }

      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const contract = new web3.eth.Contract(contractABI, contractAddress);
      console.log("📌 Địa chỉ contract đang dùng:", contractAddress);

      // Tự động phát hiện và xử lý CID hoặc hash
      let bytes32Hash;
      if (Web3.utils.isHexStrict(selectedInput) && selectedInput.length === 66) {
        // Đã là bytes32 hợp lệ
        bytes32Hash = selectedInput;
      } else {
        // Giả định là CID → tạo hash mới
        bytes32Hash = Web3.utils.keccak256(selectedInput);
      }

      console.log("📦 Hash dùng để xác minh:", bytes32Hash);
      console.log("📄 Hàm verifyDocument:", contract.methods.verifyDocument);
      console.log("✅ Độ dài hash:", bytes32Hash.length);
      console.log("✅ isHexStrict:", Web3.utils.isHexStrict(bytes32Hash));

      const result = await contract.methods.verifyDocument(bytes32Hash).call({
        from: (await web3.eth.getAccounts())[0],
        gas: 100000,
      });

      setIsValid(result);
    } catch (err) {
      console.error("❌ Lỗi xác minh:", err);
      setError(`Lỗi xác minh: ${err.message}`);
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 mt-4 border rounded">
      <h3 className="text-lg font-bold mb-2 text-white">Xác thực tài liệu</h3>

      <select
        onChange={(e) => {
          setSelectedInput(e.target.value);
          setIsValid(null);
          setError(null);
        }}
        value={selectedInput}
        className="px-4 py-2 border rounded"
        disabled={isLoading}
      >
        <option value="">-- Chọn tài liệu đã tải lên --</option>
        {userDocs.map((doc, idx) => (
          <option key={idx} value={doc.hash || doc.cid}>
            {doc.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleVerify}
        className="bg-yellow-500 text-white px-4 py-2 ml-2 rounded hover:bg-yellow-600 disabled:opacity-50"
        disabled={!selectedInput || isLoading}
      >
        {isLoading ? "Đang xác minh..." : "Xác minh"}
      </button>

      {error && <p className="mt-2 text-red-500">{error}</p>}

      {isValid !== null && !error && (
        <p className={`mt-2 ${isValid ? "text-green-500" : "text-red-500"}`}>
          {isValid
            ? "✅ Tài liệu hợp lệ trên blockchain."
            : "❌ Không tìm thấy tài liệu hoặc tài liệu không hợp lệ."}
        </p>
      )}
    </div>
  );
}

export default VerifyDocument;
