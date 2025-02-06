import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

const UploadArea = ({ files, setFiles }) => {
  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt']
    },
    maxSize: 10485760, // 10MB
  });

  return (
    <div className="h-[600px]">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 h-full">

        <h2 className="text-2xl font-semibold mb-4 text-white">Resume Upload</h2>
        <div className="h-[calc(100%-4rem)] flex flex-col">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 
              ${isDragActive ? "border-blue-500 bg-white/10" : "border-gray-600 hover:border-blue-400"}
              ${files.length > 0 ? 'h-[70%]' : 'h-full'}`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="text-4xl text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div className="text-lg">
                {isDragActive ? (
                  <p className="text-blue-400">Drop your files here</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-gray-300">
                      Drag & drop files here, or click to select files
                    </p>
                    <p className="text-sm text-gray-400">
                      Supported files: Images, PDF, DOC, DOCX, XLS, XLSX, TXT
                      <br />
                      Max file size: 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-4 bg-white/5 rounded-lg p-4 h-[30%] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-2 text-white">Selected Files:</h3>
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center p-2 bg-white/5 rounded-lg border border-gray-600"
                  >
                    <span className="text-sm text-gray-300 truncate">{file.name}</span>
                    <span className="ml-auto text-xs text-gray-400 whitespace-nowrap">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadArea;