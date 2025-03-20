# Hướng Dẫn Triển Khai Dự Án Google Drive & Google Form Clone (Từng Bước)

Dưới đây là hướng dẫn triển khai chi tiết, sắp xếp theo **trình tự** để bạn hoặc AI agent có thể lần lượt thực thi.

---

## Bước 1: Chuẩn Bị Môi Trường
1. Cài đặt [Node.js](https://nodejs.org/en/) (phiên bản LTS).
2. Cài đặt [Docker](https://www.docker.com/) để quản lý các service.
3. Đảm bảo đã cài đặt [npm](https://www.npmjs.com/) (thường có sẵn khi cài Node.js).

---

## Bước 2: Cấu Trúc Dự Án
Dự án có cấu trúc thư mục như sau:

```
project-root/
│── backend/                 # Backend (NestJS)
│   ├── src/
│   │   ├── modules/         # Các module chính
│   │   │   ├── auth/        # Xác thực Firebase
│   │   │   ├── users/       # Quản lý người dùng
│   │   │   ├── drive/       # Quản lý file
│   │   │   ├── forms/       # Quản lý form
│   │   ├── main.ts          # Khởi động ứng dụng
│   ├── .env                 # Biến môi trường
│   ├── package.json
│
│── frontend/                # Frontend (Next.js)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── dashboard.tsx
│   │   │   ├── form.tsx
│   │   │   ├── drive.tsx
│   ├── package.json
│
│── docker/                  # Cấu hình Docker
│   ├── docker-compose.yml   # Chạy MinIO và PostgreSQL bằng Docker
│
│── database/                 # Cấu hình database
│   ├── migrations/
│
│── docs/                     # Tài liệu thiết kế
```

---

## Bước 3: Chạy Các Dịch Vụ Bằng Docker (MinIO & PostgreSQL)
1. Mở terminal và chuyển đến thư mục `docker/`:
   ```bash
   cd docker
   ```
2. Chạy các dịch vụ bằng lệnh Docker Compose:
   ```bash
   docker-compose up -d
   ```
   *Dịch vụ MinIO (lưu trữ S3) và PostgreSQL sẽ khởi chạy.*

---

## Bước 4: Cấu Hình Backend (NestJS)
1. Di chuyển vào thư mục `backend`:
   ```bash
   cd ../backend
   ```
2. Cài đặt các gói cần thiết:
   ```bash
   npm install
   ```
3. Tạo file `.env` từ file mẫu:
   ```bash
   cp .env.example .env
   ```
   *Điều chỉnh các biến môi trường bên trong `.env` (như URL kết nối DB, thông tin MinIO, khóa Firebase...)*
4. Khởi chạy backend ở chế độ phát triển:
   ```bash
   npm run start:dev
   ```

---

## Bước 5: Cấu Hình Frontend (Next.js)
1. Di chuyển vào thư mục `frontend`:
   ```bash
   cd ../frontend
   ```
2. Cài đặt dependencies:
   ```bash
   npm install
   ```
3. Chạy frontend:
   ```bash
   npm run dev
   ```
   *Ứng dụng Next.js sẽ khởi động, thường là tại http://localhost:3000*

---

## Bước 6: Kiểm Tra Hoạt Động Cơ Bản
1. Truy cập vào địa chỉ http://localhost:3000 (Frontend) để xem giao diện.
2. Backend thường chạy trên http://localhost:3001 (hoặc http://localhost:3000 tuỳ cấu hình NestJS).
3. Đảm bảo Docker container cho MinIO và PostgreSQL đang hoạt động.

---

## Bước 7: Tìm Hiểu Chức Năng Drive
- **Mục tiêu**: Lưu trữ folder, hình ảnh, video và form (gọi chung là file).
- **Chia sẻ**: Hỗ trợ chia sẻ file cho user khác hoặc công khai.

### API Drive (Backend)
1. `POST /drive/upload` → Upload file lên S3
2. `GET /drive/files` → Danh sách file
3. `DELETE /drive/:id` → Xóa file
4. `POST /drive/share` → Chia sẻ file

---

## Bước 8: Tìm Hiểu Chức Năng Form
- **Loại câu hỏi**: trắc nghiệm (chọn 1), trắc nghiệm (chọn nhiều), văn bản.
- **Chủ form**: thống kê câu trả lời.
- **Real-time notification** khi người dùng hoàn thành form.

### API Form (Backend)
1. `POST /forms/create` → Tạo form mới
2. `GET /forms/:id` → Lấy chi tiết form
3. `POST /forms/:id/submit` → Người dùng gửi câu trả lời (đồng thời kích hoạt thông báo real-time)
4. `GET /forms/:id/responses` → Chủ form xem thống kê phản hồi

---

## Bước 9: Thiết Lập Upload File Lên S3
### 9.1. Quy Trình Upload
1. **FE** gọi **API** ở **BE** để lấy **Pre-signed PUT URL**.
2. **FE** upload file trực tiếp lên **S3** (MinIO) bằng URL nhận được.
3. **FE** gửi request về **BE** để lưu thông tin file vào **database**.

### 9.2. Code Mẫu (Backend NestJS)
```typescript
import { S3 } from 'aws-sdk';

const s3 = new S3({
  endpoint: process.env.S3_ENDPOINT, // MinIO URL
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  s3ForcePathStyle: true,
});

async function getPresignedUrl(fileName: string) {
  return s3.getSignedUrlPromise('putObject', {
    Bucket: 'my-drive-bucket',
    Key: fileName,
    Expires: 60, // URL hết hạn sau 60 giây
  });
}
```

---

## Bước 10: Quản Lý Dữ Liệu Với PostgreSQL
### 10.1. Model Form
```typescript
@Entity()
export class Form {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'jsonb' })
  questions: object; // Danh sách câu hỏi

  @Column()
  createdBy: string; // Firebase UID
}
```

### 10.2. Model FormResponse
```typescript
@Entity()
export class FormResponse {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Form, (form) => form.responses)
  form: Form;

  @Column({ type: 'jsonb' })
  answers: object; // Câu trả lời của user
}
```

---

## Bước 11: Xử Lý Real-time Notification
1. Tích hợp **WebSocket** hoặc **Firebase Cloud Messaging** để thông báo ngay lập tức.
2. Mỗi khi người dùng submit form, backend sẽ bắn sự kiện real-time đến chủ form.

---

## Bước 12: Kiểm Tra Và Mở Rộng
- **Realtime Collaboration**: Cho phép nhiều người dùng cùng chỉnh sửa form.
- **Phân quyền nâng cao**: Hạn chế truy cập file hoặc form.
- **Báo cáo nâng cao**: Thống kê theo thời gian thực hoặc xuất CSV.

---

## Bước 13: Hoàn Thành
Bạn đã có một dự án mô phỏng Google Drive & Google Form với đầy đủ tính năng:
- **Drive**: Tải lên, chia sẻ, quản lý file
- **Form**: Tạo, thu thập và xem thống kê phản hồi
- **Real-time notification** khi có người gửi form

Chúc bạn thành công! 🚀

