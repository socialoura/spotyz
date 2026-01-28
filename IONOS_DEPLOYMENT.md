# Deploying to IONOS Hosting (French Interface)

## Prerequisites
- IONOS hosting account with Node.js support
- Domain: socialoura.com (already purchased)
- MySQL database access on IONOS

## Step 1: Set Up MySQL Database on IONOS

1. **Log in to IONOS Control Panel**
   - Go to https://my.ionos.fr/ 
   
   - Click **"Connexion"** and enter your credentials
 
2. **Create a MySQL Database**
   - Navigate to: **Hébergement** → **Votre offre** → **Bases de données & Espace Web**
   - Click **"Créer une base de données"**
   - Database Type: **MySQL**
   - Database Name: `socialoura` (or your choice)
   - Create a database user and password
   - **Save these credentials!** You'll need them later:
     - Database Host (usually: `dbxxxxxxx.db.ionos.com`)
     - Database Name
     - Database User
     - Database Password

3. **Access phpMyAdmin** (optional, for managing database)
   - In IONOS control panel, click **"Administrer"** next to your database
   - This opens phpMyAdmin where you can view/manage your database

## Step 2: Prepare Your Application

1. **Update your local `.env.local` file for testing:**
   ```bash
   # Add these to .env.local (don't commit this file!)
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=socialoura
   ```

2. **Create a production environment file `.env.production`:**
   ```bash
   # DO NOT commit this file - add to .gitignore
   DB_HOST=your-ionos-db-host.db.ionos.com
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=socialoura
   
   STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=249627fbee4335f842d8f90df936654955b9f1263e9aa76614be57875f6af6f521ae9a17ed24ebce7753ad79513eed5992c1274bf093d0922cb48a77c588c05b
   ```

## Step 3: Build Your Application

1. **Build the Next.js application:**
   ```bash
   npm run build
   ```

   This creates a `.next` folder with your production build.

2. **Test the production build locally:**
   ```bash
   npm start
   ```
   Visit http://localhost:3000 to verify everything works.

## Step 4: Deploy to IONOS

### Option A: Deploy via FTP/SFTP (Most Common)

