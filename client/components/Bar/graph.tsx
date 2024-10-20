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

        // Ensure sentiment counts include all categories and default to 0 if missing
        const sentimentCounts = data.results.reduce(
          (acc: any, comment: any) => {
            acc[comment.sentiment] = (acc[comment.sentiment] || 0) + 1;
            return acc;
          },
          { Positive: 0, Negative: 0, Neutral: 0 }, // Default to 0 if not present
        );

        // Calculate total comments for percentage calculation
        const totalComments =
          sentimentCounts["Positive"] +
          sentimentCounts["Negative"] +
          sentimentCounts["Neutral"];

        let option: echarts.EChartsOption;

        if (chartType === "pie") {
          option = {
            tooltip: {
              trigger: "item",
              formatter: "{a} <br/>{b}: {c} ({d}%)", // Includes the percentage in the tooltip
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
                  {
                    value: sentimentCounts["Positive"],
                    name: `Positive (${(
                      (sentimentCounts["Positive"] / totalComments) *
                      100
                    ).toFixed(2)}%)`,
                  },
                  {
                    value: sentimentCounts["Negative"],
                    name: `Negative (${(
                      (sentimentCounts["Negative"] / totalComments) *
                      100
                    ).toFixed(2)}%)`,
                  },
                  {
                    value: sentimentCounts["Neutral"],
                    name: `Neutral (${(
                      (sentimentCounts["Neutral"] / totalComments) *
                      100
                    ).toFixed(2)}%)`,
                  },
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
            tooltip: {
              trigger: "axis",
              axisPointer: {
                type: "shadow",
              },
            },
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
                  sentimentCounts["Positive"],
                  sentimentCounts["Negative"],
                  sentimentCounts["Neutral"],
                ],
                itemStyle: {
                  color: (params) => {
                    const colors = ["#4CAF50", "#F44336", "#FFC107"];
                    return colors[params.dataIndex];
                  },
                },
                label: {
                  show: true,
                  position: "top",
                  formatter: (params) => {
                    const value = params.value;
                    const percentage = ((value / totalComments) * 100).toFixed(
                      2,
                    );
                    return `${percentage}%`; // Display percentage on top of each bar
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
