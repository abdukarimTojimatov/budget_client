// Determine the API endpoint based on the current hostname at runtime
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// Use the current hostname for API endpoints to handle custom domains
// Use HTTPS for production to avoid mixed content errors
const baseURL = isLocalhost
  ? "http://localhost:4000"
  : `https://${window.location.hostname}:4000`;

export { baseURL };
