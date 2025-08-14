import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, jsonify, request
from src.models.user import db
from src.models.exam import Exam, ExamResult
from src.routes.user import user_bp
from src.routes.exam import exam_bp
from src.routes.translation import translation_bp
from flask_cors import CORS
from dotenv import load_dotenv
from flask_migrate import Migrate
from typing import Tuple

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'change-me')
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False
app.config['JSON_SORT_KEYS'] = True

# Limit request size (applies to uploads and raw JSON bodies)
max_body_mb = float(os.getenv('MAX_BODY_MB', '2'))
app.config['MAX_CONTENT_LENGTH'] = int(max_body_mb * 1024 * 1024)

# Enable CORS - prefer specific origin from env, fallback to localhost:5173
frontend_origin = os.getenv('FRONTEND_ORIGIN', 'http://localhost:5173')
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [frontend_origin],
            "allow_headers": ["Content-Type", "Authorization"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "max_age": 600,
        }
    },
    supports_credentials=False,
)

# Database configuration
db_path = os.getenv('DATABASE_URL')
if not db_path:
    db_path = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_DATABASE_URI'] = db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
Migrate(app, db)
with app.app_context():
    db.create_all()

# Register API blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(exam_bp, url_prefix='/api')
app.register_blueprint(translation_bp, url_prefix='/api')

@app.after_request
def add_security_headers(response):
    # Basic secure headers (keep CSP permissive for local dev)
    csp = (
        "default-src 'self'; "
        f"connect-src 'self' {frontend_origin} http://localhost:5000 https:; "
        "img-src 'self' data: blob:; "
        "style-src 'self' 'unsafe-inline'; "
        "script-src 'self'; "
        "frame-ancestors 'none';"
    )
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'no-referrer'
    response.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'
    # Only attach CSP on HTML routes; APIs don't need CSP and it may block dev requests in some setups
    if request.path == '/' or request.path.endswith('.html'):
        response.headers['Content-Security-Policy'] = csp
    return response

@app.before_request
def reject_oversized_json():
    # Fast path to reject huge bodies (Flask will also enforce MAX_CONTENT_LENGTH)
    cl = request.content_length or 0
    if cl and cl > app.config['MAX_CONTENT_LENGTH']:
        from werkzeug.exceptions import RequestEntityTooLarge
        raise RequestEntityTooLarge()

def json_error(message: str, code: int):
    return jsonify({"error": message, "status": code}), code

@app.errorhandler(400)
def bad_request(_):
    return json_error('bad_request', 400)

@app.errorhandler(404)
def not_found(_):
    return json_error('not_found', 404)

@app.errorhandler(405)
def method_not_allowed(_):
    return json_error('method_not_allowed', 405)

@app.errorhandler(413)
def too_large(_):
    return json_error('payload_too_large', 413)

@app.errorhandler(429)
def too_many(_):
    return json_error('too_many_requests', 429)

@app.errorhandler(500)
def internal_error(_):
    return json_error('internal_server_error', 500)

@app.route('/')
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "telc B2 Exam System Backend API",
        "version": "1.0.0"
    })

@app.route('/api/health')
def api_health():
    return jsonify({
        "status": "healthy",
        "database": "connected",
        "api": "ready"
    })

if __name__ == '__main__':
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', '5000'))
    debug = os.getenv('DEBUG', 'true').lower() == 'true'
    app.run(host=host, port=port, debug=debug)

