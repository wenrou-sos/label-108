import pandas as pd
import numpy as np
from scipy import stats


class SeasonalAnalyzer:
    def __init__(self, current_df, historical_data=None):
        self.current_df = current_df.copy()
        self.current_df["date"] = pd.to_datetime(self.current_df["date"])
        self.historical_data = {}
        if historical_data:
            for year, df in historical_data.items():
                df_copy = df.copy()
                df_copy["date"] = pd.to_datetime(df_copy["date"])
                self.historical_data[year] = df_copy

        self.all_data = self._combine_data()

    def _combine_data(self):
        frames = [self.current_df]
        for df in self.historical_data.values():
            frames.append(df)
        combined = pd.concat(frames, ignore_index=True)
        combined["year"] = combined["date"].dt.year
        combined["month"] = combined["date"].dt.month
        combined["week"] = combined["date"].dt.isocalendar().week
        combined["dayOfYear"] = combined["date"].dt.dayofyear
        return combined

    def get_monthly_avg_price(self, fruit_id=None, market_id=None):
        df = self.all_data.copy()
        if fruit_id:
            df = df[df["fruitId"] == fruit_id]
        if market_id:
            df = df[df["marketId"] == market_id]

        result = df.groupby(["year", "month"]).agg(
            avgPrice=("avgPrice", "mean"),
            minPrice=("lowPrice", "min"),
            maxPrice=("highPrice", "max"),
            avgVolume=("volume", "mean"),
            recordCount=("date", "count"),
        ).reset_index()

        for col in ["avgPrice", "minPrice", "maxPrice", "avgVolume"]:
            result[col] = result[col].round(2)

        return result.sort_values(["year", "month"]).reset_index(drop=True)

    def get_seasonal_pattern(self, fruit_id, market_id=None):
        df = self.all_data.copy()
        df = df[df["fruitId"] == fruit_id]
        if market_id:
            df = df[df["marketId"] == market_id]

        monthly = df.groupby("month").agg(
            avgPrice=("avgPrice", "mean"),
            minPrice=("lowPrice", "min"),
            maxPrice=("highPrice", "max"),
            priceStd=("avgPrice", "std"),
            avgVolume=("volume", "mean"),
        ).reset_index()

        for col in ["avgPrice", "minPrice", "maxPrice", "priceStd", "avgVolume"]:
            monthly[col] = monthly[col].round(2)

        yearly_avg = monthly["avgPrice"].mean()
        monthly["seasonalIndex"] = (monthly["avgPrice"] / yearly_avg).round(4)
        monthly["deviationPct"] = ((monthly["avgPrice"] - yearly_avg) / yearly_avg * 100).round(2)

        peak_month = monthly.loc[monthly["avgPrice"].idxmax(), "month"]
        trough_month = monthly.loc[monthly["avgPrice"].idxmin(), "month"]

        return {
            "monthlyPattern": monthly,
            "yearlyAvg": round(yearly_avg, 2),
            "peakMonth": int(peak_month),
            "troughMonth": int(trough_month),
            "peakPrice": round(monthly["avgPrice"].max(), 2),
            "troughPrice": round(monthly["avgPrice"].min(), 2),
            "seasonalAmplitudePct": round(((monthly["avgPrice"].max() - monthly["avgPrice"].min()) / yearly_avg * 100), 2),
        }

    def get_historical_percentile(self, fruit_id, market_id=None, current_price=None, date=None):
        df = self.all_data.copy()
        df = df[df["fruitId"] == fruit_id]
        if market_id:
            df = df[df["marketId"] == market_id]

        if date:
            target_date = pd.to_datetime(date)
            target_month = target_date.month
            target_day = target_date.day
            df = df[
                (df["date"].dt.month == target_month) &
                (df["date"].dt.day == target_day)
            ]

        prices = df["avgPrice"].dropna().values
        if len(prices) == 0:
            return None

        if current_price is None:
            current_price = np.percentile(prices, 50)

        percentile = stats.percentileofscore(prices, current_price, kind="mean")

        return {
            "currentPrice": round(current_price, 2),
            "percentile": round(percentile, 2),
            "min": round(float(np.min(prices)), 2),
            "p5": round(float(np.percentile(prices, 5)), 2),
            "p25": round(float(np.percentile(prices, 25)), 2),
            "median": round(float(np.median(prices)), 2),
            "p75": round(float(np.percentile(prices, 75)), 2),
            "p95": round(float(np.percentile(prices, 95)), 2),
            "max": round(float(np.max(prices)), 2),
            "sampleSize": len(prices),
            "mean": round(float(np.mean(prices)), 2),
            "std": round(float(np.std(prices)), 2),
        }

    def get_yoy_comparison(self, fruit_id=None, market_id=None):
        df = self.all_data.copy()
        if fruit_id:
            df = df[df["fruitId"] == fruit_id]
        if market_id:
            df = df[df["marketId"] == market_id]

        yearly = df.groupby("year").agg(
            avgPrice=("avgPrice", "mean"),
            minPrice=("lowPrice", "min"),
            maxPrice=("highPrice", "max"),
            avgVolume=("volume", "mean"),
            totalVolume=("volume", "sum"),
            recordCount=("date", "count"),
        ).reset_index().sort_values("year")

        for col in ["avgPrice", "minPrice", "maxPrice", "avgVolume"]:
            yearly[col] = yearly[col].round(2)

        yearly["yoyPriceChangePct"] = yearly["avgPrice"].pct_change() * 100
        yearly["yoyVolumeChangePct"] = yearly["totalVolume"].pct_change() * 100
        yearly["yoyPriceChangePct"] = yearly["yoyPriceChangePct"].round(2)
        yearly["yoyVolumeChangePct"] = yearly["yoyVolumeChangePct"].round(2)

        return yearly

    def get_weekday_pattern(self, fruit_id=None, market_id=None):
        df = self.all_data.copy()
        if fruit_id:
            df = df[df["fruitId"] == fruit_id]
        if market_id:
            df = df[df["marketId"] == market_id]

        df["weekday"] = df["date"].dt.weekday
        weekday_names = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]

        result = df.groupby("weekday").agg(
            avgPrice=("avgPrice", "mean"),
            avgVolume=("volume", "mean"),
            recordCount=("date", "count"),
        ).reset_index()

        result["weekdayName"] = result["weekday"].map(dict(enumerate(weekday_names)))

        for col in ["avgPrice", "avgVolume"]:
            result[col] = result[col].round(2)

        mean_price = result["avgPrice"].mean()
        result["priceDeviationPct"] = ((result["avgPrice"] - mean_price) / mean_price * 100).round(2)

        return result[["weekday", "weekdayName", "avgPrice", "avgVolume", "priceDeviationPct", "recordCount"]]
