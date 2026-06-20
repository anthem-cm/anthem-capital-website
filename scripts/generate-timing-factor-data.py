#!/usr/bin/env python3
"""Build the browser data bundle for the timing-factor research page."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd


SOURCE_ROOT = Path("/Users/petrpinkhasov/Desktop/price research")
OUTPUT = Path(__file__).with_name("timing-factor-regime-shifts-data.js")


def rounded(values, digits=4):
    return [None if pd.isna(value) else round(float(value), digits) for value in values]


def main() -> None:
    source_root = Path(sys.argv[1]) if len(sys.argv) > 1 else SOURCE_ROOT
    output = Path(sys.argv[2]) if len(sys.argv) > 2 else OUTPUT

    data_dir = source_root / "data"
    predictors = pd.read_parquet(data_dir / "predictors.parquet")
    factors = pd.read_parquet(data_dir / "factor_returns.parquet")
    labels = pd.read_parquet(data_dir / "labels.parquet")
    events = pd.read_csv(data_dir / "rotation_events.csv", parse_dates=["date"])
    drivers = pd.read_csv(data_dir / "driver_importance.csv")

    dispersion = predictors["factor_mom_disp"].dropna()
    z_score = (dispersion - dispersion.mean()) / dispersion.std()
    events["date"] = events["date"] + pd.offsets.MonthEnd(0)
    events = events.sort_values(
        "rel_perf_swing_pct", key=lambda values: values.abs(), ascending=False
    ).reset_index(drop=True)

    cumulative = (1 + factors).cumprod()
    factor_performance = {
        "labels": [date.strftime("%Y-%m") for date in cumulative.index],
        "series": {
            column: rounded(cumulative[column], 4) for column in cumulative.columns
        },
    }

    offsets = list(range(-12, 1))
    event_paths = []
    for date in events["date"]:
        if date not in z_score.index:
            continue
        index = z_score.index.get_loc(date)
        if index - 12 < 0:
            continue
        event_paths.append([float(z_score.iloc[index + offset]) for offset in offsets])
    path_array = np.asarray(event_paths)

    case_studies = []
    for _, event in events.head(6).iterrows():
        date = event["date"]
        index = z_score.index.get_loc(date)
        case_studies.append(
            {
                "date": date.strftime("%Y-%m"),
                "gained": event["gained_leadership"],
                "lost": event["lost_leadership"],
                "swing": round(float(event["rel_perf_swing_pct"]), 1),
                "values": rounded(
                    [z_score.iloc[index + offset] for offset in offsets], 3
                ),
            }
        )

    quintile_frame = pd.DataFrame({"dispersion": dispersion}).join(
        labels["rotation_within_6m"]
    ).dropna()
    quintile_frame["quintile"] = pd.qcut(
        quintile_frame["dispersion"], 5, labels=["Q1", "Q2", "Q3", "Q4", "Q5"]
    )
    quintile_group = quintile_frame.groupby("quintile", observed=True)[
        "rotation_within_6m"
    ]
    quintile_rates = quintile_group.mean()
    quintile_counts = quintile_group.agg(["sum", "count"])
    base_rate = float(quintile_frame["rotation_within_6m"].mean())

    correlation_columns = [
        "factor_mom_disp",
        "factor_mom",
        "factor_val_spread",
        "vix",
    ]
    correlations = predictors[correlation_columns].dropna().corr()

    driver_columns = [
        "feature",
        "composite_score",
        "perm_importance",
        "shap_importance",
        "best_lead_months",
        "direction",
        "stability_topk_freq",
    ]
    driver_rows = []
    for row in drivers[driver_columns].to_dict("records"):
        driver_rows.append(
            {
                key: (
                    int(value)
                    if key in {"best_lead_months", "direction"}
                    else round(float(value), 4)
                    if key != "feature"
                    else value
                )
                for key, value in row.items()
            }
        )

    payload = {
        "meta": {
            "factorStart": factors.index.min().strftime("%Y-%m"),
            "factorEnd": factors.index.max().strftime("%Y-%m"),
            "factorMonths": int(len(factors)),
            "dispersionMonths": int(len(dispersion)),
            "rotationEvents": int(len(events)),
            "source": "Kenneth French data library plus calibrated low-volatility proxy",
        },
        "drivers": driver_rows,
        "factorPerformance": factor_performance,
        "dispersion": {
            "labels": [date.strftime("%Y-%m") for date in dispersion.index],
            "values": rounded(dispersion, 4),
            "events": [date.strftime("%Y-%m") for date in events["date"]],
            "peaks": [
                {"date": "1974-09", "label": "Stagflation"},
                {"date": "2001-02", "label": "Dot-com unwind"},
                {"date": "2021-03", "label": "Value comeback"},
            ],
        },
        "eventStudy": {
            "offsets": offsets,
            "paths": [rounded(path, 3) for path in event_paths],
            "mean": rounded(path_array.mean(axis=0), 3),
            "median": rounded(np.median(path_array, axis=0), 3),
        },
        "caseStudies": case_studies,
        "quintiles": {
            "labels": ["Q1", "Q2", "Q3", "Q4", "Q5"],
            "rates": rounded(quintile_rates, 4),
            "events": [int(value) for value in quintile_counts["sum"]],
            "months": [int(value) for value in quintile_counts["count"]],
            "baseRate": round(base_rate, 4),
        },
        "correlations": {
            "labels": correlation_columns,
            "matrix": [rounded(row, 3) for row in correlations.values],
        },
        "regimes": [
            {"label": "Low volatility", "sub": "VIX low", "ap": 0.393, "lift": 3.01},
            {"label": "High volatility", "sub": "VIX high", "ap": 0.259, "lift": 1.07},
        ],
    }

    output.write_text(
        "window.TIMING_FACTOR_REGIME_DATA = "
        + json.dumps(payload, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {output}")


if __name__ == "__main__":
    main()
