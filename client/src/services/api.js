/**
 * API Service for Raseed Backend
 * Handles all HTTP requests with Google Cloud OAuth authentication
 */

const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.currentUserId = null;
    this.authToken = null;
  }

  /**
   * Set current user ID and auth token from authentication context
   */
  setUserId(userId) {
    this.currentUserId = userId;
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Get current user ID with fallback strategies
   */
  getUserId() {
    // 1. Use explicitly set user ID
    if (this.currentUserId) {
      return this.currentUserId;
    }

    // 2. Try to get from Firebase Auth context
    try {
      // This would be set by AuthContext
      const authUser = window.firebase?.auth?.currentUser;
      if (authUser?.uid) {
        return authUser.uid;
      }
    } catch (error) {
      console.warn('Could not get Firebase auth user:', error);
    }

    // 3. Try localStorage
    try {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        return userData.uid || userData.id;
      }
    } catch (error) {
      console.warn('Could not parse stored user data:', error);
    }

    // 4. Default fallback for development
    console.warn('No user ID found, using default: user1');
    return 'user1';
  }

  /**
   * Get authentication token
   */
  getAuthToken() {
    if (this.authToken) {
      return this.authToken;
    }

    try {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        return userData.idToken;
      }
    } catch (error) {
      console.warn('Could not get auth token:', error);
    }

    return null;
  }

  /**
   * Generic HTTP request handler with authentication
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`Making authenticated API request to: ${url}`);
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Token expired or invalid, redirect to login
        console.warn('Authentication failed, redirecting to login');
        throw new Error('Authentication failed. Please sign in again.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`API response from ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Health check endpoint
   */
  async checkHealth() {
    return this.request('/health');
  }

  /**
   * Root endpoint
   */
  async getRoot() {
    return this.request('/');
  }

  // === Insight API Methods ===

  /**
   * Get Financial Health Score analysis
   */
  async getFinancialHealthScore(userId = null, timeRange = 'month') {
    const uid = userId || this.getUserId();
    return this.request(`/api/insights/fhs?user_id=${uid}&timeRange=${timeRange}`);
  }

  /**
   * Get recurring purchase patterns
   */
  async getRecurringPatterns(userId = null, timeRange = 'month') {
    const uid = userId || this.getUserId();
    return this.request(`/api/insights/recurring?user_id=${uid}&timeRange=${timeRange}`);
  }

  /**
   * Get need vs want spending analysis
   */
  async getNeedWantAnalysis(userId = null, timeRange = 'month') {
    const uid = userId || this.getUserId();
    return this.request(`/api/insights/need-want?user_id=${uid}&timeRange=${timeRange}`);
  }

  /**
   * Get spending overlaps and duplicate subscriptions
   */
  async getSpendingOverlaps(userId = null, timeRange = 'month') {
    const uid = userId || this.getUserId();
    return this.request(`/api/insights/overlap?user_id=${uid}&timeRange=${timeRange}`);
  }

  /**
   * Get pantry management and food waste analysis
   */
  async getPantryAnalysis(userId = null, timeRange = 'month') {
    const uid = userId || this.getUserId();
    return this.request(`/api/insights/pantry?user_id=${uid}&timeRange=${timeRange}`);
  }

  /**
   * Get micro-moment and impulse spending analysis
   */
  async getMicroMomentAnalysis(userId = null, timeRange = 'month') {
    const uid = userId || this.getUserId();
    return this.request(`/api/insights/micro-moment?user_id=${uid}&timeRange=${timeRange}`);
  }

  /**
   * Get all insights at once
   */
  async getAllInsights(userId = null, timeRange = 'month') {
    const uid = userId || this.getUserId();
    return this.request(`/api/insights/all?user_id=${uid}&timeRange=${timeRange}`);
  }

  /**
   * Generic insight fetcher - maps tool IDs to API methods
   */
  async getInsight(toolId, userId = null, timeRange = 'month') {
    const uid = userId || this.getUserId();
    
    const methodMap = {
      'fhs': this.getFinancialHealthScore,
      'recurring': this.getRecurringPatterns,
      'need_want': this.getNeedWantAnalysis,
      'overlap': this.getSpendingOverlaps,
      'pantry': this.getPantryAnalysis,
      'micro_moment': this.getMicroMomentAnalysis,
    };

    const method = methodMap[toolId];
    if (!method) {
      throw new Error(`Unknown insight tool: ${toolId}`);
    }

    return method.call(this, uid, timeRange);
  }

  /**
   * Check if server is accessible
   */
  async isServerConnected() {
    try {
      await this.checkHealth();
      return true;
    } catch (error) {
      console.warn('Server connection failed:', error.message);
      return false;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

export default apiService;

// Also export individual methods for convenience
export const {
  checkHealth,
  getFinancialHealthScore,
  getRecurringPatterns,
  getNeedWantAnalysis,
  getSpendingOverlaps,
  getPantryAnalysis,
  getMicroMomentAnalysis,
  getAllInsights,
  getInsight,
  isServerConnected,
} = apiService;
