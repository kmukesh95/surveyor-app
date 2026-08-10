# AWS EC2 Deployment Setup Guide for Surveyor App

This guide walks you through setting up your AWS EC2 server and linking GitHub Actions for automatic deployment on every push.

---

## 1. Launch AWS EC2 Instance

1. Log into your **AWS Management Console** and navigate to **EC2**.
2. Click **Launch Instance**.
3. **Instance Configuration**:
   - **Name**: `surveyor-app-server`
   - **AMI**: `Ubuntu 24.04 LTS` (or `Ubuntu 22.04 LTS`)
   - **Instance Type**: `t3.small` (recommended - 2 GB RAM) or `t3.micro` (free tier eligible)
4. **Key Pair**:
   - Create or select an existing `.pem` Key Pair (e.g. `surveyor-key.pem`). Save this safely.
5. **Network / Security Group Rules**:
   Allow inbound traffic for:
   - **SSH** (Port `22`) - Source: `0.0.0.0/0` (or your IP)
   - **HTTP** (Port `80`) - Source: `0.0.0.0/0`
   - **HTTPS** (Port `443`) - Source: `0.0.0.0/0`
6. Click **Launch Instance**.

---

## 2. One-Time EC2 Server Setup

Connect to your EC2 instance via SSH:
```bash
ssh -i surveyor-key.pem ubuntu@<YOUR-EC2-PUBLIC-IP>
```

Run the following commands on the server to install Docker & Docker Compose:

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
sudo apt install -y docker.io docker-compose-v2 git

# 3. Add ubuntu user to docker group (so sudo isn't required for docker)
sudo usermod -aG docker ubuntu
newgrp docker

# 4. Clone your GitHub Repository into home directory
cd ~
git clone https://github.com/YOUR_GITHUB_USERNAME/surveyor-app.git
cd surveyor-app
```

---

## 3. Configure GitHub Secrets for CI/CD Pipeline

In your GitHub repository:
1. Go to **Settings** > **Secrets and variables** > **Actions**.
2. Click **New repository secret** and add the following 3 secrets:

| Secret Name | Description / Value |
| :--- | :--- |
| **`EC2_HOST`** | Public IP address or Public IPv4 DNS of your EC2 instance (e.g. `54.210.12.34`) |
| **`EC2_USERNAME`** | `ubuntu` |
| **`EC2_SSH_KEY`** | Complete text contents of your `.pem` private key file (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`) |

---

## 4. Trigger Automatic Deployment

Whenever you push code changes to `main` or `master`:
```bash
git add .
git commit -m "feat: setup AWS Docker deployment"
git push origin main
```

1. **GitHub Actions** will automatically run linting and type-checking.
2. If tests pass, GitHub Actions will SSH into your AWS EC2 instance.
3. EC2 will pull the latest code, build Docker images, and launch the containers via `docker-compose up -d --build`.
4. Your application will be live at `http://<YOUR-EC2-PUBLIC-IP>`.

---

## 5. Helpful Docker Commands on EC2 Server

```bash
# Check container status
docker compose ps

# View backend logs
docker compose logs -f backend

# View frontend / Nginx logs
docker compose logs -f frontend

# Restart services
docker compose restart
```
