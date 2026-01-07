# Dashboard Usage

## Opening the Dashboard

**Important:** For best results, serve the dashboard via HTTP instead of opening directly:

### Option 1: Use Python HTTP Server (Recommended)
```bash
# From the project root
cd backend
python -m http.server 8080
```

Then open: http://localhost:8080/../dashboard/index.html

### Option 2: Use the Backend Server
If your FastAPI server is running, you can add a route to serve the dashboard:

```python
@app.get("/dashboard")
async def get_dashboard():
    return FileResponse("dashboard/index.html")
```

Then open: http://localhost:8000/dashboard

### Option 3: Direct File (May have issues)
You can try opening `dashboard/index.html` directly, but some browsers may have issues with JavaScript execution when using `file://` protocol.

## Troubleshooting

If you see JavaScript code displayed as text:
1. Make sure you're accessing via HTTP (http://) not file://
2. Check browser console for errors (F12)
3. Try a different browser
4. Clear browser cache (Ctrl+Shift+Delete)





