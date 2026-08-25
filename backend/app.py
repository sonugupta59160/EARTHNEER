"""
EarthNeer Backend API
A simple Flask REST API for the EarthNeer prototype.
Uses data.json for storage - no database required.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

DATA_FILE = os.path.join(os.path.dirname(__file__), 'data.json')


def load_data():
    """Load data from data.json file."""
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # If file doesn't exist, create with default structure
        default_data = {"products": [], "enquiries": []}
        save_data(default_data)
        return default_data
    except json.JSONDecodeError:
        # If file is corrupted, return empty structure
        return {"products": [], "enquiries": []}


def save_data(data):
    """Save data to data.json file."""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)


def validate_enquiry(data):
    """Validate enquiry data."""
    errors = []
    
    # Required fields validation
    required_fields = ['name', 'phone', 'email', 'customer_type', 'message']
    for field in required_fields:
        if not data.get(field):
            errors.append(f"{field.replace('_', ' ').title()} is required")
    
    # Email validation
    if data.get('email'):
        email = data['email']
        if '@' not in email or '.' not in email:
            errors.append("Please enter a valid email address")
    
    # Phone validation (basic Indian phone number check)
    if data.get('phone'):
        phone = data['phone'].strip()
        # Allow digits, +, -, spaces
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
        
        # Validate the enquiry
        errors = validate_enquiry(enquiry_data)
        if errors:
            return jsonify({
                "success": False,
                "message": "Validation failed",
                "errors": errors
            }), 400
        
        # Create new enquiry object
        new_enquiry = {
            "id": str(uuid.uuid4()),
            "name": enquiry_data['name'].strip(),
            "phone": enquiry_data['phone'].strip(),
            "email": enquiry_data['email'].strip(),
            "customer_type": enquiry_data['customer_type'],
            "message": enquiry_data['message'].strip(),
            "created_at": datetime.now().isoformat()
        }
        
        # Load existing data
        data = load_data()
        
        # Add new enquiry
        data['enquiries'].append(new_enquiry)
        
        # Save back to file
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
    
    # Sort by created_at descending (newest first)
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
    
    # Count enquiries by customer type
    customer_type_counts = {}
    for enquiry in enquiries:
        customer_type = enquiry.get('customer_type', 'Other')
        customer_type_counts[customer_type] = customer_type_counts.get(customer_type, 0) + 1
    
    # Get recent enquiries (last 5)
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


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)