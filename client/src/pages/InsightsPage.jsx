import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  Button,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Restaurant as RestaurantIcon,
  LocalGasStation as GasIcon,
  ShoppingCart as ShoppingIcon,
  Coffee as CoffeeIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AppHeader, PageContainer, BottomNavigation } from '../components';

const InsightsPage = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('month');

  // Structured mock data - easily replaceable with API
  const spendingData = {
    week: {
      total: 234.56,
      change: '+12%',
      trend: 'up',
      categories: [
        { name: 'Food & Dining', amount: 127.43, percent: 54, icon: RestaurantIcon, color: '#1976d2' },
        { name: 'Gas & Transport', amount: 67.20, percent: 29, icon: GasIcon, color: '#388e3c' },
        { name: 'Shopping', amount: 39.93, percent: 17, icon: ShoppingIcon, color: '#f57c00' },
      ]
    },
    month: {
      total: 1247.89,
      change: '-3%',
      trend: 'down',
      categories: [
        { name: 'Food & Dining', amount: 423.67, percent: 34, icon: RestaurantIcon, color: '#1976d2' },
        { name: 'Shopping', amount: 312.45, percent: 25, icon: ShoppingIcon, color: '#f57c00' },
        { name: 'Gas & Transport', amount: 278.90, percent: 22, icon: GasIcon, color: '#388e3c' },
        { name: 'Coffee', amount: 156.30, percent: 13, icon: CoffeeIcon, color: '#d32f2f' },
      ]
    }
  };

  const currentData = spendingData[timeRange];

  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };

  const handleAdvancedInsights = () => {
    // Create serializable data without React components
    const serializableData = {
      total: currentData.total,
      change: currentData.change,
      trend: currentData.trend,
      categories: currentData.categories.map(cat => ({
        name: cat.name,
        amount: cat.amount,
        percent: cat.percent,
        color: cat.color
        // Remove icon component - not serializable
      }))
    };
    
    // Navigate to advanced insights page
    navigate('/insights/advanced', { 
      state: { 
        timeRange, 
        data: serializableData 
      } 
    });
  };

  return (
    <Box sx={{ pb: 8 }}>
      <PageContainer>
        <AppHeader 
          title="Spending Insights" 
          showBackButton={true}
          onBackClick={() => navigate('/dashboard')}
        />

        <Box sx={{ py: 3 }}>
          {/* Time Range Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={handleTimeRangeChange}
              size="small"
              sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
            >
              <ToggleButton value="week" sx={{ px: 3 }}>
                This Week
              </ToggleButton>
              <ToggleButton value="month" sx={{ px: 3 }}>
                This Month
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Key Metrics Hero Card */}
          <Card 
            elevation={0}
            sx={{ 
              mb: 3,
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 300, mb: 1 }}>
                ${currentData.total.toFixed(2)}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {currentData.trend === 'up' ? (
                  <TrendingUpIcon sx={{ fontSize: 20 }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 20 }} />
                )}
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {currentData.change} from last {timeRange}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Categories
              </Typography>
              
              <List disablePadding>
                {currentData.categories.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <ListItem key={index} sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 48 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: category.color,
                            width: 36, 
                            height: 36 
                          }}
                        >
                          <IconComponent sx={{ fontSize: 18 }} />
                        </Avatar>
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {category.name}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              ${category.amount.toFixed(2)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <LinearProgress
                              variant="determinate"
                              value={category.percent}
                              sx={{
                                height: 4,
                                borderRadius: 2,
                                bgcolor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: category.color,
                                  borderRadius: 2,
                                }
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              {category.percent}% of total
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Card elevation={0} sx={{ borderRadius: 2, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {currentData.categories.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Categories
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6}>
              <Card elevation={0} sx={{ borderRadius: 2, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                    ${(currentData.total / (timeRange === 'week' ? 7 : 30)).toFixed(0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Daily Average
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Advanced Insights Button */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<AnalyticsIcon />}
            onClick={handleAdvancedInsights}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            Advanced Insights
          </Button>
        </Box>
      </PageContainer>

      <BottomNavigation />
    </Box>
  );
};

export default InsightsPage;
