import SidebarSpectrogram from "./sidebarSpectrogram";
import SidebarLineGraph from "./sidebarLineGraph";

export default function SidebarNoiseMetrics({ spectrogramData, spectrogramLoading, splData, splLoading }) {
  return (
    <div>
      <SidebarSpectrogram spectrogramData={spectrogramData} loading={spectrogramLoading} />
      <SidebarLineGraph splData={splData} loading={splLoading} />
    </div>
  );
}
  