import React from 'react';
import {
  Box,
  Typography,
  Fade,
} from '@mui/material';
import { Psychology as AIIcon } from '@mui/icons-material';

const EmptyState = ({ onGetStarted }) => (
  <Fade in={true}>
    <Box sx={{ 
      textAlign: 'center', 
      py: 8, 
      px: 3,
      background: 'linear-gradient(145deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.3) 100%)',
      backdropFilter: 'blur(10px)',
      borderRadius: 4,
      border: '1px solid rgba(255,255,255,0.2)',
    }}>
      <AIIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 3, opacity: 0.7 }} />
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 300 }}>
        Discover Financial Insights
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
        Select an insight tool above to get personalized analysis of your spending patterns and financial health.
      </Typography>
    </Box>
  </Fade>
);

export default EmptyState;
