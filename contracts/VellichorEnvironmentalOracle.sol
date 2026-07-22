// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title VellichorEnvironmentalOracle
/// @notice Manually-recorded environmental readings (temperature, humidity) for a
///         vaulted bottle's storage conditions, over time.
/// @dev Same manual/centralized pattern as VellichorVaultUnitOracle — the team records
///      each reading, sourced from an actual measurement at the storage facility.
///      There is no IoT sensor or automated feed behind this; it is a stopgap for
///      early-stage use, not a permanent design, and carries the same
///      centralization/manipulation caveats as any manually-entered oracle.
///
///      Readings accumulate per bottleId (a history, not a single current value) so a
///      bottle can get a baseline reading at intake time (before it's even minted into
///      VellichorVault) and further readings at each post-mint check-in. bottleId
///      follows the same staged/draft ID coordination as VellichorAuthenticityRegistry
///      — this contract has no dependency on VellichorVault and doesn't validate that
///      a bottleId is real.
contract VellichorEnvironmentalOracle is Ownable {
    struct Reading {
        int16 temperatureCelsiusX10; // e.g. 155 = 15.5°C, scaled by 10 to avoid fixed-point math
        uint8 humidityPercent; // 0-100
        string notes;
        uint256 timestamp;
    }

    mapping(uint256 => Reading[]) private _readings;

    event ReadingRecorded(
        uint256 indexed bottleId,
        int16 temperatureCelsiusX10,
        uint8 humidityPercent,
        uint256 timestamp
    );

    constructor(address initialOwner) Ownable(initialOwner) {}

    /// @notice Record a new environmental reading for a bottle. Should be sourced from
    ///         an actual measurement taken at the storage facility — not an estimate.
    function recordReading(
        uint256 bottleId,
        int16 temperatureCelsiusX10,
        uint8 humidityPercent,
        string calldata notes
    ) external onlyOwner {
        require(humidityPercent <= 100, "humidity must be 0-100");
        _readings[bottleId].push(
            Reading({
                temperatureCelsiusX10: temperatureCelsiusX10,
                humidityPercent: humidityPercent,
                notes: notes,
                timestamp: block.timestamp
            })
        );
        emit ReadingRecorded(bottleId, temperatureCelsiusX10, humidityPercent, block.timestamp);
    }

    function readingCount(uint256 bottleId) external view returns (uint256) {
        return _readings[bottleId].length;
    }

    function getReading(uint256 bottleId, uint256 index) external view returns (Reading memory) {
        return _readings[bottleId][index];
    }

    function latestReading(uint256 bottleId) external view returns (Reading memory) {
        uint256 len = _readings[bottleId].length;
        require(len > 0, "no readings yet");
        return _readings[bottleId][len - 1];
    }
}
