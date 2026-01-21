import 'dotenv/config';
import { Request, Response } from 'express';
import { PoolClient } from 'pg';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { getPool } from '../config/dbconfig';
import { sendVerificationEmail } from '../utils/emailService';

/**
 * Generate a random token and return both the plain token and its hash
 * @returns Object containing token (plain) and tokenHash
 */
const generateToken = (): { token: string; tokenHash: string } => {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
};

/**
 * Hash a token using SHA-256
 * @param token Plain token to hash
 * @returns Hashed token
 */
const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate access token JWT
 * @param userId User ID to include in token
 * @returns Access token string
 */
const generateAccessToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  const jwtExpiry: number = Number(process.env.JWT_ACCESS_EXPIRY) || 900; // 15 minutes default
  
  const payload = { 
    userId,
    type: 'access'
  };
  
  const options: jwt.SignOptions = {
    expiresIn: jwtExpiry
  };
  
  return jwt.sign(payload, jwtSecret as string, options);
};

/**
 * Generate refresh token (random string)
 * @returns Object containing token (plain) and tokenHash
 */
const generateRefreshToken = (): { token: string; tokenHash: string } => {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  return { token, tokenHash };
};

/**
 * Generate an exchange code for auth flow
 * @returns Object containing code (plain) and codeHash
 */
const generateExchangeCode = (): { code: string; codeHash: string } => {
  const code = crypto.randomBytes(32).toString('hex');
  const codeHash = hashToken(code);
  return { code, codeHash };
};

/**
 * Get platform from request headers
 * @param req Express request object
 * @returns Platform string (web, android, ios)
 */
const getPlatform = (req: Request): string => {
  return (req.headers['x-platform'] as string)?.toLowerCase() || 'web';
};

