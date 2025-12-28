# Notes App - EC2 Deployment Project

A simple note-taking web application built with Flask, MariaDB, HTML, CSS, and vanilla JavaScript. Designed for DevOps deployment practice on AWS EC2 with EBS backup solution.

## 🚀 Features

- ✅ Create, Read, Update, Delete (CRUD) notes
- ✅ Clean and responsive UI with purple gradient design
- ✅ RESTful API backend
- ✅ MariaDB database storage
- ✅ Real-time updates without page refresh
- ✅ Timestamps for note tracking

## 📁 Project Structure

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
├── .env                        # Environment variables (not in git)
├── .gitignore                  # Git ignore file
└── README.md                   # This file
```

## 🛠️ Technologies Used

- **Backend**: Python 3.14, Flask 3.1.2
- **Database**: MariaDB/MySQL
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Deployment**: AWS EC2, EBS for backups

## 💻 Local Development Setup

### Prerequisites

- Python 3.8+
- MariaDB/MySQL
- Git

### Installation Steps

#### 1. Clone the repository

```bash
git clone https://github.com/Filopateer-Shaker/notes-app.git
cd notes-app
```

#### 2. Create virtual environment

```bash
python -m venv venv

# On Windows (Git Bash)
source venv/Scripts/activate

# On Windows (CMD)
venv\Scripts\activate

# On Linux/Mac
source venv/bin/activate
```

#### 3. Install dependencies

```bash
pip install -r requirements.txt
```

#### 4. Set up MariaDB

```bash
# Connect to MariaDB
mysql -u root -p

# In MySQL prompt, run:
CREATE DATABASE notesdb;
EXIT;
```

#### 5. Configure environment variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mariadb_password
DB_NAME=notesdb
DB_PORT=3306
SECRET_KEY=your-secret-key-here
DEBUG=True
```

**Important:** Replace `your_mariadb_password` with your actual MariaDB root password!

#### 6. Run the application

```bash
python app.py
```

The app will automatically:
- Connect to MariaDB
- Create the `notes` table if it doesn't exist
- Start the Flask development server

#### 7. Access the app

Open your browser and go to: **http://localhost:5000**

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all notes |
| GET | `/api/notes/<id>` | Get a specific note |
| POST | `/api/notes` | Create a new note |
| PUT | `/api/notes/<id>` | Update a note |
| DELETE | `/api/notes/<id>` | Delete a note |

### Example API Usage

**Create a note:**
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"My First Note","content":"This is the content"}'
```

**Get all notes:**
```bash
curl http://localhost:5000/api/notes
```

## 🌐 EC2 Deployment Guide

### Step 1: Launch EC2 Instance

1. Log in to AWS Console
2. Launch EC2 Instance:
   - **AMI**: Amazon Linux 2023 or Ubuntu 22.04 LTS
   - **Instance Type**: t2.micro (free tier eligible)
   - **Key Pair**: Create or select existing key pair
   - **Security Group**: Configure the following rules:
     - SSH (Port 22) - Your IP
     - HTTP (Port 80) - Anywhere (0.0.0.0/0)
     - Custom TCP (Port 5000) - Anywhere (for testing)
     - MySQL (Port 3306) - Same VPC only

### Step 2: Connect to EC2

```bash
ssh -i your-key.pem ec2-user@your-ec2-public-ip

# For Ubuntu
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### Step 3: Install Dependencies

**For Amazon Linux 2023:**
```bash
sudo dnf update -y
sudo dnf install python3 python3-pip git mariadb105-server -y
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

**For Ubuntu 22.04:**
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv git mariadb-server -y
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

### Step 4: Secure MariaDB

```bash
sudo mysql_secure_installation
```

Follow the prompts:
- Set root password
- Remove anonymous users: Yes
- Disallow root login remotely: Yes
- Remove test database: Yes
- Reload privilege tables: Yes

### Step 5: Set up Database

```bash
sudo mysql -u root -p

