#!/bin/bash

# CRM System - Docker Quick Start Script
# This script sets up and runs the CRM system using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🐳 CRM System - Docker Deployment${NC}"
echo -e "${CYAN}=================================${NC}"
echo ""

# Check if Docker is installed
echo -e "${YELLOW}Checking Docker installation...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓ Docker found: $DOCKER_VERSION${NC}"
else
    echo -e "${RED}✗ Docker not found. Please install Docker first.${NC}"
    echo -e "${YELLOW}Visit: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo -e "${GREEN}✓ Docker Compose found: $COMPOSE_VERSION${NC}"
else
    echo -e "${RED}✗ Docker Compose not found.${NC}"
    exit 1
fi

echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.docker.example .env
    echo -e "${GREEN}✓ .env file created.${NC}"
    echo ""
    echo -e "${YELLOW}Please edit .env file with your configuration:${NC}"
    echo -e "${YELLOW}  nano .env${NC}"
    echo ""
    read -p "Have you configured the .env file? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Please configure the .env file and run this script again.${NC}"
        exit 0
    fi
fi

echo ""
echo -e "${YELLOW}Building Docker images...${NC}"
docker-compose build

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build failed. Please check the error messages above.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed successfully${NC}"
echo ""

echo -e "${YELLOW}Starting services...${NC}"
docker-compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to start services. Please check the error messages above.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Services started successfully${NC}"
echo ""

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

echo ""
echo -e "${CYAN}==================================${NC}"
echo -e "${GREEN}🎉 CRM System is now running!${NC}"
echo -e "${CYAN}==================================${NC}"
echo ""
echo -e "${YELLOW}Access the application:${NC}"
echo -e "  Frontend:    ${NC}http://localhost"
echo -e "  Backend API: ${NC}http://localhost:5000"
echo -e "  Health:      ${NC}http://localhost:5000/health"
echo ""
echo -e "${YELLOW}Default login credentials:${NC}"
echo -e "  Admin:     ${NC}admin@crm.com / Admin@123"
echo -e "  Manager:   ${NC}manager@crm.com / Manager@123"
echo -e "  Sales:     ${NC}sales@crm.com / Sales@123"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  View logs:        ${NC}docker-compose logs -f"
echo -e "  Stop services:    ${NC}docker-compose down"
echo -e "  Restart services: ${NC}docker-compose restart"
echo -e "  Check status:     ${NC}docker-compose ps"
echo ""
echo -e "${CYAN}Press Ctrl+C to exit logs view${NC}"
echo ""
sleep 2
docker-compose logs -f
