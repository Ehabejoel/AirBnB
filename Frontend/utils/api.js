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