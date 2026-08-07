import { Readable } from 'node:stream';
import csvParser from 'csv-parser';
import Feedback from '../models/Feedback.js';
import { isEmptyCsvRow, validateCsvFeedbackRow, validateCsvHeaders } from '../utils/csvValidation.js';

function parseCsv(buffer) {
  return new Promise((resolve, reject) => {
    const rows = [];
    let headersValidated = false;
    let headerError = null;

    Readable.from(buffer)
      .pipe(csvParser({ mapHeaders: ({ header }) => header.trim() }))
      .on('headers', (headers) => {
        headerError = validateCsvHeaders(headers);
        headersValidated = true;
      })
      .on('data', (row) => rows.push(row))
      .on('error', reject)
      .on('end', () => {
        if (!headersValidated) return reject(new Error('CSV file must include a header row.'));
        if (headerError) return reject(new Error(headerError));
        return resolve(rows);
      });
  });
}

export async function importFeedbackCsv(request, response, next) {
  try {
    const rows = await parseCsv(request.file.buffer);
    const errors = [];
    const feedbackToImport = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2;
      if (isEmptyCsvRow(row)) return;
      const validation = validateCsvFeedbackRow(row);
      if (!validation.value) {
        errors.push({ row: rowNumber, reason: validation.reason });
        return;
      }
      feedbackToImport.push({ ...validation.value, workspace: request.feedbackWorkspace._id, createdBy: request.user._id, status: 'NEW' });
    });

    if (feedbackToImport.length) await Feedback.insertMany(feedbackToImport, { ordered: false });

    return response.status(200).json({
      success: true,
      message: 'CSV import completed.',
      data: { imported: feedbackToImport.length, failed: errors.length, errors },
    });
  } catch (error) {
    if (error.message.includes('CSV')) {
      return response.status(422).json({ success: false, message: error.message });
    }
    return next(error);
  }
}
