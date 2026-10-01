import { TerminalLog } from '../types/specter';
import { getTimestamp } from './syntheticGenerators';

export interface BankingCardRecord {
  pan: string;
  bankName: string;
  iban: string;
  accountNumber: string;
  holder: string;
  cvv2: string;
  expiry: string;
  balanceIrr: number;
}

export interface LiveTransactionRecord {
  txId: string;
  timestamp: string;
  mti: '0100' | '0200' | '0400' | '0800';
  panMasked: string;
  panFull: string;
  sourceBank: string;
  destBank: string;
  destPan: string;
  amountIrr: number;
  amountToman: number;
  stan: string;
  rrn: string;
  status: 'APPROVED' | 'SETTLED' | 'CLEARED' | 'SUSPECT' | 'FLAGGED';
  channel: 'SEPAM' | 'SHETAB' | 'SATNA' | 'PAYA' | 'ATM' | 'POS' | 'INTERNET';
}

const IRAN_BANKS = [
  { name: 'بانک ملی ایران (Melli)', bin: '603799', bic: 'MELIIRTH', prefix: '017' },
  { name: 'بانک صادرات ایران (Saderat)', bin: '603769', bic: 'BSIIRTH', prefix: '019' },
  { name: 'بانک ملت (Mellat)', bin: '610433', bic: 'BKMTIRTH', prefix: '012' },
  { name: 'بانک تجارت (Tejarat)', bin: '585983', bic: 'TEJAIRTH', prefix: '018' },
  { name: 'بانک سپه (Sepah)', bin: '589210', bic: 'SEPAIRTH', prefix: '015' },
  { name: 'بانک پاسارگاد (Pasargad)', bin: '502229', bic: 'PASGIRTH', prefix: '057' },
  { name: 'بانک سامان (Saman)', bin: '621986', bic: 'SAMNIRTH', prefix: '056' },
  { name: 'بانک کشاورزی (Keshavarzi)', bin: '603770', bic: 'BKAGIRTH', prefix: '016' },
  { name: 'بانک مسکن (Maskan)', bin: '628023', bic: 'MSKNIRTH', prefix: '014' },
  { name: 'بانک پارسیان (Parsian)', bin: '622106', bic: 'PARSIRTH', prefix: '054' },
  { name: 'بانک آینده (Ayandeh)', bin: '636214', bic: 'AYANIRTH', prefix: '062' },
  { name: 'بانک شهر (Shahr)', bin: '504706', bic: 'CIIRIRTH', prefix: '061' },
];

