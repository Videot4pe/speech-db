package waveform_generator

import (
	"backend/pkg/logging"
	"fmt"
	"gopkg.in/h2non/gentleman.v2"
	"gopkg.in/h2non/gentleman.v2/plugins/body"
)

type WaveformGeneratorClient struct {
	Client *gentleman.Client
	logger *logging.Logger
}

func NewWaveformGeneratorClient(host string, logger *logging.Logger) *WaveformGeneratorClient {
	client := gentleman.New()
	client.URL(host)
	return &WaveformGeneratorClient{
		Client: client,
		logger: logger,
	}
}

func (client *WaveformGeneratorClient) SendAudioUrl(url, callbackUrl string) {
	req := client.Client.Request()
	req.Path("/api/generator/create")
	req.Method("POST")

	data := map[string]string{"url": url, "callbackUrl": callbackUrl}
	req.Use(body.JSON(data))

	res, err := req.Send()
	if err != nil {
		fmt.Printf("Request error: %s\n", err)
		return
	}
	if !res.Ok {
		fmt.Printf("Invalid server response: %d\n", res.StatusCode)
		return
	}
}
