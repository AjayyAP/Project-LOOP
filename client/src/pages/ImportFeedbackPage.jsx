import { ArrowLeft, Download, FileSpreadsheet, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { importFeedbackCsv } from '../services/feedbackService';

const maxFileSize = 5 * 1024 * 1024;
const templateUrl = 'data:text/csv;charset=utf-8,title%2Cdescription%2Ccategory%2Cpriority%0AExample%20feedback%2CDescribe%20the%20feedback%20in%20at%20least%20ten%20characters%2CBug%2CMedium%0A';

function formatFileSize(bytes) { return `${(bytes / 1024 / 1024).toFixed(bytes < 1024 * 1024 ? 2 : 1)} MB`; }

function ImportFeedbackPage() {
  const { workspaceId } = useParams();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  function selectFile(nextFile) {
    setError(''); setResult(null); setProgress(0);
    if (!nextFile) return;
    if (!nextFile.name.toLowerCase().endsWith('.csv')) { setError('Please select a CSV file.'); return; }
    if (nextFile.size > maxFileSize) { setError('CSV files must be 5 MB or smaller.'); return; }
    setFile(nextFile);
  }

  function handleDrop(event) { event.preventDefault(); selectFile(event.dataTransfer.files[0]); }

  async function handleImport() {
    if (!file) { setError('Select a CSV file before importing.'); return; }
    setIsUploading(true); setError(''); setResult(null);
    try { setResult((await importFeedbackCsv(workspaceId, file, setProgress)).data); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to import the CSV file.'); }
    finally { setIsUploading(false); }
  }

  return <main className="workspace-page"><section className="form-page-card import-page"><Link className="back-link" to={`/workspaces/${workspaceId}`}><ArrowLeft size={17} /> Workspace details</Link><div className="page-title"><span className="card-icon"><FileSpreadsheet size={21} /></span><div><p className="eyebrow">Feedback import</p><h1>Import CSV Feedback</h1><p>Upload feedback in bulk for this workspace.</p></div></div><a className="template-link" href={templateUrl} download="feedback-import-template.csv"><Download size={17} /> Download CSV template</a><div className="upload-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop} role="button" tabIndex="0" onKeyDown={(event) => event.key === 'Enter' && inputRef.current?.click()} onClick={() => inputRef.current?.click()}><UploadCloud size={32} /><strong>Drag and drop a CSV file here</strong><span>or click to browse · maximum 5 MB</span><input ref={inputRef} type="file" accept=".csv,text/csv" onChange={(event) => selectFile(event.target.files[0])} /></div>{file && <div className="selected-file"><FileSpreadsheet size={19} /><span><strong>{file.name}</strong><small>{formatFileSize(file.size)}</small></span><button type="button" onClick={() => setFile(null)} disabled={isUploading}>Remove</button></div>}{isUploading && <div className="progress-wrap"><div><span>Uploading and importing...</span><strong>{progress}%</strong></div><progress value={progress} max="100" /></div>}{error && <p className="form-error" role="alert">{error}</p>}{file && <button className="import-button" type="button" onClick={handleImport} disabled={isUploading}>{isUploading ? 'Importing...' : 'Import feedback'}</button>}{result && <section className="import-result"><p className="form-success" role="status">Import completed.</p><div className="import-summary"><div><strong>{result.imported}</strong><span>Imported</span></div><div><strong>{result.failed}</strong><span>Failed</span></div></div>{result.errors.length > 0 && <div className="import-errors"><h2>Rows not imported</h2><div className="error-table"><div><strong>Row</strong><strong>Reason</strong></div>{result.errors.map((item) => <div key={`${item.row}-${item.reason}`}><span>{item.row}</span><span>{item.reason}</span></div>)}</div></div>}</section>}</section></main>;
}

export default ImportFeedbackPage;
