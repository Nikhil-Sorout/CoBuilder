import 'dotenv/config';
import express, { Request, Response } from 'express';
import { connectDatabase } from './config/dbconfig';
import authRoutes from './routes/auth';
import cors from "cors";
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Parse and attach cookies to requests
app.use(cookieParser());

// Cors configuration
// app.options("*", cors());
app.use(
  cors({
    origin:[
      "http://localhost:8081"
    ],
    credentials: true
  })
)


// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Server is running!' });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/auth', authRoutes);

// Initialize server: Connect to database first, then start listening
const startServer = async () => {
  try {
    // Connect to PostgreSQL database with exponential backoff retry
    await connectDatabase();
    
    // Once database is connected, start the Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

// Start the server
startServer();
