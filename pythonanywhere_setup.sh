#!/bin/bash
# PythonAnywhere Setup Script for Movie Recommender
# Paste this entire script into PythonAnywhere Bash Console and run it

echo "🚀 Starting Movie Recommender deployment..."

# Clone repo if not already cloned
if [ ! -d "movie-recommender" ]; then
    echo "📥 Cloning repository..."
    git clone https://github.com/lord-vichu/movie-recommender.git
fi

cd movie-recommender

# Create virtual environment
echo "🐍 Creating virtual environment..."
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Go to Web tab in PythonAnywhere dashboard"
echo "2. Click 'Add a new web app' → Manual configuration → Python 3.11"
echo "3. Edit the WSGI file with the pythonanywhere_wsgi.py content"
echo "4. Set environment variables (see PYTHONANYWHERE_SETUP.md)"
echo "5. Click 'Reload' button"
echo ""
echo "Your app will be at: https://yourusername.pythonanywhere.com"
