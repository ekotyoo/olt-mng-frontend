"use client";

import { Onu, OnuConfig, OnuDetail } from "@/lib/type";
import { configureOnuAction, getUnconfiguredOnus, getNextOnuId, getAvailableProfiles } from "@/app/actions/onu";
import { getOltOptions } from "@/app/actions/olt";
import OnuConfigForm from "./components/onu-config-form";
import SearchOnu from "./components/search-onu";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ... imports
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OnuConfigurationContent() {
  const searchParams = useSearchParams();

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
    // 1. Fetch OLT Options
    getOltOptions().then((opts) => {
      setOltOptions(opts);

      // 2. Handle URL Params after Options are loaded
      const paramOlt = searchParams.get("olt");
      const paramSerial = searchParams.get("serial");

      if (paramOlt) {
        setSelectedOlt(paramOlt);

        // Fetch Profiles
        getAvailableProfiles(paramOlt).then(setProfiles).catch(console.error);

        // Fetch ONUs with Loading State
        setScanOnuLoading(true);
        getUnconfiguredOnus(paramOlt).then(data => {
          setOnus(data);

          if (paramSerial) {
            const target = data.find(o => o.serial === paramSerial);
            if (target) {
              setSelectedOnu(target);
              // Fetch details and initialize form
              getOnuDetailWrapper({
                olt: paramOlt,
                slotPort: target.slot_port,
                serialNumber: target.serial,
              });
            }
          }
        })
          .catch(err => {
            toast.error("Failed to load unconfigured ONUs");
            console.error(err);
          })
          .finally(() => {
            setScanOnuLoading(false);
          });
      }
    }).catch(console.error);
  }, [searchParams]); // Re-run if URL changes

  // ... rest of the component logic (reuse existing functions, just removed useEffect dependencys issues) 

  // NOTE: I am redefining the component logic here, but relying on existing helper functions.
  // To avoid duplication, I should just modify the existing component.
  // BUT: The existing component handles internal detailed fetching.

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
        olt: selectedOlt || undefined
      });
      toast.success("ONU configured successfully");
      setSelectedOnu(null);
      setOnuDetail(null);
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
        selectedOlt={selectedOlt} // Pass selectedOlt prop if SearchOnu supports it (need to check)
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

export default function OnuConfiguration() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnuConfigurationContent />
    </Suspense>
  )
}
