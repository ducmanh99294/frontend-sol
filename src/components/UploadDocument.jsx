const { uploadFile } = require('../services/ipfsService');
const { addDocument } = require('../services/blockchainService');
const Web3 = require('web3');

exports.uploadDocument = async (req, res) => {
  try {
    console.log("📨 POST /upload triggered");

    const { buffer, originalname } = req.file;

    if (!req.file) {
      return res.status(400).json({ error: "Không có tệp được tải lên" });
    }

    // 📤 Upload lên IPFS
    const cid = await uploadFile(buffer, originalname);
    const hash = Web3.utils.keccak256(cid);
    console.log("✅ IPFS CID:", cid);
    console.log("🔒 Document hash:", hash);

    // 🧾 Lưu lên blockchain (nếu chưa có)
    const result = await addDocument(cid);

    if (result.alreadyExists) {
      console.log("🟡 CID đã tồn tại trên blockchain.");
      return res.json({ message: "CID đã tồn tại", cid, hash });
    }

    if (result.error) {
      console.warn("⚠️ Lỗi khi lưu CID, nhưng vẫn trả về thông tin file.");
      return res.json({ message: "Upload OK, lưu CID thất bại", cid, hash });
    }

    res.json({ message: "Uploaded and stored successfully", cid, hash });

  } catch (err) {
    console.error("❌ Error in uploadDocument:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
