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
  options: Record<string, unknown>;
  xAxisValues: string[];
  yAxisValues: number[];
  sampleSize: number;
}> = ({ options, xAxisValues, yAxisValues, sampleSize }) => {
  //Configure Graph Label based on options
  //This needs to be improved
  let graphLabel = "";
  if (options.pureRandom) {
    graphLabel = "Pure Random";
  }
  if (options.maxAppearances) {
    graphLabel = "Max Appearances";
  }
  if (options.closeInRank) {
    graphLabel = "Close in Rank";
  }
  graphLabel = graphLabel.concat(`, ${sampleSize} members`);

  //Format data for chart
  const data: ChartData<"line"> = {
    datasets: [
      {
        label: graphLabel,
        data: yAxisValues,

        fill: true,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],

    labels: xAxisValues,
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
  return <Line className="m-4 bg-white p-4" options={config} data={data} />;
};

export default LineGraph;
