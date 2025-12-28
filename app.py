from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pymysql
from config import Config
from datetime import datetime

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Database connection function
def get_db_connection():
    return pymysql.connect(
        host=app.config['DB_HOST'],
        user=app.config['DB_USER'],
        password=app.config['DB_PASSWORD'],
        database=app.config['DB_NAME'],
        port=app.config['DB_PORT'],
        cursorclass=pymysql.cursors.DictCursor
    )

# Initialize database
def init_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create notes table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        cursor.close()
        conn.close()
        print("Database initialized successfully!")
    except Exception as e:
        print(f"Error initializing database: {e}")

# Routes
@app.route('/')
def index():
    return render_template('index.html')

# API Endpoints

# Get all notes
@app.route('/api/notes', methods=['GET'])
def get_notes():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM notes ORDER BY updated_at DESC')
        notes = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(notes), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get single note
@app.route('/api/notes/<int:note_id>', methods=['GET'])
def get_note(note_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM notes WHERE id = %s', (note_id,))
        note = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if note:
            return jsonify(note), 200
        else:
            return jsonify({'error': 'Note not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Create note
@app.route('/api/notes', methods=['POST'])
def create_note():
    try:
        data = request.get_json()
        title = data.get('title', '').strip()
        content = data.get('content', '').strip()
        
        if not title or not content:
            return jsonify({'error': 'Title and content are required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO notes (title, content) VALUES (%s, %s)',
            (title, content)
        )
        conn.commit()
        note_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return jsonify({'id': note_id, 'message': 'Note created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Update note
@app.route('/api/notes/<int:note_id>', methods=['PUT'])
def update_note(note_id):
    try:
        data = request.get_json()
        title = data.get('title', '').strip()
        content = data.get('content', '').strip()
        
        if not title or not content:
            return jsonify({'error': 'Title and content are required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'UPDATE notes SET title = %s, content = %s WHERE id = %s',
            (title, content, note_id)
        )
        conn.commit()
        affected_rows = cursor.rowcount
        cursor.close()
        conn.close()
        
        if affected_rows > 0:
            return jsonify({'message': 'Note updated successfully'}), 200
        else:
            return jsonify({'error': 'Note not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Delete note
@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM notes WHERE id = %s', (note_id,))
        conn.commit()
        affected_rows = cursor.rowcount
        cursor.close()
        conn.close()
        
        if affected_rows > 0:
            return jsonify({'message': 'Note deleted successfully'}), 200
        else:
            return jsonify({'error': 'Note not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=app.config['DEBUG'])