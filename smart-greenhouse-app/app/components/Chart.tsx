import React from 'react';
import { View, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const Chart = () => {
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 50],
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View>
      <Text>Greenhouse Data Trends</Text>
      <LineChart
        data={data}
        width={320}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#ffa726',
          },
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

export default Chart;