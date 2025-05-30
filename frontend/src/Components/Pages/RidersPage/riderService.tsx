import apiService from '../../../services/apiService';
import type { Rider, RiderDocument } from "./types";

export const fetchRiders = async () => {
  return await apiService.get('/riders');
};

export const fetchRiderDocuments = async (riderId: string) => {
  return await apiService.get(`/rider-documents/${riderId}`);
};

export const createRider = async (riderData: Partial<Rider>) => {
  return await apiService.post('/riders', riderData);
};

export const updateRider = async (riderId: string, riderData: Partial<Rider>) => {
  return await apiService.put(`/riders/${riderId}`, riderData);
};

export const deleteRider = async (riderId: string) => {
  await apiService.delete(`/riders/${riderId}`);
  return true;
};

export const updateRiderDocuments = async (riderId: string, documentData: Partial<RiderDocument>) => {
  return await apiService.put(`/rider-documents/${riderId}`, documentData);
};