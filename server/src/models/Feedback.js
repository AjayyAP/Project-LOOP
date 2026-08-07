import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    category: {
      type: String,
      required: true,
      enum: ['Bug', 'Feature Request', 'Improvement', 'Other'],
    },
    priority: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High'],
    },
    status: {
      type: String,
      default: 'NEW',
      enum: ['NEW', 'REVIEWED', 'ACTIONED'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    sentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative', null],
      default: null,
    },
    sentimentScore: {
      type: Number,
      min: -1,
      max: 1,
      default: null,
    },
    theme: {
      type: String,
      default: null,
    },
    featureArea: {
      type: String,
      enum: ['Login', 'Dashboard', 'Feedback', 'Workspace', 'Search', 'CSV Import', 'Analytics', 'Other', null],
      default: null,
    },
    aiSummary: {
      type: String,
      default: null,
    },
    channel: {
      type: String,
      default: 'Manual',
    },
  },
  { timestamps: true },
);

feedbackSchema.index(
  { title: 'text', description: 'text', theme: 'text', featureArea: 'text', aiSummary: 'text' },
  { weights: { title: 10, theme: 6, featureArea: 4, description: 3, aiSummary: 2 } },
);

export default mongoose.model('Feedback', feedbackSchema);
