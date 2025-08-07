import { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFonts, Cairo_400Regular, Cairo_700Bold } from '@expo-google-fonts/cairo';

const CustomInput = ({ containerStyle, placeholder, onChangeText, error, ...props }) => {
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_700Bold,
  });

  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState('');
  const [showPassword, setShowPassword] = useState(props.secureTextEntry);
  const labelPosition = useRef(new Animated.Value(text ? 1 : 0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    animatedLabel(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!text) {
      animatedLabel(0);
    }
  };

  const handleTextChange = (text) => {
    setText(text);
    if (onChangeText) {
      onChangeText(text);
    }
    if (text) {
      animatedLabel(1);
    } else {
      animatedLabel(isFocused ? 1 : 0);
    }
  };

  const animatedLabel = (toValue) => {
    Animated.timing(labelPosition, {
      toValue: toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const labelStyle = {
    left: 10,
    top: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [17, 0],
    }),
    fontSize: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 14],
    }),
    color: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: ['white', 'white'],
    }),
  };

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <View style={containerStyle}>
      <View style={[styles.innerContainer, error && { borderColor: 'red' }]}>
        <Animated.Text style={[styles.label, labelStyle]}>{placeholder}</Animated.Text>
        <View style={styles.inputContainer}>
          <TextInput
          {...props}
          style={[styles.input, { color: 'white' }]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleTextChange}
          value={text}
          textAlignVertical="center"
          secureTextEntry={showPassword}
          textContentType={props.secureTextEntry ? 'password' : 'username'}
          autoCompleteType={props.secureTextEntry ? 'password' : 'username'}
          autoCorrect={false}
          autoCapitalize="none"
        />
          {props.secureTextEntry && !!text && (
            <View>
              <TouchableOpacity
                style={{ width: 24 }}
                onPress={() => setShowPassword(!showPassword)}
              >
                {!showPassword ? (
                  <Icon name="eye-outline" color={'white'} size={24} />
                ) : (
                  <Icon name="eye-off-outline" color={'#AA336A'} size={24} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  innerContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    height: 60,
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    color: 'white',
    fontFamily: 'Cairo',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: 50,
    marginTop: 10,
    paddingLeft: 10,
    color: 'white', 
    fontFamily: 'Cairo',
    fontWeight: 'bold',
  },
  errorText: {
    marginTop: 5,
    fontSize: 14,
    color: 'red',
    fontFamily: 'Cairo',
  },
});

export default CustomInput;


