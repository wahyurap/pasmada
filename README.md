# PASMADA - Parsadaan Alumni SMAN Sada

Website resmi organisasi alumni SMAN 1 Panyabungan, Kabupaten Mandailing Natal, Sumatera Utara.

## Fitur

- **Autentikasi** — Register & Login dengan verifikasi email
- **Direktori Alumni** — Cari alumni berdasarkan nama, tahun lulus, pekerjaan, dan alamat (hanya untuk member terdaftar)
- **Berita** — Publikasi berita dan artikel (publik)
- **Agenda** — Jadwal kegiatan dan acara (publik)
- **Galeri** — Album foto kegiatan (publik)
- **Admin Panel** — Kelola semua konten website
- **Profil** — Edit data profil alumni

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL + Prisma 7
- **Auth**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **Runtime**: Node.js 22

---

## Panduan Deploy ke VPS

### Prasyarat

- VPS Ubuntu 22.04 LTS (minimal 1 GB RAM)
- Domain yang sudah diarahkan ke IP VPS
- Akses SSH ke server

---

### 1. Siapkan Server

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Node.js 22 via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Install Nginx & Certbot
sudo apt install -y nginx certbot python3-certbot-nginx git
```

---

### 2. Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/wahyurap/pasmada.git
sudo chown -R $USER:$USER pasmada
cd pasmada
```

---

### 3. Setup Environment

```bash
cp .env.example .env
nano .env
```

Isi semua variabel berikut:

```env
# Database — sesuai konfigurasi docker-compose
DATABASE_URL="postgresql://pasmada:pasmada_secret@localhost:5432/pasmada"

# Generate dengan: openssl rand -base64 32
AUTH_SECRET="isi-dengan-secret-random-yang-panjang"
AUTH_URL="https://domain-anda.com"

# SMTP Email (contoh Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="email@gmail.com"
SMTP_PASSWORD="app-password-gmail"
SMTP_FROM="PASMADA <noreply@domain-anda.com>"

NEXT_PUBLIC_APP_URL="https://domain-anda.com"
```

> **Catatan Gmail:** Gunakan App Password, bukan password biasa.
> Aktifkan di: Google Account → Security → 2-Step Verification → App Passwords

---

### 4. Jalankan Database (Docker)

```bash
# Jalankan hanya service database
docker compose up -d db

# Verifikasi DB berjalan
docker compose ps
```

---

### 5. Install Dependensi & Setup Database

```bash
npm install --legacy-peer-deps

# Generate Prisma client
npm run db:generate

# Buat tabel di database
npm run db:push

# Isi data awal (admin + sample data)
npm run db:seed
```

Akun admin default:
- **Email**: admin@pasmada.org
- **Password**: admin123

> **Penting**: Ganti password admin setelah pertama login melalui Panel Admin

---

### 6. Build Aplikasi

```bash
npm run build
```

---

### 7. Jalankan dengan PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Jalankan aplikasi
pm2 start npm --name "pasmada" -- start -- --port 3000

# Simpan konfigurasi PM2 agar otomatis restart saat server reboot
pm2 save
pm2 startup
# Jalankan perintah yang ditampilkan oleh output pm2 startup
```

---

### 8. Konfigurasi Nginx (Reverse Proxy)

```bash
sudo nano /etc/nginx/sites-available/pasmada
```

Isi dengan:

```nginx
server {
    listen 80;
    server_name domain-anda.com www.domain-anda.com;

    # Limit upload size (untuk foto galeri)
    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded files langsung via Nginx
    location /uploads/ {
        alias /var/www/pasmada/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Aktifkan konfigurasi
sudo ln -s /etc/nginx/sites-available/pasmada /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### 9. SSL Certificate (HTTPS)

```bash
sudo certbot --nginx -d domain-anda.com -d www.domain-anda.com
```

Certbot akan otomatis memperbarui konfigurasi Nginx dengan HTTPS.

---

### 10. Verifikasi

Buka browser ke `https://domain-anda.com` — website PASMADA siap!

---

## Update Website

Ketika ada perubahan kode, lakukan update dengan:

```bash
cd /var/www/pasmada

# Pull perubahan terbaru
git pull

# Install dependensi baru (jika ada)
npm install --legacy-peer-deps

# Jalankan migrasi database (jika ada perubahan schema)
npm run db:push

# Build ulang
npm run build

# Restart aplikasi
pm2 restart pasmada
```

---

## Backup Database

```bash
# Backup manual
docker exec pasmada-db-1 pg_dump -U pasmada pasmada > backup_$(date +%Y%m%d).sql

# Restore dari backup
docker exec -i pasmada-db-1 psql -U pasmada pasmada < backup_20260101.sql
```

Tambahkan ke cron untuk backup otomatis setiap hari pukul 02.00:

```bash
crontab -e
# Tambahkan baris berikut:
0 2 * * * docker exec pasmada-db-1 pg_dump -U pasmada pasmada > /var/backups/pasmada/backup_$(date +\%Y\%m\%d).sql
```

---

## Struktur Folder

```
pasmada/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Data awal
├── public/
│   ├── logo.png            # Logo PASMADA
│   └── uploads/            # File yang diupload (galeri, berita)
├── src/
│   ├── app/
│   │   ├── (auth)/         # Login, Register, Verify Email
│   │   ├── (public)/       # Homepage, Berita, Agenda, Galeri, Kontak
│   │   ├── (protected)/    # Alumni Search, Profil (butuh login)
│   │   ├── admin/          # Panel Admin
│   │   └── api/            # REST API endpoints
│   ├── components/         # Komponen reusable
│   ├── lib/                # Auth, DB, Email, Upload utilities
│   └── proxy.ts            # Route protection middleware
├── docker-compose.yml      # PostgreSQL container
├── Dockerfile              # Build image untuk production
└── .env.example            # Template environment variables
```

---

## Akun Default (Seed)

| Role   | Email                       | Password  |
|--------|-----------------------------|-----------|
| Admin  | admin@pasmada.org           | admin123  |
| Alumni | ahmad.rizki@example.com     | alumni123 |

> Segera ganti password setelah deploy pertama kali!

---

## Lisensi

Hak cipta © 2026 PASMADA - Parsadaan Alumni SMAN Sada. Semua hak dilindungi.
