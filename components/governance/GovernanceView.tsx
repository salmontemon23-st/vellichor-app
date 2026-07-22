"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits } from "viem";
import { useWalletModal } from "@/lib/wallet-modal";
import { robinhoodChain } from "@/lib/chains";
import {
  VELLICHOR_GOVERNANCE_ABI,
  VELLICHOR_GOVERNANCE_ADDRESS,
  MOCK_VELL_ABI,
  MOCK_VELL_ADDRESS,
  governanceConfigured,
  VOTE_TYPE,
  type OnChainProposal,
  type VoteTypeKey,
} from "@/lib/contracts";

const VELL_DECIMALS = 18;
const FAUCET_AMOUNT = 2_000_000n * 10n ** BigInt(VELL_DECIMALS);

function fmtVell(value: bigint) {
  const n = Number(formatUnits(value, VELL_DECIMALS));
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function FaucetCard() {
  const { address, isConnected, chainId } = useAccount();
  const { open } = useWalletModal();
  const wrongNetwork = isConnected && chainId !== robinhoodChain.id;

  const { data: balance, refetch } = useReadContract({
    address: MOCK_VELL_ADDRESS,
    abi: MOCK_VELL_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: governanceConfigured && !!address, refetchInterval: 10000 },
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) refetch();
  }, [isSuccess, refetch]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-panel p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="eyebrow">Test $VELL (mVELL)</p>
        <p className="mt-1 text-sm text-ink-dim">
          {isConnected
            ? `Your balance: ${balance !== undefined ? fmtVell(balance as bigint) : "…"} mVELL`
            : "Connect a wallet to see your balance and vote."}
        </p>
      </div>

      {!isConnected ? (
        <button
          onClick={open}
          className="inline-flex items-center justify-center rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-deep"
        >
          Connect Wallet
        </button>
      ) : wrongNetwork ? (
        <p className="text-sm text-wine">Switch to Robinhood Chain to continue.</p>
      ) : (
        <button
          onClick={() =>
            address &&
            MOCK_VELL_ADDRESS &&
            writeContract({
              address: MOCK_VELL_ADDRESS,
              abi: MOCK_VELL_ABI,
              functionName: "faucet",
              args: [address, FAUCET_AMOUNT],
            })
          }
          disabled={isPending || isConfirming}
          className="inline-flex items-center justify-center rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-amber disabled:opacity-60"
        >
          {isPending ? "Confirm in wallet…" : isConfirming ? "Minting…" : `Get ${fmtVell(FAUCET_AMOUNT)} test $VELL`}
        </button>
      )}

      {error && <p className="text-sm text-wine sm:max-w-xs">{error.message}</p>}
    </div>
  );
}

function VoteButtons({
  proposal,
  hasVoted,
  votingOpen,
}: {
  proposal: OnChainProposal;
  hasVoted: boolean;
  votingOpen: boolean;
}) {
  const { address, isConnected, chainId } = useAccount();
  const { open } = useWalletModal();
  const wrongNetwork = isConnected && chainId !== robinhoodChain.id;

  const { writeContract, data: hash, isPending, error, variables } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  function castVote(vote: VoteTypeKey) {
    if (!VELLICHOR_GOVERNANCE_ADDRESS) return;
    writeContract({
      address: VELLICHOR_GOVERNANCE_ADDRESS,
      abi: VELLICHOR_GOVERNANCE_ABI,
      functionName: "castVote",
      args: [proposal.proposalId, VOTE_TYPE[vote]],
    });
  }

  if (!isConnected) {
    return (
      <button
        onClick={open}
        className="mt-4 w-full rounded-full bg-amber px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-deep"
      >
        Connect Wallet to Vote
      </button>
    );
  }

  if (wrongNetwork) {
    return <p className="mt-4 text-center text-sm text-wine">Switch to Robinhood Chain to vote.</p>;
  }

  if (!votingOpen) {
    return <p className="mt-4 text-center text-sm text-ink-dim">Voting period has ended.</p>;
  }

  if (hasVoted || isSuccess) {
    return <p className="mt-4 text-center text-sm text-ink-dim">You already voted on this proposal.</p>;
  }

  const busy = isPending || isConfirming;
  const pendingVote = variables?.functionName === "castVote" ? (variables.args?.[1] as number | undefined) : undefined;

  return (
    <div className="mt-4">
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => castVote("For")}
          disabled={busy}
          className="rounded-full bg-amber px-3 py-2 text-sm font-semibold text-white hover:bg-amber-deep disabled:opacity-60"
        >
          {busy && pendingVote === VOTE_TYPE.For ? "…" : "For"}
        </button>
        <button
          onClick={() => castVote("Against")}
          disabled={busy}
          className="rounded-full border border-line px-3 py-2 text-sm font-semibold text-ink hover:border-wine hover:text-wine disabled:opacity-60"
        >
          {busy && pendingVote === VOTE_TYPE.Against ? "…" : "Against"}
        </button>
        <button
          onClick={() => castVote("Abstain")}
          disabled={busy}
          className="rounded-full border border-line px-3 py-2 text-sm font-semibold text-ink-dim hover:border-ink disabled:opacity-60"
        >
          {busy && pendingVote === VOTE_TYPE.Abstain ? "…" : "Abstain"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-wine">{error.message}</p>}
    </div>
  );
}

