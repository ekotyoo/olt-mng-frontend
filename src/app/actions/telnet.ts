"use server";

import { parseAttenuationInfo, parseOnuDetails, parseOnuState } from "@/lib/olt-parser";
import { runOltCommand } from "@/lib/telnet-service";

/**
 * Server Action wrapper for React components
 */
export async function runTelnetCommand(command: string): Promise<string> {
  return await runOltCommand(command);
}

export async function getAllOnuDetails(): Promise<OnuDetails[]> {
  const res = await runTelnetCommand("show running");
  const onuList = parseOnuDetails(res);

  return onuList;
}

export async function getPonPortOverview(): Promise<PonPortOverview[]> {
  const result = await runTelnetCommand("show gpon onu state");
  const data = parseOnuState(result);

  return data;
}

export async function getAttenuationInfo({ slotPort, onuId }: { slotPort: string, onuId: string }) {
  const result = await runTelnetCommand(`show pon power attenuation gpon-onu_${slotPort}:${onuId}`);
  const data = parseAttenuationInfo(result);

  return data;
}