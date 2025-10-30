#!/bin/bash
# ============================================================================
# Script de Utilidades Docker
# ============================================================================
# Este script proporciona comandos útiles para gestionar los contenedores Docker

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo "Uso: ./docker-utils.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  start-dev      - Iniciar servicios en modo desarrollo"
    echo "  start-prod     - Iniciar servicios en modo producción"
    echo "  stop           - Detener servicios"
    echo "  restart        - Reiniciar servicios"
    echo "  logs           - Ver logs de los servicios"
    echo "  logs-app       - Ver logs solo de la aplicación"
    echo "  logs-db         - Ver logs solo de MongoDB"
    echo "  shell-app      - Abrir shell en el contenedor de la app"
    echo "  shell-db       - Abrir mongosh en el contenedor de MongoDB"
    echo "  build          - Construir imágenes"
    echo "  clean          - Limpiar contenedores, imágenes y volúmenes"
    echo "  status         - Ver estado de los servicios"
    echo "  health         - Verificar health checks"
    echo "  backup-db      - Hacer backup de MongoDB"
    echo "  restore-db      - Restaurar backup de MongoDB"
    echo ""
}

# Función para iniciar desarrollo
start_dev() {
    echo -e "${GREEN}🚀 Iniciando servicios en modo desarrollo...${NC}"
    docker-compose -f docker-compose.dev.yml up -d --build
    echo -e "${GREEN}✅ Servicios iniciados${NC}"
    echo ""
    echo "Aplicación: http://localhost:3001"
    echo "Health Check: http://localhost:3001/health"
    echo ""
    echo "Para ver logs: ./docker-utils.sh logs"
}

# Función para iniciar producción
start_prod() {
    echo -e "${GREEN}🚀 Iniciando servicios en modo producción...${NC}"
    docker-compose up -d --build
    echo -e "${GREEN}✅ Servicios iniciados${NC}"
    echo ""
    echo "Aplicación: http://localhost:3001"
    echo "Health Check: http://localhost:3001/health"
    echo ""
    echo "Para ver logs: ./docker-utils.sh logs"
}

# Función para detener servicios
stop() {
    echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"
    docker-compose down
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    echo -e "${GREEN}✅ Servicios detenidos${NC}"
}

# Función para reiniciar servicios
restart() {
    echo -e "${YELLOW}🔄 Reiniciando servicios...${NC}"
    docker-compose restart
    echo -e "${GREEN}✅ Servicios reiniciados${NC}"
}

# Función para ver logs
logs() {
    docker-compose logs -f
}

logs_app() {
    docker-compose logs -f app
}

logs_db() {
    docker-compose logs -f mongodb
}

# Función para abrir shell en app
shell_app() {
    echo -e "${GREEN}🐚 Abriendo shell en contenedor de aplicación...${NC}"
    docker-compose exec app sh
}

# Función para abrir mongosh
shell_db() {
    echo -e "${GREEN}🐚 Abriendo mongosh en contenedor de MongoDB...${NC}"
    docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
}

# Función para construir imágenes
build() {
    echo -e "${GREEN}🔨 Construyendo imágenes...${NC}"
    docker-compose build --no-cache
    echo -e "${GREEN}✅ Imágenes construidas${NC}"
}

# Función para limpiar
clean() {
    echo -e "${RED}🧹 Limpiando contenedores, imágenes y volúmenes...${NC}"
    read -p "¿Estás seguro? Esto eliminará todos los datos (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true
        docker system prune -f
        echo -e "${GREEN}✅ Limpieza completada${NC}"
    else
        echo -e "${YELLOW}❌ Limpieza cancelada${NC}"
    fi
}

# Función para ver estado
status() {
    echo -e "${GREEN}📊 Estado de los servicios:${NC}"
    docker-compose ps
    echo ""
    echo -e "${GREEN}📊 Health checks:${NC}"
    docker-compose ps --format "table {{.Name}}\t{{.Status}}"
}

# Función para verificar health
health() {
    echo -e "${GREEN}🏥 Verificando health checks...${NC}"
    echo ""
    echo "Aplicación:"
    curl -s http://localhost:3001/health | jq . || echo "❌ Aplicación no responde"
    echo ""
    echo "MongoDB:"
    docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')" --quiet || echo "❌ MongoDB no responde"
}

# Función para backup de DB
backup_db() {
    BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).archive"
    echo -e "${GREEN}💾 Haciendo backup de MongoDB...${NC}"
    docker-compose exec mongodb mongodump --archive=/tmp/${BACKUP_FILE} --gzip
    docker-compose cp mongodb:/tmp/${BACKUP_FILE} ./backups/${BACKUP_FILE}
    echo -e "${GREEN}✅ Backup guardado en ./backups/${BACKUP_FILE}${NC}"
}

# Función para restaurar DB
restore_db() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ Error: Especifica el archivo de backup${NC}"
        echo "Uso: ./docker-utils.sh restore-db <archivo-backup>"
        exit 1
    fi
    echo -e "${GREEN}📥 Restaurando backup de MongoDB...${NC}"
    docker-compose cp "$1" mongodb:/tmp/restore.archive
    docker-compose exec mongodb mongorestore --archive=/tmp/restore.archive --gzip
    echo -e "${GREEN}✅ Backup restaurado${NC}"
}

# Ejecutar comando
case "$1" in
    start-dev)
        start_dev
        ;;
    start-prod)
        start_prod
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    logs-app)
        logs_app
        ;;
    logs-db)
        logs_db
        ;;
    shell-app)
        shell_app
        ;;
    shell-db)
        shell_db
        ;;
    build)
        build
        ;;
    clean)
        clean
        ;;
    status)
        status
        ;;
    health)
        health
        ;;
    backup-db)
        backup_db
        ;;
    restore-db)
        restore_db "$2"
        ;;
    *)
        show_help
        exit 1
        ;;
esac

