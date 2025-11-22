const API_BASE_URL = "http://localhost:8080/api/v1";

export async function apiRequest(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json"
  };

  if (token && token !== "null" && token !== "undefined") {
    headers["Authorization"] = `Bearer ${token}`;
  }


  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, options);

    if (response.status === 401) {
      console.warn("Session expired. Redirecting to login...");
      localStorage.removeItem("token");
      window.location.href = "/login.html";
      return;
    }

    if (response.status === 204) {
      return null;
    }

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      console.error("API Error:", {
        endpoint,
        method,
        status: response.status,
        message: data?.message || data,
      });
      throw new Error(data?.message || `Request failed: ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error("Network or parsing error:", error.message);
    throw error;
  }
}


export function smoothReload() {
  document.body.classList.add("fade-out");
  setTimeout(() => location.reload(), 200);
}