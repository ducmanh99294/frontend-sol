import React, { useState } from "react";

function ConnectWallet({ onAccountConnected }) {
  const [account, setAccount] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const [selectedAccount] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(selectedAccount);
        onAccountConnected(selectedAccount);
      } catch (error) {
        console.error("Quyền truy cập tài khoản bị từ chối của người dùng", error);
      }
    } else {
      alert("Vui lòng bạn cài đặt MetaMask để sử dụng hệ thống của chúng tôi!");
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={connectWallet}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        style={{cursor: "pointer",width: "200px", height: "40px", backgroundColor: "#4A90E2", color: "white", borderRadius: "5px", fontSize: "16px"}}
      >
        {account ? `Đã kết nối với ví: ${account.slice(0, 6)}...` : "Kết nối với ví MetaMask"}
      </button>
    </div>
  );
}

export default ConnectWallet;
