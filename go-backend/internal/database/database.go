package database

import (
	"fmt"
	"log"
	"time"

	"github.com/okemwag/newsletter/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

const (
	DefaultMaxOpenConns    = 50
	DefaultMaxIdleConns    = 10
	DefaultConnMaxLifetime = 5 * time.Minute
)

func Connect() {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		config.AppConfig.DBHost,
		config.AppConfig.DBPort,
		config.AppConfig.DBUser,
		config.AppConfig.DBPassword,
		config.AppConfig.DBName,
		config.AppConfig.DBSSLMode,
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatalf("Failed to get underlying sql.DB: %v", err)
	}

	sqlDB.SetMaxOpenConns(DefaultMaxOpenConns)
	sqlDB.SetMaxIdleConns(DefaultMaxIdleConns)
	sqlDB.SetConnMaxLifetime(DefaultConnMaxLifetime)

	log.Println("Database connection established")
}

func GetDB() *gorm.DB {
	return DB
}

// PingDB returns nil if the database is reachable
func PingDB() error {
	if DB == nil {
		return fmt.Errorf("database not connected")
	}
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Ping()
}
