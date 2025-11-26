# Lendify - Integrated Lending Platform

A fully integrated lending platform system combining all three sub-systems into one unified application.

## Project Structure

```
Lendify/
├── frontend/              # Combined Frontend (Integrated all systems)
├── Member A/
│   └── backend/          # Catalog & Member Profiles API
├── Member B/
│   └── backend/          # Lending & Return Logic API
├── Member C/
│   └── backend/          # Dashboard & Reporting API
├── .env/                 # Environment variables folder (create .env files here)
├── scripts/              # Startup scripts
├── package.json          # Root package.json for easy startup
└── README.md
```

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- npm

### One-Command Setup

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Configure environment variables:**
   - Go to the `.env` folder
   - Copy `MemberA.env.example` → `MemberA.env`
   - Copy `MemberB.env.example` → `MemberB.env`
   - Copy `MemberC.env.example` → `MemberC.env`
   - **Update the `MONGODB_URI` in each file with your MongoDB connection string**
   - All three must use the same database!

3. **Start everything with one command:**
   ```bash
   npm start
   ```
   
   Or for development mode (with auto-reload):
   ```bash
   npm run start:dev
   ```

   **Windows users can also use:**
   ```powershell
   .\scripts\start-all.ps1
   ```
   
   Or double-click:
   ```batch
   scripts\start-all.bat
   ```

### What Gets Started

The startup script automatically starts:
- ✅ Member A Backend (Port 5000) - Catalog & Member Profiles
- ✅ Member B Backend (Port 5001) - Lending & Return Logic
- ✅ Member C Backend (Port 5002) - Dashboard & Reporting
- ✅ Frontend (Port 3000) - Integrated React App

### Access the Application

Once started, open your browser and navigate to:
- **Frontend**: http://localhost:3000

## Environment Configuration

### .env Folder Structure

Create `.env` files in the `.env` folder with these names:
- `MemberA.env` - For Member A backend
- `MemberB.env` - For Member B backend
- `MemberC.env` - For Member C backend

### Example .env File

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lendify
NODE_ENV=development
```

**Important:** All three backends must use the **same MongoDB database** (`lendify` in the example above).

## Integrated Frontend

The combined frontend includes all three systems in one unified interface:

### 📚 Catalog & Members (Member A)
- Add/view members
- Add/view items
- Item ownership tracking

### 🔄 Lending & Returns (Member B)
- Borrow available items
- Return borrowed items
- Loan history

### 📊 Dashboard & Reports (Member C)
- Statistics overview
- Current borrows with overdue alerts
- Loan history with filters
- Analytics charts

## Manual Setup (Alternative)

If you prefer to set up each service individually:

### Member A Backend
```bash
cd "Member A/backend"
npm install
# Copy .env from .env/MemberA.env
npm start
```

### Member B Backend
```bash
cd "Member B/backend"
npm install
# Copy .env from .env/MemberB.env
npm start
```

### Member C Backend
```bash
cd "Member C/backend"
npm install
# Copy .env from .env/MemberC.env
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## API Endpoints

All APIs are integrated and accessible from the unified frontend:

### Member A (Port 5000)
- `POST /api/members` - Create member
- `GET /api/members` - List members
- `POST /api/items` - Create item
- `GET /api/items` - List items

### Member B (Port 5001)
- `POST /api/loans/borrow` - Borrow item
- `POST /api/loans/return` - Return item
- `GET /api/loans` - List loans

### Member C (Port 5002)
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/overdue` - Overdue items
- `GET /api/loans/history` - Loan history

## Stopping Services

Press `Ctrl+C` in the terminal where you ran `npm start` to stop all services.

For Windows batch file, close the individual command windows.

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check that `MONGODB_URI` in all `.env` files points to the same database
- Verify MongoDB is accessible from your machine

### Port Already in Use
- Check if ports 5000, 5001, 5002, or 3000 are already in use
- Stop other services using those ports or change PORT in `.env` files

### Frontend Can't Connect to Backends
- Ensure all three backends are running
- Check API URLs in `frontend/src/services/api.js` match your backend ports
- Verify CORS is enabled in all backends (already configured)

### Environment Variables Not Loading
- Ensure `.env` files are created in the `.env` folder
- Check that files are named correctly: `MemberA.env`, `MemberB.env`, `MemberC.env`
- The startup script automatically copies them to backend folders

## Development Mode

For development with auto-reload:
```bash
npm run start:dev
```

This starts all backends in development mode (with nodemon).

## Individual Service Commands

You can also start services individually:

```bash
npm run backend:a    # Start Member A backend only
npm run backend:b    # Start Member B backend only
npm run backend:c    # Start Member C backend only
npm run frontend     # Start frontend only

# Development mode
npm run dev:a        # Member A with nodemon
npm run dev:b        # Member B with nodemon
npm run dev:c        # Member C with nodemon
```

## Testing

Each backend has its own test suite:

```bash
# Member A
cd "Member A/backend"
npm test

# Member B
cd "Member B/backend"
npm test

# Member C
cd "Member C/backend"
npm test
```

## Documentation

Each member folder contains detailed README files:
- `Member A/README.md` - Catalog & Member Profiles documentation
- `Member B/README.md` - Lending & Return Logic documentation
- `Member C/README.md` - Dashboard & Reporting documentation

## Features

✅ **Fully Integrated**: All three systems work together seamlessly  
✅ **Single Command Startup**: Start everything with `npm start`  
✅ **Unified Frontend**: One React app combining all functionality  
✅ **Shared Database**: All systems use the same MongoDB database  
✅ **Real-time Updates**: Automatic refresh and notifications  
✅ **Overdue Detection**: Automatic alerts for overdue items  

## Next Steps

1. ✅ Set up environment variables in `.env` folder
2. ✅ Install dependencies: `npm run install:all`
3. ✅ Start everything: `npm start`
4. ✅ Open http://localhost:3000 in your browser
5. ✅ Start using the integrated platform!

## License

ISC

---

**Happy Lending! 📚🔄📊**
