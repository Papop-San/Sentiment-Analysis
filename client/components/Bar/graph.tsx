import React, { useEffect, useRef, useState } from 'react';
import { Card } from "@nextui-org/react";
import * as echarts from 'echarts';

interface GraphProps {
  data: any; 
}

const Graph: React.FC<GraphProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie'); // Set initial chart type to pie

  useEffect(() => {
    if (chartRef.current && data) {
      const chartInstance = echarts.init(chartRef.current);

      const sentimentCounts = data.results.reduce((acc: any, comment: any) => {
        acc[comment.sentiment] = (acc[comment.sentiment] || 0) + 1;
        return acc;
      }, {});

      let option: echarts.EChartsOption;

      // Configure chart options based on selected chart type
      if (chartType === 'pie') {
        option = {
          title: {
            text: 'Sentiment Analysis',
            subtext: 'Based on Comments',
            left: 'center'
          },
          tooltip: {
            trigger: 'item'
          },
          legend: {
            orient: 'vertical',
            left: 'left'
          },
          color: ['#4CAF50', '#F44336', '#FFC107'],
          series: [
            {
              name: 'Sentiment',
              type: 'pie',
              radius: '50%',
              data: [
                { value: sentimentCounts['Positive'] || 0, name: 'Positive' },
                { value: sentimentCounts['Negative'] || 0, name: 'Negative' },
                { value: sentimentCounts['Neutral'] || 0, name: 'Neutral' },
              ],
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        };
      } else if (chartType === 'bar') {
        option = {
          title: {
            text: 'Sentiment Analysis (Bar Chart)',
            left: 'center'
          },
          tooltip: {},
          xAxis: {
            type: 'category',
            data: ['Positive', 'Negative', 'Neutral'],
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: 'Count',
              type: 'bar',
              data: [
                sentimentCounts['Positive'] || 0,
                sentimentCounts['Negative'] || 0,
                sentimentCounts['Neutral'] || 0,
              ],
              itemStyle: {
                
                color: (params) => {
                  const colors = ['#4CAF50', '#F44336', '#FFC107']; // Array of colors
                  return colors[params.dataIndex]; // Return color based on the index
                }
              }
            }
          ]
        };
      }

      chartInstance.setOption(option);

      return () => {
        chartInstance.dispose();
      };
    }
  }, [data, chartType]); 


  const handleChartTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setChartType(event.target.value as 'pie' | 'bar');
  };

  return (
    <div className="flex justify-center items-center flex-col mt-10 pb-20">
      <Card className="w-[1080px] p-4">
        <div className="mb-4">
          <label htmlFor="chartType" className="mr-2 ">Select Chart Type:</label>
          <select 
            id="chartType "
            className='border'
             value={chartType} onChange={handleChartTypeChange}>
            <option value="pie">Pie Chart</option>
            <option value="bar">Bar Chart</option>
          </select>
        </div>
        <div ref={chartRef} style={{ width: '100%', height: '400px' }} />
      </Card>
    </div>
  );
};

export default Graph;
