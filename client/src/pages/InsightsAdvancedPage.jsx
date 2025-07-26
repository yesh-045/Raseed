import React, { useState, useEffect } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { getIdToken } from 'firebase/auth';
import { Close as CloseIcon } from '@mui/icons-material';
import { AppHeader, PageContainer, BottomNavigation } from '../components';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import {
  ToolSelector,
  InsightCard,
  EmptyState,
  insightTools,
} from '../components/insights';

const InsightsAdvancedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get data from navigation state or use defaults
  const { timeRange = 'month', data } = location.state || {};
  
  // Simplified state management - only one active insight at a time
  const [activeInsight, setActiveInsight] = useState(null);
  const [insightData, setInsightData] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingTool, setLoadingTool] = useState(null); // Track which tool is loading
  // Set user ID and auth token in API service when user changes
  useEffect(() => {
    if (user?.uid) {
      apiService.setUserId(user.uid);
      
      // Get and set auth token
      const getTokenAndSet = async () => {
        try {
          const token = await getIdToken(user);
          apiService.setAuthToken(token);
        } catch (error) {
          console.error('Error getting auth token:', error);
        }
      };
      
      getTokenAndSet();
    }
  }, [user]);

  // Fetch insight data from backend using API service
  const fetchInsightData = async (tool) => {
    setLoading(true);
    setLoadingTool(tool.id);
    setActiveInsight(tool.id); // Set active insight immediately
    try {
      const data = await apiService.getInsight(tool.id, null, timeRange);
      setInsightData(prev => ({
        ...prev,
        [tool.id]: data
      }));
    } catch (error) {
      console.error(`Error fetching ${tool.name}:`, error);
      setInsightData(prev => ({
        ...prev,
        [tool.id]: {
          error: true,
          message: `Failed to load ${tool.name}`,
          details: error.message
        }
      }));
    } finally {
      setLoading(false);
      setLoadingTool(null);
    }
  };

  // Handle tool selection - replace current insight
  const handleToolSelect = (tool) => {
    if (activeInsight === tool.id) {
      // Deselect if same tool is clicked
      setActiveInsight(null);
    } else {
      // Clear previous insight first, then select new tool and fetch data
      setActiveInsight(null);
      fetchInsightData(tool);
    }
  };

  // Close active insight
  const handleCloseInsight = () => {
    setActiveInsight(null);
  };

  // Refresh current insight
  const handleRefreshInsight = () => {
    const tool = insightTools.find(t => t.id === activeInsight);
    if (tool) {
      fetchInsightData(tool);
    }
  };

  const activeTool = insightTools.find(t => t.id === activeInsight);
  const activeData = activeInsight ? insightData[activeInsight] : null;

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      pb: 8 
    }}>
      <PageContainer maxWidth="md">
        <AppHeader 
          title="Financial Insights" 
          showBackButton={true}
          onBackClick={() => navigate('/insights')}
          sx={{ 
            backgroundColor: 'transparent',
            backdropFilter: 'blur(10px)',
          }}
        />

        <Box sx={{ py: 2 }}>
          {/* Active Insight Card */}
          {activeInsight && activeTool && (
            <InsightCard
              tool={activeTool}
              data={activeData}
              loading={loading}
              onClose={handleCloseInsight}
              onRefresh={handleRefreshInsight}
            />
          )}

          {/* Empty State */}
          {!activeInsight && (
            <EmptyState onGetStarted={() => {}} />
          )}

          {/* Tool Selector */}
          <ToolSelector
            tools={insightTools}
            onSelect={handleToolSelect}
            activeToolId={activeInsight}
            loadingTool={loadingTool}
          />
        </Box>
      </PageContainer>

      <BottomNavigation />
    </Box>
  );
};

export default InsightsAdvancedPage;
