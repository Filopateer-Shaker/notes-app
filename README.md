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
   - **AMI**: Red Hat Enterprise Linux 10 (RHEL 10)
   - **Instance Type**: t2.micro or t3.micro (free tier eligible)
   - **Key Pair**: Create or select existing key pair for SSH access
   - **Security Group**: Configure the following rules:
     - SSH (Port 22) - Your IP or 0.0.0.0/0
     - Custom TCP (Port 8000) - Anywhere (0.0.0.0/0)
   - **Storage**: 8 GB (default) or more if needed

### Step 2: Connect to EC2

```bash
ssh -i your-key.pem ec2-user@your-ec2-public-ip
```

### Step 3: Install Dependencies on RHEL 10

```bash
# Update system
sudo dnf update -y

# Install Python, Git, and MariaDB
sudo dnf install python3 python3-pip git mariadb-server -y

# Start and enable MariaDB
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

**IMPORTANT:** Deploy to `/opt` instead of `/home/ec2-user` to avoid SELinux permission issues.

```bash
# Create and navigate to /opt directory
sudo mkdir -p /opt
cd /opt

# Clone the repository
sudo git clone https://github.com/Filopateer-Shaker/notes-app.git

# Change ownership to ec2-user
sudo chown -R ec2-user:ec2-user /opt/notes-app

# Navigate to project directory
cd /opt/notes-app

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn
```

### Step 7: Configure Environment

```bash
# Create .env file
vi .env
```

Add the following (press `i` to insert, then `ESC` + `:wq` to save):
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
# Make sure you're in the virtual environment
source /opt/notes-app/venv/bin/activate

# Test with Gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

Open browser: `http://your-ec2-public-ip:8000`

If it works, press `Ctrl + C` to stop.

### Step 9: Set up as System Service

Create systemd service file:

```bash
sudo vi /etc/systemd/system/notes-app.service
```

Add the following content (press `i` to insert, then `ESC` + `:wq` to save):

```ini
[Unit]
Description=Notes App - Flask Application
After=network.target mariadb.service

[Service]
Type=notify
User=ec2-user
Group=ec2-user
WorkingDirectory=/opt/notes-app
Environment="PATH=/opt/notes-app/venv/bin"
ExecStart=/opt/notes-app/venv/bin/gunicorn -w 4 -b 0.0.0.0:8000 app:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Key Configuration Details:**
- `Type=notify`: Tells systemd that Gunicorn will notify when it's ready
- `After=mariadb.service`: Ensures database starts before the app
- `RestartSec=10`: Waits 10 seconds before restarting on failure
- `Environment="PATH=..."`: Ensures the virtual environment is used

### Step 10: Enable and Start the Service

```bash
# Reload systemd to recognize the new service
sudo systemctl daemon-reload

# Enable the service (start on boot)
sudo systemctl enable notes-app

# Start the service
sudo systemctl start notes-app

# Check status
sudo systemctl status notes-app
```

You should see: `Active: active (running)`

**If the service fails to start, check logs:**
```bash
sudo journalctl -u notes-app -n 50 --no-pager
```

### Step 11: Verify Deployment

```bash
# Check if the service is running
sudo systemctl status notes-app

# Check if port 8000 is listening
sudo netstat -tulpn | grep :8000

# Test from the server
curl http://localhost:8000

# Access from your browser
# Open: http://your-ec2-public-ip:8000
```

Now your app runs automatically on boot! 🚀

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

# Create mount point at /backup
sudo mkdir -p /backup

# Mount the volume
sudo mount /dev/xvdf /backup

# Set permissions
sudo chown ec2-user:ec2-user /backup

# Auto-mount on boot
echo '/dev/xvdf /backup ext4 defaults,nofail 0 2' | sudo tee -a /etc/fstab
```

### Step 3: Create Backup Script

```bash
sudo vi /usr/local/bin/backup-notes.sh
```

Add the following:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/backup"
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
ls -lh /backup/
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
ls -lh /backup/

# Decompress backup
gunzip /backup/notesdb_YYYYMMDD_HHMMSS.sql.gz

# Restore to database
mysql -u notesuser -p notesdb < /backup/notesdb_YYYYMMDD_HHMMSS.sql
```

## 🐛 Troubleshooting

### SELinux Permission Issues (RHEL/CentOS)

**Issue**: `Permission denied` errors when starting the systemd service

**Symptoms:**
```
notes-app.service: Failed at step EXEC spawning /home/ec2-user/notes-app/venv/bin/gunicorn: Permission denied
```

**Solution:**

SELinux prevents systemd from executing files in `/home` directories. Use one of these solutions:

**Option 1: Move to /opt (Recommended)**
```bash
# Stop the service
sudo systemctl stop notes-app

# Move application
sudo mv /home/ec2-user/notes-app /opt/
sudo chown -R ec2-user:ec2-user /opt/notes-app

# Update service file paths
sudo vi /etc/systemd/system/notes-app.service
# Change all paths from /home/ec2-user/notes-app to /opt/notes-app

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl start notes-app
```

**Option 2: Fix SELinux Context**
```bash
# Check SELinux status
getenforce

