/**
 * What it does:
 *  picks up all the pdfs (credit card statements) from the Base directory
 *  parses them and stores the required dets in an Excel sheet
 *
 */

const XLSX = require('xlsx');
const pdfParse = require('pdf-parse');
const { asyncTryCatch } = require('./utils');
const { FileService } = require('./services/file-service');

// Base directory => should have statement pdfs
const directory = process.env.BASE_DIRECTORY;

/**
 * Extracts total due amount from pdf data string
 * @param {*} data
 * @returns {Number} total due
 */
const getTotalDue = (data) => {
  const wordToSearch = 'Total Amount Due:';

  let updatedData = data.split(wordToSearch)[1];
  let totalDue = parseFloat(
    updatedData
      .split('Available Cash Limit:')[0]
      .split('Rs. ')[1]
      .split(',')
      .join('')
  );
  return totalDue;
};
/**
 * Extracts statement period from pdf data string
 * @param {*} data
 * @returns {Promise<Array>} start_date,end_date
 */
const getStatementPeriod = (data) => {
  const wordToSearch = 'Statement Period:';
  let updatedData = data.split(wordToSearch)[1];
  let [start_date, end_date] = updatedData
    .split('Credit Limit:')[0]
    .split('To');

  return [start_date.trim(), end_date.trim()];
};

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

const readCreditCardStatement = async () => {
  let FileInstance = FileService();
  let allFiles = await FileInstance.getAllFiles();
  // Get all credit card statements present in the base directory
  // let allFiles = await getAllFiles();
  const newData = [];
  let count = 0;
  // for each pdf statement
  for (let file of allFiles) {
    //read the pdf and parse it
    let creditPdf = await fs.readFile(`${directory}/${file}`);
    let data = await pdfParse(creditPdf);
    // Extract total due and statement period
    const totalDue = getTotalDue(data.text);
    const [start, end] = getStatementPeriod(data.text);
    //Append to array for writing
    newData.push({
      'Statement period': `${start}-${end}`,
      Amount: totalDue,
    });
  }
  // Write data to Excel sheet
  await writetoExcelSheet(newData);
};
// getAllFiles();
readCreditCardStatement();

/**
 * PENDING stuff:
 * - pdf decryption (cannot use pdfs with password right now)
 * - process all the transactions from pdf
 * - Code cleaning
 */
