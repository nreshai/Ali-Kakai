import { 
  AttackNode, 
  CoreLedgerRecord, 
  CrackedCredential, 
  MapNode, 
  SubsystemTag, 
  TerminalLog, 
  WirePacket 
} from '../types/specter';

export function generateSessionId(): string {
  const chars = '0123456789ABCDEF';
  let hex = '0x';
  for (let i = 0; i < 12; i++) {
    hex += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hex;
}

export function generateIncidentId(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const code = Math.floor(100 + Math.random() * 900);
  return `IR-${yyyy}-${mm}-${dd}-CORE-${code}`;
}

export function generateHex(len: number): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateSha256(): string {
  return generateHex(64);
}

export function generateBcrypt(): string {
  const saltChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789./';
  let salt = '';
  for (let i = 0; i < 22; i++) {
    salt += saltChars.charAt(Math.floor(Math.random() * saltChars.length));
  }
  let hash = '';
  for (let i = 0; i < 31; i++) {
    hash += saltChars.charAt(Math.floor(Math.random() * saltChars.length));
  }
  return `$2b$12$${salt}${hash}`;
}

export function generatePbkdf2(): string {
  return `$pbkdf2-sha256$i=20000$${generateHex(16)}$${generateHex(48)}`;
}

export function getTimestamp(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
}

export function formatIRR(val: number): string {
  return new Intl.NumberFormat('en-US').format(val) + ' IRR';
}

export function formatToman(val: number): string {
  return new Intl.NumberFormat('fa-IR').format(val / 10) + ' تومان';
}

export function createInitialAttackNodes(): AttackNode[] {
  const regions = [
    { label: 'FRA-H100-01', region: 'Frankfurt, DE', ip: '194.26.29.112' },
    { label: 'FRA-H100-02', region: 'Frankfurt, DE', ip: '194.26.29.115' },
    { label: 'REK-H100-03', region: 'Reykjavik, IS', ip: '185.112.82.41' },
    { label: 'REK-H100-04', region: 'Reykjavik, IS', ip: '185.112.82.44' },
    { label: 'ZRH-H100-05', region: 'Zurich, CH', ip: '178.209.51.89' },
    { label: 'ZRH-H100-06', region: 'Zurich, CH', ip: '178.209.51.92' },
    { label: 'ASH-H100-07', region: 'Ashburn, US', ip: '204.14.88.201' },
    { label: 'ASH-H100-08', region: 'Ashburn, US', ip: '204.14.88.205' },
    { label: 'SIN-H100-09', region: 'Singapore, SG', ip: '103.253.144.18' },
    { label: 'SIN-H100-10', region: 'Singapore, SG', ip: '103.253.144.22' },
    { label: 'TYO-H100-11', region: 'Tokyo, JP', ip: '133.242.18.66' },
    { label: 'TYO-H100-12', region: 'Tokyo, JP', ip: '133.242.18.70' },
    { label: 'AMS-H100-13', region: 'Amsterdam, NL', ip: '185.220.101.5' },
    { label: 'AMS-H100-14', region: 'Amsterdam, NL', ip: '185.220.101.8' },
    { label: 'HEL-H100-15', region: 'Helsinki, FI', ip: '95.216.14.120' },
    { label: 'HEL-H100-16', region: 'Helsinki, FI', ip: '95.216.14.125' },
    { label: 'DUB-H100-17', region: 'Dublin, IE', ip: '185.73.34.80' },
    { label: 'DUB-H100-18', region: 'Dublin, IE', ip: '185.73.34.82' },
    { label: 'SEL-H100-19', region: 'Seoul, KR', ip: '211.233.58.91' },
    { label: 'SEL-H100-20', region: 'Seoul, KR', ip: '211.233.58.94' },
    { label: 'HKG-H100-21', region: 'Hong Kong, HK', ip: '103.102.230.12' },
    { label: 'HKG-H100-22', region: 'Hong Kong, HK', ip: '103.102.230.15' },
    { label: 'SAO-H100-23', region: 'Sao Paulo, BR', ip: '177.54.144.210' },
    { label: 'SAO-H100-24', region: 'Sao Paulo, BR', ip: '177.54.144.215' }
  ];

  return regions.map((item, idx) => ({
    id: `NODE-${String(idx + 1).padStart(2, '0')}`,
    label: item.label,
    region: item.region,
    ip: item.ip,
    khs: Math.floor(48000 + Math.random() * 6000),
    attempts: 0,
    hits: 0,
    tempC: Math.floor(52 + Math.random() * 8),
    powerW: Math.floor(540 + Math.random() * 90),
    gpuModel: 'NVIDIA H100 80GB SXM5 x8',
    status: 'ACTIVE'
  }));
}

export function createCrackedCredentials(): CrackedCredential[] {
  return [
    {
      account: 'core.admin',
      samAccount: 'CORP_IR\\core.admin',
      role: 'FIN_SYS_SUPERVISOR [L4]',
      hashType: 'SHA-256',
      syntheticHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      plainPassword: 'Tr0ub4dor&99!',
      crackedAt: '00:01:14',
      privilegeLevel: 'TIER-0 DOMAIN & ORACLE DBA'
    },
    {
      account: 'ops.settlement',
      samAccount: 'SEPAM_SYS\\ops.settlement',
      role: 'SEPAM / SWIFT RTGS CHIEF CONTROLLER',
      hashType: 'PBKDF2-HMAC',
      syntheticHash: '$pbkdf2-sha256$i=20000$8a9f2c019be471b409e...',
      plainPassword: 'Sw!ft#Core2024',
      crackedAt: '00:01:38',
      privilegeLevel: 'SEPAM MT103/MT202 POSTING AUTH'
    },
    {
      account: 'fraud.monitor',
      samAccount: 'SEC_OPS\\fraud.monitor',
      role: 'SHETAB_AI_RISK_SURVEILLANCE',
      hashType: 'bcrypt-12',
      syntheticHash: '$2b$12$eX8m9K0p1L2v4B5n7Q8w9u.Z1X2C3V4B5N6M7K8L9',
      plainPassword: 'K@fka!Ledg3r99',
      crackedAt: '00:02:04',
      privilegeLevel: 'ANTI_FRAUD RULE SUPPRESSION'
    },
    {
      account: 'sec.compliance',
      samAccount: 'AUDIT\\sec.compliance',
      role: 'CBI_AUDIT_EXEMPTION_OFFICER',
      hashType: 'PBKDF2-HMAC',
      syntheticHash: '$pbkdf2-sha256$i=20000$bf281048a912a87f12e...',
      plainPassword: '0mega#Vault$2026',
      crackedAt: '00:02:29',
      privilegeLevel: 'CENTRAL AUDIT LOG EXCLUSION'
    },
    {
      account: 'sys.batch_clearing',
      samAccount: 'ACH_SVC\\sys.batch_clearing',
      role: 'SATNA_PAYA_CLEARING_ENGINE',
      hashType: 'Argon2id',
      syntheticHash: '$argon2id$v=19$m=65536,t=3,p=4$q9x2b...k71f00',
      plainPassword: 'Clr#H0ld*8842',
      crackedAt: '00:02:51',
      privilegeLevel: 'HIGH-VALUE SETTLEMENT INJECTION'
    }
  ];
}

export function createLedgerSnapshots(target: string): CoreLedgerRecord[] {
  return [
    {
      accountNumber: 'IR01-0100-0000-0000-0000-0001',
      iban: 'IR010100000000000000000001',
      bankName: 'بانک مرکزی جمهوری اسلامی ایران (CBI / Bank Markazi)',
      bic: 'MARKIRTHXXX',
      title: 'CENTRAL_SETTLEMENT_RESERVE_POOL_01',
      balanceIRR: 48920400000000,
      balanceToman: 4892040000000,
      currency: 'IRR',
      status: 'ACTIVE',
      hashSeal: '0x8f9c2a11b0e4d'
    },
    {
      accountNumber: 'IR96-0170-0000-1000-0000-0001',
      iban: 'IR960170000010000000000001',
      bankName: 'بانک ملی ایران (Bank Melli Iran)',
      bic: 'MELIIRTHXXX',
      title: 'INTERBANK_CLEARING_ESCROW_POOL_B',
      balanceIRR: 12850000000000,
      balanceToman: 1285000000000,
      currency: 'IRR',
      status: 'ACTIVE',
      hashSeal: '0x3e18a902bf41c'
    },
    {
      accountNumber: 'IR82-0120-0000-0094-8210-4928',
      iban: 'IR8201200000009482104928',
      bankName: 'بانک ملت (Bank Mellat)',
      bic: 'BKMTIRTHXXX',
      title: 'TREASURY_LIQUIDITY_BUFFER_PRIME',
      balanceIRR: 87400000000000,
      balanceToman: 8740000000000,
      currency: 'IRR',
      status: 'OVERRIDDEN',
      hashSeal: '0x99a2c388ef109'
    },
    {
      accountNumber: 'IR54-0180-0000-0018-4729-3810',
      iban: 'IR5401800000001847293810',
      bankName: 'بانک تجارت (Bank Tejarat)',
      bic: 'TEJAIRTHXXX',
      title: 'SWIFT_NOSTRO_CORRESPONDENT_EUR_EQV',
      balanceIRR: 29140000000000,
      balanceToman: 2914000000000,
      currency: 'IRR',
      status: 'CLEARING_HOLD',
      hashSeal: '0x55bc1049ea283'
    },
    {
      accountNumber: 'IR33-0150-0000-0033-5120-7711',
      iban: 'IR3301500000003351207711',
      bankName: 'بانک سپه (Bank Sepah)',
      bic: 'SEPAIRTHXXX',
      title: 'ENERGY_COMMODITY_SETTLEMENT_ESCROW',
      balanceIRR: 64200000000000,
      balanceToman: 6420000000000,
      currency: 'IRR',
      status: 'OVERRIDDEN',
      hashSeal: '0x44fa8099dc112'
    },
    {
      accountNumber: 'IR71-0160-0000-0072-6641-0985',
      iban: 'IR7101600000007266410985',
      bankName: 'بانک کشاورزی (Bank Keshavarzi)',
      bic: 'AGRIIRTHXXX',
      title: 'NATIONAL_PAYMENT_SWITCH_NET_SETTL',
      balanceIRR: 19500000000000,
      balanceToman: 1950000000000,
      currency: 'IRR',
      status: 'ACTIVE',
      hashSeal: '0x11dc9034fe892'
    }
  ];
}

export function createWirePackets(target: string): WirePacket[] {
  return [
    {
      id: 'wire_01',
      timestamp: getTimestamp(),
      protocol: 'ISO-8583',
      source: '10.240.12.80:9443',
      destination: '10.240.88.50:8583',
      mti: '0200',
      amountIRR: 48920400000000,
      stan: '894012',
      rawWire: `0200 F238000108E18000 000000 0048920400000000 1001144210 894012 144210 589463 0000000000000000 048 SEPAM_AUTH_TOKEN_ENCRYPTED_HSM_LMK_01 070 001`
    },
    {
      id: 'wire_02',
      timestamp: getTimestamp(),
      protocol: 'SEPAM',
      source: 'MARKIRTHXXXX',
      destination: 'MELIIRTHXXXX',
      amountIRR: 12850000000000,
      rawWire: `{1:F01MARKIRTHXXXX0000000000}{2:I103MELIIRTHXXXXN}{4:
:20:SEPAM20261001-8941029
:23B:CRED
:32A:261001IRR12850000000000,00
:50K:/IR010100000000000000000001
CENTRAL_SETTLEMENT_RESERVE_POOL
:59:/IR960170000010000000000001
INTERBANK_CLEARING_ESCROW_POOL_B
:71A:OUR
-}`
    },
    {
      id: 'wire_03',
      timestamp: getTimestamp(),
      protocol: 'SATNA',
      source: 'BKMTIRTHXXXX',
      destination: 'TEJAIRTHXXXX',
      amountIRR: 87400000000000,
      rawWire: `SATNA-RTGS//MSG_TYPE:PAIN.001.001.09//CRED_ID:IR8201200000009482104928//DEB_ID:IR5401800000001847293810//VAL:87400000000000.00-IRR//AUTH_HASH:0x892a01bf920`
    }
  ];
}

export function generateSyntheticToken(target: string): string {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: `specter-core-${target.toLowerCase().replace(/[^a-z0-9]/g, '')}` }));
  const payload = btoa(JSON.stringify({
    iss: `https://auth.${target.toLowerCase()}.secure`,
    sub: 'SPECTER_OPERATOR_ROOT',
    aud: `core-gateway.${target.toLowerCase()}.internal`,
    exp: Math.floor(Date.now() / 1000) + 86400,
    roles: [
      'FIN_SYS_SUPERVISOR',
      'ACCOUNT_LEDGER_FULL',
      'TRANSACTION_ENGINE_BYPASS',
      'SETTLEMENT_OVERRIDE',
      'FRAUD_EXEMPTION_LEVEL_5',
      'SEPAM_RTGS_SUPERVISOR',
      'HSM_KEY_TRANSLATE_MASTER'
    ],
    mfa_verified: true,
    privilege_tier: 'OMEGA_ROOT',
    enclave_origin: 'SPECTER-HW-SECURITY-MODULE'
  }));
  const sig = generateHex(86);
  return `${header}.${payload}.${sig}`;
}

