import api from "./api";
import { Plant, PlantCreateUpdate } from "./types";

// ==========================================
// Plant Service
// ==========================================

/**
 * Get all plants
 */
export const getAllPlants = async (): Promise<Plant[]> => {
  const response = await api.get("/plants/");
  return response.data;
};

/**
 * Get a single plant by ID
 */
export const getPlantById = async (id: number): Promise<Plant> => {
  const response = await api.get(`/plants/${id}/`);
  return response.data;
};

/**
 * Create a new plant
 */
export const createPlant = async (plantData: PlantCreateUpdate): Promise<Plant> => {
  // Send only the data without FormData
  const data = {
    name: plantData.name,
    species: plantData.species,
    age: plantData.age,
    height: plantData.height,
    width: plantData.width,
    description: plantData.description,
    image: typeof plantData.image === 'string' ? plantData.image : '',
  };
  
  const response = await api.post("/plants/", data);
  return response.data;
};

/**
 * Update an existing plant
 */
export const updatePlant = async (
  id: number,
  plantData: PlantCreateUpdate
): Promise<Plant> => {
  // Send only the data without FormData
  const data = {
    name: plantData.name,
    species: plantData.species,
    age: plantData.age,
    height: plantData.height,
    width: plantData.width,
    description: plantData.description,
    image: typeof plantData.image === 'string' ? plantData.image : '',
  };
  
  const response = await api.put(`/plants/${id}/`, data);
  return response.data;
};

/**
 * Delete a plant
 */
export const deletePlant = async (id: number): Promise<void> => {
  await api.delete(`/plants/${id}/`);
};

/**
 * Get watering records for a plant
 */
export const getPlantWateringRecords = async (id: number): Promise<any[]> => {
  const response = await api.get(`/plants/${id}/watering_record/`);
  return response.data;
};

/**
 * Upload plant image to Cloudinary
 */
export const uploadPlantImage = async (imageFile: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await api.post("/plants/upload_image/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.image_url;
};
