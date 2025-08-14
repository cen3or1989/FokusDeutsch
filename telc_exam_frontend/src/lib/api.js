export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const apiFetch = async (path, options = {}) => {
  const url = `${API_BASE_URL}${path}`
  return fetch(url, options)
}
