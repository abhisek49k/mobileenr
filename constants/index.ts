export const MAX_STEPS = 10;

export const PRIME_CONTRACTORS = [
  { label: 'Eisman & Russo, Inc.', value: 'contractor_er' },
  { label: 'Disaster Masters LLC', value: 'contractor_dm' },
];
export const SUB_CONTRACTORS = [
  { label: 'Local Hauling Services', value: 'sub_lhs' },
  { label: 'Debris Removers Co.', value: 'sub_drc' },
];

export const USA_STATES = [
  { label: "Alabama", value: "alabama" },
  { label: "Alaska", value: "alaska" },
  { label: "Arizona", value: "arizona" },
  { label: "Arkansas", value: "arkansas" },
  { label: "California", value: "california" },
  { label: "Colorado", value: "colorado" },
  { label: "Connecticut", value: "connecticut" },
  { label: "Delaware", value: "delaware" },
  { label: "Florida", value: "florida" },
  { label: "Georgia", value: "georgia" },
  { label: "Hawaii", value: "hawaii" },
  { label: "Idaho", value: "idaho" },
  { label: "Illinois", value: "illinois" },
  { label: "Indiana", value: "indiana" },
  { label: "Iowa", value: "iowa" },
  { label: "Kansas", value: "kansas" },
  { label: "Kentucky", value: "kentucky" },
  { label: "Louisiana", value: "louisiana" },
  { label: "Maine", value: "maine" },
  { label: "Maryland", value: "maryland" },
  { label: "Massachusetts", value: "massachusetts" },
  { label: "Michigan", value: "michigan" },
  { label: "Minnesota", value: "minnesota" },
  { label: "Mississippi", value: "mississippi" },
  { label: "Missouri", value: "missouri" },
  { label: "Montana", value: "montana" },
  { label: "Nebraska", value: "nebraska" },
  { label: "Nevada", value: "nevada" },
  { label: "New Hampshire", value: "new_hampshire" },
  { label: "New Jersey", value: "new_jersey" },
  { label: "New Mexico", value: "new_mexico" },
  { label: "New York", value: "new_york" },
  { label: "North Carolina", value: "north_carolina" },
  { label: "North Dakota", value: "north_dakota" },
  { label: "Ohio", value: "ohio" },
  { label: "Oklahoma", value: "oklahoma" },
  { label: "Oregon", value: "oregon" },
  { label: "Pennsylvania", value: "pennsylvania" },
  { label: "Rhode Island", value: "rhode_island" },
  { label: "South Carolina", value: "south_carolina" },
  { label: "South Dakota", value: "south_dakota" },
  { label: "Tennessee", value: "tennessee" },
  { label: "Texas", value: "texas" },
  { label: "Utah", value: "utah" },
  { label: "Vermont", value: "vermont" },
  { label: "Virginia", value: "virginia" },
  { label: "Washington", value: "washington" },
  { label: "West Virginia", value: "west_virginia" },
  { label: "Wisconsin", value: "wisconsin" },
  { label: "Wyoming", value: "wyoming" },
];

interface Option {
  label: string;
  value: string;
}

interface Project {
  id: string;
  name: string;
  location: string;
  primeContractors: Option[];
  subContractors: Option[];
}

// --- Mock Data ---
// In a real app, this would come from an API call.
export const MOCK_PROJECTS: Project[] = [
  {
    id: "proj_123",
    name: "Hurricane Ian COJ Debris Monitoring Services",
    location: "FLORIDA Jacksonville",
    primeContractors: [
      { label: "AshBritt Environmental", value: "ashbritt_env" },
      { label: "CrowderGulf", value: "crowdergulf" },
      { label: "Ceres Environmental Services", value: "ceres_env" },
    ],
    subContractors: [
      { label: "DRC Emergency Services", value: "drc_emergency" },
      { label: "Phillips & Jordan", value: "phillips_jordan" },
      { label: "Custom Tree Care", value: "custom_tree_care" },
    ],
  },
  {
    id: "proj_456",
    name: "Coastal Storm Ida Restoration Project",
    location: "NEW YORK Suffolk County",
    primeContractors: [
      { label: "Tetra Tech Inc.", value: "tetra_tech" },
      { label: "Haugland Energy Group", value: "haugland_energy" },
      { label: "ECC (Environmental Chemical Corp)", value: "ecc_env" },
    ],
    subContractors: [
      { label: "Apex Companies LLC", value: "apex_companies" },
      { label: "Arcadis US", value: "arcadis_us" },
      { label: "WSP USA Environment", value: "wsp_usa" },
    ],
  },
  {
    id: "proj_789",
    name: "Wildfire Cleanup and Recovery",
    location: "CALIFORNIA Napa Valley",
    primeContractors: [
      { label: "Cal Fire Restoration Group", value: "cal_fire_restoration" },
      { label: "Sukut Construction", value: "sukut_construction" },
      {
        label: "Pacific States Environmental Contractors",
        value: "pacific_states_env",
      },
    ],
    subContractors: [
      { label: "SCS Engineers", value: "scs_engineers" },
      { label: "Granite Construction", value: "granite_construction" },
      { label: "Environmental Recovery Corp", value: "erc_recovery" },
    ],
  },
];


