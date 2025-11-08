import { PlantWatering } from './types';
const API_URL = 'http://127.0.0.1:8000/api/plant-watering/';



export const getWaterings = async (): Promise<PlantWatering[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch waterings');
  return res.json();
};


export const addWatering = async (watering: PlantWatering): Promise<PlantWatering> => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(watering),
  });   
  if (!res.ok) throw new Error('Failed to add watering');
  return res.json();
};


export const updateWatering = async (watering: PlantWatering): Promise<PlantWatering> => {
  const res = await fetch(`${API_URL}${watering.id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(watering),
  });
  if (!res.ok) throw new Error('Failed to update watering');
  return res.json();
};


export const deleteWatering = async (id: number) => {
  const res = await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete watering');
};