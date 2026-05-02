package main

import (
	"log"

	"github.com/zillalikestocode/assetflow-core/internal/config"
	"github.com/zillalikestocode/assetflow-core/internal/database"
	"github.com/zillalikestocode/assetflow-core/internal/router"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	if err := database.RunMigrations(db); err != nil {
		log.Fatalf("failed to run migrations: %v", err)
	}

	r := router.Setup(db, cfg)

	log.Printf("server starting on %s", cfg.ServerAddress)
	if err := r.Run(cfg.ServerAddress); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
