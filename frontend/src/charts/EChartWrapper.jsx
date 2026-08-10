import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '../contexts/ThemeContext';

const EChartWrapper = ({ option, style, height = '300px', onEvents }) => {
  const { theme } = useTheme();
  
  // Theme-specific colors
  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const titleColor = isDark ? '#f8fafc' : '#0f172a';
  const gridLineColor = isDark ? '#1e293b' : '#e2e8f0';
  const tooltipBg = isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)';
  const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const tooltipTextColor = isDark ? '#f8fafc' : '#0f172a';

  // Helper function to deep merge theme values into ECharts options
  const applyThemeToOption = (opt) => {
    if (!opt) return {};

    const copy = { ...opt };
    if (copy.xAxis) copy.xAxis = Array.isArray(copy.xAxis) ? copy.xAxis.map(x => ({...x})) : {...copy.xAxis};
    if (copy.yAxis) copy.yAxis = Array.isArray(copy.yAxis) ? copy.yAxis.map(y => ({...y})) : {...copy.yAxis};
    if (copy.series) copy.series = Array.isArray(copy.series) ? copy.series.map(s => ({...s})) : {...copy.series};

    // General text style
    copy.textStyle = {
      fontFamily: "'Outfit', 'Inter', sans-serif",
      color: textColor,
      ...copy.textStyle
    };

    // Title
    if (copy.title) {
      if (Array.isArray(copy.title)) {
        copy.title.forEach(t => {
          t.textStyle = { color: titleColor, ...t.textStyle };
        });
      } else {
        copy.title.textStyle = { color: titleColor, ...copy.title.textStyle };
      }
    }

    // Legend
    if (copy.legend) {
      copy.legend.textStyle = { color: textColor, ...copy.legend.textStyle };
    }

    // Tooltip
    copy.tooltip = {
      trigger: 'axis',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: { color: tooltipTextColor },
      ...copy.tooltip
    };

    // X Axis
    if (copy.xAxis) {
      const adjustAxis = (axis) => {
        axis.axisLabel = { color: textColor, ...axis.axisLabel };
        axis.axisLine = { 
          lineStyle: { color: gridLineColor }, 
          ...axis.axisLine 
        };
        if (axis.splitLine) {
          axis.splitLine.lineStyle = { color: gridLineColor, ...axis.splitLine.lineStyle };
        }
      };

      if (Array.isArray(copy.xAxis)) {
        copy.xAxis.forEach(adjustAxis);
      } else {
        adjustAxis(copy.xAxis);
      }
    }

    // Y Axis
    if (copy.yAxis) {
      const adjustAxis = (axis) => {
        axis.axisLabel = { color: textColor, ...axis.axisLabel };
        axis.axisLine = { 
          lineStyle: { color: gridLineColor }, 
          ...axis.axisLine 
        };
        if (axis.splitLine) {
          axis.splitLine.lineStyle = { color: gridLineColor, ...axis.splitLine.lineStyle };
        }
      };

      if (Array.isArray(copy.yAxis)) {
        copy.yAxis.forEach(adjustAxis);
      } else {
        adjustAxis(copy.yAxis);
      }
    }

    // Series Center Label Text Styling
    if (copy.series) {
      const adjustSeries = (s) => {
        if (s.label && s.label.show && s.label.position === 'center') {
          s.label.color = titleColor;
        }
      };
      if (Array.isArray(copy.series)) {
        copy.series.forEach(adjustSeries);
      } else {
        adjustSeries(copy.series);
      }
    }

    return copy;

  };

  const themedOption = applyThemeToOption(option);

  return (
    <ReactECharts
      option={themedOption}
      style={{ height, width: '100%', ...style }}
      opts={{ renderer: 'canvas' }}
      notMerge={true}
      lazyUpdate={true}
      onEvents={onEvents}
    />
  );
};

export default EChartWrapper;
