# Notes App - EC2 Deployment Project

A simple note-taking web application built with Flask, MariaDB, HTML, CSS, and vanilla JavaScript. Designed for deployment practice on AWS EC2.

## Features

- Create, Read, Update, Delete (CRUD) notes
- Clean and responsive UI
- RESTful API backend
- MariaDB database storage

## Project Structure

```
notes-app/
├── static/
│   ├── css/
│   │   └── style.css          # Styles
│   └── js/
│       └── app.js              # Frontend JavaScript
├── templates/
│   └── index.html              # Main HTML page
├── app.py                      # Flask application
├── config.py                   # Configuration settings
├── requirements.txt            # Python dependencies
├── .gitignore                  # Git ignore file
└── README.md                   # This file
```

## Local Development Setup

### Prerequisites

- Python 3.8+
- MariaDB/MySQL
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd notes-app
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up MariaDB**
   ```sql
   # Login to MariaDB
   mysql -u root -p
   
   # Create database
   CREATE DATABASE notesdb;
   
   # Create user (optional)
   CREATE USER 'notesuser'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON notesdb.* TO 'notesuser'@'localhost';
   FLUSH PRIVILEGES;
   ```

5. **Configure environment**
   
   Create a `.env` file in the root directory:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=notesdb
   DB_PORT=3306
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ```

6. **Run the application**
   ```bash
   python app.py
   ```

7. **Access the app**
   
   Open your browser and go to: `http://localhost:5000`

## API Endpoints

- `GET /api/notes` - Get all notes
- `GET /api/notes/<id>` - Get a specific note
- `POST /api/notes` - Create a new note
- `PUT /api/notes/<id>` - Update a note
- `DELETE /api/notes/<id>` - Delete a note

## EC2 Deployment Guide

### 1. Launch EC2 Instance

- AMI: Amazon Linux 2 or Ubuntu 20.04 LTS
- Instance Type: t2.micro (free tier)
- Security Group: Open ports 22 (SSH), 80 (HTTP), 3306 (MySQL)

### 2. Connect to EC2

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### 3. Install Dependencies

**For Amazon Linux 2:**
```bash
sudo yum update -y
sudo yum install python3 python3-pip git mariadb-server -y
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

**For Ubuntu:**
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv git mariadb-server -y
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

### 4. Secure MariaDB

```bash
sudo mysql_secure_installation
```

### 5. Set up Database

```bash
sudo mysql -u root -p

CREATE DATABASE notesdb;
CREATE USER 'notesuser'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON notesdb.* TO 'notesuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 6. Clone and Deploy Application

```bash
cd /home/ec2-user
git clone <your-repo-url>
cd notes-app

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 7. Configure Environment

```bash
nano .env
```

Add:
```
DB_HOST=localhost
DB_USER=notesuser
DB_PASSWORD=secure_password
DB_NAME=notesdb
DB_PORT=3306
SECRET_KEY=generate-a-secure-secret-key
DEBUG=False
```

### 8. Run with Production Server

Install Gunicorn:
```bash
pip install gunicorn
```

Run:
```bash
gunicorn -w 4 -b 0.0.0.0:80 app:app
```

### 9. Set up as System Service (Optional)

Create service file:
```bash
sudo nano /etc/systemd/system/notes-app.service
```

Add:
```ini
[Unit]
Description=Notes App
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/notes-app
Environment="PATH=/home/ec2-user/notes-app/venv/bin"
ExecStart=/home/ec2-user/notes-app/venv/bin/gunicorn -w 4 -b 0.0.0.0:80 app:app

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl start notes-app
sudo systemctl enable notes-app
sudo systemctl status notes-app
```

## EBS Backup Solution

### 1. Create and Attach EBS Volume

- Create EBS volume in same AZ as EC2
- Attach to EC2 instance
- Mount the volume

### 2. Format and Mount

```bash
# Find device name
lsblk

# Format (only first time)
sudo mkfs -t ext4 /dev/xvdf

# Create mount point
sudo mkdir /mnt/backup

# Mount
sudo mount /dev/xvdf /mnt/backup

# Auto-mount on boot
echo '/dev/xvdf /mnt/backup ext4 defaults,nofail 0 2' | sudo tee -a /etc/fstab
```

### 3. Create Backup Script

```bash
sudo nano /usr/local/bin/backup-notes.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR=/mnt/backup
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
mysqldump -u notesuser -p'secure_password' notesdb > $BACKUP_DIR/notesdb_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "notesdb_*.sql" -mtime +7 -delete
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/backup-notes.sh
```

### 4. Schedule with Cron

```bash
sudo crontab -e
```

Add (backup daily at 2 AM):
```
0 2 * * * /usr/local/bin/backup-notes.sh
```

## Troubleshooting

- **Database connection error**: Check credentials in `.env`
- **Port 80 permission denied**: Run with sudo or use port > 1024
- **Module not found**: Ensure virtual environment is activated

## License

This project is for educational purposes.