import axios from 'axios';

// Default base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token (if you have token refresh endpoint)
        // const refreshToken = localStorage.getItem('refreshToken');
        // const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        // localStorage.setItem('token', response.data.token);
        // api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Return original request
        // return api(originalRequest);
        
        // For now, just logout
        localStorage.removeItem('token');
        window.location.href = '/login';
      } catch (_error) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(_error);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth services
const authService = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) => 
    api.post('/auth/register', { name, email, password }),
  logout: () => api.post('/auth/logout'),
  resetPassword: (email: string) => api.post('/auth/reset-password', { email }),
  verifyEmail: (token: string) => api.get(`/auth/verify-email/${token}`),
  getMe: () => api.get('/users/me'),
};

// Asset services
const assetService = {
  getAssets: (params?: any) => api.get('/assets', { params }),
  getAssetById: (id: string) => api.get(`/assets/${id}`),
  getAssetInvestors: (id: string, params?: any) => 
    api.get(`/assets/${id}/investors`, { params }),
  getAssetPerformance: (id: string, period: string) => 
    api.get(`/assets/${id}/performance`, { params: { period } }),
};

// Investment services
const investmentService = {
  getInvestments: (params?: any) => api.get('/investments', { params }),
  getInvestmentById: (id: string) => api.get(`/investments/${id}`),
  createInvestment: (data: any) => api.post('/investments', data),
  withdrawEarnings: (id: string, amount: number) => 
    api.post(`/investments/${id}/withdraw`, { amount }),
  redeemInvestment: (id: string) => api.post(`/investments/${id}/redeem`),
  getEarnings: (id: string, params?: any) => 
    api.get(`/investments/${id}/earnings`, { params }),
};

// User services
const userService = {
  updateProfile: (data: any) => api.put('/users/me', data),
  updatePassword: (currentPassword: string, newPassword: string) => 
    api.put('/users/me/password', { currentPassword, newPassword }),
  getReferrals: (params?: any) => api.get('/users/me/referrals', { params }),
  getReferralStats: () => api.get('/users/me/referrals/stats'),
  getReferralLink: () => api.get('/users/me/referral-link'),
};

// Governance services
const governanceService = {
  getProposals: (params?: any) => api.get('/governance/proposals', { params }),
  getProposalById: (id: string) => api.get(`/governance/proposals/${id}`),
  createProposal: (data: any) => api.post('/governance/proposals', data),
  vote: (proposalId: string, vote: 'yes' | 'no' | 'abstain') => 
    api.post(`/governance/proposals/${proposalId}/vote`, { vote }),
  getVotingPower: () => api.get('/governance/voting-power'),
};

// Export all services
export {
  api as default,
  authService,
  assetService,
  investmentService,
  userService,
  governanceService,
}; 