const IRANIAN_NAMES = [
  'محمد علیزاده',
  'سید علیرضا حسینی',
  'امیرحسین رضایی',
  'محمدرضا کریمی',
  'مهدی اکبری',
  'فرهاد صادقی',
  'رضا ابراهیمی',
  'کامران مرادی',
  'امید جعفری',
  'داوود احمدی',
  'فرزاد ناصری',
  'نیما کاظمی',
  'کیانوش محمودی',
  'بهرام شفیعی',
  'پرویز دهقان',
  'حامد سلیمانی',
  'علیرضا نیکنام',
  'حمید فراهانی',
  'مهرداد باقری',
  'پیمان رستمی'
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

// Generate realistic Iranian Card Number (PAN)
export function generateIranianCard(bankBin?: string): string {
  const bin = bankBin || getRandomItem(IRAN_BANKS).bin;
  let part2 = String(randInt(1000, 9999));
  let part3 = String(randInt(1000, 9999));
  let part4 = String(randInt(1000, 9999));
  return `${bin}${part2}${part3}${part4}`;
}

// Generate realistic Iranian IBAN (Sheba)
export function generateSheba(bankPrefix?: string): string {
  const p = bankPrefix || getRandomItem(IRAN_BANKS).prefix;
  const num = String(randInt(1000000000000000, 9999999999999999));
  const check = String(randInt(10, 99));
  return `IR${check}${p}000000${num}`;
}

// Generate a random Iranian Banking Account
export function generateRandomAccount(): BankingCardRecord {
  const bank = getRandomItem(IRAN_BANKS);
  const pan = generateIranianCard(bank.bin);
  const iban = generateSheba(bank.prefix);
  const holder = getRandomItem(IRANIAN_NAMES);
  const accountNumber = String(randInt(100000000, 999999999));
  const cvv2 = String(randInt(100, 9999));
  const expiryYear = randInt(1404, 1409);
  const expiryMonth = String(randInt(1, 12)).padStart(2, '0');
  const balanceIrr = randInt(50000000, 9850000000000); // 50M to 9.85T IRR

  return {
    pan,
    bankName: bank.name,
    iban,
    accountNumber,
    holder,
    cvv2,
    expiry: `${expiryMonth}/${expiryYear}`,
    balanceIrr
  };
}

// Generate realistic simulated live transactions
export function generateRandomTransaction(): LiveTransactionRecord {
  const srcBank = getRandomItem(IRAN_BANKS);
  let dstBank = getRandomItem(IRAN_BANKS);
  while (dstBank.bin === srcBank.bin) {
    dstBank = getRandomItem(IRAN_BANKS);
  }

  const panFull = generateIranianCard(srcBank.bin);
  const panMasked = `${panFull.substring(0, 6)}******${panFull.substring(12, 16)}`;
  const destPan = generateIranianCard(dstBank.bin);

  // Amounts in IRR between 1,000,000 IRR to 50,000,000,000 IRR
  const amountIrr = Math.floor((Math.random() * 50000000 + 100000) * 10000);
  const amountToman = Math.floor(amountIrr / 10);

  const channels: LiveTransactionRecord['channel'][] = ['SEPAM', 'SHETAB', 'SATNA', 'PAYA', 'POS', 'INTERNET'];
  const channel = getRandomItem(channels);
  const mtis: LiveTransactionRecord['mti'][] = ['0200', '0200', '0200', '0100', '0400'];
  const mti = getRandomItem(mtis);

  const stan = String(randInt(100000, 999999));
  const rrn = String(randInt(100000000000, 999999999999));
  const statusPool: LiveTransactionRecord['status'][] = ['APPROVED', 'SETTLED', 'CLEARED', 'SUSPECT', 'FLAGGED'];
  const status = Math.random() > 0.15 ? 'APPROVED' : getRandomItem(statusPool);

  return {
    txId: `TX_${Date.now()}_${randInt(100, 999)}`,
    timestamp: getTimestamp(),
    mti,
    panMasked,
    panFull,
    sourceBank: srcBank.name,
    destBank: dstBank.name,
    destPan,
    amountIrr,
    amountToman,
    stan,
    rrn,
    status,
    channel
  };
}

// Format currency for realistic display
export function formatIranianMoney(irr: number): { irrStr: string; tomanStr: string } {
  const irrStr = new Intl.NumberFormat('en-US').format(irr) + ' IRR';
  const tomanStr = new Intl.NumberFormat('fa-IR').format(Math.floor(irr / 10)) + ' تومان';
  return { irrStr, tomanStr };
}

// Generate batch of realistic transaction logs for terminal display
export function generateBatchTransactionLogs(count: number = 8): TerminalLog[] {
  const logs: TerminalLog[] = [];
  const baseTime = Date.now();

  for (let i = 0; i < count; i++) {
    const tx = generateRandomTransaction();
    const money = formatIranianMoney(tx.amountIrr);
    const d = new Date(baseTime - (count - i) * 850);
    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}`;
    const hexOffset = `0x${(0x10000 + i * 0x30).toString(16)}`;

    let level: TerminalLog['level'] = 'INFO';
    if (tx.status === 'SUSPECT' || tx.status === 'FLAGGED') {
      level = 'WARN';
    } else if (tx.amountIrr > 10000000000) {
      level = 'SUCCESS';
    }

    const logText = `[${tx.channel}] MTI:${tx.mti} | STAN:${tx.stan} | RRN:${tx.rrn} | TIME:${timeStr}
  -> کارت مبدا: ${tx.panFull.substring(0, 4)}-${tx.panFull.substring(4, 8)}-${tx.panFull.substring(8, 12)}-${tx.panFull.substring(12, 16)} (${tx.sourceBank})
  -> کارت مقصد: ${tx.destPan.substring(0, 4)}-${tx.destPan.substring(4, 8)}-${tx.destPan.substring(8, 12)}-${tx.destPan.substring(12, 16)} (${tx.destBank})
  -> مبلغ تراکنش: ${money.irrStr} [معادل: ${money.tomanStr}]
  -> وضعیت تسویه: [${tx.status}] | شتاب/سپام Core Status: COMMITTED_00`;

    logs.push({
      id: `tx_log_${baseTime}_${i}`,
      timestamp: timeStr,
      tag: tx.channel === 'SEPAM' || tx.channel === 'SATNA' ? 'SEPAM' : 'CORE',
      level,
      text: logText,
      hexOffset
    });
  }

  return logs;
}
