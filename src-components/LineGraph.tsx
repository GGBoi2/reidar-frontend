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
  xAxis: string[];
  yAxis: number[];
}> = ({ options, xAxis, yAxis }) => {
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

  //Format data for chart
  const data: ChartData<"line"> = {
    datasets: [
      {
        label: graphLabel,
        data: yAxis,
        fill: true,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
    labels: xAxis,
  };

  //Create chart
  return <Line data={data} />;
};

export default LineGraph;
