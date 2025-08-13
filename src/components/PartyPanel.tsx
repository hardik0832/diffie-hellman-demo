import React, { useState } from 'react';
import { Paper, Stepper, Step, StepLabel, Typography, Box, Tooltip, TextField, Button, Fade, IconButton, Grow } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { computePublicKey, generatePrivateKey } from '../utils/diffieHellman';

const steps = [
  'Set Private Key',
  'Compute Public Key',
  'Enter Other\'s Public Key',
  'Compute Shared Secret',
];

export interface PartyPanelProps {
  name: string;
  p: number;
  g: number;
  privateKey: number;
  setPrivateKey: (value: number) => void;
  publicKey: number;
  setPublicKey: (value: number) => void;
  otherPublicKey: number;
  setOtherPublicKey: (value: number) => void;
  sharedSecret: number | null;
  computeSharedSecret: () => void;
  paramsValid: boolean;
}

export default function PartyPanel({
  name,
  p,
  g,
  privateKey,
  setPrivateKey,
  publicKey,
  setPublicKey,
  otherPublicKey,
  setOtherPublicKey,
  sharedSecret,
  computeSharedSecret,
  paramsValid,
}: PartyPanelProps) {
  const [copyMsg, setCopyMsg] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [showPublicKey, setShowPublicKey] = useState(false);
  const [showSharedSecret, setShowSharedSecret] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCopy = async (value: string | number) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopyMsg('Copied!');
      setTimeout(() => setCopyMsg(''), 1000);
    } catch {
      setCopyMsg('Failed to copy');
      setTimeout(() => setCopyMsg(''), 1000);
    }
  };

  const handleStep = (step: number) => setActiveStep(step);

  const validatePrivateKey = (key: number) => {
    if (key <= 0) {
      setErrorMsg('Private key must be positive');
      return false;
    }
    if (key >= p) {
      setErrorMsg('Private key must be less than the prime');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handlePrivateKeyChange = (value: number) => {
    setPrivateKey(value);
    handleStep(0);
    validatePrivateKey(value);
  };

  const handleComputePublicKey = () => {
    if (!validatePrivateKey(privateKey) || !paramsValid) {
      return;
    }
    try {
      const computed = computePublicKey(privateKey, g, p);
      setPublicKey(computed);
      handleStep(1);
      setShowPublicKey(true);
      setErrorMsg('');
    } catch (error) {
      setErrorMsg('Error computing public key');
    }
  };

  const handleComputeSharedSecret = () => {
    if (otherPublicKey <= 0 || !paramsValid) {
      setErrorMsg('Please enter a valid public key from the other party');
      return;
    }
    try {
      computeSharedSecret();
      handleStep(3);
      setShowSharedSecret(true);
      setErrorMsg('');
    } catch (error) {
      setErrorMsg('Error computing shared secret');
    }
  };

  const isPrivateKeyValid = privateKey > 0 && privateKey < p;

  return (
    <Paper elevation={3} sx={{ p: 3, minHeight: 400 }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
        {steps.map((label, idx) => (
          <Step key={label} completed={activeStep > idx}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Typography variant="h6" gutterBottom>{name}</Typography>

      <Box mb={2}>
        <Tooltip title="Choose a private key (random or manual)">
          <TextField
            label="Private Key"
            type="number"
            value={privateKey}
            onChange={e => handlePrivateKeyChange(Number(e.target.value))}
            fullWidth
            margin="dense"
            error={!!errorMsg}
            helperText={errorMsg}
          />
        </Tooltip>
        <Tooltip title="Generate a random private key">
          <Button
            variant="outlined"
            onClick={() => {
              const newKey = generatePrivateKey();
              setPrivateKey(newKey);
              handleStep(0);
              validatePrivateKey(newKey);
            }}
            sx={{ mt: 1 }}
            fullWidth
          >
            Generate Random Private Key
          </Button>
        </Tooltip>
      </Box>

      <Fade in={showPublicKey} timeout={500}>
        <Box mb={2} display="flex" alignItems="center">
          <Tooltip title="Compute your public key from your private key">
            <TextField
              label="Public Key"
              value={publicKey}
              InputProps={{ readOnly: true }}
              fullWidth
              margin="dense"
            />
          </Tooltip>
          <Tooltip title="Copy Public Key">
            <IconButton onClick={() => handleCopy(publicKey)} sx={{ ml: 1 }}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Fade>

      <Tooltip title="Click to compute your public key">
        <span>
          <Button
            variant="contained"
            onClick={handleComputePublicKey}
            sx={{ mb: 2 }}
            fullWidth
            disabled={!isPrivateKeyValid || !paramsValid}
          >
            Compute Public Key
          </Button>
        </span>
      </Tooltip>

      <Box mb={2}>
        <Tooltip title="Enter the other party's public key">
          <TextField
            label={`Other's Public Key`}
            type="number"
            value={otherPublicKey}
            onChange={e => { setOtherPublicKey(Number(e.target.value)); handleStep(2); }}
            fullWidth
            margin="dense"
          />
        </Tooltip>
      </Box>

      <Tooltip title="Compute the shared secret using the other party's public key">
        <span>
          <Button
            variant="contained"
            color="success"
            onClick={handleComputeSharedSecret}
            fullWidth
            disabled={otherPublicKey <= 0 || !paramsValid}
          >
            Compute Shared Secret
          </Button>
        </span>
      </Tooltip>

      <Grow in={showSharedSecret} timeout={800}>
        <Box mt={2} display="flex" alignItems="center">
          <Box flexGrow={1}>
            <Tooltip title="This is the shared secret derived from the key exchange">
              <Typography variant="subtitle1">Shared Secret:</Typography>
            </Tooltip>
            <Typography variant="h5" color="primary">{sharedSecret}</Typography>
          </Box>
          <Tooltip title="Copy Shared Secret">
            <IconButton onClick={() => handleCopy(sharedSecret as number)} sx={{ ml: 1 }}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Grow>

      {copyMsg && (
        <Fade in={!!copyMsg} timeout={300}>
          <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>{copyMsg}</Typography>
        </Fade>
      )}
    </Paper>
  );
}