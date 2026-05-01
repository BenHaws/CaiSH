import { XMLParser } from 'fast-xml-parser';
import { type JournalEntry, type PaymentItem } from '../../src/shared/types/index.ts';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

export interface ISO20022TransformationResult {
  payments: Partial<PaymentItem>[];
  journalEntries: Partial<JournalEntry>[];
  rawParsed: any;
}

/**
 * ISO 20022 Transformation Engine
 * Specifically targets pacs.008 (Customer Credit Transfer) and camt.053 (Bank Statement)
 */
export const transformMXToNexus = (xmlString: string): ISO20022TransformationResult => {
  const jsonObj = parser.parse(xmlString);
  
  // Detect message type
  const root = jsonObj.Doc || jsonObj.Document;
  if (!root) throw new Error('Invalid ISO 20022 document: Missing root');

  const payments: Partial<PaymentItem>[] = [];
  const journalEntries: Partial<JournalEntry>[] = [];

  // pacs.008.001.xx - Customer Credit Transfer
  if (root.FIToFICstmrCdtTrf) {
    const trxData = root.FIToFICstmrCdtTrf.CdtTrfTxInf;
    const transactions = Array.isArray(trxData) ? trxData : [trxData];

    transactions.forEach((tx: any) => {
      const amount = parseFloat(tx.IntrBkSttlmAmt['#text'] || tx.IntrBkSttlmAmt);
      const currency = tx.IntrBkSttlmAmt['@_Ccy'] || 'USD';
      
      payments.push({
        id: tx.PmtId.EndToEndId || tx.PmtId.InstrId,
        beneficiary: tx.Cdtr?.Nm || 'Unknown Beneficiary',
        amount: amount,
        currency: currency,
        status: 'pending',
        type: 'vendor',
        createdAt: new Date().toISOString()
      });

      journalEntries.push({
        id: `JE-${tx.PmtId.EndToEndId || tx.PmtId.InstrId}`,
        date: new Date().toISOString(),
        description: tx.RmtInf?.Ustrd || `ISO20022 Transfer from ${tx.Dbtr?.Nm || 'Unknown'}`,
        account: '1001-OPS',
        debit: null,
        credit: amount,
        currency: currency,
        type: 'liquidity',
        referenceNode: 'ISO-INGEST-RELAY'
      });
    });
  }

  // camt.053.001.xx - Bank to Customer Statement
  if (root.BkToCstmrStmt) {
    const statements = Array.isArray(root.BkToCstmrStmt.Stmt) ? root.BkToCstmrStmt.Stmt : [root.BkToCstmrStmt.Stmt];
    
    statements.forEach((stmt: any) => {
      const entries = Array.isArray(stmt.Ntry) ? stmt.Ntry : [stmt.Ntry];
      entries.forEach((entry: any) => {
        const amount = parseFloat(entry.Amt['#text'] || entry.Amt);
        const currency = entry.Amt['@_Ccy'] || 'USD';
        const isCredit = entry.CdtDbtInd === 'CRDT';

        journalEntries.push({
          id: entry.NtryRef || `JE-${Math.random().toString(36).substr(2, 9)}`,
          date: entry.BookgDt?.Dt || entry.ValDt?.Dt || new Date().toISOString(),
          description: entry.AddtlNtryInf || 'Electronic Statement Ingest',
          account: '2001-OPS',
          debit: isCredit ? amount : null,
          credit: !isCredit ? amount : null,
          currency: currency,
          type: 'adjustment',
          referenceNode: 'BANK-RELAY-STATEMENT'
        });
      });
    });
  }

  return {
    payments,
    journalEntries,
    rawParsed: jsonObj
  };
};
