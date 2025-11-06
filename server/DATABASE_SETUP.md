# Database Setup Guide

## Option 1: Managed Database (Easiest - Recommended)

### Using Supabase (Free PostgreSQL)

1. **Sign up for Supabase**
   - Go to https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub or email (free tier available)

2. **Create a new project**
   - Click "New Project"
   - Name: `chicago-compass` (or any name)
   - Database Password: Create a strong password (save this!)
   - Region: Choose closest to you
   - Click "Create new project"
   - Wait 2-3 minutes for setup

3. **Get your connection string**
   - Go to Project Settings (gear icon in left sidebar)
   - Click "Database" in the settings menu
   - Scroll to "Connection string"
   - Copy the "URI" connection string
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

4. **Update your .env file**
   - Open `server/.env`
   - Replace `[YOUR-PASSWORD]` in the connection string with your actual password
   - Your DATABASE_URL should look like:
     ```
     DATABASE_URL="postgresql://postgres:your-actual-password@db.xxxxx.supabase.co:5432/postgres"
     ```

### Using Neon (Serverless PostgreSQL - Also Easy)

1. **Sign up for Neon**
   - Go to https://neon.tech
   - Click "Sign Up" (free tier available)
   - Sign up with GitHub or email

2. **Create a new project**
   - Click "Create a project"
   - Name: `chicago-compass`
   - Region: Choose closest
   - Click "Create project"

3. **Get your connection string**
   - After project creation, you'll see a connection string
   - Click "Copy" next to it
   - It looks like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

4. **Update your .env file**
   ```
   DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

### Using Railway (Easy, Good for Deployment)

1. **Sign up for Railway**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create PostgreSQL database**
   - Click "New Project"
   - Select "Provision PostgreSQL"
   - Wait for it to provision

3. **Get connection string**
   - Click on the PostgreSQL service
   - Go to "Variables" tab
   - Copy the `DATABASE_URL` value

4. **Update your .env file**
   ```
   DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
   ```

---

## Option 2: Local PostgreSQL Installation

### Windows Installation

1. **Download PostgreSQL**
   - Go to https://www.postgresql.org/download/windows/
   - Or use the installer: https://www.postgresql.org/download/windows/installer/
   - Download the latest version (14+)

2. **Install PostgreSQL**
   - Run the installer
   - During installation:
     - Remember the password you set for the `postgres` user (this is important!)
     - Port: 5432 (default)
     - Locale: Default or English
   - Complete the installation

3. **Verify Installation**
   - Open "pgAdmin" (installed with PostgreSQL)
   - Or use command line:
     ```bash
     psql --version
     ```

4. **Create Database**
   - Open pgAdmin
   - Connect to your local server (use the password you set)
   - Right-click "Databases" → "Create" → "Database"
   - Name: `chicago_compass`
   - Click "Save"

   **OR use command line:**
   ```bash
   # Open Command Prompt or PowerShell
   psql -U postgres
   # Enter your password when prompted
   CREATE DATABASE chicago_compass;
   \q
   ```

5. **Get Connection String**
   - Format: `postgresql://username:password@localhost:5432/database_name`
   - Example:
     ```
     DATABASE_URL="postgresql://postgres:your-password@localhost:5432/chicago_compass"
     ```
   - Replace `your-password` with the password you set during installation

6. **Update your .env file**
   ```
   DATABASE_URL="postgresql://postgres:your-password@localhost:5432/chicago_compass"
   ```

---

## After Setting Up Database

Once you have your DATABASE_URL in the `.env` file:

1. **Generate Prisma Client**
   ```bash
   cd server
   npm run db:generate
   ```

2. **Run Migrations**
   ```bash
   npm run db:migrate
   ```
   - This will create all the tables in your database
   - You'll be prompted to name the migration (just press Enter for default)

3. **Seed Database (Create Admin Account)**
   ```bash
   npm run db:seed
   ```
   - This creates the initial admin account
   - Default credentials:
     - Email: `admin@compass.chicago`
     - Password: `admin123`

4. **Verify It Works**
   ```bash
   npm run db:studio
   ```
   - This opens Prisma Studio in your browser
   - You should see your tables and the admin account

---

## Troubleshooting

### Connection Error
- **Check your password**: Make sure the password in the connection string is correct
- **Check the URL format**: Should start with `postgresql://` not `postgres://`
- **For managed services**: Make sure you're using the correct connection string from their dashboard
- **For local**: Make sure PostgreSQL service is running (Windows Services)

### Port Already in Use
- If port 5432 is in use, you can change it in PostgreSQL config or use a different port
- Update connection string: `postgresql://user:pass@localhost:5433/database`

### Cannot Find psql Command
- Add PostgreSQL bin directory to your PATH
- Or use pgAdmin instead
- Or use a managed service (easier!)

---

## Recommended: Start with Supabase

**Supabase is the easiest option because:**
- ✅ Free tier
- ✅ No installation needed
- ✅ Web-based database viewer
- ✅ Automatic backups
- ✅ Easy to get connection string
- ✅ Works on any OS

Just sign up, create a project, copy the connection string, and you're done!

