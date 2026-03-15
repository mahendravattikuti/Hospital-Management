const getBaseUrl = () => {
  // For development
  if (process.env.NODE_ENV === "development") {
    return process.env.REACT_APP_API_URL || "http://localhost:5000"
  }
  // For production on Vercel
  if (window.location.hostname === "localhost") {
    return "http://localhost:5000"
  }
  // Use the configured production URL or construct from current domain
  return process.env.REACT_APP_API_URL || `${window.location.origin}/api`
}

const BASE_URL = getBaseUrl()

export const api = async (endpoint, method = "GET", body = null, token = null) => {
  const headers = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`
  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)
  
  // Construct the URL
  let url = endpoint
  if (!endpoint.startsWith("/api")) {
    // Remove duplicate /api if it already exists in the endpoint
    url = endpoint.startsWith("/") ? `/api${endpoint}` : `/api/${endpoint}`
  }
  
  // Add base URL if not in production with same domain
  if (BASE_URL.startsWith("http")) {
    url = `${BASE_URL}${url}`
  }
  
  try {
    const res = await fetch(url, options)
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Something went wrong")
    return data
  } catch (err) {
    console.error(`API Error [${method} ${url}]:`, err)
    throw err
  }
}

