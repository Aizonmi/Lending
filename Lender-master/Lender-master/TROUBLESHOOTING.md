# 🔧 Troubleshooting MongoDB Connection Issues

## Common Error: `buffering timed out after 10000ms`

This error means MongoDB couldn't establish a connection within 10 seconds. Here are the most common causes and solutions:

## 1. ✅ Check MongoDB Password

**Most Common Issue**: The password in your `.env` files is incorrect or still has the placeholder.

### Fix:
Run this command to update your password:
```bash
npm run update:password
```

Or manually edit `.env/MemberA.env`, `.env/MemberB.env`, and `.env/MemberC.env`:
- Replace `<db_password>` with your actual MongoDB Atlas password
- If your password has special characters (like `@`, `#`, `$`), they need to be URL-encoded

## 2. ✅ Check IP Whitelist in MongoDB Atlas

**Your IP must be whitelisted** in MongoDB Atlas Network Access.

### Steps:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click on **Network Access** in the left sidebar
3. Click **Add IP Address**
4. Either:
   - Click **Add Current IP Address** (easiest)
   - Or add `0.0.0.0/0` to allow all IPs (⚠️ less secure, but good for testing)

### Wait Time:
- Changes can take up to 2-3 minutes to propagate
- Wait a few minutes after adding your IP before trying again

## 3. ✅ Verify Connection String Format

Your connection string should look like:
```
mongodb+srv://zervic:YOUR_PASSWORD@cluster0.v8zubag.mongodb.net/lendify?retryWrites=true&w=majority
```

**Important parts:**
- `zervic` - your username
- `YOUR_PASSWORD` - your actual password (not `<db_password>`)
- `cluster0.v8zubag.mongodb.net` - your cluster address
- `lendify` - database name

## 4. ✅ Test Connection Manually

You can test your connection string using MongoDB Compass or a simple Node.js script:

```javascript
const mongoose = require('mongoose');
mongoose.connect('YOUR_CONNECTION_STRING')
  .then(() => console.log('Connected!'))
  .catch(err => console.error('Error:', err));
```

## 5. ✅ Check Firewall/Network

- If you're on a corporate network, it might block MongoDB Atlas
- Try from a different network (mobile hotspot) to test
- Some VPNs can cause connection issues

## 6. ✅ Verify Database Exists

The database name in your connection string should match an existing database (or MongoDB will create it on first write).

## 7. ✅ Increase Timeout (Already Done)

I've already updated the timeout to 30 seconds in all server files. If it still times out:
- Check your internet connection speed
- Try again - sometimes it's a temporary network issue

## Quick Checklist

Before running `npm start`, make sure:

- [ ] Password is updated in all three `.env` files (not `<db_password>`)
- [ ] Your IP is whitelisted in MongoDB Atlas
- [ ] Connection string format is correct
- [ ] You have internet connectivity
- [ ] You've waited 2-3 minutes after updating IP whitelist

## Still Having Issues?

1. **Check the actual error message** - it often gives clues
2. **Verify credentials** - double-check username and password in MongoDB Atlas
3. **Try MongoDB Compass** - test connection outside the app
4. **Check Atlas status** - ensure your cluster is running

## Need to Update Password?

Run: `npm run update:password`

This will prompt you for your password and update all three `.env` files automatically.

