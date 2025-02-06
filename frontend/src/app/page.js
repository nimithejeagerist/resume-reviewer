"use client";
import { useState } from "react";
import BgParticles from "./components/bg-particles";
import UploadArea from "./components/upload-area";
import JobDesc from "./components/jobDesc";

export default function Home() {
  const [files, setFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState("");

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
      console.log("Match Result:", matchResult);
      // Handle success - maybe show the result to the user

    } catch (error) {
      console.error("Error during review:", error);
    }
  };

  return (
    <div className="relative min-h-screen bg-black">
      <div className="absolute inset-0">
        <BgParticles />
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
        <button 
          onClick={handleReviewResume}
          className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                     transition-all duration-200 text-lg font-medium
                     border-2 border-transparent hover:border-blue-400
                     hover:scale-105 transform"
        >
          Review Resume
        </button>
      </div>
    </div>
  );
}

