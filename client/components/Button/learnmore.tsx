import {  Button } from "@nextui-org/react";


const LearnMore: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
    <Button className='border-green-500 bg-green-500 hover:bg-green-600 text-white' onClick={onClick}>
      Learn More
    </Button>
  );
  
export default LearnMore;