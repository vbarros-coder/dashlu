"use client";

import { useState, useRef } from "react";

interface UploadAreaProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export default function UploadArea({ onFileUpload, isLoading }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setSelectedFile(file);
        onFileUpload(file);
      } else {
        alert("Por favor, envie apenas arquivos PDF.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center
        w-full max-w-2xl mx-auto p-12 rounded-2xl
        border-2 border-dashed cursor-pointer
        transition-all duration-300 ease-in-out
        ${
          isDragging
            ? "border-[#F58220] bg-[#F58220]/10"
            : "border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800"
        }
        ${isLoading ? "opacity-70 pointer-events-none" : ""}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Ícone de upload */}
      <div
        className={`
          w-20 h-20 rounded-full flex items-center justify-center mb-6
          transition-all duration-300
          ${
            isDragging
              ? "bg-[#F58220]/20 text-[#F58220]"
              : "bg-slate-700/50 text-slate-400"
          }
        `}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-10 w-10"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5a2.25 2.25 0 01-2.25 2.25H5.25a2.25 2.25 0 01-2.25-2.25z"
            />
          </svg>
        )}
      </div>

      {/* Texto */}
      <div className="text-center">
        {isLoading ? (
          <>
            <p className="text-lg font-medium text-white mb-2">
              Processando PDF...
            </p>
            <p className="text-sm text-slate-400">
              Extraindo dados do time sheet
            </p>
          </>
        ) : selectedFile ? (
          <>
            <p className="text-lg font-medium text-white mb-2">
              {selectedFile.name}
            </p>
            <p className="text-sm text-slate-400">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </>
        ) : (
          <>
            <p className="text-lg font-medium text-white mb-2">
              Clique para inserir arquivo
            </p>
            <p className="text-sm text-slate-400 mb-4">
              ou arraste e solte um PDF aqui
            </p>
            <p className="text-xs text-slate-500">
              Apenas arquivos PDF exportados do Baruc
            </p>
          </>
        )}
      </div>
    </div>
  );
}
