class Waveform {
  private url?: string = undefined;

  private file?: Blob = undefined;

  constructor() {}

  setFile = async (fileUrl: string) => {
    this.url = fileUrl;
    const response = await fetch(fileUrl);
    this.file = await response.blob();
    console.log("file: ", this.file);
  };

  get fileObject() {
    return this.file;
  }

  get fileUrl() {
    return this.url;
  }
}

export default Waveform;