function ProposalCard({
  proposal,
  hasVoted,
  quorumBps,
  totalSupply,
}: {
  proposal: OnChainProposal;
  hasVoted: boolean;
  quorumBps: bigint;
  totalSupply: bigint;
}) {
  const totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
  const quorumPct = totalSupply === 0n ? 0 : (Number(totalVotes) / Number(totalSupply)) * 100;
  const quorumThresholdPct = Number(quorumBps) / 100;
  const reachedQuorum = totalSupply > 0n && (totalVotes * 10000n) / totalSupply >= quorumBps;
  const passed = reachedQuorum && proposal.forVotes > proposal.againstVotes;
  const votingOpen = BigInt(Math.floor(Date.now() / 1000)) <= proposal.endTime;

  const rows: { label: string; value: bigint; className: string }[] = [
    { label: "For", value: proposal.forVotes, className: "bg-amber" },
    { label: "Against", value: proposal.againstVotes, className: "bg-wine" },
    { label: "Abstain", value: proposal.abstainVotes, className: "bg-ink-dim" },
  ];

  return (
    <div className="rounded-2xl border border-line bg-panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="eyebrow">Proposal #{proposal.proposalId.toString()}</span>
        <div className="flex gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              votingOpen ? "bg-amber/10 text-amber-deep" : "bg-ink/10 text-ink-dim"
            }`}
          >
            {votingOpen ? "Voting open" : "Voting closed"}
          </span>
          {proposal.markedExecuted && (
            <span className="rounded-full bg-amber/10 px-2.5 py-1 text-xs font-medium text-amber-deep">
              Executed
            </span>
          )}
        </div>
      </div>

      <p className="mt-3 break-all font-data text-xs text-ink-dim">{proposal.metadataURI}</p>

      <div className="mt-5 flex flex-col gap-2">
        {rows.map((r) => {
          const pct = totalVotes === 0n ? 0 : (Number(r.value) / Number(totalVotes)) * 100;
          return (
            <div key={r.label}>
              <div className="flex justify-between text-xs text-ink-dim">
                <span>{r.label}</span>
                <span className="font-data">{fmtVell(r.value)} mVELL</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-panel-2">
                <div className={`h-full rounded-full ${r.className}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-line pt-3 text-xs text-ink-dim">
        <div className="flex justify-between">
          <span>Quorum ({quorumThresholdPct}% of supply)</span>
          <span className="font-data">
            {quorumPct.toFixed(2)}% {reachedQuorum ? "— reached" : "— not reached"}
          </span>
        </div>
        <p className="mt-1">
          {reachedQuorum
            ? passed
              ? "Passed (quorum + majority For) — advisory only, doesn't trigger any on-chain action."
              : "Quorum reached, but did not pass (Against ≥ For)."
            : "Informational — the team retains full discretion regardless of outcome."}
        </p>
      </div>

      <VoteButtons proposal={proposal} hasVoted={hasVoted} votingOpen={votingOpen} />
    </div>
  );
}

