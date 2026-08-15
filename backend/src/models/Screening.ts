/**
 * Screening.ts — Retinal Screening Model
 *
 * Persists retinal fundus screenings and AI classification results:
 *   - patientId: Reference to the patient User
 *   - doctorId: Reference to the verified doctor User who initiated the screening
 *   - image: Uploaded image metadata
 *   - aiResult: 5-class EfficientNet-B4 prediction, probability distribution, and referable triage
 *   - status: Lifecycle state ('pending_review' initially)
 */

import mongoose, { Document, Schema, Types } from 'mongoose';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ScreeningStatus = 'pending_review' | 'reviewed' | 'rejected';

export interface IScreeningImage {
  originalFilename: string;
  mimeType: string;
  size: number;
}

export interface IScreeningAIResult {
  predictedClass: number;
  predictedLabel: string;
  confidence: number;
  classProbabilities: {
    '0': number;
    '1': number;
    '2': number;
    '3': number;
    '4': number;
  };
  referable: boolean;
  referableProbability: number;
  disclaimer?: string;
}

export interface IScreening extends Document {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  image: IScreeningImage;
  aiResult: IScreeningAIResult;
  status: ScreeningStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const screeningSchema = new Schema<IScreening>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
      index: true,
    },

    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
      index: true,
    },

    image: {
      originalFilename: {
        type: String,
        required: [true, 'Original filename is required'],
      },
      mimeType: {
        type: String,
        required: [true, 'Image MIME type is required'],
      },
      size: {
        type: Number,
        required: [true, 'Image size is required'],
      },
    },

    aiResult: {
      predictedClass: {
        type: Number,
        required: [true, 'Predicted class is required'],
        min: 0,
        max: 4,
      },
      predictedLabel: {
        type: String,
        required: [true, 'Predicted label is required'],
      },
      confidence: {
        type: Number,
        required: [true, 'Confidence score is required'],
      },
      classProbabilities: {
        '0': { type: Number, required: true },
        '1': { type: Number, required: true },
        '2': { type: Number, required: true },
        '3': { type: Number, required: true },
        '4': { type: Number, required: true },
      },
      referable: {
        type: Boolean,
        required: [true, 'Referable status is required'],
      },
      referableProbability: {
        type: Number,
        required: [true, 'Referable probability is required'],
      },
      disclaimer: {
        type: String,
        default: 'AI prediction is a screening aid and requires doctor review.',
      },
    },

    status: {
      type: String,
      enum: {
        values: ['pending_review', 'reviewed', 'rejected'] as ScreeningStatus[],
        message: 'Invalid screening status',
      },
      default: 'pending_review',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Doctor history query optimization
screeningSchema.index({ doctorId: 1, createdAt: -1 });

// Doctor history filtered by patient
screeningSchema.index({ doctorId: 1, patientId: 1, createdAt: -1 });

// Patient history lookup (for future phases)
screeningSchema.index({ patientId: 1, createdAt: -1 });

// ─── Model ────────────────────────────────────────────────────────────────────

const Screening = mongoose.model<IScreening>('Screening', screeningSchema);

export default Screening;
