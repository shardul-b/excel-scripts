/**
 * What it does:
 *  picks up all the pdfs (credit card statements) from the Base directory
 *  parses them and stores the required dets in an Excel sheet
 *
 */
const fs = require('fs').promises;

const pdfParse = require('pdf-parse');
const { FileService } = require('./services/file-service');
const { writetoExcelSheet } = require('./services/excel-service');

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
readCreditCardStatement();

/**
 * PENDING stuff:
 * - pdf decryption (cannot use pdfs with password right now)
 * - process all the transactions from pdf
 * - Code cleaning
 * - Excel service can be improved
 * - Repeated use of file (closure improvements needed)
 */
