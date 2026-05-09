const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
    const error = new Error(data.message || 'Request failed.');
    error.details = data.errors || [];
    throw error;
  }

  return data;
}

export const api = {
  getExperts(params) {
    const query = new URLSearchParams(params);
    return request(`/experts?${query.toString()}`);
  },
  getExpert(id) {
    return request(`/experts/${id}`);
  },
  createBooking(payload) {
    return request('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  getBookings(email) {
    return request(`/bookings?email=${encodeURIComponent(email)}`);
  },
  updateBookingStatus(id, status) {
    return request(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
