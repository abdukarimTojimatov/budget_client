// Determine the API endpoint based on the current hostname at runtime
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// Use the current hostname for API endpoints to handle custom domains
// Use same protocol as the page to avoid mixed content errors
const protocol = window.location.protocol; // Will be 'http:' or 'https:'
const baseURL = isLocalhost
  ? "http://localhost:4000"
  : `${protocol}//${window.location.hostname}/api`;

export { baseURL };
