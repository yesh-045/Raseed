import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  alpha,
} from '@mui/material';

const ToolSelector = ({ tools, onSelect, activeToolId, loadingTool }) => {
  return (
    <Box sx={{ 
      position: 'fixed',
      bottom: 80, // Above bottom navigation
      left: 16,
      right: 16,
      background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
      backdropFilter: 'blur(20px)',
      borderRadius: 3,
      p: 2,
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      border: '1px solid rgba(255,255,255,0.3)',
      zIndex: 1000,
      maxWidth: 'calc(100vw - 32px)',
      mx: 'auto',
    }}>
      <Typography 
        variant="subtitle1" 
        sx={{ 
          mb: 2, 
          fontWeight: 500,
          color: 'text.primary',
          textAlign: 'center',
          fontSize: '0.95rem'
        }}
      >
        {activeToolId ? 'Switch Insight' : 'Choose an Insight'}
      </Typography>
      
      {/* Vertical Tool Grid */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 1.5,
        maxHeight: '200px',
        overflowY: 'auto',
        '&::-webkit-scrollbar': { 
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0,0,0,0.1)',
          borderRadius: '2px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '2px',
        },
      }}>
        {tools.map((tool) => {
          const IconComponent = tool.icon;
          const isActive = activeToolId === tool.id;
          const isLoading = loadingTool === tool.id;
          
          return (
            <Box
              key={tool.id}
              onClick={() => onSelect(tool)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 1.5,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: isActive ? alpha(tool.color, 0.15) : 'transparent',
                border: `1px solid ${isActive ? tool.color : 'transparent'}`,
                '&:hover': {
                  backgroundColor: alpha(tool.color, 0.1),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha(tool.color, 0.2)}`,
                },
              }}
            >
              <Box sx={{ mb: 1 }}>
                {isLoading ? (
                  <CircularProgress size={20} sx={{ color: tool.color }} />
                ) : (
                  <IconComponent sx={{ color: tool.color, fontSize: 24 }} />
                )}
              </Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? tool.color : 'text.primary',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  lineHeight: 1.2,
                }}
              >
                {tool.name}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ToolSelector;
