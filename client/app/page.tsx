import SeachBar from "@/components/search";
import Analysis from "@/components/analysis";

export default function Home() {
  return (
    <div className="m-5">
    <div>
    <span className="text-3xl font-semibold text-gray-800 typing-text">
      Segmentation Analysis
    </span>
    </div>

      <div className=" mt-3 ">
          <SeachBar/>
      </div>
      <div className="mx-3 items-center">
        <Analysis/>
      </div>
  </div>
  );
}
