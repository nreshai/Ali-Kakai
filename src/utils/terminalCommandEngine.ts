import { TerminalLog } from '../types/specter';
import { getTimestamp, generateIncidentId } from './syntheticGenerators';
import { 
  generateBatchTransactionLogs, 
  generateRandomAccount, 
  generateRandomTransaction, 
  formatIranianMoney 
} from './iranBankingDataGenerator';

export interface CommandExecutionResult {
  logs: TerminalLog[];
  action?: 'SET_TARGET' | 'LAUNCH_ATTACK' | 'ABORT' | 'CLEAR' | 'NONE';
  target?: string;
}

export const KNOWN_COMMANDS = [
  'help',
  'set target',
  'targets',
  'target',
  'tx',
  'transactions',
  'cards',
  'accounts',
  'sheba',
  'scan',
  'nmap',
  'whois',
  'ping',
  'exploit',
  'attack',
  'run',
  'abort',
  'stop',
  'hashcat',
  'crack',
  'disasm',
  'dump',
  'hexdump',
  'iso8583',
  'sepam',
  'top',
  'ps',
  'uname -a',
  'uname',
  'ls',
  'cat',
  'clear',
  'history',
];

export const PRESET_TARGETS: { name: string; desc: string; ip: string; asn: string; bic: string }[] = [
  { name: 'IRBANK-CORE', desc: 'Core Banking Switch (Exadata Cluster)', ip: '91.240.64.50', asn: 'AS48159', bic: 'BKMTIRTH' },
  { name: 'CBI-MARKAZI', desc: 'Central Bank of Iran Gateway Node', ip: '185.143.232.10', asn: 'AS58224', bic: 'BMIRIRTH' },
  { name: 'MELLI-SWIFT', desc: 'Bank Melli International & Swift Rail', ip: '91.240.65.12', asn: 'AS197207', bic: 'MELIIRTH' },
  { name: 'SEPAM-RTGS', desc: 'Interbank Real-Time Gross Settlement', ip: '185.143.233.88', asn: 'AS48159', bic: 'SPAMIRTH' },
  { name: 'PASARGAD-FIN', desc: 'Bank Pasargad Core Ledger Node', ip: '194.225.184.22', asn: 'AS48159', bic: 'PASGIRTH' },
  { name: 'KESHAVARZI-HQ', desc: 'Agricultural Banking HSM Enclave', ip: '91.240.66.104', asn: 'AS48159', bic: 'BKAGIRTH' },
];

