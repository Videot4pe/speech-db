import type { FileValidated } from "@dropzone-ui/react";
import { Dropzone, FileItem } from "@dropzone-ui/react";
import { useState } from "react";

import { getBase64 } from "../../utils/base-64";

interface UploaderProps {
  onFileUpload: (file: string) => void;
  file?: string;
}

const Uploader = ({ onFileUpload, file }: UploaderProps) => {
  const [files, setFiles] = useState<FileValidated[]>([]);

  const onUpdate = async (incomingFiles: FileValidated[]) => {
    if (!incomingFiles.length) {
      return;
    }
    const base64file = await getBase64(incomingFiles[0].file);
    if (!base64file) {
      return;
    }
    onFileUpload(base64file);
  };

  const onClean = () => {
    setFiles([]);
  };

  return (
    <Dropzone
      minHeight="100px"
      maxFiles={1}
      maxFileSize={29980000}
      accept=".mp3,audio/*"
      onChange={onUpdate}
      onClean={onClean}
      value={files}
    >
      {file && <FileItem {...file} preview />}
    </Dropzone>
  );
};

export default Uploader;
