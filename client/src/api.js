const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.details = data.errors || [];
    throw error;
  }

  return data;
}

export const api = {
  getExperts(params) {
    const query = new URLSearchParams(params);
    return request(`/api/experts?${query.toString()}`);
  },

  getExpert(id) {
    return request(`/api/experts/${id}`);
  },

  createBooking(payload) {
    return request(`/api/bookings`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getBookings(email) {
    return request(`/api/bookings?email=${encodeURIComponent(email)}`);
  },

  updateBookingStatus(id, status) {
    return request(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};
