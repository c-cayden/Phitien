# Phitien

Phitien is a hackathon-built prediction market app where users trade on future events, track positions, and generate new markets from live topics with AI.

## Built With

- JavaScript
- React
- Node.js
- Express
- JSON local storage
- Anthropic API

## Project Structure

```text
Phitien/
  backend/
    src/
      data/
      routes/
      server.js
  frontend/
    src/
      components/
      context/
      pages/
```

### Prerequisites

- Node.js 18 or newer
- npm

Node 18+ is recommended because the backend uses the built-in `fetch` API.

### Install

```powershell
cd Phitien\backend
npm install

cd ..\frontend
npm install
```

### Run The App

Use two terminals.

Terminal 1:

```powershell
cd Phitien\backend
node src/server.js
```

Terminal 2:

```powershell
cd Phitien\frontend
npm start
```

Then open `http://localhost:3000`.

## AI Market Generator

Enter an Anthropic API key in the header, connect it, then type a topic in the generator form. Phitien will request new prediction markets grounded in current news and append them to the existing market list.

## Notes

- Edit files in `frontend/src` and `backend/src`, not in `frontend/build`
- The `build` folder is generated output from `npm run build`
- Market and user data are stored in `backend/src/data/*.json`
