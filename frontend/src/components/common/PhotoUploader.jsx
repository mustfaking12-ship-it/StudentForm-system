import React, { useRef, useState } from 'react';
import { Camera, Trash2, Upload, User, Loader2 } from 'lucide-react';
import { uploadService } from '../../services/api';

export default function PhotoUploader({ value, onChange, label = 'الصورة الشخصية للمعاملة' }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميغابايت');
      return;
    }

    // Check format
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('يرجى اختيار صورة بصيغة JPG أو PNG أو WebP فقط');
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      const res = await uploadService.uploadPhoto(file);
      if (res.success && res.photoUrl) {
        onChange(res.photoUrl);
      }
    } catch (err) {
      setUploadError(err.message || 'فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">
        <Camera size={16} color="var(--primary)" />
        <span>{label}</span>
      </label>

      <div className="photo-uploader-box">
        <div className="photo-preview-frame">
          {value ? (
            <img src={value} alt="معاينة الصورة" />
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
              <User size={42} strokeWidth={1.5} />
              <div style={{ fontSize: '0.7rem', marginTop: '2px' }}>صورة افتراضية</div>
            </div>
          )}
        </div>

        <div className="photo-upload-controls">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
          />

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  {value ? 'تغيير الصورة' : 'رفع صورة جديدة'}
                </>
              )}
            </button>

            {value && (
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={handleRemove}
                disabled={uploading}
              >
                <Trash2 size={14} />
                حذف الصورة
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            الصيغ المدعومة: JPG, PNG, WEBP (الحجم الأقصى 5MB)
          </div>

          {uploadError && (
            <div style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 600 }}>
              {uploadError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
