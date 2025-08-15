export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined'
    ? (window.location.origin.includes('localhost:5173')
        ? 'http://localhost:5000'
        : window.location.origin)
    : 'http://localhost:5000')

export const apiFetch = async (path, options = {}) => {
  const url = `${API_BASE_URL}${path}`
  return fetch(url, options)
}
