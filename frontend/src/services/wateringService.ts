import api from './api';
import { PlantWatering } from './types';
// Backend registers the plant_watering router at /api/watering/ (see Backend/urls.py)
const API_URL = 'http://127.0.0.1:8000/api/watering/';



export const getWaterings = async (): Promise<PlantWatering[]> => {
  const res = await api.get<PlantWatering[]>("/watering/");
  return res.data;
};


export const addWatering = async (watering: PlantWatering): Promise<PlantWatering> => {
  const res = await api.post<PlantWatering>("/watering/", watering);
  return res.data;
}


export const deleteWatering = async (id: number): Promise<void> => {
  await api.delete(`/watering/${id}/`);
}


export const updateWatering = async (watering: PlantWatering): Promise<PlantWatering> => {
  const res = await api.put<PlantWatering>(`/watering/${watering.id}/`, watering);
  return res.data;
}




export const getPlants = async (): Promise<any[]> => {
  try {
    const res = await api.get<any>("/plants/");

    // Backend may return either a raw array (e.g. [ { id, name } ])
    // or an envelope like { data: [...] }. Normalize both cases.
    if (Array.isArray(res.data)) {
      return res.data;
    }

    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }

    console.warn("Unexpected plants response shape:", res.data);
    return [];
  } catch (error) {
    // Don't throw here — return empty array so the UI can render gracefully.
    console.error("Error fetching plants:", error);
    return [];
  }

}

// Fetch weather forecast (optionally provide lat/lon)
export const getWeather = async (params?: { lat?: number; lon?: number }) => {
  try {
    console.log('Fetching weather from /watering/weather_forecast/');
    const res = await api.get('/watering/weather_forecast/', { params });
    console.log('Weather response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    return null;
  }
};