/**
 * Sign up a new user
 * POST /auth/signup
 * Body: { username: string, email: string, password: string }
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Validation (frontend validates, but we do basic checks)
    if (!username || !email || !password) {
      res.status(400).json({ error: 'Username, email, and password are required' });
      return;
    }

    // Trim username (no validation, just trim as per requirement)
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      res.status(400).json({ error: 'Username cannot be empty' });
      return;
    }

    if (!email.includes('@')) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const pool = getPool();
    if (!pool) {
      res.status(500).json({ error: 'Database connection not available' });
      return;
    }

    // // Check if username already exists
    // const existingUsername = await pool.query(
    //   'SELECT id FROM users WHERE username = $1',
    //   [trimmedUsername]
    // );

    // if (existingUsername.rows.length > 0) {
    //   res.status(409).json({ error: 'Username already taken' });
    //   return;
    // }

    // Check if email already exists
    const existingEmail = await pool.query(
      'SELECT id, password_hash FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingEmail.rows.length > 0) {
      // Check if this is a Google OAuth user (password_hash is null)
      if (existingEmail.rows[0].password_hash === null) {
        res.status(400).json({ 
          error: 'This email is registered with Google. Please login with Google.',
          login_with_google: true 
        });
        return;
      }
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userResult = await pool.query(
      `INSERT INTO users (username, email, password_hash, is_verified, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, username, email, is_verified, created_at`,
      [trimmedUsername, email.toLowerCase(), passwordHash, false]
    );

    const userId = userResult.rows[0].id;

    // Generate verification token
    const { token, tokenHash } = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

    // Store token in email_verifications table
    await pool.query(
      `INSERT INTO email_verifications (user_id, token_hash, expires_at, used)
       VALUES ($1, $2, $3, $4)`,
      [userId, tokenHash, expiresAt, false]
    );

    // Send verification email
    try {
      await sendVerificationEmail(email, token);
      res.status(201).json({
        message: 'User created successfully. Please check your email to verify your account.',
        user: {
          id: userId,
          username: userResult.rows[0].username,
          email: userResult.rows[0].email,
          is_verified: userResult.rows[0].is_verified,
        },
      });
    } catch (emailError) {
      // User was created but email failed - still return success but log the error
      console.error('User created but verification email failed:', emailError);
      res.status(201).json({
        message: 'User created successfully. Verification email could not be sent. Please contact support.',
        user: {
          id: userId,
          username: userResult.rows[0].username,
          email: userResult.rows[0].email,
          is_verified: userResult.rows[0].is_verified,
        },
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error during signup' });
  }
};

/**
 * Verify email using token
 * GET /auth/verify-email?token=abc123
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const pool = getPool();
  if (!pool) {
    res.status(500).json({ error: 'Database connection not available' });
    return;
  }

  const client: PoolClient = await pool.connect();

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ error: 'Verification token is required' });
      return;
    }

    // Hash the incoming token
    const tokenHash = hashToken(token);

    // Start transaction
    await client.query('BEGIN');

    // Find token in DB
    const tokenResult = await client.query(
      `SELECT ev.user_id, ev.expires_at, ev.used, u.username, u.email, u.is_verified
       FROM email_verifications ev
       INNER JOIN users u ON ev.user_id = u.id
       WHERE ev.token_hash = $1`,
      [tokenHash]
    );

    if (tokenResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      res.status(400).json({ error: 'Invalid or expired verification token' });
      return;
    }

    const verification = tokenResult.rows[0];

    // Check if token is already used
    if (verification.used) {
      await client.query('ROLLBACK');
      client.release();
      res.status(400).json({ error: 'This verification token has already been used' });
      return;
    }

    // Check if token is expired
    const expiresAt = new Date(verification.expires_at);
    if (expiresAt < new Date()) {
      await client.query('ROLLBACK');
      client.release();
      res.status(400).json({ error: 'Verification token has expired' });
      return;
    }

    // Check if user is already verified
    if (verification.is_verified) {
      await client.query('ROLLBACK');
      client.release();
      res.status(400).json({ error: 'Email is already verified' });
      return;
    }

    // Mark token as used and user as verified (transactional)
    await client.query(
      `UPDATE email_verifications 
       SET used = true 
       WHERE token_hash = $1`,
      [tokenHash]
    );

    await client.query(
      `UPDATE users 
       SET is_verified = true 
       WHERE id = $1`,
      [verification.user_id]
    );

    // Generate exchange code for auth flow
    const { code, codeHash } = generateExchangeCode();
    const codeExpiresAt = new Date();
    codeExpiresAt.setMinutes(codeExpiresAt.getMinutes() + 10); // Code expires in 10 minutes

    // Store exchange code in database
    await client.query(
      `INSERT INTO auth_exchange_codes (user_id, code_hash, expires_at, used)
       VALUES ($1, $2, $3, $4)`,
      [verification.user_id, codeHash, codeExpiresAt, false]
    );

    // Commit transaction
    await client.query('COMMIT');
    client.release();

    // Get platform from headers for redirect
    const platform = getPlatform(req);
    const platformLower = platform.toLowerCase();

    // Redirect based on platform
    if (platformLower === 'web') {
      // For web: redirect to http://localhost:8081/verifysuccess?code={code}
      const redirectUrl = `${process.env.APP_URL}/verifysuccess?code=${code}`;
      res.redirect(redirectUrl);
    } else {
      // For mobile: redirect to myapp://verifysuccess?code={code}
      const redirectUrl = `${process.env.APP_SCHEME}://verifysuccess?code=${code}`;
      res.redirect(redirectUrl);
    }
  } catch (error) {
    // Rollback on any error
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error during email verification' });
  } finally {
    // Release client back to pool
    client.release();
  }
};

/**
 * Login user
 * POST /auth/login
 * Body: { email: string, password: string }
 * Headers: { x-platform: 'web' | 'android' | 'ios' }
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const pool = getPool();
  if (!pool) {
    res.status(500).json({ error: 'Database connection not available' });
    return;
  }

  const client: PoolClient = await pool.connect();

  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      client.release();
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Get platform from headers
    const platform = getPlatform(req);

    // Find user
    const userResult = await client.query(
      'SELECT id, username, email, password_hash, is_verified FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      client.release();
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = userResult.rows[0];

    // Check if this is a Google OAuth user (password_hash is null)
    if (user.password_hash === null) {
      client.release();
      res.status(400).json({ 
        error: 'This email is registered with Google. Please login with Google.',
        login_with_google: true 
      });
      return;
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      client.release();
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check if email is verified
    if (!user.is_verified) {
      client.release();
      res.status(403).json({ 
        error: 'Please verify your email address before logging in',
        needs_verification: true 
      });
      return;
    }

    // Start transaction
    await client.query('BEGIN');

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const { token: refreshToken, tokenHash: refreshTokenHash } = generateRefreshToken();
    
    // Set refresh token expiry (7 days)
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    // Store refresh token in database
    await client.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, revoked)
       VALUES ($1, $2, $3, $4)`,
      [user.id, refreshTokenHash, refreshTokenExpiry, false]
    );

    // Commit transaction
    await client.query('COMMIT');
    client.release();

    // Prepare response with tokens based on platform
    const platformLower = platform.toLowerCase();
    
    if (platformLower === 'web') {
      // For web: both tokens as cookies
      const accessTokenExpiry = new Date();
      accessTokenExpiry.setMinutes(accessTokenExpiry.getMinutes() + 15); // 15 minutes
      
      const refreshTokenExpiry = new Date();
      refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days
      
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: accessTokenExpiry,
        path: '/'
      });
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: refreshTokenExpiry,
        path: '/'
      });
      
      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          is_verified: user.is_verified,
        },
      });
    } else {
      // For android or ios: both tokens in JSON
      res.status(200).json({
        accessToken,
        refreshToken,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          is_verified: user.is_verified,
        },
      });
    }
  } catch (error) {
    // Rollback on any error
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }
    console.error('Login error:', error);
    client.release();
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

/**
 * Google OAuth authentication
 * POST /auth/google
 * Body: { idToken: string }
 * Headers: { x-platform: 'web' | 'android' | 'ios' }
 */
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  const pool = getPool();
  if (!pool) {
    res.status(500).json({ error: 'Database connection not available' });
    return;
  }

  const client: PoolClient = await pool.connect();

  try {
    const { idToken } = req.body;

    if (!idToken) {
      client.release();
      res.status(400).json({ error: 'Token missing' });
      return;
    }

    // Initialize Google OAuth2 client
    const googleClient = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

    // Verify the ID token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_WEB_CLIENT_ID,
      });
    } catch (error) {
      client.release();
      res.status(401).json({ error: 'Invalid Google token' });
      return;
    }

    const payload = ticket.getPayload();

    if (!payload) {
      client.release();
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }

    const {
      sub,              // Google user ID
      email,
      name,
      picture,
      email_verified,
    } = payload;

    if (!email) {
      client.release();
      res.status(400).json({ error: 'Email not provided by Google' });
      return;
    }

    if (!email_verified) {
      client.release();
      res.status(401).json({ error: 'Email not verified by Google' });
      return;
    }

    // Get platform from headers
    const platform = getPlatform(req);
    const platformLower = platform.toLowerCase();

    // Start transaction
    await client.query('BEGIN');

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id, username, email, password_hash, is_verified FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    let userId: string;
    let username: string;
    let isVerified: boolean;

    if (existingUser.rows.length > 0) {
      // User exists - use existing user data
      const user = existingUser.rows[0];
      userId = user.id;
      username = user.username;
      isVerified = user.is_verified;
    } else {
      // User doesn't exist - create new user
      // Use name from Google or generate a username from email
      username = name || email.split('@')[0];
      
      // Insert new user with null password_hash (Google OAuth)
      const newUserResult = await client.query(
        `INSERT INTO users (username, email, password_hash, is_verified, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, username, email, is_verified`,
        [username, email.toLowerCase(), null, true] // is_verified = true since Google verifies emails
      );

      userId = newUserResult.rows[0].id;
      username = newUserResult.rows[0].username;
      isVerified = newUserResult.rows[0].is_verified;
    }

    // Generate tokens
    const accessToken = generateAccessToken(userId);
    const { token: refreshToken, tokenHash: refreshTokenHash } = generateRefreshToken();
    
    // Set refresh token expiry (7 days)
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    // Store refresh token in database
    await client.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, revoked)
       VALUES ($1, $2, $3, $4)`,
      [userId, refreshTokenHash, refreshTokenExpiry, false]
    );

    // Commit transaction
    await client.query('COMMIT');
    client.release();

    // Send tokens based on platform
    if (platformLower === 'web') {
      // For web: both tokens as cookies
      const accessTokenExpiryDate = new Date();
      accessTokenExpiryDate.setMinutes(accessTokenExpiryDate.getMinutes() + 15); // 15 minutes
      
      const refreshTokenExpiryDate = new Date();
      refreshTokenExpiryDate.setDate(refreshTokenExpiryDate.getDate() + 7); // 7 days
      
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: accessTokenExpiryDate,
        path: '/'
      });
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: refreshTokenExpiryDate,
        path: '/'
      });
      
      res.status(200).json({
        message: 'Authentication successful',
        user: {
          id: userId,
          username,
          email: email.toLowerCase(),
          is_verified: isVerified,
        },
      });
    } else {
      // For android or ios: both tokens in JSON
      res.status(200).json({
        message: 'Authentication successful',
        accessToken,
        refreshToken,
        user: {
          id: userId,
          username,
          email: email.toLowerCase(),
          is_verified: isVerified,
        },
      });
    }
  } catch (error) {
    // Rollback on any error
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }
    console.error('Google OAuth error:', error);
    client.release();
    res.status(500).json({ error: 'Internal server error during Google authentication' });
  }
};

/**
 * Exchange code for tokens
 * GET /auth/exchange-code/:code
 * Headers: { x-platform: 'web' | 'android' | 'ios' }
 */
export const exchangeCode = async (req: Request, res: Response): Promise<void> => {
  const pool = getPool();
  if (!pool) {
    res.status(500).json({ error: 'Database connection not available' });
    return;
  }

  const client: PoolClient = await pool.connect();

  try {
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      client.release();
      res.status(400).json({ error: 'Exchange code is required' });
      return;
    }

    // Hash the incoming code
    const codeHash = hashToken(code);

    // Start transaction
    await client.query('BEGIN');

    // Find code in DB
    const codeResult = await client.query(
      `SELECT aec.user_id, aec.expires_at, aec.used, u.username, u.email, u.is_verified
       FROM auth_exchange_codes aec
       INNER JOIN users u ON aec.user_id = u.id
       WHERE aec.code_hash = $1`,
      [codeHash]
    );

    if (codeResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      res.status(400).json({ error: 'Invalid or expired exchange code' });
      return;
    }

    const exchangeCodeData = codeResult.rows[0];

    // Check if code is already used
    if (exchangeCodeData.used) {
      await client.query('ROLLBACK');
      client.release();
      res.status(400).json({ error: 'This exchange code has already been used' });
      return;
    }

    // Check if code is expired
    const expiresAt = new Date(exchangeCodeData.expires_at);
    if (expiresAt < new Date()) {
      await client.query('ROLLBACK');
      client.release();
      res.status(400).json({ error: 'Exchange code has expired' });
      return;
    }

    // Mark code as used
    await client.query(
      `UPDATE auth_exchange_codes 
       SET used = true 
       WHERE code_hash = $1`,
      [codeHash]
    );

    // Generate tokens
    const accessToken = generateAccessToken(exchangeCodeData.user_id);
    const { token: refreshToken, tokenHash: refreshTokenHash } = generateRefreshToken();
    
    // Set refresh token expiry (7 days)
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    // Store refresh token in database
    await client.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, revoked)
       VALUES ($1, $2, $3, $4)`,
      [exchangeCodeData.user_id, refreshTokenHash, refreshTokenExpiry, false]
    );

    // Commit transaction
    await client.query('COMMIT');
    client.release();

    // Get platform from headers
    const platform = getPlatform(req);
    const platformLower = platform.toLowerCase();

    // Send tokens based on platform
    if (platformLower === 'web') {
      // For web: both tokens as cookies
      const accessTokenExpiryDate = new Date();
      accessTokenExpiryDate.setMinutes(accessTokenExpiryDate.getMinutes() + 15); // 15 minutes
      
      const refreshTokenExpiryDate = new Date();
      refreshTokenExpiryDate.setDate(refreshTokenExpiryDate.getDate() + 7); // 7 days
      
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: accessTokenExpiryDate,
        path: '/'
      });
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: refreshTokenExpiryDate,
        path: '/'
      });
      
      res.status(200).json({
        message: 'Authentication successful',
        user: {
          id: exchangeCodeData.user_id,
          username: exchangeCodeData.username,
          email: exchangeCodeData.email,
          is_verified: exchangeCodeData.is_verified,
        },
      });
    } else {
      // For android or ios: both tokens in JSON
      res.status(200).json({
        message: 'Authentication successful',
        accessToken,
        refreshToken,
        user: {
          id: exchangeCodeData.user_id,
          username: exchangeCodeData.username,
          email: exchangeCodeData.email,
          is_verified: exchangeCodeData.is_verified,
        },
      });
    }
  } catch (error) {
    // Rollback on any error
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }
    console.error('Exchange code error:', error);
    client.release();
    res.status(500).json({ error: 'Internal server error during code exchange' });
  }
};
