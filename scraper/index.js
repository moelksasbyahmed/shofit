/**
 * ShoFit Scraper - Node.js server for size chart extraction and AI recommendation
 * Phase 3: Web scraping with Cheerio + Gemini 2.5 Flash for size recommendations
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ============================================================================
// Size Chart Scraping Functions
// ============================================================================

/**
 * Extract size chart data from a webpage
 * Looks for tables or text containing "Size Chart", "Size Guide", etc.
 */
async function scrapeSizeChart(url) {
  try {
    // Fetch the webpage
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);
    
    let sizeChart = null;
    let rawText = '';

    // Strategy 1: Look for tables with size-related headers
    const tables = $('table');
    for (let i = 0; i < tables.length; i++) {
      const table = $(tables[i]);
      const tableText = table.text().toLowerCase();
      
      // Check if table contains size-related keywords
      if (
        tableText.includes('size') ||
        tableText.includes('chest') ||
        tableText.includes('waist') ||
        tableText.includes('hip') ||
        tableText.includes('shoulder') ||
        tableText.includes('measurement')
      ) {
        sizeChart = parseTable($, table);
        if (sizeChart && sizeChart.rows.length > 0) {
          rawText = tableText;
          break;
        }
      }
    }

    // Strategy 2: Look for divs/sections with size chart in class or id
    if (!sizeChart) {
      const sizeElements = $('[class*="size"], [id*="size"], [class*="chart"], [id*="chart"]');
      for (let i = 0; i < sizeElements.length; i++) {
        const element = $(sizeElements[i]);
        const text = element.text().toLowerCase();
        
        if (text.includes('size') && (text.includes('cm') || text.includes('inch') || text.includes('"'))) {
          // Try to find a table within this element
          const innerTable = element.find('table');
          if (innerTable.length > 0) {
            sizeChart = parseTable($, innerTable.first());
            rawText = text;
            break;
          } else {
            // Try to parse structured text
            sizeChart = parseStructuredText(text);
            rawText = text;
            if (sizeChart && sizeChart.rows.length > 0) break;
          }
        }
      }
    }

    // Strategy 3: Look for any element containing "size chart" or "size guide"
    if (!sizeChart) {
      const allText = $('body').text();
      const sizeChartMatch = allText.match(/size\s*(chart|guide)[^]*?(XS|S|M|L|XL|XXL|XXXL|0|2|4|6|8|10|12|14|16)[^]*?(\d+\.?\d*)\s*(cm|inch|")/gi);
      
      if (sizeChartMatch) {
        rawText = sizeChartMatch.join(' ');
        sizeChart = parseStructuredText(rawText);
      }
    }

    // Strategy 4: Use AI to extract from page text if all else fails
    if (!sizeChart || sizeChart.rows.length === 0) {
      const pageText = $('body').text().replace(/\s+/g, ' ').substring(0, 5000);
      sizeChart = await extractSizeChartWithAI(pageText);
      rawText = pageText;
    }

    return {
      success: true,
      sizeChart: sizeChart || { headers: [], rows: [] },
      rawText: rawText.substring(0, 2000),
      url,
    };

  } catch (error) {
    console.error('Scraping error:', error.message);
    return {
      success: false,
      error: error.message,
      sizeChart: { headers: [], rows: [] },
      url,
    };
  }
}

/**
 * Parse an HTML table into a structured format
 */
function parseTable($, table) {
  const headers = [];
  const rows = [];

  // Get headers from th elements or first row
  const headerRow = table.find('thead tr, tr').first();
  headerRow.find('th, td').each((i, el) => {
    headers.push($(el).text().trim());
  });

  // Get data rows
  table.find('tbody tr, tr').slice(1).each((i, row) => {
    const rowData = {};
    $(row).find('td, th').each((j, cell) => {
      const header = headers[j] || `column_${j}`;
      rowData[header] = $(cell).text().trim();
    });
    if (Object.keys(rowData).length > 0) {
      rows.push(rowData);
    }
  });

  // If no tbody, try parsing all rows
  if (rows.length === 0) {
    table.find('tr').slice(1).each((i, row) => {
      const rowData = {};
      $(row).find('td, th').each((j, cell) => {
        const header = headers[j] || `column_${j}`;
        rowData[header] = $(cell).text().trim();
      });
      if (Object.keys(rowData).length > 0) {
        rows.push(rowData);
      }
    });
  }

  return { headers, rows };
}

/**
 * Parse structured text (like "S: Chest 34-36" format)
 */
function parseStructuredText(text) {
  const headers = ['Size', 'Chest', 'Waist', 'Hip', 'Shoulder'];
  const rows = [];
  
  // Common size patterns
  const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2XL', '3XL', '4XL'];
  
  for (const size of sizes) {
    const pattern = new RegExp(`${size}[:\\s]+([^${sizes.join('|')}]+)`, 'i');
    const match = text.match(pattern);
    
    if (match) {
      const measurements = match[1];
      const rowData = { Size: size };
      
      // Extract measurements
      const chestMatch = measurements.match(/chest[:\s]*(\d+[-–]?\d*)/i);
      const waistMatch = measurements.match(/waist[:\s]*(\d+[-–]?\d*)/i);
      const hipMatch = measurements.match(/hip[:\s]*(\d+[-–]?\d*)/i);
      const shoulderMatch = measurements.match(/shoulder[:\s]*(\d+[-–]?\d*)/i);
      
      if (chestMatch) rowData.Chest = chestMatch[1];
      if (waistMatch) rowData.Waist = waistMatch[1];
      if (hipMatch) rowData.Hip = hipMatch[1];
      if (shoulderMatch) rowData.Shoulder = shoulderMatch[1];
      
      if (Object.keys(rowData).length > 1) {
        rows.push(rowData);
      }
    }
  }
  
  return { headers, rows };
}

/**
 * Use Gemini AI to extract size chart from unstructured text
 */
async function extractSizeChartWithAI(pageText) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { headers: [], rows: [] };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Extract the size chart from this product page text. Return ONLY a JSON object with this structure:
{
  "headers": ["Size", "Chest", "Waist", "Hip", "Shoulder"],
  "rows": [
    {"Size": "S", "Chest": "34-36", "Waist": "28-30", "Hip": "34-36", "Shoulder": "16"},
    ...
  ]
}

If measurements are in a range, keep the range format. If a measurement is not available, omit that field.
If no size chart is found, return {"headers": [], "rows": []}.

Page text:
${pageText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { headers: [], rows: [] };
  } catch (error) {
    console.error('AI extraction error:', error.message);
    return { headers: [], rows: [] };
  }
}

