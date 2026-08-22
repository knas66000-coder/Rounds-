#!/usr/bin/env python3
"""Trim quiet edges and safely normalize an authorised local clone reference clip."""

from pathlib import Path
import argparse

import numpy as np
import soundfile as sf


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare a clean private voice-clone reference WAV.")
    parser.add_argument("--input", required=True, help="Authorised local reference WAV.")
    parser.add_argument("--output", required=True, help="Prepared local reference WAV.")
    parser.add_argument("--threshold", type=float, default=0.012, help="Absolute amplitude threshold used to trim quiet edges.")
    parser.add_argument("--target-peak", type=float, default=0.75, help="Safe normalised peak amplitude, between 0.1 and 0.95.")
    args = parser.parse_args()

    if not 0.1 <= args.target_peak <= 0.95:
        raise ValueError("--target-peak must be between 0.1 and 0.95.")

    source = Path(args.input)
    destination = Path(args.output)
    samples, sample_rate = sf.read(source, dtype="float32")
    if samples.ndim > 1:
        samples = samples[:, 0]
    if len(samples) == 0:
        raise ValueError("The authorised reference clip contains no samples.")

    active = np.flatnonzero(np.abs(samples) >= args.threshold)
    if len(active) == 0:
        raise ValueError("The authorised reference clip is too quiet to prepare.")

    padding = int(sample_rate * 0.08)
    start = max(0, int(active[0]) - padding)
    end = min(len(samples), int(active[-1]) + padding + 1)
    trimmed = samples[start:end]
    peak = float(np.abs(trimmed).max())
    if peak <= 0:
        raise ValueError("The authorised reference clip has no usable peak amplitude.")

    prepared = np.clip(trimmed * (args.target_peak / peak), -0.95, 0.95)
    destination.parent.mkdir(parents=True, exist_ok=True)
    sf.write(destination, prepared, sample_rate, subtype="PCM_16")
    print(f"Prepared local reference: {destination}")
    print(f"Trimmed {start / sample_rate:.3f}s from the start and {(len(samples) - end) / sample_rate:.3f}s from the end.")
    print(f"Peak: {peak:.3f} -> {float(np.abs(prepared).max()):.3f}")
    print(f"Duration: {len(samples) / sample_rate:.3f}s -> {len(prepared) / sample_rate:.3f}s")


if __name__ == "__main__":
    main()
