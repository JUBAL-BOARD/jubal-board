"use client";
import { useRef } from "react";
import { CloudUpload } from "lucide-react";
import { ChevronDown } from "lucide-react";

interface FileUploadZoneProps {
  files: File[];
  onFilesAdded: (files: File[]) => void;
  onClear: () => void;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ files, onFilesAdded, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onFilesAdded(Array.from(e.dataTransfer.files));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onFilesAdded(Array.from(e.target.files));
  };

  return (
    <div className="bg-[#fafafa] border border-gray-200 rounded-xl mb-4 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="font-semibold text-black text-sm">Upload Files</span>
        <ChevronDown size={18} className="text-gray-500" />
      </div>
      <div className="px-5 pb-5">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="bg-white border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center py-12 cursor-pointer hover:bg-gray-50 transition-colors mb-4"
        >
          <CloudUpload size={52} className="text-[#e84545] mb-3" />
          <p className="font-semibold text-gray-700 text-sm mb-1">
            Drag your files here or tap to upload
          </p>
          <p className="text-xs text-gray-400">PNG, JPG, PDF, MP4, ZIP</p>
          <p className="text-xs text-gray-400">Maximum file size 500mb. Multiple files allowed.</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept=".png,.jpg,.jpeg,.pdf,.mp4,.zip"
          />
        </div>

        {files.length > 0 && (
          <div className="border border-gray-100 rounded-xl p-4 flex items-center gap-4 relative">
            {files.map((file, i) => (
              <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-medium">
                    {file.name.split(".").pop()?.toUpperCase()}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={onClear}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadZone;