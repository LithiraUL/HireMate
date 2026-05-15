const axios = require('axios');

let pdfParse;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  console.warn('pdf-parse is not installed. PDF extraction will fail.');
}

/**
 * Downloads a file from a URL and extracts its raw text content.
 * 
 * @param {string} fileUrl - The URL of the CV/Resume (e.g., from Cloudinary).
 * @param {string} mimetype - Optional mimetype to explicitly declare format.
 * @returns {Promise<string>} The cleaned extracted text.
 */
const extractTextFromUrl = async (fileUrl, mimetype = '') => {
  if (!fileUrl) {
    throw new Error('File URL is required for text extraction');
  }

  // 1. Download the file into an ArrayBuffer
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');
  const contentType = response.headers['content-type'] || mimetype;

  return extractTextFromBuffer(buffer, contentType, fileUrl);
};

/**
 * Extracts text directly from a binary buffer.
 * Useful for processing files instantly during multer upload.
 * 
 * @param {Buffer} buffer - The raw file buffer.
 * @param {string} contentType - The mimetype of the file.
 * @param {string} filename - Optional filename/url for fallback extension matching.
 * @returns {Promise<string>} The cleaned extracted text.
 */
const extractTextFromBuffer = async (buffer, contentType = '', filename = '') => {
  let extractedText = '';

  const isPDF = contentType.includes('application/pdf') || filename.toLowerCase().includes('.pdf');

  if (isPDF) {
    if (!pdfParse) {
      throw new Error('pdf-parse module is missing. Cannot extract text from PDF.');
    }
    const pdfData = await pdfParse(buffer);
    extractedText = pdfData.text;
  } else {
    // Fallback: Assume it's plain text, RTF, or raw decodable string data
    extractedText = buffer.toString('utf8');
  }

  return cleanExtractedText(extractedText);
};

/**
 * Strips out excessive whitespace and invalid characters from the raw text
 * to optimize token usage for the AI prompt.
 */
const cleanExtractedText = (text) => {
  if (!text) return '';
  return text
    .replace(/[\r\n]+/g, '\n')       // Normalize multiple newlines into a single newline
    .replace(/\s{2,}/g, ' ')         // Collapse multiple spaces
    // .replace(/[^\x20-\x7E\n]/g, '')  // (Optional) Remove non-printable ASCII
    .trim();
};

module.exports = {
  extractTextFromUrl,
  extractTextFromBuffer,
  cleanExtractedText
};