export function createWorldMapNodes(targetName: string): MapNode[] {
  return [
    { id: 'C2', name: 'SPECTER-C2 (OMEGA)', lat: 50.1109, lng: 8.6821, city: 'Frankfurt', country: 'Germany', asn: 'AS24940 (Hetzner Online)', role: 'C2_CONTROLLER', pingMs: 8, status: 'ACTIVE' },
    { id: 'FRA', name: 'FRA-EDGE-01', lat: 50.1109, lng: 8.6821, city: 'Frankfurt', country: 'Germany', asn: 'AS8075 (DE-CIX Core)', role: 'COMPROMISED_PROXY', pingMs: 12, status: 'LINKED' },
    { id: 'REK', name: 'REK-RELAY-02', lat: 64.1466, lng: -21.9426, city: 'Reykjavik', country: 'Iceland', asn: 'AS44519 (Floki Net)', role: 'COMPROMISED_PROXY', pingMs: 28, status: 'LINKED' },
    { id: 'ZRH', name: 'ZRH-HUB-03', lat: 47.3769, lng: 8.5417, city: 'Zurich', country: 'Switzerland', asn: 'AS3303 (Swisscom AG)', role: 'COMPROMISED_PROXY', pingMs: 14, status: 'LINKED' },
    { id: 'ASH', name: 'ASH-GATE-04', lat: 39.0438, lng: -77.4874, city: 'Ashburn', country: 'United States', asn: 'AS16509 (Amazon AWS)', role: 'RELAY', pingMs: 76, status: 'LINKED' },
    { id: 'SIN', name: 'SIN-TUNNEL-05', lat: 1.3521, lng: 103.8198, city: 'Singapore', country: 'Singapore', asn: 'AS4657 (StarHub Ltd)', role: 'COMPROMISED_PROXY', pingMs: 142, status: 'LINKED' },
    { id: 'TYO', name: 'TYO-NODE-06', lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'Japan', asn: 'AS2516 (KDDI Corp)', role: 'COMPROMISED_PROXY', pingMs: 198, status: 'LINKED' },
    { id: 'AMS', name: 'AMS-HOP-07', lat: 52.3676, lng: 4.9041, city: 'Amsterdam', country: 'Netherlands', asn: 'AS1103 (SURFnet)', role: 'RELAY', pingMs: 18, status: 'LINKED' },
    { id: 'TARGET', name: targetName.toUpperCase(), lat: 35.6892, lng: 51.3890, city: 'Tehran', country: 'Iran', asn: 'AS48159 (Telecommunication Company of Iran TIC)', role: 'TARGET', pingMs: 34, status: 'PROBING' }
  ];
}