1. **Get your IONOS FTP credentials:**
   - IONOS Control Panel → **Hébergement** → **Accès FTP**
   - Note down:
     - FTP Host: `ftp.yourdomain.com` or provided by IONOS
     - Username (Nom d'utilisateur)
     - Password (Mot de passe)
     - Port: 21 (FTP) or 22 (SFTP - recommended)

2. **Connect using an FTP client (FileZilla recommended):**
   - Download FileZilla: https://filezilla-project.org/
   - Hôte (Host): Your FTP host
   - Nom d'utilisateur (Username): Your FTP username
   - Mot de passe (Password): Your FTP password
   - Port: 22 (for SFTP) or 21 (for FTP)
   - Click **"Connexion rapide"**

3. **Upload files to IONOS:**
   - Navigate to your web root directory (usually `/` or `/html` or `/public_html`)
   - Upload these folders/files:
     ```
     .next/              (entire folder)
     public/             (entire folder)
     node_modules/       (entire folder - or run npm install on server)
     src/                (entire folder)
     package.json
     package-lock.json
     next.config.mjs
     tsconfig.json
     .env.production     (rename to .env on server)
     ```

4. **Configure Node.js on IONOS:**
   - IONOS Control Panel → **Hébergement** → **Node.js**
   - Enable Node.js (Activer Node.js)
   - Set Node.js version: **18.x or 20.x** (Latest LTS)
   - Entry point: Set to custom command (Commande personnalisée)
   - Start command (Commande de démarrage): `npm start` or `node_modules/.bin/next start`
   - Port: Use the port assigned by IONOS (usually 3000 or check their docs)

### Option B: Deploy via Git (If IONOS supports it)

1. **Check if IONOS supports Git deployment:**
   - IONOS Control Panel → **Hébergement** → **Déploiement Git**

2. **Connect your GitHub repository:**
   - Add your repository URL (URL du dépôt)
   - Set branch to `main` (Branche)
   - Build command (Commande de build): `npm install && npm run build`
   - Start command (Commande de démarrage): `npm start`

## Step 5: Configure Domain Settings

1. **Point your domain to the hosting:**
   - IONOS Control Panel → **Domaines** → **socialoura.com**
   - If hosting and domain are both on IONOS, they should auto-connect
   - Otherwise, update DNS records (Enregistrements DNS):
     - A Record: Point to your hosting IP address
     - CNAME: www → socialoura.com

2. **Enable SSL Certificate:**
   - IONOS Control Panel → **Hébergement** → **Certificat SSL**
   - Choose **Let's Encrypt (Gratuit)**
   - Enable SSL for socialoura.com and www.socialoura.com
   - Click **"Activer SSL"**

3. **Force HTTPS redirect:**
   - Create/edit `.htaccess` file in your web root:
     ```apache
     RewriteEngine On
     RewriteCond %{HTTPS} off
     RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
     ```

## Step 6: Set Environment Variables on IONOS

1. **In IONOS Control Panel:**
   - Navigate to **Hébergement** → **Variables d'environnement**
   - Add each variable (Ajouter une variable):
     - `DB_HOST` = your database host
     - `DB_USER` = your database user
     - `DB_PASSWORD` = your database password
     - `DB_NAME` = socialoura
     - `STRIPE_SECRET_KEY` = your Stripe key
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = your Stripe public key
     - `ADMIN_USERNAME` = admin
     - `ADMIN_PASSWORD` = your hashed password

2. **Alternative: Upload .env file:**
   - If IONOS doesn't have environment variable UI
   - Upload your `.env.production` file
   - Rename it to `.env` on the server
   - Make sure it's in the root directory with package.json

## Step 7: Start the Application

1. **SSH into your IONOS server** (if available):
   ```bash
   ssh your_username@your_server.ionos.com
   ```

2. **Navigate to your project directory:**
   ```bash
   cd /path/to/your/project
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the application:**
   ```bash
   npm start
   ```
   Or if you need to run in background:
   ```bash
   npm start &
   ```
   Or use PM2 for production:
   ```bash
   npm install -g pm2
   pm2 start npm --name "socialoura" -- start
   pm2 save
   pm2 startup
   ```

## Step 8: Verify Deployment

1. Visit https://socialoura.com
2. Test all pages:
   - Homepage
   - Instagram/TikTok pages
   - Admin dashboard
   - Pricing functionality
3. Check admin panel pricing updates work with MySQL database

## Troubleshooting

### If Node.js isn't working:
- Check IONOS documentation for Node.js setup
- Ensure you're using a hosting plan that supports Node.js
- Some IONOS plans only support static hosting

### If you get "Cannot find module" errors:
- Make sure node_modules is uploaded OR
- Run `npm install --production` on the server

### If database connection fails:
- Verify database credentials in IONOS panel
- Check if your database host allows remote connections
- Test connection using phpMyAdmin first

### If site shows 404 errors:
- Check that .next folder is uploaded
- Verify next.config.mjs is present
- Ensure Node.js is actually running

## Alternative: Use IONOS Deploy Now (Static Export)

If IONOS doesn't support Node.js well, you can export your site as static files:

1. **Update next.config.mjs:**
   ```javascript
   const nextConfig = {
     output: 'export',
     images: {
       unoptimized: true,
     },
   };
   ```

2. **Build static version:**
   ```bash
   npm run build
   ```

3. **Upload only the `out/` folder contents to your web root**

**Note:** This approach won't work with API routes (admin panel won't work).

## Support

- IONOS Support: https://www.ionos.com/help
- IONOS Community: https://www.ionos.com/community
- Next.js Deployment Docs: https://nextjs.org/docs/deployment
