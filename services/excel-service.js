const XLSX = require('xlsx');
const { FileService } = require('./file-service');
/**
 * Appends new data to existing Excel sheet
 * @param {String} fileName
 * @param {String} sheetName
 * @param {Array} newData
 * @returns {Promise <Array>} Boolean, error
 */
const updateExcelFile = async (fileName, sheetName = null, newData) => {
  let workBook;
  if (sheetName) {
    // Read a specific sheet (Why?)
    workBook = XLSX.readFile(fileName, { sheets: sheetName });
  } else {
    //Read all the sheets
    workBook = XLSX.readFile(fileName);
  }
  const worksheet = workBook.Sheets[sheetName];
  // Sheet data => JSON
  const existingData = XLSX.utils.sheet_to_json(worksheet);
  existingData.push(...newData);
  console.log('Existing Data:  ', JSON.stringify(existingData, null, 1));
  // JSON => Sheet
  const updatedWorksheet = XLSX.utils.json_to_sheet(existingData);
  workBook.Sheets[sheetName] = updatedWorksheet;
  // Write
  XLSX.writeFile(workBook, fileName);
  return true;
};
/**
 * Writes data to provided Excel sheet (creates one if doesn't exist)
 * @param {Array} newData
 */
const writetoExcelSheet = async (newData) => {
  const excelFile = `credit-card.xlsx`;
  const FileInstance = FileService();
  const fileCheck = await FileInstance.fileExists(excelFile);
  if (fileCheck) {
    //needs update
    const status = updateExcelFile(excelFile, 'credit-card', newData);
    console.log('Done: ', status);
  } else {
    console.log('here');
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(newData);
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'credit-card');
    XLSX.writeFile(newWorkbook, excelFile);
  }
};

module.exports = {
  writetoExcelSheet,
};
