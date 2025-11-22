// api/client.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.50:3000/api',
  timeout: 10000,
});

export const getTruckCertSchema = async () => {
  const response = await api.get('/schema/truck-cert');
  return response.data;
};