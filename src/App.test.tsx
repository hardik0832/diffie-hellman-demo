import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Test the Diffie-Hellman key exchange demo
test('renders Diffie-Hellman demo title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Diffie-Hellman Key Exchange Demo/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders Alice and Bob panels', () => {
  render(<App />);
  const aliceHeading = screen.getByText(/Alice/i, { selector: 'h6' });
  const bobHeading = screen.getByText(/Bob/i, { selector: 'h6' });
  expect(aliceHeading).toBeInTheDocument();
  expect(bobHeading).toBeInTheDocument();
});

test('renders prime and generator inputs', () => {
  render(<App />);
  const primeElement = screen.getByLabelText(/Prime \(p\)/i);
  const generatorElement = screen.getByLabelText(/Generator \(g\)/i);
  expect(primeElement).toBeInTheDocument();
  expect(generatorElement).toBeInTheDocument();
});

test('renders math explanation button', () => {
  render(<App />);
  const mathButton = screen.getByText(/Show Math Explanation/i);
  expect(mathButton).toBeInTheDocument();
});
