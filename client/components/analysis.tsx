'use client';

import { Card, CardHeader, CardBody, Image, Button } from "@nextui-org/react";

const ResultBorder: React.FC = () => {
  const tracks = Array.from({ length: 30 }); 

  return (
    <div className="flex justify-center items-center mt-14">
      <Card className="w-[1080px]">
        <CardBody className="overflow-y-auto py-2 max-h-[750px]"> {/* Set a max height here */}
          {tracks.map((_, index) => (
            <div key={index} className="py-2">
              <Image
                alt={`Track ${index + 1} background`}
                className="object-cover rounded-xl"
                src="https://nextui.org/images/hero-card-complete.jpeg"
                width={270}
              />
            </div>
          ))}
          {/* Conditional rendering of the Learn More button */}
          {tracks.length > 5 && (
            <div className="flex justify-center mt-4">
              <Button color="primary">Learn More</Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default ResultBorder;