export function executeTerminalCommand(
  rawInput: string,
  currentTarget: string,
  history: string[]
): CommandExecutionResult {
  const trimmed = rawInput.trim();
  const lower = trimmed.toLowerCase();
  const parts = trimmed.split(/\s+/);
  const cmd = (parts[0] || '').toLowerCase();
  const arg1 = parts[1] || '';
  const arg2 = parts[2] || '';

  const timestamp = getTimestamp();
  const makeLog = (
    text: string, 
    level: TerminalLog['level'] = 'INFO', 
    tag: TerminalLog['tag'] = 'SYS', 
    hexOffset?: string
  ): TerminalLog => ({
    id: `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: getTimestamp(),
    tag,
    level,
    text,
    hexOffset
  });

  // 1. Empty command
  if (!trimmed) {
    return { logs: [], action: 'NONE' };
  }

  // 2. CLEAR
  if (lower === 'clear' || lower === 'cls') {
    return { logs: [], action: 'CLEAR' };
  }

  // 3. HELP
  if (lower === 'help' || lower === '?' || lower === '--help' || lower === '-h') {
    const helpText = `╔══════════════════════════════════════════════════════════════════════════════════╗
║               SPECTER OS v7.4 - TACTICAL COMMAND REFERENCE MATRIX               ║
╚══════════════════════════════════════════════════════════════════════════════════╝

  TARGET & ENGAGEMENT:
    set target <TARGET>   Arm operative target node (e.g. set target IRBANK-CORE)
    targets               Display all reachable financial core targets & ASNs
    target                Show currently armed target credentials & telemetry
    exploit | run         Launch offensive automated multi-vector infiltration
    abort | stop          Emergency halt of active cyber operations

  RECONNAISSANCE & MAPPING:
    scan [IP/HOST]        Run stealth TCP SYN port & service banner enumeration
    whois [TARGET/ASN]    BGP Route announcement, Autonomous System topology & TIC links
    ping [IP/HOST]        Send ICMP echo datagrams with precise RTT & jitter metrics
    traceroute            Trace 6-hop packet route through DE-CIX & TAE fiber arteries

  CRYPTANALYSIS & BINARY AUDITING:
    hashcat | crack       Run parallel GPU cryptanalysis on captured PBKDF2/SHA-512 hashes
    disasm [SYMBOL]       Disassemble binary instruction stream (x86_64 Intel ASM)
    dump | iso8583        Inspect canonical hexadecimal packet capture of banking wire
    sepam                 Audit SEPAM financial encryption keys & HSM cipher suites

  SYSTEM & ENCLAVE UTILITIES:
    uname -a              Display kernel signature, enclave architecture & build
    top | ps              Live process monitor and CPU/Memory allocation table
    ls [-la]              List directory assets in secure sandbox
    cat <FILE>            Read enclave configuration or capture files
    history               Show previous commands in interactive session
    clear                 Clear primary terminal output buffer

  TIP: Use [TAB] for command & target autocompletion, [▲] and [▼] for history navigation.`;

    return {
      logs: [makeLog(helpText, 'INFO', 'SYS', '0x00000000')],
      action: 'NONE'
    };
  }

  // 4. TARGETS
  if (lower === 'targets' || lower === 'target list') {
    const tableHeader = `[+] RECOGNIZED FINANCIAL & INFRASTRUCTURE TARGET NODES:\n\n` +
      `  TARGET ID       GATEWAY IP       ASN      BIC CODE   SECURITY ROLE\n` +
      `  ─────────────── ──────────────── ──────── ────────── ────────────────────────────────────\n` +
      PRESET_TARGETS.map(t => 
        `  ${t.name.padEnd(15)} ${t.ip.padEnd(16)} ${t.asn.padEnd(8)} ${t.bic.padEnd(10)} ${t.desc}`
      ).join('\n') +
      `\n\n[i] Command to engage: set target <TARGET ID> (or tap quick target button below)`;

    return {
      logs: [makeLog(tableHeader, 'SUCCESS', 'RECON', '0x00000010')],
      action: 'NONE'
    };
  }

  // 5. CURRENT TARGET
  if (lower === 'target') {
    const active = PRESET_TARGETS.find(t => t.name === currentTarget) || {
      name: currentTarget || 'UNSET',
      ip: '91.240.64.50',
      asn: 'AS48159',
      bic: 'BKMTIRTH',
      desc: 'Active Operational Target'
    };

    const targetInfo = `[+] ACTIVE TARGET TELEMETRY:
  Name:       ${active.name}
  Entity:     ${active.desc}
  Gateway:    ${active.ip} [Routing through TIC AS48159]
  Subnet:     91.240.64.0/22
  BIC/SWIFT:  ${active.bic}
  Status:     ARMED & READY FOR INJECTION
  Usage:      Type 'exploit' or tap '⚡ EXECUTE ATTACK' to begin sequence.`;

    return {
      logs: [makeLog(targetInfo, 'INFO', 'CORE', '0x00000020')],
      action: 'NONE'
    };
  }

  // 6. SET TARGET <NAME>
  if (lower.startsWith('set target') || lower.startsWith('target ')) {
    let targetParam = parts.length > 2 ? parts.slice(2).join(' ') : (parts[1] === 'target' ? '' : parts[1]);
    if (!targetParam) {
      targetParam = 'IRBANK-CORE';
    }
    const sanitized = targetParam.trim().toUpperCase();
    return {
      logs: [
        makeLog(`[*] DIRECTIVE ACCEPTED: Target node registered -> [${sanitized}].`, 'SYS', 'SYS'),
        makeLog(`[*] All tactical telemetry, world map locks, and cryptanalysis pipelines re-oriented.`, 'INFO', 'NET')
      ],
      action: 'SET_TARGET',
      target: sanitized
    };
  }

  // 7. EXPLOIT / ATTACK / RUN
  if (lower === 'exploit' || lower === 'attack' || lower === 'run' || lower === 'start') {
    const active = currentTarget || 'IRBANK-CORE';
    return {
      logs: [
        makeLog(`[!] INITIATING OFFENSIVE CYBER ENGAGEMENT SEQUENCE AGAINST [${active}]...`, 'CRIT', 'CORE')
      ],
      action: 'LAUNCH_ATTACK',
      target: active
    };
  }

  // 8. ABORT / STOP
  if (lower === 'abort' || lower === 'stop' || lower === 'kill') {
    return {
      logs: [
        makeLog(`[!] OPERATOR INTERRUPT: Sending SIGTERM to active cyber execution pipelines...`, 'WARN', 'INTERRUPT')
      ],
      action: 'ABORT'
    };
  }

  // 9. SCAN / NMAP
  if (cmd === 'scan' || cmd === 'nmap') {
    const targetHost = arg1 || (currentTarget ? `${currentTarget.toLowerCase()}.cbi.ir` : '91.240.64.50');
    const scanOutput = `Starting Nmap 7.94 ( https://nmap.org ) at ${timestamp} UTC
Nmap scan report for ${targetHost} (91.240.64.50)
Host is up (0.033s latency).
rDNS record for 91.240.64.50: core-gw01.sepam.cbi.ir
Not shown: 993 closed tcp ports (reset)

PORT      STATE SERVICE        VERSION
22/tcp    open  ssh            OpenSSH 9.3p1 Debian 12 (protocol 2.0)
80/tcp    open  http           nginx/1.24.0 (Reverse Proxy Load Balancer)
443/tcp   open  ssl/https      nginx/1.24.0 (TLSv1.3 ECDHE-RSA-AES256-GCM)
1521/tcp  open  oracle-tns     Oracle TNS Listener 19.3.0.0.0 (Production Core DB)
5432/tcp  open  postgresql     PostgreSQL DB 15.4 (Core Ledger Replication)
8443/tcp  open  ssl/sepam-gw   SEPAM Interbank Financial Gateway Protocol v4.2
8583/tcp  open  iso-financial  ISO-8583 BanQx Banking Switch Interconnect Daemon

Device type: security appliance | banking gateway
Running: Check Point Gaia OS R81.20 / Linux 3.10
OS CPE: cpe:/o:checkpoint:gaia:r81.20
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Nmap done: 1 IP address (1 host up) scanned in 1.48 seconds`;

    return {
      logs: [
        makeLog(`[*] Initiating SYN Stealth Scan (-sS -sV -Pn) on [${targetHost}]...`, 'SYS', 'RECON'),
        makeLog(scanOutput, 'SUCCESS', 'RECON', '0x000000a4')
      ],
      action: 'NONE'
    };
  }

  // 10. WHOIS / ASN
  if (cmd === 'whois' || cmd === 'asn') {
    const query = (arg1 || 'AS48159').toUpperCase();
    const whoisOutput = `aut-num:        AS48159
as-name:        TIC-AS
descr:          Telecommunication Infrastructure Company of Iran (TIC)
org:            ORG-TICO1-RIPE
remarks:        National BGP Backbone & Trans-Asia Europe (TAE) Fiber Landing
import:         from AS12389 accept ANY (Rostelecom Core, RU)
import:         from AS8075 accept ANY (DE-CIX Frankfurt, DE)
export:         to AS12389 announce AS-TIC
export:         to AS8075 announce AS-TIC
admin-c:        TIC-RIPE
tech-c:         TIC-RIPE
mnt-by:         RIPE-NCC-END-MNT
mnt-by:         TIC-MNT
source:         RIPE # Filtered

inetnum:        91.240.64.0 - 91.240.67.255
netname:        CBI-SEPAM-NET
descr:          Central Bank of Iran - Interbank Settlement & Core Banking Systems
country:        IR
status:         ASSIGNED PA
source:         RIPE`;

    return {
      logs: [
        makeLog(`[*] Querying RIPE NCC whois database for [${query}]...`, 'SYS', 'NET'),
        makeLog(whoisOutput, 'INFO', 'NET', '0x00000108')
      ],
      action: 'NONE'
    };
  }

  // 11. PING
  if (cmd === 'ping') {
    const host = arg1 || '91.240.64.50';
    const pingOutput = `PING ${host} (${host}) 56(84) bytes of data.
64 bytes from ${host}: icmp_seq=1 ttl=56 time=33.4 ms
64 bytes from ${host}: icmp_seq=2 ttl=56 time=33.8 ms
64 bytes from ${host}: icmp_seq=3 ttl=56 time=32.9 ms
64 bytes from ${host}: icmp_seq=4 ttl=56 time=33.1 ms

--- ${host} ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 32.912/33.310/33.841/0.342 ms`;

    return {
      logs: [
        makeLog(pingOutput, 'SUCCESS', 'NET', '0x00000040')
      ],
      action: 'NONE'
    };
  }

  // 12. DISASM / GHIDRA
  if (cmd === 'disasm' || cmd === 'ghidra' || cmd === 'objdump') {
    const funcName = arg1 || 'sepam_verify_mac';
    const asmOutput = `Dump of assembler code for function ${funcName}:
  Address            Bytes                  Instruction
  ────────────────── ────────────────────── ─────────────────────────────────
  0x7fff8a210000     f3 0f 1e fa            endbr64
  0x7fff8a210004     55                     push   %rbp
  0x7fff8a210005     48 89 e5               mov    %rsp,%rbp
  0x7fff8a210008     48 83 ec 80            sub    $0x80,%rsp
  0x7fff8a21000c     48 89 7d e8            mov    %rdi,-0x18(%rbp)
  0x7fff8a210010     66 0f 38 dc c1         aesenc %xmm1,%xmm0
  0x7fff8a210015     66 0f 38 df c2         aesenclast %xmm2,%xmm0
  0x7fff8a21001a     48 85 c0               test   %rax,%rax
  0x7fff8a21001d     74 29                  je     0x7fff8a210048 <bypass_check>
  0x7fff8a21001f     48 8b 45 e8            mov    -0x18(%rbp),%rax
  0x7fff8a210023     0f b6 00               movzbl (%rax),%eax
  0x7fff8a210026     3c 02                  cmp    $0x2,%al
  0x7fff8a210028     75 1e                  jne    0x7fff8a210048 <bypass_check>
  0x7fff8a21002a     c7 45 fc 01 00 00 00   movl   $0x1,-0x4(%rbp)
  0x7fff8a210031     eb 1d                  jmp    0x7fff8a210050 <exit_success>
End of assembler dump. [VULNERABILITY: MAC signature bypass branch at 0x7fff8a21001d]`;

    return {
      logs: [
        makeLog(`[*] Disassembling ELF64 binary image: /opt/banqx/lib/libsepam_crypto.so...`, 'SYS', 'DISASM'),
        makeLog(asmOutput, 'HEX', 'DISASM', '0x7fff8a210000')
      ],
      action: 'NONE'
    };
  }

  // 13. HASHCAT / CRACK
  if (cmd === 'hashcat' || cmd === 'crack') {
    const crackOutput = `hashcat (v6.2.6) starting in benchmark & attack mode...
[*] OpenCL Device #1: NVIDIA H100 SXM5 80GB (PCIe 0000:01:00.0)
[*] Hash.Mode........: 1800 (sha512crypt $6$ / PBKDF2-HMAC-SHA512)
[*] Hash.Target......: $6$ir_bank$8zK2qL9xM4p...
[*] Keyspace.........: 14,892,100,000 combinations
[*] Speed.#1.........: 14.8 GH/s [Temp: 62°C | Power: 615W]
[+] Recovered........: 3/3 (100.00%) Digests

CRACKED DIGEST RESULTS:
  1. $6$ir_bank$8zK2q...: "Shetab#Root@Admin2026!"  [UID: 0 (root)]
  2. $6$sepam_gw$Lk9xP...: "Swift#TunnelKey99!"       [UID: 104 (sepam-daemon)]
  3. $6$oracle$m4Xp8...:  "Or@cleDB#Exadata!Prod"    [UID: 1001 (oracle)]

All hashes cracked in 0.84 seconds. Session status: COMPLETED.`;

    return {
      logs: [
        makeLog(`[*] Initializing GPU HashLab cryptanalysis cluster (8x NVIDIA H100)...`, 'SYS', 'HASH'),
        makeLog(crackOutput, 'SUCCESS', 'HASH', '0x000003c0')
      ],
      action: 'NONE'
    };
  }

  // 14. DUMP / HEXDUMP / ISO8583 / SEPAM
  if (cmd === 'dump' || cmd === 'hexdump' || cmd === 'iso8583' || cmd === 'sepam') {
    const hexOutput = `Canonical Hex Dump of Captured ISO-8583 Wire Message [MTI: 0200 Financial Trans]:
00000000  30 32 30 30 f2 38 40 81  08 c0 80 00 00 00 00 00  |0200.8@.........|
00000010  04 00 00 00 00 00 00 00  16 60 37 99 81 22 40 19  |.........\`7..\"@.|
00000020  00 00 00 02 45 00 00 00  10 01 12 40 00 00 08 20  |....E......@... |
00000030  00 01 02 01 30 31 30 30  31 38 35 31 34 33 32 33  |....010018514323|
00000040  32 30 31 30 39 31 32 34  30 36 34 35 30 4d 45 4c  |2010912406450MEL|
00000050  49 49 52 54 48 30 30 30  30 30 30 30 30 30 30 30  |IIRTH00000000000|
00000060  31 35 38 30 30 30 30 30  30 30 30 49 52 52 00 00  |15800000000IRR..|

FIELD DECODING:
  MTI:       0200 (Financial Transaction Request)
  Field 002: Primary Account Number (PAN): 6037-9981-2240-1928 (Bank Melli)
  Field 004: Transaction Amount: 2,450,000,000 IRR (245,000,000 Toman)
  Field 007: Transmission Date & Time: ${timestamp}
  Field 011: Systems Trace Audit Number (STAN): 018514
  Field 032: Acquiring Institution ID: 504172 (Central Switch)
  Field 049: Currency Code: 364 (IRR)`;

    return {
      logs: [
        makeLog(`[*] Intercepting real-time wire frame on switch interface [sepam0]...`, 'SYS', 'SEPAM'),
        makeLog(hexOutput, 'HEX', 'SEPAM', '0x00000000')
      ],
      action: 'NONE'
    };
  }

  // 15. UNAME
  if (cmd === 'uname') {
    const isAll = arg1 === '-a' || lower === 'uname -a';
    return {
      logs: [
        makeLog(
          isAll 
            ? `Linux specter-enclave-01 6.2.0-SPECTER-SEC #1 SMP PREEMPT_DYNAMIC UTC 2026 x86_64 GNU/Linux`
            : `Linux`,
          'INFO',
          'SYS'
        )
      ],
      action: 'NONE'
    };
  }

  // 16. TOP / PS
  if (cmd === 'top' || cmd === 'ps') {
    const topOutput = `Tasks: 184 total,   2 running, 182 sleeping,   0 stopped,   0 zombie
%Cpu(s): 14.2 us,  3.8 sy,  0.0 ni, 81.6 id,  0.2 wa,  0.2 hi,  0.0 si
MiB Mem :  64380.2 total,  41290.4 free,  15280.1 used,   7809.7 buff/cache

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1042 specter   20   0 1842096 412080  89124 S  28.4   0.6   4:12.80 specter-engine
  891 root      20   0  982140 180240  44120 S  12.1   0.3   1:44.20 bpftool-inject
 2104 root      20   0 4820192 1289100 24108 S   8.9   2.0   0:58.33 h100-hashcat
 3410 sepam     20   0  421096  88420  18204 S   2.4   0.1   0:12.10 sepam-proxy
    1 root      20   0  168240  12480   8920 S   0.0   0.0   0:02.14 systemd`;

    return {
      logs: [
        makeLog(topOutput, 'INFO', 'SYS', '0x00000008')
      ],
      action: 'NONE'
    };
  }

  // 17. LS
  if (cmd === 'ls') {
    const lsOutput = `drwxr-xr-x  6 specter specter  4096 Oct  1 12:00 .
drwxr-xr-x 18 root    root     4096 Oct  1 11:20 ..
-rwxr-xr-x  1 specter specter  9812 Oct  1 11:45 alikakai*
-rw-r--r--  1 specter specter  2140 Oct  1 11:50 package.json
-rw-r--r--  1 specter specter 81559 Oct  1 11:51 package-lock.json
drwxr-xr-x  4 specter specter  4096 Oct  1 11:30 src/
drwxr-xr-x 58 specter specter  4096 Oct  1 11:52 node_modules/
-rw-r--r--  1 specter specter  1024 Oct  1 12:10 targets_iran_banking.json
-rw-r--r--  1 specter specter 48920 Oct  1 12:20 captured_sepam_traffic.pcap`;

    return {
      logs: [
        makeLog(lsOutput, 'INFO', 'SYS')
      ],
      action: 'NONE'
    };
  }

  // 18. CAT
  if (cmd === 'cat') {
    const file = arg1 || '';
    if (!file) {
      return {
        logs: [makeLog(`cat: missing file operand. Example: cat targets_iran_banking.json`, 'WARN', 'SYS')],
        action: 'NONE'
      };
    }

    if (file.includes('target')) {
      const jsonContent = JSON.stringify({
        enclave: 'SPECTER_OMEGA',
        targetCount: PRESET_TARGETS.length,
        targets: PRESET_TARGETS
      }, null, 2);
      return {
        logs: [makeLog(jsonContent, 'INFO', 'SYS')],
        action: 'NONE'
      };
    }

    if (file.includes('pcap') || file.includes('traffic')) {
      return {
        logs: [
          makeLog(`[PCAP STREAM DUMP]: 48,920 bytes captured. TCP stream contains 14 ISO-8583 banking envelopes.`, 'INFO', 'SEPAM')
        ],
        action: 'NONE'
      };
    }

    return {
      logs: [makeLog(`cat: ${file}: file loaded. Secure payload checksum verified.`, 'INFO', 'SYS')],
      action: 'NONE'
    };
  }

  // 19. HISTORY
  if (cmd === 'history') {
    const histLines = history.slice(-20).map((h, i) => `  ${(i + 1).toString().padStart(3, ' ')}  ${h}`).join('\n');
    return {
      logs: [
        makeLog(`COMMAND SESSION HISTORY:\n${histLines || '  (No previous commands recorded)'}`, 'INFO', 'SYS')
      ],
      action: 'NONE'
    };
  }

  // 20. LIVE TRANSACTIONS INTERCEPT (tx / transactions)
  if (cmd === 'tx' || cmd === 'transactions') {
    const count = parseInt(arg1, 10) || 6;
    const boundedCount = Math.min(Math.max(count, 1), 16);
    const txLogs = generateBatchTransactionLogs(boundedCount);
    return {
      logs: [
        makeLog(`[+] شنود مستقیم خطوط سوئیچ شتاب/سپام (دریافت ${boundedCount} تراکنش همگام با تاریخ و زمان زنده):`, 'SUCCESS', 'SEPAM'),
        ...txLogs
      ],
      action: 'NONE'
    };
  }

  // 21. CARDS / ACCOUNTS / SHEBA
  if (cmd === 'cards' || cmd === 'accounts' || cmd === 'sheba') {
    const count = parseInt(arg1, 10) || 5;
    const bounded = Math.min(Math.max(count, 1), 10);
    const accounts = Array.from({ length: bounded }, () => generateRandomAccount());
    
    const accountLines = accounts.map((acc, idx) => {
      const money = formatIranianMoney(acc.balanceIrr);
      return `[حساب #${idx + 1}] ${acc.bankName}
  دارنده: ${acc.holder}
  شماره کارت: ${acc.pan.substring(0, 4)}-${acc.pan.substring(4, 8)}-${acc.pan.substring(8, 12)}-${acc.pan.substring(12, 16)} (CVV2: ${acc.cvv2} | انقضا: ${acc.expiry})
  شماره شبا (IBAN): ${acc.iban}
  شماره حساب: ${acc.accountNumber}
  موجودی تسویه‌نشده: ${money.irrStr} [${money.tomanStr}]`;
    }).join('\n\n');

    return {
      logs: [
        makeLog(`[+] استخراج آنی رکوردهای پایگاه داده مشتریان و کارت‌های بانکی (${bounded} حساب کشف شد):`, 'SUCCESS', 'CORE'),
        makeLog(accountLines, 'HEX', 'CORE', '0x00004100')
      ],
      action: 'NONE'
    };
  }

  // 20. Unknown command fallback with smart fuzzy matching
  const suggestions = KNOWN_COMMANDS.filter(k => k.startsWith(lower.slice(0, 3)));
  const suggestionText = suggestions.length > 0 
    ? `\nDid you mean: ${suggestions.map(s => `'${s}'`).join(', ')}?` 
    : '';

  return {
    logs: [
      makeLog(
        `specter: command not found: '${trimmed}'. Type 'help' for tactical instruction manual.${suggestionText}`,
        'WARN',
        'SYS'
      )
    ],
    action: 'NONE'
  };
}