# In MySQL prompt:
CREATE DATABASE notesdb;
CREATE USER 'notesuser'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON notesdb.* TO 'notesuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 6: Clone and Deploy Application

```bash
cd /home/ec2-user  # or /home/ubuntu
git clone https://github.com/Filopateer-Shaker/notes-app.git
cd notes-app

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 7: Configure Environment

```bash
nano .env
```

Add the following:
```env
DB_HOST=localhost
DB_USER=notesuser
DB_PASSWORD=secure_password_here
DB_NAME=notesdb
DB_PORT=3306
SECRET_KEY=generate-a-long-random-secret-key
DEBUG=False
```

**To generate a secure secret key:**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Step 8: Test the Application

```bash
python3 app.py
```

Open browser: `http://your-ec2-public-ip:5000`

If it works, press `Ctrl + C` to stop.

### Step 9: Run with Production Server (Gunicorn)

```bash
# Install Gunicorn
pip install gunicorn

# Run on port 80 (requires sudo)
sudo /home/ec2-user/notes-app/venv/bin/gunicorn -w 4 -b 0.0.0.0:80 app:app
```

### Step 10: Set up as System Service

Create systemd service file:

```bash
sudo nano /etc/systemd/system/notes-app.service
```

Add the following content:

```ini
[Unit]
Description=Notes App - Flask Application
After=network.target mariadb.service

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/notes-app
Environment="PATH=/home/ec2-user/notes-app/venv/bin"
ExecStart=/home/ec2-user/notes-app/venv/bin/gunicorn -w 4 -b 0.0.0.0:80 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

**For Ubuntu**, change `User=ec2-user` to `User=ubuntu` and update paths accordingly.

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl start notes-app
sudo systemctl enable notes-app
sudo systemctl status notes-app
```

Now your app runs automatically on boot!

## 💾 EBS Backup Solution

### Step 1: Create and Attach EBS Volume

1. In AWS Console, go to **EC2 → Volumes**
2. Create New Volume:
   - Size: 8 GB (or as needed)
   - **Same Availability Zone** as your EC2 instance
3. Attach volume to your EC2 instance
4. Note the device name (e.g., `/dev/xvdf`)

### Step 2: Format and Mount EBS Volume

```bash
# List attached volumes
lsblk

# Format the volume (ONLY FIRST TIME!)
sudo mkfs -t ext4 /dev/xvdf

# Create mount point
sudo mkdir -p /mnt/backup

# Mount the volume
sudo mount /dev/xvdf /mnt/backup

# Set permissions
sudo chown ec2-user:ec2-user /mnt/backup

# Auto-mount on boot
echo '/dev/xvdf /mnt/backup ext4 defaults,nofail 0 2' | sudo tee -a /etc/fstab
```

### Step 3: Create Backup Script

```bash
sudo nano /usr/local/bin/backup-notes.sh
```

Add the following:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/mnt/backup"
DATE=$(date +%Y%m%d_%H%M%S)
DB_USER="notesuser"
DB_PASS="secure_password_here"
DB_NAME="notesdb"
RETENTION_DAYS=7

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Backup database
echo "Starting backup at $(date)"
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/notesdb_$DATE.sql

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully: notesdb_$DATE.sql"
    
    # Compress the backup
    gzip $BACKUP_DIR/notesdb_$DATE.sql
    echo "Backup compressed: notesdb_$DATE.sql.gz"
    
    # Delete backups older than retention period
    find $BACKUP_DIR -name "notesdb_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "Old backups cleaned up (kept last $RETENTION_DAYS days)"
else
    echo "Backup failed!"
    exit 1
fi

