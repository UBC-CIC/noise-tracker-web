import SidebarSpectrogram from "./sidebarSpectrogram";
import SidebarLineGraph from "./sidebarLineGraph";

export default function SidebarNoiseMetrics({ spectrogramData, splData }) {
  return (
    <div>
      <SidebarSpectrogram spectrogramData={spectrogramData} />
      <SidebarLineGraph splData={splData} />
    </div>
  );
}

  