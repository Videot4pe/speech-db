package config

import (
	"backend/pkg/utils"
	"log"
	"path/filepath"
	"sync"

	"github.com/ilyakaznacheev/cleanenv"
)

type Config struct {
	IsDebug       bool `env:"IS_DEBUG" env-default:"false"`
	IsDevelopment bool `env:"IS_DEV" env-default:"false"`
	Listen        struct {
		Type       string `env:"LISTEN_TYPE" env-default:"port" env-description:"'port' or 'sock'. if 'sock' then env 'SOCKET_FILE' is required"`
		BindIP     string `env:"BIND_IP" env-default:"0.0.0.0"`
		Port       string `env:"PORT" env-default:"5005"`
		SocketFile string `env:"SOCKET_FILE" env-default:"app.sock"`
		ServerIP   string `env:"SERVER_IP" env-default:"https://videot4pe.dev"`
	}
	AppConfig struct {
		LogLevel  string `env:"LOG_LEVEL" env-default:"trace"`
		JwtSecret string `env:"JWT_SECRET" env-default:"secret"`
		AdminUser struct {
			Email    string `env:"ADMIN_EMAIL" env-default:"admin"`
			Password string `env:"ADMIN_PWD" env-default:"admin"`
		}
		SentryURL string `env:"SENTRY_URL"`
	}
	PostgreSQL struct {
		Username string `env:"PGUSER" env-default:"postgres"`
		Host     string `env:"PGHOST" env-default:"localhost"`
		Password string `env:"PGPASSWORD" env-default:"123"`
		Database string `env:"PGDATABASE" env-default:"speechdb"`
		Port     string `env:"PGPORT" env-default:"5432"`
		Timeout  uint16 `env:"PGTIMEOUT" env-default:"5000"`
	}
	Mailer struct {
		Host     string `env:"MAILER_HOST" env-default:"smtp.gmail.com"`
		Port     int    `env:"MAILER_PORT" env-default:"587"`
		Username string `env:"MAILER_USERNAME" env-default:"email@email.email"`
		Password string `env:"MAILER_PASSWORD" env-default:"password"`
	}
	OAuth struct {
		Google struct {
			Key         string `env:"GOOGLE_OAUTH_KEY"`
			Secret      string `env:"GOOGLE_OAUTH_SECRET"`
			CallbackUrl string `env:"GOOGLE_OAUTH_CALLBACK_URL" env-default:"http://localhost:5005/api/oauth/google/callback"`
		}
		VK struct {
			Key         string `env:"VK_OAUTH_KEY"`
			Secret      string `env:"VK_OAUTH_SECRET"`
			CallbackUrl string `env:"VK_OAUTH_CALLBACK_URL" env-default:"http://localhost:5005/api/oauth/vk/callback"`
		}
	}
	S3 struct {
		Endpoint        string `env:"S3_ENDPOINT"`
		AccessKeyID     string `env:"S3_ACCESS_KEY_ID"`
		SecretAccessKey string `env:"S3_SECRET_ACCESS_KEY"`
		UseSSL          bool   `env:"S3_USE_SSL"`
		BucketName      string `env:"S3_BUCKET_NAME"`
		Location        string `env:"S3_LOCATION"`
	}
	Frontend struct {
		ServerIP string `env:"FRONTEND_SERVER_IP" env-default:"https://videot4pe.dev"`
	}
	WaveformGenerator struct {
		IP string `env:"WAVEFORM_GENERATOR_IP" env-default:"http://waveform-generator"`
	}
}

var instance *Config
var once sync.Once

func GetConfig() *Config {
	once.Do(func() {
		instance = &Config{}

		path := filepath.Join(utils.RootDir(), ".env")

		if err := cleanenv.ReadConfig(path, instance); err != nil {
			var helpText string
			help, _ := cleanenv.GetDescription(instance, &helpText)
			log.Print(help)
			log.Fatal(err)
		}
	})
	return instance
}
