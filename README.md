# Phitien — Prediction Markets

A prediction markets app built for the KTP Hackathon. Bet points on real world events across categories like Horse Racing, Sports, Finance, Crypto, and more. Kentucky Derby / Wild West themed.

---

## Setup (first time only)

You need Node.js installed. If you don't have it, download nvm-windows from https://github.com/coreybutler/nvm-windows/releases/latest, run the installer, then in PowerShell as Administrator:

```powershell
nvm install lts
nvm use lts
```

Then install dependencies:

```powershell
cd path\to\Phitien\backend
npm install

cd path\to\Phitien\frontend
npm install
```

---

## Running the App

You need two PowerShell windows open at the same time.

**Window 1 — Backend:**
```powershell
cd "$env:OneDrive\Hackathon\VSCode\Phitien\backend"
node src/server.js
```

**Window 2 — Frontend:**
```powershell
cd "$env:OneDrive\Hackathon\VSCode\Phitien\frontend"
npm start
```

Then go to **http://localhost:3000** in your browser. Both windows need to stay open while you're using the app.

---

## Adding Markets Manually

Open `backend/src/data/markets.json` and copy an existing entry. Change the fields to your new market:

```json
{
  "id": 999,
  "title": "Will X happen by Y date?",
  "category": "Sports",
  "yesProb": 60,
  "volume": 50000,
  "resolved": false,
  "outcome": null
}
```

Valid categories: `Finance`, `Crypto`, `Sports`, `Tech`, `Politics`, `Economy`, `Entertainment`, `Science`, `HorseRacing`

After saving, restart the backend with `Ctrl+C` then `node src/server.js`.

---

## AI Market Generator

Paste an Anthropic API key (get one free at https://console.anthropic.com) into the header and click Connect AI. Then type any topic in the generator bar and click Generate Markets — Claude will search the web and create fresh markets automatically.

---

## Common Issues

**npm not found in VS Code terminal** — Switch the terminal to PowerShell: `Ctrl+Shift+P` → "Terminal: Select Default Profile" → PowerShell.

**Page loads but no markets show** — Make sure the backend is still running in the other window.

**Scripts disabled error** — Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` in PowerShell as Administrator.
