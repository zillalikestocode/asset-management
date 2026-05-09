package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL   string
	ServerAddress string
	JWTSecret     string
	Env           string

	SMTPHost     string
	SMTPPort     string
	SMTPUsername string
	SMTPPassword string
	SMTPFrom     string
}

func Load() *Config {
	godotenv.Load()

	return &Config{
		DatabaseURL:   getEnv("DATABASE_URL", "postgres://localhost:5432/asset_management?sslmode=disable"),
		ServerAddress: getEnv("SERVER_ADDRESS", ":8080"),
		JWTSecret:     getEnv("JWT_SECRET", "supersecretkey"),
		Env:           getEnv("ENV", "development"),

		SMTPHost:     getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:     getEnv("SMTP_PORT", "587"),
		SMTPUsername: getEnv("SMTP_USERNAME", "emmanuelngoka778@gmail.com"),
		SMTPPassword: getEnv("SMTP_PASSWORD", "xfqarbnqflamxvuv"),
		SMTPFrom:     getEnv("SMTP_FROM", "emmanuelngoka778@gmail.com"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
