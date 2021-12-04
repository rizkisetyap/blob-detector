/* eslint-disable @typescript-eslint/no-non-null-assertion */
import './style.css';

let imageOri: string | ArrayBuffer | null | undefined;
const form: HTMLFormElement =
  document.querySelector<HTMLFormElement>('#main-form')!;
const inputFile = form.querySelector<HTMLInputElement>('input[type=file]')!;

inputFile.addEventListener('change', function (event: InputEvent) {
  const file = (<HTMLInputElement>event.target).files;
  if (file && file.length > 0) {
    const reader = new FileReader();

    reader.onloadend = function (result) {
      const src = result.target?.result;
      imageOri = src;
      const imgElement = document.createElement('img');
      imgElement.setAttribute('src', String(src));
      imgElement.width = 200;
      imgElement.height = 200;
      document.getElementById('imgpreview')?.appendChild(imgElement);
    };
    reader.readAsDataURL(file[0]);
  }
} as EventListener);

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  fetch('https://blob-detectionapp.herokuapp.com/detect/', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: imageOri }),
  })
    .then((res) => res.json())
    .then((hasil) => {
      if (!hasil.success) {
        alert('Failed to detect! try again');
        return;
      }
      let { result, jumlah_blob } = hasil;
      result = result.slice(2).replace("'", '');
      fetch(`data:image/jpg;base64,${result}`)
        .then((res) => res.blob())
        .then((blob) => {
          const imgElementResult = document.createElement('img');
          imgElementResult.setAttribute('src', URL.createObjectURL(blob));
          imgElementResult.width = 200;
          imgElementResult.height = 200;
          document.getElementById('imgresult')?.appendChild(imgElementResult);
          document.getElementById(
            'blob-count'
          )!.textContent = `blob count: ${jumlah_blob}`;
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
});
