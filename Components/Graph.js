import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel } from 'victory-native'; 

const Graph = ({ weeklyData, dailyData }) => {
  return (
    <View style={styles.container}>
      <View style={styles.sup}>
        <View style={styles.supInner}>
          <Text style={styles.supText}> 
            <Text style={styles.supBig}>{dailyData?.[0] || 0}</Text>   Weekly
          </Text>
          <Text style={styles.supText}> 
            <Text style={styles.supBig}>{dailyData?.[1] || 0}</Text>   All Time
          </Text>
        </View>

          <View style={styles.chartContainer}>
            <VictoryChart domainPadding={{ x: 20 }} height={200} width={300}>
              <VictoryAxis
                style={{
                  axis: { stroke: "transparent" },
                  tickLabels: { fontSize: 12, padding: 5, fontFamily: 'Cairo' }
                }}
              />
              <VictoryAxis
                style={{
                  axis: { stroke: "transparent" },
                  ticks: { stroke: "transparent" },
                  tickLabels: { fontSize: 12, fontWeight: 'bold', padding: 5, fontFamily: 'Cairo', fill: '#AA336A' }
                }}
              />
              <VictoryBar
                style={{
                  data: {
                    fill: "#AA336A",
                    width: 20,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                  }
                }}
                labels={({ datum }) => datum.y}
                labelComponent={<VictoryLabel dy={-10} fontFamily='Cairo' />}
                data={weeklyData || []}
              />
            </VictoryChart>
          </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200, 
    width: 340,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sup: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center', 
    width: '100%',
  },
  supInner: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 13,
  },
  supText: {
    fontSize: 17,
    fontFamily: 'Cairo',
    textAlign: 'center',
  },
  supBig: {
    fontSize: 45,
    fontWeight: '300',
    color: "#AA336A",
    fontWeight: 'bold',
  },
  chartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    flex: 1,
  },
});

export default Graph;