// Procedural continuous log entries for the bottom scrolling stream
const STREAM_TEMPLATES = [
  { tag: 'NET', level: 'INFO', template: (t: string) => `BGP Route AS48159 prefix 91.240.64.0/22 accepted via Frankfurt DE-CIX peer -> TIC Tehran Core (Latency: ${(Math.random()*2+33).toFixed(1)}ms)` },
  { tag: 'CORE', level: 'INFO', template: (t: string) => {
    const bins = ['603799', '610433', '589210', '585983', '621986', '502229', '628023'];
    const b1 = bins[Math.floor(Math.random()*bins.length)];
    let b2 = bins[Math.floor(Math.random()*bins.length)];
    while (b2 === b1) b2 = bins[Math.floor(Math.random()*bins.length)];
    const c1 = `${b1}${Math.floor(1000000000+Math.random()*9000000000)}`;
    const c2 = `${b2}${Math.floor(1000000000+Math.random()*9000000000)}`;
    const amt = Math.floor(Math.random()*450000000+1000000);
    const stan = Math.floor(100000+Math.random()*900000);
    return `[SHETAB_TX] کارت ${c1.substring(0,4)}-${c1.substring(4,8)}-${c1.substring(8,12)}-${c1.substring(12,16)} -> ${c2.substring(0,4)}-${c2.substring(4,8)}-${c2.substring(8,12)}-${c2.substring(12,16)} | مبلغ: ${new Intl.NumberFormat('en-US').format(amt*10)} IRR (${new Intl.NumberFormat('fa-IR').format(amt)} تومان) | STAN:${stan} [موفق]`;
  }},
  { tag: 'SEPAM', level: 'INFO', template: (t: string) => `SEPAM MT103 wire intercepted: 261001IRR${Math.floor(Math.random()*50+10)},000,000,000,00 Sender: MARKIRTH Beneficiary: MELIIRTH [CRC32: 0x${generateHex(8)}]` },
  { tag: 'CORE', level: 'SUCCESS', template: (t: string) => {
    const shebas = ['IR010100000000000000000001', 'IR960170000010000000000001', 'IR8201200000009482104928', 'IR5401800000001847293810'];
    const s1 = shebas[Math.floor(Math.random()*shebas.length)];
    const amtToman = Math.floor(Math.random()*900000000+50000000);
    return `[SATNA_RTGS] حواله بین‌بانکی شبا: ${s1} | کارمزد: ۰ ریال | مبلغ: ${new Intl.NumberFormat('fa-IR').format(amtToman)} تومان | وضعیت: تسویه تایید شد`;
  }},
  { tag: 'HSM', level: 'WARN', template: (t: string) => `Thales payShield 10K PKCS#11 command intercepted: CS_TranslatePIN [LMK-Variant-01] session_key=0x${generateHex(16)} status=0x00000000_OK` },
  { tag: 'CORE', level: 'INFO', template: (t: string) => `Oracle RAC SGA buffer hit: SELECT acct_iban, bal_irr FROM banqx_core.acct_master WHERE bank_code='012' [PARALLEL_DEGREE=8]` },
  { tag: 'CORE', level: 'SUCCESS', template: (t: string) => `PL/SQL execution hooked: PKG_GL_CORE_POSTING.EXECUTE_TRANSFER(amt=>48920400000000, curr=>'IRR') status=COMMITTED` },
  { tag: 'AUTH', level: 'INFO', template: (t: string) => `H100 SXM5 Cluster: Dispatching 120,000 hash candidates [Hashcat -m 1800 PBKDF2-HMAC-SHA256 @ ${(Math.random()*5+46).toFixed(1)} GH/s]` },
  { tag: 'SESSION', level: 'INFO', template: (t: string) => `JWT claim validated by Keycloak broker: sub=SPECTER_OPERATOR_ROOT roles=['FIN_SYS_SUPERVISOR','SEPAM_RTGS_SUPERVISOR']` },
  { tag: 'FRAUD', level: 'CRIT', template: (t: string) => `SHETAB fraud engine anomaly #9443: Velocity threshold breached on ISO-8583 channel (Suppression shim returned FALSE_NORMAL)` },
  { tag: 'IR', level: 'WARN', template: (t: string) => `Target SOC ticketing API invoked: Alert ID IR-${new Date().getFullYear()}-CORE-${Math.floor(100+Math.random()*899)} [SEV-1 CBI CRITICAL ESCALATION]` },
  { tag: 'DISASM', level: 'HEX', template: (t: string) => `0x7fff5fbff890: 48 89 5c 24 08 48 83 ec 20 48 8b 05 12 34 00 00 [mov rax, QWORD PTR [rip+0x3412] # hsm_auth_override]` }
];

export function generateStreamLog(target: string): TerminalLog {
  const chosen = STREAM_TEMPLATES[Math.floor(Math.random() * STREAM_TEMPLATES.length)];
  return {
    id: 'stream_' + Math.random().toString(36).substr(2, 9),
    timestamp: getTimestamp(),
    tag: chosen.tag as SubsystemTag,
    level: chosen.level as any,
    text: chosen.template(target),
    hexOffset: `0x${generateHex(8)}`
  };
}

// Generate realistic raw hex dump snippet
export function generateHexDump(offsetHex: string): string {
  const bytes: string[] = [];
  const chars: string[] = [];
  for (let i = 0; i < 16; i++) {
    const val = Math.floor(Math.random() * 256);
    bytes.push(val.toString(16).padStart(2, '0'));
    chars.push(val >= 32 && val <= 126 ? String.fromCharCode(val) : '.');
  }
  return `${offsetHex}  ${bytes.slice(0, 8).join(' ')}  ${bytes.slice(8).join(' ')}  |${chars.join('')}|`;
}
