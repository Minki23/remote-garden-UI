import React from 'react';
import { BarChart } from 'react-native-chart-kit';
import { Platform } from 'react-native';

const HumidityChart = ({ chartWidth, humidityChartData }: { chartWidth: number, humidityChartData: any[] }) => {
  // Provide fallback data when chart is empty or has invalid data
  const hasValidData = humidityChartData && humidityChartData.length > 0 && humidityChartData.some(item => !isNaN(item.value));
  
  const chartData = hasValidData ? humidityChartData : [
    { timestamp: 'No data', value: 0 }
  ];

  return (
    <BarChart
      data={{
        labels: chartData.map(item => item.timestamp || 'No data'),
        datasets: [
          {
            data: chartData.map(item => isNaN(item.value) ? 0 : item.value),
          },
        ],
      }}
      width={chartWidth}
      height={220}
      yAxisLabel=""
      yAxisSuffix="%"
      chartConfig={{
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#f9f9f9',
        backgroundGradientTo: '#f9f9f9',
        color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
        strokeWidth: 2,
        barPercentage: Platform.OS === 'android' ? 0.2 : 2,
        decimalPlaces: 0,
        propsForLabels: {
          fontSize: 12,
          fontWeight: 'bold',
        },
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
          borderRadius: 16,
        },
        propsForDots: {
          r: '6',
          strokeWidth: '2',
          stroke: '#ffa726',
        }
      }}
      style={{
        marginVertical: 1,
        borderRadius: 8,
        padding: 0,
      }}
    />
  );
};

export default HumidityChart;
