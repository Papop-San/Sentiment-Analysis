'use client';
import React, { useState } from 'react';
import SearchBar from "@/components/Bar/search";
import ResultBorder from "@/components/Bar/analysis"; 
import Graph from '@/components/Bar/graph';
import axios from 'axios';

export default function Home() {
  const [submittedData, setSubmittedData] = useState<{ url: string; category: string } | null>(null); 
  const [data, setData] = useState<any>(null); 
  const [message, setMessage] = useState<string | null>(null); 
  const [loading, setLoading] = useState<boolean>(false); 
  const [showGraph, setShowGraph] = useState<boolean>(false); 

  const handleSearchSubmit = (data: { url: string; category: string }) => {
    setSubmittedData(data); 
    fetchData(data.url); 
  };

  const fetchData = async (url: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL; 
    setLoading(true); 
    try {
      const response = await axios.post(`${apiUrl}analyze`, { url });
      console.log(response.data); 
      setMessage(null);
      setData(response.data); 
      setShowGraph(true); 
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error fetching data. Please try again.'); 
      setShowGraph(false); 
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="m-5">
      <div>
        <span className="text-3xl font-semibold text-gray-800 typing-text">
          Sentiment analysis
        </span>
      </div>

      <div className="mt-3">
        <SearchBar onSubmit={handleSearchSubmit} initialCategory="All comment" />
      </div>

      <div className="mx-3 items-center">
        {loading ? (
          <p className="text-green-500 text-center py-5">Loading...</p> 
        ) : (
          submittedData && data && (
            <>
              <ResultBorder 
                comments={data.results} 
                selectedCategory={submittedData.category} 
              />
              {showGraph && <Graph data={data} />} 
            </>
          )
        )}
      </div>
    </div>
  );
}
