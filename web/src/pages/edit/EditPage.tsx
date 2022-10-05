import { Button } from "@chakra-ui/react";
import { useRef, useState } from "react";
import Edit from "./Edit"

function selectURL(n: number): string {
  if (n === 0) {
    return 'https://www.frolov-lib.ru/books/hi/ch03.files/image010.jpg'
  }
  return 'https://www.frolov-lib.ru/books/hi/ch03.files/image020.jpg'
}

interface IEdit {
  zoomIn: () => void
  zoomOut: () => void
}

const EditPage = () => {
  const [imageURL, setImageURL] = useState<string>(selectURL(0))
  const editRef = useRef<IEdit>(null);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div
          style={{
            width: '100px',
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'column',
            alignContent: 'flex-start'
          }}
        >
          <Button onClick={() => setImageURL(selectURL(0))}>
            Audio 0
          </Button>
          <Button onClick={() => setImageURL(selectURL(1))}>
            Audio 1
          </Button>
        </div>

        <div
          style={{
            width: '300px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Button onClick={() => editRef.current?.zoomOut()}>
            Zoom Out (-)
          </Button>
          <Button onClick={() => editRef.current?.zoomIn()}>
            Zoom In (+)
          </Button>
        </div>
      </div>

      <Edit ref={editRef} imageURL={imageURL} />
    </div>
  );
};

export default EditPage;
