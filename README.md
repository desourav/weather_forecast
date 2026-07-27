# Weather Forecast Dashboard

A full-screen Next.js dashboard showing weekly weather, current conditions, top news, a markets panel, and a live S&P 500 ticker.

---

## Prerequisites

| Requirement | Minimum version | Notes |
|---|---|---|
| Node.js | 18.18.0 | LTS; available on Raspberry Pi OS Bookworm |
| npm | 9.0.0 | Bundled with Node 18 |

---

## Quick start (any platform)

```bash
# 1. Install dependencies
npm install

# 2. Copy the env template and fill in your API keys
cp .env.example .env.local
nano .env.local          # add FINNHUB_API_KEY and NYT_API_KEY

# 3. Run in development mode
npm run dev

# 4. Or build and run in production mode
npm run build
npm run start
```

The app listens on **http://localhost:3000** by default.

---

## Running with inline environment variables (no .env.local)

```bash
# Development
FINNHUB_API_KEY=your_finnhub_key NYT_API_KEY=your_nyt_key npm run dev

# Production
FINNHUB_API_KEY=your_finnhub_key NYT_API_KEY=your_nyt_key npm run build
FINNHUB_API_KEY=your_finnhub_key NYT_API_KEY=your_nyt_key npm run start
```

---

## Raspberry Pi setup (Debian / Raspberry Pi OS)

Tested on **Raspberry Pi 4 / 5** running **Raspberry Pi OS Bookworm (64-bit)**.

### 1 — Install Node.js 18 LTS via nvm

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Reload shell
source ~/.bashrc

# Install the exact Node version this project requires
nvm install        # reads .nvmrc automatically (18.20.8)
nvm use
```

> **No nvm?** Install Node directly from NodeSource:
> ```bash
> curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
> sudo apt-get install -y nodejs
> ```

### 2 — Clone and install

```bash
git clone <your-repo-url> weather_forecast
cd weather_forecast
npm install
```

### 3 — Configure environment

```bash
cp .env.example .env.local
nano .env.local
```

Add your keys:

```
FINNHUB_API_KEY=your_finnhub_key
NYT_API_KEY=your_nyt_key
```

### 4 — Build and start

```bash
npm run build
npm run start
```

### 5 — Auto-start on boot with systemd

Create the service file:

```bash
sudo nano /etc/systemd/system/weather-dashboard.service
```

Paste (adjust `User`, `WorkingDirectory`, and key values):

```ini
[Unit]
Description=Weather Forecast Dashboard
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/weather_forecast
Environment=NODE_ENV=production
EnvironmentFile=/home/pi/weather_forecast/.env.local
ExecStart=/home/pi/.nvm/versions/node/v18.20.8/bin/node node_modules/.bin/next start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable weather-dashboard
sudo systemctl start weather-dashboard
sudo systemctl status weather-dashboard
```

### 6 — Open browser in kiosk mode on boot (optional)

For a wall-display / info-board setup, add this to `~/.config/lxsession/LXDE-pi/autostart`:

```
@chromium-browser --kiosk --noerrdialogs --disable-infobars http://localhost:3000
```

---

## API keys

| Key | Where to get it |
|---|---|
| `FINNHUB_API_KEY` | [finnhub.io](https://finnhub.io) — free tier, 60 req/min |
| `NYT_API_KEY` | [developer.nytimes.com](https://developer.nytimes.com) — free tier |
