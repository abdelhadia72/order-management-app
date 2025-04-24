// Make sure the API URL is correct and doesn't have trailing slashes
// If using a development environment without a real API, you can set this to an empty string
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
