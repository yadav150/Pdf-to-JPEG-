document.addEventListener('DOMContentLoaded', () => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.12.313/pdf.worker.min.js';

  const pdfInput = document.getElementById('pdfFile');
  const btn = document.getElementById('convertBtn');
  const result = document.getElementById('result');

  btn.addEventListener('click', () => {
    if (btn.dataset.mode === 'reset') {
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
    result.textContent = 'Processing PDF...';
    const reader = new FileReader();

    reader.onload = async function(e) {
      try {
        const typedarray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

        result.innerHTML = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');

          await page.render({ canvasContext: ctx, viewport: viewport }).promise;

          result.appendChild(canvas);

          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/jpeg');
          link.download = `page-${pageNum}.jpeg`;
          link.textContent = `Download Page ${pageNum}`;
          link.className = 'download-link';
          result.appendChild(link);
        }

        btn.textContent = 'Reset';
        btn.classList.add('reset');
        btn.dataset.mode = 'reset';
      } catch (err) {
        console.error(err);
        result.textContent = '⚠ Error processing PDF. Try a different file.';
      }
    };

    reader.onerror = function() {
      result.textContent = '⚠ Error reading file.';
    };

    reader.readAsArrayBuffer(file);
  }

  function resetAll() {
    pdfInput.value = '';
    result.textContent = 'Upload a PDF and click Convert to see JPEG images here.';
    btn.textContent = 'Convert to JPEG';
    btn.classList.remove('reset');
    delete btn.dataset.mode;
  }
});
