import { LineData } from "./form";
import { Line } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

//Take in options, xAxis, yAxis props
const LineGraph: React.FC<{
  data: LineData;
}> = (props) => {
  const lineValues: any = []; //Type ChartDataset something????
  const labelValues = props.data[0].xAxis;
  const lineColors = [
    {
      backgroundColor: "rgba(75,192,192,0.2)",
      borderColor: "rgba(75,192,192,1)",
    },
    {
      backgroundColor: "rgba(255,0,0,0.2)",
      borderColor: "rgba(255,0,0,1)",
    },
    {
      backgroundColor: "rgba(0,255,0,0.2)",
      borderColor: "rgba(0,255,0,1)",
    },
    {
      backgroundColor: "rgba(0,0,255,0.2)",
      borderColor: "rgba(0,0,255,1)",
    },
  ];

  props.data.map((algorithm, index) => {
    //Filter out not flagged algorithms
    if (!algorithm.yAxis.includes(0)) {
      lineValues.push({
        label: algorithm.lineName,
        data: algorithm.yAxis,
        fill: true,
        backgroundColor: lineColors[index].backgroundColor,
        borderColor: lineColors[index].borderColor,
      });
    }
  });

  const chartData: ChartData<"line"> = {
    labels: labelValues,
    datasets: lineValues,
  };

  const config: ChartOptions<"line"> = {
    scales: {
      y: {
        title: {
          display: true,
          text: "Average Rank Error",
        },
      },
      x: {
        title: {
          display: true,
          text: "Number of Votes",
        },
      },
    },
  };

  //Create chart
  return (
    <Line className="m-4 bg-white p-4" options={config} data={chartData} />
  );
};

export default LineGraph;
