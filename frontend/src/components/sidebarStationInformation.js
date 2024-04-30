import { Typography } from "@mui/material";

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

const InfoItem = ({ label, value }) => {
    return (
      <>
        <Typography variant="body1">{label}:</Typography>
        <Typography variant="body1" style={{ paddingBottom: '20px' }}>
          {value}
        </Typography>
      </>
    );
  };

export default function SidebarStationInformation({ hydrophoneData }){
    const {
        site,
        latitude,
        longitude,
        hydrophone_operator_name,
        model,
        mounting_type,
        height_from_seafloor,
        sampling_frequency,
        depth,
        first_deployment_date,
        last_deployment_date,
        calibration_available,
        range,
        angle_of_view,
        website
    } = hydrophoneData;

    return(
        <div style={{ paddingLeft: '20px' }}>
            <InfoItem label="Organization" value={hydrophone_operator_name} />
            <InfoItem label="Site" value={site} />
            <InfoItem label="Location" value={latitude + ", " + longitude} />
            <InfoItem label="Hydrophone (Brand and Model)" value={model} />
            <InfoItem label="Mounting Type" value={mounting_type} />
            <InfoItem label="Height from Seafloor (m)" value={height_from_seafloor} />
            <InfoItem label="Sampling Frequency (kHz)" value={sampling_frequency} />
            <InfoItem label="Depth (m, at median tide)" value={depth} />
            <InfoItem label="First Deployed" value={formatDate(first_deployment_date)} />
            <InfoItem label="Most Recently Deployed" value={formatDate(last_deployment_date)} />
            <InfoItem label="Calibrated Hydrophone?" value={calibration_available ? "Yes" : "No"} />
            <InfoItem label="Estimated Range (m)" value={range} />
            <InfoItem label="Estimated Angle of View (degs)" value={angle_of_view} />
            <InfoItem label="Organization Website" value={<a href={website}>{website}</a>} />
            <Typography variant="body1" style={{ paddingBottom: '20px' }}>
                Learn more about hydrophone metadata in our Education Hub.
            </Typography>
        </div>
    );
}