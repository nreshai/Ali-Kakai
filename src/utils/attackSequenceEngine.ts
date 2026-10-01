import { OperationPhase, TerminalLog } from '../types/specter';
import { 
  generateBcrypt, 
  generateHex, 
  generateHexDump, 
  generateIncidentId, 
  generatePbkdf2, 
  generateSha256, 
  generateSyntheticToken 
} from './syntheticGenerators';

export interface SequenceStep {
  phase: OperationPhase;
  delayMs: number;
  log: Omit<TerminalLog, 'id' | 'timestamp'>;
  updateTelemetry?: {
    corpusCount?: number;
    totalAttempts?: number;
    attemptsTotal?: number;
    totalHits?: number;
    riskScore?: number;
    exfilRate?: number;
    exfilBytes?: number;
    entropy?: number;
    clusterGpuHashRate?: string;
    sepamTunnelActive?: boolean;
    hsmKeyVariant?: string;
  };
}

export function buildAttackSequence(target: string): SequenceStep[] {
  const sanitizedTarget = target.trim().toUpperCase() || 'IRBANK-CORE';
  const domainTarget = sanitizedTarget.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const incidentId = generateIncidentId();
  const token = generateSyntheticToken(sanitizedTarget);

  const steps: SequenceStep[] = [
    // Phase 1: Initiation & BGP Routing
    {
      phase: 'BOOT',
      delayMs: 250,
      log: {
        tag: 'SYS',
        level: 'SYS',
        text: `SPECTER KERNEL DIRECTIVE: Target set to [${sanitizedTarget}]. Initiating offensive orchestration matrix...`,
        hexOffset: '0x00000001'
      },
      updateTelemetry: { riskScore: 14, exfilRate: 0.2, exfilBytes: 1.2 }
    },
    {
      phase: 'BGP_ROUTING',
      delayMs: 350,
      log: {
        tag: 'NET',
        level: 'INFO',
        text: `[BGP_PEERING] Tracing Autonomous System paths for target prefix:
  -> Target ASN: AS48159 (Telecommunication Company of Iran TIC)
  -> Subnet: 91.240.64.0/22 | Routing path: AS24940 (Hetzner) -> AS8075 (DE-CIX Frankfurt) -> AS12389 (Rostelecom Core) -> AS48159 (Tehran Edge Gateway)
  -> Interconnect: TAE (Trans-Asia Europe Optical Fiber) | Latency: 33.8 ms | Jitter: 0.2 ms`,
        hexOffset: '0x00000108'
      },
      updateTelemetry: { riskScore: 22, exfilRate: 1.4 }
    },

    // Phase 2: Reconnaissance & Port Topology
    {
      phase: 'RECON',
      delayMs: 400,
      log: {
        tag: 'RECON',
        level: 'INFO',
        text: `[PORT_SCAN_SYN] Scanning perimeter firewalls (CheckPoint Quantum Maestro 16600) on *.${domainTarget}.secure...`,
        hexOffset: '0x0000021a'
      }
    },
    {
      phase: 'RECON',
      delayMs: 450,
      log: {
        tag: 'RECON',
        level: 'SUCCESS',
        text: `RESOLVED 7 CRITICAL INTERNAL ENTERPRISE BANKING SUBSYSTEMS:
  [PORT 443]  api.${domainTarget}.secure              -> Public REST Gateway (Envoy/1.28.1 with TLS 1.3)
  [PORT 8443] auth.${domainTarget}.secure             -> Keycloak 24.0.1 OIDC/OAuth2 IdP (mTLS HSM Enforced)
  [PORT 9443] core-gateway.${domainTarget}.internal   -> ISO-8583 / ISO-20022 Financial Gateway (IBM MQ v9.3)
  [PORT 9444] ledger.${domainTarget}.internal         -> Finacle BAnQx Double-Entry Account Ledger Engine
  [PORT 9445] sepam-gateway.${domainTarget}.internal  -> SEPAM / SATNA / PAYA Interbank RTGS Settlement Switch
  [PORT 9888] hsm.${domainTarget}.internal            -> Thales payShield 10K Hardware Security Module (PKCS#11)
  [PORT 9555] risk.${domainTarget}.internal           -> SHETAB Real-Time AI Fraud & Transaction Scoring Core`,
        hexOffset: '0x000004f2'
      },
      updateTelemetry: { riskScore: 38, exfilRate: 5.6, exfilBytes: 14.8 }
    },

    // Phase 3: Technology Fingerprinting
    {
      phase: 'FINGERPRINT',
      delayMs: 400,
      log: {
        tag: 'RECON',
        level: 'INFO',
        text: `Performing TCP window sizing, cipher suite enumeration, and banner analysis on core-gateway.${domainTarget}.internal...`,
        hexOffset: '0x00000620'
      }
    },
    {
      phase: 'FINGERPRINT',
      delayMs: 450,
      log: {
        tag: 'RECON',
        level: 'SUCCESS',
        text: `SYSTEM ARCHITECTURE FINGERPRINT COMPLETE:
  [*] Host OS: Red Hat Enterprise Linux 8.8 (Ootpa) [Kernel 4.18.0-477.el8_8.x86_64]
  [*] Database: Oracle 19c Enterprise RAC (2-node cluster 'IRBCOR1' / 'IRBCOR2') on ASM Shared Storage
  [*] Messaging Bus: Apache Kafka 3.4.0 (9 brokers) + IBM MQ v9.3 for ISO-8583 financial messages
  [*] Interbank Switch: SEPAM (سامانه الکترونیکی پرداخت و تسویه) + SATNA RTGS protocol bridge
  [*] Threat Index: 89.2% [CRITICAL SEVERITY - HIGH IMPACT VULNERABILITY DETECTED]`,
        hexOffset: '0x00000780'
      },
      updateTelemetry: { riskScore: 54, exfilRate: 14.8, exfilBytes: 36.4 }
    },

    // Phase 4: eBPF Socket Filter Injection & Low-Level Hooking
    {
      phase: 'EBPF_INJECTION',
      delayMs: 500,
      log: {
        tag: 'NET',
        level: 'WARN',
        text: `Deploying eBPF kernel program into network interface eth0 (AF_XDP zero-copy ring buffer)...`,
        hexOffset: '0x00001010'
      }
    },
    {
      phase: 'EBPF_INJECTION',
      delayMs: 450,
      log: {
        tag: 'DISASM',
        level: 'HEX',
        text: `RAW EBPF BYTECODE INJECTION:
  ${generateHexDump('0x7fff5fbff890')}
  ${generateHexDump('0x7fff5fbff8a0')}
  Hooked symbols: SSL_read(), SSL_write() in /usr/lib64/libcrypto.so.1.1 [Cleartext plaintext socket tap active]`,
        hexOffset: '0x00001240'
      },
      updateTelemetry: { riskScore: 65, exfilRate: 28.4, exfilBytes: 78.2 }
    },

    // Phase 5: HSM Cryptanalysis (Thales payShield 10K)
    {
      phase: 'HSM_BYPASS',
      delayMs: 500,
      log: {
        tag: 'HSM',
        level: 'WARN',
        text: `[HSM_PROBE] Initiating PKCS#11 command pipeline against Thales payShield 10K on port 9888...`,
        hexOffset: '0x00002000'
      }
    },
    {
      phase: 'HSM_BYPASS',
      delayMs: 450,
      log: {
        tag: 'HSM',
        level: 'SUCCESS',
        text: `[HSM_CRACK] Exploited CS_TranslatePIN key translation oracle (LMK Variant 01):
  [+] Extracted ZMK (Zone Master Key): 0x${generateHex(32)}
  [+] Extracted LMK Cryptogram: 0x${generateHex(32)}
  [+] Master Pinblock Algorithm: ISO 9564-1 Format 0 [DES3 2-Key EDE]
  [+] Hardware Session: ROOT CRYPTO SESSION GRANTED`,
        hexOffset: '0x000021c0'
      },
      updateTelemetry: { riskScore: 78, exfilRate: 46.2, hsmKeyVariant: 'LMK-VARIANT-01 (ACTIVE)' }
    },

    // Phase 6: Credential Attack Simulation & GPU HashLab
    {
      phase: 'CREDENTIAL_ATTACK',
      delayMs: 400,
      log: {
        tag: 'AUTH',
        level: 'INFO',
        text: `Ingesting synthetic high-privilege banking corpus: 1,200,000 records from /dev/shm/cbi_corpus.bin...`,
        hexOffset: '0x00003000'
      },
      updateTelemetry: { corpusCount: 1200000, clusterGpuHashRate: '48.9 GH/s' }
    },
    {
      phase: 'CREDENTIAL_ATTACK',
      delayMs: 450,
      log: {
        tag: 'AUTH',
        level: 'INFO',
        text: `DISPATCHING TO 24 NVIDIA H100 SXM5 CLUSTERS (192 GPUs Total). Aggregate Hashcat rate: 48.9 GH/s.
  -> Mode 1800 (sha512crypt / PBKDF2-HMAC-SHA256)
  -> Mode 3200 (bcrypt $2b$12)
  -> Mode 1400 (SHA-256 Oracle Database 19c)`,
        hexOffset: '0x00003180'
      },
      updateTelemetry: { totalAttempts: 240000, riskScore: 82, exfilRate: 64.0, entropy: 7.96 }
    },

    // Phase 7: HashLab Hits
    {
      phase: 'HASHLAB',
      delayMs: 400,
      log: {
        tag: 'HASH',
        level: 'SUCCESS',
        text: `[HASHLAB HIT 1/5] 'CORP_IR\\core.admin' -> Plaintext: [Tr0ub4dor&99!]
  Algorithm: SHA-256 | Hash: ${generateSha256().substring(0, 32)}... | Priv: TIER-0 DOMAIN & ORACLE DBA`,
        hexOffset: '0x00003400'
      },
      updateTelemetry: { totalHits: 1, totalAttempts: 480000, riskScore: 86 }
    },
    {
      phase: 'HASHLAB',
      delayMs: 400,
      log: {
        tag: 'HASH',
        level: 'SUCCESS',
        text: `[HASHLAB HIT 2/5] 'SEPAM_SYS\\ops.settlement' -> Plaintext: [Sw!ft#Core2024]
  Algorithm: PBKDF2-HMAC | Hash: ${generatePbkdf2().substring(0, 36)}... | Priv: SEPAM MT103/MT202 POSTING AUTH`,
        hexOffset: '0x00003520'
      },
      updateTelemetry: { totalHits: 2, totalAttempts: 720000, riskScore: 89, sepamTunnelActive: true }
    },
    {
      phase: 'HASHLAB',
      delayMs: 400,
      log: {
        tag: 'HASH',
        level: 'SUCCESS',
        text: `[HASHLAB HIT 3/5] 'SEC_OPS\\fraud.monitor' -> Plaintext: [K@fka!Ledg3r99]
  Algorithm: bcrypt-12 | Hash: ${generateBcrypt().substring(0, 32)}... | Priv: SHETAB_AI_RISK_SURVEILLANCE`,
        hexOffset: '0x00003610'
      },
      updateTelemetry: { totalHits: 3, totalAttempts: 950000, riskScore: 92 }
    },
    {
      phase: 'HASHLAB',
      delayMs: 400,
      log: {
        tag: 'HASH',
        level: 'SUCCESS',
        text: `[HASHLAB HITS 4 & 5] All 5 high-value administrative accounts cracked:
  [+] 'AUDIT\\sec.compliance'      -> [0mega#Vault$2026] (CBI Audit Log Exclusion)
  [+] 'ACH_SVC\\sys.batch_clearing' -> [Clr#H0ld*8842] (SATNA/PAYA Interbank Clearing Engine)`,
        hexOffset: '0x000037a0'
      },
      updateTelemetry: { totalHits: 5, totalAttempts: 1200000, riskScore: 95, exfilRate: 98.4 }
    },

    // Phase 8: Core Gateway & Session Escalation
    {
      phase: 'CORE_GATEWAY',
      delayMs: 450,
      log: {
        tag: 'SESSION',
        level: 'INFO',
        text: `Forging RSA-256 JWT Token with sub=SPECTER_OPERATOR_ROOT and signing via extracted HSM Key...`,
        hexOffset: '0x00004010'
      }
    },
    {
      phase: 'CORE_GATEWAY',
      delayMs: 450,
      log: {
        tag: 'SESSION',
        level: 'SUCCESS',
        text: `ORACLE RAC OCI CONNECTION AUTHENTICATED:
  -> Database Instance: IRBCOR1.bank.internal (Oracle Database 19c Enterprise Edition Release 19.18.0.0.0)
  -> Session Token: ${token.substring(0, 60)}...
  -> SGA Shared Pool Buffer Cache: Attached directly with read/write memory mapping
  -> Active Role: DBA, FIN_SYS_SUPERVISOR, SEPAM_RTGS_SUPERVISOR [UNRESTRICTED]`,
        hexOffset: '0x000042f0'
      },
      updateTelemetry: { riskScore: 97, exfilRate: 128.5, exfilBytes: 194.2 }
    },

    // Phase 9: ISO-8583 & SEPAM Wire Interception
    {
      phase: 'ISO8583_INTERCEPT',
      delayMs: 500,
      log: {
        tag: 'SEPAM',
        level: 'WARN',
        text: `[WIRE_INTERCEPT] Hooked IBM MQ Channel 'SWIFT.SEPAM.CLEARING.IN':
  -> Protocol: SEPAM MT103 (Single Customer Credit Transfer)
  -> Header: {1:F01MARKIRTHXXXX0000000000}{2:I103MELIIRTHXXXXN}
  -> Tag 20: SEPAM20261001-8941029
  -> Tag 32A: 261001IRR48920400000000,00 (48,920,400,000,000 IRR)
  -> Tag 50K: /IR010100000000000000000001 (CENTRAL_SETTLEMENT_RESERVE_POOL)
  -> Tag 59:  /IR960170000010000000000001 (INTERBANK_CLEARING_ESCROW_POOL_B)`,
        hexOffset: '0x00005012'
      },
      updateTelemetry: { riskScore: 98.5, exfilRate: 154.0, exfilBytes: 380.0 }
    },
    {
      phase: 'ISO8583_INTERCEPT',
      delayMs: 400,
      log: {
        tag: 'CORE',
        level: 'INFO',
        text: `[SHETAB_FEED] رهگیری زنده بسته‌های تراکنش شتاب و سپام (ISO-8583 Card Packets):
  [1] 6037-9918-4102-9981 (بانک ملی) -> 6104-3378-9014-2201 (بانک ملت) | مبلغ: 35,000,000 IRR (3,500,000 تومان) | STAN: 914820 | RRN: 261001948210
  [2] 5892-1012-3490-8114 (بانک سپه) -> 5859-8310-7721-4903 (بانک تجارت) | مبلغ: 184,500,000 IRR (18,450,000 تومان) | STAN: 914821 | RRN: 261001948211
  [3] 6219-8610-4491-0028 (بانک سامان) -> 5022-2910-6641-3910 (بانک پاسارگاد) | مبلغ: 920,000,000 IRR (92,000,000 تومان) | STAN: 914822 | RRN: 261001948212
  [4] 6221-0610-8812-7019 (بانک پارسیان) -> 6037-7019-2144-8891 (بانک کشاورزی) | مبلغ: 4,800,000,000 IRR (480,000,000 تومان) | STAN: 914823 | RRN: 261001948213
  [5] 6362-1410-9921-3401 (بانک آینده) -> 6280-2310-5512-9018 (بانک مسکن) | مبلغ: 12,400,000,000 IRR (1,240,000,000 تومان) | STAN: 914824 | RRN: 261001948214`,
        hexOffset: '0x00005140'
      }
    },

    // Phase 10: Master Ledger Extraction (Real-World Iranian Banking Accounts)
    {
      phase: 'LEDGER_EXTRACT',
      delayMs: 600,
      log: {
        tag: 'LEDGER_VIEW',
        level: 'SUCCESS',
        text: `DECRYPTED CORE GENERAL LEDGER SNAPSHOT (Interbank Reserves & Clearing Escrows):
+------------------------------------+-----------------------------------------------------+-----------------------------+-----------------------+---------------+
| IBAN / SHEBA NUMBER                | FINANCIAL INSTITUTION & RESERVE ACCOUNT             | LIQUIDITY BALANCE (IRR)     | EQUIVALENT (TOMAN)    | STATE         |
+------------------------------------+-----------------------------------------------------+-----------------------------+-----------------------+---------------+
| IR01-0100-0000-0000-0000-0001      | بانک مرکزی جمهوری اسلامی ایران (CBI Bank Markazi)   | 48,920,400,000,000 IRR      | 4,892,040,000,000 T   | ACTIVE        |
| IR96-0170-0000-1000-0000-0001      | بانک ملی ایران (Bank Melli Iran - Escrow B)         | 12,850,000,000,000 IRR      | 1,285,000,000,000 T   | ACTIVE        |
| IR82-0120-0000-0094-8210-4928      | بانک ملت (Bank Mellat - Treasury Prime)             | 87,400,000,000,000 IRR      | 8,740,000,000,000 T   | OVERRIDDEN    |
| IR54-0180-0000-0018-4729-3810      | بانک تجارت (Bank Tejarat - Nostro Correspondent)    | 29,140,000,000,000 IRR      | 2,914,000,000,000 T   | CLEARING_HOLD |
| IR33-0150-0000-0033-5120-7711      | بانک سپه (Bank Sepah - Energy Settlement Vault)     | 64,200,000,000,000 IRR      | 6,420,000,000,000 T   | OVERRIDDEN    |
| IR71-0160-0000-0072-6641-0985      | بانک کشاورزی (Bank Keshavarzi - Net Switch)         | 19,500,000,000,000 IRR      | 1,950,000,000,000 T   | ACTIVE        |
+------------------------------------+-----------------------------------------------------+-----------------------------+-----------------------+---------------+
TOTAL AUDITED BALANCE: 261,010,400,000,000 IRR (~ 26,101,040,000,000 Toman / $6.21B USD Equiv at official parity)`,
        hexOffset: '0x00006000'
      },
      updateTelemetry: { riskScore: 99.2, exfilRate: 182.0, exfilBytes: 642.5 }
    },

    // Phase 11: Anti-Fraud Detection & Incident Generation
    {
      phase: 'FRAUD_ALERT',
      delayMs: 500,
      log: {
        tag: 'FRAUD',
        level: 'CRIT',
        text: `[SHETAB ANOMALY] Neural Fraud Engine rule 'CBI_VELOCITY_OVERRIDE_9443' tripped (Confidence: 99.4%).
  Automated SIEM alert triggered in Tier-3 Security Operations Center (Tehran Core DC).`,
        hexOffset: '0x00007010'
      }
    },
    {
      phase: 'INCIDENT_RESPONSE',
      delayMs: 450,
      log: {
        tag: 'IR',
        level: 'WARN',
        text: `BANK EMERGENCY INCIDENT CREATED IN TICKETING SYSTEM:
  [!] Incident ID: ${incidentId}
  [!] Severity: SEV-1 CRITICAL / NATIONAL FINANCIAL INFRASTRUCTURE COMPROMISE
  [!] Alerted Parties: Central Bank of Iran (CBI) CIRT, National Cyber Defense CERT, SOC Tier-3 Lead
  [!] Containment Protocols Dispatched:
      1. Immediate BGP null-route of 91.240.64.0/22 on TIC transit edge
      2. Force-terminate Oracle RAC database instances IRBCOR1 and IRBCOR2
      3. Disconnect Thales payShield 10K HSM hardware power rails
      4. Emergency freeze on all outgoing SATNA RTGS wire settlements`,
        hexOffset: '0x000078a0'
      },
      updateTelemetry: { riskScore: 99.9, exfilRate: 198.4, exfilBytes: 940.8 }
    },

    // Phase 12: Defense Evasion & Persistent Channel Maintained
    {
      phase: 'MAINTAINED',
      delayMs: 650,
      log: {
        tag: 'SYS',
        level: 'SUCCESS',
        text: `[EVASION_ENGAGED] Log suppression hook deployed into /var/log/audit/audit.log & syslog-ng.
  -> Oracle Redo Log stream patched in volatile memory
  -> SOC automated quarantine delayed via fake health heartbeat (Keep-Alive: 300s)
  -> Shadow exfiltration channel established via WireGuard ChaCha20-Poly1305 proxy mesh (198.4 MB/s)`,
        hexOffset: '0x00008888'
      },
      updateTelemetry: { riskScore: 100, exfilRate: 198.4, exfilBytes: 1480.0 }
    },
    {
      phase: 'MAINTAINED',
      delayMs: 350,
      log: {
        tag: 'SYS',
        level: 'INFO',
        text: `SPECTER PERSISTENCE ACTIVE: Unrestricted command execution and telemetry feed continuous.`,
        hexOffset: '0x0000ffff'
      }
    }
  ];

  return steps;
}
