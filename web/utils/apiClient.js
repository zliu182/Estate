/**
 * API Client Utility
 *
 * Provides functions to make authenticated API calls to the backend.
 * Automatically includes the Bearer token in the Authorization header.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * Makes an authenticated API request
 *
 * @param {string} endpoint - The API endpoint (e.g., '/getStaffs')
 * @param {Object} options - Fetch options
 * @param {string} accessToken - The access token from MSAL
 * @returns {Promise} Response from the API
 */
export async function apiRequest(endpoint, options = {}, accessToken) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add Authorization header if access token is provided
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

/**
 * GET request helper
 */
export async function apiGet(endpoint, accessToken) {
  return apiRequest(endpoint, { method: "GET" }, accessToken);
}

/**
 * POST request helper
 */
export async function apiPost(endpoint, data, accessToken) {
  return apiRequest(
    endpoint,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    accessToken
  );
}

/**
 * PUT request helper
 */
export async function apiPut(endpoint, data, accessToken) {
  return apiRequest(
    endpoint,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    accessToken
  );
}

/**
 * DELETE request helper
 */
export async function apiDelete(endpoint, accessToken) {
  return apiRequest(endpoint, { method: "DELETE" }, accessToken);
}
