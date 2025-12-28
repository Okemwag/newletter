package database

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

var Redis *redis.Client
var ctx = context.Background()

func ConnectRedis() {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "localhost:6379"
	}

	redisPassword := os.Getenv("REDIS_PASSWORD")

	Redis = redis.NewClient(&redis.Options{
		Addr:     redisURL,
		Password: redisPassword,
		DB:       0,
	})

	// Test connection
	_, err := Redis.Ping(ctx).Result()
	if err != nil {
		log.Printf("Warning: Redis connection failed: %v (rate limiting disabled)", err)
		Redis = nil
		return
	}

	log.Println("Redis connection established")
}

func GetRedis() *redis.Client {
	return Redis
}

func IsRedisConnected() bool {
	return Redis != nil
}

// Cache helpers
func CacheSet(key string, value interface{}, expiration time.Duration) error {
	if Redis == nil {
		return nil
	}
	return Redis.Set(ctx, key, value, expiration).Err()
}

func CacheGet(key string) (string, error) {
	if Redis == nil {
		return "", nil
	}
	return Redis.Get(ctx, key).Result()
}

func CacheDelete(key string) error {
	if Redis == nil {
		return nil
	}
	return Redis.Del(ctx, key).Err()
}

func CacheIncr(key string) (int64, error) {
	if Redis == nil {
		return 0, nil
	}
	return Redis.Incr(ctx, key).Result()
}

func CacheExpire(key string, expiration time.Duration) error {
	if Redis == nil {
		return nil
	}
	return Redis.Expire(ctx, key, expiration).Err()
}
