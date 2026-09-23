import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WalletRequest {
  address: string;
  network: "ethereum" | "base" | "arbitrum" | "solana";
}

interface TxRecord {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  contractAddress?: string;
  functionName?: string;
}

interface TokenRecord {
  contractAddress: string;
  name: string;
  symbol: string;
  balance: string;
  decimals: string;
}

interface WalletData {
  address: string;
  network: string;
  txCount: number;
  tokenCount: number;
  transactions: TxRecord[];
  tokens: TokenRecord[];
  contractInteractions: { address: string; count: number }[];
  firstSeen?: string;
  lastActive?: string;
}

const ETH_CHAINS: Record<
  string,
  { apiBase: string; apiKeyEnv: string; label: string }
> = {
  ethereum: {
    apiBase: "https://api.etherscan.io/api",
    apiKeyEnv: "ETHERSCAN_API_KEY",
    label: "Ethereum",
  },
  base: {
    apiBase: "https://api.basescan.org/api",
    apiKeyEnv: "ETHERSCAN_API_KEY",
    label: "Base",
  },
  arbitrum: {
    apiBase: "https://api.arbiscan.io/api",
    apiKeyEnv: "ETHERSCAN_API_KEY",
    label: "Arbitrum",
  },
};

async function fetchEtherscanData(
  address: string,
  network: "ethereum" | "base" | "arbitrum"
): Promise<WalletData> {
  const chain = ETH_CHAINS[network];
  const apiKey = Deno.env.get(chain.apiKeyEnv);

  const params = new URLSearchParams({
    module: "account",
    action: "txlist",
    address,
    startblock: "0",
    endblock: "99999999",
    sort: "desc",
    page: "1",
    offset: "100",
  });
  if (apiKey) params.set("apikey", apiKey);

  const txRes = await fetch(`${chain.apiBase}?${params.toString()}`);
  if (!txRes.ok) throw new Error(`${chain.label} API returned ${txRes.status}`);
  const txBody = await txRes.json();
  if (txBody.status === "0" && txBody.message === "No transactions found") {
    return {
      address,
      network,
      txCount: 0,
      tokenCount: 0,
      transactions: [],
      tokens: [],
      contractInteractions: [],
    };
  }
  if (txBody.status === "0") {
    throw new Error(txBody.result || `${chain.label} API error`);
  }

  const transactions: TxRecord[] = txBody.result || [];

  const tokenParams = new URLSearchParams({
    module: "account",
    action: "tokentx",
    address,
    startblock: "0",
    endblock: "99999999",
    sort: "desc",
    page: "1",
    offset: "100",
  });
  if (apiKey) tokenParams.set("apikey", apiKey);

  const tokenRes = await fetch(`${chain.apiBase}?${tokenParams.toString()}`);
  let tokens: TokenRecord[] = [];
  if (tokenRes.ok) {
    const tokenBody = await tokenRes.json();
    if (tokenBody.status === "1") {
      const seen = new Set<string>();
      for (const t of tokenBody.result || []) {
        if (seen.has(t.contractAddress)) continue;
        seen.add(t.contractAddress);
        tokens.push({
          contractAddress: t.contractAddress,
          name: t.tokenName || "Unknown",
          symbol: t.tokenSymbol || "???",
          balance: t.value,
          decimals: t.tokenDecimal || "18",
        });
      }
    }
  }

  const contractMap = new Map<string, number>();
  for (const tx of transactions) {
    const counterparty =
      tx.from.toLowerCase() === address.toLowerCase() ? tx.to : tx.from;
    if (!counterparty) continue;
    contractMap.set(
      counterparty,
      (contractMap.get(counterparty) || 0) + 1
    );
  }
  const contractInteractions = Array.from(contractMap.entries())
    .map(([addr, count]) => ({ address: addr, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const sorted = [...transactions].sort(
    (a, b) => Number(b.timeStamp) - Number(a.timeStamp)
  );

  return {
    address,
    network,
    txCount: transactions.length,
    tokenCount: tokens.length,
    transactions: sorted.slice(0, 20),
    tokens: tokens.slice(0, 20),
    contractInteractions,
    firstSeen:
      sorted.length > 0
        ? new Date(
            Number(sorted[sorted.length - 1].timeStamp) * 1000
          ).toISOString()
        : undefined,
    lastActive:
      sorted.length > 0
        ? new Date(Number(sorted[0].timeStamp) * 1000).toISOString()
        : undefined,
  };
}

async function fetchSolanaData(address: string): Promise<WalletData> {
  const apiKey = Deno.env.get("SOLSCAN_API_KEY");

  const headers: Record<string, string> = {};
  if (apiKey) headers["token"] = apiKey;

  const txRes = await fetch(
    `https://pro-api.solscan.io/v2.0/account/detail?address=${encodeURIComponent(address)}`,
    { headers }
  );
  if (!txRes.ok) throw new Error(`Solscan API returned ${txRes.status}`);
  const accountBody = await txRes.json();
  if (!accountBody || accountBody.errorCode) {
    throw new Error(
      accountBody?.message || "Solscan returned no data for this address"
    );
  }

  const txCount = accountBody.data?.transaction_count ?? 0;
  const tokenCount = accountBody.data?.token_account_count ?? 0;

  const txListRes = await fetch(
    `https://pro-api.solscan.io/v2.0/account/transaction?address=${encodeURIComponent(address)}&page=1&page_size=20`,
    { headers }
  );
  let transactions: TxRecord[] = [];
  if (txListRes.ok) {
    const txListBody = await txListRes.json();
    const txList = txListBody.data || [];
    transactions = txList.map((t: Record<string, unknown>) => ({
      hash: (t.signature as string) || (t.tx_hash as string) || "",
      from: (t.signer as string) || (t.from as string) || "",
      to: (t.destination as string) || (t.to as string) || "",
      value: String(t.lamport ?? t.amount ?? 0),
      timeStamp: (t.block_time as string) || "",
      contractAddress: (t.program_id as string) || undefined,
      functionName: (t.tx_type as string) || undefined,
    }));
  }

  const tokenListRes = await fetch(
    `https://pro-api.solscan.io/v2.0/account/token?address=${encodeURIComponent(address)}&page=1&page_size=20`,
    { headers }
  );
  let tokens: TokenRecord[] = [];
  if (tokenListRes.ok) {
    const tokenListBody = await tokenListRes.json();
    const tokenList = tokenListBody.data || [];
    tokens = tokenList.map((t: Record<string, unknown>) => ({
      contractAddress: (t.token_address as string) || "",
      name: (t.name as string) || "Unknown",
      symbol: (t.symbol as string) || "???",
      balance: String(t.amount ?? 0),
      decimals: String(t.decimals ?? 9),
    }));
  }

  const contractMap = new Map<string, number>();
  for (const tx of transactions) {
    const counterparty =
      tx.from === address ? tx.to : tx.from;
    if (!counterparty) continue;
    contractMap.set(
      counterparty,
      (contractMap.get(counterparty) || 0) + 1
    );
  }
  const contractInteractions = Array.from(contractMap.entries())
    .map(([addr, count]) => ({ address: addr, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return {
    address,
    network: "solana",
    txCount,
    tokenCount,
    transactions,
    tokens,
    contractInteractions,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { address, network } = (await req.json()) as WalletRequest;

    if (!address || !network) {
      return new Response(
        JSON.stringify({ error: "Address and network are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let data: WalletData;
    if (network === "solana") {
      data = await fetchSolanaData(address);
    } else {
      data = await fetchEtherscanData(address, network);
    }

    if (data.txCount === 0 && data.tokens.length === 0) {
      return new Response(
        JSON.stringify({
          data,
          warning: "No on-chain activity found for this address.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown server error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
