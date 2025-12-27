export type Onu = {
  slot_port: string;
  serial: string;
};

export type OnuDetail = {
  onu_id: string;
  slot_port: string;
  serial: string;
  status: string;
};

export type OnuConfig = {
  olt?: string;
  slotPort?: string;
  onuId?: string;
  serialNumber?: string;
  customerOnuName?: string;
  pppoeUsername?: string;
  pppoePassword?: string;
  vlanId?: string;
  profile?: string;
  cvlanProfile?: string;
};

export type PonPortOverview = {
  port_id: string;
  onu_registered: number;
  onu_online: number;
  onu_offline: number;
  status: string;
}

export type OnuDetails = {
  slotPort: string;
  onuId: string;
  vendor?: string;
  serial: string; // Used in list table
  serialNumber?: string; // Used in detail view
  vlan?: string | null;
  pppoeUser?: string | null;
  pppoePass?: string | null;
  tcontProfile?: string | null;
  // Detail fields
  interface?: string;
  name?: string;
  type?: string;
  state?: string;
  description?: string;
  distance?: string;
  onlineDuration?: string;
};

export type AttenuationDirection = "up" | "down";

export interface AttenuationRow {
  direction: AttenuationDirection; // up / down
  rx: number;                      // in dBm
  tx: number;                      // in dBm
  attenuation: number;             // in dB
}

export type AttenuationInfo = AttenuationRow[];

export type OltInfo = {
  upTime: string;
  contact: string;
  systemName: string;
  location: string;
}

export type OltCard = {
  rack: string;
  shelf: string;
  slot: string;
  cfgType?: string;
  realType?: string;
  ports: string;
  hardwareVersion: string;
  softwareVersion: string;
  status: string;
}

export type OltCardDetail = {
  rack: string;
  shelf: string;
  slot: string;
  configType: string;
  status: string;
  ports: number;
  serialNumber: string;
  phyMemorySize: number;
  hardwareVersion: string;
  softwareVersion: string;
  cpuUsage: number;
  memoryUsage: number;
  upTime: string;
  lastRestartReason: string;
  temperature?: number;
}

export interface SystemLog {
  id: string; // generated
  date: string;
  level: string;
  message: string;
  code: string | null;
}
