import React, { useState } from 'react';
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
  Grid,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import InsightMetric from './InsightMetric';

const InsightCard = ({ tool, data, onClose, onRefresh, loading }) => {
  const theme = useTheme();
  const IconComponent = tool.icon;
  const [openInsightDialog, setOpenInsightDialog] = useState(false);
  
  // Truncate AI insights to 2 lines
  const truncateInsight = (text, maxLines = 2) => {
    if (!text) return '';
    const formatted = formatTruncatedText(text);
    const words = String(formatted).split(' ');
    const wordsPerLine = 12; // Approximate words per line
    const maxWords = maxLines * wordsPerLine;
    return words.length > maxWords 
      ? words.slice(0, maxWords).join(' ') + '...' 
      : formatted;
  };

  // Check if text is truncated
  const isTextTruncated = (text, maxLines = 2) => {
    if (!text) return false;
    const formatted = formatTruncatedText(text);
    const words = String(formatted).split(' ');
    const wordsPerLine = 12;
    const maxWords = maxLines * wordsPerLine;
    return words.length > maxWords;
  };

  // Format AI text with proper styling
  const formatAIText = (text) => {
    if (!text) return null;
    
    // Split text into paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      // Check if it's a bullet point section
      if (paragraph.includes('*') || paragraph.includes('•') || paragraph.includes('-')) {
        const lines = paragraph.split('\n').filter(line => line.trim());
        const title = lines[0]?.replace(/^\*+\s*/, '').replace(/^#+\s*/, '');
        const bullets = lines.slice(1).filter(line => 
          line.trim().startsWith('*') || 
          line.trim().startsWith('•') || 
          line.trim().startsWith('-')
        );
        
        return (
          <Box key={index} sx={{ mb: 3 }}>
            {title && (
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 600, 
                mb: 1.5,
                color: 'primary.main'
              }}>
                {title.replace(/\*\*/g, '')}
              </Typography>
            )}
            {bullets.length > 0 && (
              <Box component="ul" sx={{ 
                pl: 2, 
                mb: 0,
                '& li': {
                  mb: 1,
                  lineHeight: 1.6
                }
              }}>
                {bullets.map((bullet, bulletIndex) => (
                  <Typography component="li" key={bulletIndex} variant="body2" sx={{ 
                    color: 'text.primary',
                    mb: 1
                  }}>
                    {bullet.replace(/^[\s\*\•\-]+/, '').trim()}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        );
      }
      
      // Handle numbered lists
      if (/^\d+\./.test(paragraph.trim())) {
        const lines = paragraph.split('\n').filter(line => line.trim());
        return (
          <Box key={index} sx={{ mb: 3 }}>
            <Box component="ol" sx={{ 
              pl: 2, 
              mb: 0,
              '& li': {
                mb: 2,
                lineHeight: 1.6
              }
            }}>
              {lines.map((line, lineIndex) => {
                const match = line.match(/^(\d+)\.\s*(.+)/);
                if (match) {
                  const [, number, content] = match;
                  return (
                    <Typography component="li" key={lineIndex} variant="body2" sx={{ 
                      color: 'text.primary',
                      mb: 1.5
                    }}>
                      <Typography component="span" sx={{ fontWeight: 600 }}>
                        {content.split(':')[0]}:
                      </Typography>
                      {content.includes(':') && (
                        <Typography component="span" sx={{ ml: 0.5 }}>
                          {content.split(':').slice(1).join(':').trim()}
                        </Typography>
                      )}
                    </Typography>
                  );
                }
                return null;
              }).filter(Boolean)}
            </Box>
          </Box>
        );
      }
      
      // Handle headers (lines with ** or ##)
      if (paragraph.includes('**') || paragraph.startsWith('#')) {
        const cleanText = paragraph.replace(/\*\*/g, '').replace(/^#+\s*/, '');
        return (
          <Typography key={index} variant="h6" sx={{ 
            fontWeight: 600, 
            mb: 2,
            mt: index > 0 ? 2 : 0,
            color: 'primary.main'
          }}>
            {cleanText}
          </Typography>
        );
      }
      
      // Regular paragraphs
      return (
        <Typography key={index} variant="body1" sx={{ 
          lineHeight: 1.7, 
          mb: 2,
          color: 'text.primary'
        }}>
          {paragraph.trim()}
        </Typography>
      );
    });
  };

  // Simple formatting for truncated text (inline display)
  const formatTruncatedText = (text) => {
    if (!text) return text;
    
    // Remove markdown formatting for truncated display
    return text
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/^#+\s*/, '') // Remove header markers
      .replace(/^\s*[\*\•\-]\s*/gm, '• ') // Convert bullets to simple bullets
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
  };

  // Get score color based on FHS value
  const getScoreColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 70) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    if (score >= 40) return '#FF5722';
    return theme.palette.error.main;
  };

  // Render FHS Progress Bar
  const renderFHSProgressBar = (score) => {
    const scoreColor = getScoreColor(score);
    
    return (
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Financial Health Score
          </Typography>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: scoreColor,
            textShadow: `0 2px 4px ${alpha(scoreColor, 0.3)}`
          }}>
            {score}/100
          </Typography>
        </Box>
        
        <Box sx={{ position: 'relative', mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={score}
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: alpha(scoreColor, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 6,
                background: `linear-gradient(90deg, ${scoreColor}, ${alpha(scoreColor, 0.8)})`,
                boxShadow: `0 2px 8px ${alpha(scoreColor, 0.4)}`,
              }
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: `${Math.min(score, 95)}%`,
              transform: 'translate(-50%, -50%)',
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: scoreColor,
              border: `3px solid white`,
              boxShadow: `0 2px 8px ${alpha(scoreColor, 0.5)}`,
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
          <Typography variant="caption" color="text.secondary">0</Typography>
          <Typography variant="caption" sx={{ color: scoreColor, fontWeight: 600 }}>
            {data?.category || 'Good'}
          </Typography>
          <Typography variant="caption" color="text.secondary">100</Typography>
        </Box>
      </Box>
    );
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

    if (!data) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary" variant="body1">
            No data available
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
            {/* Hero Score with Progress Bar */}
            {(data?.fhs_score || data?.score) && renderFHSProgressBar(data.fhs_score || data.score)}

            {/* Score Breakdown */}
            {data?.breakdown && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Score Breakdown
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(data.breakdown).map(([key, value], index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Card sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        backgroundColor: alpha(tool.color, 0.05),
                        border: `1px solid ${alpha(tool.color, 0.1)}`
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: tool.color, 
                          fontWeight: 600,
                          mb: 0.5
                        }}>
                          {typeof value === 'number' ? value.toFixed(1) : value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                          {key.replace(/_/g, ' ')}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Key Metrics */}
            {(data?.total_spending || data?.essential_ratio || data?.avg_transaction) && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Key Metrics
                </Typography>
                <Grid container spacing={2}>
                  {data?.total_spending && (
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 600 }}>
                          ₹{typeof data.total_spending === 'number' ? data.total_spending.toFixed(0) : data.total_spending}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Spending
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {data?.essential_ratio && (
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ color: 'success.main', fontWeight: 600 }}>
                          {typeof data.essential_ratio === 'number' ? data.essential_ratio.toFixed(1) : data.essential_ratio}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Essential Spending
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {data?.avg_transaction && (
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ color: 'secondary.main', fontWeight: 600 }}>
                          ₹{typeof data.avg_transaction === 'number' ? data.avg_transaction.toFixed(0) : data.avg_transaction}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Avg Transaction
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            {/* Health Indicators */}
            {data?.health_indicators && data.health_indicators.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Health Indicators
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {data.health_indicators.slice(0, 4).map((indicator, index) => (
                    <Box 
                      key={index}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: alpha(
                          indicator.status === 'good' ? theme.palette.success.main : 
                          indicator.status === 'warning' ? theme.palette.warning.main : 
                          theme.palette.error.main, 
                          0.1
                        ),
                        border: `1px solid ${alpha(
                          indicator.status === 'good' ? theme.palette.success.main : 
                          indicator.status === 'warning' ? theme.palette.warning.main : 
                          theme.palette.error.main, 
                          0.2
                        )}`
                      }}
                    >
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%',
                        backgroundColor: indicator.status === 'good' ? 'success.main' : 
                                       indicator.status === 'warning' ? 'warning.main' : 'error.main',
                        mr: 2
                      }} />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {indicator.message || indicator}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* AI Suggestions with Popup */}
            {(data?.suggestions || data?.insight_summary) && (
              <Box sx={{ 
                p: 3, 
                borderRadius: 3, 
                backgroundColor: alpha(tool.color, 0.08),
                border: `1px solid ${alpha(tool.color, 0.2)}`,
                position: 'relative',
                overflow: 'hidden',
                cursor: isTextTruncated(data?.suggestions || data?.insight_summary) ? 'pointer' : 'default'
              }}
              onClick={() => {
                if (isTextTruncated(data?.suggestions || data?.insight_summary)) {
                  setOpenInsightDialog(true);
                }
              }}
              >
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: 4,
                  background: `linear-gradient(90deg, ${tool.color}, ${alpha(tool.color, 0.6)})`
                }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: tool.color }}>
                    💡 AI Insights
                  </Typography>
                  {isTextTruncated(data?.suggestions || data?.insight_summary) && (
                    <IconButton 
                      size="small" 
                      sx={{ color: tool.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenInsightDialog(true);
                      }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                
                <Typography variant="body2" color="text.primary" sx={{ 
                  lineHeight: 1.6,
                  fontSize: '0.95rem'
                }}>
                  {truncateInsight(data?.suggestions || data?.insight_summary)}
                </Typography>
                
                {isTextTruncated(data?.suggestions || data?.insight_summary) && (
                  <Typography variant="caption" sx={{ 
                    color: tool.color, 
                    fontStyle: 'italic',
                    mt: 1,
                    display: 'block'
                  }}>
                    Click to view complete insight
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        );

      case 'recurring':
        return (
          <Box>
            {/* Hero Metrics */}
            {(data?.recurring_vendors?.length > 0 || data?.total_recurring_amount || data?.frequency_score) && (
              <Box sx={{ mb: 4 }}>
                <Grid container spacing={3}>
                  {data?.recurring_vendors?.length > 0 && (
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" sx={{ 
                          fontWeight: 700, 
                          color: tool.color,
                          mb: 1
                        }}>
                          {data.recurring_vendors.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Recurring Vendors
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {data?.total_recurring_amount && (
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" sx={{ 
                          fontWeight: 700, 
                          color: 'primary.main',
                          mb: 1
                        }}>
                          ₹{typeof data.total_recurring_amount === 'number' ? data.total_recurring_amount.toFixed(0) : data.total_recurring_amount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Recurring
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {data?.frequency_score && (
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" sx={{ 
                          fontWeight: 700, 
                          color: 'success.main',
                          mb: 1
                        }}>
                          {typeof data.frequency_score === 'number' ? data.frequency_score.toFixed(1) : data.frequency_score}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Consistency Score
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            {/* Top Recurring Vendors with Enhanced Visual */}
            {data?.recurring_vendors?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Top Recurring Vendors
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {data.recurring_vendors.slice(0, 5).map((vendor, index) => {
                    const maxAmount = Math.max(...data.recurring_vendors.map(v => v.avg_amount || 0));
                    const progressValue = ((vendor.avg_amount || 0) / maxAmount) * 100;
                    
                    return (
                      <Card key={index} sx={{ 
                        p: 2.5, 
                        backgroundColor: alpha(tool.color, 0.03),
                        border: `1px solid ${alpha(tool.color, 0.1)}`,
                        borderRadius: 2,
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {/* Progress Bar Background */}
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          width: `${progressValue}%`,
                          background: `linear-gradient(90deg, ${alpha(tool.color, 0.1)}, ${alpha(tool.color, 0.05)})`,
                          transition: 'width 0.3s ease'
                        }} />
                        
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          position: 'relative',
                          zIndex: 1
                        }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {vendor.vendor}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 3 }}>
                              <Typography variant="body2" color="text.secondary">
                                {vendor.purchase_count} purchases
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Avg: ₹{(vendor.avg_amount || 0).toFixed(0)}
                              </Typography>
                              {vendor.last_purchase && (
                                <Typography variant="body2" color="text.secondary">
                                  Last: {vendor.last_purchase}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h5" sx={{ 
                              color: tool.color, 
                              fontWeight: 700 
                            }}>
                              ₹{((vendor.avg_amount || 0) * (vendor.purchase_count || 0)).toFixed(0)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Total Spent
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Pattern Analysis */}
            {(data?.spending_frequency || data?.vendor_diversity || data?.predictability_score) && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Pattern Analysis
                </Typography>
                <Grid container spacing={2}>
                  {data?.spending_frequency && (
                    <Grid item xs={6} sm={4}>
                      <Card sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        backgroundColor: alpha('primary.main', 0.05),
                        border: `1px solid ${alpha('primary.main', 0.1)}`
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: 'primary.main', 
                          fontWeight: 600,
                          mb: 0.5
                        }}>
                          {typeof data.spending_frequency === 'number' ? data.spending_frequency.toFixed(1) : data.spending_frequency}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Days Between Purchases
                        </Typography>
                      </Card>
                    </Grid>
                  )}
                  {data?.vendor_diversity && (
                    <Grid item xs={6} sm={4}>
                      <Card sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        backgroundColor: alpha('secondary.main', 0.05),
                        border: `1px solid ${alpha('secondary.main', 0.1)}`
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: 'secondary.main', 
                          fontWeight: 600,
                          mb: 0.5
                        }}>
                          {typeof data.vendor_diversity === 'number' ? data.vendor_diversity.toFixed(1) : data.vendor_diversity}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Vendor Diversity
                        </Typography>
                      </Card>
                    </Grid>
                  )}
                  {data?.predictability_score && (
                    <Grid item xs={6} sm={4}>
                      <Card sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        backgroundColor: alpha('success.main', 0.05),
                        border: `1px solid ${alpha('success.main', 0.1)}`
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: 'success.main', 
                          fontWeight: 600,
                          mb: 0.5
                        }}>
                          {typeof data.predictability_score === 'number' ? data.predictability_score.toFixed(1) : data.predictability_score}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Predictability
                        </Typography>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            {/* Frequency Timeline */}
            {data?.purchase_timeline && data.purchase_timeline.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Purchase Frequency Timeline
                </Typography>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: alpha(tool.color, 0.05),
                  border: `1px solid ${alpha(tool.color, 0.1)}`
                }}>
                  {data.purchase_timeline.map((period, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      py: 1,
                      borderBottom: index < data.purchase_timeline.length - 1 ? `1px solid ${alpha(tool.color, 0.1)}` : 'none'
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {period.period}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                          width: 100,
                          height: 6,
                          backgroundColor: alpha(tool.color, 0.2),
                          borderRadius: 3,
                          overflow: 'hidden'
                        }}>
                          <Box sx={{
                            width: `${(period.purchases / Math.max(...data.purchase_timeline.map(p => p.purchases))) * 100}%`,
                            height: '100%',
                            backgroundColor: tool.color,
                            borderRadius: 3
                          }} />
                        </Box>
                        <Typography variant="body2" sx={{ color: tool.color, fontWeight: 600, minWidth: 40 }}>
                          {period.purchases}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* AI Insights with Popup */}
            {(data?.suggestions || data?.insight_summary) && (
              <Box sx={{ 
                p: 3, 
                borderRadius: 3, 
                backgroundColor: alpha(tool.color, 0.08),
                border: `1px solid ${alpha(tool.color, 0.2)}`,
                position: 'relative',
                overflow: 'hidden',
                cursor: isTextTruncated(data?.suggestions || data?.insight_summary) ? 'pointer' : 'default'
              }}
              onClick={() => {
                if (isTextTruncated(data?.suggestions || data?.insight_summary)) {
                  setOpenInsightDialog(true);
                }
              }}
              >
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: 4,
                  background: `linear-gradient(90deg, ${tool.color}, ${alpha(tool.color, 0.6)})`
                }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: tool.color }}>
                    🔄 Pattern Insights
                  </Typography>
                  {isTextTruncated(data?.suggestions || data?.insight_summary) && (
                    <IconButton 
                      size="small" 
                      sx={{ color: tool.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenInsightDialog(true);
                      }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                
                <Typography variant="body2" color="text.primary" sx={{ 
                  lineHeight: 1.6,
                  fontSize: '0.95rem'
                }}>
                  {truncateInsight(data?.suggestions || data?.insight_summary)}
                </Typography>
                
                {isTextTruncated(data?.suggestions || data?.insight_summary) && (
                  <Typography variant="caption" sx={{ 
                    color: tool.color, 
                    fontStyle: 'italic',
                    mt: 1,
                    display: 'block'
                  }}>
                    Click to view complete insight
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        );

      case 'need_want':
        return (
          <Box>
            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
              <InsightMetric 
                value={data?.essential_spending || 0} 
                label="Essential Spending" 
                color="success.main" 
              />
              <InsightMetric 
                value={data?.discretionary_spending || 0} 
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
          <Box>
            {/* Hero Savings Display */}
            {(data?.total_potential_savings || 0) > 0 && (
              <Box sx={{ 
                textAlign: 'center', 
                mb: 4,
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(tool.color, 0.1)}, ${alpha(tool.color, 0.05)})`,
                border: `2px solid ${alpha(tool.color, 0.2)}`
              }}>
                <Typography variant="h2" sx={{ 
                  fontWeight: 700, 
                  color: tool.color,
                  mb: 1,
                  fontSize: '3.5rem'
                }}>
                  ₹{(data.total_potential_savings || 0).toFixed(0)}
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Potential Monthly Savings
                </Typography>
                <Chip 
                  label="Consolidate Services" 
                  sx={{ 
                    mt: 1, 
                    backgroundColor: alpha(tool.color, 0.1),
                    color: tool.color,
                    fontWeight: 600
                  }} 
                />
              </Box>
            )}

            {/* Overlapping Services */}
            {data?.overlapping_services?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Overlapping Services ({data.overlapping_services.length})
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {data.overlapping_services.slice(0, 4).map((overlap, index) => (
                    <Card key={index} sx={{ 
                      p: 2.5, 
                      backgroundColor: alpha(tool.color, 0.03),
                      border: `1px solid ${alpha(tool.color, 0.1)}`,
                      borderRadius: 2
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, textTransform: 'capitalize' }}>
                            {overlap.category}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {overlap.services?.length || 0} services detected
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h5" sx={{ color: 'error.main', fontWeight: 700 }}>
                            ₹{(overlap.total_monthly_cost || 0).toFixed(0)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Monthly Cost
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Services List */}
                      {overlap.services && overlap.services.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Services:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {overlap.services.slice(0, 4).map((service, serviceIndex) => (
                              <Chip 
                                key={serviceIndex}
                                label={`${service.vendor || service.name || 'Unknown'} - ₹${(service.avg_amount || 0).toFixed(0)}`}
                                size="small"
                                sx={{ 
                                  backgroundColor: alpha(tool.color, 0.1),
                                  color: tool.color,
                                  fontSize: '0.75rem'
                                }}
                              />
                            ))}
                            {overlap.services.length > 4 && (
                              <Chip 
                                label={`+${overlap.services.length - 4} more`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            )}
                          </Box>
                        </Box>
                      )}
                      
                      {/* Savings Potential */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 1.5,
                        backgroundColor: alpha('success.main', 0.1),
                        borderRadius: 1,
                        border: `1px solid ${alpha('success.main', 0.2)}`
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          💰 Potential Savings
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 700 }}>
                          ₹{(overlap.potential_savings || 0).toFixed(0)}/month
                        </Typography>
                      </Box>
                      
                      {/* Recommendation */}
                      {overlap.recommendation && (
                        <Typography variant="body2" sx={{ 
                          mt: 1.5, 
                          p: 1, 
                          backgroundColor: alpha('info.main', 0.1),
                          borderRadius: 1,
                          fontStyle: 'italic',
                          color: 'info.main'
                        }}>
                          💡 {overlap.recommendation}
                        </Typography>
                      )}
                    </Card>
                  ))}
                </Box>
              </Box>
            )}

            {/* Subscription Analysis */}
            {data?.subscription_candidates?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Detected Subscriptions ({data.subscription_candidates.length})
                </Typography>
                <Grid container spacing={2}>
                  {data.subscription_candidates.slice(0, 3).map((subscription, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        backgroundColor: alpha('secondary.main', 0.05),
                        border: `1px solid ${alpha('secondary.main', 0.1)}`
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: 'secondary.main', 
                          fontWeight: 600,
                          mb: 0.5,
                          textTransform: 'capitalize'
                        }}>
                          {subscription.vendor}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                          ₹{(subscription.avg_amount || 0).toFixed(0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          {subscription.frequency} • {subscription.confidence} confidence
                        </Typography>
                        <Chip 
                          label={`${subscription.purchase_count} charges`}
                          size="small"
                          sx={{ backgroundColor: alpha('secondary.main', 0.1) }}
                        />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Summary Statistics */}
            {(data?.overlapping_services?.length > 0 || data?.subscription_candidates?.length > 0) && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Analysis Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 700 }}>
                        {data?.overlapping_services?.length || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Overlaps Found
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 700 }}>
                        {data?.subscription_candidates?.length || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Subscriptions
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 700 }}>
                        ₹{(data?.total_potential_savings || 0).toFixed(0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Monthly Savings
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
                        ₹{((data?.total_potential_savings || 0) * 12).toFixed(0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Annual Savings
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* AI Insights with Popup */}
            {(data?.suggestions || data?.insight_summary || data?.insights) && (
              <Box sx={{ 
                p: 3, 
                borderRadius: 3, 
                backgroundColor: alpha(tool.color, 0.08),
                border: `1px solid ${alpha(tool.color, 0.2)}`,
                position: 'relative',
                overflow: 'hidden',
                cursor: isTextTruncated(data?.suggestions || data?.insight_summary || (Array.isArray(data?.insights) ? data.insights.join(' ') : data?.insights)) ? 'pointer' : 'default'
              }}
              onClick={() => {
                const insightText = data?.suggestions || data?.insight_summary || (Array.isArray(data?.insights) ? data.insights.join(' ') : data?.insights);
                if (isTextTruncated(insightText)) {
                  setOpenInsightDialog(true);
                }
              }}
              >
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: 4,
                  background: `linear-gradient(90deg, ${tool.color}, ${alpha(tool.color, 0.6)})`
                }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: tool.color }}>
                    🔄 Overlap Insights
                  </Typography>
                  {isTextTruncated(data?.suggestions || data?.insight_summary || (Array.isArray(data?.insights) ? data.insights.join(' ') : data?.insights)) && (
                    <IconButton 
                      size="small" 
                      sx={{ color: tool.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenInsightDialog(true);
                      }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                
                <Typography variant="body2" color="text.primary" sx={{ 
                  lineHeight: 1.6,
                  fontSize: '0.95rem'
                }}>
                  {truncateInsight(data?.suggestions || data?.insight_summary || (Array.isArray(data?.insights) ? data.insights.join(' ') : data?.insights))}
                </Typography>
                
                {isTextTruncated(data?.suggestions || data?.insight_summary || (Array.isArray(data?.insights) ? data.insights.join(' ') : data?.insights)) && (
                  <Typography variant="caption" sx={{ 
                    color: tool.color, 
                    fontStyle: 'italic',
                    mt: 1,
                    display: 'block'
                  }}>
                    Click to view complete insight
                  </Typography>
                )}
              </Box>
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
    <>
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
      
      {/* Insight Details Dialog */}
      <Dialog
        open={openInsightDialog}
        onClose={() => setOpenInsightDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'white',
            border: `1px solid ${alpha(tool?.color || '#1976d2', 0.2)}`,
            boxShadow: `0 8px 32px ${alpha(tool?.color || '#1976d2', 0.15)}`
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          borderBottom: `1px solid ${alpha(tool?.color || '#1976d2', 0.1)}`,
          pb: 2
        }}>
          {IconComponent && <IconComponent sx={{ color: tool?.color || '#1976d2', fontSize: 28 }} />}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Complete AI Insights
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {tool?.name || 'Analysis'}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ py: 3 }}>
          {data?.insight_summary && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: tool?.color || '#1976d2' }}>
                📊 Insight Summary
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
                {data.insight_summary}
              </Typography>
            </Box>
          )}
          
          {/* Handle suggestions field */}
          {data?.suggestions && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: tool?.color || '#1976d2' }}>
                💡 AI Recommendations
              </Typography>
              <Box sx={{ 
                p: 2, 
                backgroundColor: alpha(tool?.color || '#1976d2', 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(tool?.color || '#1976d2', 0.1)}`
              }}>
                {Array.isArray(data.suggestions) 
                  ? formatAIText(data.suggestions.join('\n\n'))
                  : formatAIText(data.suggestions)
                }
              </Box>
            </Box>
          )}
          
          {/* Handle insights array (for overlap analysis) */}
          {data?.insights && Array.isArray(data.insights) && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: tool?.color || '#1976d2' }}>
                💡 Detailed Analysis & Recommendations
              </Typography>
              {data.insights.map((insight, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  {insight.includes('💳') || insight.includes('⚠️') || insight.includes('🛍️') || insight.includes('💰') ? (
                    <Typography variant="body2" sx={{ 
                      lineHeight: 1.6, 
                      p: 1.5, 
                      backgroundColor: alpha(tool?.color || '#1976d2', 0.1),
                      borderRadius: 1,
                      border: `1px solid ${alpha(tool?.color || '#1976d2', 0.2)}`,
                      fontWeight: 500
                    }}>
                      {insight}
                    </Typography>
                  ) : (
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: alpha(tool?.color || '#1976d2', 0.05),
                      borderRadius: 2,
                      border: `1px solid ${alpha(tool?.color || '#1976d2', 0.1)}`
                    }}>
                      {formatAIText(insight)}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setOpenInsightDialog(false)} 
            variant="contained"
            sx={{ 
              backgroundColor: tool?.color || '#1976d2',
              '&:hover': { backgroundColor: alpha(tool?.color || '#1976d2', 0.8) },
              borderRadius: 2,
              px: 3
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InsightCard;
