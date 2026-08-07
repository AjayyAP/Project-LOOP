const requiredHeaders = ['title', 'description', 'category', 'priority'];
const categories = new Set(['Bug', 'Feature Request', 'Improvement', 'Other']);
const priorities = new Set(['Low', 'Medium', 'High']);

export function validateCsvHeaders(headers) {
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
  return missingHeaders.length ? `CSV is missing required columns: ${missingHeaders.join(', ')}.` : null;
}

export function isEmptyCsvRow(row) {
  return requiredHeaders.every((header) => !String(row[header] || '').trim());
}

export function validateCsvFeedbackRow(row) {
  const title = String(row.title || '').trim();
  const description = String(row.description || '').trim();
  const category = String(row.category || '').trim();
  const priority = String(row.priority || '').trim();

  if (!title) return { reason: 'Title is required.' };
  if (title.length < 5 || title.length > 100) return { reason: 'Title must be between 5 and 100 characters.' };
  if (!description) return { reason: 'Description is required.' };
  if (description.length < 10 || description.length > 1000) return { reason: 'Description must be between 10 and 1000 characters.' };
  if (!categories.has(category)) return { reason: 'Category must be Bug, Feature Request, Improvement, or Other.' };
  if (!priorities.has(priority)) return { reason: 'Priority must be Low, Medium, or High.' };

  return { value: { title, description, category, priority } };
}
