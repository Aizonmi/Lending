# 🔧 Fix MongoDB Authentication Error

## Current Issue

The MongoDB connection is failing because the password placeholder `<db_password>` is still in your `.env` files.

## Steps to Fix

### 1. Update Password in .env Files

You need to edit these three files in the `.env` folder:
- `MemberA.env`
- `MemberB.env`
- `MemberC.env`

### 2. Replace the Password

Each file currently has:
```
MONGODB_URI=mongodb+srv://zervic:<db_password>@cluster0.v8zubag.mongodb.net/lendify?retryWrites=true&w=majority
```

**Replace `<db_password>` with your actual MongoDB Atlas password.**

Example (if your password is `MyPass123`):
```
MONGODB_URI=mongodb+srv://zervic:MyPass123@cluster0.v8zubag.mongodb.net/lendify?retryWrites=true&w=majority
```

### 3. Password with Special Characters

If your password contains special characters (like `@`, `#`, `$`, etc.), you need to **URL encode** them:

- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`
- `/` becomes `%2F`
- `:` becomes `%3A`
- `?` becomes `%3F`
- `&` becomes `%26`
- `=` becomes `%3D`
- `%` becomes `%25`
- ` ` (space) becomes `%20`

### 4. Verify All Three Files

Make sure all three `.env` files have the correct password (not `<db_password>`).

### 5. Restart the Services

After updating the password, stop the current process (Ctrl+C) and run:

```bash
npm start
```

The startup script will automatically copy the updated `.env` files to each backend folder.

## Quick Fix Command

If you know your password, you can update all three files at once using PowerShell:

```powershell
$password = "YOUR_ACTUAL_PASSWORD"
$encodedPassword = [System.Web.HttpUtility]::UrlEncode($password)
$uri = "mongodb+srv://zervic:$encodedPassword@cluster0.v8zubag.mongodb.net/lendify?retryWrites=true&w=majority"

Set-Content -Path ".env\MemberA.env" -Value "PORT=5000`nMONGODB_URI=$uri`nNODE_ENV=development"
Set-Content -Path ".env\MemberB.env" -Value "PORT=5001`nMONGODB_URI=$uri`nNODE_ENV=development"
Set-Content -Path ".env\MemberC.env" -Value "PORT=5002`nMONGODB_URI=$uri`nNODE_ENV=development"
```

Replace `YOUR_ACTUAL_PASSWORD` with your real password.

## Still Having Issues?

1. **Check MongoDB Atlas**: Make sure your IP address is whitelisted in MongoDB Atlas
2. **Verify Username**: Ensure the username `zervic` is correct
3. **Check Database Name**: The database name should be `lendify` (or create it if it doesn't exist)
4. **Test Connection**: Try connecting with MongoDB Compass or another tool first

