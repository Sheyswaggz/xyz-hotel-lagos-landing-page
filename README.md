# XYZ Hotel Lagos - Landing Page

[![CI Pipeline](https://github.com/xyz-hotel/landing/actions/workflows/ci.yml/badge.svg)](https://github.com/xyz-hotel/landing/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

A modern, responsive landing page for XYZ Hotel Lagos built with HTML5, CSS3, and vanilla JavaScript. Features include SEO optimization, accessibility compliance, Docker containerization, and Kubernetes deployment with CI/CD pipeline.

## 🌟 Features

- **Responsive Design**: Mobile-first approach with seamless experience across all devices
- **SEO Optimized**: Structured data, meta tags, sitemap, and robots.txt for search engine visibility
- **Accessibility**: WCAG 2.1 Level AA compliant with ARIA labels and keyboard navigation
- **Performance**: Lazy loading, optimized images, and efficient CSS/JS delivery
- **Image Gallery**: Interactive lightbox with keyboard navigation and touch support
- **Contact Form**: Client-side validation with real-time feedback and sanitization
- **Docker Ready**: Production-ready containerization with security best practices
- **Kubernetes Deployment**: Complete K8s manifests with HPA, ingress, and monitoring
- **CI/CD Pipeline**: Automated testing, linting, security scanning, and deployment
- **Progressive Enhancement**: Works without JavaScript, enhanced with JS features

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Web Server**: Nginx 1.27 Alpine
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Testing**: Playwright
- **Linting**: ESLint, Stylelint, HTMLValidate, Markdownlint

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: >= 18.0.0 ([Download](https://nodejs.org))
- **npm**: >= 9.0.0 (comes with Node.js)
- **Docker**: >= 24.0.0 ([Download](https://www.docker.com/get-started))
- **kubectl**: >= 1.28.0 ([Install Guide](https://kubernetes.io/docs/tasks/tools/))
- **Git**: Latest version ([Download](https://git-scm.com/downloads))

Optional for Kubernetes deployment:
- **Minikube** or **Kind** for local Kubernetes cluster
- **Helm**: >= 3.0.0 for package management

## 🚀 Local Development Setup

### 1. Clone the Repository