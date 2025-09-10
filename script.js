// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.12.313/pdf.worker.min.js';

const pdfInput = document.getElementById('pdfFile');
const btn = document.getElementById('convertBtn');
const result = document.getElementById('result');

btn.addEventListener('click', () => {
  if(btn.dataset.mode === 'reset') {
    resetAll();
  } else {
    if (!pdfInput.files[0]) {
      result.textContent = '⚠ Please select a PDF file first.';
      return;
    }
    convertPDF(pdfInput.files[0]);
  }
});

async function convertPDF(file) {
  result.innerHTML = 'Processing PDF...';
  const fileReader = new FileReader();
  fileReader.onload = async function() {
    const typedarray = new Uint8Array(this.result);
    const loadingTask = pdfjsLib.getDocument({data: typedarray});
    const pdf = await loadingTask.promise;

    result.innerHTML = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport: viewport }).promise;
      result.appendChild(canvas);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg');
      link.download = `page-${pageNum}.jpeg`;
      link.textContent = `Download Page ${pageNum} as JPEG`;
      link.className = 'download-link';
      result.appendChild(link);
    }

    btn.textContent = 'Reset';
    btn.classList.add('reset');
    btn.dataset.mode = 'reset';
  };
  fileReader.readAsArrayBuffer(file);
}

function resetAll() {
  pdfInput.value = '';
  result.innerHTML = 'Upload a PDF and click Convert to see JPEG images here.';
  btn.textContent = 'Convert to JPEG';
  btn.classList.remove('reset');
  delete btn.dataset.mode;
}