// ============================================================================
// Size Recommendation Functions
// ============================================================================

/**
 * Generate Gemini prompt for size recommendation
 */
function generateSizeRecommendationPrompt(measurements, sizeChart) {
  return `You are a professional clothing size advisor. Based on the user's body measurements and the clothing size chart, recommend the best fitting size.

USER'S BODY MEASUREMENTS:
- Shoulder Width: ${measurements.shoulder_width_cm} cm
- Waist Width: ${measurements.waist_width_cm} cm (approximate front width, multiply by ~2.5 for circumference: ~${(measurements.waist_width_cm * 2.5).toFixed(1)} cm)
- Hip Width: ${measurements.hip_width_cm} cm (approximate front width, multiply by ~2.5 for circumference: ~${(measurements.hip_width_cm * 2.5).toFixed(1)} cm)
- Waist-to-Hip Ratio: ${measurements.waist_to_hip_ratio}
- Height: ${measurements.height_cm} cm

SIZE CHART FROM CLOTHING WEBSITE:
${JSON.stringify(sizeChart, null, 2)}

INSTRUCTIONS:
1. Compare the user's measurements (converted to circumference where needed) with each size in the chart
2. Consider that:
   - For tops: prioritize shoulder width and chest/bust measurements
   - For bottoms: prioritize waist and hip measurements
   - It's generally better to size up if between sizes for comfort
3. Account for the user's body proportions (waist-to-hip ratio)

Respond with ONLY a JSON object in this exact format:
{
  "recommended_size": "M",
  "confidence": "high|medium|low",
  "reasoning": "Brief explanation of why this size was chosen, mentioning specific measurements that led to this decision.",
  "alternative_size": "L",
  "fit_notes": "Any notes about potential fit issues or considerations"
}`;
}

/**
 * Get size recommendation from Gemini
 */
async function getSizeRecommendation(measurements, sizeChart) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = generateSizeRecommendationPrompt(measurements, sizeChart);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Could not parse AI response');
  } catch (error) {
    console.error('Size recommendation error:', error.message);
    
    // Fallback to basic recommendation
    return {
      recommended_size: 'M',
      confidence: 'low',
      reasoning: 'Unable to process size chart. Defaulting to medium size. Please verify with the size chart manually.',
      alternative_size: 'L',
      fit_notes: 'AI recommendation unavailable',
    };
  }
}

// ============================================================================
// API Endpoints
// ============================================================================

app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ShoFit Scraper',
    version: '1.0.0',
    endpoints: [
      'POST /scrape-size-chart',
      'POST /recommend-size',
    ],
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

/**
 * Scrape size chart from a URL
 */
app.post('/scrape-size-chart', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
      });
    }

    console.log(`Scraping size chart from: ${url}`);
    const result = await scrapeSizeChart(url);

    res.json(result);
  } catch (error) {
    console.error('Scrape endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get size recommendation based on measurements and size chart
 */
app.post('/recommend-size', async (req, res) => {
  try {
    const { measurements, sizeChart } = req.body;

    if (!measurements) {
      return res.status(400).json({
        success: false,
        error: 'Measurements are required',
      });
    }

    if (!sizeChart || !sizeChart.rows || sizeChart.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid size chart is required',
      });
    }

    console.log('Getting size recommendation...');
    const recommendation = await getSizeRecommendation(measurements, sizeChart);

    res.json(recommendation);
  } catch (error) {
    console.error('Recommendation endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Combined endpoint: scrape + recommend in one call
 */
app.post('/analyze', async (req, res) => {
  try {
    const { url, measurements } = req.body;

    if (!url || !measurements) {
      return res.status(400).json({
        success: false,
        error: 'URL and measurements are required',
      });
    }

    console.log(`Full analysis for: ${url}`);

    // Step 1: Scrape size chart
    const scrapeResult = await scrapeSizeChart(url);
    
    if (!scrapeResult.success || scrapeResult.sizeChart.rows.length === 0) {
      return res.json({
        success: false,
        error: 'Could not extract size chart from the URL',
        scrapeResult,
        recommendation: null,
      });
    }

    // Step 2: Get recommendation
    const recommendation = await getSizeRecommendation(measurements, scrapeResult.sizeChart);

    res.json({
      success: true,
      scrapeResult,
      recommendation,
    });
  } catch (error) {
    console.error('Analysis endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 ShoFit Scraper running on http://localhost:${PORT}`);
  console.log(`   - Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured'}`);
});

export default app;
