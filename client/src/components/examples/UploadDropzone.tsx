import UploadDropzone from '../UploadDropzone'

export default function UploadDropzoneExample() {
  return (
    <div className="w-full max-w-2xl">
      <UploadDropzone
        onFilesSelected={(files) => console.log('Files selected:', files)}
      />
    </div>
  )
}
