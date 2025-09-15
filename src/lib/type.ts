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
