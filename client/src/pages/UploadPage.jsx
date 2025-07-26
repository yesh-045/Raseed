import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  Stack,
  IconButton,
  Fab,
} from '@mui/material';
import {
  CameraAlt as CameraAltIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Components
import { PageContainer, UploadDropZone, FileUploadItem } from '../components';

// Services
import { uploadImage, sendForProcessing, isUserAuthenticated } from '../services/raseed-image-handler';

const UploadPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const supportedFormats = ['PDF', 'JPG', 'PNG', 'HEIC'];

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // Show sign-in prompt if user is not authenticated
  if (!user) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3
      }}>
        <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
          Sign in to upload receipts
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          You need to be signed in to upload and process receipts securely.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/welcome')}
          sx={{ borderRadius: '12px', px: 4 }}
        >
          Go to Sign In
        </Button>
      </Box>
    );
  }

  // Auto-process after upload (Files by Google style - no submit button)
  const handleFilesAdded = useCallback(async (newFiles) => {
    // Check authentication first
    if (!isUserAuthenticated()) {
      setSnackbar({
        open: true,
        message: 'Please sign in to upload receipts',
        severity: 'error'
      });
      return;
    }

    const processedFiles = newFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      status: 'uploading',
      progress: 0,
      name: file.name,
      size: file.size,
      firebaseId: null,
      downloadURL: null,
    }));
    
    setFiles(prev => [...prev, ...processedFiles]);
    setProcessing(true);
    
    // Auto-start Firebase upload and AI processing immediately
    await startProcessing(processedFiles);
  }, [user]);

  const startProcessing = async (filesToProcess) => {
    try {
      // Process each file: Upload to Firebase + Send for AI processing
      for (let i = 0; i < filesToProcess.length; i++) {
        const fileItem = filesToProcess[i];
        
        try {
          // Update status to uploading
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, status: 'uploading', progress: 10 } : f
          ));

          // Upload to Firebase Storage
          const uploadResult = await uploadImage(fileItem.file, {
            userId: user?.uid,
            uploadedBy: user?.email,
            uploadSource: 'web-app',
            category: 'receipt'
          });

          // Update with Firebase data
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { 
              ...f, 
              firebaseId: uploadResult.id,
              downloadURL: uploadResult.downloadURL,
              status: 'uploaded',
              progress: 30 
            } : f
          ));

          // Send for AI processing (don't wait for completion)
          sendForProcessing(uploadResult.id, user?.uid).catch(error => {
            console.warn('Background processing failed:', error);
          });

          // Mark as processing started
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { 
              ...f, 
              status: 'processing',
              progress: 50,
              uploadResult 
            } : f
          ));

          // Show success message for upload
          const uploadMethod = uploadResult.uploadMethod || 'firebase-storage';
          const methodText = uploadMethod === 'fallback' ? ' (using fallback method)' : '';
          
          setSnackbar({
            open: true,
            message: `${fileItem.name} uploaded successfully${methodText}! Processing started...`,
            severity: 'success'
          });

        } catch (error) {
          console.error(`Failed to upload ${fileItem.name}:`, error);
          
          // Mark as failed
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { 
              ...f, 
              status: 'failed', 
              progress: 0,
              error: error.message 
            } : f
          ));

          // Show error message
          setSnackbar({
            open: true,
            message: `Failed to upload ${fileItem.name}: ${error.message}`,
            severity: 'error'
          });
        }
      }

      setProcessing(false);
      
      // Navigate to processing page with uploaded files data
      const uploadedFiles = filesToProcess.filter(f => f.status !== 'failed');
      if (uploadedFiles.length > 0) {
        // Small delay to let user see the success message
        setTimeout(() => {
          navigate('/processing', { 
            state: { 
              files: uploadedFiles.map(f => ({
                id: f.firebaseId || f.id,
                name: f.name || f.file?.name,
                size: f.size || f.file?.size,
                type: f.type || f.file?.type,
                downloadURL: f.downloadURL,
                status: 'processing',
                uploadedAt: new Date().toISOString()
              }))
            } 
          });
        }, 1500);
      }
      
    } catch (error) {
      console.error('Processing failed:', error);
      setProcessing(false);
      setSnackbar({
        open: true,
        message: `Processing failed: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleCameraCapture = () => {
    // Check authentication first
    if (!isUserAuthenticated()) {
      setSnackbar({
        open: true,
        message: 'Please sign in to upload receipts',
        severity: 'error'
      });
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFilesAdded(Array.from(e.target.files));
      }
    };
    input.click();
  };

  const removeFile = (fileId) => {
    // Only allow removal if not processing
    if (!processing) {
      const fileToRemove = files.find(f => f.id === fileId);
      
      // If file was uploaded to Firebase, optionally delete it
      if (fileToRemove?.firebaseId && fileToRemove.status !== 'failed') {
        // Note: In production, you might want to delete from Firebase too
        console.log(`File ${fileToRemove.name} removed from UI. Firebase ID: ${fileToRemove.firebaseId}`);
      }
      
      setFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  const handleReviewResults = () => {
    const completedFiles = files.filter(f => f.status === 'completed');
    const firebaseIds = completedFiles.map(f => f.firebaseId).filter(Boolean);
    
    navigate('/processing', { 
      state: { 
        processedFiles: completedFiles.length,
        firebaseIds: firebaseIds,
        uploadedReceipts: completedFiles
      } 
    });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      pb: 10 
    }}>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: 100,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 2,
            gap: 2,
          }}
        >
          <IconButton
            onClick={() => navigate('/dashboard')}
            size="small"
            sx={{ color: 'text.primary' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 500, flex: 1 }}>
            Upload receipts
          </Typography>
        </Box>
      </Box>

      <PageContainer>
        {/* Empty State or Upload Zone */}
        {files.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            px: 3,
          }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <AddIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            </Box>
            
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
              No receipts yet
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 4, maxWidth: 280 }}
            >
              Upload receipts to extract and save details securely
            </Typography>

            <UploadDropZone
              onFilesSelected={handleFilesAdded}
              supportedFormats={supportedFormats}
              disabled={processing}
            />
          </Box>
        ) : (
          <Box sx={{ pt: 2 }}>
            {/* Processing Header */}
            <Box sx={{ mb: 3, px: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                {processing ? 'Uploading & processing receipts...' : 'Processing complete'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {files.length} receipt{files.length !== 1 ? 's' : ''} {processing ? 'being uploaded and processed' : 'ready for review'}
              </Typography>
              {processing && (
                <Typography variant="body2" color="primary.main" sx={{ mt: 1 }}>
                  Files are being uploaded to secure storage and sent for AI analysis
                </Typography>
              )}
            </Box>

            {/* File List */}
            <Stack spacing={1}>
              {files.map((fileItem) => (
                <FileUploadItem
                  key={fileItem.id}
                  file={fileItem}
                  onRemove={removeFile}
                  showProgress={true}
                  disabled={processing}
                />
              ))}
            </Stack>

            {/* Review Button - Show when processing is complete */}
            {!processing && files.some(f => f.status === 'completed') && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleReviewResults}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Review & confirm data
                </Button>
              </Box>
            )}
          </Box>
        )}
      </PageContainer>

      {/* Floating Camera Button */}
      <Fab
        color="primary"
        onClick={handleCameraCapture}
        disabled={processing}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <CameraAltIcon />
      </Fab>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: '12px',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadPage;
