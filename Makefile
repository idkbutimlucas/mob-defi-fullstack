# ==============================================================================
# Train Routing API - Makefile
# ==============================================================================
# Usage:
#   make init     - First time setup (env, ssl, jwt, db)
#   make start    - Start all services
#   make stop     - Stop all services
#   make test     - Run all tests
#   make lint     - Run linters
# ==============================================================================

.PHONY: init start stop restart logs test lint clean help

# Colors
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m

# ==============================================================================
# Main targets
# ==============================================================================

## init: Complete first-time setup (one command deployment)
init: env ssl jwt
	@echo "$(GREEN)Starting services...$(NC)"
	docker compose up -d --build
	@echo "$(YELLOW)Waiting for database to be ready...$(NC)"
	@sleep 5
	@echo "$(GREEN)Installing backend dependencies...$(NC)"
	docker compose exec -T backend composer install --no-interaction
	@echo "$(GREEN)Installing frontend dependencies...$(NC)"
	docker compose exec -T frontend npm install
	@echo "$(GREEN)Creating database schema...$(NC)"
	docker compose exec -T backend php bin/console doctrine:schema:create --no-interaction || \
		docker compose exec -T backend php bin/console doctrine:schema:update --force --no-interaction
	@echo ""
	@echo "$(GREEN)============================================$(NC)"
	@echo "$(GREEN) Setup complete!$(NC)"
	@echo "$(GREEN)============================================$(NC)"
	@echo ""
	@echo "  Frontend:  https://localhost"
	@echo "  API:       https://localhost/api/v1"
	@echo "  Storybook: make storybook (then http://localhost:6006)"
	@echo ""

## start: Start all services
start:
	docker compose up -d

## stop: Stop all services
stop:
	docker compose down

## restart: Restart all services
restart: stop start

## logs: Show logs
logs:
	docker compose logs -f

## storybook: Start Storybook UI
storybook:
	docker compose --profile dev up -d storybook

# ==============================================================================
# Setup targets
# ==============================================================================

## env: Create .env files from examples
env:
	@if [ ! -f .env ]; then \
		echo "$(GREEN)Creating .env file...$(NC)"; \
		cp .env.example .env; \
		echo "$(YELLOW)Edit .env to customize your configuration$(NC)"; \
	else \
		echo "$(YELLOW).env already exists, skipping$(NC)"; \
	fi
	@if [ ! -f backend/.env ]; then \
		echo "$(GREEN)Creating backend/.env file...$(NC)"; \
		cp backend/.env.example backend/.env; \
	fi

## ssl: Generate self-signed SSL certificates
ssl:
	@if [ ! -f nginx/ssl/cert.pem ]; then \
		echo "$(GREEN)Generating SSL certificates...$(NC)"; \
		mkdir -p nginx/ssl; \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
			-keyout nginx/ssl/key.pem \
			-out nginx/ssl/cert.pem \
			-subj "/CN=localhost" 2>/dev/null; \
	else \
		echo "$(YELLOW)SSL certificates already exist, skipping$(NC)"; \
	fi

## jwt: Generate JWT keys
jwt:
	@if [ ! -f backend/config/jwt/private.pem ]; then \
		echo "$(GREEN)Generating JWT keys...$(NC)"; \
		mkdir -p backend/config/jwt; \
		openssl genpkey -algorithm RSA -out backend/config/jwt/private.pem \
			-pkeyopt rsa_keygen_bits:4096 2>/dev/null; \
		openssl rsa -pubout -in backend/config/jwt/private.pem \
			-out backend/config/jwt/public.pem 2>/dev/null; \
	else \
		echo "$(YELLOW)JWT keys already exist, skipping$(NC)"; \
	fi

# ==============================================================================
# Development targets
# ==============================================================================

## test: Run all tests
test: test-backend test-frontend

## test-backend: Run backend tests
test-backend:
	docker compose exec -T backend composer test

## test-frontend: Run frontend tests
test-frontend:
	docker compose exec -T frontend npm run test -- --run

## lint: Run all linters
lint: lint-backend lint-frontend

## lint-backend: Run backend linters
lint-backend:
	docker compose exec -T backend composer lint
	docker compose exec -T backend composer analyse

## lint-frontend: Run frontend linters
lint-frontend:
	docker compose exec -T frontend npm run lint
	docker compose exec -T frontend npm run format:check

## coverage: Run tests with coverage
coverage:
	docker compose exec -T backend composer test -- --coverage-html var/coverage
	docker compose exec -T frontend npm run test -- --run --coverage

# ==============================================================================
# Database targets
# ==============================================================================

## db-create: Create database schema
db-create:
	docker compose exec -T backend php bin/console doctrine:schema:create

## db-update: Update database schema
db-update:
	docker compose exec -T backend php bin/console doctrine:schema:update --force

## db-drop: Drop database schema
db-drop:
	docker compose exec -T backend php bin/console doctrine:schema:drop --force

# ==============================================================================
# Cleanup targets
# ==============================================================================

## clean: Remove all generated files and volumes
clean: stop
	docker compose down -v --remove-orphans
	rm -rf nginx/ssl/*.pem
	rm -rf backend/config/jwt/*.pem
	rm -rf backend/var/cache/* backend/var/log/*
	rm -rf frontend/node_modules frontend/dist

## prune: Docker system prune
prune:
	docker system prune -af

# ==============================================================================
# Help
# ==============================================================================

## help: Show this help
help:
	@echo ""
	@echo "$(GREEN)Train Routing API - Available commands$(NC)"
	@echo ""
	@sed -n 's/^##//p' $(MAKEFILE_LIST) | column -t -s ':' | sed -e 's/^/  /'
	@echo ""

# Default target
.DEFAULT_GOAL := help
