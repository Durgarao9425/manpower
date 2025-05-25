import type { Rider, RiderDocument } from "./types";

const API_URL = 'http://localhost:4003/api';

export const fetchRiders = async () => {
  const response = await fetch(`${API_URL}/riders`);
  if (!response.ok) throw new Error('Failed to fetch riders');
  return await response.json();
};

export const fetchRiderDocuments = async (riderId: string) => {
  const response = await fetch(`${API_URL}/rider-documents/${riderId}`);
  if (!response.ok) throw new Error('Failed to fetch rider documents');
  return await response.json();
};

export const createRider = async (riderData: Partial<Rider>) => {
  const response = await fetch(`${API_URL}/riders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(riderData)
  });
  if (!response.ok) throw new Error('Failed to create rider');
  return await response.json();
};

export const updateRider = async (riderId: string, riderData: Partial<Rider>) => {
  const response = await fetch(`${API_URL}/riders/${riderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(riderData)
  });
  if (!response.ok) throw new Error('Failed to update rider');
  return await response.json();
};

export const deleteRider = async (riderId: string) => {
  const response = await fetch(`${API_URL}/riders/${riderId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete rider');
  return true;
};

export const updateRiderDocuments = async (riderId: string, documentData: Partial<RiderDocument>) => {
  const response = await fetch(`${API_URL}/rider-documents/${riderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(documentData)
  });
  if (!response.ok) throw new Error('Failed to update rider documents');
  return await response.json();
};