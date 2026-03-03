package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv string // development, staging, production

	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	JWTSecret               string
	JWTExpiration           string
	JWTRefreshExpirationDays int

	ServerPort string

	// LogLevel for structured logging (debug, info, warn, error)
	LogLevel string
}

var AppConfig *Config

const (
	EnvDevelopment = "development"
	EnvStaging     = "staging"
	EnvProduction  = "production"

	MinJWTSecretLength = 32
)

func Load() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	appEnv := getEnv("APP_ENV", EnvDevelopment)
	appEnv = strings.ToLower(strings.TrimSpace(appEnv))
	if appEnv == "" {
		appEnv = EnvDevelopment
	}

	refreshDays, _ := strconv.Atoi(getEnv("JWT_REFRESH_EXPIRATION_DAYS", "7"))
	if refreshDays <= 0 {
		refreshDays = 7
	}

	jwtSecret := getEnv("JWT_SECRET", "")
	if appEnv == EnvProduction && jwtSecret == "" {
		log.Fatal("JWT_SECRET is required in production (APP_ENV=production). Set a strong secret (min 32 characters).")
	}
	if jwtSecret == "" {
		jwtSecret = "default-secret-key" // dev only
	}
	if appEnv == EnvProduction && len(jwtSecret) < MinJWTSecretLength {
		log.Fatalf("JWT_SECRET must be at least %d characters in production", MinJWTSecretLength)
	}

	dbSSLMode := getEnv("DB_SSLMODE", "disable")
	if appEnv == EnvProduction && dbSSLMode == "disable" {
		log.Println("Warning: DB_SSLMODE=disable in production. Consider using require or verify-full for encrypted connections.")
	}

	dbPassword := getEnv("DB_PASSWORD", "password")
	if appEnv == EnvProduction && dbPassword == "password" {
		log.Fatal("DB_PASSWORD must not be the default 'password' in production. Set a strong password.")
	}

	AppConfig = &Config{
		AppEnv:     appEnv,
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: dbPassword,
		DBName:     getEnv("DB_NAME", "newsletter"),
		DBSSLMode:  dbSSLMode,

		JWTSecret:               jwtSecret,
		JWTExpiration:            getEnv("JWT_EXPIRATION", "1h"),
		JWTRefreshExpirationDays: refreshDays,

		ServerPort: getEnv("SERVER_PORT", "8080"),
		LogLevel:   getEnv("LOG_LEVEL", "info"),
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return strings.TrimSpace(value)
	}
	return defaultValue
}

// IsProduction returns true when APP_ENV=production
func IsProduction() bool {
	return AppConfig != nil && AppConfig.AppEnv == EnvProduction
}
