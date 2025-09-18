type Onu = {
  slot_port: string;
  serial: string;
};

type OnuDetail = {
  onu_id: string;
  slot_port: string;
  serial: string;
  status: string;
};

type OnuConfig = {
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

type PonPortOverview = {
  port_id: string;
  onu_registered: number;
  onu_online: number;
  onu_offline: number;
  status: string;
}

type OnuDetails = {
  slotPort: string;
  onuId: string;
  vendor: string;
  serial: string;
  vlan?: string | null;
  pppoeUser?: string | null;
  pppoePass?: string | null;
  tcontProfile?: string | null;
};

type AttenuationDirection = "up" | "down";

interface AttenuationRow {
  direction: AttenuationDirection; // up / down
  rx: number;                      // in dBm
  tx: number;                      // in dBm
  attenuation: number;             // in dB
}

type AttenuationInfo = AttenuationRow[];