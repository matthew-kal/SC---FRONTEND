import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const QuoteCard = ({ text }) => {
  const { width } = Dimensions.get("window");
  const defaultQuote = "Recovery is not a race. You don't have to feel guilty if it takes longer than you thought it would.";

  return (
    <View style={[styles.quote, { width: width >= 450 ? '60%' : '90%' }]}>
      <Text style={styles.quoteText}>{text || defaultQuote}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
    quote: { borderRadius: 10, borderWidth: 1, borderColor: '#AA336A', padding: 10, backgroundColor: 'white', alignItems: 'center', alignSelf: 'center' },
    quoteText: { fontFamily: 'Cairo', fontSize: 18, textAlign: 'center' },
});

export default QuoteCard;