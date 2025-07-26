import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  Chip,
  CircularProgress,
  Fab,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  KeyboardVoice as VoiceIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AppHeader, PageContainer, BottomNavigation } from '../components';

const AgentQueryPageGoogle = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hi! I\'m your AI receipt assistant. Ask me about your spending patterns, search for specific receipts, or get insights about your expenses.',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Quick action suggestions
  const quickActions = [
    'Show my spending this week',
    'Find Starbucks receipts',
    'What did I spend on groceries?',
    'Top 5 merchants this month',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: generateBotResponse(inputValue),
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateBotResponse = (query) => {
    const responses = {
      'spending': 'Based on your receipts, you\'ve spent $234.56 this week across 12 transactions. Your top category is Food & Dining at $127.43.',
      'starbucks': 'I found 8 Starbucks receipts in the last month, totaling $67.20. Your average visit is $8.40.',
      'groceries': 'Your grocery spending this month is $178.90 across 6 trips. The average per trip is $29.82.',
      'merchants': 'Your top 5 merchants this month:\n1. Starbucks - $67.20\n2. Whole Foods - $156.30\n3. Shell Gas - $89.40\n4. Target - $78.50\n5. Amazon - $234.10',
    };

    const lowerQuery = query.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerQuery.includes(key)) {
        return response;
      }
    }

    return 'I can help you analyze your spending patterns, search for specific receipts, or provide insights about your expenses. Try asking about a specific merchant or time period!';
  };

  const handleQuickAction = (action) => {
    setInputValue(action);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', pb: 8 }}>
      <PageContainer sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AppHeader 
          title="AI Assistant" 
          showBackButton={true}
          onBackClick={() => navigate('/dashboard')}
        />

        {/* Messages Container */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          py: 2,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Quick Actions - Show only if first message */}
          {messages.length === 1 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Try asking:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {quickActions.map((action, index) => (
                  <Chip
                    key={index}
                    label={action}
                    variant="outlined"
                    onClick={() => handleQuickAction(action)}
                    sx={{ 
                      fontSize: '0.875rem',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Messages List */}
          <List sx={{ flex: 1 }}>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  px: 0,
                  py: 1,
                }}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  maxWidth: '80%',
                  flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main',
                      mt: 0.5,
                    }}
                  >
                    {message.type === 'user' ? <PersonIcon /> : <BotIcon />}
                  </Avatar>
                  
                  <Box>
                    <Card
                      elevation={1}
                      sx={{
                        bgcolor: message.type === 'user' ? 'primary.main' : 'background.paper',
                        color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 3,
                        ...(message.type === 'user' && {
                          borderBottomRightRadius: 8,
                        }),
                        ...(message.type === 'bot' && {
                          borderBottomLeftRadius: 8,
                        }),
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: 'pre-line',
                            lineHeight: 1.4,
                          }}
                        >
                          {message.content}
                        </Typography>
                      </CardContent>
                    </Card>
                    
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        textAlign: message.type === 'user' ? 'right' : 'left',
                      }}
                    >
                      {formatTime(message.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <ListItem sx={{ px: 0, py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    <BotIcon />
                  </Avatar>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                      Thinking...
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            )}
          </List>

          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          position: 'sticky',
          bottom: 0,
        }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me about your receipts..."
              variant="outlined"
              size="small"
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                }
              }}
            />
            
            <Fab
              color="primary"
              size="small"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              sx={{ minWidth: 40, width: 40, height: 40 }}
            >
              <SendIcon />
            </Fab>
            
            <Fab
              color="secondary"
              size="small"
              sx={{ minWidth: 40, width: 40, height: 40 }}
            >
              <VoiceIcon />
            </Fab>
          </Box>
        </Box>
      </PageContainer>

      <BottomNavigation />
    </Box>
  );
};

export default AgentQueryPageGoogle;
