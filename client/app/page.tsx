'use client';

import React, { useState } from 'react';
import SeachBar from "@/components/Bar/search";
import Analysis from "@/components/Bar/analysis";


export default function Home() {
  const [submittedUrl, setSubmittedUrl] = useState< string | null>(null);

  const handleSearchSubmit = (url: string) => {
    setSubmittedUrl(url); 
  };
  return (
    <div className="m-5">
      <div>
        <span className="text-3xl font-semibold text-gray-800 typing-text">
          Segmentation Analysis
        </span>
      </div>

      <div className="mt-3">
        <SeachBar onSubmit={handleSearchSubmit} />
      </div>

      <div className="mx-3 items-center">
        {submittedUrl && <Analysis submittedUrl={submittedUrl} />} 
      </div>
    </div>
  );
}
