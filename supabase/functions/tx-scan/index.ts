const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TxRequest {
  txHash: string;
  network: "ethereum" | "base" | "arbitrum" | "solana";
}

interface InternalTx {
  from: string;
  to: string;
  value: string;
  type: string;
  input?: string;
}

interface TxData {
  hash: string;
  network: string;
  blockNumber: number;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  isSuccess: boolean;
  contractAddress: string | null;
  functionName: string | null;
  input: string;
  tokenTransfers: {
    from: string;
    to: string;
    value: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDecimal: string;
    contractAddress: string;
  }[];
  internalTxs: InternalTx[];
  receiptStatus: string | null;
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

async function fetchEtherscanTx(
  txHash: string,
  network: "ethereum" | "base" | "arbitrum"
): Promise<TxData> {
  const chain = ETH_CHAINS[network];
  const apiKey = Deno.env.get(chain.apiKeyEnv);

  const params = new URLSearchParams({
    module: "proxy",
    action: "eth_getTransactionByHash",
    txhash: txHash,
  });
  if (apiKey) params.set("apikey", apiKey);

  const txRes = await fetch(`${chain.apiBase}?${params.toString()}`);
  if (!txRes.ok) throw new Error(`${chain.label} API returned ${txRes.status}`);
  const txBody = await txRes.json();
  if (!txBody.result) {
    throw new Error(
      `Transaction not found on ${chain.label}. The hash may be invalid or the transaction may not exist on this network.`
    );
  }

  const tx = txBody.result;

  const receiptParams = new URLSearchParams({
    module: "proxy",
    action: "eth_getTransactionReceipt",
    txhash: txHash,
  });
  if (apiKey) receiptParams.set("apikey", apiKey);

  const receiptRes = await fetch(
    `${chain.apiBase}?${receiptParams.toString()}`
  );
  let receiptStatus: string | null = null;
  let gasUsed = "0";
  if (receiptRes.ok) {
    const receiptBody = await receiptRes.json();
    if (receiptBody.result) {
      receiptStatus = receiptBody.result.status ?? null;
      gasUsed = parseInt(receiptBody.result.gasUsed ?? "0", 16).toString();
    }
  }

  const blockNum = parseInt(tx.blockNumber ?? "0x0", 16);

  const blockParams = new URLSearchParams({
    module: "proxy",
    action: "eth_getBlockByNumber",
    tag: tx.blockNumber ?? "0x0",
    boolean: "false",
  });
  if (apiKey) blockParams.set("apikey", apiKey);

  let timeStamp = "";
  const blockRes = await fetch(`${chain.apiBase}?${blockParams.toString()}`);
  if (blockRes.ok) {
    const blockBody = await blockRes.json();
    if (blockBody.result?.timestamp) {
      timeStamp = parseInt(blockBody.result.timestamp, 16).toString();
    }
  }

  const tokenParams = new URLSearchParams({
    module: "account",
    action: "tokentx",
    txhash: txHash,
    startblock: "0",
    endblock: "99999999",
    sort: "asc",
  });
  if (apiKey) tokenParams.set("apikey", apiKey);

  let tokenTransfers: TxData["tokenTransfers"] = [];
  const tokenRes = await fetch(`${chain.apiBase}?${tokenParams.toString()}`);
  if (tokenRes.ok) {
    const tokenBody = await tokenRes.json();
    if (tokenBody.status === "1" && Array.isArray(tokenBody.result)) {
      tokenTransfers = tokenBody.result.map((t: Record<string, unknown>) => ({
        from: (t.from as string) || "",
        to: (t.to as string) || "",
        value: (t.value as string) || "0",
        tokenName: (t.tokenName as string) || "Unknown",
        tokenSymbol: (t.tokenSymbol as string) || "???",
        tokenDecimal: (t.tokenDecimal as string) || "18",
        contractAddress: (t.contractAddress as string) || "",
      }));
    }
  }

  const internalParams = new URLSearchParams({
    module: "account",
    action: "txlistinternal",
    txhash: txHash,
    startblock: "0",
    endblock: "99999999",
    sort: "asc",
  });
  if (apiKey) internalParams.set("apikey", apiKey);

  let internalTxs: InternalTx[] = [];
  const internalRes = await fetch(
    `${chain.apiBase}?${internalParams.toString()}`
  );
  if (internalRes.ok) {
    const internalBody = await internalRes.json();
    if (internalBody.status === "1" && Array.isArray(internalBody.result)) {
      internalTxs = internalBody.result.map((t: Record<string, unknown>) => ({
        from: (t.from as string) || "",
        to: (t.to as string) || "",
        value: (t.value as string) || "0",
        type: (t.type as string) || "call",
        input: (t.input as string) || undefined,
      }));
    }
  }

  const gasPrice = parseInt(tx.gasPrice ?? "0x0", 16).toString();
  const gas = parseInt(tx.gas ?? "0x0", 16).toString();

  let functionName: string | null = null;
  const inputHex = (tx.input ?? "0x").slice(2);
  if (inputHex.length >= 8) {
    const sig = inputHex.slice(0, 8);
    functionName = `0x${sig}`;
  }

  return {
    hash: txHash,
    network,
    blockNumber: blockNum,
    timeStamp,
    from: tx.from ?? "",
    to: tx.to ?? "",
    value: parseInt(tx.value ?? "0x0", 16).toString(),
    gas,
    gasPrice,
    gasUsed,
    isSuccess: receiptStatus === "0x1",
    contractAddress: tx.to === null ? txHash : null,
    functionName,
    input: tx.input ?? "0x",
    tokenTransfers,
    internalTxs,
    receiptStatus,
  };
}

async function fetchSolanaTx(txHash: string): Promise<TxData> {
  const apiKey = Deno.env.get("SOLSCAN_API_KEY");
  const headers: Record<string, string> = {};
  if (apiKey) headers["token"] = apiKey;

  const res = await fetch(
    `https://pro-api.solscan.io/v2.0/transaction/detail?tx=${encodeURIComponent(txHash)}`,
    { headers }
  );
  if (!res.ok) throw new Error(`Solscan API returned ${res.status}`);
  const body = await res.json();
  if (!body || body.errorCode || !body.data) {
    throw new Error(
      body?.message ||
        "Transaction not found on Solana. The hash may be invalid or the transaction may not exist."
    );
  }

  const d = body.data;
  const tokenTransfers: TxData["tokenTransfers"] = (d.token_transfers || []).map(
    (t: Record<string, unknown>) => ({
      from: (t.from_owner as string) || (t.from as string) || "",
      to: (t.to_owner as string) || (t.to as string) || "",
      value: String(t.amount ?? 0),
      tokenName: (t.name as string) || "Unknown",
      tokenSymbol: (t.symbol as string) || "???",
      tokenDecimal: String(t.decimals ?? 9),
      contractAddress: (t.token_address as string) || "",
    })
  );

  const internalTxs: InternalTx[] = (d.inner_instructions || []).map(
    (t: Record<string, unknown>) => ({
      from: (t.program_id as string) || "",
      to: (t.accounts as string) || "",
      value: "0",
      type: (t.instruction_type as string) || "instruction",
      input: (t.data as string) || undefined,
    })
  );

  return {
    hash: txHash,
    network: "solana",
    blockNumber: d.slot ?? 0,
    timeStamp: d.block_time?.toString() ?? "",
    from: d.signer?.[0] ?? "",
    to: d.fee_payer ?? d.signer?.[0] ?? "",
    value: String(d.lamport ?? 0),
    gas: String(d.fee ?? 0),
    gasPrice: "0",
    gasUsed: String(d.fee ?? 0),
    isSuccess: (d.status ?? "") === "success" || d.confirmed === true,
    contractAddress: d.program_id ?? null,
    functionName: d.tx_type ?? null,
    input: "",
    tokenTransfers,
    internalTxs,
    receiptStatus: d.status ?? null,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { txHash, network } = (await req.json()) as TxRequest;

    if (!txHash || !network) {
      return new Response(
        JSON.stringify({ error: "Transaction hash and network are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let data: TxData;
    if (network === "solana") {
      data = await fetchSolanaTx(txHash);
    } else {
      data = await fetchEtherscanTx(txHash, network);
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
