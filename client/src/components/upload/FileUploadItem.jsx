import React from 'react';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

const FileUploadItem = ({ 
  file, 
  status = 'pending', // 'pending', 'processing', 'completed', 'error'
  progress = 0, 
  onRemove, 
  onView,
  extractedData = null,
  error = null 
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'processing':
        return <ScheduleIcon color="primary" />;
      default:
        return <ScheduleIcon color="disabled" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'error':
        return 'error';
      case 'processing':
        return 'primary';
      default:
        return 'default';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* File preview/icon */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1,
              bgcolor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {file.type?.startsWith('image/') ? (
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Typography variant="caption" color="text.secondary">
                PDF
              </Typography>
            )}
          </Box>

          {/* File details */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flexGrow: 1,
                }}
              >
                {file.name}
              </Typography>
              {getStatusIcon()}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(file.size)}
              </Typography>
              <Chip
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                size="small"
                color={getStatusColor()}
                variant="outlined"
              />
            </Box>

            {/* Progress bar for processing */}
            {status === 'processing' && (
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ mt: 1, height: 4, borderRadius: 2 }}
              />
            )}

            {/* Error message */}
            {status === 'error' && error && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                {error}
              </Typography>
            )}

            {/* Extracted data preview */}
            {status === 'completed' && extractedData && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Merchant: {extractedData.merchant || 'Unknown'} • 
                  Amount: ${extractedData.total || '0.00'}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {status === 'completed' && (
              <IconButton size="small" onClick={() => onView?.(file)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton size="small" onClick={() => onRemove?.(file)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FileUploadItem;
