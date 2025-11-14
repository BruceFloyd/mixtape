import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

// Auth endpoints
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.post('/auth/refresh');
  return response.data;
};

// Spotify endpoints
export const searchTracks = async (query, limit = 20) => {
  const response = await api.get('/spotify/search', {
    params: { q: query, limit }
  });
  return response.data;
};

export const getUserPlaylists = async () => {
  const response = await api.get('/spotify/playlists');
  return response.data;
};

export const getPlaylistTracks = async (playlistId) => {
  const response = await api.get(`/spotify/playlists/${playlistId}/tracks`);
  return response.data;
};

export const getTrack = async (trackId) => {
  const response = await api.get(`/spotify/tracks/${trackId}`);
  return response.data;
};

// Mixtape endpoints
export const createMixtape = async (mixtapeData) => {
  const response = await api.post('/mixtapes', mixtapeData);
  return response.data;
};

export const getMixtape = async (slug) => {
  const response = await api.get(`/mixtapes/${slug}`);
  return response.data;
};

export const incrementPlayCount = async (id) => {
  const response = await api.post(`/mixtapes/${id}/play`);
  return response.data;
};

export const getUserMixtapes = async () => {
  const response = await api.get('/mixtapes/user/mine');
  return response.data;
};

export default api;
