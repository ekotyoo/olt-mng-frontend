"use client";

import OnuConfigForm from "@/components/onu-config-form";
import SearchOnu from "@/components/search-onu";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function OnuConfiguration() {
  const [scanOnuLoading, setScanOnuLoading] = useState(false);
  const [onuFormLoading, setOnuFormLoading] = useState(false);
  const [onuFormSubmitting, setOnuFormSubmitting] = useState(false);

  const [selectedOlt, setSelectedOlt] = useState<string | null>(null);
  const [selectedOnu, setSelectedOnu] = useState<Onu | null>(null);

  const [onus, setOnus] = useState<Onu[]>([]);
  const [onuDetail, setOnuDetail] = useState<OnuDetail | null>(null);

  useEffect(() => {
    if (!selectedOlt) return;
    getUncfgOnu(selectedOlt);
  }, [selectedOlt]);

  async function getUncfgOnu(oltKey: string) {
    try {
      setScanOnuLoading(true);
      const res = await fetch("http://localhost:5000/get_unconfigured_onus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ olt: oltKey }),
      });

      const data = await res.json();
      setOnus(data.onus as Onu[]);

      return data;
    } catch (e) {
      console.log(e);
    } finally {
      setScanOnuLoading(false);
    }
  }

  async function getOnuDetail({
    olt,
    slotPort,
    serialNumber,
  }: {
    olt: string;
    slotPort: string;
    serialNumber: string;
  }) {
    try {
      setOnuFormLoading(true);
      const res = await fetch("http://localhost:5000/get_onu_details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          olt: olt,
          slot_port: slotPort,
          serial: serialNumber,
        }),
      });

      const data = await res.json();
      setOnuDetail(data as OnuDetail);
    } catch (e) {
      console.log(e);
    } finally {
      setOnuFormLoading(false);
    }
  }

  async function configureOnu(onuConfig: OnuConfig) {
    try {
      setOnuFormSubmitting(true);
      const res = await fetch("http://localhost:5000/configure_onu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          olt: selectedOlt,
          slot_port: onuConfig.slotPort,
          onu_id: Number(onuConfig.onuId),
          serial: onuConfig.serialNumber,
          name: onuConfig.customerOnuName,
          pppoe_user: onuConfig.pppoeUsername,
          pppoe_pass: onuConfig.pppoePassword,
          vlan: Number(onuConfig.vlanId),
          profile: onuConfig.profile,
          vlan_profile: onuConfig.cvlanProfile,
        }),
      });

      const data = await res.json();
      toast("ONU configured successfully");
    } catch (e) {
      console.log(e);
    } finally {
      setOnuFormSubmitting(false);
    }
  }

  return (
    <div className="w-[400px] flex flex-col mx-auto px-4 py-3 gap-6 items-center">
      <SearchOnu
        isLoading={scanOnuLoading}
        onSelectOlt={(olt) => {
          setSelectedOlt(olt);
          getUncfgOnu(olt);
        }}
        selectedOnu={selectedOnu}
        onOnuClick={async (onu) => {
          if (!selectedOlt) return;

          setSelectedOnu(onu);
          getOnuDetail({
            olt: selectedOlt,
            slotPort: onu.slot_port,
            serialNumber: onu.serial,
          });
        }}
        onus={onus}
      />
      <OnuConfigForm
        onuDetail={onuDetail}
        isLoading={onuFormLoading}
        isSubmitting={onuFormSubmitting}
        onSubmit={(onuConfig) => {
          configureOnu(onuConfig);
        }}
      />
    </div>
  );
}
