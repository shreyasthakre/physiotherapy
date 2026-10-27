import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import * as recordModel from '../models/recordModel.js';
import * as userModel from '../models/userModel.js';

/** GET /api/patients/me/records — patient views their own records. */
export const listMyRecords = asyncHandler(async (req, res) => {
  const type = req.query.type || undefined;
  const records = await recordModel.listForPatient(req.user.id, type);
  res.json({ records });
});

/** GET /api/patients/:id/records — staff views a patient's records. */
export const listPatientRecords = asyncHandler(async (req, res) => {
  const patient = await userModel.findById(req.params.id);
  if (!patient || patient.role !== 'patient') throw ApiError.notFound('Patient not found');
  const records = await recordModel.listForPatient(req.params.id);
  res.json({ patient, records });
});

/** POST /api/patients/:id/records — physiotherapist/admin creates a record. */
export const createRecord = asyncHandler(async (req, res) => {
  const patient = await userModel.findById(req.params.id);
  if (!patient || patient.role !== 'patient') throw ApiError.notFound('Patient not found');

  const record = await recordModel.createRecord({
    ...req.body,
    patientId: req.params.id,
    physiotherapistId: req.user.id,
  });
  res.status(201).json({ record });
});

/** DELETE /api/records/:id — physiotherapist/admin removes a record. */
export const deleteRecord = asyncHandler(async (req, res) => {
  const ok = await recordModel.deleteRecord(req.params.id);
  if (!ok) throw ApiError.notFound('Record not found');
  res.status(204).send();
});

/** GET /api/patients — staff lists all patients. */
export const listPatients = asyncHandler(async (_req, res) => {
  const patients = await userModel.listByRole('patient');
  res.json({ patients });
});
