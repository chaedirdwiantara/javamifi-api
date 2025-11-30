# Supabase Database Setup Guide

## Step-by-Step Instructions

### 1. Access Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Create a new project OR select your existing project

### 2. Get Your Credentials

From your Supabase project dashboard:

1. Click on **Settings** (gear icon) in the sidebar
2. Click on **API**
3. Copy the following values:

   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

### 3. Execute Database Schema

1. In Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **New Query**
3. Copy the entire contents of `database/schema.sql`
4. Paste it into the SQL editor
5. Click **Run** or press `Ctrl/Cmd + Enter`

### 4. Verify Database Setup

After running the schema, you should see:
- ✅ 4 tables created: `categories`, `products`, `orders`, `order_items`
- ✅ Sample data inserted (3 categories, 4 products)

You can verify by clicking **Table Editor** in the sidebar and checking each table.

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJ...your-anon-key
   SUPABASE_SERVICE_KEY=eyJ...your-service-role-key
   ```

3. Add your Midtrans keys (same as mobile app):
   ```env
   MIDTRANS_SERVER_KEY=SB-Mid-server-your-key
   MIDTRANS_CLIENT_KEY=SB-Mid-client-your-key
   MIDTRANS_IS_PRODUCTION=false
   ```

### 6. Test Connection

Run the development server:
```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server is running on port 3000
```

### 7. Test API Endpoints

Open your browser or use curl:
```bash
# Health check
curl http://localhost:3000/health

# Get categories
curl http://localhost:3000/api/v1/categories

# Get products
curl http://localhost:3000/api/v1/products
```

## Troubleshooting

### Connection Failed
- Check if `SUPABASE_URL` is correct
- Verify that `SUPABASE_SERVICE_KEY` is the **service_role** key, not anon key

### No Data Returned
- Make sure you ran the `schema.sql` file completely
- Check Supabase Table Editor to verify data exists

### CORS Errors (from Mobile App)
- Ensure `ALLOWED_ORIGINS` includes your React Native Metro URL
- Default: `http://localhost:8081`

## Next Steps

Once database setup is complete, proceed to connect your mobile app to this API by updating the mobile app's API endpoints.
