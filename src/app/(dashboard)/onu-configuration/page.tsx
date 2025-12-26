"use client";

import { Onu, OnuConfig, OnuDetail } from "@/lib/type";
import { configureOnuAction, getUnconfiguredOnus, getNextOnuId, getAvailableProfiles } from "@/app/actions/onu";
import { getOltOptions } from "@/app/actions/olt";
import OnuConfigForm from "./components/onu-config-form";
import SearchOnu from "./components/search-onu";
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
  const [oltOptions, setOltOptions] = useState<{ label: string; value: string }[]>([]);

  // Profile State
  const [profiles, setProfiles] = useState<{ tcont: string[]; vlan: string[]; activeVlans: { id: string, name: string }[] }>({
    tcont: [],
    vlan: [],
    activeVlans: []
  });

  useEffect(() => {
    getOltOptions().then(setOltOptions).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedOlt) return;
    // getUncfgOnu(selectedOlt);
    // Fetch profiles when OLT changes
    getAvailableProfiles(selectedOlt).then(setProfiles).catch(console.error);
  }, [selectedOlt]);

  async function getUncfgOnu(oltKey: string) {
    try {
      setScanOnuLoading(true);
      const data = await getUnconfiguredOnus(oltKey);
      setOnus(data);
      return data;
    } catch (e) {
      console.log(e);
      toast.error("Failed to fetch unconfigured ONUs");
    } finally {
      setScanOnuLoading(false);
    }
  }

  async function getOnuDetailWrapper({
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

      const nextId = await getNextOnuId(olt, slotPort);

      setOnuDetail({
        onu_id: nextId,
        slot_port: slotPort,
        serial: serialNumber,
        status: "unconfigured"
      });

    } catch (e) {
      console.log(e);
      toast.error("Failed to fetch ONU details");
    } finally {
      setOnuFormLoading(false);
    }
  }

  async function configureOnu(onuConfig: OnuConfig) {
    try {
      setOnuFormSubmitting(true);
      await configureOnuAction({
        ...onuConfig,
        olt: selectedOlt || undefined // Inject selectedOlt
      });
      toast.success("ONU configured successfully");

      // UX Improvement: Reset Selection
      setSelectedOnu(null);
      setOnuDetail(null);

      // refresh list
      if (selectedOlt) getUncfgOnu(selectedOlt);
    } catch (e) {
      console.log(e);
      toast.error("Failed to configure ONU");
    } finally {
      setOnuFormSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-5xl flex flex-col mx-auto px-4 py-3 gap-6 items-center">
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
          getOnuDetailWrapper({
            olt: selectedOlt,
            slotPort: onu.slot_port,
            serialNumber: onu.serial,
          });
        }}
        onus={onus}
        oltOptions={oltOptions}
      />
      {selectedOnu && (
        <OnuConfigForm
          onuDetail={onuDetail}
          isLoading={onuFormLoading}
          isSubmitting={onuFormSubmitting}
          tcontProfiles={profiles.tcont}
          vlanProfiles={profiles.vlan}
          activeVlans={profiles.activeVlans}
          onSubmit={(onuConfig) => {
            configureOnu(onuConfig);
          }}
        />
      )}
    </div>
  );
}
