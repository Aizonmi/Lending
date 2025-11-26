# 🚀 Quick Start Guide - Run the Lendify Web App

## ⚠️ Important First Step

**Replace `<db_password>` in your .env files with your actual MongoDB password!**

Edit these files in the `.env` folder:
- `MemberA.env`
- `MemberB.env`  
- `MemberC.env`

Change this line:
```
MONGODB_URI=mongodb+srv://zervic:<db_password>@cluster0.v8zubag.mongodb.net/lendify?retryWrites=true&w=majority
```

To (replace YOUR_PASSWORD with your actual MongoDB password):
```
MONGODB_URI=mongodb+srv://zervic:YOUR_PASSWORD@cluster0.v8zubag.mongodb.net/lendify?retryWrites=true&w=majority
```

## Steps to Run the Web App

### Step 1: Install Dependencies

Open PowerShell or Command Prompt in the project root and run:

```bash
npm run install:all
```

This will install dependencies for:
- Member A Backend
- Member B Backend
- Member C Backend
- Frontend

**Wait for this to complete** (may take a few minutes)

### Step 2: Start All Services

Run this single command:

```bash
npm start
```

This will automatically:
- ✅ Copy .env files to each backend folder
- ✅ Start Member A Backend (Port 5000)
- ✅ Start Member B Backend (Port 5001)
- ✅ Start Member C Backend (Port 5002)
- ✅ Start Frontend (Port 3000)

### Step 3: Access the Web App

Once all services are running, open your browser and go to:

**http://localhost:3000**

You should see the integrated Lendify platform!

## What You'll See

The integrated frontend has three main sections:

1. **📚 Catalog & Members** - Add members and items
2. **🔄 Lending & Returns** - Borrow and return items
3. **📊 Dashboard & Reports** - View statistics and analytics

## Stopping the App

Press `Ctrl+C` in the terminal where you ran `npm start` to stop all services.

## Troubleshooting

### MongoDB Connection Error
- Make sure you replaced `<db_password>` with your actual password
- Check your MongoDB Atlas connection settings
- Ensure your IP is whitelisted in MongoDB Atlas

### Port Already in Use
- Close other applications using ports 5000, 5001, 5002, or 3000
- Or change PORT in the .env files

### Dependencies Not Installed
- Run `npm run install:all` again
- Make sure Node.js is installed (v14 or higher)

### Services Won't Start
- Check that all .env files exist in the `.env` folder
- Verify the MongoDB URI is correct
- Check the console output for specific error messages

## Development Mode

For auto-reload during development:

```bash
npm run start:dev
```

## Need Help?

Check the main README.md for detailed documentation on each system.

