package s3

import (
	"backend/internal/config"
	"backend/pkg/logging"
	"backend/pkg/uploader"
	"context"
	"fmt"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type Client struct {
	cfg    *config.Config
	logger *logging.Logger
	client *minio.Client
}

func (c *Client) UploadBase64(ctx context.Context, file string) (string, string, error) {
	fileUploader := uploader.GetUploader(c.logger)
	path, name, contentType, err := fileUploader.Base64Upload(file)
	if err != nil {
		c.logger.Error(err)
		return "", "", err
	}
	info, err := c.client.FPutObject(ctx, c.cfg.S3.BucketName, name, path, minio.PutObjectOptions{ContentType: contentType})
	if err != nil {
		c.logger.Error(err)
		return "", "", err
	}
	c.logger.Infof("Successfully uploaded %s of %v\n", name, info)

	err = fileUploader.RemoveFile(path)
	if err != nil {
		c.logger.Error(err)
		return "", "", err
	}

	return path, name, nil
}

func (c *Client) GetFile(ctx context.Context, name string) (string, error) {
	//object, err := c.client.GetObject(ctx, c.cfg.S3.BucketName, name, minio.GetObjectOptions{})
	//if err != nil {
	//	c.logger.Error(err)
	//	return nil, err
	//}
	//c.logger.Info(object)
	path := fmt.Sprintf("https://%s/%s/%s", c.cfg.S3.Endpoint, c.cfg.S3.BucketName, name)
	c.logger.Infof("File url: %s", path)
	return path, nil
}

func NewS3Client(cfg *config.Config, logger *logging.Logger) (*Client, error) {
	minioClient, err := minio.New(cfg.S3.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.S3.AccessKeyID, cfg.S3.SecretAccessKey, ""),
		Secure: cfg.S3.UseSSL,
	})
	if err != nil {
		logger.Error(err)
		return nil, err
	}
	return &Client{
		client: minioClient,
		logger: logger,
		cfg:    cfg,
	}, nil
}
