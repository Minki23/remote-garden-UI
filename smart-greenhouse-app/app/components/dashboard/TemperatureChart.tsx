import React from 'react';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const TemperatureChart = ({ chartWidth, tempChartData }: { chartWidth: number, tempChartData: any[] }) => {
  return (
    <LineChart
      data={{
        labels: tempChartData.map((item) => item.timestamp),
        datasets: [
          {
            data: tempChartData.map(item => item.value),
          },
        ],
      }}
      width={chartWidth}
      height={220}
      chartConfig={{
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#f9f9f9',
        backgroundGradientTo: '#f9f9f9',
        color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
          borderRadius: 16,
        },
        propsForDots: {
          r: '4',
          strokeWidth: '1',
          stroke: '#007BFF',
        },
        propsForLabels: {
          fontSize: 12,
          fontWeight: 'bold',
        },
      }}
      bezier
      style={{
        marginVertical: 8,
        borderRadius: 16,
      }}
    />
  );
};

export default TemperatureChart;
