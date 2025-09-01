import api from './api';
import { AxiosResponse } from 'axios';

export const apiService = {
  get: <T = any>(url: string, config?: any): Promise<T> => {
    return api.get<T>(url, config).then((response: AxiosResponse<T>) => response.data);
  },

  post: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return api.post<T>(url, data, config).then((response: AxiosResponse<T>) => response.data);
  },

  put: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return api.put<T>(url, data, config).then((response: AxiosResponse<T>) => response.data);
  },

  patch: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return api.patch<T>(url, data, config).then((response: AxiosResponse<T>) => response.data);
  },

  delete: <T = any>(url: string, config?: any): Promise<T> => {
    return api.delete<T>(url, config).then((response: AxiosResponse<T>) => response.data);
  }
};