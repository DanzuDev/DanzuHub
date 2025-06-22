const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

// Konfigurasi multer untuk menyimpan file sementara di /tmp
const upload = multer({ dest: '/tmp' });

module.exports = (req, res) => {
  upload.single('file')(req, res, async function (err) {
    if (err || !req.file) {
      return res.status(400).json({ error: '❗ Gagal upload. File tidak ditemukan atau error multer.' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;

    try {
      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      formData.append('fileToUpload', fs.createReadStream(filePath), originalName);

      const response = await axios.post('https://catbox.moe/user/api.php', formData, {
        headers: formData.getHeaders()
      });

      // Hapus file dari /tmp setelah upload
      fs.unlinkSync(filePath);

      const filename = response.data.split('/').pop();
      const customURL = `https://danzuhub.my.id/u/${filename}`;

      res.status(200).json({
        success: true,
        url: customURL,
        original: response.data
      });
    } catch (uploadError) {
      // Hapus file kalau error
      fs.unlinkSync(filePath);
      res.status(500).json({
        success: false,
        message: '⚠️ Gagal upload ke Catbox',
        error: uploadError.message
      });
    }
  });
};
