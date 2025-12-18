"use client";
import { useState } from "react";
import UploadArea from "./components/upload-area";
import JobDesc from "./components/jobDesc";
import { sampleMatchResult } from "./constants/sampleData";
import { Sono } from 'next/font/google';
import ParticlesComponent from "./components/bg-particles";

const sono = Sono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  preload: true,
});

export default function Home() {
  const [files, setFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [showSample, setShowSample] = useState(false);

  const handleReviewResume = async () => {
    try {
      if (files.length === 0) {
        alert("Please upload a resume first");
        return;
      }

      if (!jobDescription.trim()) {
        alert("Please add a job description");
        return;
      }
      
      // Show loading state or spinner here if desired
      console.log("I got here")

      // First, upload the resume and wait for the URL
      const formData = new FormData();
      formData.append("file", files[0]);

      console.log("Starting file upload...");
      const uploadResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_UPLOAD_ENDPOINT}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(`Resume upload failed: ${errorData.error || 'Unknown error'}`);
      }

      const { fileUrl } = await uploadResponse.json();
      console.log("Upload successful, received URL:", fileUrl);

      if (!fileUrl) {
        throw new Error("No file URL received from upload");
      }

      // Now that we have the URL, proceed with matching
      console.log("Starting match process...");
      const matchResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_MATCH_ENDPOINT}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeUrl: fileUrl,
            jobDescription: jobDescription,
          }),
        }
      );

      if (!matchResponse.ok) {
        const errorData = await matchResponse.json();
        throw new Error(`Matching failed: ${errorData.error || 'Unknown error'}`);
      }

      const matchResult = await matchResponse.json();
      // console.log("Match Result:", matchResult);
      // setMatchResult(matchResult);
      // setShowSample(false);

    } catch (error) {
      console.error("Error during review:", error);
    }
  };

  const handleToggleSample = () => {
    if (showSample) {
      setShowSample(false);
      setMatchResult(null);
    } else {
      setShowSample(true);
      setMatchResult(sampleMatchResult);
    }
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div className="absolute inset-0">
        <ParticlesComponent />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-7xl">
          <JobDesc
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
          />
          <UploadArea
            files={files}
            setFiles={setFiles}
          />
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleReviewResume}
            className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                      transition-all duration-200 text-lg font-medium
                      border-2 border-transparent hover:border-blue-400
                      hover:scale-105 transform"
          >
            Review Resume
          </button>
          <button
            onClick={handleToggleSample}
            className={`mt-8 px-8 py-3 ${showSample ? 'bg-red-600 hover:bg-red-700 hover:border-red-400' : 'bg-purple-600 hover:bg-purple-700 hover:border-purple-400'} text-white rounded-lg 
                      transition-all duration-200 text-lg font-medium
                      border-2 border-transparent 
                      hover:scale-105 transform`}
          >
            {showSample ? 'Hide Sample Result' : 'Show Sample Result'}
          </button>
        </div>

        {matchResult && (
          <div
            className={`mt-8 w-full max-w-7xl p-6 bg-green-500 rounded-lg shadow-lg
                      text-white transform transition-all duration-500 
                      opacity-100 translate-y-0 ${sono.className}`}
            style={{
              opacity: matchResult ? 1 : 0,
              transform: matchResult ? 'translateY(0)' : 'translateY(20px)'
            }}
          >
            <h2 className="text-2xl font-bold mb-4">Match Results</h2>

            {matchResult.analysis && (
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="text-5xl font-bold mr-4">{matchResult.analysis.matchScore}</div>
                  <div className="text-xl">Match Score</div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Matching Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.analysis.matchingSkills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-green-600 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.analysis.missingSkills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-green-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Improvement Suggestions</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {matchResult.analysis.improvementSuggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
