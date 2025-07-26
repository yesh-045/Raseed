import React from 'react';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  CircularProgress,
  IconButton,
  Slide,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import InsightMetric from './InsightMetric';

const InsightCard = ({ tool, data, onClose, onRefresh, loading }) => {
  const theme = useTheme();
  const IconComponent = tool.icon;
  
  // Truncate AI insights to 2 lines
  const truncateInsight = (text, maxLines = 2) => {
    if (!text) return '';
    const words = text.split(' ');
    const wordsPerLine = 12; // Approximate words per line
    const maxWords = maxLines * wordsPerLine;
    return words.length > maxWords 
      ? words.slice(0, maxWords).join(' ') + '...' 
      : text;
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress size={32} sx={{ color: tool.color }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Analyzing your financial data...
          </Typography>
        </Box>
      );
    }

    if (data?.error) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="error" variant="body1">
            {data.message}
          </Typography>
        </Box>
      );
    }

    switch (tool.id) {
      case 'fhs':
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 200, 
                  mr: 2,
                  background: `linear-gradient(45deg, ${tool.color}, ${alpha(tool.color, 0.7)})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {data.fhs_score || data.score}
              </Typography>
              <Box>
                <Chip 
                  label={data.category || 'Fair'} 
                  color={(data.fhs_score || data.score) >= 80 ? 'success' : (data.fhs_score || data.score) >= 60 ? 'warning' : 'error'}
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                  Financial Health Score
                </Typography>
              </Box>
            </Box>
            
            {data.suggestions && (
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                backgroundColor: alpha(tool.color, 0.05),
                border: `1px solid ${alpha(tool.color, 0.2)}`
              }}>
                <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.5 }}>
                  {truncateInsight(data.suggestions)}
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 'recurring':
        return (
          <Box>
            {data.recurring_vendors?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                  Top Recurring Vendors
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {data.recurring_vendors.slice(0, 3).map((vendor, index) => (
                    <Box 
                      key={index}
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: 1,
                        backgroundColor: alpha(tool.color, 0.05)
                      }}
                    >
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {vendor.vendor}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vendor.purchase_count} purchases
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ color: tool.color }}>
                        ${vendor.avg_amount}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        );

      case 'need_want':
        return (
          <Box>
            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
              <InsightMetric 
                value={data.essential_spending || 0} 
                label="Essential Spending" 
                color="success.main" 
              />
              <InsightMetric 
                value={data.discretionary_spending || 0} 
                label="Discretionary" 
                color="warning.main" 
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Spending Balance
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={data.breakdown?.essential || 50} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette.warning.main, 0.2),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: theme.palette.success.main
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {data.breakdown?.essential || 50}% Essential • {data.breakdown?.discretionary || 50}% Discretionary
              </Typography>
            </Box>
          </Box>
        );

      case 'overlap':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <InsightMetric 
              value={data.total_potential_savings || 0} 
              label="Potential Monthly Savings" 
              color={tool.color} 
            />
            {data.overlapping_services?.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Found {data.overlapping_services.length} overlapping services
              </Typography>
            )}
          </Box>
        );

      case 'pantry':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <InsightMetric 
              value={data.estimated_monthly_waste || 0} 
              label="Estimated Monthly Food Waste" 
              color={tool.color} 
            />
            {data.waste_risk_items?.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                {data.waste_risk_items.length} items at risk
              </Typography>
            )}
          </Box>
        );

      case 'micro_moment':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <InsightMetric 
              value={data.total_impulse_spending || 0} 
              label="Impulse Spending This Month" 
              color={tool.color} 
            />
            {data.impulse_indicators?.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                {data.impulse_indicators.length} impulse purchases detected
              </Typography>
            )}
          </Box>
        );

      default:
        return (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Insight data not available
          </Typography>
        );
    }
  };

  return (
    <Slide direction="down" in={true} mountOnEnter unmountOnExit>
      <Box
        sx={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          p: 3,
          mb: 3,
          boxShadow: `0 8px 32px ${alpha(tool.color, 0.15)}`,
          border: `1px solid ${alpha(tool.color, 0.2)}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${tool.color}, ${alpha(tool.color, 0.7)})`,
          }
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconComponent sx={{ color: tool.color, mr: 2, fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                {tool.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {tool.description}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={onRefresh}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { 
                  backgroundColor: alpha(tool.color, 0.1),
                  color: tool.color 
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  color: 'error.main' 
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        {renderContent()}
      </Box>
    </Slide>
  );
};

export default InsightCard;
