import pandas as pd
import numpy as np
from scipy import stats


class AnomalyDetector:
    def __init__(self, daily_prices_df):
        self.df = daily_prices_df.copy()
        self.df["date"] = pd.to_datetime(self.df["date"])

    def detect_by_3sigma(self, window=30):
        df_sorted = self.df.sort_values(["fruitId", "marketId", "date"]).reset_index(drop=True)

        df_sorted["rollingMean"] = df_sorted.groupby(["fruitId", "marketId"])["avgPrice"].transform(
            lambda x: x.rolling(window=window, min_periods=5).mean()
        )
        df_sorted["rollingStd"] = df_sorted.groupby(["fruitId", "marketId"])["avgPrice"].transform(
            lambda x: x.rolling(window=window, min_periods=5).std()
        )
        df_sorted["upperBound"] = df_sorted["rollingMean"] + 3 * df_sorted["rollingStd"]
        df_sorted["lowerBound"] = df_sorted["rollingMean"] - 3 * df_sorted["rollingStd"]
        df_sorted["is3SigmaAnomaly"] = (
            (df_sorted["avgPrice"] > df_sorted["upperBound"]) |
            (df_sorted["avgPrice"] < df_sorted["lowerBound"])
        ).fillna(False)
        with np.errstate(divide="ignore", invalid="ignore"):
            df_sorted["zScore"] = np.where(
                df_sorted["rollingStd"] > 0,
                ((df_sorted["avgPrice"] - df_sorted["rollingMean"]) / df_sorted["rollingStd"]).round(4),
                0.0,
            )
        return df_sorted

    def detect_by_price_change(self, window=1, threshold_pct=20):
        df_sorted = self.df.sort_values(["fruitId", "marketId", "date"]).reset_index(drop=True)

        df_sorted["prevPrice"] = df_sorted.groupby(["fruitId", "marketId"])["avgPrice"].shift(window)
        df_sorted["priceChangePct"] = np.where(
            df_sorted["prevPrice"] > 0,
            ((df_sorted["avgPrice"] - df_sorted["prevPrice"]) / df_sorted["prevPrice"] * 100).round(2),
            np.nan,
        )
        df_sorted["isPriceAnomaly"] = (df_sorted["priceChangePct"].abs() >= threshold_pct).fillna(False)
        return df_sorted

    def detect_volume_anomaly(self, window=30, z_threshold=3):
        df_sorted = self.df.sort_values(["fruitId", "marketId", "date"]).reset_index(drop=True)

        df_sorted["volRollingMean"] = df_sorted.groupby(["fruitId", "marketId"])["volume"].transform(
            lambda x: x.rolling(window=window, min_periods=5).mean()
        )
        df_sorted["volRollingStd"] = df_sorted.groupby(["fruitId", "marketId"])["volume"].transform(
            lambda x: x.rolling(window=window, min_periods=5).std()
        )
        with np.errstate(divide="ignore", invalid="ignore"):
            df_sorted["volZScore"] = np.where(
                df_sorted["volRollingStd"] > 0,
                ((df_sorted["volume"] - df_sorted["volRollingMean"]) / df_sorted["volRollingStd"]).round(4),
                0.0,
            )
        df_sorted["isVolumeAnomaly"] = (df_sorted["volZScore"].abs() >= z_threshold).fillna(False)
        return df_sorted

    def detect_comprehensive(self, sigma_window=30, change_window=1, change_threshold=20, volume_window=30):
        result = self.detect_by_3sigma(window=sigma_window)
        price_change_df = self.detect_by_price_change(window=change_window, threshold_pct=change_threshold)
        result = result.merge(
            price_change_df[["date", "fruitId", "marketId", "prevPrice", "priceChangePct", "isPriceAnomaly"]],
            on=["date", "fruitId", "marketId"],
            how="left",
        )
        volume_df = self.detect_volume_anomaly(window=volume_window)
        result = result.merge(
            volume_df[["date", "fruitId", "marketId", "volRollingMean", "volRollingStd", "volZScore", "isVolumeAnomaly"]],
            on=["date", "fruitId", "marketId"],
            how="left",
        )
        result["isAnomaly"] = (
            result["is3SigmaAnomaly"].fillna(False) |
            result["isPriceAnomaly"].fillna(False) |
            result["isVolumeAnomaly"].fillna(False)
        )
        return result

    def get_anomaly_list(self, comprehensive_df=None):
        if comprehensive_df is None:
            comprehensive_df = self.detect_comprehensive()

        anomalies = comprehensive_df[comprehensive_df["isAnomaly"]].copy()
        anomaly_types = []
        for _, row in anomalies.iterrows():
            types = []
            if row.get("is3SigmaAnomaly", False):
                if row.get("zScore", 0) > 0:
                    types.append("price_spike")
                else:
                    types.append("price_drop")
            if row.get("isPriceAnomaly", False):
                if row.get("priceChangePct", 0) > 0:
                    types.append("price_spike")
                else:
                    types.append("price_drop")
            if row.get("isVolumeAnomaly", False):
                if row.get("volZScore", 0) > 0:
                    types.append("volume_surge")
                else:
                    types.append("volume_shortage")
            anomaly_types.append(",".join(list(set(types))))

        anomalies["anomalyTypes"] = anomaly_types
        anomalies["date"] = pd.to_datetime(anomalies["date"]).dt.strftime("%Y-%m-%d")
        return anomalies[
            ["date", "fruitId", "marketId", "avgPrice", "priceChangePct",
             "zScore", "volZScore", "anomalyTypes", "upperBound", "lowerBound"]
        ].reset_index(drop=True)

    def get_anomaly_summary(self):
        anomalies = self.get_anomaly_list()
        if len(anomalies) == 0:
            return {"totalAnomalies": 0, "byFruit": {}, "byMarket": {}, "byType": {}}
        summary = {
            "totalAnomalies": len(anomalies),
            "byFruit": anomalies.groupby("fruitId").size().to_dict(),
            "byMarket": anomalies.groupby("marketId").size().to_dict(),
            "byType": anomalies["anomalyTypes"].str.split(",").explode().value_counts().to_dict(),
        }
        return summary
