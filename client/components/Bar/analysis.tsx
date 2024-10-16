import React, { useState } from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import LearnMore from '../Button/learnmore';

interface Comment {
  commenter: string;
  comment: string;
  sentiment: string;
  sentiment_score: number;
  mentioned_people: string;
}

interface ResultBorderProps {
  comments: Comment[];
  selectedCategory: string; // Add selectedCategory as a prop
}

const ResultBorder: React.FC<ResultBorderProps> = ({ comments, selectedCategory }) => {
  const [visibleTracks, setVisibleTracks] = useState(5);

  const handleLoadMore = () => {
    setVisibleTracks((prev) => prev + 5);
  };

  // Filter comments based on the selected category
  const filteredComments = selectedCategory === 'All comment' 
    ? comments 
    : comments.filter(comment => comment.sentiment.trim().toLowerCase() === selectedCategory.trim().toLowerCase());

  // Function to return appropriate background class based on sentiment
  const getSentimentBgClass = (sentiment: string) => {
    switch (sentiment.trim().toLowerCase()) {
      case 'positive':
        return 'group-hover:bg-green-500'; // Green background for positive
      case 'negative':
        return 'group-hover:bg-red-500'; // Red background for negative
      case 'neutral':
        return 'group-hover:bg-gray-500'; // Gray background for neutral
      default:
        return 'group-hover:bg-black'; // Default black background for other cases
    }
  };

  return (
    <div className="flex justify-center items-center mt-14">
      <Card className="w-[1080px]">
        <CardBody className="overflow-y-auto py-2 max-h-[750px] h-auto flex flex-col items-center "> 
          {filteredComments.length > 0 ? (
            filteredComments.slice(0, visibleTracks).map((comment, index) => (
              <Accordion key={index} className="py-2">
                <AccordionItem 
                  title={
                    <span className="relative group">
                      Comment By: <span className="font-bold">{comment.commenter.replace('@', '')}</span>
                      <span 
                        className={`absolute left-0 bottom-full mb-1 hidden group-hover:block text-white text-sm rounded p-1 ${getSentimentBgClass(comment.sentiment)}`}
                      >
                        {comment.sentiment}
                      </span>
                    </span>
                  }
                  textValue={`Comment by ${comment.commenter.replace('@', '')}: ${comment.comment}`} 
                >
                  <p><strong>Comment:</strong> {comment.comment}</p>
                  <p><strong>Mention: </strong>{comment.mentioned_people}</p>
                  <p><strong>Sentiment Score:</strong> {comment.sentiment_score}</p>
                  <p><strong>Category  :</strong> {comment.sentiment}</p>
                </AccordionItem>
              </Accordion>
            ))
          ) : (
            <p>No comments to display.</p> 
          )}

          {visibleTracks < filteredComments.length && ( 
            <div className="flex justify-center mt-4">
              <LearnMore onClick={handleLoadMore} />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ResultBorder;
