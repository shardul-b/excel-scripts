const fs = require('fs').promises;
require('dotenv').config();

const FileService = () => {
  const directory = process.env.BASE_DIRECTORY;
  console.log(process.env.BASE_DIRECTORY);
  /**
   * Gets all files present in the base directory
   * @returns {Array} filenames (all files)
   */
  const getAllFiles = async () => {
    let filenames = await fs.readdir(directory);
    return filenames;
  };

  /**
   * Checks if a file already exists
   * @param {*} file
   * @returns {Boolean}
   */
  const fileExists = async (file) => {
    const [_, fileErr] = await asyncTryCatch(fs.access(file));
    if (fileErr) {
      return false;
    }
    return true;
  };
  return {
    getAllFiles,
    fileExists,
  };
};

module.exports = { FileService };
