class AudioWaveform {
  private file?: Blob = undefined;

  private audioContext = new AudioContext();

  private audioBuffer?: AudioBuffer;

  constructor(private url: string) {}

  async fetchFile() {
    try {
      const response = await fetch(this.url);
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      return this.audioBuffer.getChannelData(0);
    } catch (error) {
      return error;
    }
  }
}

export default AudioWaveform;
