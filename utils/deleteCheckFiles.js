const fs = require("fs").promises;
const path = require("path");

const deleteFileIfExists = async (filename) => {
  if (!filename) return;

  try {
    const filePath = path.join("uploads", filename);
    await fs.access(filePath);
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error("Error deleting file:", err);
    }
  }
};

module.exports = deleteFileIfExists;
