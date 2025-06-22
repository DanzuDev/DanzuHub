document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const uploadArea = document.getElementById('uploadArea');
  const fileInfo = document.getElementById('fileInfo');
  const filePreview = document.getElementById('filePreview');
  const uploadBtn = document.getElementById('uploadBtn');
  const resetBtn = document.getElementById('resetBtn');
  const result = document.getElementById('result');
  const progressBar = document.getElementById('progressBar');
  const progress = document.getElementById('progress');
  
  // Drag and drop functionality
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('active');
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('active');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('active');
    
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      handleFileSelection();
    }
  });
  
  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });
  
  fileInput.addEventListener('change', handleFileSelection);
  
  function handleFileSelection() {
    if (fileInput.files.length) {
      const file = fileInput.files[0];
      fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;
      uploadBtn.disabled = false;
      
      // Show preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          filePreview.src = e.target.result;
          filePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        filePreview.style.display = 'none';
      }
    }
  }
  
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Upload functionality - using your provided function with enhancements
  uploadBtn.addEventListener('click', uploadFile);
  
  resetBtn.addEventListener('click', () => {
    fileInput.value = '';
    fileInfo.textContent = 'Tidak ada file dipilih';
    filePreview.style.display = 'none';
    uploadBtn.disabled = true;
    result.textContent = '';
    result.className = '';
    progressBar.style.display = 'none';
    progress.style.width = '0%';
  });
  
  async function uploadFile() {
    const input = document.getElementById('fileInput');
    const result = document.getElementById('result');

    if (!input.files.length) {
      showResult('❗ Pilih file dulu!', 'error');
      return;
    }

    // Check file size (e.g., limit to 10MB)
    const file = input.files[0];
    if (file.size > 50 * 1024 * 1024) {
      showResult('⚠️ File terlalu besar (Maksimal 50MB)', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    showResult('⏳ Mengunggah...', 'loading');
    progressBar.style.display = 'block';
    uploadBtn.disabled = true;

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      showResult(`✅ <a href="${data.url}" target="_blank" style="color: var(--primary); text-decoration: none;">${data.url}</a>`, 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showResult('⚠️ Upload gagal: ' + error.message, 'error');
    } finally {
      uploadBtn.disabled = false;
      progressBar.style.display = 'none';
    }
  }
  
  function showResult(message, type) {
    result.innerHTML = message;
    result.className = type;
  }
});
    
