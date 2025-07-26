import React from 'react';
import {
  Box,
  Typography,
  Fade,
} from '@mui/material';

const PeriodSummary = ({ data, timeRange }) => {
  if (!data) return null;

  return (
    <Fade in={true}>
      <Box sx={{ 
        textAlign: 'center',
        py: 3,
        mb: 3,
        background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.9) 0%, rgba(21, 101, 192, 0.9) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: 4,
        color: 'white',
        boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
      }}>
        <Typography variant="h4" sx={{ fontWeight: 200, mb: 1 }}>
          ${data.total.toFixed(2)}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {timeRange === 'week' ? 'This Week' : 'This Month'} • {data.change} from last {timeRange}
        </Typography>
      </Box>
    </Fade>
  );
};

export default PeriodSummary;
