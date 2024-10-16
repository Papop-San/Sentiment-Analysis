import React, { useEffect, useRef, useState } from "react";
import { Card, CardBody } from "@nextui-org/react";
import * as echarts from "echarts";

interface GraphProps {
  data: any;
}

const Graph: React.FC<GraphProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");

  useEffect(() => {
    let chartInstance: echarts.ECharts | undefined;

    const renderChart = () => {
      if (chartRef.current && data) {
        // Initialize chart or get existing instance
        chartInstance =
          echarts.getInstanceByDom(chartRef.current) ||
          echarts.init(chartRef.current);

        const sentimentCounts = data.results.reduce(
          (acc: any, comment: any) => {
            acc[comment.sentiment] = (acc[comment.sentiment] || 0) + 1;

            return acc;
          },
          {},
        );

        let option: echarts.EChartsOption;

        if (chartType === "pie") {
          option = {
            title: {
              text: "Sentiment Analysis",
              subtext: "Based on Comments",
              left: "center",
            },
            tooltip: {
              trigger: "item",
            },
            legend: {
              orient: "vertical",
              left: "left",
            },
            color: ["#4CAF50", "#F44336", "#FFC107"],
            series: [
              {
                name: "Sentiment",
                type: "pie",
                radius: "50%",
                data: [
                  { value: sentimentCounts["Positive"] || 0, name: "Positive" },
                  { value: sentimentCounts["Negative"] || 0, name: "Negative" },
                  { value: sentimentCounts["Neutral"] || 0, name: "Neutral" },
                ],
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: "rgba(0, 0, 0, 0.5)",
                  },
                },
              },
            ],
          };
        } else if (chartType === "bar") {
          option = {
            title: {
              text: "Sentiment Analysis (Bar Chart)",
              left: "center",
            },
            tooltip: {},
            xAxis: {
              type: "category",
              data: ["Positive", "Negative", "Neutral"],
            },
            yAxis: {
              type: "value",
            },
            series: [
              {
                name: "Count",
                type: "bar",
                data: [
                  sentimentCounts["Positive"] || 0,
                  sentimentCounts["Negative"] || 0,
                  sentimentCounts["Neutral"] || 0,
                ],
                itemStyle: {
                  color: (params) => {
                    const colors = ["#4CAF50", "#F44336", "#FFC107"];

                    return colors[params.dataIndex];
                  },
                },
              },
            ],
          };
        }

        chartInstance.setOption(option);
      }
    };

    renderChart();

    // Resize chart on window resize
    const handleResize = () => {
      chartInstance?.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance?.dispose();
    };
  }, [data, chartType]);

  const handleChartTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setChartType(event.target.value as "pie" | "bar");
  };

  return (
    <div className="flex justify-center items-center flex-col mt-10 pb-20">
      <Card className="w-full max-w-5xl p-4">
        <CardBody className="overflow-y-auto py-2 max-h-[750px] h-auto flex flex-col items-center">
          <div className="mb-4">
            <label className="mr-2" htmlFor="chartType">
              Select Chart Type:
            </label>
            <select
              className="border"
              id="chartType"
              value={chartType}
              onChange={handleChartTypeChange}
            >
              <option value="pie">Pie Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>
          <div ref={chartRef} style={{ width: "100%", height: "400px" }} />
        </CardBody>
      </Card>
    </div>
  );
};

export default Graph;
