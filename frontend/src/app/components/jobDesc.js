import React, { useState } from "react";

const JobDesc = ({ jobDescription, setJobDescription }) => {
  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    setJobDescription(pastedText);
  };

  return (
    <div className="h-[600px]">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 h-full">
        <h2 className="text-2xl font-semibold mb-4 text-white">Job Description</h2>
        <textarea
          className="w-full h-[calc(100%-4rem)] p-4 bg-white/5 text-white border-2 border-gray-600 
                     rounded-lg focus:border-blue-400 focus:outline-none resize-none 
                     placeholder-gray-400"
          placeholder="Paste your job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          onPaste={handlePaste}
        />
      </div>
    </div>
  );
};

export default JobDesc;