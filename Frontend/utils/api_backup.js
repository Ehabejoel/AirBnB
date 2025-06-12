import { API_URL } from '../api/api_url';

export const signUp = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const signIn = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Sign in failed');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getProfile = async (token) => {
  try {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch profile');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const updateProfilePhoto = async (token, formData) => {
  try {
    const response = await fetch(`${API_URL}/auth/profile/photo`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile photo');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const becomeHost = async (token) => {
  try {
    const response = await fetch(`${API_URL}/auth/become-host`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to become a host');
    }
    
    const userData = await response.json();
    return userData; // This will include the updated user object with host role
  } catch (error) {
    throw error;
  }
};

export const createProperty = async (token, propertyData) => {
  try {
    const formData = new FormData();
    
    // Append all property data
    Object.keys(propertyData).forEach(key => {
      if (key === 'images') {
        propertyData.images.forEach((uri, index) => {
          const uriParts = uri.split('.');
          const fileType = uriParts[uriParts.length - 1];
          
          formData.append('images', {
            uri: uri,
            name: `photo${index + 1}.${fileType}`,
            type: `image/${fileType}`
          });
        });
      } else if (key === 'amenities' || key === 'houseRules' || key === 'location') {
        formData.append(key, JSON.stringify(propertyData[key]));
      } else {
        formData.append(key, propertyData[key]);
      }
    });

    const response = await fetch(`${API_URL}/properties`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create property');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getMyProperties = async (token) => {
  try {
    const response = await fetch(`${API_URL}/properties/my-properties`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch properties');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const addToWishlist = async (token, propertyId) => {
  try {
    const response = await fetch(`${API_URL}/properties/${propertyId}/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add to wishlist');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const removeFromWishlist = async (token, propertyId) => {
  try {
    const response = await fetch(`${API_URL}/properties/${propertyId}/wishlist`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove from wishlist');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getMyWishlist = async (token) => {
  try {
    const response = await fetch(`${API_URL}/properties/wishlist`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch wishlist');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Booking API functions
export const createBooking = async (token, bookingData) => {
  try {
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create booking');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getMyBookings = async (token, status = null, page = 1) => {
  try {
    let url = `${API_URL}/bookings/my-bookings?page=${page}`;
    if (status) {
      url += `&status=${status}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get bookings');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getHostBookings = async (token, status = null, page = 1) => {
  try {
    let url = `${API_URL}/bookings/host-bookings?page=${page}`;
    if (status) {
      url += `&status=${status}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get host bookings');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const updateBookingStatus = async (token, bookingId, status, cancellationReason = null) => {
  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, cancellationReason })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update booking status');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const cancelBooking = async (token, bookingId, cancellationReason) => {
  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ cancellationReason })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel booking');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getBookingDetails = async (token, bookingId) => {
  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get booking details');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const checkAvailability = async (propertyId, checkInDate, checkOutDate) => {
  try {
    const response = await fetch(`${API_URL}/bookings/property/${propertyId}/availability?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to check availability');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Booking API functions
export const createBooking = async (token, bookingData) => {
  try {
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create booking');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getMyBookings = async (token, status = null, page = 1) => {
  try {
    let url = `${API_URL}/bookings/my-bookings?page=${page}`;
    if (status) {
      url += `&status=${status}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get bookings');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getHostBookings = async (token, status = null, page = 1) => {
  try {
    let url = `${API_URL}/bookings/host-bookings?page=${page}`;
    if (status) {
      url += `&status=${status}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get host bookings');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const updateBookingStatus = async (token, bookingId, status, cancellationReason = null) => {
  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, cancellationReason })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update booking status');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const cancelBooking = async (token, bookingId, cancellationReason) => {
  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ cancellationReason })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel booking');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getBookingDetails = async (token, bookingId) => {
  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get booking details');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const checkAvailability = async (propertyId, checkInDate, checkOutDate) => {
  try {
    const response = await fetch(`${API_URL}/bookings/property/${propertyId}/availability?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to check availability');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};