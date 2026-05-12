exports.uploadToLocal = async (file) => {
  return `http://localhost:3000/uploads/${file.filename}`;
};
