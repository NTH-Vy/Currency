# Currency Rate System Setup Guide

This document explains how to set up and use the automated currency rate system with real-time data from multiple APIs.

## Overview

The system fetches exchange rates from multiple sources:
- **Fiat currencies**: Fixer.io (USD, EUR, GBP, JPY, VND, etc.)
- **Crypto currencies**: CoinGecko (BTC, ETH, etc.)
- **Crypto prices**: Binance API (real-time bid/ask prices)

Rates are automatically updated every 5 minutes via Laravel scheduler and stored in the database for historical analysis.

## Backend Setup

### 1. Database Migrations

Run the migrations to update the database schema:

```bash
cd backend
php artisan migrate
```

This will:
- Add crypto support to the `currencies` table
- Add rate sources and bid/ask prices to `exchangerates` table
- Insert default crypto currencies (BTC, ETH) and additional fiat currencies (JPY, GBP)

### 2. Configure API Keys

Add the following API keys to your `.env` file:

```env
EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key_here
FIXER_API_KEY=your_fixer_api_key_here
COINGECKO_API_KEY=your_coingecko_api_key_here
```

**API Key Sources:**
- **ExchangeRate-API.com**: Get free key at https://www.exchangerate-api.com/
- **Fixer.io**: Get free key at https://fixer.io/
- **CoinGecko**: Free tier (no API key required for basic usage)

### 3. Test the Rate Fetch Command

Manually run the rate fetch command to test API connections:

```bash
php artisan rates:fetch
```

This will:
- Fetch fiat rates from Fixer.io
- Fetch crypto rates from CoinGecko
- Fetch crypto prices from Binance
- Store current rates in `exchangerates` table
- Store historical data in `exchangeratehistory` table

### 4. Set Up the Scheduler

The Laravel scheduler is already configured in `app/Console/Kernel.php` to run the rate fetch command every 5 minutes.

To enable the scheduler, add the following cron job to your server:

```bash
* * * * * cd /path-to-your-project/backend && php artisan schedule:run >> /dev/null 2>&1
```

For local development, you can run the scheduler manually:

```bash
php artisan schedule:work
```

## API Endpoints

The following public API endpoints are available (no authentication required):

### Get Current Rates
```
GET /api/rates/current
```
Optional query parameter: `pairs[]` - array of currency pairs (e.g., `USD/VND`, `BTC/USD`)

### Get Historical Rates
```
GET /api/rates/historical?base=USD&target=VND&period=24h
```
Parameters:
- `base`: Base currency code (required)
- `target`: Target currency code (required)
- `period`: Time period - `1h`, `24h`, `7d`, `30d` (default: `24h`)

### Get Market Matrix
```
GET /api/rates/market-matrix
```
Returns popular currency pairs for the Global Markets Matrix display.

### Get Available Currencies
```
GET /api/currencies
```
Returns list of all active currencies with their symbols and types.

## Frontend Integration

The frontend components are already configured to use the new API:

### 1. Header Ticker
- Location: `frontend/components/layout/header.tsx`
- Fetches market matrix data every 30 seconds
- Displays scrolling ticker with real-time rates

### 2. Global Markets Matrix
- Location: `frontend/app/page.tsx`
- Fetches market matrix data every 30 seconds
- Displays 4 popular currency pairs with trends

### 3. Instant Swap
- Location: `frontend/app/page.tsx`
- Uses database rates first, falls back to external API
- Dynamically loads available currencies from API

### 4. Historical Charts
- Location: `frontend/app/page.tsx`
- Fetches historical data for USD/VND every 60 seconds
- Displays line chart with rate history

## Database Schema

### currencies Table
- `currency_code`: Primary key (e.g., USD, BTC)
- `currency_name`: Full name
- `symbol`: Currency symbol (e.g., $, ₿)
- `type`: 'fiat' or 'crypto'
- `api_source`: API to fetch from (fixer, coingecko, binance)
- `api_symbol`: Symbol used in API calls
- `is_active`: Whether currency is active
- `min_amount`: Minimum amount for conversion
- `max_amount`: Maximum amount for conversion

### exchangerates Table
- `rate_id`: Primary key
- `base_currency`: Base currency code
- `target_currency`: Target currency code
- `exchange_rate`: Current exchange rate
- `source`: API source (fixer, coingecko, binance)
- `bid_price`: Bid price (for crypto)
- `ask_price`: Ask price (for crypto)
- `change_24h`: 24-hour change percentage
- `last_updated`: Timestamp of last update

### exchangeratehistory Table
- `history_id`: Primary key
- `base_currency`: Base currency code
- `target_currency`: Target currency code
- `rate_value`: Historical rate value
- `recorded_at`: Timestamp when rate was recorded

## Adding New Currencies

To add a new currency:

1. Insert into the `currencies` table:
```php
DB::table('currencies')->insert([
    'currency_code' => 'ETH',
    'currency_name' => 'Ethereum',
    'symbol' => 'Ξ',
    'type' => 'crypto',
    'api_source' => 'coingecko',
    'api_symbol' => 'ethereum',
    'is_active' => 1,
]);
```

2. Run the rate fetch command to populate rates:
```bash
php artisan rates:fetch
```

## Troubleshooting

### Rates not updating
- Check API keys in `.env` file
- Verify API endpoints are accessible
- Check Laravel scheduler logs: `storage/logs/rates-fetch.log`
- Run `php artisan rates:fetch` manually to test

### Frontend not showing data
- Verify backend API is running on `http://127.0.0.1:8000`
- Check browser console for API errors
- Verify CORS settings if frontend and backend are on different domains

### Historical data missing
- Ensure the rate fetch command has run at least once
- Check that `exchangeratehistory` table is being populated
- Historical data is automatically cleaned after 30 days

## Rate Limits

- **Fixer.io**: Free tier: 1,000 requests/month
- **CoinGecko**: Free tier: ~10-50 requests/minute
- **Binance**: No rate limit for public endpoints

The system fetches rates every 5 minutes (288 times/day), which is well within free tier limits.

## Security Notes

- API keys are stored in `.env` file (not committed to git)
- Rate endpoints are public (no authentication required)
- Conversion endpoints require authentication via Sanctum tokens
- Historical data is automatically cleaned after 30 days to prevent database bloat