echo "Backup process completed at $(date)"
```

Make it executable:

```bash
sudo chmod +x /usr/local/bin/backup-notes.sh
```

### Step 4: Test the Backup Script

```bash
sudo /usr/local/bin/backup-notes.sh
```

Check if backup was created:

```bash
ls -lh /mnt/backup/
```

### Step 5: Schedule Automatic Backups with Cron

```bash
sudo crontab -e
```

Add this line (backup daily at 2 AM):

```
0 2 * * * /usr/local/bin/backup-notes.sh >> /var/log/notes-backup.log 2>&1
```

**Other scheduling options:**
- Every 6 hours: `0 */6 * * *`
- Every day at midnight: `0 0 * * *`
- Every Sunday at 3 AM: `0 3 * * 0`

View backup logs:

```bash
sudo tail -f /var/log/notes-backup.log
```

### Step 6: Restore from Backup

To restore database from backup:

```bash
# List available backups
ls -lh /mnt/backup/

# Decompress backup
gunzip /mnt/backup/notesdb_YYYYMMDD_HHMMSS.sql.gz

# Restore to database
mysql -u notesuser -p notesdb < /mnt/backup/notesdb_YYYYMMDD_HHMMSS.sql
```

## 🐛 Troubleshooting

### Database Connection Errors

**Issue**: `Access denied for user`
- Check credentials in `.env` file
- Verify user exists in MariaDB
- Check password is correct

**Issue**: `Can't connect to MySQL server`
- Check if MariaDB is running: `sudo systemctl status mariadb`
- Start MariaDB: `sudo systemctl start mariadb`

### Application Errors

**Issue**: `Port 80 permission denied`
- Run with sudo or use port > 1024
- Or configure Gunicorn as systemd service (recommended)

**Issue**: `ModuleNotFoundError`
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

**Issue**: `Template not found`
- Check `templates/` folder exists
- Verify `index.html` is in `templates/` directory

### EC2 Access Issues

**Issue**: Can't access app from browser
- Check Security Group allows inbound traffic on port 80 or 5000
- Verify EC2 public IP is correct
- Check if app is running: `sudo systemctl status notes-app`

**Issue**: SSH connection refused
- Verify key pair permissions: `chmod 400 your-key.pem`
- Check Security Group allows SSH from your IP
- Verify EC2 instance is running

## 📊 Monitoring

### Check Application Status

```bash
# Service status
sudo systemctl status notes-app

# View logs
sudo journalctl -u notes-app -f

# Check if port 80 is listening
sudo netstat -tulpn | grep :80
```

### Database Monitoring

```bash
# Login to MySQL
mysql -u notesuser -p

# Check database size
SELECT table_schema AS "Database", 
       ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS "Size (MB)" 
FROM information_schema.TABLES 
WHERE table_schema = "notesdb";

# Count notes
USE notesdb;
SELECT COUNT(*) FROM notes;
```

## 🔒 Security Best Practices

1. **Never commit `.env` file** to Git (already in `.gitignore`)
2. **Use strong passwords** for database and secret keys
3. **Limit Security Group rules** to specific IPs when possible
4. **Keep system updated**: `sudo dnf update -y` or `sudo apt update && sudo apt upgrade -y`
5. **Enable firewall** on EC2 instance
6. **Regular backups** to EBS volume
7. **Monitor logs** for suspicious activity
8. **Use HTTPS** in production (consider AWS Certificate Manager + Load Balancer)

## 📝 To-Do / Future Enhancements

- [ ] Add user authentication
- [ ] Implement note categories/tags
- [ ] Add search functionality
- [ ] Enable note sharing
- [ ] Add rich text editor
- [ ] Implement API rate limiting
- [ ] Set up HTTPS with SSL certificate
- [ ] Add Docker containerization
- [ ] Implement CI/CD pipeline
- [ ] Add automated testing

## 📄 License

This project is for educational purposes as part of a DevOps learning project.

## 👤 Author

**Filopateer Shaker**
- GitHub: [@Filopateer-Shaker](https://github.com/Filopateer-Shaker)

## 🙏 Acknowledgments

- Built as a DevOps deployment practice project
- Focuses on Linux environment, EC2 deployment, and backup solutions
- Simple codebase designed for infrastructure learning, not complex development

---

**Happy Deploying! 🚀**