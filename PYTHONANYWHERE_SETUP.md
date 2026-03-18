# 🎬 PythonAnywhere Deployment Guide

## Your Generated Secret Key (Save This!)
```
jI}QEfez*xmAnCY&P4{C5GYw0YELSau7i2xu?@88ZeM4|rnjra
```

---

## Step 1: Create PythonAnywhere Account (5 min)
1. Go to https://www.pythonanywhere.com/
2. Click "Pricing" → "Create a Beginner account" (FREE)
3. Enter email and password
4. Confirm your email
5. Log in to dashboard

**Your account URL will be**: `https://yourusername.pythonanywhere.com/admin/`

---

## Step 2: Bash Console Setup (5 min)

1. Go to **"Consoles"** tab in PythonAnywhere dashboard
2. Click **"Start a new Bash console"**
3. Copy & paste this entire command block:

```bash
git clone https://github.com/lord-vichu/movie-recommender.git && cd movie-recommender && python3.11 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
```

4. Wait for it to finish (2-3 minutes)
5. You should see "✓ Success" messages

---

## Step 3: Create Web Service (2 min)

1. Go to **"Web"** tab
2. Click **"+ Add a new web app"**
3. Choose **"Manual configuration"**
4. Select **"Python 3.11"**
5. Click **"Next"**

You'll see a new web app configuration page.

---

## Step 4: Edit WSGI File (2 min)

1. Near the top of the Web tab, you'll see:
   ```
   Working directory: /home/yourusername/movie-recommender
   WSGI configuration file: /var/www/yourusername_pythonanywhere_com_wsgi.py
   ```

2. **Click the WSGI config file link** (it will open an editor)

3. **Delete everything** and paste THIS:

```python
import os
import sys

# Add your project to the path
path = '/home/yourusername/movie-recommender'
if path not in sys.path:
    sys.path.append(path)

# Set up Django settings module
os.environ['DJANGO_SETTINGS_MODULE'] = 'movie_recommender.settings'

# Get WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

4. Press **Ctrl+S** to save
5. Close the editor tab

---

## Step 5: Source Code Configuration (1 min)

Back in the Web tab, look for:
```
Source code: /home/yourusername/movie-recommender
Working directory: /home/yourusername/movie-recommender
Virtualenv: /home/yourusername/movie-recommender/venv
```

**Make sure each field is filled in correctly**, then click **"Save"**.

---

## Step 6: Add Environment Variables (2 min)

In the **"Web"** tab, scroll down to **"Environment variables"** section.

Click **"Add a new environment variable"** for EACH of these:

### Variable 1: DEBUG
- **Name**: `DEBUG`
- **Value**: `False`
- Click **"Add"**

### Variable 2: DJANGO_SECRET_KEY
- **Name**: `DJANGO_SECRET_KEY`
- **Value**: `jI}QEfez*xmAnCY&P4{C5GYw0YELSau7i2xu?@88ZeM4|rnjra`
- Click **"Add"**

### Variable 3: ALLOWED_HOSTS
- **Name**: `ALLOWED_HOSTS`
- **Value**: `.pythonanywhere.com`
- Click **"Add"**

### Variable 4: TMDB_API_KEY
- **Name**: `TMDB_API_KEY`
- **Value**: `3658d16dd2e533776cb67b728a8f5a3c`
- Click **"Add"**

---

## Step 7: Configure Static Files (1 min)

In the **"Web"** tab, find **"Static files"** section.

Click **"Add"**:
- **URL**: `/static/`
- **Directory**: `/home/yourusername/movie-recommender/staticfiles/`

Click **"Save"**.

---

## Step 8: Reload & Test! (1 min)

1. Scroll to the top of Web tab
2. Click the **green "Reload"** button
3. Wait 10-15 seconds for reload to complete
4. Open your browser and visit: **`https://yourusername.pythonanywhere.com`**

You should see the Movie Recommender home page! 🎉

---

## ✅ Success Checklist

- [ ] PythonAnywhere account created
- [ ] Repository cloned via Bash console
- [ ] Virtual environment created
- [ ] Dependencies installed (pip install)
- [ ] Database migrated
- [ ] Static files collected
- [ ] Web app created (Manual → Python 3.11)
- [ ] WSGI file edited and saved
- [ ] All 4 environment variables added
- [ ] Static files configured
- [ ] Web app reloaded
- [ ] App loads at https://yourusername.pythonanywhere.com

---

## 🛠️ Troubleshooting

### "DisallowedHost" Error
**Fix**: Make sure `ALLOWED_HOSTS` is set to `.pythonanywhere.com`

### "Module not found" Error
**Fix**: Verify virtual environment path: `/home/yourusername/movie-recommender/venv`

### Static files not loading
**Fix**: Re-run in Bash console:
```bash
cd movie-recommender
source venv/bin/activate
python manage.py collectstatic --noinput
```

### App won't reload
**Fix**: Check error log in PythonAnywhere Web tab → "Error log"

---

## 🎮 Optional: Create Admin Account

After deployment works, create a superuser in Bash console:

```bash
cd movie-recommender
source venv/bin/activate
python manage.py createsuperuser
```

Then visit: `https://yourusername.pythonanywhere.com/admin/`

---

**Total time: ~20 minutes | Cost: FREE (forever)**

Good luck! 🚀
