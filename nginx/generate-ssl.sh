#!/bin/bash

# Generate self-signed SSL certificates for development
# Usage: ./generate-ssl.sh

SSL_DIR="$(dirname "$0")/ssl"
mkdir -p "$SSL_DIR"

# Generate private key and self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$SSL_DIR/key.pem" \
    -out "$SSL_DIR/cert.pem" \
    -subj "/C=CH/ST=Vaud/L=Montreux/O=MOB/OU=Dev/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"

echo "SSL certificates generated in $SSL_DIR"
echo "  - cert.pem (certificate)"
echo "  - key.pem (private key)"
