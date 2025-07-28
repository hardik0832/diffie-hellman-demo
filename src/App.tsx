import React, { useState } from 'react';
import { Container, Typography, Grid, Paper, Button, TextField, Box, IconButton, AppBar, Toolbar, Switch, useTheme, CssBaseline, Tooltip, Fade, Slide, Grow, Accordion, AccordionSummary, AccordionDetails, Chip } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Stepper, Step, StepLabel } from '@mui/material';
import { modPow, generatePrivateKey, computePublicKey, computeSharedSecret, DEFAULT_P, DEFAULT_G } from './utils/diffieHellman.ts';

const steps = [
  'Set Private Key',
  'Compute Public Key',
  'Enter Other\'s Public Key',
  'Compute Shared Secret',
];

const PartyPanel = ({
  name,
  p,
  g,
  privateKey,
  setPrivateKey,
  publicKey,
  setPublicKey,
  otherPublicKey,
  sharedSecret,
  setOtherPublicKey,
  computeSharedSecret,
}: any) => {
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

  // Stepper logic
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
    if (!validatePrivateKey(privateKey)) {
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
    if (otherPublicKey <= 0) {
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

  // Check if private key is valid for button state
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
        <Button
          variant="contained"
          onClick={handleComputePublicKey}
          sx={{ mb: 2 }}
          fullWidth
          disabled={!isPrivateKeyValid}
        >
          Compute Public Key
        </Button>
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
        <Button
          variant="contained"
          color="success"
          onClick={handleComputeSharedSecret}
          fullWidth
          disabled={otherPublicKey <= 0}
        >
          Compute Shared Secret
        </Button>
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
            <IconButton onClick={() => handleCopy(sharedSecret)} sx={{ ml: 1 }}>
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
};

// Encryption Demo Component
const EncryptionDemo = ({ sharedSecret }: { sharedSecret: number | null }) => {
  const [message, setMessage] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');

  const simpleEncrypt = (text: string, key: number): string => {
    return text.split('').map(char => {
      const charCode = char.charCodeAt(0);
      return String.fromCharCode((charCode + key) % 256);
    }).join('');
  };

  const simpleDecrypt = (text: string, key: number): string => {
    return text.split('').map(char => {
      const charCode = char.charCodeAt(0);
      return String.fromCharCode((charCode - key + 256) % 256);
    }).join('');
  };

  const handleEncrypt = () => {
    if (sharedSecret && message) {
      const encrypted = simpleEncrypt(message, sharedSecret);
      setEncryptedMessage(encrypted);
    }
  };

  const handleDecrypt = () => {
    if (sharedSecret && encryptedMessage) {
      const decrypted = simpleDecrypt(encryptedMessage, sharedSecret);
      setDecryptedMessage(decrypted);
    }
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Encryption Demo (Optional)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ width: '100%' }}>
          <Typography variant="body2" gutterBottom>
            Use your shared secret to encrypt and decrypt messages (for demonstration only).
          </Typography>
          <TextField
            label="Message to Encrypt"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            margin="dense"
            disabled={!sharedSecret}
          />
          <Button
            variant="contained"
            onClick={handleEncrypt}
            disabled={!sharedSecret || !message}
            sx={{ mt: 1, mr: 1 }}
          >
            Encrypt
          </Button>
          <Button
            variant="outlined"
            onClick={handleDecrypt}
            disabled={!sharedSecret || !encryptedMessage}
            sx={{ mt: 1 }}
          >
            Decrypt
          </Button>
          {encryptedMessage && (
            <Box mt={2}>
              <Typography variant="subtitle2">Encrypted Message:</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                {encryptedMessage}
              </Typography>
            </Box>
          )}
          {decryptedMessage && (
            <Box mt={2}>
              <Typography variant="subtitle2">Decrypted Message:</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                {decryptedMessage}
              </Typography>
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

// Attack Simulation Component
const AttackSimulation = ({ 
  alicePublic, 
  bobPublic, 
  p, 
  g, 
  aliceSecret, 
  bobSecret 
}: { 
  alicePublic: number; 
  bobPublic: number; 
  p: number; 
  g: number; 
  aliceSecret: number | null; 
  bobSecret: number | null; 
}) => {
  const [eveAttempts, setEveAttempts] = useState<number[]>([]);
  const [eveGuessedSecret, setEveGuessedSecret] = useState<number | null>(null);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackResult, setAttackResult] = useState<string>('');

  const simulateAttack = () => {
    setIsAttacking(true);
    setEveAttempts([]);
    setEveGuessedSecret(null);
    setAttackResult('');

    // Simulate Eve trying different private keys
    const attempts: number[] = [];
    let found = false;
    let guessedSecret: number | null = null;

    // Try a few random attempts (in real world, this would be computationally infeasible)
    for (let i = 0; i < 10; i++) {
      const randomPrivateKey = Math.floor(Math.random() * p);
      attempts.push(randomPrivateKey);
      
      // Simulate Eve's computation
      const eveComputedSecret = modPow(alicePublic, randomPrivateKey, p);
      
      // Check if Eve guessed correctly (extremely unlikely)
      if (eveComputedSecret === aliceSecret || eveComputedSecret === bobSecret) {
        found = true;
        guessedSecret = eveComputedSecret;
        break;
      }
    }

    setTimeout(() => {
      setEveAttempts(attempts);
      setEveGuessedSecret(guessedSecret);
      setAttackResult(found ? 'SUCCESS (extremely rare!)' : 'FAILED - Secret remains secure');
      setIsAttacking(false);
    }, 2000);
  };

  const resetAttack = () => {
    setEveAttempts([]);
    setEveGuessedSecret(null);
    setAttackResult('');
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">🔒 Attack Simulation (Eve's Perspective)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ width: '100%' }}>
          <Typography variant="body2" gutterBottom>
            <strong>Scenario:</strong> Eve intercepts Alice's public key ({alicePublic}) and Bob's public key ({bobPublic}). 
            Can she compute the shared secret?
          </Typography>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="error.dark" gutterBottom>
              🕵️ Eve's Intercepted Information:
            </Typography>
            <Typography variant="body2" color="error.dark">
              • Prime (p): {p}<br/>
              • Generator (g): {g}<br/>
              • Alice's Public Key: {alicePublic}<br/>
              • Bob's Public Key: {bobPublic}<br/>
              • <strong>Missing:</strong> Alice's and Bob's private keys
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={simulateAttack}
              disabled={isAttacking || !aliceSecret || !bobSecret}
              sx={{ mr: 1 }}
            >
              {isAttacking ? 'Attacking...' : 'Simulate Attack'}
            </Button>
            <Button
              variant="outlined"
              onClick={resetAttack}
              disabled={isAttacking}
            >
              Reset
            </Button>
          </Box>

          {eveAttempts.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Eve's Attack Attempts:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {eveAttempts.map((attempt, index) => (
                  <Chip
                    key={index}
                    label={`Private Key: ${attempt}`}
                    size="small"
                    color="default"
                    variant="outlined"
                  />
                ))}
              </Box>
              
              {eveGuessedSecret !== null && (
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1, mb: 2 }}>
                  <Typography variant="subtitle2" color="success.dark">
                    🎯 Eve Successfully Guessed: {eveGuessedSecret}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ p: 2, bgcolor: attackResult.includes('SUCCESS') ? 'success.light' : 'info.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" color={attackResult.includes('SUCCESS') ? 'success.dark' : 'info.dark'}>
                  {attackResult}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {attackResult.includes('SUCCESS') 
                    ? 'This is extremely rare! In practice, with large primes, this would be computationally impossible.'
                    : 'Eve cannot compute the shared secret without knowing the private keys. This demonstrates why Diffie-Hellman is secure!'
                  }
                </Typography>
              </Box>
            </Box>
          )}

          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="info.dark" gutterBottom>
              🔐 Why This Attack Fails:
            </Typography>
            <Typography variant="body2" color="info.dark">
              • Eve knows: g, p, A (Alice's public), B (Bob's public)<br/>
              • To find the secret, Eve needs: a (Alice's private) or b (Bob's private)<br/>
              • This requires solving the Discrete Logarithm Problem<br/>
              • With large primes (2048+ bits), this is computationally infeasible<br/>
              • Even with quantum computers, this remains secure with proper parameters
            </Typography>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

function AppContent({ toggleTheme, darkMode }: { toggleTheme: () => void; darkMode: boolean }) {
  // Shared prime and generator
  const [p, setP] = useState(DEFAULT_P);
  const [g, setG] = useState(DEFAULT_G);
  const [showMathExplanation, setShowMathExplanation] = useState(false);
  const [securityWarning, setSecurityWarning] = useState(false);

  // Alice's state
  const [alicePrivate, setAlicePrivate] = useState(generatePrivateKey());
  const [alicePublic, setAlicePublic] = useState(modPow(g, alicePrivate, p));
  const [aliceOtherPublic, setAliceOtherPublic] = useState(0);
  const [aliceSecret, setAliceSecret] = useState<number | null>(null);

  // Bob's state
  const [bobPrivate, setBobPrivate] = useState(generatePrivateKey());
  const [bobPublic, setBobPublic] = useState(modPow(g, bobPrivate, p));
  const [bobOtherPublic, setBobOtherPublic] = useState(0);
  const [bobSecret, setBobSecret] = useState<number | null>(null);

  const handlePrimeChange = (newP: number) => {
    if (newP > 1000) {
      setSecurityWarning(true);
      setTimeout(() => setSecurityWarning(false), 5000);
    }
    setP(newP);
  };

  return (
    <>
      <CssBaseline />
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Diffie-Hellman Key Exchange Demo
          </Typography>
          <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Switch checked={darkMode} onChange={toggleTheme} color="default" />
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="subtitle1" align="center" gutterBottom>
          A modern, interactive demonstration of the Diffie-Hellman key exchange using Material UI.
        </Typography>
        
        {/* Security Warning */}
        <Fade in={securityWarning} timeout={300}>
          <Box sx={{ mb: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="body2" color="warning.dark">
              ⚠️ Warning: Large primes may cause performance issues. This demo is for educational purposes only.
            </Typography>
          </Box>
        </Fade>

        {/* Parameters Section */}
        <Box display="flex" justifyContent="center" gap={4} my={4} flexWrap="wrap">
          <Box>
            <TextField
              label="Prime (p)"
              type="number"
              value={p}
              onChange={e => handlePrimeChange(Number(e.target.value))}
              size="small"
              sx={{ minWidth: 120 }}
            />
          </Box>
          <Box>
            <TextField
              label="Generator (g)"
              type="number"
              value={g}
              onChange={e => setG(Number(e.target.value))}
              size="small"
              sx={{ minWidth: 120 }}
            />
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowMathExplanation(!showMathExplanation)}
          >
            {showMathExplanation ? 'Hide' : 'Show'} Math Explanation
          </Button>
        </Box>

        {/* Math Explanation */}
        <Slide direction="down" in={showMathExplanation} mountOnEnter unmountOnExit>
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>How Diffie-Hellman Works</Typography>
            <Typography variant="body2" paragraph>
              <strong>Step 1:</strong> Both parties agree on a prime number p and a generator g.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Step 2:</strong> Alice chooses a private key a and computes A = g^a mod p.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Step 3:</strong> Bob chooses a private key b and computes B = g^b mod p.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Step 4:</strong> They exchange their public keys A and B.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Step 5:</strong> Alice computes s = B^a mod p, Bob computes s = A^b mod p.
            </Typography>
            <Typography variant="body2">
              <strong>Result:</strong> Both parties now share the same secret s = g^(ab) mod p.
            </Typography>
          </Box>
        </Slide>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <PartyPanel
              name="Alice"
              p={p}
              g={g}
              privateKey={alicePrivate}
              setPrivateKey={setAlicePrivate}
              publicKey={alicePublic}
              setPublicKey={setAlicePublic}
              otherPublicKey={aliceOtherPublic}
              setOtherPublicKey={setAliceOtherPublic}
              sharedSecret={aliceSecret}
              computeSharedSecret={() => setAliceSecret(modPow(aliceOtherPublic, alicePrivate, p))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <PartyPanel
              name="Bob"
              p={p}
              g={g}
              privateKey={bobPrivate}
              setPrivateKey={setBobPrivate}
              publicKey={bobPublic}
              setPublicKey={setBobPublic}
              otherPublicKey={bobOtherPublic}
              setOtherPublicKey={setBobOtherPublic}
              sharedSecret={bobSecret}
              computeSharedSecret={() => setBobSecret(modPow(bobOtherPublic, bobPrivate, p))}
            />
          </Grid>
        </Grid>

        {/* Attack Simulation */}
        <Box mt={4}>
          <AttackSimulation 
            alicePublic={alicePublic}
            bobPublic={bobPublic}
            p={p}
            g={g}
            aliceSecret={aliceSecret}
            bobSecret={bobSecret}
          />
        </Box>

        {/* Encryption Demo */}
        <Box mt={4}>
          <EncryptionDemo sharedSecret={aliceSecret || bobSecret} />
        </Box>
        
        {/* Security Note */}
        <Box mt={6} textAlign="center">
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            ⚠️ <strong>Security Notice:</strong> This demo uses small numbers for educational purposes.
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Real-world applications use 2048-bit or larger primes for security.
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Made with React & Material UI.
          </Typography>
        </Box>
      </Container>
    </>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode]
  );

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <ThemeProvider theme={theme}>
      <AppContent toggleTheme={toggleTheme} darkMode={darkMode} />
    </ThemeProvider>
  );
}

export default App;
