import React, { useState } from 'react';
import { Container, Typography, Grid, Button, TextField, Box, IconButton, AppBar, Toolbar, Switch, CssBaseline, Tooltip, Fade, Slide } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { modPow, generatePrivateKey, DEFAULT_P, DEFAULT_G, isValidPrime } from './utils/diffieHellman';
import PartyPanel from './components/PartyPanel';
import AttackSimulation from './components/AttackSimulation';
import EncryptionDemo from './components/EncryptionDemo';

function AppContent({ toggleTheme, darkMode }: { toggleTheme: () => void; darkMode: boolean }) {
  const [p, setP] = useState(DEFAULT_P);
  const [g, setG] = useState(DEFAULT_G);
  const [showMathExplanation, setShowMathExplanation] = useState(false);
  const [securityWarning, setSecurityWarning] = useState(false);
  const [primeError, setPrimeError] = useState<string | null>(null);
  const [generatorError, setGeneratorError] = useState<string | null>(null);

  const [alicePrivate, setAlicePrivate] = useState(generatePrivateKey());
  const [alicePublic, setAlicePublic] = useState(modPow(g, alicePrivate, p));
  const [aliceOtherPublic, setAliceOtherPublic] = useState(0);
  const [aliceSecret, setAliceSecret] = useState<number | null>(null);

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
    if (!isValidPrime(newP)) {
      setPrimeError('p must be a prime number');
    } else if (g >= newP) {
      setPrimeError('p must be greater than g');
    } else {
      setPrimeError(null);
    }
  };

  const handleGeneratorChange = (newG: number) => {
    setG(newG);
    if (newG <= 1) {
      setGeneratorError('g must be > 1');
    } else if (newG >= p) {
      setGeneratorError('g must be less than p');
    } else {
      setGeneratorError(null);
    }
  };

  const paramsValid = !primeError && !generatorError && isValidPrime(p) && g > 1 && g < p;

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

        <Fade in={securityWarning} timeout={300}>
          <Box sx={{ mb: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="body2" color="warning.dark">
              ⚠️ Warning: Large primes may cause performance issues. This demo is for educational purposes only.
            </Typography>
          </Box>
        </Fade>

        <Box display="flex" justifyContent="center" gap={4} my={4} flexWrap="wrap">
          <Box>
            <TextField
              label="Prime (p)"
              type="number"
              value={p}
              onChange={e => handlePrimeChange(Number(e.target.value))}
              size="small"
              sx={{ minWidth: 120 }}
              error={!!primeError}
              helperText={primeError || ''}
            />
          </Box>
          <Box>
            <TextField
              label="Generator (g)"
              type="number"
              value={g}
              onChange={e => handleGeneratorChange(Number(e.target.value))}
              size="small"
              sx={{ minWidth: 120 }}
              error={!!generatorError}
              helperText={generatorError || ''}
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
              paramsValid={!!paramsValid}
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
              paramsValid={!!paramsValid}
            />
          </Grid>
        </Grid>

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

        <Box mt={4}>
          <EncryptionDemo sharedSecret={aliceSecret || bobSecret} />
        </Box>

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
