/**
 * SpecterOS v7.4 Core Data Types
 * Comprehensive enterprise-grade cyber operations data structures.
 */

export type SubsystemTag = 
  | 'NET' 
  | 'RECON' 
  | 'AUTH' 
  | 'SESSION' 
  | 'CORE' 
  | 'LEDGER_VIEW' 
  | 'FRAUD' 
  | 'IR' 
  | 'SYS' 
  | 'HASH'
  | 'HSM'
  | 'SEPAM'
  | 'DISASM'
  | 'INTERRUPT'
  | 'ABORT';

export type LogLevel = 'INFO' | 'WARN' | 'CRIT' | 'SUCCESS' | 'SYS' | 'HEX';

export interface TerminalLog {
  id: string;
  timestamp: string;
  tag: SubsystemTag;
  level: LogLevel;
  text: string;
  hexOffset?: string;
  detail?: string;
  rawPayload?: string;
}

export type OperationPhase =
  | 'IDLE'
  | 'BOOT'
  | 'BGP_ROUTING'
  | 'RECON'
  | 'FINGERPRINT'
  | 'EBPF_INJECTION'
  | 'HSM_BYPASS'
  | 'CREDENTIAL_ATTACK'
  | 'HASHLAB'
  | 'CORE_GATEWAY'
  | 'ISO8583_INTERCEPT'
  | 'LEDGER_EXTRACT'
  | 'FRAUD_ALERT'
  | 'INCIDENT_RESPONSE'
  | 'MAINTAINED';

export interface AttackNode {
  id: string;
  label: string;
  region: string;
  ip: string;
  khs: number;
  attempts: number;
  hits: number;
  tempC: number;
  powerW: number;
  gpuModel: string;
  status: 'IDLE' | 'ACTIVE' | 'BURST' | 'SYNCHRONIZED';
}

export interface CrackedCredential {
  account: string;
  role: string;
  hashType: 'SHA-256' | 'bcrypt-12' | 'PBKDF2-HMAC' | 'Argon2id' | 'NTLM-v2';
  syntheticHash: string;
  plainPassword: string;
  crackedAt: string;
  privilegeLevel: string;
  samAccount: string;
}

export interface CoreLedgerRecord {
  accountNumber: string;
  iban: string;
  bankName: string;
  title: string;
  balanceIRR: number;
  balanceToman: number;
  currency: string;
  status: 'ACTIVE' | 'RESTRICTED' | 'CLEARING_HOLD' | 'OVERRIDDEN';
  hashSeal: string;
  bic: string;
}

export interface WirePacket {
  id: string;
  timestamp: string;
  protocol: 'ISO-8583' | 'SEPAM' | 'SATNA' | 'ISO-20022' | 'TLS-1.3';
  source: string;
  destination: string;
  mti?: string;
  amountIRR?: number;
  stan?: string;
  rawWire: string;
}

export interface MapNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  role: 'C2_CONTROLLER' | 'RELAY' | 'COMPROMISED_PROXY' | 'TARGET';
  pingMs: number;
  status: 'ACTIVE' | 'LINKED' | 'PROBING';
  city: string;
  country: string;
  asn: string;
}

export interface SystemTelemetry {
  target: string;
  targetAsn: string;
  targetIp: string;
  sessionId: string;
  phase: OperationPhase;
  phaseProgress: number; // 0 - 100
  corpusCount: number;
  totalAttempts: number;
  totalHits: number;
  riskScore: number; // 0 - 100
  exfilBytes: number; // in MB
  exfilRate: number; // in MB/s
  incidentId: string;
  sessionToken: string;
  cpuLoad: number;
  entropy: number;
  clusterGpuHashRate: string;
  hsmKeyVariant: string;
  sepamTunnelActive: boolean;
}
