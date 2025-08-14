from flask import Blueprint, jsonify, request
from src.models.user import User, db
from src.security import rate_limit, require_admin

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['GET'])
@rate_limit(limit=120, window_seconds=60)
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/users', methods=['POST'])
@require_admin
@rate_limit(limit=30, window_seconds=60)
def create_user():
    
    data = request.json
    user = User(username=data['username'], email=data['email'])
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

@user_bp.route('/users/<int:user_id>', methods=['GET'])
@rate_limit(limit=120, window_seconds=60)
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
@require_admin
@rate_limit(limit=30, window_seconds=60)
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    db.session.commit()
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
@require_admin
@rate_limit(limit=20, window_seconds=60)
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return '', 204
