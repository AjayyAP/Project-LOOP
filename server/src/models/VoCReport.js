import mongoose from 'mongoose';

const sentimentShiftSchema = new mongoose.Schema({
  positive: { type: Number, default: 0 },
  neutral: { type: Number, default: 0 },
  negative: { type: Number, default: 0 },
}, { _id: false });

const quoteSchema = new mongoose.Schema({
  feedback: { type: mongoose.Schema.Types.ObjectId, ref: 'Feedback', required: true },
  title: { type: String, required: true },
  quote: { type: String, required: true },
}, { _id: false });

const vocReportSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateRange: { label: { type: String, required: true }, startDate: Date, endDate: Date },
  generatedAt: { type: Date, default: Date.now },
  executiveSummary: { type: String, required: true },
  topThemes: { type: String, required: true },
  sentimentOverview: { type: String, required: true },
  criticalIssues: { type: String, required: true },
  positiveFeedback: { type: String, required: true },
  recommendations: { type: String, required: true },
  productImprovementOpportunities: { type: String, required: true },
  finalConclusion: { type: String, required: true },
  verbatimQuotes: { type: [quoteSchema], default: [] },
  sentimentShift: { type: sentimentShiftSchema, default: () => ({}) },
}, { timestamps: true });

vocReportSchema.index({ workspace: 1, generatedAt: -1 });

export default mongoose.model('VoCReport', vocReportSchema);
