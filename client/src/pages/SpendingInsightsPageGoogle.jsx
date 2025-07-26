import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Restaurant as RestaurantIcon,
  LocalGasStation as GasIcon,
  ShoppingCart as ShoppingIcon,
  Coffee as CoffeeIcon,
  Movie as EntertainmentIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AppHeader, PageContainer, BottomNavigation } from '../components';

const SpendingInsightsPageGoogle = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('month');

  // Mock spending data
  const spendingData = {
    week: {
      total: 234.56,
      change: '+12%',
      trend: 'up',
      categories: [
        { name: 'Food & Dining', amount: 127.43, percent: 54, icon: RestaurantIcon, color: '#1A73E8' },
        { name: 'Gas & Transport', amount: 67.20, percent: 29, icon: GasIcon, color: '#26A69A' },
        { name: 'Shopping', amount: 39.93, percent: 17, icon: ShoppingIcon, color: '#F9AB00' },
      ],
      topMerchants: [
        { name: 'Starbucks', amount: 34.50, visits: 5 },
        { name: 'Shell', amount: 67.20, visits: 2 },
        { name: 'Target', amount: 28.99, visits: 1 },
      ]
    },
    month: {
      total: 1247.89,
      change: '-3%',
      trend: 'down',
      categories: [
        { name: 'Food & Dining', amount: 423.67, percent: 34, icon: RestaurantIcon, color: '#1A73E8' },
        { name: 'Shopping', amount: 312.45, percent: 25, icon: ShoppingIcon, color: '#F9AB00' },
        { name: 'Gas & Transport', amount: 278.90, percent: 22, icon: GasIcon, color: '#26A69A' },
        { name: 'Coffee', amount: 156.30, percent: 13, icon: CoffeeIcon, color: '#EA4335' },
        { name: 'Entertainment', amount: 76.57, percent: 6, icon: EntertainmentIcon, color: '#9C27B0' },
      ],
      topMerchants: [
        { name: 'Whole Foods', amount: 234.67, visits: 8 },
        { name: 'Starbucks', amount: 156.30, visits: 18 },
        { name: 'Shell', amount: 145.20, visits: 6 },
        { name: 'Amazon', amount: 123.45, visits: 3 },
        { name: 'Target', amount: 89.67, visits: 4 },
      ]
    }
  };

  const currentData = spendingData[timeRange];

  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
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
          {/* Time Range Selector */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={handleTimeRangeChange}
              size="small"
              sx={{ bgcolor: 'background.paper', borderRadius: 3 }}
            >
              <ToggleButton value="week" sx={{ px: 3, borderRadius: 3 }}>
                This Week
              </ToggleButton>
              <ToggleButton value="month" sx={{ px: 3, borderRadius: 3 }}>
                This Month
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Total Spending Hero Card */}
          <Card 
            elevation={2}
            sx={{ 
              mb: 3,
              background: 'linear-gradient(135deg, #1A73E8 0%, #1557B0 100%)',
              color: 'white',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ mr: 2, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Total Spending
                </Typography>
              </Box>
              
              <Typography variant="h3" sx={{ fontWeight: 300, mb: 1 }}>
                ${currentData.total.toFixed(2)}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {currentData.trend === 'up' ? (
                  <TrendingUpIcon sx={{ color: '#FFF9C4' }} />
                ) : (
                  <TrendingDownIcon sx={{ color: '#FFCDD2' }} />
                )}
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {currentData.change} from last {timeRange}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Categories Breakdown */}
          <Card elevation={1} sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Spending by Category
              </Typography>
              
              <List>
                {currentData.categories.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <ListItem key={index} sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            bgcolor: category.color,
                            width: 40, 
                            height: 40 
                          }}
                        >
                          <IconComponent sx={{ fontSize: 20 }} />
                        </Avatar>
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
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
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: category.color,
                                  borderRadius: 3,
                                }
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                              {category.percent}% of total spending
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

          {/* Top Merchants */}
          <Card elevation={1} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Top Merchants
              </Typography>
              
              <List>
                {currentData.topMerchants.map((merchant, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 1 }}>
                    <ListItemIcon>
                      <Chip
                        label={index + 1}
                        size="small"
                        sx={{
                          bgcolor: index === 0 ? '#1A73E8' : 'grey.300',
                          color: index === 0 ? 'white' : 'text.primary',
                          fontWeight: 600,
                          minWidth: 28,
                        }}
                      />
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {merchant.name}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            ${merchant.amount.toFixed(2)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {merchant.visits} {merchant.visits === 1 ? 'visit' : 'visits'}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Quick Stats Grid */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Card elevation={1} sx={{ borderRadius: 2, textAlign: 'center' }}>
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
              <Card elevation={1} sx={{ borderRadius: 2, textAlign: 'center' }}>
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
        </Box>
      </PageContainer>

      <BottomNavigation />
    </Box>
  );
};

export default SpendingInsightsPageGoogle;
