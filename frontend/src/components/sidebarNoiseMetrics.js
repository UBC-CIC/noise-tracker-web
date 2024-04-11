import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import SidebarSpectrogram from "./sidebarSpectrogram";
import LineGraph from "./linegraph";

import { Button } from '@mui/material';

export default function SidebarNoiseMetrics({ spectrogramData }) {
  return (
    <SidebarSpectrogram spectrogramData={spectrogramData} />
  );
}

  