const API_URL = '/api/notes';

// DOM Elements
const noteForm = document.getElementById('noteForm');
const noteId = document.getElementById('noteId');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const notesContainer = document.getElementById('notesContainer');

// Load notes on page load
document.addEventListener('DOMContentLoaded', loadNotes);

// Form submit handler
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = noteId.value;
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    
    if (!title || !content) {
        alert('Please fill in both title and content');
        return;
    }
    
    if (id) {
        await updateNote(id, title, content);
    } else {
        await createNote(title, content);
    }
});

// Cancel button handler
cancelBtn.addEventListener('click', resetForm);

// Load all notes
async function loadNotes() {
    try {
        const response = await fetch(API_URL);
        const notes = await response.json();
        
        if (notes.length === 0) {
            notesContainer.innerHTML = '<p class="empty-state">No notes yet. Create your first note!</p>';
        } else {
            displayNotes(notes);
        }
    } catch (error) {
        console.error('Error loading notes:', error);
        notesContainer.innerHTML = '<p class="empty-state">Error loading notes. Please try again.</p>';
    }
}

// Display notes
function displayNotes(notes) {
    notesContainer.innerHTML = notes.map(note => `
        <div class="note-card" data-id="${note.id}">
            <div class="note-meta">
                🕒 ${formatDate(note.created_at)}
            </div>
            <h3>📌 ${escapeHtml(note.title)}</h3>
            <p>${escapeHtml(note.content)}</p>
            <div class="note-actions">
                <button class="edit-btn" onclick="editNote(${note.id})">Edit</button>
                <button class="delete-btn" onclick="deleteNote(${note.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Create new note
async function createNote(title, content) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, content }),
        });
        
        if (response.ok) {
            resetForm();
            loadNotes();
            showMessage('Note created successfully!');
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        console.error('Error creating note:', error);
        alert('Failed to create note');
    }
}

// Edit note
async function editNote(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const note = await response.json();
        
        noteId.value = note.id;
        noteTitle.value = note.title;
        noteContent.value = note.content;
        submitBtn.textContent = 'Update Note';
        cancelBtn.style.display = 'inline-block';
        
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading note:', error);
        alert('Failed to load note');
    }
}

// Update note
async function updateNote(id, title, content) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, content }),
        });
        
        if (response.ok) {
            resetForm();
            loadNotes();
            showMessage('Note updated successfully!');
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        console.error('Error updating note:', error);
        alert('Failed to update note');
    }
}

// Delete note
async function deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        
        if (response.ok) {
            loadNotes();
            showMessage('Note deleted successfully!');
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note');
    }
}

// Reset form
function resetForm() {
    noteId.value = '';
    noteTitle.value = '';
    noteContent.value = '';
    submitBtn.textContent = 'Add Note';
    cancelBtn.style.display = 'none';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show success message
function showMessage(message) {
    const msg = document.createElement('div');
    msg.textContent = message;
    msg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s;
    `;
    document.body.appendChild(msg);
    
    setTimeout(() => {
        msg.style.animation = 'slideOut 0.3s';
        setTimeout(() => msg.remove(), 300);
    }, 3000);
}