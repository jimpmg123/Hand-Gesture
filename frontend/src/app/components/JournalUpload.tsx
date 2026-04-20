import React, { useState } from 'react'

interface JournalUploadProps {
  onGenerate: (files: File[]) => void
  onOpenPreview: () => void
}

export const JournalUpload: React.FC<JournalUploadProps> = ({ onGenerate, onOpenPreview }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return
    const files = Array.from(event.target.files)

    if (files.length < 2 || files.length > 20) {
      setErrorMessage('You can upload between 2 and 20 images for a journal.')
      setSelectedFiles([])
      return
    }

    setErrorMessage('')
    setSelectedFiles(files)
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
    >
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#26215C', marginBottom: '10px' }}>
        Create a travel journal
      </h2>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '30px' }}>
        Upload your travel photos and the server will build a journal timeline from images that
        contain valid EXIF time and GPS data.
      </p>

      <div
        style={{
          width: '100%',
          border: '2px dashed #AFA9EC',
          borderRadius: '12px',
          padding: '50px 20px',
          backgroundColor: '#EEEDFE',
          cursor: 'pointer',
          position: 'relative',
          marginBottom: '20px',
          transition: 'all 0.3s ease',
        }}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg, image/png, image/webp"
          onChange={handleFileChange}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
          }}
        />
        <div style={{ pointerEvents: 'none' }}>
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>Upload</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#534AB7' }}>
            Select pictures (2 to 20)
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>Drag or drop here</div>
        </div>
      </div>

      {errorMessage && (
        <p style={{ color: '#e74c3c', fontWeight: 'bold', marginTop: '10px', fontSize: '14px' }}>
          {errorMessage}
        </p>
      )}

      <div style={{ width: '100%', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {selectedFiles.length > 0 ? (
          <>
            <div style={{ marginBottom: '8px', fontSize: '15px', color: '#333' }}>
              <span>Ready to upload: </span>
              <strong style={{ color: '#534AB7', fontSize: '18px' }}>{selectedFiles.length}</strong>
            </div>
            <button
              onClick={() => onGenerate(selectedFiles)}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#534AB7',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(83, 74, 183, 0.3)',
              }}
            >
              Preview journal timeline
            </button>
          </>
        ) : null}

        <button
          onClick={onOpenPreview}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#f1f3f5',
            color: '#343a40',
            fontSize: '15px',
            fontWeight: 'bold',
            border: '1px solid #d9dee3',
            borderRadius: '12px',
            cursor: 'pointer',
          }}
        >
          Open result page for demo
        </button>
      </div>
    </div>
  )
}
