#!/bin/bash

# Cấu hình
SERVER="root@157.245.195.157"  # Thay YOUR_SERVER_IP bằng IP của server thật
FRONTEND_DIR="/var/www/html/frontend"
BACKEND_DIR="/var/www/app/backend"

echo "🚀 Bắt đầu quá trình deploy..."

# 1. Tạo thư mục trên server nếu chưa tồn tại
echo "📁 Tạo thư mục trên server..."
ssh -i ~/.ssh/digital $SERVER "mkdir -p $FRONTEND_DIR $BACKEND_DIR"

# 2. Deploy frontend
echo "🎨 Deploy frontend..."
rsync -avz -e "ssh -i ~/.ssh/digital" frontend/ $SERVER:$FRONTEND_DIR/

# 3. Deploy backend
echo "⚙️ Deploy backend..."
rsync -avz -e "ssh -i ~/.ssh/digital" backend/ $SERVER:$BACKEND_DIR/

# 4. Cài đặt dependencies trên server
echo "📦 Cài đặt dependencies..."
ssh -i ~/.ssh/digital $SERVER "cd $FRONTEND_DIR && npm install --omit=dev"
ssh -i ~/.ssh/digital $SERVER "cd $BACKEND_DIR && npm install --omit=dev"

# 5. Copy file môi trường
echo "🔒 Copy file môi trường..."
scp -i ~/.ssh/digital frontend/.env.production.local $SERVER:$FRONTEND_DIR/.env
scp -i ~/.ssh/digital backend/.env.production.local $SERVER:$BACKEND_DIR/.env

# 6. Backup database và run migrations
echo "💾 Backing up database..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Cấp quyền cho user postgres
# Tiếp tục với backup và migrations
ssh -i ~/.ssh/digital $SERVER "mkdir -p /root/backups && \
    pg_dump -U postgres driveform > /root/backups/driveform_${TIMESTAMP}.sql"

echo "🔄 Running database migrations..."
ssh -i ~/.ssh/digital $SERVER "cd $BACKEND_DIR && \
    if npm run migration:run; then \
        echo '✅ Migrations completed successfully'; \
    else \
        echo '❌ Migration failed. Rolling back to backup...'; \
        psql -U postgres driveform < /root/backups/driveform_${TIMESTAMP}.sql; \
        exit 1; \
    fi"

# Kiểm tra kết quả của migration
if [ $? -ne 0 ]; then
    echo "❌ Deploy thất bại do lỗi migration!"
    exit 1
fi

# 7. Khởi động lại services
echo "🔄 Khởi động lại services..."
ssh -i ~/.ssh/digital $SERVER "pm2 restart all"

echo "✅ Deploy hoàn tất!"

# Cleanup old backups (giữ lại backup 7 ngày gần nhất)
echo "🧹 Cleaning up old backups..."
ssh -i ~/.ssh/digital $SERVER "find /root/backups -type f -mtime +7 -delete"