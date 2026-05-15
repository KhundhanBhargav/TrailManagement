// Authentication Endpoints
export const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register/',
  LOGIN: '/auth/login/',
  REFRESH: '/auth/refresh/',
  LOGOUT: '/auth/logout/',
};

// Events Endpoints
export const EVENT_ENDPOINTS = {
  LIST: '/events/',
  DETAIL: (id) => `/events/${id}/`,
};

// Function Halls Endpoints
export const HALL_ENDPOINTS = {
  LIST: '/function-halls/',
  DETAIL: (id) => `/function-halls/${id}/`,
};

// Decoration Endpoints
export const DECORATION_ENDPOINTS = {
  LIST: '/decorations/',
};

// Food Endpoints
export const FOOD_ENDPOINTS = {
  LIST: '/food-items/',
};

// Other Services Endpoints
export const SERVICE_ENDPOINTS = {
  LIST: '/services/',
};

// Booking Endpoints
export const BOOKING_ENDPOINTS = {
  CREATE: '/bookings/',
  LIST: '/bookings/',
  DETAIL: (id) => `/bookings/${id}/`,
  UPDATE: (id) => `/bookings/${id}/`,
};

// Payment Endpoints
export const PAYMENT_ENDPOINTS = {
  CREATE: '/payments/',
  VERIFY: '/payments/verify/',
};

// Admin Endpoints
export const ADMIN_ENDPOINTS = {
  DASHBOARD: '/admin/dashboard/',
  BOOKINGS: '/admin/bookings/',
  VENUES: '/admin/venues/',
  DECORATIONS: '/admin/decorations/',
  FOOD: '/admin/food/',
  SERVICES: '/admin/services/',
};
