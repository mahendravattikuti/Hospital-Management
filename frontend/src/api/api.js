const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api"

export const api = async (endpoint, method = "GET", body = null, token = null) => {
  const headers = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`
  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)
  
  // Construct the URL - handle both absolute and relative paths
  let url = endpoint
  if (BASE_URL.startsWith('http')) {
    url = `${BASE_URL}${endpoint}`
  } else if (!endpoint.startsWith('/api')) {
    url = `/api${endpoint}`
  }
  
  const res = await fetch(url, options)
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Something went wrong")
  return data
}
