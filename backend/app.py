"""
EarthNeer Backend API
A simple Flask REST API for the EarthNeer prototype.
Uses data.json for storage - no database required.
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime
import uuid

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, '..', 'frontend')
DATA_FILE = os.path.join(BASE_DIR, 'data.json')

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)  # Enable CORS for all routes

def load_data():
    """Load data from data.json file."""
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        default_data = {"products": [], "enquiries": []}
        save_data(default_data)
        return default_data
    except json.JSONDecodeError:
        return {"products": [], "enquiries": []}

def save_data(data):
    """Save data to data.json file."""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def validate_enquiry(data):
    """Validate enquiry data."""
    errors = []
    required_fields = ['name', 'phone', 'email', 'customer_type', 'message']
    for field in required_fields:
        if not data.get(field):
            errors.append(f"{field.replace('_', ' ').title()} is required")
    
    if data.get('email'):
        email = data['email']
        if '@' not in email or '.' not in email:
            errors.append("Please enter a valid email address")
    
    if data.get('phone'):
        phone = data['phone'].strip()
        cleaned_phone = phone.replace('+', '').replace('-', '').replace(' ', '')
        if not cleaned_phone.isdigit() or len(cleaned_phone) < 10 or len(cleaned_phone) > 15:
            errors.append("Please enter a valid phone number")
    
    return errors

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "success": True,
        "message": "EarthNeer API is running"
    })

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products."""
    data = load_data()
    return jsonify({
        "success": True,
        "products": data.get('products', [])
    })

@app.route('/api/enquiries', methods=['POST'])
def create_enquiry():
    """Create a new enquiry."""
    try:
        enquiry_data = request.get_json()
        
        if not enquiry_data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400
        
        errors = validate_enquiry(enquiry_data)
        if errors:
            return jsonify({
                "success": False,
                "message": "Validation failed",
                "errors": errors
            }), 400
        
        new_enquiry = {
            "id": str(uuid.uuid4()),
            "name": enquiry_data['name'].strip(),
            "phone": enquiry_data['phone'].strip(),
            "email": enquiry_data['email'].strip(),
            "customer_type": enquiry_data['customer_type'],
            "message": enquiry_data['message'].strip(),
            "created_at": datetime.now().isoformat()
        }
        
        data = load_data()
        data['enquiries'].append(new_enquiry)
        save_data(data)
        
        return jsonify({
            "success": True,
            "message": "Thank you. Your enquiry has been submitted.",
            "enquiry": new_enquiry
        }), 201
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Server error occurred. Please try again."
        }), 500

@app.route('/api/enquiries', methods=['GET'])
def get_enquiries():
    """Get all enquiries."""
    data = load_data()
    enquiries = data.get('enquiries', [])
    enquiries.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    
    return jsonify({
        "success": True,
        "enquiries": enquiries,
        "count": len(enquiries)
    })

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Get dashboard statistics."""
    data = load_data()
    enquiries = data.get('enquiries', [])
    products = data.get('products', [])
    
    customer_type_counts = {}
    for enquiry in enquiries:
        customer_type = enquiry.get('customer_type', 'Other')
        customer_type_counts[customer_type] = customer_type_counts.get(customer_type, 0) + 1
    
    recent_enquiries = sorted(
        enquiries, 
        key=lambda x: x.get('created_at', ''), 
        reverse=True
    )[:5]
    
    return jsonify({
        "success": True,
        "total_enquiries": len(enquiries),
        "total_products": len(products),
        "customer_type_counts": customer_type_counts,
        "recent_enquiries": recent_enquiries
    })

# --- FRONTEND SERVE KARNE KE LIYE - Yahi se dono chalega ---
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(FRONTEND_DIR, path)):
        return send_from_directory(FRONTEND_DIR, path)
    else:
        return send_from_directory(FRONTEND_DIR, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
