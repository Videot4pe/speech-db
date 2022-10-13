package app

import (
	_ "backend/docs"
	"backend/internal/auth"
	waveform_generator "backend/internal/client/waveform-generator"
	"backend/internal/config"
	entity2 "backend/internal/domain/entity"
	"backend/internal/domain/files"
	"backend/internal/domain/markups"
	"backend/internal/domain/records"
	"backend/internal/domain/roles"
	"backend/internal/domain/speakers"
	"backend/internal/domain/user"
	"backend/pkg/client/s3"
	"backend/pkg/logging"
	"backend/pkg/metric"
	"backend/pkg/oauth"
	"context"
	"net/http"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/julienschmidt/httprouter"
	httpSwagger "github.com/swaggo/http-swagger"
)

type Handler interface {
	Register(router *httprouter.Router)
}

func NewRouter(ctx context.Context, config *config.Config, logger *logging.Logger, pgClient *pgxpool.Pool, s3Client *s3.Client) *httprouter.Router {
	router := httprouter.New()

	router.NotFound = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
	})

	logger.Println("swagger docs initializing")
	router.Handler(http.MethodGet, "/swagger", http.RedirectHandler("/swagger/index.html", http.StatusMovedPermanently))
	router.Handler(http.MethodGet, "/swagger/*any", httpSwagger.WrapHandler)

	logger.Println("heartbeat metric initializing")
	metricHandler := metric.Handler{}
	metricHandler.Register(router)

	router.ServeFiles("/uploads/*filepath", http.Dir("uploads"))

	filesStorage := files.NewFilesStorage(ctx, pgClient, logger)

	entityStorage := entity2.NewStorage(ctx, pgClient, logger)

	markupsStorage := markups.NewStorage(ctx, pgClient, logger)
	markupsHandler := markups.NewHandler(ctx, markupsStorage, entityStorage, logger)
	markupsHandler.Register(router)

	rolesStorage := roles.NewRolesStorage(ctx, pgClient, logger)
	rolesHandler := roles.NewRolesHandler(ctx, rolesStorage, logger)
	rolesHandler.Register(router)

	userStorage := user.NewUserStorage(ctx, pgClient, logger)
	userHandler := user.NewUserHandler(ctx, userStorage, logger, filesStorage, s3Client)
	userHandler.Register(router)

	authHandler := auth.NewAuthHandler(ctx, userStorage, filesStorage, s3Client, logger, config)
	authHandler.Register(router)

	oauthProvider := oauth.GetOAuthProvider(logger, config, userStorage)
	oauthProvider.UseVKAuth(router)
	oauthProvider.UseGoogleAuth(router)

	speakersStorage := speakers.NewSpeakersStorage(ctx, pgClient, logger)
	speakersHandler := speakers.NewSpeakersHandler(ctx, speakersStorage, logger)
	speakersHandler.Register(router)

	waveformGeneratorClient := waveform_generator.NewWaveformGeneratorClient(config.WaveformGenerator.IP, logger)
	recordsStorage := records.NewRecordsStorage(ctx, pgClient, logger)
	recordsHandler := records.NewRecordsHandler(ctx, config, recordsStorage, filesStorage, waveformGeneratorClient, s3Client, logger)
	recordsHandler.Register(router)

	return router
}
