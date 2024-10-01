'use client';

import { useState } from 'react';
import { Card, CardHeader, CardBody, Image, Button } from "@nextui-org/react";
import {Accordion, AccordionItem} from "@nextui-org/react";

import LearnMore from '../Button/learnmore';

const ResultBorder: React.FC = () => {
  const tracks = Array.from({ length: 30 });
  const [visibleTracks, setVisibleTracks] = useState(5); 

  const handleLoadMore = () => {
    setVisibleTracks((prev) => prev + 5); 
  };
  
  const defaultContent =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
  
  return (
    <div className="flex justify-center items-center mt-14">
      <Card className="w-[1080px]">
        <CardBody className="overflow-y-auto py-2 max-h-[750px] h-auto flex flex-col items-center "> 
          {tracks.slice(0, visibleTracks).map((_, index) => (
            <Accordion key={index+1} className="py-2">
                <AccordionItem key={index} title={`Accordion ${index + 1}`}>
                  {defaultContent}
                </AccordionItem>
            </Accordion>
          ))}

          {visibleTracks < tracks.length && ( 
            <div className="flex justify-center mt-4">
              <LearnMore onClick={handleLoadMore}/>
            </div>
          )}

        </CardBody>
      </Card>
    </div>
  );
};

export default ResultBorder;
