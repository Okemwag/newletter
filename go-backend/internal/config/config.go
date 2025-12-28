package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
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
}

var AppConfig *Config

func Load() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	refreshDays, _ := strconv.Atoi(getEnv("JWT_REFRESH_EXPIRATION_DAYS", "7"))

	AppConfig = &Config{
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", "password"),
		DBName:     getEnv("DB_NAME", "newsletter"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),

		JWTSecret:               getEnv("JWT_SECRET", "default-secret-key"),
		JWTExpiration:           getEnv("JWT_EXPIRATION", "1h"),
		JWTRefreshExpirationDays: refreshDays,

		ServerPort: getEnv("SERVER_PORT", "8080"),
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