# Fix context for home directory (if you must use /home)
sudo semanage fcontext -a -t bin_t '/home/ec2-user/notes-app/venv/bin(/.*)?'
sudo restorecon -R -v /home/ec2-user/notes-app/venv/bin
```

**Option 3: Temporarily Disable SELinux (NOT recommended for production)**
```bash
sudo setenforce 0
```

### Database Connection Errors

**Issue**: `Access denied for user`
- Check credentials in `.env` file
- Verify user exists in MariaDB: `mysql -u root -p -e "SELECT User, Host FROM mysql.user;"`
- Check password is correct

**Issue**: `Can't connect to MySQL server`
- Check if MariaDB is running: `sudo systemctl status mariadb`
- Start MariaDB: `sudo systemctl start mariadb`

### Application Errors

**Issue**: Service shows `activating (auto-restart)`
- Check logs: `sudo journalctl -u notes-app -n 50 --no-pager`
- Verify paths in service file are correct
- Ensure virtual environment exists and has Gunicorn installed

**Issue**: `ModuleNotFoundError`
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`
- Make sure Gunicorn is installed: `pip install gunicorn`

**Issue**: `Template not found`
- Check `templates/` folder exists in `/opt/notes-app/`
- Verify `index.html` is in `templates/` directory

### EC2 Access Issues

**Issue**: Can't access app from browser
- Verify Security Group allows inbound traffic on port 8000
- Check EC2 public IP is correct
- Verify app is running: `sudo systemctl status notes-app`
- Test locally first: `curl http://localhost:8000`

**Issue**: SSH connection refused
- Verify key pair permissions: `chmod 400 your-key.pem`
- Check Security Group allows SSH from your IP
- Verify EC2 instance is running

### Service Management

**Restart the service:**
```bash
sudo systemctl restart notes-app
```

**Stop the service:**
```bash
sudo systemctl stop notes-app
```

**View service status:**
```bash
sudo systemctl status notes-app
```

**View recent logs:**
```bash
sudo journalctl -u notes-app -f
```

## 📊 Monitoring

### Check Application Status

```bash
# Service status
sudo systemctl status notes-app

# View logs in real-time
sudo journalctl -u notes-app -f

# View last 50 log lines
sudo journalctl -u notes-app -n 50 --no-pager

# Check if port 8000 is listening
sudo netstat -tulpn | grep :8000
# OR
sudo ss -tulpn | grep :8000
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

### System Resources

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check running processes
ps aux | grep gunicorn
```

## 🔒 Security Best Practices

1. **Never commit `.env` file** to Git (already in `.gitignore`)
2. **Use strong passwords** for database and secret keys
3. **Limit Security Group rules** to specific IPs when possible
4. **Keep system updated**: 
   - RHEL: `sudo dnf update -y`
   - Ubuntu: `sudo apt update && sudo apt upgrade -y`
5. **Enable firewall** on EC2 instance:
   ```bash
   # RHEL/CentOS
   sudo firewall-cmd --permanent --add-port=8000/tcp
   sudo firewall-cmd --reload
   ```
6. **Regular backups** to EBS volume
7. **Monitor logs** for suspicious activity
8. **Use HTTPS** in production (consider AWS Certificate Manager + Load Balancer or Let's Encrypt)
9. **SELinux**: Keep it enabled (enforcing mode) for better security
10. **Principle of least privilege**: Use dedicated service accounts with minimal permissions

## 📝 To-Do / Future Enhancements

- [ ] Add user authentication
- [ ] Implement note categories/tags
- [ ] Add search functionality
- [ ] Enable note sharing
- [ ] Add rich text editor
- [ ] Implement API rate limiting
- [ ] Set up HTTPS with SSL certificate (Let's Encrypt)
- [ ] Configure Nginx as reverse proxy for better performance
- [ ] Add Docker containerization
- [ ] Implement CI/CD pipeline
- [ ] Add automated testing
- [ ] Set up monitoring with Prometheus/Grafana
- [ ] Implement Redis for caching

## 🧪 Example: User Input & Output

### User Input Form (via browser):
```
┌─────────────────────────────────────┐
│ Note Title                          │
├─────────────────────────────────────┤
│ Write your note here...             │
│                                     │
│                                     │
└─────────────────────────────────────┘
        [ Add Note ]
```

### Example Note Input:
**Title**: "IAM Policy Review"  
**Content**: "Don't forget to review the IAM policy lecture notes."

### Expected Output on Webpage:
```
🕒 2025-07-12 21:15:07
📌 IAM Policy Review
Don't forget to review the IAM policy lecture notes.

    [ Edit ]  [ Delete ]
```

**Note**: Each new note appears at the top of the list with its creation timestamp. The most recent notes are always displayed first.

## 🎯 Why These Deployment Choices?

- **`/opt` directory**: Standard Linux location for optional third-party software, avoids SELinux home directory restrictions
- **Port 8000**: No special permissions required (unlike port 80), easier to debug
- **systemd**: Modern init system, automatic restarts, easy log management
- **Gunicorn**: Production-grade WSGI server, supports multiple workers, better than Flask dev server
- **EBS volumes**: Separate backups from main instance, snapshots, easy to detach/attach

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
