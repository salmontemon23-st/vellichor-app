// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title VellichorGovernance
/// @notice Advisory governance for $VELL holders to signal support/opposition for
///         proposed bottle acquisitions. This is intentionally NOT a hard-lock —
///         it does not control VellichorVault.listBottle() in any way. The team
///         retains full discretion to acquire and vault bottles regardless of a
///         proposal's outcome here; this contract exists purely to give the
///         community a transparent, on-chain record of sentiment before the team
///         acts, not to bind or automate that action.
///
/// @dev IMPORTANT LIMITATION: $VELL is minted via Virtuals' AgentTokenV4 template,
///      which is not guaranteed to implement checkpointed balances (OpenZeppelin's
///      ERC20Votes pattern). Voting weight here is therefore read via balanceOf()
///      at the moment each vote is cast, NOT a historical snapshot. This means a
///      holder could in principle vote, transfer their $VELL to another wallet,
///      and vote again from that wallet — a known, accepted limitation of the
///      "hold" model chosen for $VELL (see vellichor-vell-token.md). Do not use
///      this contract for anything higher-stakes than advisory bottle-acquisition
///      sentiment until $VELL's token contract is verified to support checkpoints,
///      or a snapshot mechanism is added.
contract VellichorGovernance is Ownable {

    enum VoteType { Against, For, Abstain }

    struct Proposal {
        string metadataURI;      // IPFS link to full proposal detail (bottle photos, provenance, price)
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool markedExecuted;     // purely a record-keeping flag, set manually by the team — does not trigger any on-chain action
    }

    /// @notice The $VELL token used to weight votes (real-time balance, not a snapshot — see contract-level note)
    IERC20 public immutable vell;

    /// @notice Minimum participation required, in basis points of $VELL total supply, for a proposal to be considered to have reached quorum
    uint256 public quorumBps = 400; // 4%

    /// @notice Standard voting duration for new proposals
    uint256 public votingPeriod = 5 days;

    uint256 public nextProposalId = 1;

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed proposalId, string metadataURI, uint256 startTime, uint256 endTime);
    event VoteCast(uint256 indexed proposalId, address indexed voter, VoteType voteType, uint256 weight);
    event ProposalMarkedExecuted(uint256 indexed proposalId, bool executed);

    constructor(address _vell) Ownable(msg.sender) {
        require(_vell != address(0), "zero address");
        vell = IERC20(_vell);
    }

    /// @notice Create a new acquisition proposal for the community to weigh in on.
    /// @dev Restricted to the team (owner) — holders vote on proposals, they don't
    ///      submit their own. Curation remains the team's responsibility per the
    ///      whitepaper's curation standard; this is a sentiment check, not an
    ///      open submission process.
    function createProposal(string calldata metadataURI_) external onlyOwner returns (uint256 proposalId) {
        proposalId = nextProposalId++;
        proposals[proposalId] = Proposal({
            metadataURI: metadataURI_,
            startTime: block.timestamp,
            endTime: block.timestamp + votingPeriod,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            markedExecuted: false
        });

        emit ProposalCreated(proposalId, metadataURI_, block.timestamp, block.timestamp + votingPeriod);
    }

    /// @notice Cast a vote weighted by the caller's current $VELL balance.
    /// @dev Weight is read at call time (see contract-level limitation note above).
    function castVote(uint256 proposalId, VoteType voteType) external {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp >= p.startTime && block.timestamp <= p.endTime, "voting closed");
        require(!hasVoted[proposalId][msg.sender], "already voted");

        uint256 weight = vell.balanceOf(msg.sender);
        require(weight > 0, "no $VELL balance");

        hasVoted[proposalId][msg.sender] = true;

        if (voteType == VoteType.For) {
            p.forVotes += weight;
        } else if (voteType == VoteType.Against) {
            p.againstVotes += weight;
        } else {
            p.abstainVotes += weight;
        }

        emit VoteCast(proposalId, msg.sender, voteType, weight);
    }

    /// @notice Check whether a proposal has reached quorum, based on total votes cast
    ///         (For + Against + Abstain) against $VELL's current total supply.
    function hasReachedQuorum(uint256 proposalId) public view returns (bool) {
        Proposal storage p = proposals[proposalId];
        uint256 totalVotes = p.forVotes + p.againstVotes + p.abstainVotes;
        uint256 totalSupply = vell.totalSupply();
        if (totalSupply == 0) return false;
        return (totalVotes * 10000) / totalSupply >= quorumBps;
    }

    /// @notice Whether a proposal passed: quorum reached AND more For than Against.
    ///         This is informational only — nothing in this contract or in
    ///         VellichorVault.sol checks or enforces this result.
    function didProposalPass(uint256 proposalId) external view returns (bool) {
        Proposal storage p = proposals[proposalId];
        return hasReachedQuorum(proposalId) && p.forVotes > p.againstVotes;
    }

    /// @notice Team marks a proposal as executed (i.e. the bottle was actually
    ///         acquired and vaulted) purely for record-keeping. This does not
    ///         call VellichorVault.listBottle() or anything else — it's a manual,
    ///         separate action the team takes after actually completing the
    ///         acquisition off-chain and on VellichorVault.
    function markExecuted(uint256 proposalId, bool executed) external onlyOwner {
        proposals[proposalId].markedExecuted = executed;
        emit ProposalMarkedExecuted(proposalId, executed);
    }

    function setQuorumBps(uint256 _quorumBps) external onlyOwner {
        require(_quorumBps <= 10000, "invalid bps");
        quorumBps = _quorumBps;
    }

    function setVotingPeriod(uint256 _votingPeriod) external onlyOwner {
        require(_votingPeriod >= 1 days && _votingPeriod <= 30 days, "unreasonable period");
        votingPeriod = _votingPeriod;
    }
}
