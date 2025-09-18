"use server";

import { parseOnuDetails, parseOnuState } from "@/lib/olt-parser";
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