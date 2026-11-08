import express from "express";
import axios from "axios";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5000;

// ES module dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (CSS, JS, etc.) from "public"
app.use(express.static(path.join(__dirname, "public")));

// Route for root - serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Weather API endpoint using Open-Meteo (free, no API key required)
app.get("/api/weather", async (req, res) => {
  try {
    const { lat, lon, timezone } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ 
        error: "Please provide latitude and longitude coordinates" 
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        error: "Invalid coordinates provided" 
      });
    }

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=${timezone || 'auto'}&forecast_days=7`;

    const response = await axios.get(weatherUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Weather-Parade-App/1.0'
      }
    });

    res.json({
      success: true,
      data: response.data,
      coordinates: { latitude, longitude },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Weather API Error:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ 
        error: "Request timeout - weather service is slow to respond" 
      });
    }
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: `Weather service error: ${error.response.statusText}` 
      });
    }
    
    res.status(500).json({ 
      error: "Internal server error while fetching weather data" 
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Handle 404 for API routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`✅ Weather Parade server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