function CreateProposalForm({ onCreated }: { onCreated: () => void }) {
  const [uri, setUri] = useState("");
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      setUri("");
      onCreated();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  return (
    <div className="rounded-2xl border border-dashed border-line bg-panel-2 p-5">
      <p className="eyebrow">Team only — create proposal</p>
      <p className="mt-1 text-sm text-ink-dim">
        Connected wallet is the contract owner. Enter an IPFS metadataURI for the proposed acquisition.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={uri}
          onChange={(e) => setUri(e.target.value)}
          placeholder="ipfs://…"
          className="flex-1 rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink placeholder:text-ink-dim"
        />
        <button
          onClick={() =>
            VELLICHOR_GOVERNANCE_ADDRESS &&
            uri &&
            writeContract({
              address: VELLICHOR_GOVERNANCE_ADDRESS,
              abi: VELLICHOR_GOVERNANCE_ABI,
              functionName: "createProposal",
              args: [uri],
            })
          }
          disabled={isPending || isConfirming || !uri}
          className="rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-deep disabled:opacity-60"
        >
          {isPending ? "Confirm in wallet…" : isConfirming ? "Creating…" : "Create proposal"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-wine">{error.message}</p>}
    </div>
  );
}

export function GovernanceView() {
  const { address } = useAccount();

  const { data: nextProposalId, refetch: refetchCount } = useReadContract({
    address: VELLICHOR_GOVERNANCE_ADDRESS,
    abi: VELLICHOR_GOVERNANCE_ABI,
    functionName: "nextProposalId",
    query: { enabled: governanceConfigured, refetchInterval: 15000 },
  });

  const { data: owner } = useReadContract({
    address: VELLICHOR_GOVERNANCE_ADDRESS,
    abi: VELLICHOR_GOVERNANCE_ABI,
    functionName: "owner",
    query: { enabled: governanceConfigured },
  });

  const { data: quorumBps } = useReadContract({
    address: VELLICHOR_GOVERNANCE_ADDRESS,
    abi: VELLICHOR_GOVERNANCE_ABI,
    functionName: "quorumBps",
    query: { enabled: governanceConfigured },
  });

  const { data: totalSupply } = useReadContract({
    address: MOCK_VELL_ADDRESS,
    abi: MOCK_VELL_ABI,
    functionName: "totalSupply",
    query: { enabled: governanceConfigured },
  });

  const proposalIds = useMemo(() => {
    const count = nextProposalId ? Number(nextProposalId) - 1 : 0;
    return Array.from({ length: Math.max(0, count) }, (_, i) => BigInt(i + 1));
  }, [nextProposalId]);

  const { data: proposalsData, refetch: refetchProposals } = useReadContracts({
    contracts: proposalIds.map((id) => ({
      address: VELLICHOR_GOVERNANCE_ADDRESS,
      abi: VELLICHOR_GOVERNANCE_ABI,
      functionName: "proposals",
      args: [id],
    })),
    query: { enabled: governanceConfigured && proposalIds.length > 0 },
  });

  const { data: votedData } = useReadContracts({
    contracts: proposalIds.map((id) => ({
      address: VELLICHOR_GOVERNANCE_ADDRESS,
      abi: VELLICHOR_GOVERNANCE_ABI,
      functionName: "hasVoted",
      args: [id, address],
    })),
    query: { enabled: governanceConfigured && proposalIds.length > 0 && !!address },
  });

  const proposals: OnChainProposal[] = useMemo(() => {
    if (!proposalsData) return [];
    return proposalsData.map((r, i) => {
      const [metadataURI, startTime, endTime, forVotes, againstVotes, abstainVotes, markedExecuted] =
        (r.result as unknown[]) ?? ["", 0n, 0n, 0n, 0n, 0n, false];
      return {
        proposalId: proposalIds[i],
        metadataURI: metadataURI as string,
        startTime: startTime as bigint,
        endTime: endTime as bigint,
        forVotes: forVotes as bigint,
        againstVotes: againstVotes as bigint,
        abstainVotes: abstainVotes as bigint,
        markedExecuted: markedExecuted as boolean,
      };
    });
  }, [proposalsData, proposalIds]);

  const isOwner = !!address && !!owner && address.toLowerCase() === (owner as string).toLowerCase();

  if (!governanceConfigured) {
    return (
      <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
        Governance contract is not configured yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <FaucetCard />

      {isOwner && (
        <CreateProposalForm
          onCreated={() => {
            refetchCount();
            refetchProposals();
          }}
        />
      )}

      {proposals.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
          No proposals yet.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {proposals.map((p, i) => (
            <ProposalCard
              key={p.proposalId.toString()}
              proposal={p}
              hasVoted={(votedData?.[i]?.result as boolean | undefined) ?? false}
              quorumBps={(quorumBps as bigint) ?? 400n}
              totalSupply={(totalSupply as bigint) ?? 0n}
            />
          ))}
        </div>
      )}
    </div>
  );
}
