package main

import (
	"backend/internal/app"
	"backend/internal/config"
	"backend/pkg/logging"
	"github.com/getsentry/sentry-go"
	"log"
)

func main() {
	log.Print("config init")
	cfg := config.GetConfig()

	log.Print("logger init")
	logger := logging.GetLogger(cfg.AppConfig.LogLevel)

	err := sentry.Init(sentry.ClientOptions{
		Dsn:              cfg.AppConfig.SentryURL,
		TracesSampleRate: 1.0,
	})
	if err != nil {
		log.Fatalf("sentry.Init: %s", err)
	}

	a, err := app.NewApp(cfg, logger)
	if err != nil {
		logger.Fatal(err)
	}

	logger.Println("Running Application")
	a.Run()
}
